import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { Slot } from "../../types";

export const updateSlotMinutes = async (req: Request, res: Response) => {
  const { slotId, minutes } = req.body as { slotId: string, minutes: number };

  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "updateSlotMinutes", data: { slotId, minutes }
    });
    if (validatingRequest !== "validated") return;

    const queryValue = `
      WITH slot_info AS (
        SELECT 
          "startTime" AS current_start_time,
          EXTRACT(HOUR FROM "startTime") AS current_hour,
          EXTRACT(MINUTE FROM "startTime") AS current_minutes
        FROM "Slots"
        WHERE "id" = $1::uuid
      )
      UPDATE "Slots"
      SET
        "startTime" = (
          slot_info.current_start_time::date || ' ' ||
          LPAD(slot_info.current_hour::text, 2, '0') || ':' ||
          LPAD($2::text, 2, '0') || ':00.000'
        )::timestamp,
        "updatedAt" = NOW()
      FROM slot_info
      WHERE "id" = $1::uuid
        AND NOT EXISTS (
          SELECT 1
          FROM "Slots" s2
          WHERE s2."startTime" = (
              slot_info.current_start_time::date || ' ' || 
              LPAD(slot_info.current_hour::text, 2, '0') || ':' ||
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
      minutes
    ])

    if (!result) return sendResponse(res, "Failed to update slot minutes.");

    const slot = {
      id: result.rows[0].id,
      employeeId: result.rows[0].employeeId,
      type: result.rows[0].type,
      startTime: result.rows[0].startTime,
      duration: result.rows[0].duration,
      recurring: result.rows[0].recurring,
      createdAt: result.rows[0].createdAt,
      updatedAt: result.rows[0].updatedAt
    }

    /** Validate result. */
    const validatingResult = await validateResult({
      res, endpoint: "updateSlotMinutes", data: { prevMinutes: result.rows[0].prevMinutes, slot }
    });
    if (validatingResult !== "validated") return;

    /** Send response */
    const message: string = "Slot minutes have been updated.";
    const data: { prevMinutes: number, slot: Slot } = { prevMinutes: result.rows[0].prevMinutes, slot };
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    console.error("Failed to update slot minutes: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}