import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { NormalizedSlotsRecurringDates } from "../../types";

export const getWeekSlotsRecurringDates = async (req: Request, res: Response) => {
  const { employeeId, start, end } = req.body as { employeeId: string, start: string, end: string };

  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "getWeekSlotsRecurringDates", data: { employeeId, start, end }
    });
    if (validatingRequest !== "validated") return;

    const queryValue = `
      SELECT "id", "employeeId", "date"::text
      FROM "SlotsRecurringDates"
      WHERE "employeeId" = $1::uuid 
        AND "date" >= $2::date
        AND "date" <= $3::date
      ;
    `;

    const result = await pool.query(queryValue, [
      employeeId,
      start,
      end
    ]);

    if (!result) return sendResponse(res, "Failed to fetch slots recurring dates.");

    const normalizedResult = result.rows.reduce(
      (acc: NormalizedSlotsRecurringDates, slot) => {
        acc.byId[slot.id] = slot
        acc.allIds.push(slot.id)
        return acc;
      },
      { byId: {}, allIds: [] }
    );

    /** Validate normalized result. */
    const validatingResult = await validateResult({
      res, endpoint: "getWeekSlotsRecurringDates", data: normalizedResult
    });
    if (validatingResult !== "validated") return;
    
    /** Send response */
    const message: string = "Slots have been fetched.";
    const data: NormalizedSlotsRecurringDates = normalizedResult;
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    console.error("Failed to fetch slots recurring dates: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}