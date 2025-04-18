import express from "express";
import { getWeekSlots } from "../controllers/slots/getWeekSlots";
import { addSlot } from "../controllers/slots/addSlot";
import { addRecurringSlot } from "../controllers/slots/addRecurringSlot";
import { undoAddRecurringSlot } from "../controllers/slots/undoAddRecurringSlot";
import { addSlots } from "../controllers/slots/addSlots";
import { updateSlotHour } from "../controllers/slots/updateSlotHour";
import { updateRecurringSlotHour } from "../controllers/slots/updateRecurringSlotHour";
import { updateSlotMinutes } from "../controllers/slots/updateSlotMinutes";
import { updateRecurringSlotMinutes } from "../controllers/slots/updateRecurringSlotMinutes";
import { deleteSlots } from "../controllers/slots/deleteSlots";
import { duplicateDay } from "../controllers/slots/duplicateDay";
import { setSlotRecurrence } from "../controllers/slots/setSlotRecurrence";
import { disableSlotRecurrence } from "../controllers/slots/disableSlotRecurrence";

const router = express.Router();

router.post("/get-week-slots", getWeekSlots);
router.post("/add-slot", addSlot);
router.post("/add-recurring-slot", addRecurringSlot);
router.post("/undo-add-recurring-slot", undoAddRecurringSlot)
router.post("/add-slots", addSlots);
router.put("/update-slot-hour", updateSlotHour);
router.put("/update-recurring-slot-hour", updateRecurringSlotHour);
router.put("/update-slot-minutes", updateSlotMinutes);
router.put("/update-recurring-slot-minutes", updateRecurringSlotMinutes);
router.delete("/delete-slots", deleteSlots);
router.post("/duplicate-day", duplicateDay);
router.post("/set-slot-recurrence", setSlotRecurrence);
router.post("/disable-slot-recurrence", disableSlotRecurrence);

export default router;