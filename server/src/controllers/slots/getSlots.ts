import { Request, Response } from "express";
import { SlotsAccumulator } from "../../lib/types";
import { pool } from "../../index";
import { UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: SlotsAccumulator | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const getSlots = async (req: Request, res: Response) => {
  const { employeeId } = req.body as { employeeId: string };

  if (!employeeId) {
    return createResponse(res, "All fields are required: employeeId, day.");
  }
  
  if (!UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Invalid employeeId format in slots. Expected UUID.");
  }
  
  try {
    const queryValue = `
      SELECT *
      FROM "Slots"
      WHERE "employeeId" = $1::uuid 
    `;
    const result = await pool.query(queryValue, [
      employeeId,
    ]);

    if (!result.rows.length) {
      return createResponse(res, "Failed to fetch slots.", { byId: {}, allIds: [] });
    }

    const normalizedResult = result.rows.reduce(
      (acc: SlotsAccumulator, slot) => {
        acc.byId[slot.id] = slot
        acc.allIds.push(slot.id)
        return acc;
      },
      { byId: {}, allIds: [] }
    );

    createResponse(res, "Slots have been fetched.", normalizedResult);

  } catch (error) {
    console.error("Failed to fetch slots:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}                               