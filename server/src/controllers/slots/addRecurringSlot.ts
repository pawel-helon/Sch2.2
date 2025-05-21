import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { Slot } from "../../types";

export const addRecurringSlot = async (req: Request, res: Response) => {
  const { employeeId, day } = req.body as { employeeId: string, day: string };
  
  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "addRecurringSlot", data: { employeeId, day }
    });
    if (validatingRequest !== "validated") return;

    const queryValue = `
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
      available_time AS (
        WITH all_times AS (
          SELECT generate_series(
            ($2::date || ' 08:00:00.000')::timestamp,
            ($2::date || ' 20:00:00.000')::timestamp,
            INTERVAL '15 minutes'
          ) AS possible_time
        )
        SELECT possible_time::time AS time
        FROM all_times
        WHERE possible_time > CURRENT_TIMESTAMP
          AND NOT EXISTS (
            SELECT 1
            FROM "Slots"
            WHERE "startTime" = possible_time
              AND "startTime" >= ($2::date || ' 00:00:00.000')::timestamp
              AND "startTime" <= ($2::date || ' 23:59:59.999')::timestamp
          )
        ORDER BY possible_time
        LIMIT 1
      )
      INSERT INTO "Slots" (
        "employeeId", "type", "startTime", "duration", "recurring", "createdAt", "updatedAt"
      )
      SELECT
        $1::uuid AS "employeeId",
        'AVAILABLE' AS "type",
        (date::date || ' ' || time::time)::timestamp AS "startTime",
        '30 minutes' AS "duration",
        true AS "recurring",
        NOW() AS "createdAt",
        NOW() AS "updatedAt"
      FROM recurring_dates, available_time
      WHERE NOT EXISTS (
        SELECT 1
        FROM "Slots"
        WHERE "Slots"."employeeId" = $1::uuid
        AND "Slots"."startTime" = (date::date || ' ' || time::time)::timestamp
      )
      ORDER BY "startTime"
      ON CONFLICT ("employeeId", "startTime")
      DO UPDATE
      SET "recurring" = true
      RETURNING *;
    `;

    const result = await pool.query(queryValue, [
      employeeId,
      day,
    ]);

    if (!result) return sendResponse(res, "Failed to add recurring slot.");
    
    /** Validate result. */
    const validatingResult = await validateResult({
      res, endpoint: "addRecurringSlot", data: result.rows[0]
    });
    if (validatingResult !== "validated") return;

    /** Send response */
    const message: string = "New recurring slot have been added.";
    const data: Slot = result.rows[0];
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    console.error("Failed to add recurring slot: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
