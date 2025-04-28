import { Request, Response } from "express";
import { Slot } from "../../lib/types";
import { pool } from "../../index";
import { DATE_REGEX, UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: Slot | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const addRecurringSlot = async (req: Request, res: Response) => {
  const { employeeId, day } = req.body as { employeeId: string, day: string };
  
  if (!employeeId || !day) {
    return createResponse(res, "All fields are required: employeeId, day.");
  }
  
  if (!UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Invalid employeeId format. Expected UUID.");
  }
  
  if (!DATE_REGEX.test(day)) {
    return createResponse(res, "Invalid day format. Expected YYYY-MM-DD.");
  }
  
  if (new Date().getTime() > new Date(new Date(day).setHours(23,59,59,999)).getTime()) {
    return createResponse(res, "Invalid date. Expected non-past date.");
  }

  try {
    const queryValue = `
      WITH recurring_dates AS (
        WITH recurring_dates_year AS (
          SELECT EXTRACT (YEAR FROM $2::date) as year
        )
        SELECT generate_series(
          $2::date,
          (year || '-12-31')::date,
          interval '7 days'
        )::date AS date
        FROM recurring_dates_year
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
            FROM "Slots"
            WHERE "startTime" = possible_time
              AND "startTime" >= ($2::date || ' 00:00:00.000')::timestamp
              AND "startTime" <= ($2::date || ' 23:59:59.999')::timestamp
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
        (date::date || ' ' || time::time)::timestamp AS "startTime",
        '30 minutes' AS "duration",
        true AS "recurring",
        NOW() AS "createdAt",
        NOW() AS "updatedAt"
      FROM recurring_dates, available_time
      WHERE NOT EXISTS (
        SELECT 1
        FROM "Slots"
        WHERE "Slots"."employeeId" = $1::uuid
        AND "Slots"."startTime" = (date::date || ' ' || time::time)::timestamp
      )
      ORDER BY "startTime"
      ON CONFLICT ("employeeId", "startTime")
      DO UPDATE
      SET "recurring" = true
      RETURNING *;
    `;

    const result = await pool.query(queryValue, [
      employeeId,
      day,
    ]);
    
    if (!result.rows.length) {
      return createResponse(res, "Failed to add slots.");
    }

    createResponse(res, "New recurring slots have been added.", result.rows[0]);

  } catch (error) {
    console.error("Failed to add recurring slot:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
