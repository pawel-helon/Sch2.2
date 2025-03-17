import express from "express";
import { getWeekSlotsController } from "../controllers/slots/getWeekSlotsController";

const router = express.Router();

router.get("/get-week-slots", getWeekSlotsController);

export default router;