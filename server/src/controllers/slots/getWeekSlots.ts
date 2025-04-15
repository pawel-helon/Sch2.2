import { Request, Response } from "express";
import { SlotsAccumulator } from "../../lib/types";
import { pool } from "../../index";
import { DATE_REGEX, UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: SlotsAccumulator | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const getWeekSlots = async (req: Request, res: Response) => {
  const { employeeId, start, end } = req.body as { employeeId: string, start: string, end: string };

  if (!employeeId || !start || !end) {
    return createResponse(res, "All fields are required: employeeId, start, and end dates.");
  }
  
  if (!UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Invalid employeeId format in slots. Expected UUID.");
  }
  
  if (!DATE_REGEX.test(start) || !DATE_REGEX.test(end)) {
    return createResponse(res, "Invalid date format in start and end dates. Expected YYYY-MM-DD.");
  }

  if (new Date() > new Date(end)) {
    return createResponse(res, "Invalid end date. Expected non-past date.");
  }

  if (new Date(end).getTime() - new Date(start).getTime() !== 518400000) {
    return createResponse(res, "Invalid start and end dates. Expected dates 6 days apart.")
  }

  try {
    const queryValue = `
      SELECT *
      FROM "Slots"
      WHERE "employeeId" = $1::uuid 
        AND "startTime" >= ($2::date || ' 00:00:00.000')::timestamp
        AND "startTime" <= ($3::date || ' 23:59:59.999')::timestamp
    `;
    const result = await pool.query(queryValue, [
      employeeId,
      start,
      end
    ]);
    
    if (!result.rows.length) {
      return createResponse(res, "Failed to fetch slots.");
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