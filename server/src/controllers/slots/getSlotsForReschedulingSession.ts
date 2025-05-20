import { Request, Response } from "express";
import { pool } from "../../index";
import { createResponse } from "../../utils/createResponse";
import { validateRequest } from "../../utils/validation/validateRequest";
import { validateResult } from "../../utils/validation/validateResult";
import { NormalizedSlots } from "../../types";

export const getSlotsForReschedulingSession = async (req: Request, res: Response) => {
  const { employeeId } = req.body as { employeeId: string };

  try {
    validateRequest({ res, endpoint: "getSlotsForReschedulingSession", data: employeeId });
    
    const queryValue = `
      SELECT *
      FROM "Slots"
      WHERE "employeeId" = $1::uuid 
        AND "startTime" >= (NOW()::date || ' ' || '00:00:00.000'::time)::timestamp
        AND "startTime" <= (NOW()::date || ' ' || '23:59:59.999'::time)::timestamp
        AND "type" = 'AVAILABLE'
      ;
    `;
    const result = await pool.query(queryValue, [
      employeeId,
    ]);

    if (!result) return createResponse(res, "Failed to fetch slots.");

    const normalizedResult = result.rows.reduce(
      (acc: NormalizedSlots, slot) => {
        acc.byId[slot.id] = slot
        acc.allIds.push(slot.id)
        return acc;
      },
      { byId: {}, allIds: [] }
    );

    validateResult({ res, endpoint: "getSlotsForReschedulingSession", data: normalizedResult });
    
    /** Send response */
    const message: string = "Slots have been fetched.";
    const data: NormalizedSlots = normalizedResult;
    res.format({"application/json": () => {
      res.send({ message, data });
    }});

  } catch (error) {
    console.error("Failed to fetch slots: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}                               