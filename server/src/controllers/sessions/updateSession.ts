import { Request, Response } from "express";
import { Session } from "../../lib/types";
import { pool } from "../../index";
import { UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: { prevStartTime: Date, session: Session} | null = null) => {
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
    return createResponse(res, "All fields are required: sessionId, slotId.");
  }
  
  if (!UUID_REGEX.test(sessionId)) {
    return createResponse(res, "Invalid sessionId format. Expected UUID.");
  }

  if (!UUID_REGEX.test(slotId)) {
    return createResponse(res, "Invalid slotId format. Expected UUID.");
  }

  try {
    const queryValue = `
      WITH session_info AS (
        SELECT "slotId" AS slot_id
        FROM "Sessions"
        WHERE "id" = $2::uuid
      ),
      prev_slot_info AS (
        SELECT "startTime" AS slot_start_time
        FROM "Slots"
        INNER JOIN session_info ON "Slots"."id" = session_info.slot_id
      ),
      next_slot_info AS (
        SELECT "startTime" AS slot_start_time
        FROM "Slots"
        WHERE "id" = $1::uuid
      )
      UPDATE "Sessions"
      SET "slotId" = $1::uuid
      FROM prev_slot_info, next_slot_info
      WHERE "Sessions"."id" = $2::uuid
      RETURNING
        "id",
        "slotId",
        "employeeId",
        "customerId",
        (SELECT slot_start_time FROM next_slot_info) AS "startTime",
        "message",
        "createdAt",
        "updatedAt",
        (SELECT slot_start_time FROM prev_slot_info) AS "prevStartTime"
    `;

    const result = await pool.query(queryValue, [
      slotId,
      sessionId
    ])
    
    if (!result.rows.length) {
      return createResponse(res, "Failed to update session.");
    }

    const session = {
      id: result.rows[0].id,
      slotId: result.rows[0].slotId,
      employeeId: result.rows[0].employeeId,
      customerId: result.rows[0].customerId,
      startTime: result.rows[0].startTime,
      message: result.rows[0].message,
      createdAt: result.rows[0].createdAt,
      updatedAt: result.rows[0].updatedAt,
    }

    createResponse(res, "Session has been updated.", { prevStartTime: result.rows[0].prevStartTime, session: session });
    
  } catch (error) {
    console.error("Failed to update session: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}