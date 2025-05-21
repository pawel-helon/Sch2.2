import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { Slot } from "../../types";

export const disableSlotRecurrence = async (req: Request, res: Response) => {
  const { slotId } = req.body as { slotId: string };
  
  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "disableSlotRecurrence", data: slotId
    });
    if (validatingRequest !== "validated") return;
    await pool.query("BEGIN");

    const updatingInitalSlotQueryValue = `
      UPDATE "Slots"
      SET "recurring" = false
      WHERE "id" = $1::uuid
      RETURNING *
    `;

    const updatingInitalSlot = await pool.query(updatingInitalSlotQueryValue, [
      slotId
    ]);

    if (!updatingInitalSlot) return sendResponse(res, "Failed to update initial slot.");

    const deletingSlotsQueryValue = `
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
          (SELECT slot_info.slot_start_date::date + INTERVAL '7 days' FROM slot_info),
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
      RETURNING "id";
    `;

    const deletingSlots = await pool.query(deletingSlotsQueryValue, [
      slotId
    ]);

    if (!deletingSlots) return sendResponse(res, "Failed to delete slots");

    await pool.query("COMMIT");

    /** Validate result. */
    const validatingResult = await validateResult({
      res, endpoint: "disableSlotRecurrence", data: updatingInitalSlot.rows[0]
    });
    if (validatingResult !== "validated") return;

    /** Send response */
    const message: string = "Recurring slot have been disabled.";
    const data: Slot = updatingInitalSlot.rows[0];
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    try {
      await pool.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed: ", rollbackError);
    }
    console.error("Failed to disable recurring slot: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
