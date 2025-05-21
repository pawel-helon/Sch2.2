import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { NormalizedSlots } from "../../types";

export const getWeekSlots = async (req: Request, res: Response) => {
  const { employeeId, start, end } = req.body as { employeeId: string, start: string, end: string };

  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "getWeekSlots", data: { employeeId, start, end }
    });
    if (validatingRequest !== "validated") return;

    await pool.query("BEGIN");

    const deletingPastSlotsQueryValue = `
      DELETE FROM "Slots"
      WHERE "employeeId" = $1::uuid
        AND "startTime" < NOW()
      RETURNING "id";
    `;

    const deletingPastSlots = await pool.query(deletingPastSlotsQueryValue, [
      employeeId
    ]);

    if (!deletingPastSlots) return sendResponse(res, "Failed to delete past slots.");
    
    const fetchingSlotsQueryValue = `
      SELECT *
      FROM "Slots"
      WHERE "employeeId" = $1::uuid 
        AND "startTime" >= ($2::date || ' 00:00:00.000')::timestamp
        AND "startTime" <= ($3::date || ' 23:59:59.999')::timestamp
      ;
    `;
    const fetchingSlots = await pool.query(fetchingSlotsQueryValue, [
      employeeId,
      start,
      end
    ]);

    if (!fetchingSlots) return sendResponse(res, "Failed to fetch slots.");

    await pool.query("COMMIT");

    const normalizedResult = fetchingSlots.rows.reduce(
      (acc: NormalizedSlots, slot) => {
        acc.byId[slot.id] = slot
        acc.allIds.push(slot.id)
        return acc;
      },
      { byId: {}, allIds: [] }
    );

    /** Validate normalized result. */
    const validatingResult = await validateResult({
      res, endpoint: "getWeekSlots", data: normalizedResult
    });
    if (validatingResult !== "validated") return;

    /** Send response */
    const message: string = "Slots have been fetched.";
    const data: NormalizedSlots = normalizedResult;
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    try {
      await pool.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed: ", rollbackError);
    }
    console.error("Failed to fetch slots: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
