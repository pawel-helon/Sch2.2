import { Request, Response } from "express";
import { Slot } from "../../lib/types";
import { createPool } from "../../db";
import { capitalizeFirstLetter, getNameOfDay, getSlotTime } from "../../lib/helpers";

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

function getRecurringDates(date: string | Date) {
  const endOfYear = new Date(new Date(date).getFullYear(), 11, 31, 23, 59, 999);
  const currentRecurringDate = new Date(new Date(date).setDate(new Date(date).getDate() + 7));
  
  const recurringDates = [];
  recurringDates.push(date);
  
  while (currentRecurringDate <= endOfYear) {
    const day = `${String(new Date(currentRecurringDate).getFullYear())}-${String(new Date(currentRecurringDate).getMonth() + 1).padStart(2, '0')}-${String(new Date(currentRecurringDate).getDate()).padStart(2, '0')}`;
    recurringDates.push(day);
    currentRecurringDate.setDate(currentRecurringDate.getDate() + 7);
  }
  
  return recurringDates;
}


export async function addRecurringSlotController(req: Request, res: Response) {
  const { employeeId, day } = req.body as { employeeId: string, day: string };
  const pool = createPool();
  try {
    const firstAvailableTime = await getAvailableTimes(day);
    const recurringDates = getRecurringDates(day);
    const startTimes = recurringDates.map(date => `${date} ${firstAvailableTime}`);

    const queryText = `
      INSERT INTO "Slot" (
        "employeeId", "type", "startTime", "duration", "recurring", "createdAt", "updatedAt"
      )
      SELECT
        $1 AS "employeeId",
        'AVAILABLE' AS "type",
        unnest($2::timestamp[]) AS "startTime",
        '30 minutes' AS "duration",
        false AS "recurring",
        NOW() AS "createdAt",
        NOW() AS "updatedAt"
      --handling existing slots
      ON CONFLICT ("employeeId", "startTime")
      DO UPDATE SET
        "updatedAt" = NOW()
      RETURNING *;
    `;

    const addingSlots = await pool.query(queryText, [
      employeeId,
      startTimes
    ]);

    if (!addingSlots.rows.length) {
      return createResponse(res, "Failed to add slots", []);
    }
    
    createResponse(
      res,
      `New recurring slots have been added on ${capitalizeFirstLetter(getNameOfDay(day))}s at ${firstAvailableTime}`,
      addingSlots.rows[0]
    );

  } catch (error) {
    console.error("Failed to add slot:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
