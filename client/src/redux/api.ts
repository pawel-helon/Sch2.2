import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { NormalizedSlots } from 'src/types/slots';
import { NormalizedSessions } from 'src/types/sessions';
import { DATE_REGEX, TIMESTAMP_REGEX, UUID_REGEX } from 'src/constants/regex';
import { NormalizedSlotsRecurringDates } from 'src/types/slots-recurring-dates';
import { SLOT_DURATIONS, SLOT_TYPES } from 'src/constants/data';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  tagTypes: ['Slots', 'SlotsRecurringDates', 'Sessions', 'Customers', 'Employees'],
  endpoints: (builder) => ({
    /**
     * Fetches weekly slots for a specific employee within a date range.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.start - The start date in YYYY-MM-DD format.
     * @param {string} body.end - The end date in YYYY-MM-DD format.
     * @returns {NormalizedSlots} - Normalized slots object.
    */
    getWeekSlots: builder.query<NormalizedSlots, { employeeId: string, start: string, end: string }>({
      query: (body) => {
        validateGetWeekSlotsRequest(body);
        return {
          url: 'slots/get-week-slots',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: NormalizedSlots}) => {
        return response.data;
      },
      /** Validate response */
      async onQueryStarted(_, { queryFulfilled }) {
        const res = await queryFulfilled;
        validataGetWeekSlotsResponse(res.data);
      },
    }),
    /**
     * Fetches slots for a specific employee in a given day.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - Day in YYYY-MM-DD format.
     * @returns {NormalizedSlots} - Normalized slots object.
    */
    getSlotsForReschedulingSession: builder.query<NormalizedSlots, { employeeId: string }>({
      query: (body) => {
        validateGetSlotsForReschedulingSessionRequest(body);
        return {
          url: 'slots/get-slots-for-rescheduling-session',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: NormalizedSlots }) => {
        return response.data;
      },
      /** Validate response */
      async onQueryStarted(_, { queryFulfilled }) {
        const res = await queryFulfilled;
        validateGetSlotsForReschedulingSessionResponse(res.data);
      },
    }),
    /**
     * Fetches weekly slots recurring dates for a specific employee within a date range.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.start - The start date in YYYY-MM-DD format.
     * @param {string} body.end - The end date in YYYY-MM-DD format.
     * @returns {NormalizedSlotsRecurringDates} - Normalized slots recurring dates object.
    */
    getWeekSlotsRecurringDates: builder.query<NormalizedSlotsRecurringDates, { employeeId: string, start: string, end: string }>({
      query: (body) => {
        validateGetWeekSlotsRecurringDatesRequest(body);
        return {
          url: '/slots-recurring-dates/get-week-slots-recurring-dates',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: NormalizedSlotsRecurringDates }) => {
        return response.data;
      },
      async onQueryStarted(_, { queryFulfilled }) {
        const res = await queryFulfilled;
        validateGetWeekSlotsRecurringDatesResponse(res.data);
      },
    }),
    /**
     * Fetches weekly sessions for a specific employee within a date range.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.start - The start date in YYYY-MM-DD format.
     * @param {string} body.end - The end date in YYYY-MM-DD format.
     * @returns {NormalizedSessions} An array of normalized sessions.
    */
    getWeekSessions: builder.query<NormalizedSessions, { employeeId: string, start: string, end: string}>({
      query: (body) => {
        validateGetWeekSessionsRequest(body);
        return {
          url: '/sessions/get-week-sessions',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string, data: NormalizedSessions}) => {
        return response.data;
      },
      async onQueryStarted(_, { queryFulfilled }) {
        const res = await queryFulfilled;
        validateGetWeekSessionsResponse(res.data);
      },
    }),
    /**
     * Remaining endpoints:
     * slots: src/features/slots/actions
     * sessions: src/features/sessions/actions 
    */
  })
});

export const {
  useGetWeekSlotsQuery,
  useGetSlotsForReschedulingSessionQuery,
  useGetWeekSlotsRecurringDatesQuery,
  useGetWeekSessionsQuery,
} = api;

