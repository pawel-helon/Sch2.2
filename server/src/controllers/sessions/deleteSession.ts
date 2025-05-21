import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";

export const deleteSession = async (req: Request, res: Response) => {
  const { sessionId } = req.body as { sessionId: string };

  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "deleteSession", data: sessionId
    });
    if (validatingRequest !== "validated") return;

    const queryValue = `
      WITH session_info AS (
        SELECT s."slotId" AS session_slot_id, sl."startTime" AS session_start_time
        FROM "Sessions" s
        INNER JOIN "Slots" sl ON s."slotId" = sl."id"
        WHERE s."id" = $1::uuid
      )
      DELETE FROM "Sessions"
      WHERE "id" = $1::uuid
      RETURNING 
        "id" AS "sessionId", 
        "employeeId", 
        (SELECT session_start_time FROM session_info) AS "startTime"
      ;
    `;

    const result = await pool.query(queryValue, [
      sessionId
    ]);

    if (!result) return sendResponse(res, "Failed to delete session.");

    /** Validate result. */
    const validatingResult = await validateResult({
      res, endpoint: "deleteSession", data: result.rows[0]
    });
    if (validatingResult !== "validated") return;
    
    /** Send response */
    const message: string = "Session has been deleted.";
    const data: { sessionId: string, employeeId: string, startTime: Date } = result.rows[0];
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    console.error("Failed to delete session: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
