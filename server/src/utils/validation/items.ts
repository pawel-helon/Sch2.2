import { Response } from "express";
import { createResponse } from "../createResponse";
import { HOURS, MINUTES, SLOT_DURATIONS, SLOT_TYPES, DATE_REGEX, TIMESTAMP_REGEX, UUID_REGEX } from "../../constants";

export const validateId = (res: Response, id: any, item: "slotId" | "prevSlotId" | "slotsRecurringDateId" | "SlotsRecurringDateEmployeeId" |"sessionId" | "employeeId" | "customerId") => {
  if (!id || !UUID_REGEX.test(id)) {
    return createResponse(res, `Missing or invalid ${item}. Expected UUID.`);
  }
};
export const validateDate = (res: Response, date: any, item?: "start" | "end" | "slotsRecurringDate") => {
  if (!date || !DATE_REGEX.test(date)) {
    return createResponse(res, `Missing or invalid ${item} date. Expected YYYY-MM-DD.`);
  }
};
export const validateSlotType = (res: Response, slotType: any) => {
  if (!slotType || !SLOT_TYPES.includes(slotType)) {
    return createResponse(res, `Missing or invalid slot type. Expected "AVAILABLE", "BLOCKED", or "BOOKED".`);
  }
};
export const validateTimeStamp = (res: Response, timeStamp: any, item: "startTime" | "prevStartTime" | "createdAt" | "updatedAt") => {
  if (!timeStamp || !TIMESTAMP_REGEX.test(new Date(timeStamp).toISOString())) {
    return createResponse(res, `Missing or invalid ${item}. Expected Date object.`);
  }
}
export const validateSlotDuration = (res: Response, slotDuration: any) => {
  if (!slotDuration || !SLOT_DURATIONS.includes(slotDuration.minutes)) {
    return createResponse(res, "Missing or invalid slot duration. Expected { minutes: 30 }, { minutes: 45 }, or { minutes: 60 }.");
  }
};
export const validateSlotRecurring = (res: Response, slotRecurring: any) => {
  if (typeof slotRecurring !== "boolean") {
    return createResponse(res, "Missing or invalid slot recurring. Expected a boolean.");
  }
};
export const validateSlotIds = (res: Response, slotIds: any) => {
  if (!slotIds || !Array.isArray(slotIds) || !slotIds.length) {
    return createResponse(res, "Missing or invalid slotIds. Expected non-empty array of strings.");
  }
  if (!slotIds.every((slotId: any) => UUID_REGEX.test(slotId))) {
    return createResponse(res, "Invalid id in the slotIds. Expected UUID.");
  }
};
export const validateSelectedDays = (res: Response, selectedDays: any) => {
  if (!Array.isArray(selectedDays) || !selectedDays.length) {
    return createResponse(res, "Missing or invalid selectedDays. Expected non-empty array of dates.");
  }
  if (!selectedDays.every((day: any) => DATE_REGEX.test(day))) {
    return createResponse(res, "Invalid date in selectedDays. Expected YYYY-MM-DD.")
  }
};
export const validateSlotStartTimeHour = (res: Response, slotStartTimeHour: any) => {
  if (!HOURS.includes(slotStartTimeHour) || typeof slotStartTimeHour !== "number") {
    return createResponse(res, "Missing or invalid hour. Expected number between 0 and 23.");
  }
};
export const validateSlotStartTimeMinutes = (res: Response, slotStartTimeMinutes: any) => {
  if (!MINUTES.includes(slotStartTimeMinutes) || typeof slotStartTimeMinutes !== "number") {
    return createResponse(res, "Missing or invalid minutes. Expected number between 0 and 59.");
  }
};