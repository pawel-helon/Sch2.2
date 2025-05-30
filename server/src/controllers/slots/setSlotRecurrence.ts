import { Request, Response } from "express";
import { pool } from "../../index";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { Slot } from "../../types";
import { sendResponse } from "../../utils/sendResponse";

export const setSlotRecurrence = async (req: Request, res: Response) => {
  const { slotId } = req.body as { slotId: string };
  
  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "setSlotRecurrence", data: slotId
    });
    if (validatingRequest !== "validated") return;

    await pool.query("BEGIN");

    const updatingInitalSlotQueryValue = `
      UPDATE "Slots"
      SET "recurring" = true
      WHERE "id" = $1::uuid
      RETURNING *
    `;

    const updatingInitalSlot = await pool.query(updatingInitalSlotQueryValue, [
      slotId
    ]);

    if (!updatingInitalSlot) return sendResponse(res, "Failed to update initial slot.");

    const insertingSlotsQueryValue = `
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
      INSERT INTO "Slots" (
        "employeeId", "startTime", "duration", "recurring"
      )
      SELECT
        slot_info.slot_employee_id::uuid AS "employeeId",
        (recurring_dates.recurring_date::date || ' ' || slot_info.slot_start_time::time)::timestamp AS "startTime",
        slot_info.slot_duration AS "duration",
        true AS "recurring"
      FROM slot_info, recurring_dates
      WHERE NOT EXISTS (
        SELECT 1
        FROM "Slots"
        WHERE "employeeId" = slot_info.slot_employee_id::uuid
        AND "startTime" = (recurring_dates.recurring_date::date || ' ' || slot_info.slot_start_time::time)::timestamp
      )
      ON CONFLICT ("employeeId", "startTime")
      DO UPDATE
      SET "recurring" = true
      RETURNING "id";
    `;

    const insertingSlots = await pool.query(insertingSlotsQueryValue, [
      slotId
    ]);
    
    if (!insertingSlots) return sendResponse(res, "Failed to insert slots.");

    await pool.query("COMMIT");

    /** Validate result. */
    const validatingResult = await validateResult({
      res, endpoint: "setSlotRecurrence", data: updatingInitalSlot.rows[0]
    });
    if (validatingResult !== "validated") return;

    /** Send response */
    const message: string = "Recurring slot has been set.";
    const data: Slot = updatingInitalSlot.rows[0];
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    try {
      await pool.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed: ", rollbackError)
    }
    console.error("Failed to set recurring slot: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
