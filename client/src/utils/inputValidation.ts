import { DATE_REGEX, HOUR_REGEX, MINUTES_REGEX, UUID_REGEX } from "src/lib/constants";
import { Session, Slot } from "src/lib/types";

// Slots endpoints validation functions
export const validateGetWeekSlotsInput = (input: { employeeId: string, start: string, end: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, start, end } = input;
  
  if (!employeeId || !start || !end) {
    throw new Error('All fields are required: employeeId, start, end.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!DATE_REGEX.test(start)) {
    throw new Error('Invalid start date format. Expected YYYY-MM-DD.');
  }

  if (!DATE_REGEX.test(end)) {
    throw new Error('Invalid end date format. Expected YYYY-MM-DD.');
  }
}

export const validateAddSlotInput = (input: { employeeId: string, day: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, day } = input;
  
  if (!employeeId || !day) {
    throw new Error('All fields are required: employeeId, day.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!DATE_REGEX.test(day)) {
    throw new Error('Invalid day format. Expected YYYY-MM-DD.');
  }

  if (new Date() > new Date(day)) {
    throw new Error('Invalid date');
  }
}

export const validateAddRecurringSlotInput = (input: { employeeId: string, day: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, day } = input;
  
  if (!employeeId || !day) {
    throw new Error('All fields are required: employeeId, day.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!DATE_REGEX.test(day)) {
    throw new Error('Invalid day format. Expected YYYY-MM-DD.');
  }

  if (new Date() > new Date(day)) {
    throw new Error('Invalid date');
  }
}

export const validateAddSlotsInput = (input: { slots: Slot[] } ): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }

  const { slots } = input;
  
  if (!Array.isArray(slots) || !slots.length) {
    throw new Error('Slots must be a non-empty array.');
  }

  if (!slots.every(slot => slot && typeof slot === 'object')) {
    throw new Error('Each slot must be a valid object.');
  }

  if (!slots.every(slot => slot.id && UUID_REGEX.test(slot.id))) {
    throw new Error('Invalid id format in slots. Expected UUID.');
  }

  if (!slots.every(slot => slot.employeeId && UUID_REGEX.test(slot.employeeId))) {
    throw new Error('Invalid employeeId format in slots. Expected UUID.');
  }

  if (!slots.every(slot => slot.type && (slot.type === 'AVAILABLE' || slot.type === 'BLOCKED' || slot.type !== 'BOOKED'))) {
    throw new Error('Invalid type in slots. Expected AVAILABLE, BLOCKED or BOOKED.');
  }

  if (!slots.every(slot => slot.startTime && slot.startTime instanceof Date)) {
    throw new Error('Invalid startTime format in slots.');
  }

  if (!slots.every(slot => slot.duration && typeof slot.duration === 'string')) {
    throw new Error('Invalid duration format in slots. Expected string.');
  }

  if (!slots.every(slot => typeof slot.recurring === 'boolean')) {
    throw new Error('Invalid recurring format in slots. Expected boolean.');
  }

  if (!slots.every(slot => slot.createdAt && slot.createdAt instanceof Date)) {
    throw new Error('Invalid createdAt format in slots.');
  }

  if (!slots.every(slot => slot.updatedAt && slot.updatedAt instanceof Date)) {
    throw new Error('Invalid updatedAt format in slots.');
  }
}

export const validateUpdateSlotHourInput = (input: { employeeId: string, slotId: string, hour: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, slotId, hour } = input;
  
  if (!employeeId || !slotId || !hour) {
    throw new Error('All fields are required: employeeId, slotId, hour.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slotId format. Expected UUID.');
  }

  if (!HOUR_REGEX.test(hour)) {
    throw new Error('Invalid hour format. Expected HH:MM.');
  }
}

export const validateUpdateRecurringSlotHourInput = (input: { employeeId: string, slotId: string, hour: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, slotId, hour } = input;
  
  if (!employeeId || !slotId || !hour) {
    throw new Error('All fields are required: employeeId, slotId, hour.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slotId format. Expected UUID.');
  }

  if (!HOUR_REGEX.test(hour)) {
    throw new Error('Invalid hour format. Expected HH:MM.');
  }
}

export const validateUpdateSlotMinutesInput = (input: { employeeId: string, slotId: string, minutes: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, slotId, minutes } = input;

  if (!employeeId || !slotId || !minutes) {
    throw new Error('All fields are required: employeeId, slotId, hour.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slotId format. Expected UUID.');
  }

  if (!MINUTES_REGEX.test(minutes)) {
    throw new Error('Invalid minutes format. Expected MM.');
  }
}

export const validateUpdateRecurringSlotMinutesInput = (input: { employeeId: string, slotId: string, minutes: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, slotId, minutes } = input;

  if (!employeeId || !slotId || !minutes) {
    throw new Error('All fields are required: employeeId, slotId, hour.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slotId format. Expected UUID.');
  }

  if (!MINUTES_REGEX.test(minutes)) {
    throw new Error('Invalid minutes format. Expected MM.');
  }
}

export const validateDeleteSlotsInput = (input: { employeeId: string, slotIds: string[] }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, slotIds } = input;

  if (!employeeId || !slotIds) {
    throw new Error('All fields are required: employeeId, slotIds.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!Array.isArray(slotIds) || !slotIds.every(id => UUID_REGEX.test(id))) {
    throw new Error('Invalid slotIds format. Expected an array of UUIDs.');
  }
}

export const validateDuplicateDayInput = (input: { employeeId: string, day: string, selectedDays: string[] }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, day, selectedDays } = input;

  if (!employeeId || !day || !selectedDays) {
    throw new Error('All fields are required: employeeId, day, selectedDays.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!DATE_REGEX.test(day)) {
    throw new Error('Invalid day format. Expected YYYY-MM-DD.');
  }

  if (!Array.isArray(selectedDays) || !selectedDays.every(day => DATE_REGEX.test(day))) {
    throw new Error('Invalid selectedDays format. Expected an array of YYYY-MM-DD dates.');
  }
}

export const validateSetSlotRecurrenceInput = (input: { slotId: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { slotId } = input;

  if (!slotId) {
    throw new Error('slotId is required.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slotId format. Expected UUID.');
  }
}

export const validateDisableSlotRecurrenceInput = (input: { slotId: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { slotId } = input;

  if (!slotId) {
    throw new Error('slotId is required.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slotId format. Expected UUID.');
  }
}

// Sessions endpoints validation functions
export const validateGetWeekSessionsInput = (input: { employeeId: string, start: string, end: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, start, end } = input;
  
  if (!employeeId || !start || !end) {
    throw new Error('All fields are required: employeeId, start, end.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!DATE_REGEX.test(start)) {
    throw new Error('Invalid start date format. Expected YYYY-MM-DD.');
  }

  if (!DATE_REGEX.test(end)) {
    throw new Error('Invalid end date format. Expected YYYY-MM-DD.');
  }
}

export const validateAddSessionInput = (input: { session: Session }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }

  const { session } = input;

  if (!session || typeof session !== 'object') {
    throw new Error('Session is required.');
  }

  if (!session.id || !session.slotId || !session.employeeId || !session.customerId || !session.startTime || !session.createdAt || !session.updatedAt) {
    throw new Error('Required fields: id, slotId, employeeId, customerId, startTime, createdAt, updatedAt.');
  }

  if (!UUID_REGEX.test(session.id)) {
    throw new Error('Invalid session ID format. Expected UUID.');
  }

  if (!UUID_REGEX.test(session.slotId)) {
    throw new Error('Invalid slot ID format. Expected UUID.');
  }
  
  if (!UUID_REGEX.test(session.employeeId)) {
    throw new Error('Invalid employee ID format. Expected UUID.');
  }

  if (!UUID_REGEX.test(session.customerId)) {
    throw new Error('Invalid customer ID format. Expected UUID.');
  }
  
  if (!(session.startTime instanceof Date)) {
    throw new Error('Invalid startTime format. Expected a Date object.');
  }

  if (session.message && typeof session.message !== 'string') {
    throw new Error('Invalid message format. Expected a string.');
  }
  
  if (session.updatedAt instanceof Date) {
    throw new Error('Invalid updateAt format. Expected a Date object.');
  }

  if (session.createdAt instanceof Date) {
    throw new Error('Invalid createdAt format. Expected a Date object.');
  }
}

export const validateUpdateSessionInput = (input: { sessionId: string, slotId: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }

  const { sessionId, slotId } = input;

  if (!sessionId || !slotId) {
    throw new Error('All fields are required: sessionId, slotId.');
  }

  if (!UUID_REGEX.test(sessionId)) {
    throw new Error('Invalid session ID format. Expected UUID.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slot ID format. Expected UUID.');
  }
}

export const validateDeleteSessionInput = (input: { sessionId: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }

  const { sessionId } = input;

  if (!sessionId) {
    throw new Error('sessionId is required.');
  }

  if (!UUID_REGEX.test(sessionId)) {
    throw new Error('Invalid session ID format. Expected UUID.');
  }
}
