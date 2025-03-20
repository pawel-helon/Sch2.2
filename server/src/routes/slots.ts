import express from "express";
import { getWeekSlotsController } from "../controllers/slots/getWeekSlotsController";
import { addSlotController } from "../controllers/slots/addSlotController";
import { addRecurringSlotController } from "../controllers/slots/addRecurringSlotController";
import { updateSlotHourController } from "../controllers/slots/updateSlotHourController";
import { updateRecurringSlotHourController } from "../controllers/slots/updateRecurringSlotHourController";
import { updateSlotMinutesController } from "../controllers/slots/updateSlotMinutesController";
import { updateRecurringSlotMinutesController } from "../controllers/slots/updateRecurringSlotMinutesController";

const router = express.Router();

router.post("/get-week-slots", getWeekSlotsController);
router.post("/add-slot", addSlotController);
router.post("/add-recurring-slot", addRecurringSlotController);
router.put("/update-slot-hour", updateSlotHourController);
router.put("/update-recurring-slot-hour", updateRecurringSlotHourController);
router.put("/update-slot-minutes", updateSlotMinutesController);
router.put("/update-recurring-slot-minutes", updateRecurringSlotMinutesController);

export default router;