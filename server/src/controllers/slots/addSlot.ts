import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { Slot } from "../../types";

export const addSlot = async (req: Request, res: Response) => {
  const { employeeId, day } = req.body as { employeeId: string, day: string};
  
  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "addSlot", data: { employeeId, day }
    });
    if (validatingRequest !== "validated") return;

    const queryValue = `
      WITH available_time AS (
        WITH all_times AS (
          SELECT generate_series(
            ($2::date || ' ' || '08:00:00.000'::time)::timestamp,
            ($2::date || ' ' || '20:00:00.000'::time)::timestamp,
            INTERVAL '15 minutes'
          ) AS possible_time
        )
        SELECT possible_time::time AS time
        FROM all_times
        WHERE possible_time > CURRENT_TIMESTAMP
          AND NOT EXISTS (
            SELECT 1
            FROM "Slots"
            WHERE "startTime" = possible_time
              AND "startTime" >= ($2::date || ' ' || '00:00:00.000'::time)::timestamp
              AND "startTime" <= ($2::date || ' ' || '23:59:59.999'::time)::timestamp
          )
        ORDER BY possible_time
        LIMIT 1
      )
      INSERT INTO "Slots" (
        "employeeId", "type", "startTime", "duration", "recurring", "createdAt", "updatedAt"
      )
      SELECT
        $1::uuid AS "employeeId",
        'AVAILABLE' AS "type",
        ($2::date || ' ' || available_time.time::time)::timestamp AS "startTime",
        '30 minutes' AS "duration",
        false AS "recurring",
        NOW() AS "createdAt",
        NOW() AS "updatedAt"
      FROM available_time
      RETURNING *;
    `;
    
    const result = await pool.query(queryValue, [
      employeeId,
      day
    ]);

    if (!result) return sendResponse(res, "Failed to add slot");
    
    /** Validate result. */
    const validatingResult = await validateResult({
      res, endpoint: "addSlot", data: result.rows[0]
    });
    if (validatingResult !== "validated") return;

    /** Send response */
    const message: string = "New slot has been added.";
    const data: Slot = result.rows[0];
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    console.error("Failed to add slot: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
