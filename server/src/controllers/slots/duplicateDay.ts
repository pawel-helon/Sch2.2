import { Request, Response } from "express";
import { Slot } from "../../lib/types";
import { pool } from "../../index";
import { DATE_REGEX, UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, slots: Slot[] | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      slots
    });
  }});
}

export const duplicateDay = async (req: Request, res: Response) => {
  const { employeeId, day, selectedDays } = req.body as { employeeId: string, day: string, selectedDays: string[] };
  
  if (!employeeId || !day || !selectedDays) {
    return createResponse(res, "EmployeeId, day, and selectedDays are required");
  }
  
  if (!UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Invalid UUID format");
  }
  
  if (!DATE_REGEX.test(day)) {
    return createResponse(res, "Invalid date format");
  }  

  for (const day of selectedDays) {
    if (!DATE_REGEX.test(day)) {
      return createResponse(res, "Invalid date format");
    }
  }

  try {
    const queryValue = `
      WITH slots_info AS (
        SELECT
          "startTime"::time AS slot_start_time,
          "duration" AS slot_duration,
          "recurring" AS slot_recurring
        FROM "Slot"
        WHERE "employeeId" = $1::uuid
          AND "startTime" >= ($2::date || ' 00:00:00.000')::timestamp
          AND "startTime" <= ($2::date || ' 23:59:59.999')::timestamp
      ),
      selected_days AS (
        SELECT unnest($3::text[]) AS selected_day
      )
      INSERT INTO "Slot" (
        "employeeId", "startTime", "duration", "recurring"
      )
      SELECT
        $1::uuid AS "employeeId",
        (selected_day::date || ' ' || slots_info.slot_start_time::time)::timestamp AS "startTime",
        slots_info.slot_duration AS "duration",
        slots_info.slot_recurring AS "recurring" 
      FROM slots_info
      CROSS JOIN selected_days
      WHERE NOT EXISTS (
        SELECT 1
        FROM "Slot"
        WHERE "employeeId" = $1::uuid
        AND "startTime" = (selected_day::date || ' ' || slots_info.slot_start_time::time)::timestamp
      )
      ON CONFLICT ("employeeId", "startTime")
      DO NOTHING
      RETURNING *
    `;

    const result = await pool.query(queryValue, [
      employeeId,
      day,
      selectedDays
    ]);

    if (!result.rows.length) {
      return createResponse(res, "Failed to duplicate day");
    }

    createResponse(res, "Day has been duplicated", result.rows);

  } catch (error) {
    console.error("Failed to duplicate day:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
