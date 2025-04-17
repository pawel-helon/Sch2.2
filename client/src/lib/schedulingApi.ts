import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  validateGetWeekSessionsInput,
  validateGetWeekSlotsInput
} from 'src/utils/inputValidation';
import { NormalizedSessions, NormalizedSlots } from 'src/lib/types';

export const schedulingApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api' }),
  tagTypes: ['Sessions', 'Slots', 'Customers', 'Employees'],
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
      providesTags: ['Slots']
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
      providesTags: ['Sessions']
    }),
    /**
     * Remaining endpoints:
     * slots: src/features/slots/slotsSlice.ts
     * sessions: src/features/sessions/sessionsSlice.ts 
    */
})
});

export const {
  useGetWeekSlotsQuery,
  useGetWeekSessionsQuery,
} = schedulingApi;
