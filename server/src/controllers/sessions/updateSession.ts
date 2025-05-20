import { Request, Response } from "express";
import { pool } from "../../index";
import { createResponse } from "../../utils/createResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { Session } from "../../types";

export const updateSession = async (req: Request, res: Response) => {
  const { sessionId, slotId } = req.body as { sessionId: string, slotId: string };

  try {
    validateRequest({ res, endpoint: "updateSession", data: { sessionId, slotId }});
    
    await pool.query("BEGIN");

    const updatePrevSlotQueryValue = `
      WITH session_info AS (
        SELECT "slotId" AS slot_id
        FROM "Sessions"
        WHERE "id" = $1::uuid
      )
      UPDATE "Slots"
      SET "type" = 'AVAILABLE'
      FROM session_info
      WHERE "Slots"."id" = session_info.slot_id
      RETURNING "id"
    `;

    const updatePrevSlot = await pool.query(updatePrevSlotQueryValue, [
      sessionId
    ]);

    if (!updatePrevSlot) return createResponse(res, "Failed to update previous slot type.");

    const updateNewSlotQueryValue = `
      UPDATE "Slots"
      SET "type" = 'BOOKED'
      WHERE "id" = $1::uuid
      RETURNING "id"
    `;

    const updateNewSlot = await pool.query(updateNewSlotQueryValue, [
      slotId
    ]);

    if (!updateNewSlot) return createResponse(res, "Failed to update new slot type.");

    const updateSessionQueryValue = `
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
      FROM session_info, prev_slot_info, next_slot_info
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
        (SELECT slot_id FROM session_info) AS "prevSlotId",
        (SELECT slot_start_time FROM prev_slot_info) AS "prevStartTime"
      ;
    `;

    const updateSession = await pool.query(updateSessionQueryValue, [
      slotId,
      sessionId
    ])

    await pool.query("COMMIT");
    
    if (!updateSession) return createResponse(res, "Failed to update session.");
    
    const session = {
      id: updateSession.rows[0].id,
      slotId: updateSession.rows[0].slotId,
      employeeId: updateSession.rows[0].employeeId,
      customerId: updateSession.rows[0].customerId,
      startTime: updateSession.rows[0].startTime,
      message: updateSession.rows[0].message,
      createdAt: updateSession.rows[0].createdAt,
      updatedAt: updateSession.rows[0].updatedAt,
    }

    validateResult({res, endpoint: "updateSession", data: {
      prevSlotId: updateSession.rows[0].prevSlotId,
      prevStartTime: updateSession.rows[0].prevStartTime,
      session: session
    }});
    
    /** Send response */
    const message: string = "Session has been updated.";
    const data: { prevSlotId: string, prevStartTime: Date, session: Session } = {
      prevSlotId: updateSession.rows[0].prevSlotId,
      prevStartTime: updateSession.rows[0].prevStartTime,
      session: session
    }
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    try {
      await pool.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed: ", rollbackError);
    }
    console.error("Failed to update session: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
} 