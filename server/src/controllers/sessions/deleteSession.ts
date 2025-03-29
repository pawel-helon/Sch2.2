import { Request, Response } from "express";
import { pool } from "../../index";

const createResponse = (res: Response, message: string, sessionId: string | null = null) => {
  res.format({"application/json": () => {
    res.send({
      message,
      sessionId
    });
  }});
}

export const deleteSession = async (req: Request, res: Response) => {
  const { id: sessionId } = req.body as { id: string };

  if (!sessionId) {
    return createResponse(res, "Id is required");
  }
  
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(sessionId)) {
    return createResponse(res, "Invalid UUID format");
  }

  try {
    const queryValue = `
      DELETE
      FROM "Session"
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
