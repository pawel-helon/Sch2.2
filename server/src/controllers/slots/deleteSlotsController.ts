import { Request, Response } from "express";
import { pool } from "../../index";

const createResponse = (res: Response, message: string, slotIds: string[] | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      slotIds
    });
  }});
}

export const deleteSlotsController = async (req: Request, res: Response) => {
  const { employeeId, slotIds } = req.body as { employeeId: string, slotIds: string[] };
  
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Invalid UUID format");
  }

  if (!Array.isArray(slotIds) || slotIds.length === 0) {
    return createResponse(res, "slotIds must be a non-empty array");
  }

  for (const slotId of slotIds) {
    if (!UUID_REGEX.test(slotId)) {
      return createResponse(res, "Invalid UUID format");
    }
  }

  try {
    const queryValue = `
      WITH slot_ids AS (
        SELECT unnest($1::uuid[]) AS slot_id
      )
      DELETE
      FROM "Slot"
      WHERE "id" IN (SELECT slot_id FROM slot_ids)
        AND "employeeId" = $2::uuid 
      RETURNING "id"
    `;

    const result = await pool.query(queryValue, [
      slotIds,
      employeeId
    ]);

    if (!result.rows.length) {
      return createResponse(res, "Failed to delete slots");
    }

    createResponse(res, "Slots have been deleted", result.rows);

  } catch (error) {
    console.error("Failed to delete slots:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
