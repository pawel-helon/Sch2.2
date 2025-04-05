import { schedulingApi } from 'src/lib/schedulingApi';
import { NormalizedSlots, Slot } from 'src/lib/types';
import {
  validateAddRecurringSlotInput,
  validateAddSlotInput,
  validateAddSlotsInput,
  validateDeleteSlotsInput,
  validateDisableSlotRecurrenceInput,
  validateDuplicateDayInput,
  validateGetWeekSlotsInput,
  validateSetSlotRecurrenceInput,
  validateUpdateRecurringSlotHourInput,
  validateUpdateRecurringSlotMinutesInput,
  validateUpdateSlotHourInput,
  validateUpdateSlotMinutesInput
} from 'src/utils/inputValidation';

export const slotsSlice = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches weekly slots for a specific employee within a date range.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.start - The start date in YYYY-MM-DD format.
     * @param {string} body.end - The end date in YYYY-MM-DD format.
     * @returns {NormalizedSlots[]} An array of normalized slots.
    */
    getWeekSlots: builder.query<NormalizedSlots[], { employeeId: string, start: string, end: string }>({
      query: (body) => {
        validateGetWeekSlotsInput(body);
        return {
          url: 'slots/get-week-slots',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: NormalizedSlots }) => {
        return [response.data];
      },
      providesTags: ['Slots']
    }),
    /**
     * Adds first available slot for a specific employee on a given day.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Slot} The added slot object.
    */
    addSlot: builder.mutation<Slot, { employeeId: string, day: string }>({
      query: (body) => {
        validateAddSlotInput(body);
        return {
          url: 'slots/add-slot',
          method: 'POST',
          body
        }
      },
      invalidatesTags: ['Slots']
    }),
    /**
     * Adds first available recurring slot for a specific employee on a given day.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Slot} The first added recurring slot object.
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
     * @returns {NormalizedSlots[]} An array of normalized slots.
    */
    addSlots: builder.mutation<NormalizedSlots[], { slots: Slot[] }>({
      query: (body) => {
        validateAddSlotsInput(body);
        return {
          url: 'slots/add-slots',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: NormalizedSlots }) => {
        return [response.data];
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
     * @returns {Slot} The updated slot object.
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
     * @returns {Slot} The updated slot object.
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
     * @returns {Slot} The updated slot object.
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
     * @returns {Slot} The updated slot object.
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
     * @returns {string[]} An array of deleted slot IDs.
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
     * @returns {NormalizedSlots} The normalized slots object. 
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
     * @returns {NormalizedSlots} The normalized slots object.
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
     * @returns {NormalizedSlots} The normalized slots object.
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
    })
  }),
})

export const {
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
  useDisableSlotRecurrenceMutation
} = slotsSlice;
