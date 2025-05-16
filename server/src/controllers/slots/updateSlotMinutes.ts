import { Request, Response } from "express";
import { Slot } from "../../lib/types";
import { pool } from "../../index";
import { MINUTES, UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: { prevMinutes: string, slot: Slot } | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const updateSlotMinutes = async (req: Request, res: Response) => {
  const { slotId, minutes } = req.body as { slotId: string, minutes: number };
  
  if (!slotId || !MINUTES.includes(minutes)) {
    return createResponse(res, "All fields are required: employeeId, slotId and minutes.");
  }
  
  if (!UUID_REGEX.test(slotId)) {
    return createResponse(res, "Invalid slotId format. Expected UUID.");
  }

  if (minutes < 0 || minutes > 59 || typeof minutes !== 'number') {
    return createResponse(res, "Invalid minnutes. Expected number between 0 and 59.");
  }

  try {
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
        (SELECT slot_info.current_minutes FROM slot_info) AS "prevMinutes"
      ;
    `;

    const result = await pool.query(queryValue, [
      slotId,
      minutes
    ])

    if (!result) {
      return createResponse(res, "Failed to update slot minutes.");
    }

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

    createResponse(res, "Slot minutes have been updated.", { prevMinutes: result.rows[0].prevMinutes, slot });

  } catch (error) {
    console.error("Failed to update slot minutes: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}