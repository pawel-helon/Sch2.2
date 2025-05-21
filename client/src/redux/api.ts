import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { NormalizedSlots, NormalizedSessions, NormalizedSlotsRecurringDates } from 'src/types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  endpoints: (builder) => ({
    /**
     * Fetch weekly slots for a specific employee within a date range.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.start - The start date in YYYY-MM-DD format.
     * @param {string} body.end - The end date in YYYY-MM-DD format.
     * @returns {NormalizedSlots} - Normalized slots object.
    */
    getWeekSlots: builder.query<NormalizedSlots | null, { employeeId: string, start: string, end: string }>({
      query: (body) => {
        /** Validate request data */
        validateRequest({ endpoint: 'getWeekSlots', data: body });
        return {
          url: 'slots/get-week-slots',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: NormalizedSlots | null}) => {
        return response.data;
      },
      /** Validate response data. */
      async onQueryStarted(_, { queryFulfilled }) {
        const res = await queryFulfilled;
        console.log(res);
        const normalizedSltos = res.data as NormalizedSlots;
        validateResponse({ endpoint: 'getWeekSlots', data: normalizedSltos });
      },
    }),
    /**
     * Fetch slots for a specific employee in a given day in reschedule session.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - Day in YYYY-MM-DD format.
     * @returns {NormalizedSlots} - Normalized slots object.
    */
    getSlotsForReschedulingSession: builder.query<NormalizedSlots | null, { employeeId: string }>({
      query: (body) => {
        /** Validate request data */
        validateRequest({ endpoint: 'getSlotsForReschedulingSession', data: body });
        return {
          url: 'slots/get-slots-for-rescheduling-session',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: NormalizedSlots | null }) => {
        return response.data;
      },
      /** Validate response data. */
      async onQueryStarted(_, { queryFulfilled }) {
        const res = await queryFulfilled;
        const normalizedSlots = res.data as NormalizedSlots;
        validateResponse({ endpoint: 'getSlotsForReschedulingSession', data: normalizedSlots });
      },
    }),
    /**
     * Fetch weekly slots recurring dates for a specific employee within a date range.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.start - The start date in YYYY-MM-DD format.
     * @param {string} body.end - The end date in YYYY-MM-DD format.
     * @returns {NormalizedSlotsRecurringDates} - Normalized slots recurring dates object.
    */
    getWeekSlotsRecurringDates: builder.query<NormalizedSlotsRecurringDates | null, { employeeId: string, start: string, end: string }>({
      query: (body) => {
        /** Validate request data */
        validateRequest({ endpoint: 'getWeekSlotsRecurringDates', data: body });
        return {
          url: '/slots-recurring-dates/get-week-slots-recurring-dates',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: NormalizedSlotsRecurringDates | null }) => {
        return response.data;
      },
      /** Validate response data. */
      async onQueryStarted(_, { queryFulfilled }) {
        const res = await queryFulfilled;
        const normalizedSlotsRecurringDates = res.data as NormalizedSlotsRecurringDates;
        validateResponse({ endpoint: 'getWeekSlotsRecurringDates', data: normalizedSlotsRecurringDates });
      },
    }),
    /**
     * Fetch weekly sessions for a specific employee within a date range.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.start - The start date in YYYY-MM-DD format.
     * @param {string} body.end - The end date in YYYY-MM-DD format.
     * @returns {NormalizedSessions} An array of normalized sessions.
    */
    getWeekSessions: builder.query<NormalizedSessions | null, { employeeId: string, start: string, end: string}>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'getWeekSessions', data: body })
        return {
          url: '/sessions/get-week-sessions',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string, data: NormalizedSessions | null }) => {
        return response.data;
      },
      /** Validate response data. */
      async onQueryStarted(_, { queryFulfilled }) {
        const res = await queryFulfilled;
        const normalizedSessions = res.data as NormalizedSessions;
        validateResponse({ endpoint: 'getWeekSessions', data: normalizedSessions });
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
