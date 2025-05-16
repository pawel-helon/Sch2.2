import { Request, Response } from "express";
import { NormalizedSlots } from "../../lib/types";
import { pool } from "../../index";
import { DATE_REGEX, UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: NormalizedSlots | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const getWeekSlots = async (req: Request, res: Response) => {
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

    if (!deletingPastSlots) createResponse(res, "Failed to delete past slots.");
    
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

    await pool.query("COMMIT");

    if (!fetchingSlots) return createResponse(res, "Failed to fetch slots.");

    const normalizedResult = fetchingSlots.rows.reduce(
      (acc: NormalizedSlots, slot) => {
        acc.byId[slot.id] = slot
        acc.allIds.push(slot.id)
        return acc;
      },
      { byId: {}, allIds: [] }
    );

    createResponse(res, "Slots have been fetched.", normalizedResult);

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