const validateGetWeekSlotsRequest = (request: { employeeId: string, start: string, end: string }): void => {
  if (!request || typeof request !== 'object') {
    throw new Error('Request is required. Expected an object.');
  }
  
  const { employeeId, start, end } = request;
  
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

const validataGetWeekSlotsResponse = (response: NormalizedSlots): void => {
  if (!response || typeof response !== 'object') {
  }

  const { byId, allIds } = response;

  if (!byId || !allIds || typeof byId !== 'object' || !Array.isArray(allIds)) {
    throw new Error('byId and allIds are required. byId must be an object, allIds must be an array.');
  }

  for (const id in byId) {
    if (!UUID_REGEX.test(id)) {
      throw Error(`Invalid id format in byId key: ${id}. Expected UUID.`);
    }

    const slot = byId[id];
    if (!slot || typeof slot !== 'object') {
      throw new Error (`Invalid slot for id: ${id}. Expected an object.`);
    }
    if (!slot.id || !UUID_REGEX.test(slot.id)) {
      throw Error(`Invalid or missing id in the slot: ${id}. Expected UUID.`)
    }
    if (!slot.employeeId || !UUID_REGEX.test(slot.employeeId)) {
      throw Error(`Invalid or missing employeeId in the slot: ${id}. Expected UUID.`)
    }
    if (!slot.type || !SLOT_TYPES.includes(slot.type)) {
      throw Error(`Invalid type in the slot: ${id}. Expected 'AVAILABLE', 'BLOCKED', or 'BOOKED'.`)
    }
    if (!slot.startTime || !TIMESTAMP_REGEX.test(new Date(slot.startTime).toISOString())) {
      throw Error(`Invalid or missing startTime in the slot: ${id}. Expected Date object.`)
    }
    if (!slot.duration || !SLOT_DURATIONS.includes(slot.duration.minutes)) {
      throw Error(`Invalid or missing duration in the slot: ${id}. Expected { minutes: 30 }, { minutes: 45 }, or { minutes: 60 }.`)
    }
    if (typeof slot.recurring !== 'boolean') {
      throw Error (`Invalid or missing recurring in the slot: ${id}. Expected a boolean.`)
    }
    if (!slot.createdAt || !TIMESTAMP_REGEX.test(new Date(slot.createdAt).toISOString())) {
      throw Error(`Invalid or missing createdAt in the slot: ${id}. Expected Date object.`)
    }
    if (!slot.updatedAt || !TIMESTAMP_REGEX.test(new Date(slot.updatedAt).toISOString())) {
      throw Error(`Invalid or missing updatedAt in the slot: ${id}. Expected Date object.`)
    }
  }

  if (!allIds.every(id => UUID_REGEX.test(id))) {
    throw new Error('Invalid id format in allIds. Expected UUID.');
  }

  const byIdKeys = Object.keys(byId);
  if (byIdKeys.length !== allIds.length || !allIds.every(id => byIdKeys.includes(id))) {
    throw Error('Mismatch between allIds and byId keys.')
  }
}

const validateGetSlotsForReschedulingSessionRequest = (request: { employeeId: string }): void => {
  if (!request || typeof request !== 'object') {
    throw new Error('Request is required. Expected an object.');
  }

  const { employeeId } = request;
  
  if (!employeeId) {
    throw new Error('employeeId is required.');
  }
  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }
}

const validateGetSlotsForReschedulingSessionResponse = (response: NormalizedSlots ): void => {
  if (!response || typeof response !== 'object') {
    throw new Error('Response is required. Expected an object.');
  }

  const { byId, allIds } = response;

  if (!byId || !allIds || typeof byId !== 'object' || !Array.isArray(allIds)) {
    throw new Error('byId and allIds are required. byId must be an object, allIds must be an array.');
  }

  for (const id in byId) {
    if (!UUID_REGEX.test(id)) {
      throw Error(`Invalid id format in byId key: ${id}. Expected UUID.`);
    }

    const slot = byId[id];
    if (!slot || typeof slot !== 'object') {
      throw new Error (`Invalid slot for id: ${id}. Expected an object.`);
    }
    if (!slot.id || !UUID_REGEX.test(slot.id)) {
      throw Error(`Invalid or missing id in the slot: ${id}. Expected UUID.`)
    }
    if (!slot.employeeId || !UUID_REGEX.test(slot.employeeId)) {
      throw Error(`Invalid or missing employeeId in the slot: ${id}. Expected UUID.`)
    }
    if (!slot.type || !SLOT_TYPES.includes(slot.type)) {
      throw Error(`Invalid type in the slot: ${id}. Expected 'AVAILABLE', 'BLOCKED', or 'BOOKED'.`)
    }
    if (!slot.startTime || !TIMESTAMP_REGEX.test(new Date(slot.startTime).toISOString())) {
      throw Error(`Invalid or missing startTime in the slot: ${id}. Expected Date object.`)
    }
    if (!slot.duration || !SLOT_DURATIONS.includes(slot.duration.minutes)) {
      throw Error(`Invalid or missing duration in the slot: ${id}. Expected { minutes: 30 }, { minutes: 45 }, or { minutes: 60 }.`)
    }
    if (typeof slot.recurring !== 'boolean') {
      throw Error (`Invalid or missing recurring in the slot: ${id}. Expected a boolean.`)
    }
    if (!slot.createdAt || !TIMESTAMP_REGEX.test(new Date(slot.createdAt).toISOString())) {
      throw Error(`Invalid or missing createdAt in the slot: ${id}. Expected Date object.`)
    }
    if (!slot.updatedAt || !TIMESTAMP_REGEX.test(new Date(slot.updatedAt).toISOString())) {
      throw Error(`Invalid or missing updatedAt in the slot: ${id}. Expected Date object.`)
    }
  }

  if (!allIds.every(id => UUID_REGEX.test(id))) {
    throw new Error('Invalid id format in allIds. Expected UUID.');
  }

  const byIdKeys = Object.keys(byId);
  if (byIdKeys.length !== allIds.length || !allIds.every(id => byIdKeys.includes(id))) {
    throw Error('Mismatch between allIds and byId keys.')
  }
}

