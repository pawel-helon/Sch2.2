import { Request, Response } from "express";
import { pool } from "../../index";
import { UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: string | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const deleteSession = async (req: Request, res: Response) => {
  const { sessionId } = req.body as { sessionId: string };

  if (!sessionId) {
    return createResponse(res, "Id is required.");
  }
  
  if (!UUID_REGEX.test(sessionId)) {
    return createResponse(res, "Invalid id format. Expected UUID.");
  }

  try {
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

    if (!result) {
      return createResponse(res, "Failed to delete session.");
    }

    createResponse(res, "Session has been deleted.", result.rows[0]);

  } catch (error) {
    console.error("Failed to delete session: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
