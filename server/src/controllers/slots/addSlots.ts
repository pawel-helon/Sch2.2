import { Request, Response } from "express";
import { Slot } from "../../lib/types";
import { pool } from "../../index";

const createResponse = (res: Response, message: string, slot: Slot[] | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      slot
    });
  }});
}

export const addSlots = async (req: Request, res: Response) => {
  const { slots } = req.body as { slots: Slot[] };
  
  if (!Array.isArray(slots) || !slots.length) {
    return createResponse(res, "Invalid input data: slots must be a non-empty array");
  }

  const slots_id = slots.map(slot => slot.id);
  const slots_type = slots.map(slot => slot.type);
  const slots_start_time = slots.map(slot => slot.startTime);
  const slots_duration = slots.map(slot => slot.duration);
  const slots_recurring = slots.map(slot => slot.recurring) ;
  const slots_created_at = slots.map(slot => slot.createdAt);

  try {
    const queryValue = `
      WITH slots_input AS (
        SELECT unnest($2::uuid[]) AS id,
          unnest($3::text[]) AS type,
          unnest($4::timestamp[]) AS start_time,
          unnest($5::interval[]) AS duration,
          unnest($6::boolean[]) AS recurring,
          unnest($7::timestamp[]) AS created_at
      )
      INSERT INTO "Slot" (
        "id", "employeeId", "type", "startTime", "duration", "recurring", "createdAt", "updatedAt"
      )
      SELECT
        id::uuid AS "id",
        $1::uuid AS "employeeId",
        type::text AS "type",
        start_time::timestamp AS "startTime",
        duration::interval AS "duration",
        recurring::boolean AS "recurring",
        created_at::timestamp AS "createdAt",
        NOW() 
      FROM slots_input
      RETURNING *
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

    if (!result.rows.length) {
      return createResponse(res, "Failed to add slots");
    }

    createResponse(res, "Slots have been restored", result.rows);

  } catch (error) {
    console.error("Failed to add slots:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
