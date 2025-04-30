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

export const setRecurringDay = async (req: Request, res: Response) => {
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

    const insertingSlotsRecurringDatesQueryValue = `
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
      )
      INSERT INTO "SlotsRecurringDates" (
        "employeeId", "date"
      )
      SELECT
        $1::uuid AS "employeeId",
        recurring_dates.date::date AS "date"
      FROM recurring_dates
      ORDER BY "date"
      RETURNING
        "id",
        "employeeId",
        "date"::text
      ;
    `;

    const insertingSlotsRecurringDates = await pool.query(insertingSlotsRecurringDatesQueryValue, [
      employeeId,
      day
    ])

    if (!insertingSlotsRecurringDates.rows.length) {
      createResponse(res, "Failed to insert recurring dates.")
    } 

    const insertingSlotsQueryValue = `
      WITH slots_info AS (
        SELECT
          "startTime"::time AS slot_start_time,
          "duration" AS slot_duration,
          "recurring" AS slot_recurring
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
          $2::date,
          (year || '-12-31')::date,
          INTERVAL '7 days'
        )::date AS date
        FROM recurring_dates_year
      )
      INSERT INTO "Slots" (
        "employeeId", "startTime", "duration", "recurring"
      )
      SELECT
        $1::uuid AS "employeeId",
        (date::date || ' ' || slots_info.slot_start_time::time)::timestamp AS "startTime",
        slots_info.slot_duration AS "duration",
        slots_info.slot_recurring AS "recurring" 
      FROM slots_info, recurring_dates
      WHERE NOT EXISTS (
        SELECT 1
        FROM "Slots"
        WHERE "employeeId" = $1::uuid
        AND "startTime" = (date::date || ' ' || slots_info.slot_start_time::time)::timestamp
      )
      ON CONFLICT ("employeeId", "startTime")
      DO NOTHING
      RETURNING *
    `;

    const insertingSlots = await pool.query(insertingSlotsQueryValue, [
      employeeId,
      day
    ]);

    await pool.query("COMMIT");
    
    if (!insertingSlots.rows.length) {
      return createResponse(res, "Failed to set recurring day.");
    }

    createResponse(res, "Recurring day has been set.", insertingSlotsRecurringDates.rows[0]);

  } catch (error) {
    try {
      await pool.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed: ", rollbackError);
    }
    console.error("Failed to set recurring day: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
