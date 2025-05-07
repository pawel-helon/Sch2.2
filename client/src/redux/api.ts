import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { NormalizedSlots } from 'src/types/slots';
import { NormalizedSessions } from 'src/types/sessions';
import { DATE_REGEX, UUID_REGEX } from 'src/constants/regex';
import { NormalizedSlotsRecurringDates } from 'src/types/slots-recurring-dates';

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
        validateGetWeekSlotsInput(body);
        return {
          url: 'slots/get-week-slots',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: NormalizedSlots }) => {
        return response.data;
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
        validateGetSlotsForReschedulingSessionInput(body);
        return {
          url: 'slots/get-slots-for-rescheduling-session',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: NormalizedSlots }) => {
        return response.data;
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
        validateGetWeekSlotsRecurringDatesInput(body);
        return {
          url: '/slots-recurring-dates/get-week-slots-recurring-dates',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: NormalizedSlotsRecurringDates }) => {
        return response.data;
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
        validateGetWeekSessionsInput(body);
        return {
          url: '/sessions/get-week-sessions',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string, data: NormalizedSessions}) => {
        return response.data;
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

const validateGetWeekSlotsInput = (input: { employeeId: string, start: string, end: string }): void => {
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

const validateGetSlotsForReschedulingSessionInput = (input: { employeeId: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId } = input;
  
  if (!employeeId) {
    throw new Error('employeeId is required.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }
}

const validateGetWeekSlotsRecurringDatesInput = (input: { employeeId: string, start: string, end: string }): void => {
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

const validateGetWeekSessionsInput = (input: { employeeId: string, start: string, end: string }): void => {
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