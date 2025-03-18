import { Request, Response } from "express";
import { createPool } from "../../db";
import { Slot } from "../../lib/types";

function createResponse(res: Response, message: string, slot: Slot | []) {
  res.format({"application/json" () {
    res.send({
      message,
      slot
    });
  }});
}

export async function addRecurringSlotController(req: Request, res: Response) {
  const { employeeId, day } = req.body as { employeeId: string, day: string };
  const year = day.split("-")[0];
  const pool = createPool();

  try {
    const queryValue = `
      WITH recurring_dates AS (
        SELECT generate_series(
          '${day}'::date,
          '${year}-12-31'::date,
          interval '7 days'
        )::date AS date
      ),
      available_time AS (
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
        $1 AS "employeeId",
        'AVAILABLE' AS "type",
        (date || ' ' || time)::timestamp AS "startTime",
        '30 minutes' AS "duration",
        true AS "recurring",
        NOW() AS "createdAt",
        NOW() AS "updatedAt"
      FROM recurring_dates
      CROSS JOIN available_time
      WHERE NOT EXISTS (
      SELECT 1
      FROM "Slot"
      WHERE "Slot"."employeeId" = $1::uuid
        AND "Slot"."startTime" = (date || ' ' || time)::timestamp
      )
      ON CONFLICT ("employeeId", "startTime")
      DO UPDATE SET
        "updatedAt" = NOW()
      RETURNING *;
    `;

    const addingRecurringSlots = await pool.query(queryValue, [
      employeeId,
    ]);
    
    if (!addingRecurringSlots.rows.length) {
      return createResponse(res, "Failed to add slots", []);
    }

    createResponse(
      res,
      `New recurring slots have been added.}`,
      addingRecurringSlots.rows[0]
    );

  } catch (error) {
    console.error("Failed to add slot:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
