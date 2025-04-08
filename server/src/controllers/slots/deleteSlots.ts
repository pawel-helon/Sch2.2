import { Request, Response } from "express";
import { pool } from "../../index";
import { UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: string[] | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const deleteSlots = async (req: Request, res: Response) => {
  const { employeeId, slotIds } = req.body as { employeeId: string, slotIds: string[] };
  
  if (!employeeId || !slotIds) {
    return createResponse(res, "All fields are required: employeeId, slotIds.");
  }
  
  if (!UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Invalid employeeId format. Expected UUID.");
  }

  if (!Array.isArray(slotIds) || !slotIds.length) {
    return createResponse(res, "Slot ids must be a non-empty array.");
  }

  if (!slotIds.every(slotId => slotId && UUID_REGEX.test(slotId))) {
    return createResponse(res, "Invalid slotId format. Expected UUID.")
  }

  try {
    const queryValue = `
      WITH slot_ids AS (
        SELECT unnest($1::uuid[]) AS slot_id
      )
      DELETE
      FROM "Slots"
      WHERE "id" IN (SELECT slot_id FROM slot_ids)
        AND "employeeId" = $2::uuid 
      RETURNING "id"
    `;

    const result = await pool.query(queryValue, [
      slotIds,
      employeeId
    ]);

    if (!result.rows.length) {
      return createResponse(res, "Failed to delete slots.");
    }

    createResponse(res, "Slots have been deleted.", result.rows);

  } catch (error) {
    console.error("Failed to delete slots:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
