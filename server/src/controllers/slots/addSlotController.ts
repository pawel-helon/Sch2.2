import { Request, Response } from "express";
import { createPool } from "../../db";
import { Slot } from "../../lib/types";

const createResponse = (res: Response, message: string, slot: Slot | []) => {
  res.format({"application/json" () {
    res.send({
      message,
      slot
    });
  }});
}

export async function addSlotController(req: Request, res: Response) {
  const { employeeId, day } = req.body as { employeeId: string, day: string };
  const pool = createPool();
  try {
    const queryValue = `
      WITH available_time AS (
        WITH all_times AS (
          SELECT generate_series(
            '${day} 08:00:00'::timestamp,
            '${day} 20:00:00'::timestamp,
            interval '15 minutes'
          ) AS possible_time
        )
        SELECT to_char(possible_time, 'HH24:MI') AS time
        FROM all_times
        WHERE possible_time > CURRENT_TIMESTAMP
          AND NOT EXISTS (
            SELECT 1
            FROM "Slot"
            WHERE "startTime" = possible_time
              AND "startTime" >= '${day} 00:00:00.000'
              AND "startTime" <= '${day} 23:59:59.999'
          )
        ORDER BY possible_time
        LIMIT 1
      )
      INSERT INTO "Slot" (
        "employeeId", "type", "startTime", "duration", "recurring", "createdAt", "updatedAt"
      )
      SELECT
        $1::uuid AS "employeeId",
        'AVAILABLE' AS "type",
        ('${day} ' || time)::timestamp AS "startTime",
        '30 minutes' AS "duration",
        false AS "recurring",
        NOW() AS "createdAt",
        NOW() AS "updatedAt"
      FROM available_time
      RETURNING *;
    `;

    const addingSlot = await pool.query(queryValue, [
      employeeId
    ]);

    
    if (!addingSlot.rows.length) {
      return createResponse(res, "Failed to add slot", []);
    }

    createResponse(
      res,
      `New slot has been added.`,
      addingSlot.rows[0]
    );


  } catch (error) {
    console.error("Failed to add slot:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