const validateGetWeekSlotsRecurringDatesRequest = (request: { employeeId: string, start: string, end: string }): void => {
  if (!request || typeof request !== 'object') {
    throw new Error('Request is required. Expected an object.');
  }
  
  const { employeeId, start, end } = request;
  
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

const validateGetWeekSlotsRecurringDatesResponse = (response: NormalizedSlotsRecurringDates): void => {
  if (!response || typeof response !== 'object') {
    throw new Error('Response is required. Expected an object.');
  }

  const { byId, allIds } = response;

  if (!byId || !allIds || typeof byId !== 'object' || !Array.isArray(allIds)) {
    throw new Error('byId and allIds are required. byId must be an object, allIds must be an array.');
  }

  for (const id in byId) {
    if (!UUID_REGEX.test(id)) {
      throw Error(`Invalid id format in byId key: ${id}. Expected UUID.`);
    }

    const slotRecurringDate = byId[id];
    if (!slotRecurringDate || typeof slotRecurringDate !== 'object') {
      throw new Error(`Invalid slotRecurringDate for id: ${id}. Expected an object.`);
    }
    if (!slotRecurringDate.id || !UUID_REGEX.test(slotRecurringDate.id)) {
      throw new Error(`Invalid or missing id in the slotRecurringDate: ${id}. Expected UUID.`);
    }
    if (!slotRecurringDate.employeeId || !UUID_REGEX.test(slotRecurringDate.employeeId)) {
      throw new Error(`Invalid or missing employeeId in the slotRecurringDate: ${id}. Expected UUID.`);
    }
    if(!slotRecurringDate.date || !DATE_REGEX.test(slotRecurringDate.date)) {
      throw new Error(`Invalid or missing date in the slotRecurringDate: ${id}. Expected YYYY-MM-DD.`);
    }
  }
}

const validateGetWeekSessionsRequest = (request: { employeeId: string, start: string, end: string }): void => {
  if (!request || typeof request !== 'object') {
    throw new Error('Request is required. Expected an object.');
  }
  
  const { employeeId, start, end } = request;
  
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

const validateGetWeekSessionsResponse = (response: NormalizedSessions): void => {
  if (!response || typeof response !== 'object') {
    throw new Error('Response is required. Expected an object.');
  }

  const { byId, allIds } = response;

  if (!byId || !allIds || typeof byId !== 'object' || !Array.isArray(allIds)) {
    throw new Error('byId and allIds are required. byId must be an object, allIds must be an array.');
  }

  for (const id in byId) {
    if (!UUID_REGEX.test(id)) {
      throw Error(`Invalid id format in byId key: ${id}. Expected UUID.`);
    }

    const session = byId[id];
    if (!session || typeof session !== 'object') {
      throw new Error (`Invalid session for id: ${id}. Expected an object.`);
    }
    if (!session.id || !UUID_REGEX.test(session.id)) {
      throw Error(`Invalid or missing id in the session: ${id}. Expected UUID.`)
    }
    if (!session.slotId || !UUID_REGEX.test(session.slotId)) {
      throw Error(`Invalid or missing slotId in the session: ${id}. Expected UUID.`)
    }
    if (!session.employeeId || !UUID_REGEX.test(session.employeeId)) {
      throw Error(`Invalid or missing employeeId in the session: ${id}. Expected UUID.`)
    }
    if (!session.customerId || !UUID_REGEX.test(session.customerId)) {
      throw Error(`Invalid or missing customerId in the session: ${id}. Expected UUID.`)
    }
    if (!session.startTime || !TIMESTAMP_REGEX.test(new Date(session.startTime).toISOString())) {
      throw Error(`Invalid or missing startTime in the session: ${id}. Expected Date object.`)
    }
    if (!session.createdAt || !TIMESTAMP_REGEX.test(new Date(session.createdAt).toISOString())) {
      throw Error(`Invalid or missing createdAt in the slot: ${id}. Expected Date object.`)
    }
    if (!session.updatedAt || !TIMESTAMP_REGEX.test(new Date(session.updatedAt).toISOString())) {
      throw Error(`Invalid or missing updatedAt in the slot: ${id}. Expected Date object.`)
    }
  }
}