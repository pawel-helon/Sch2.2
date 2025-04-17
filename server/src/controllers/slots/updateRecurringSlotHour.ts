import { Request, Response } from "express";
import { Slot } from "../../lib/types";
import { pool } from "../../index";
import { UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: { prevHour: string, slot: Slot } | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const updateRecurringSlotHour = async (req: Request, res: Response) => {
  const { employeeId, slotId, hour } = req.body as { employeeId: string, slotId: string, hour: number };
  
  if (!employeeId || !slotId || !hour) {
    return createResponse(res, "All fields are required: employeeId, slotId and hour.");
  }
  
  if (!UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Invalid employeeId format. Expected UUID.");
  }
  
  if (!UUID_REGEX.test(slotId)) {
    return createResponse(res, "Invalid slotId format. Expected UUID.");
  }

  if (hour < 0 || hour > 23 || typeof hour !== "number") {
    return createResponse(res, "Invalid hour. Expected number between 0 and 23.");
  }

  try {
    const queryValue = `
      WITH slot_info AS (
        SELECT 
          "startTime" AS current_start_time,
          EXTRACT(HOUR FROM "startTime") AS current_hour,
          EXTRACT(MINUTE FROM "startTime") AS current_minutes,
          EXTRACT(YEAR FROM "startTime") AS current_year
        FROM "Slots"
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
      UPDATE "Slots"
      SET
        "startTime" = (
          recurring_dates.date::date || ' ' ||
          LPAD($3::text, 2, '0') || ':' ||
          LPAD((SELECT current_minutes FROM slot_info)::text, 2, '0') || ':00.000'
        )::timestamp,
        "updatedAt" = NOW()
      FROM slot_info
      CROSS JOIN recurring_dates
      WHERE "Slots"."employeeId" = $1::uuid
        AND "Slots"."startTime" = (
          recurring_dates.date::date || ' ' ||
          LPAD((SELECT current_hour FROM slot_info)::text, 2, '0') || ':' ||
          LPAD((SELECT current_minutes FROM slot_info)::text, 2, '0') || ':00.000'
        )::timestamp
        AND NOT EXISTS (
          SELECT 1
          FROM "Slots" s2
          WHERE s2."employeeId" = $1::uuid
            AND s2."startTime" = (
              recurring_dates.date::date || ' ' ||
              LPAD($3::text, 2, '0') || ':' ||
              LPAD((SELECT current_minutes FROM slot_info)::text, 2, '0') || ':00.000'
            )::timestamp
            AND s2."id" != $2::uuid
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
        (SELECT slot_info.current_hour FROM slot_info) AS "prevHour"
    `;

    const result = await pool.query(queryValue, [
      employeeId,
      slotId,
      String(hour)
    ])
    
    if (!result.rows.length) {
      return createResponse(res, "Failed to update slot.");
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

    createResponse(res, "Slot time has been updated.", { prevHour: result.rows[0].prevHour, slot });
    
  } catch (error) {
    console.error("Failed to update slot hour: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}