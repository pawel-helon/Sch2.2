import { Request, Response } from "express";
import { pool } from "../../index";
import { DATE_REGEX, UUID_REGEX } from "../../lib/constants";
import { SlotsRecurringDate } from "../../lib/types";

const createResponse = (res: Response, message: string, data: SlotsRecurringDate | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const disableRecurringDay = async (req: Request, res: Response) => {
  const { employeeId, day } = req.body as { employeeId: string, day: string };
  
  if (!employeeId || !day) {
    return createResponse(res, "All fields are required: employeeId, day.");
  }
  
  if (!UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Invalid employeeId format. Expected UUID.");
  }
  
  if (!DATE_REGEX.test(day)) {
    return createResponse(res, "Invalid day format. Expected YYYY-MM-DD.");
  }
  
  if (new Date().getTime() > new Date(new Date(day).setHours(23,59,59,999)).getTime()) {
    return createResponse(res, "Invalid date. Expected non-past date.");
  }

  try {
    await pool.query("BEGIN");

    const deletingSlotsRecurringDatesQueryValue = `
      WITH recurring_dates AS (
        WITH recurring_dates_year AS (
          SELECT EXTRACT (YEAR FROM $2::date) as year
        )
        SELECT generate_series(
          $2::date,
          (year || '-12-31')::date,
          INTERVAL '7 days'
        )::date AS date
        FROM recurring_dates_year
      ),
      rows_to_delete AS (
        SELECT "id"
        FROM "SlotsRecurringDates"
        WHERE "employeeId" = $1::uuid
          AND "date" IN (
            SELECT recurring_dates.date FROM recurring_dates
          )
        ORDER BY "date"
      )
      DELETE FROM "SlotsRecurringDates"
      WHERE "id" IN (SELECT "id" FROM rows_to_delete)
      RETURNING
        "id",
        "employeeId",
        "date"::text
    `;

    const deletingSlotsRecurringDates = await pool.query(deletingSlotsRecurringDatesQueryValue, [
      employeeId,
      day
    ])

    if (!deletingSlotsRecurringDates.rows.length) {
      createResponse(res, "Failed to delete recurring dates.")
    } 
    
    const deletingSlotsQueryValue = `
      WITH slots_info AS (
        SELECT "startTime"::time AS slot_start_time
        FROM "Slots"
        WHERE "employeeId" = $1::uuid
          AND "startTime" >= ($2::date || ' 00:00:00.000')::timestamp
          AND "startTime" <= ($2::date || ' 23:59:59.999')::timestamp
      ),
      recurring_dates AS (
        WITH recurring_dates_year AS (
          SELECT EXTRACT (YEAR FROM $2::date) as year
        )
        SELECT generate_series(
          $2::date + INTERVAL '7 days',
          (year || '-12-31')::date,
          INTERVAL '7 days'
        )::date AS date
        FROM recurring_dates_year
      )
      DELETE FROM "Slots"
      WHERE "employeeId" = $1::uuid
        AND "startTime" IN (
          SELECT (recurring_dates.date::date || ' ' || slots_info.slot_start_time::time)::timestamp
          FROM recurring_dates
          CROSS JOIN slots_info
        )
      RETURNING *;
    `;

    const deletingSlots = await pool.query(deletingSlotsQueryValue, [
      employeeId,
      day
    ]);

    await pool.query("COMMIT");
    
    if (!deletingSlots.rows.length) {
      return createResponse(res, "Failed to disable recurring day.");
    }

    createResponse(res, "Recurring day has been disabled.", deletingSlotsRecurringDates.rows[0]);

  } catch (error) {
    try {
      await pool.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed: ", rollbackError);
    }
    console.error("Failed to disable recurring day: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
