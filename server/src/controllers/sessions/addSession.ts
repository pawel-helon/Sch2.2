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

export const addSession = async (req: Request, res: Response) => {
  const { session } = req.body as { session: Session };

  if (typeof session !== "object" || !Object.keys(session).length) {
    return createResponse(res, "Invalid input data: session must be a non-empty object.");
  }

  if (!session.id || !UUID_REGEX.test(session.id)) {
    return createResponse(res, "Invalid id format. Expected UUID.");
  }

  if (!session.slotId || !UUID_REGEX.test(session.slotId)) {
    return createResponse(res, "Invalid slotId format. Expected UUID.");
  }

  if (!session.employeeId || !UUID_REGEX.test(session.employeeId)) {
    return createResponse(res, "Invalid employeeId format. Expected UUID.");
  }

  if (!session.customerId || !UUID_REGEX.test(session.customerId)) {
    return createResponse(res, "Invalid customerId format. Expected UUID.");
  }

  if (!session.startTime || !(session.startTime instanceof Date)) {
    return createResponse(res, "Invalid startTime format. Expected Date object.");
  }

  if (new Date(session.startTime) < new Date()) {
    return createResponse(res, "Invalid startTime. Expected non-past value.");
  }

  if (!session.createdAt || !(session.createdAt instanceof Date)) {
    return createResponse(res, "Invalid createdAt format. Expected Date object.");
  }

  if (!session.updatedAt || !(session.updatedAt instanceof Date)) {
    return createResponse(res, "Invalid updatedAt format. Expected Date object.");
  }
  
  try {
    const queryValue = `
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
      RETURNING *
    `;

    const result = await pool.query(queryValue, [
      session.id,
      session.slotId,
      session.employeeId,
      session.customerId,
      session.message,
      session.createdAt
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
