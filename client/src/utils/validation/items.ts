import { HOURS, MINUTES, SLOT_DURATIONS, SLOT_TYPES, DATE_REGEX, TIMESTAMP_REGEX, UUID_REGEX } from 'src/constants';

export const validateId = (id: any, item: 'slotId' | 'prevSlotId' | 'slotsRecurringDateId' | 'SlotsRecurringDateEmployeeId' |'sessionId' | 'employeeId' | 'customerId') => {
  if (!id || !UUID_REGEX.test(id)) {
    throw new Error(`Missing or invalid ${item}. Expected UUID.`);
  }
};
export const validateDate = (date: any, item?: 'start' | 'end' | 'slotsRecurringDate') => {
  if (!date || !DATE_REGEX.test(date)) {
    throw new Error(`Missing or invalid ${item} date. Expected YYYY-MM-DD.`);
  }
};
export const validateSlotType = (slotType: any) => {
  if (!slotType || !SLOT_TYPES.includes(slotType)) {
    throw new Error(`Missing or invalid slot type. Expected 'AVAILABLE', 'BLOCKED', or 'BOOKED'.`);
  }
};
export const validateTimeStamp = (timeStamp: any, item: 'startTime' | 'prevStartTime' | 'createdAt' | 'updatedAt') => {
  if (!timeStamp || !TIMESTAMP_REGEX.test(new Date(timeStamp).toISOString())) {
    throw new Error(`Missing or invalid ${item}. Expected Date object.`);
  }
}
export const validateSlotDuration = (slotDuration: any) => {
  if (!slotDuration || !SLOT_DURATIONS.includes(slotDuration.minutes)) {
    throw new Error('Missing or invalid slot duration. Expected { minutes: 30 }, { minutes: 45 }, or { minutes: 60 }.');
  }
};
export const validateSlotRecurring = (slotRecurring: any) => {
  if (typeof slotRecurring !== 'boolean') {
    throw new Error('Missing or invalid slot recurring. Expected a boolean.');
  }
};
export const validateSlotIds = (slotIds: any) => {
  if (!slotIds || !Array.isArray(slotIds) || !slotIds.length) {
    throw new Error('Missing or invalid slotIds. Expected non-empty array of strings.');
  }
  if (!slotIds.every(slotId => UUID_REGEX.test(slotId))) {
    throw new Error('Invalid id in the slotIds. Expected UUID.');
  }
};
export const validateSelectedDays = (selectedDays: any) => {
  if (!Array.isArray(selectedDays) || !selectedDays.length) {
    throw new Error('Missing or invalid selectedDays. Expected non-empty array of dates.');
  }
  if (!selectedDays.every(day => DATE_REGEX.test(day))) {
    throw new Error('Invalid date in selectedDays. Expected YYYY-MM-DD.')
  }
};
export const validateSlotStartTimeHour = (slotStartTimeHour: any) => {
  if (!HOURS.includes(slotStartTimeHour) || typeof slotStartTimeHour !== "number") {
    throw new Error("Missing or invalid hour. Expected number between 0 and 23.");
  }
};
export const validateSlotStartTimeMinutes = (slotStartTimeMinutes: any) => {
  if (!MINUTES.includes(slotStartTimeMinutes) || typeof slotStartTimeMinutes !== "number") {
    throw new Error("Missing or invalid minutes. Expected number between 0 and 59.");
  }
};