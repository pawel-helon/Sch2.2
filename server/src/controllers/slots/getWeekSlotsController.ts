import { QueryResult } from "pg";
import { Request, Response } from "express";
import { createPool } from "../../db";

interface Slot {
  id: string;
  employeeId: string;
  type: "AVAILABLE" | "BLOCKED" | "BOOKED";
  startTime: Date;
  duration: string;
  recurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getWeekSlotsController(req: Request, res: Response) {
  const { start, end } = req.query as { start: string, end: string };
  try {
    const pool = createPool();
    const result = await pool.query(
      `SELECT * FROM "Slot" WHERE "startTime" >= '${start} 00:00:00' AND "startTime" <= '${end} 23:59:59'`
    ) as QueryResult<Slot[]>
    console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch slots:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}                               