import { Request, Response } from "express";
import { pool } from "../../index";
import { createResponse } from "../../utils/createResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { Slot } from "../../types";

export const addSlots = async (req: Request, res: Response) => {
  const { slots } = req.body as { slots: Slot[] };
  
  try {
    validateRequest({ res, endpoint: "addSlots", data: slots });
    
    const slots_id = slots.map(slot => slot.id);
    const slots_type = slots.map(slot => slot.type);
    const slots_start_time = slots.map(slot => slot.startTime);
    const slots_duration = slots.map(slot => `00:${slot.duration.minutes}:00`);
    const slots_recurring = slots.map(slot => slot.recurring) ;
    const slots_created_at = slots.map(slot => slot.createdAt);

    const queryValue = `
      WITH slots_input AS (
        SELECT unnest($2::uuid[]) AS slot_id,
          unnest($3::text[]) AS slot_type,
          unnest($4::timestamp[]) AS slot_start_time,
          unnest($5::INTERVAL[]) AS slot_duration,
          unnest($6::boolean[]) AS slot_recurring,
          unnest($7::timestamp[]) AS slot_created_at
      )
      INSERT INTO "Slots" (
        "id", "employeeId", "type", "startTime", "duration", "recurring", "createdAt", "updatedAt"
      )
      SELECT
        slot_id::uuid AS "id",
        $1::uuid AS "employeeId",
        slot_type::text AS "type",
        slot_start_time::timestamp AS "startTime",
        slot_duration::INTERVAL AS "duration",
        slot_recurring::boolean AS "recurring",
        slot_created_at::timestamp AS "createdAt",
        NOW() 
      FROM slots_input
      RETURNING *;
    `;

    const result = await pool.query(queryValue, [
      slots[0].employeeId,
      slots_id,
      slots_type,
      slots_start_time,
      slots_duration,
      slots_recurring,
      slots_created_at
    ]);

    if (!result) return createResponse(res, "Failed to restore slots");

    validateResult({ res, endpoint: "addSlots", data: result.rows });

    /** Send response */
    const message: string = "Slots have been restored.";
    const data: Slot[] = result.rows;
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    console.error("Failed to restore slots: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
