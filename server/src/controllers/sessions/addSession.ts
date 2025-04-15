import { Request, Response } from "express";
import { Session } from "../../lib/types";
import { pool } from "../../index";
import { TIMESTAMP_REGEX, UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: Session | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const addSession = async (req: Request, res: Response) => {
  const { session } = req.body as { session: Session };

  if (!session || typeof session !== "object" || !Object.keys(session).length) {
    return createResponse(res, "Invalid input data: session must be a non-empty object.");
  }

  if (!session.id || !session.slotId || !session.employeeId || !session.customerId || !session.startTime || !session.createdAt || !session.updatedAt) {
    return createResponse(res, 'Required fields: id, slotId, employeeId, customerId, startTime, createdAt, updatedAt.');
  }

  if (!UUID_REGEX.test(session.id)) {
    return createResponse(res, "Invalid id format. Expected UUID.");
  }

  if (!UUID_REGEX.test(session.slotId)) {
    return createResponse(res, "Invalid slotId format. Expected UUID.");
  }

  if (!UUID_REGEX.test(session.employeeId)) {
    return createResponse(res, "Invalid employeeId format. Expected UUID.");
  }

  if (!UUID_REGEX.test(session.customerId)) {
    return createResponse(res, "Invalid customerId format. Expected UUID.");
  }

  if (!TIMESTAMP_REGEX.test(new Date(session.startTime).toISOString())) {
    return createResponse(res, "Invalid startTime format. Expected Date object.");
  }

  if (!TIMESTAMP_REGEX.test(new Date(session.createdAt).toISOString())) {
    return createResponse(res, "Invalid createdAt format. Expected Date object.");
  }

  if (!TIMESTAMP_REGEX.test(new Date(session.updatedAt).toISOString())) {
    return createResponse(res, "Invalid updatedAt format. Expected Date object.");
  }
  
  try {
    const queryValue = `
      WITH slot_info AS (
        SELECT "startTime" as slot_start_time
        FROM "Slots"
        WHERE "id" = $2::uuid
      )
      INSERT INTO "Sessions" (
        "id", "slotId", "employeeId", "customerId", "message", "createdAt", "updatedAt"
      )
      SELECT
        $1::uuid AS "id",
        $2::uuid AS "slotId",
        $3::uuid AS "employeeId",
        $4::uuid AS "customerId",
        $5::text AS "message",
        $6::timestamp AS "createdAt",
        NOW() AS "updatedAt"
      FROM slot_info
      RETURNING
        "id", 
        "slotId", 
        "employeeId", 
        "customerId", 
        (SELECT slot_start_time FROM slot_info) AS "startTime", 
        "message", 
        "createdAt", 
        "updatedAt";
    `;

    const result = await pool.query(queryValue, [
      session.id,
      session.slotId,
      session.employeeId,
      session.customerId,
      session.message,
      session.createdAt,
    ]);

    if (!result.rows.length) {
      return createResponse(res, "Failed to add session.");
    }

    createResponse(res, "Session has been restored.", result.rows[0]);

  } catch (error) {
    console.error("Failed to restore session: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
