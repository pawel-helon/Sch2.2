import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { Slot } from "../../types";

export const duplicateDay = async (req: Request, res: Response) => {
  const { employeeId, day, selectedDays } = req.body as { employeeId: string, day: string, selectedDays: string[] };

  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "duplicateDay", data: { employeeId, day, selectedDays }
    });
    if (validatingRequest !== "validated") return;

    const queryValue = `
      WITH slots_info AS (
        SELECT
          "startTime"::time AS slot_start_time,
          "duration" AS slot_duration,
          "recurring" AS slot_recurring
        FROM "Slots"
        WHERE "employeeId" = $1::uuid
          AND "startTime" >= ($2::date || ' 00:00:00.000')::timestamp
          AND "startTime" <= ($2::date || ' 23:59:59.999')::timestamp
      ),
      selected_days AS (
        SELECT unnest($3::text[]) AS selected_day
      )
      INSERT INTO "Slots" (
        "employeeId", "startTime", "duration", "recurring"
      )
      SELECT
        $1::uuid AS "employeeId",
        (selected_day::date || ' ' || slots_info.slot_start_time::time)::timestamp AS "startTime",
        slots_info.slot_duration AS "duration",
        slots_info.slot_recurring AS "recurring" 
      FROM slots_info, selected_days
      WHERE NOT EXISTS (
        SELECT 1
        FROM "Slots"
        WHERE "employeeId" = $1::uuid
        AND "startTime" = (selected_day::date || ' ' || slots_info.slot_start_time::time)::timestamp
      )
      ON CONFLICT ("employeeId", "startTime")
      DO NOTHING
      RETURNING *;
    `;

    const result = await pool.query(queryValue, [
      employeeId,
      day,
      selectedDays
    ]);

    if (!result) return sendResponse(res, "Failed to duplicate day.")

    /** Validate result. */
    const validatingResult = await validateResult({
      res, endpoint: "duplicateDay", data: result.rows
    });
    if (validatingResult !== "validated") return;

    /** Send response */
    const message: string = "Day has been duplicated.";
    const data: Slot[] = result.rows[0];
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    console.error("Failed to duplicate day: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
