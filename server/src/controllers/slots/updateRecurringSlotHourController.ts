import { Request, Response } from "express";
import { Slot } from "../../lib/types";
import { pool } from "../../index";

const createResponse = (res: Response, message: string, slot: Slot | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      slot
    });
  }});
}

export const updateRecurringSlotHourController = async (req: Request, res: Response) => {
  const { employeeId, slotId, hour } = req.body as { employeeId: string, slotId: string, hour: string };
  
  if (!employeeId || !slotId || !hour) {
    return createResponse(res, "employeeId, slotId and hour are required");
  }

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(employeeId) || !UUID_REGEX.test(slotId)) {
    return createResponse(res, "Invalid UUID format");
  }

  const HOUR_REGEX = /^([0-1][0-9]|2[0-3])$/
  if (!HOUR_REGEX.test(hour)) {
    return createResponse(res, "Hour must be a number between 0 and 23");
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
          LPAD($3::text, 2, '0') || ':' ||
          LPAD((SELECT current_minutes FROM slot_info)::text, 2, '0') || ':00.000'
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
              LPAD($3::text, 2, '0') || ':' ||
              LPAD((SELECT current_minutes FROM slot_info)::text, 2, '0') || ':00.000'
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