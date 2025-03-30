import { Request, Response } from "express";
import { Slot } from "../../lib/types";
import { pool } from "../../index";
import { MINUTES_REGEX, UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, slot: Slot | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      slot
    });
  }});
}

export const updateRecurringSlotMinutes = async (req: Request, res: Response) => {
  const { employeeId, slotId, minutes } = req.body as { employeeId: string, slotId: string, minutes: string };
  
  if (!employeeId || !slotId || !minutes) {
    return createResponse(res, "employeeId, slotId and hour are required");
  }
  
  if (!UUID_REGEX.test(employeeId) || !UUID_REGEX.test(slotId)) {
    return createResponse(res, "Invalid UUID format");
  }

  if (!MINUTES_REGEX.test(minutes)) {
    return createResponse(res, "Minute must be a number between 0 and 59");
  }

  try {
    const queryValue = `
      WITH slot_info AS (
        SELECT 
          "startTime" AS current_start_time,
          EXTRACT(HOUR FROM "startTime") AS current_hour,
          EXTRACT(MINUTE FROM "startTime") AS current_minutes,
          EXTRACT(YEAR FROM "startTime") AS current_year
        FROM "Slot"
        WHERE "employeeId" = $1::uuid
          AND "id" = $2::uuid
      ),
      recurring_dates AS (
        SELECT generate_series(
          (SELECT current_start_time::date FROM slot_info),
          ((SELECT current_year FROM slot_info)::text || '-12-31')::date,
          INTERVAL '7 days'
        )::date AS date
      )
      UPDATE "Slot"
      SET
        "startTime" = (
          recurring_dates.date::date || ' ' ||
          LPAD((SELECT current_hour FROM slot_info)::text, 2, '0') || ':' ||
          LPAD($3::text, 2, '0') || ':00.000'
        )::timestamp,
        "updatedAt" = NOW()
      FROM slot_info
      CROSS JOIN recurring_dates
      WHERE "Slot"."employeeId" = $1::uuid
        AND "Slot"."startTime" = (
          recurring_dates.date::date || ' ' ||
          LPAD((SELECT current_hour FROM slot_info)::text, 2, '0') || ':' ||
          LPAD((SELECT current_minutes FROM slot_info)::text, 2, '0') || ':00.000'
        )::timestamp
        AND NOT EXISTS (
          SELECT 1
          FROM "Slot" s2
          WHERE s2."employeeId" = $1::uuid
            AND s2."startTime" = (
              recurring_dates.date::date || ' ' ||
              LPAD((SELECT current_hour FROM slot_info)::text, 2, '0') || ':' ||
              LPAD($3::text, 2, '0') || ':00.000'
            )::timestamp
            AND s2."id" != $2::uuid
        )
      RETURNING "id", "employeeId", "type", "startTime", "duration", "recurring", "createdAt", "updatedAt"
    `;

    const result = await pool.query(queryValue, [
      employeeId,
      slotId,
      minutes
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