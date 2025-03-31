import { Request, Response } from "express";
import { pool } from "../../index";
import { Session } from "../../lib/types";
import { DATE_REGEX, UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, meetings: Session[] | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      meetings
    });
  }});
}

export const getWeekSessions = async (req: Request, res: Response) => {
  const { employeeId, start, end } = req.body as { employeeId: string, start: string, end: string };
  
  if (!employeeId || !start || !end) {
    return createResponse(res, "Start and end dates and employeeId are required");
  }
  
  if (!UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Invalid UUID format");
  }
  
  if (!DATE_REGEX.test(start) || !DATE_REGEX.test(end)) {
    return createResponse(res, "Invalid date format");
  }
  
  try {
    const queryValue = `
      WITH employee_slots_info AS (
        SELECT
          "startTime" AS slot_start_time,
          "id" AS slot_id
        FROM "Slots"
        WHERE "employeeId" = $1::uuid
      )
      SELECT
        "id",
        "slotId",
        "employeeId",
        "customerId",
        employee_slots_info.slot_start_time AS "startTime",
        "message",
        "createdAt",
        "updatedAt"
      FROM "Sessions"
      INNER JOIN employee_slots_info
        ON "slotId" = employee_slots_info.slot_id
      WHERE "employeeId" = $1::uuid
        AND slot_start_time >= ($2::date || ' 00:00:00.000')::timestamp
        AND slot_start_time <= ($3::date || ' 23:59:59.999')::timestamp
    `;
    
    const result = await pool.query(queryValue, [
      employeeId,
      start,
      end
    ]);
    
    if (!result.rows.length) {
      return createResponse(res, "Failed to fetch sessions");
    }

    createResponse(res, "Sessions have been fetched", result.rows);
    
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}                               