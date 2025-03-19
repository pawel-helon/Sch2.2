import { Request, Response } from "express";
import { Slot } from "../../lib/types";
import { pool } from "../../index";

function createResponse(res: Response, message: string, slot: Slot | null = null) {
  res.format({"application/json": () => {
    res.send({
      message,
      slot
    });
  }});
}

export async function addRecurringSlotController(req: Request, res: Response) {
  const { employeeId, day } = req.body as { employeeId: string, day: string };
  
  if (!employeeId || !day) {
    return createResponse(res, "EmployeeId and day are required");
  }

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Invalid UUID format");
  }

  const DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
  if (!DATE_REGEX.test(day)) {
    return createResponse(res, "Invalid date format");
  } 
  
  const year = day.split("-")[0];
  if (parseInt(year) < 2000 || parseInt(year) > 2050) {
    return createResponse(res, "Year not in 2000-2050 range");
  }

  try {
    const queryValue = `
      WITH recurring_dates AS (
        SELECT generate_series(
          $2::date,
          ($3::text || '-12-31')::date,
          interval '7 days'
        )::date AS date
      ),
      available_time AS (
        WITH all_times AS (
          SELECT generate_series(
            ($2::date || ' 08:00:00.000')::timestamp,
            ($2::date || ' 20:00:00.000')::timestamp,
            interval '15 minutes'
          ) AS possible_time
        )
        SELECT possible_time::time AS time
        FROM all_times
        WHERE possible_time > CURRENT_TIMESTAMP
          AND NOT EXISTS (
            SELECT 1
            FROM "Slot"
            WHERE "startTime" = possible_time
              AND "startTime" >= ($2::date || ' 00:00:00.000')::timestamp
              AND "startTime" <= ($2::date || ' 23:59:59.999')::timestamp
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
        (date::date || ' ' || time::time)::timestamp AS "startTime",
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
        AND "Slot"."startTime" = (date::date || ' ' || time::time)::timestamp
      )
      ORDER BY "startTime"
      ON CONFLICT ("employeeId", "startTime")
      DO NOTHING
      RETURNING *;
    `;

    const addingRecurringSlots = await pool.query(queryValue, [
      employeeId,
      day,
      year
    ]);
    
    if (!addingRecurringSlots.rows.length) {
      return createResponse(res, "Failed to add slots");
    }

    createResponse(res, "New recurring slots have been added", addingRecurringSlots.rows[0]);

  } catch (error) {
    console.error("Failed to add slot:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
 