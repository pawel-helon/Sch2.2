import { Request, Response } from "express";
import { pool } from "../../index";
import { UUID_REGEX } from "../../lib/constants";

const createResponse = (res: Response, message: string, data: string | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      data
    });
  }});
}

export const deleteSession = async (req: Request, res: Response) => {
  const { id: sessionId } = req.body as { id: string };

  if (!sessionId) {
    return createResponse(res, "Id is required");
  }
  
  if (!UUID_REGEX.test(sessionId)) {
    return createResponse(res, "Invalid UUID format");
  }

  try {
    const queryValue = `
      DELETE
      FROM "Sessions"
      WHERE "id" = $1::uuid
      RETURNING "id"
    `;

    const result = await pool.query(queryValue, [
      sessionId
    ]);

    if (!result.rows.length) {
      return createResponse(res, "Failed to delete session");
    }

    createResponse(res, "Session has been deleted", result.rows[0].id);

  } catch (error) {
    console.error("Failed to delete session:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
