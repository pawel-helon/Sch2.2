import { Request, Response } from "express";
import { Slot } from "../../lib/types";
import { createPool } from "../../db";
import { capitalizeFirstLetter, getHoursAndMinutes, getNameOfDay, getSlotTime } from "../../lib/helpers";

function createResponse(res: Response, message: string, slot: Slot | []) {
  res.format({"application/json" () {
    res.send({
      message,
      slot
    });
  }});
}

async function getAvailableTimes(day: string) {
  const allTimes = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      allTimes.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
  }

  const pool = createPool();
  const value = `
    SELECT "startTime"
    FROM "Slot"
    WHERE "startTime" >= '${day} 00:00:00.000'
      AND "startTime" <= '${day} 23:59:59.999'
  `;
  const result = await pool.query(value)

  const unavailableTimes: string[] = [];
  for (const slot of result.rows) {
    unavailableTimes.push(getSlotTime(slot.startTime));
  }

  const availableTimes = allTimes.filter((time) => !unavailableTimes.includes(time) && new Date(`${day}T${time}`) > new Date());
  return availableTimes[0];
}

export async function addSlotController(req: Request, res: Response) {
  const { employeeId, day } = req.body as { employeeId: string, day: string };
  
  try {
    const firstAvailableTime = await getAvailableTimes(day);

    if (!firstAvailableTime.length) {
      return createResponse(res, "No available times", []);
    }
    
    const pool = createPool();
    const queryText = `
      INSERT INTO "Slot" (
        "employeeId", "type", "startTime", "duration", "recurring", "createdAt", "updatedAt"
      )
      SELECT
        $1::uuid AS "employeeId",
        'AVAILABLE' AS "type",
        $2::timestamp AS "startTime",
        '30 minutes' AS "duration",
        false AS "recurring",
        NOW() AS "createdAt",
        NOW() AS "updatedAt"
      RETURNING *;
    `;
    const result = await pool.query(queryText, [
      employeeId,
      `${day} ${firstAvailableTime}`
    ]);

    if (!result.rows.length) {
      return createResponse(res, "Failed to add slot", []);
    }

    createResponse(
      res,
      `New slot has been added on ${capitalizeFirstLetter(getNameOfDay(day))} at ${getHoursAndMinutes(new Date(result.rows[0].dateTime))}`,
      result.rows[0]
    );

  } catch (error) {
    console.error("Failed to add slot:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
