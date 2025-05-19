import {
  HOURS,
  MINUTES,
  SLOT_DURATIONS,
  SLOT_TYPES,
  DATE_REGEX,
  TIMESTAMP_REGEX,
  UUID_REGEX
} from 'src/constants';

export const validateEmployeeId = (employeeId: any) => {
  if (!employeeId || !UUID_REGEX.test(employeeId)) {
    throw new Error('Missing or invalid employeeId. Expected UUID.');
  }
};
export const validateDay = (day: any) => {
  if (!day || !DATE_REGEX.test(day)) {
    throw new Error('Missing or invalid day. Expected YYYY-MM-DD.');
  }
  if (new Date().getTime() > new Date(new Date(day).setHours(23,59,59,999)).getTime()) {
    throw new Error('Invalid date. Expected non-past date.');
  }
};
export const validateSlotId = (slotId: any) => {
  if (!slotId || !UUID_REGEX.test(slotId)) {
    throw Error('Missing or invalid slot id. Expected UUID.');
  }
};
export const validateSlotType = (slotType: any) => {
  if (!slotType || !SLOT_TYPES.includes(slotType)) {
    throw Error(`Missing or invalid slot type. Expected 'AVAILABLE', 'BLOCKED', or 'BOOKED'.`);
  }
}
export const validateSlotStartTime = (slotStartTime: any) => {
  if (!slotStartTime || !TIMESTAMP_REGEX.test(new Date(slotStartTime).toISOString())) {
    throw Error(`Missing or invalid slot startTime. Expected Date object.`);
  }
};
export const validateSlotDuration = (slotDuration: any) => {
  if (!slotDuration || !SLOT_DURATIONS.includes(slotDuration.minutes)) {
    throw Error(`Missing or invalid slot duration. Expected { minutes: 30 }, { minutes: 45 }, or { minutes: 60 }.`);
  }
};
export const validateSlotRecurring = (slotRecurring: any) => {
  if (typeof slotRecurring !== 'boolean') {
    throw Error (`Missing or invalid slot recurring. Expected a boolean.`);
  }
};
export const validateSlotCreatedAt = (slotCreatedAt: any) => {
  if (!slotCreatedAt || !TIMESTAMP_REGEX.test(new Date(slotCreatedAt).toISOString())) {
    throw Error(`Missing or invalid slot createdAt. Expected Date object.`);
  }
};
export const validateSlotUpdatedAt = (slotUpdatedAt: any) => {
  if (!slotUpdatedAt || !TIMESTAMP_REGEX.test(new Date(slotUpdatedAt).toISOString())) {
    throw Error(`Missing or invalid slot createdAt. Expected Date object.`);
  }
};
export const validateSlotsRecurringDateId = (slotsRecurringDateId: any) => {
  if (!slotsRecurringDateId || !UUID_REGEX.test(slotsRecurringDateId)) {
    throw Error('Missing or invalid slotsRecurringDate id. Expected UUID.');
  }
};
export const validateSlotIds = (slotIds: any) => {
  if (!slotIds || !Array.isArray(slotIds) || !slotIds.length) {
    throw new Error('Missing or invalid slotIds. Expected non-empty array of strings.');
  }
  if (!slotIds.every(slotId => UUID_REGEX.test(slotId))) {
    throw new Error ('Invalid id in the slotIds. Expected UUID.');
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
export const validateSessionId = (sessionId: any) => {
  if (!sessionId || UUID_REGEX.test(sessionId)) {
    throw new Error ('Missing or invalid session id. Expected UUID.')
  }
};
export const validateCustomerId = (customerId: any) => {
  if (!customerId || UUID_REGEX.test(customerId)) {
    throw new Error ('Missing or invalid session customerId. Expected UUID.')
  }
};
export const validateSessionStartTime = (sessionStartTime: any) => {
  if (!sessionStartTime || !TIMESTAMP_REGEX.test(new Date(sessionStartTime).toISOString())) {
    throw Error(`Missing or invalid session startTime. Expected Date object.`);
  }
};
export const validateSessionCreatedAt = (sessiontCreatedAt: any) => {
  if (!sessiontCreatedAt || !TIMESTAMP_REGEX.test(new Date(sessiontCreatedAt).toISOString())) {
    throw Error(`Missing or invalid session createdAt. Expected Date object.`);
  }
};
export const validateSessionUpdatedAt = (sessionUpdatedAt: any) => {
  if (!sessionUpdatedAt || !TIMESTAMP_REGEX.test(new Date(sessionUpdatedAt).toISOString())) {
    throw Error(`Missing or invalid session createdAt. Expected Date object.`);
  }
};
export const validateStart = (start: any) => {
  if (!start || !DATE_REGEX.test(start)) {
    throw new Error('Missing or invalid start. Expected YYYY-MM-DD.');
  }
};
export const validateEnd = (end: any) => {
  if (!end || !DATE_REGEX.test(end)) {
    throw new Error('Missing or invalid end. Expected YYYY-MM-DD.');
  }
};
export const validateSlotsRecurringDateEmployeeId = (slotsRecurringDateEmployeeId: any) => {
  if (!slotsRecurringDateEmployeeId || !UUID_REGEX.test(slotsRecurringDateEmployeeId)) {
    throw Error('Missing or invalid slotsRecurringDate employeeId. Expected UUID.');
  }
};
export const validateSlotsRecurringDateDate = (slotsRecurringDateDate: any) => {
  if (!slotsRecurringDateDate || !TIMESTAMP_REGEX.test(new Date(slotsRecurringDateDate).toISOString())) {
    throw Error(`Missing or invalid slotsRecurringDate date. Expected Date object.`);
  }
};