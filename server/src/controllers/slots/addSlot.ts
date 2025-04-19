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

export const addSlot = async (req: Request, res: Response) => {
  const { employeeId, day } = req.body as { employeeId: string, day: string};
  
  if (!employeeId || !day) {
    return createResponse(res, "All fields are required: employeeId, day.");
  }

  if (!UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Invalid employeeId format. Expected UUID.");
  }

  if (!DATE_REGEX.test(day)) {
    return createResponse(res, "Invalid day format. Expected YYYY-MM-DD.");
  }

  if (new Date() > new Date(day)) {
    return createResponse(res, "Invalid date. Expected non-past date.");
  }

  try {
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
        ($2::date || ' ' || time::time)::timestamp AS "startTime",
        '30 minutes' AS "duration",
        false AS "recurring",
        NOW() AS "createdAt",
        NOW() AS "updatedAt"
      FROM available_time
      RETURNING *
    `;

    
    const result = await pool.query(queryValue, [
      employeeId,
      day
    ]);
    
    if (!result.rows.length) {
      return createResponse(res, "Failed to add slot.");
    }
    
    createResponse(res, "New slot has been added.", result.rows[0]);

  } catch (error) {
    console.error("Failed to add slot:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
