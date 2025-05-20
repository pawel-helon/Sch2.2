import { Request, Response } from "express";
import { pool } from "../../index";
import { createResponse } from "../../utils/createResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { SlotsRecurringDate } from "../../types";

export const setRecurringDay = async (req: Request, res: Response) => {
  const { employeeId, day } = req.body as { employeeId: string, day: string };

  try {
    validateRequest({ res, endpoint: "setRecurringDay", data: { employeeId, day } });
    
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

    if (!insertingSlotsRecurringDates) return createResponse(res, "Failed to insert recurring dates.");

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
      RETURNING *;
    `;

    const insertingSlots = await pool.query(insertingSlotsQueryValue, [
      employeeId,
      day
    ]);

    if (!insertingSlots) return createResponse(res, "Failed to insert slots.");

    await pool.query("COMMIT");

    validateResult({ res, endpoint: "setRecurringDay", data: insertingSlotsRecurringDates.rows[0] });

    /** Send response */
    const message: string = "Recurring day has been set.";
    const data: SlotsRecurringDate = insertingSlotsRecurringDates.rows[0];
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

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
