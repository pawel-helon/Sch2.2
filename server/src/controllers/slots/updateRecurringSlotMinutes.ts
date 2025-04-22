import { Request, Response } from "express";
import { Slot } from "../../lib/types";
import { pool } from "../../index";
import { UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: { prevMinutes: string, slot: Slot } | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const updateRecurringSlotMinutes = async (req: Request, res: Response) => {
  const { slotId, minutes } = req.body as { slotId: string, minutes: number };
  
  if (!slotId || !minutes) {
    return createResponse(res, "All fields are required: employeeId, slotId and minutes.");
  }
  
  if (!UUID_REGEX.test(slotId)) {
    return createResponse(res, "Invalid slotId format. Expected UUID.");
  }

  if (minutes < 0 || minutes > 59 || typeof minutes !== "number") {
    return createResponse(res, "Invalid minnutes. Expected number between 0 and 59.");
  }

  try {
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
        (SELECT slot_info.current_minutes FROM slot_info) AS "prevMinutes"
    `;

    const result = await pool.query(queryValue, [
      slotId,
      String(minutes)
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

    createResponse(res, "Slot time has been updated.", { prevMinutes: result.rows[0].prevMinutes, slot });
    
  } catch (error) {
    console.error("Failed to update slot minutes: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}