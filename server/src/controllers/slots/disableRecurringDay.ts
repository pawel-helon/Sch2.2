import { Request, Response } from "express";
import { pool } from "../../index";
import { createResponse } from "../../utils/createResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { SlotsRecurringDate } from "../../types";

export const disableRecurringDay = async (req: Request, res: Response) => {
  const { employeeId, day } = req.body as { employeeId: string, day: string };

  try {
    validateRequest({ res, endpoint: "disableRecurringDay", data: { employeeId, day } });
    
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

    if (!deletingSlotsRecurringDates) return createResponse(res, "Failed to delete slots recurring dates.");

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

    if (!deletingSlots) return createResponse(res, "Failed to delete slots.");

    await pool.query("COMMIT");

    validateResult({ res, endpoint: "disableRecurringDay", data: deletingSlotsRecurringDates.rows[0] });

    /** Send response */
    const message: string = "Recurring day has been disabled.";
    const data: SlotsRecurringDate = deletingSlotsRecurringDates.rows[0];
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

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
