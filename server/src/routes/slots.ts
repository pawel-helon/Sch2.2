import express from "express";
import { getWeekSlotsController } from "../controllers/slots/getWeekSlotsController";
import { addSlotController } from "../controllers/slots/addSlotController";
import { addRecurringSlotController } from "../controllers/slots/addRecurringSlotController";

const router = express.Router();

router.get("/get-week-slots", getWeekSlotsController);
router.post("/add-slot", addSlotController);
router.post("/add-recurring-slot", addRecurringSlotController);

export default router;