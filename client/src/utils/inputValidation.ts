import { DATE_REGEX, TIMESTAMP_REGEX, UUID_REGEX } from "src/lib/constants";
import { Session, Slot } from "src/lib/types";

// Slots inputs validation functions
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

  if (!slots.every(slot => slot.startTime && TIMESTAMP_REGEX.test(new Date(slot.startTime).toISOString()))) {
    throw new Error('Invalid startTime format in slots.');
  }

  if (!slots.every(slot => slot.duration && typeof slot.duration === 'string')) {
    throw new Error('Invalid duration format in slots. Expected string.');
  }

  if (!slots.every(slot => typeof slot.recurring === 'boolean')) {
    throw new Error('Invalid recurring format in slots. Expected boolean.');
  }

  if (!slots.every(slot => slot.createdAt && TIMESTAMP_REGEX.test(new Date(slot.createdAt).toISOString()))) {
    throw new Error('Invalid createdAt format in slots.');
  }

  if (!slots.every(slot => slot.updatedAt && TIMESTAMP_REGEX.test(new Date(slot.updatedAt).toISOString()))) {
    throw new Error('Invalid updatedAt format in slots.');
  }
}

export const validateUpdateSlotHourInput = (input: { employeeId: string, slotId: string, hour: number }): void => {
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

  if (hour < 0 || hour > 23 || typeof hour !== "number") {
    throw new Error("Invalid hour. Expected number between 0 and 23.");
  }
}

export const validateUpdateRecurringSlotHourInput = (input: { employeeId: string, slotId: string, hour: number }): void => {
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

  if (hour < 0 || hour > 23 || typeof hour !== "number") {
    throw new Error("Invalid hour. Expected number between 0 and 23.");
  }
}

export const validateUpdateSlotMinutesInput = (input: { employeeId: string, slotId: string, minutes: number }): void => {
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

  if (minutes < 0 || minutes > 59 || typeof minutes !== "number") {
    throw new Error('Invalid minutes format. Expected MM.');
  }
}

export const validateUpdateRecurringSlotMinutesInput = (input: { employeeId: string, slotId: string, minutes: number }): void => {
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

  if (minutes < 0 || minutes > 59 || typeof minutes !== "number") {
    throw new Error('Invalid minutes format. Expected MM.');
  }
}

export const validateDeleteSlotsInput = (input: { slots: Slot[] }): void => {
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

  if (!slots.every(slot => slot.startTime && TIMESTAMP_REGEX.test(new Date(slot.startTime).toISOString()))) {
    throw new Error('Invalid startTime format in slots.');
  }

  if (!slots.every(slot => slot.duration && typeof slot.duration === 'string')) {
    throw new Error('Invalid duration format in slots. Expected string.');
  }

  if (!slots.every(slot => typeof slot.recurring === 'boolean')) {
    throw new Error('Invalid recurring format in slots. Expected boolean.');
  }

  if (!slots.every(slot => slot.createdAt && TIMESTAMP_REGEX.test(new Date(slot.createdAt).toISOString()))) {
    throw new Error('Invalid createdAt format in slots.');
  }

  if (!slots.every(slot => slot.updatedAt && TIMESTAMP_REGEX.test(new Date(slot.updatedAt).toISOString()))) {
    throw new Error('Invalid updatedAt format in slots.');
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
    throw Error('slotId is required.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw Error('Invalid slotId format. Expected UUID.');
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

  if (!session || typeof session !== 'object' || !Object.keys(session).length) {
    throw new Error('Invalid input data: session must be a non-empty object.');
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

  if (!TIMESTAMP_REGEX.test(new Date(session.startTime).toISOString())) {
    throw new Error('Invalid startTime format. Expected a Date object.');
  }
  
  if (!TIMESTAMP_REGEX.test(new Date(session.createdAt).toISOString())) {
    throw new Error('Invalid createdAt format. Expected a Date object.');
  }

  if (!TIMESTAMP_REGEX.test(new Date(session.updatedAt).toISOString())) {
    throw new Error('Invalid updateAt format. Expected a Date object.');
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
    throw new Error('All fields are required: sessionId, employeeId, and startTime.');
  }

  if (!UUID_REGEX.test(sessionId)) {
    throw new Error('Invalid session ID format. Expected UUID.');
  }
}
