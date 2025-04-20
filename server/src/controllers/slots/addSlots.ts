import { Request, Response } from "express";
import { Slot, SlotsAccumulator } from "../../lib/types";
import { pool } from "../../index";
import { TIMESTAMP_REGEX, UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: SlotsAccumulator | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const addSlots = async (req: Request, res: Response) => {
  const { slots } = req.body as { slots: Slot[] };

  if (!Array.isArray(slots) || !slots.length) {
    return createResponse(res, "Slots must be a non-empty array.");
  }

  if (!slots.every(slot => slot && typeof slot === 'object')) {
    return createResponse(res, "Each slot must be a valid object.");
  }

  if (!slots.every(slot => slot.id && UUID_REGEX.test(slot.id))) {
    return createResponse(res, "Invalid id format in slots. Expected UUID.");
  }

  if (!slots.every(slot => slot.employeeId && UUID_REGEX.test(slot.employeeId))) {
    return createResponse(res, "Invalid employeeId format in slots. Expected UUID.");
  }

  if (!slots.every(slot => slot.type && (slot.type === "AVAILABLE" || slot.type === "BLOCKED" || slot.type === "BOOKED"))) {
    return createResponse(res, "Invalid type in slots. Expected AVAILABLE, BLOCKED or BOOKED.");
  }

  if (!slots.every(slot => slot.startTime && TIMESTAMP_REGEX.test(new Date(slot.startTime).toISOString()))) {
    return createResponse(res, "Invalid startTime format in slots.");
  }

  if (!slots.every(slot => slot.duration && typeof slot.duration === "string")) {
    return createResponse(res, "Invalid duration format in slots. Expected string.");
  }

  if (!slots.every(slot => typeof slot.recurring === "boolean")) {
    return createResponse(res, "Invalid recurring format in slots. Expected boolean.");
  }

  if (!slots.every(slot => slot.createdAt && TIMESTAMP_REGEX.test(new Date(slot.createdAt).toISOString()))) {
    return createResponse(res, "Invalid createdAt format in slots.");
  }

  if (!slots.every(slot => slot.updatedAt && TIMESTAMP_REGEX.test(new Date(slot.updatedAt).toISOString()))) {
    return createResponse(res, "Invalid updatedAt format in slots.");
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
        SELECT unnest($2::uuid[]) AS slot_id,
          unnest($3::text[]) AS slot_type,
          unnest($4::timestamp[]) AS slot_start_time,
          unnest($5::interval[]) AS slot_duration,
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
        slot_duration::interval AS "duration",
        slot_recurring::boolean AS "recurring",
        slot_created_at::timestamp AS "createdAt",
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
      return createResponse(res, "Failed to add slots.");
    }

    const normalizedResult = result.rows.reduce(
      (acc: SlotsAccumulator, slot) => {
        acc.byId[slot.id] = slot
        acc.allIds.push(slot.id)
        return acc;
      },
      { byId: {}, allIds: [] }
    );

    createResponse(res, "Slots have been restored.", normalizedResult);

  } catch (error) {
    console.error("Failed to add slots:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
