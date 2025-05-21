import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { NormalizedSessions } from "../../types";

export const getWeekSessions = async (req: Request, res: Response) => {
  const { employeeId, start, end } = req.body as { employeeId: string, start: string, end: string };
  
  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "getWeekSessions", data: { employeeId, start, end }
    });
    if (validatingRequest !== "validated") return;
    
    const queryValue = `
      WITH employee_slots_info AS (
        SELECT
          "startTime" AS slot_start_time,
          "id" AS slot_id
        FROM "Slots"
        WHERE "employeeId" = $1::uuid
      ),
      employee_sessions_info AS (
        SELECT
          "id",
          "slotId",
          "employeeId",
          "customerId",
          employee_slots_info.slot_start_time AS "session_start_time",
          "message",
          "createdAt",
          "updatedAt"
        FROM "Sessions"
        INNER JOIN employee_slots_info
          ON "slotId" = employee_slots_info.slot_id
        WHERE "employeeId" = $1::uuid
          AND slot_start_time >= ($2::date || ' 00:00:00.000')::timestamp
          AND slot_start_time <= ($3::date || ' 23:59:59.999')::timestamp
      )
      SELECT
        employee_sessions_info."id",
        employee_sessions_info."slotId",
        employee_sessions_info."employeeId",
        employee_sessions_info."customerId",
        employee_sessions_info."session_start_time" AS "startTime",
        "firstName" || ' ' || "lastName" AS "customerFullName",
        "email" AS "customerEmail",
        "phoneNumber" AS "customerPhoneNumber",
        employee_sessions_info."message",
        employee_sessions_info."createdAt",
        employee_sessions_info."updatedAt"
      FROM "Customers", employee_sessions_info
      WHERE "Customers"."id" = employee_sessions_info."customerId"::uuid;
    `;
    
    const result = await pool.query(queryValue, [
      employeeId,
      start,
      end
    ]);
    
    if (!result) return sendResponse(res, "Failed to fetch sessions.");

    const normalizedResult = result.rows.reduce(
      (acc: NormalizedSessions, session) => {
        acc.byId[session.id] = session
        acc.allIds.push(session.id)
        return acc;
      },
      { byId: {}, allIds: [] }
    );

    /** Validate normalized result. */
    const validatingResult = await validateResult({
      res, endpoint: "getWeekSessions", data: normalizedResult
    });
    if (validatingResult !== "validated") return;

    /** Send normalizedResult */
    const message: string = "Sessions have been fetched.";
    const data: NormalizedSessions = normalizedResult;
    res.format({"application/json": () => {
      res.send({ message, data });
    }});
    
  } catch (error) {
    console.error("Failed to fetch sessions: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}