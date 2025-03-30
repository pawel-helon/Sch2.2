import { Request, Response } from "express";
import { Slot } from "../../lib/types";
import { pool } from "../../index";
import { HOUR_REGEX, UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, slot: Slot | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      slot
    });
  }});
}

export const updateSlotHour = async (req: Request, res: Response) => {
  const { employeeId, slotId, hour } = req.body as { employeeId: string, slotId: string, hour: string };
  
  if (!employeeId || !slotId || !hour) {
    return createResponse(res, "employeeId, slotId and hour are required");
  }
  
  if (!UUID_REGEX.test(employeeId) || !UUID_REGEX.test(slotId)) {
    return createResponse(res, "Invalid UUID format");
  }

  if (!HOUR_REGEX.test(hour)) {
    return createResponse(res, "Hour must be a number between 0 and 23");
  }

  try {
    const queryValue = `
      WITH slot_info AS (
        SELECT 
          "startTime" AS current_start_time,
          EXTRACT(HOUR FROM "startTime") AS current_hour,
          EXTRACT(MINUTE FROM "startTime") AS current_minutes
        FROM "Slot"
        WHERE "employeeId" = $1::uuid
          AND "id" = $2::uuid
      )
      UPDATE "Slot"
      SET
        "startTime" = (
          slot_info.current_start_time::date || ' ' ||
          LPAD($3::text, 2, '0') || ':' ||
          LPAD(slot_info.current_minutes::text, 2, '0') || ':00.000'
        )::timestamp,
        "updatedAt" = NOW()
      FROM slot_info
      WHERE "employeeId" = $1::uuid
        AND "id" = $2::uuid
        AND NOT EXISTS (
          SELECT 1
          FROM "Slot" s2
          WHERE s2."employeeId" = $1::uuid
            AND s2."startTime" = (
              slot_info.current_start_time::date || ' ' || 
              LPAD($3::text, 2, '0') || ':' || 
              LPAD(slot_info.current_minutes::text, 2, '0') || ':00.000'
            )::timestamp
            AND s2."id" != $2::uuid
        )
      RETURNING "id", "employeeId", "type", "startTime", "duration", "recurring", "createdAt", "updatedAt"
    `;

    const result = await pool.query(queryValue, [
      employeeId,
      slotId,
      hour
    ])
    
    if (!result.rows.length) {
      return createResponse(res, "Failed to update slot");
    }

    createResponse(res, "Slot time has been updated", result.rows[0]);
    
  } catch (error) {
    console.error("Failed to add slot:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
}