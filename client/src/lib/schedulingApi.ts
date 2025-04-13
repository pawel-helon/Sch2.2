import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { NormalizedSessions, NormalizedSlots, Session, Slot } from 'src/lib/types';
import {
  validateAddRecurringSlotInput,
  validateAddSessionInput,
  validateAddSlotInput,
  validateAddSlotsInput,
  validateDeleteSessionInput,
  validateDeleteSlotsInput,
  validateDisableSlotRecurrenceInput,
  validateDuplicateDayInput,
  validateGetWeekSessionsInput,
  validateGetWeekSlotsInput,
  validateSetSlotRecurrenceInput,
  validateUpdateRecurringSlotHourInput,
  validateUpdateRecurringSlotMinutesInput,
  validateUpdateSessionInput,
  validateUpdateSlotHourInput,
  validateUpdateSlotMinutesInput
} from 'src/utils/inputValidation';
import { getWeekStartEndDatesFromDay } from './helpers';

// Base API for injecting slots and sessions endpoints
export const schedulingApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api' }),
  tagTypes: ['Sessions', 'Slots', 'Customers', 'Employees'],
  endpoints: (builder) => ({
    /**
     * SLOTS ENDPOINTS
    */
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
    * Adds first available slot for a specific employee on a given day.
    * 
    * @param {Object} body - The request payload.
    * @param {string} body.employeeId - The ID of the employee.
    * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
    * @returns {Object} - Message and added slot object.
    */
    addSlot: builder.mutation<{ message: string, data: Slot }, { employeeId: string, day: string }>({
      query: (body) => {
        validateAddSlotInput(body);
        return {
          url: 'slots/add-slot',
          method: 'POST',
          body
        }
      },
      // Upserts added slot to getWeekSlots cached data.
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const addedSlot = res.data.data;
        const date = new Date(addedSlot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: addedSlot.employeeId, start: start, end: end },
          [
            {
              op: 'add',
              path: ['byId', addedSlot.id],
              value: addedSlot
            },
            {
              op: 'add',
              path: ['allIds', '-'],
              value: addedSlot.id
            }
          ]
        ))
      },
    }),
    /**
    * Adds first available recurring slot for a specific employee on a given day.
    * 
    * @param {Object} body - The request payload.
    * @param {string} body.employeeId - The ID of the employee.
    * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
    * @returns {Slot} - Added recurring slot object.
    */
    addRecurringSlot: builder.mutation<Slot, { employeeId: string, day: string }>({
      query: (body) => {
        validateAddRecurringSlotInput(body);
        return {
          url: 'slots/add-recurring-slot',
          method: 'POST',
          body
        }
      },
      invalidatesTags: ['Slots']
    }),
    /**
    * Restores deleted slots for a given employee.
    * 
    * @param {Object} body - The request payload.
    * @param {Slot[]} body.slots - An array of slot objects to be restored.
    * @returns {NormalizedSlots} - Normalized slots object.
    */
    addSlots: builder.mutation<NormalizedSlots, { slots: Slot[] }>({
      query: (body) => {
        validateAddSlotsInput(body);
        return {
          url: 'slots/add-slots',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: NormalizedSlots }) => {
        return response.data;
      },
      invalidatesTags: ['Slots']
    }),
    /**
    * Updates the hour of a specific slot for a given employee.
    * 
    * @param {Object} body - The request payload.
    * @param {string} body.employeeId - The ID of the employee.
    * @param {string} body.slotId - The ID of the slot to be updated.
    * @param {string} body.hour - The new hour value in HH-MM fomrat.
    * @returns {Slot} - Updated slot object.
    */
    updateSlotHour: builder.mutation<Slot, { employeeId: string, slotId: string, hour: string } >({
      query: (body) => {
        validateUpdateSlotHourInput(body);
        return {
          url: 'slots/update-slot-hour',
          method: 'PUT',
          body
        }
      },
      invalidatesTags: ['Slots']
    }),
    /**
    * Updates the hour of a specyfic recurring slot for a given employee.
    * 
    * @param {Object} body - The request payload.
    * @param {string} body.employeeId - The ID of the employee.
    * @param {string} body.slotId - The ID of the slot to be updated.
    * @param {string} body.hour - The new hour value in HH-MM fomrat.
    * @returns {Slot} - Updated slot object.
    */
    updateRecurringSlotHour: builder.mutation<Slot, { employeeId: string, slotId: string, hour: string } >({
      query: (body) => {
        validateUpdateRecurringSlotHourInput(body);
        return {
          url: 'slots/update-recurring-slot-hour',
          method: 'PUT',
          body
        }
      },
      invalidatesTags: ['Slots']
    }),
    /**
    * Updates the minutes of a specyfic slot for a given employee.
    * 
    * @param {Object} body - The request payload.
    * @param {string} body.employeeId - The ID of the employee.
    * @param {string} body.slotId - The ID of the slot to be updated.
    * @param {string} body.hour - The new minutes value in MM fomrat.
    * @returns {Slot} - Updated slot object.
    */
    updateSlotMinutes: builder.mutation<Slot, { employeeId: string, slotId: string, minutes: string } >({
      query: (body) => {
        validateUpdateSlotMinutesInput(body);
        return {
          url: 'slots/update-slot-minutes',
          method: 'PUT',
          body
        }
      },
      invalidatesTags: ['Slots']
    }),
    /**
    * Updates the minutes of a specyfic recurring slot for a given employee.
    * 
    * @param {Object} body - The request payload.
    * @param {string} body.employeeId - The ID of the employee.
    * @param {string} body.slotId - The ID of the slot to be updated.
    * @param {string} body.hour - The new minutes value in MM fomrat.
    * @returns {Slot} - Updated slot object.
    */
    updateRecurringSlotMinutes: builder.mutation<Slot, { employeeId: string, slotId: string, minutes: string }>({
      query: (body) => {
        validateUpdateRecurringSlotMinutesInput(body);
        return {
          url: 'slots/update-recurring-slot-minutes',
          method: 'PUT',
          body
        }
      },
      invalidatesTags: ['Slots']
    }),
    /**
    * Deletes slots for a given employee.
    * 
    * @param {Object} body - The request payload.
    * @param {string} body.employeeId - The ID of the employee.
    * @param {string[]} body.slotIds - An array of slot IDs to be deleted.
    * @returns {string[]} - An array of deleted slot IDs.
    */
    deleteSlots: builder.mutation<string[], { employeeId: string, slotIds: string[] }>({
      query: (body) => {
        validateDeleteSlotsInput(body);
        return {
          url: 'slots/delete-slots',
          method: 'DELETE',
          body
        }
      },
      invalidatesTags: ['Slots']
    }),
    /**
    * Duplicates slots from a specific day for a given employee.
    * 
    * @param {Object} body - The request payload.
    * @param {string} body.employeeId - The ID of the employee.
    * @param {string} body.day - The day to duplicate slots from in YYYY-MM-DD format.
    * @param {string[]} body.selectedDays - An array of selected days to duplicate slots to.
    * @returns {NormalizedSlots} - Normalized slots object. 
    */
    duplicateDay: builder.mutation<NormalizedSlots, { employeeId: string, day: string, selectedDays: string[] }>({
      query: (body) => {
        validateDuplicateDayInput(body);
        return {
          url: 'slots/duplicate-day',
          method: 'POST',
          body
        }
      },
      invalidatesTags: ['Slots']
    }),
    /**
    * Sets a slot as recurring for a given employee.
    * 
    * @param {Object} body - The request payload.
    * @param {string} body.slotId - The ID of the slot to be set as recurring.
    * @returns {NormalizedSlots} - Normalized slots object.
    */
    setSlotRecurrence: builder.mutation<NormalizedSlots, { slotId: string }>({
      query: (body) => {
        validateSetSlotRecurrenceInput(body);
        return {
          url: 'slots/set-slot-recurrence',
          method: 'POST',
          body
        }
      },
      invalidatesTags: ['Slots']
    }),
    /**
    * Disables the recurrence of a slot for a given employee.
    * 
    * @param {Object} body - The request payload.
    * @param {string} body.slotId - The ID of the slot to disable recurrence for.
    * @returns {NormalizedSlots} - Normalized slots object.
    */
    disableSlotRecurrence: builder.mutation<NormalizedSlots, { slotId: string }>({
      query: (body) => {
        validateDisableSlotRecurrenceInput(body);
        return {
          url: 'slots/disable-slot-recurrence',
          method: 'POST',
          body
        }
      },
      invalidatesTags: ['Slots']
    }),
  /**
   * SESSIONS ENDPOINTS 
  */
  /**
   * Fetches weekly sessions for a specific employee within a date range.
   * 
   * @param {Object} body - The request payload.
   * @param {string} body.employeeId - The ID of the employee.
   * @param {string} body.start - The start date in YYYY-MM-DD format.
   * @param {string} body.end - The end date in YYYY-MM-DD format.
   * @returns {NormalizedSessions[]} An array of normalized sessions.
  */
  getWeekSessions: builder.query<NormalizedSessions[], { employeeId: string, start: string, end: string}>({
    query: (body) => {
      validateGetWeekSessionsInput(body);
      return {
        url: '/sessions/get-week-sessions',
        method: 'POST',
        body
      }
    },
    transformResponse: (response: { message: string, data: NormalizedSessions}) => {
      return [response.data];
    },
    providesTags: ['Sessions']
  }),
  /**
   * Restores a session for a specific employee.
   * 
   * @param {Object} body - The request payload.
   * @param {Session} body.session - The session object to be added.
   * @returns {Session} The added session object.
  */
  addSession: builder.mutation<Session, { session: Session }>({
    query: (body) => {
      validateAddSessionInput(body);
      return {
        url: 'sessions/add-session',
        method: 'POST',
        body
      }
    },
    invalidatesTags: ['Sessions']
  }),
  /**
   * Updates a session for a specific employee.
   * 
   * @param {Object} body - The request payload.
   * @param {string} body.sessionId - The ID of the session to be updated.
   * @param {string} body.slotId - The ID of the slot to be updated.
   * @returns {Session} The updated session object.
  */
  updateSession: builder.mutation<Session, { sessionId: string, slotId: string }>({
    query: (body) => {
      validateUpdateSessionInput(body);
      return {
        url: 'sessions/update-session',
        method: 'PUT',
        body
      }
    },
    invalidatesTags: ['Sessions']
  }),
  /**
   * Deletes a session for a specific employee.
   * 
   * @param {Object} body - The request payload.
   * @param {string} body.sessionId - The ID of the session to be deleted.
   * @returns {string} The ID of the deleted session.
   */
  deleteSession: builder.mutation<{ sessionId: string }, { sessionId: string}>({
    query: (body) => {
      validateDeleteSessionInput(body);
      return {
        url: 'sessions/delete-session',
        method: 'POST',
        body
      }
    },
    invalidatesTags: ['Sessions']
  })
})
});

export const {
    // SLOTS HOOKS
    useGetWeekSlotsQuery,
    useAddSlotMutation,
    useAddRecurringSlotMutation,
    useAddSlotsMutation,
    useUpdateSlotHourMutation,
    useUpdateRecurringSlotHourMutation,
    useUpdateSlotMinutesMutation,
    useUpdateRecurringSlotMinutesMutation,
    useDeleteSlotsMutation,
    useDuplicateDayMutation,
    useSetSlotRecurrenceMutation,
    useDisableSlotRecurrenceMutation,
    // SESSIONS HOOKS
    useGetWeekSessionsQuery,
    useAddSessionMutation,
    useUpdateSessionMutation,
    useDeleteSessionMutation
} = schedulingApi;
