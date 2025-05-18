import { Request, Response } from "express";
import { pool } from "../../index";
import { UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: { employeeId: string, date: string, slotIds: string[] } | null = null ) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const deleteSlots = async (req: Request, res: Response) => {
  const { slotIds } = req.body as { slotIds: string[] };

  if (!slotIds || !Array.isArray(slotIds) || !slotIds.length) {
    return createResponse(res, "Missing or invalid slotIds. Expected non-empty array of strings.");
  }
  if (!slotIds.every(slotId => UUID_REGEX.test(slotId))) {
    return createResponse(res, "Invalid id in the slotIds. Expected UUID.");
  }

  try {
    const queryValue = `
      WITH slot_ids AS (
        SELECT unnest($1::uuid[]) AS slot_id
      )
      DELETE
      FROM "Slots"
      WHERE "id" IN (SELECT slot_id FROM slot_ids)
      RETURNING
        "id",
        "employeeId",
        "startTime"
      ;
    `;

    const result = await pool.query(queryValue, [
      slotIds,
    ]);

    if (!result) {
      return createResponse(res, "Failed to delete slots.");
    }

    const employeeId = result.rows[0].employeeId;
    const startTime = result.rows[0].startTime;
    const date = new Date(startTime).toISOString().split('T')[0];
    const ids = result.rows.flatMap(slot => slot.id );

    createResponse(res, "Slot(s) have been deleted.", { employeeId, date, slotIds: ids });

  } catch (error) {
    console.error("Failed to delete slots: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
