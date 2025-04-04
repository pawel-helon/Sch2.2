import { Request, Response } from "express";
import { Session } from "../../lib/types";
import { pool } from "../../index";
import { UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: Session | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const updateSession = async (req: Request, res: Response) => {
  const { sessionId, slotId } = req.body as { sessionId: string, slotId: string };

  if (!sessionId || !slotId) {
    return createResponse(res, "sessionId and slotId are required");
  }
  
  if (!UUID_REGEX.test(sessionId) || !UUID_REGEX.test(slotId)) {
    return createResponse(res, "Invalid UUID format");
  }

  try {
    const queryValue = `
      WITH slot_info AS (
        SELECT
          "startTime" AS slot_start_time
        FROM "Slots"
        WHERE "id" = $1::uuid
      )
      UPDATE "Sessions"
      SET "slotId" = $1::uuid
      FROM slot_info
      WHERE "id" = $2::uuid
      RETURNING
        "id",
        "slotId",
        "employeeId",
        "customerId",
        slot_info.slot_start_time AS "startTime",
        "message",
        "createdAt",
        "updatedAt"
    `;

    const result = await pool.query(queryValue, [
      slotId,
      sessionId
    ])
    
    if (!result.rows.length) {
      return createResponse(res, "Failed to update session");
    }

    createResponse(res, "Session has been updated", result.rows[0]);
    
  } catch (error) {
    console.error("Failed to update session:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
}