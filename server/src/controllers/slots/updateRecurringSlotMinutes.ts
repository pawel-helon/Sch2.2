import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { Slot } from "../../types";

export const updateRecurringSlotMinutes = async (req: Request, res: Response) => {
  const { slotId, minutes } = req.body as { slotId: string, minutes: number };

  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "updateRecurringSlotMinutes", data: { slotId, minutes }
    });
    if (validatingRequest !== "validated") return;

    const queryValue = `
      WITH slot_info AS (
        SELECT 
          "startTime" AS current_start_time,
          "employeeId" AS employee_id,
          EXTRACT(HOUR FROM "startTime") AS current_hour,
          EXTRACT(MINUTE FROM "startTime") AS current_minutes,
          EXTRACT(YEAR FROM "startTime") AS current_year
        FROM "Slots"
        WHERE "id" = $1::uuid
      ),
      recurring_dates AS (
        SELECT generate_series(
          (SELECT current_start_time::date FROM slot_info),
          ((SELECT current_year FROM slot_info)::text || '-12-31')::date,
          INTERVAL '7 days'
        )::date AS date
      )
      UPDATE "Slots"
      SET
        "startTime" = (
          recurring_dates.date::date || ' ' ||
          LPAD((SELECT current_hour FROM slot_info)::text, 2, '0') || ':' ||
          LPAD($2::text, 2, '0') || ':00.000'
        )::timestamp,
        "updatedAt" = NOW()
      FROM slot_info, recurring_dates
      WHERE "Slots"."startTime"::date = recurring_dates.date::date
        AND "Slots"."startTime"::time = (
          LPAD((SELECT current_hour FROM slot_info)::text, 2, '0') || ':' ||
          LPAD((SELECT current_minutes FROM slot_info)::text, 2, '0') || ':00.000'
        )::time
        AND "Slots"."employeeId"::uuid = slot_info.employee_id
        AND NOT EXISTS (
          SELECT 1
          FROM "Slots" s2
          WHERE s2."employeeId" = (SELECT employee_id FROM slot_info)::uuid
            AND s2."startTime" = (
              slot_info.current_start_time::date || ' ' || 
              LPAD((SELECT current_hour FROM slot_info)::text, 2, '0') || ':' ||
              LPAD($2::text, 2, '0') || ':00.000'
            )::timestamp
            AND s2."id" != $1::uuid
        )
      RETURNING
        "id",
        "employeeId",
        "type",
        "startTime",
        "duration",
        "recurring",
        "createdAt",
        "updatedAt",
        (SELECT slot_info.current_minutes FROM slot_info)::integer AS "prevMinutes"
      ;
    `;

    const result = await pool.query(queryValue, [
      slotId,
      String(minutes)
    ])
    
    if (!result) return sendResponse(res, "Failed to update recurring slot minutes.");

    const slot = {
      id: result.rows[0].id,
      employeeId: result.rows[0].employeeId,
      type: result.rows[0].type,
      startTime: result.rows[0].startTime,
      duration: result.rows[0].duration,
      recurring: result.rows[0].recurring,
      createdAt: result.rows[0].createdAt,
      updatedAt: result.rows[0].updatedAt
    } as Slot;

    /** Validate result. */
    const validatingResult = await validateResult({
      res, endpoint: "updateRecurringSlotMinutes", data: { prevMinutes: result.rows[0].prevMinutes, slot }
    });
    if (validatingResult !== "validated") return;

    /** Send response */
    const message: string = "Recurring slot minutes have been updated.";
    const data: { prevMinutes: number, slot: Slot } = { prevMinutes: result.rows[0].prevMinutes, slot };
    res.format({"application/json": () => {
      res.send({ message, data });
    }});
    
  } catch (error) {
    console.error("Failed to update recurring slot minutes: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}