import { Request, Response } from "express";
import { Slot } from "../../types";
import { pool } from "../../index";
import { HOURS, UUID_REGEX } from "../../constants";

const createResponse = (res: Response, message: string, data: { prevHour: number, slot: Slot } | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const updateSlotHour = async (req: Request, res: Response) => {
  const { slotId, hour } = req.body as { slotId: string, hour: number };

  if (!slotId || !HOURS.includes(hour)) {
    return createResponse(res, "All fields are required: slotId, hour.");
  }
  
  if (!UUID_REGEX.test(slotId)) {
    return createResponse(res, "Invalid slotId format. Expected UUID.");
  }

  if (hour < 0 || hour > 23 || typeof hour !== 'number') {
    return createResponse(res, "Invalid hour. Expected number between 0 and 23.");
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
          LPAD($2::text, 2, '0') || ':' ||
          LPAD(slot_info.current_minutes::text, 2, '0') || ':00.000'
        )::timestamp,
        "updatedAt" = NOW()
      FROM slot_info
      WHERE "id" = $1::uuid
        AND NOT EXISTS (
          SELECT 1
          FROM "Slots" s2
          WHERE s2."startTime" = (
            slot_info.current_start_time::date || ' ' || 
            LPAD($2::text, 2, '0') || ':' || 
            LPAD(slot_info.current_minutes::text, 2, '0') || ':00.000'
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
        (SELECT slot_info.current_hour FROM slot_info)::integer AS "prevHour"
      ;
    `;

    const result = await pool.query(queryValue, [
      slotId,
      hour
    ])
    
    if (!result) {
      return createResponse(res, "Failed to update slot hour.");
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
    
    createResponse(res, "Slot hour has been updated.", { prevHour: result.rows[0].prevHour, slot });
    
  } catch (error) {
    console.error("Failed to update slot hour: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}