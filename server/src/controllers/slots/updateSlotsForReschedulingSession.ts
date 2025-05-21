import { Request, Response } from "express";
import { pool } from "../../index";
import { sendResponse } from "../../utils/sendResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { Slot } from "../../types";

export const updateSlotsForReschedulingSession = async (req: Request, res: Response) => {
  const { employeeId, day } = req.body as { employeeId: string, day: string };

  try {
    /** Validate request data. */
    const validatingRequest = await validateRequest({
      res, endpoint: "updateSlotsForReschedulingSession", data: { employeeId, day }
    });
    if (validatingRequest !== "validated") return;

    const queryValue = `
      SELECT *
      FROM "Slots"
      WHERE "employeeId" = $1::uuid 
        AND "startTime" >= ($2::date || ' ' || '00:00:00.000'::time)::timestamp
        AND "startTime" <= ($2::date || ' ' || '23:59:59.999'::time)::timestamp
        AND "type" = 'AVAILABLE'
      ;
    `;

    const result = await pool.query(queryValue, [
      employeeId,
      day
    ]);

    if (!result) return sendResponse(res, "Failed to fetch slots.");

    /** Validate result. */
    const validatingResult = await validateResult({
      res, endpoint: "updateSlotsForReschedulingSession", data: result.rows
    });
    if (validatingResult !== "validated") return;

    /** Send response */
    const message: string = "Slots have been fetched.";
    const data: Slot[] = result.rows;
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    console.error("Failed to fetch slots: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}                               