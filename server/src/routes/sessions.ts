import express from "express";
import { getWeekSessions } from "../controllers/sessions/getWeekSessions";
import { undoDeleteSession } from "../controllers/sessions/undoDeleteSession";
import { updateSession } from "../controllers/sessions/updateSession";
import { deleteSession } from "../controllers/sessions/deleteSession";

const router = express.Router()

router.post("/get-week-sessions", getWeekSessions);
router.post("/undo-delete-session", undoDeleteSession);
router.put("/update-session", updateSession);
router.delete("/delete-session", deleteSession);

export default router;