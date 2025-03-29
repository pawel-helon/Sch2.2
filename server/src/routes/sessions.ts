import express from "express";
import { getWeekSessions } from "../controllers/sessions/getWeekSessions";
import { addSession } from "../controllers/sessions/addSession";
import { updateSession } from "../controllers/sessions/updateSession";
import { deleteSession } from "../controllers/sessions/deleteSession";

const router = express.Router()

router.post("/get-week-sessions", getWeekSessions);
router.post("/add-session", addSession);
router.put("/update-session", updateSession);
router.delete("/delete-session", deleteSession);

export default router;