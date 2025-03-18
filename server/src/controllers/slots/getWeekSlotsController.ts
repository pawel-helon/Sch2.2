import { Request, Response } from "express";
import { createPool } from "../../db";

export async function getWeekSlotsController(req: Request, res: Response) {
  const { start, end } = req.query as { start: string, end: string };
  const value = `
    SELECT *
    FROM "Slot"
    WHERE "startTime" >= '${start} 00:00:00.000'
      AND "startTime" <= '${end} 23:59:59.999'
  `;
  try {
    const pool = createPool();
    const result = await pool.query(value);
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch slots:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}                               