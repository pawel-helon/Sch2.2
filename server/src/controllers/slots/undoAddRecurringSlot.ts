import { Request, Response } from "express";
import { pool } from "../../index";
import { createResponse } from "../../utils/createResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { Slot } from "../../types";

export const undoAddRecurringSlot = async (req: Request, res: Response) => {
  const { slotId } = req.body as { employeeId: string, slotId: string };
  
  try {
    validateRequest({res, endpoint: "undoAddRecurringSlot", data: slotId});
    
    const queryValue = `
      WITH slot_info AS (
        SELECT
          "employeeId"::uuid AS slot_employee_id,
          "startTime"::time AS slot_start_time,
          "startTime"::date AS slot_start_date,
          EXTRACT(YEAR FROM "startTime") AS slot_year,
          "duration" AS slot_duration
        FROM "Slots"
        WHERE "id" = $1::uuid
      ),
      recurring_dates AS (
        SELECT generate_series(
          (SELECT slot_info.slot_start_date::date FROM slot_info),
          ((SELECT slot_info.slot_year FROM slot_info)::text || '-12-31')::date,
          INTERVAL '7 days'
        )::date AS recurring_date
      )
      DELETE FROM "Slots"
      WHERE "employeeId" = (SELECT slot_employee_id FROM slot_info)::uuid
      AND "startTime" IN (
        SELECT (recurring_date::date || ' ' || slot_info.slot_start_time::time)::timestamp
        FROM recurring_dates
        CROSS JOIN slot_info
      )
      RETURNING *;
    `;

    const result = await pool.query(queryValue, [
      slotId
    ]);

    if (!result) return createResponse(res, "Failed to undo add recurring slot.");

    validateResult({ res, endpoint: "undoAddRecurringSlot", data: result.rows[0] });

    /** Send response */
    const message: string = "Adding recurring slot has been undone.";
    const data: Slot = result.rows[0];
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    console.error("Failed to undo add recurring slot: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
