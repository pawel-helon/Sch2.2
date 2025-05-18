import { HOURS, MINUTES, SLOT_DURATIONS, SLOT_TYPES } from 'src/constants/data';
import { DATE_REGEX, TIMESTAMP_REGEX, UUID_REGEX } from 'src/constants/regex';

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
}

export const validateSlotStartTimeHour = (slotStartTimeHour: any) => {
  if (!HOURS.includes(slotStartTimeHour) || typeof slotStartTimeHour !== "number") {
    throw new Error("Missing or invalid hour. Expected number between 0 and 23.");
  }
}

export const validateSlotStartTimeMinutes = (slotStartTimeMinutes: any) => {
  if (!MINUTES.includes(slotStartTimeMinutes) || typeof slotStartTimeMinutes !== "number") {
    throw new Error("Missing or invalid. Expected number between 0 and 59.");
  }
}