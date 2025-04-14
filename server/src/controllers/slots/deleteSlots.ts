import { Request, Response } from "express";
import { pool } from "../../index";
import { UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: { date: string, ids: string[] } | null = null ) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const deleteSlots = async (req: Request, res: Response) => {
  const { slotIds } = req.body as { employeeId: string, slotIds: string[] };
  
  if (!slotIds) {
    return createResponse(res, "SlotIds is required.");
  }
  
  if (!Array.isArray(slotIds) || !slotIds.length) {
    return createResponse(res, "SlotIds must be a non-empty array.");
  }

  if (!slotIds.every(slotId => slotId && UUID_REGEX.test(slotId))) {
    return createResponse(res, "Invalid slotId format. Expected UUID.")
  }

  try {
    const gettingSlotsDateQueryValue = `
      SELECT "startTime"::date
      FROM "Slots"
      WHERE "id" = $1:uuid
    `;
    
    const gettingSlotsDate = await pool.query(gettingSlotsDateQueryValue, [
      slotIds[0]
    ])

    if (!gettingSlotsDate.rows.length) {
      createResponse(res, "Failed to get slots date.")
    }

    console.log(gettingSlotsDate.rows[0]);
    
    const deletingSlotsQueryValue = `
      WITH slot_ids AS (
        SELECT unnest($1::uuid[]) AS slot_id
      ),
      DELETE
      FROM "Slots"
      WHERE "id" IN (SELECT slot_id FROM slot_ids)
      RETURNING "id"
    `;

    const deletingSlots = await pool.query(deletingSlotsQueryValue, [
      slotIds,
    ]);

    if (!deletingSlots.rows.length) {
      return createResponse(res, "Failed to delete slots.");
    }

    createResponse(res, "Slots have been deleted.", { date: gettingSlotsDate.rows[0], ids: deletingSlots.rows });

  } catch (error) {
    console.error("Failed to delete slots:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
