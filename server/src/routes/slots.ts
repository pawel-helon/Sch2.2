import express from "express";
import { getWeekSlots } from "../controllers/slots/getWeekSlots";
import { addSlot } from "../controllers/slots/addSlot";
import { addRecurringSlot } from "../controllers/slots/addRecurringSlot";
import { addSlots } from "../controllers/slots/addSlots";
import { updateSlotHour } from "../controllers/slots/updateSlotHour";
import { updateRecurringSlotHour } from "../controllers/slots/updateRecurringSlotHour";
import { updateSlotMinutes } from "../controllers/slots/updateSlotMinutes";
import { updateRecurringSlotMinutes } from "../controllers/slots/updateRecurringSlotMinutes";
import { deleteSlots } from "../controllers/slots/deleteSlots";

const router = express.Router();

router.post("/get-week-slots", getWeekSlots);
router.post("/add-slot", addSlot);
router.post("/add-recurring-slot", addRecurringSlot);
router.post("/add-slots", addSlots);
router.put("/update-slot-hour", updateSlotHour);
router.put("/update-recurring-slot-hour", updateRecurringSlotHour);
router.put("/update-slot-minutes", updateSlotMinutes);
router.put("/update-recurring-slot-minutes", updateRecurringSlotMinutes);
router.delete("/delete-slots", deleteSlots);

export default router;