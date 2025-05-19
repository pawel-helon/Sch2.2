import { Request, Response } from "express";
import { NormalizedSlotsRecurringDates } from "../../types";
import { pool } from "../../index";
import { DATE_REGEX, UUID_REGEX } from "../../constants";

const createResponse = (res: Response, message: string, data: NormalizedSlotsRecurringDates | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const getWeekSlotsRecurringDates = async (req: Request, res: Response) => {
  const { employeeId, start, end } = req.body as { employeeId: string, start: string, end: string };

  if (!employeeId || !UUID_REGEX.test(employeeId)) {
    return createResponse(res, "Missing or invalid employeeId. Expected UUID.");
  }
  if (!start || !DATE_REGEX.test(start)) {
    return createResponse(res, "Missing or invalid start. Expected YYYY-MM-DD.");
  }
  if (!end || !DATE_REGEX.test(end)) {
    return createResponse(res, "Missing or invalid end. Expected YYYY-MM-DD.");
  }
  if (new Date() > new Date(end)) {
    return createResponse(res, "Invalid end. Expected non-past date.");
  }
  if (new Date(end).getTime() - new Date(start).getTime() !== 518400000) {
    return createResponse(res, "Invalid start and/or end. Expected dates 6 days apart.")
  }

  try {
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

    if (!result) return createResponse(res, "Failed to fetch slots recurring dates.");

    const normalizedResult = result.rows.reduce(
      (acc: NormalizedSlotsRecurringDates, slot) => {
        acc.byId[slot.id] = slot
        acc.allIds.push(slot.id)
        return acc;
      },
      { byId: {}, allIds: [] }
    );

    createResponse(res, "Slots have been fetched.", normalizedResult);

  } catch (error) {
    console.error("Failed to fetch slots recurring dates: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}                               