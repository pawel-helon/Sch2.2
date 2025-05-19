import { Request, Response } from "express";
import { NormalizedSlots } from "../../types";
import { pool } from "../../index";
import { UUID_REGEX } from "../../constants";

const createResponse = (res: Response, message: string, data: NormalizedSlots | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const getSlotsForReschedulingSession = async (req: Request, res: Response) => {
  const { employeeId } = req.body as { employeeId: string };

  if (!employeeId || !UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Missing or invalid employeeId. Expected UUID.");
  }
  
  try {
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

    createResponse(res, "Slots have been fetched.", normalizedResult);

  } catch (error) {
    console.error("Failed to fetch slots: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}                               