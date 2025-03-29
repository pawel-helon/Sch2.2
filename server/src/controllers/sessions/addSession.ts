import { Request, Response } from "express";
import { Session } from "../../lib/types";
import { pool } from "../../index";

const createResponse = (res: Response, message: string, slot: Session | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      slot
    });
  }});
}

export const addSession = async (req: Request, res: Response) => {
  const { session } = req.body as { session: Session };

  if (!session) {
    return createResponse(res, "Session is required");
  }

  if (typeof session !== "object" || Object.keys(session).length === 0) {
    return createResponse(res, "Invalid input data: session must be a non-empty object");
  }

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(session.id) ||
      !UUID_REGEX.test(session.slotId) ||
      !UUID_REGEX.test(session.employeeId) ||
      !UUID_REGEX.test(session.customerId)
  ) {
    return createResponse(res, "Invalid UUID format");
  }

  try {
    const queryValue = `
      INSERT INTO "Session" (
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
      return createResponse(res, "Failed to add session");
    }

    createResponse(res, "Session has been restored", result.rows[0]);

  } catch (error) {
    console.error("Failed to restore session:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
