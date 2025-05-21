import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";

export const deleteSlots = async (req: Request, res: Response) => {
  const { slotIds } = req.body as { slotIds: string[] };

  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "deleteSlots", data: slotIds
    });
    if (validatingRequest !== "validated") return;
    
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

    if (!result) return sendResponse(res, "Failed to delete slots.");

    const employeeId: string = result.rows[0].employeeId;
    const startTime: Date = result.rows[0].startTime;
    const date: string = new Date(startTime).toISOString().split('T')[0];
    const ids: string[] = result.rows.flatMap(slot => slot.id );

    /** Validate result. */
    const validatingResult = await validateResult({
      res, endpoint: "deleteSlots", data: { employeeId, date, slotIds: ids }
    });
    if (validatingResult !== "validated") return;

    /** Send response */
    const message: string = "Slot(s) have been deleted.";
    const data: { employeeId: string, date: string, slotIds: string[] } = { employeeId, date, slotIds: ids }
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    console.error("Failed to delete slots: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
