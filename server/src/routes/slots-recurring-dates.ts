import express from "express";
import { getWeekSlotsRecurringDates } from "../controllers/slots-recurring-dates/getWeekSlotsRecurringDates";

const router = express.Router();

router.post("/get-week-slots-recurring-dates", getWeekSlotsRecurringDates);

export default router;