import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { Session } from "../../types";

export const undoDeleteSession = async (req: Request, res: Response) => {
  const { session } = req.body as { session: Session };
  
  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "undoDeleteSession", data: session
    });
    if (validatingRequest !== "validated") return;
    
    const queryValue = `
      WITH slot_info AS (
        SELECT "startTime" AS slot_start_time
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
        "updatedAt"
      ;
    `;

    const result = await pool.query(queryValue, [
      session.id,
      session.slotId,
      session.employeeId,
      session.customerId,
      session.message,
      session.createdAt,
    ]);

    if (!result) return sendResponse(res, "Failed to restore session.");

    /** Validate result. */
    const validatingResult = await validateResult({
      res, endpoint: "undoDeleteSession", data: result.rows[0]
    });
    if (validatingResult !== "validated") return;

    /** Send response */
    const message: string = "Session has been restored.";
    const data: Session = result.rows[0];
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    console.error("Failed to restore session: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
