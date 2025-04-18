import { schedulingApi } from "src/lib/schedulingApi";
import { slotsMutationAdded, slotsMutationRemoved } from "./slotsMutationsSlice";
import {
  validateAddRecurringSlotInput,
  validateAddSlotInput,
  validateAddSlotsInput,
  validateDeleteSlotsInput,
  validateDisableSlotRecurrenceInput,
  validateDuplicateDayInput,
  validateSetSlotRecurrenceInput,
  validateUndoAddRecurringSlotInput,
  validateUpdateRecurringSlotHourInput,
  validateUpdateRecurringSlotMinutesInput,
  validateUpdateSlotHourInput,
  validateUpdateSlotMinutesInput
} from 'src/utils/inputValidation';
import { NormalizedSlots, Slot } from "src/lib/types";
import { getSlotsFromNormalized, getWeekStartEndDatesFromDay } from "src/lib/helpers";

export const slotsSlice = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
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
      /** Inserts slot into cached getWeekSlots data. */
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const data = res.data.data;
        const date = new Date(data.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: data.employeeId, start: start, end: end },
          [
            {
              op: 'add',
              path: ['byId', data.id],
              value: data
            },
            {
              op: 'add',
              path: ['allIds', '-'],
              value: data.id
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
     * @returns {Object} - Message and added first recurring slot object.
    */
    addRecurringSlot: builder.mutation<{ message: string, data: Slot }, { employeeId: string, day: string }>({
      query: (body) => {
        validateAddRecurringSlotInput(body);
        return {
          url: 'slots/add-recurring-slot',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const slot = res.data.data;
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        /** Stores message and slot's previous state in cached slotsMutationsSlice data. */
        const message = 'Recurring slot has been added.';
        dispatch(slotsMutationAdded({ message, slot }))
        
        /** Inserts first recurring slot into cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: slot.employeeId, start: start, end: end},
          [
            {
              op: 'add',
              path: ['byId', slot.id],
              value: slot
            },
            {
              op: 'add',
              path: ['allIds', '-'],
              value: slot.id
            }
          ]
        ))
      }
    }),
    /**
     * Reverses adding recurring slot for a specific employee on a given day.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and added first recurring slot object.
    */
    undoAddRecurringSlot: builder.mutation<{ message: string, data: Slot }, { slotId: string }>({
      query: (body) => {
        validateUndoAddRecurringSlotInput(body);
        return {
          url: 'slots/undo-add-recurring-slot',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const slot = res.data.data;
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        /** Stores message and slot's previous state in cached slotsMutationsSlice data. */
        dispatch(slotsMutationRemoved(slot.id));
        
        /** Inserts first recurring slot into cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: slot.employeeId, start: start, end: end},
          [
            {
              op: 'remove',
              path: ['byId', slot.id],
            },
            {
              op: 'remove',
              path: ['allIds', '-'],
            }
          ]
        ))
      }
    }),
    /**
     * Updates the hour of a specific slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new hour value in HH-MM fomrat.
     * @returns {Object} - Message and an object containing previous hour and slot object.
    */
    updateSlotHour: builder.mutation<{ message: string, data: { prevHour: string, slot: Slot } }, { employeeId: string, slotId: string, hour: number } >({
      query: (body) => {
        validateUpdateSlotHourInput(body);
        return {
          url: 'slots/update-slot-hour',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const slot = res.data.data.slot;
        const prevHour = Number(res.data.data.prevHour);
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        /** Stores message and slot's previous state in cached slotsMutationsSlice data. */
        const message = 'Slot hour has been updated.';
        const slotPrevStartTimeMinutes = new Date(slot.startTime).getMinutes();  
        const slotPrevState = {
          id: slot.id,
          employeeId: slot.employeeId,
          type: slot.type,
          startTime: new Date(new Date(slot.startTime).setHours(prevHour, slotPrevStartTimeMinutes)),
          duration: slot.duration,
          recurring: slot.recurring,
          createdAt: slot.createdAt,
          updatedAt: slot.updatedAt
        }
        dispatch(slotsMutationAdded({ message, slot: slotPrevState }));
        
        /** Updates slot in cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: slot.employeeId, start: start, end: end },
          [
            {
              op: 'replace',
              path: ['byId', slot.id],
              value: slot
            } 
          ]
        ))
      },
    }),
    /**
     * Reverses hour update of a specific slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new hour value in HH-MM fomrat.
     * @returns {Object} - Message and an object containing previous hour and slot object.
    */
    undoUpdateSlotHour: builder.mutation<{ message: string, data: { prevHour: string, slot: Slot } }, { employeeId: string, slotId: string, hour: number } >({
      query: (body) => {
        validateUpdateSlotHourInput(body);
        return {
          url: 'slots/update-slot-hour',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const slot = res.data.data.slot;
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        /** Removes entry from cached slotsMutationSlice data. */
        dispatch(slotsMutationRemoved(slot.id));
        
        /** Updates slot in cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: slot.employeeId, start: start, end: end },
          [
            {
              op: 'replace',
              path: ['byId', slot.id],
              value: slot
            } 
          ]
        ))
      },
    }),
    /**
     * Updates the hour of a specyfic recurring slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new hour value in HH-MM fomrat.
     * @returns {Object} - Message and an object containing previous hour and slot object.
    */
    updateRecurringSlotHour: builder.mutation<{ message: string, data: { prevHour: string, slot: Slot } }, { employeeId: string, slotId: string, hour: number } >({
      query: (body) => {
        validateUpdateRecurringSlotHourInput(body);
        return {
          url: 'slots/update-recurring-slot-hour',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const slot = res.data.data.slot;
        const prevHour = Number(res.data.data.prevHour);
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        /** Stores slot's previous state in cached slotsMutationsSlice data. */
        const slotPrevStartTimeMinutes = new Date(slot.startTime).getMinutes();  
        const slotPrevState = {
          id: slot.id,
          employeeId: slot.employeeId,
          type: slot.type,
          startTime: new Date(new Date(slot.startTime).setHours(prevHour, slotPrevStartTimeMinutes)),
          duration: slot.duration,
          recurring: slot.recurring,
          createdAt: slot.createdAt,
          updatedAt: slot.updatedAt
        }
        dispatch(slotsMutationAdded({ message: 'TODO', slot: slotPrevState }));
        
        /** Updates initial slot in cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: slot.employeeId, start: start, end: end },
          [
            {
              op: 'replace',
              path: ['byId', slot.id],
              value: slot
            },
          ]
        ))
      },
    }),
    /**
     * Updates the minutes of a specyfic slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new minutes value in MM fomrat.
     * @returns {Object} - Message and an object containing previous minutes and slot object.
    */
    updateSlotMinutes: builder.mutation<{ message: string, data: { prevMinutes: string, slot: Slot} }, { employeeId: string, slotId: string, minutes: number } >({
      query: (body) => {
        validateUpdateSlotMinutesInput(body);
        return {
          url: 'slots/update-slot-minutes',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const slot = res.data.data.slot;
        const prevMinutes = Number(res.data.data.prevMinutes);
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);

        /** Stores slot's previous state in cached slotsMutationsSlice data. */
        const slotPrevStartTimeHours = new Date(slot.startTime).getHours();  
        const slotPrevState = {
          id: slot.id,
          employeeId: slot.employeeId,
          type: slot.type,
          startTime: new Date(new Date(slot.startTime).setHours(slotPrevStartTimeHours, prevMinutes)),
          duration: slot.duration,
          recurring: slot.recurring,
          createdAt: slot.createdAt,
          updatedAt: slot.updatedAt
        }
        dispatch(slotsMutationAdded({ message: 'TODO', slot: slotPrevState }));
        
        /** Updates slot in cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: slot.employeeId, start: start, end: end },
          [
            {
              op: 'replace',
              path: ['byId', slot.id],
              value: slot
            },
          ]
        ))
      },
    }),
    /**
     * Updates the minutes of a specyfic recurring slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new minutes value in MM fomrat.
     * @returns {Object} - Message and an object containing previous minutes and slot object.
    */
    updateRecurringSlotMinutes: builder.mutation<{ message: string, data: { prevMinutes: string, slot: Slot} }, { employeeId: string, slotId: string, minutes: number }>({
      query: (body) => {
        validateUpdateRecurringSlotMinutesInput(body);
        return {
          url: 'slots/update-recurring-slot-minutes',
          method: 'PUT',
          body
        }
      },

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const slot = res.data.data.slot;
        const prevMinutes = Number(res.data.data.prevMinutes);
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        /** Stores slot's previous state in cached slotsMutationsSlice data. */
        const slotPrevStartTimeHours = new Date(slot.startTime).getHours();  
        const slotPrevState = {
          id: slot.id,
          employeeId: slot.employeeId,
          type: slot.type,
          startTime: new Date(new Date(slot.startTime).setHours(slotPrevStartTimeHours, prevMinutes)),
          duration: slot.duration,
          recurring: slot.recurring,
          createdAt: slot.createdAt,
          updatedAt: slot.updatedAt
        }
        dispatch(slotsMutationAdded({ message: 'TODO', slot: slotPrevState }));
        
        /** Updates initial slot in cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: slot.employeeId, start: start, end: end },
          [
            {
              op: 'replace',
              path: ['byId', slot.id],
              value: slot
            },
          ]
        ))
      },
    }),
    /**
     * Deletes slots for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string[]} body.slotIds - An array of slot IDs to be deleted.
     * @returns {Object} - Message and data object containing employeeId, date, and an array of deleted slot IDs.
    */
    deleteSlots: builder.mutation<{ message: string, data: { employeeId: string, date: string, slotIds: string[] } }, { slots: Slot[] }>({
      query: (body) => {
        validateDeleteSlotsInput(body);
        const slotIds = body.slots.map(slot => slot.id);
        return {
          url: 'slots/delete-slots',
          method: 'DELETE',
          body: { slotIds }
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const { employeeId, date, slotIds } = res.data.data;
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        /** Stores deleted slots in cached slotsMutationsSlice data. */
        for (const slot of args.slots) {
          dispatch(slotsMutationAdded({ message: 'TODO', slot }));
        }
        
        /** Removes deleted slots from cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: employeeId, start: start, end: end },
          slotIds.flatMap((slotId) =>
            [
              {
                op: 'remove',
                path: ['byId', slotId],
                value: slotId
              },
              {
                op: 'remove',
                path: ['allIds', '-']
              }
            ]
          )
        ));
      },
    }),
    /**
     * Restores deleted slots for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {Slot[]} body.slots - An array of slot objects to be restored.
     * @returns {Object} - Message and normalized slots object.
    */
    undoDeleteSlots: builder.mutation<{ message: string, data: NormalizedSlots }, { slots: Slot[] }>({
      query: (body) => {
        validateAddSlotsInput(body);
        return {
          url: 'slots/add-slots',
          method: 'POST',
          body
        }
      },
      /** Inserts restored slots into cached getWeekSlots data. */
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const data = getSlotsFromNormalized(res.data.data);
        const date = new Date(data[0].startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);

        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: data[0].employeeId, start: start, end: end },
          data.flatMap(slot => [
            {
              op: 'add',
              path: ['byId', slot.id],
              value: slot
            },
            {
              op: 'add',
              path: ['allIds', '-'],
              value: slot.id
            }
          ])
        ))
      }
    }),
    /**
     * Duplicates slots from a specific day for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to duplicate slots from in YYYY-MM-DD format.
     * @param {string[]} body.selectedDays - An array of selected days to duplicate slots to.
     * @returns {Object} - Message and normalized slots object. 
    */
    duplicateDay: builder.mutation<{ message: string, data: NormalizedSlots }, { employeeId: string, day: string, selectedDays: string[] }>({
      query: (body) => {
        validateDuplicateDayInput(body);
        return {
          url: 'slots/duplicate-day',
          method: 'POST',
          body
        }
      },
      /** Inserts duplicated slots into cached getWeekSlots data. */
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const { data } = res.data;
        const slots = getSlotsFromNormalized(data);
        const employeeId = slots[0].employeeId;
        const date = new Date(slots[0].startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);

        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: employeeId, start: start, end: end },
          slots.flatMap((slot) =>
            [
              {
                op: 'add',
                path: ['byId', slot.id],
                value: slot
              },
              {
                op: 'add',
                path: ['allIds', '-'],
                value: slot.id
              }
            ]
          )
        ))
      },
    }),
    /**
     * Sets a slot as recurring for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.slotId - The ID of the slot to be set as recurring.
     * @returns {Object} - Message and slot object.
    */
    setSlotRecurrence: builder.mutation<{ message: string, data: Slot }, { slotId: string }>({
      query: (body) => {
        validateSetSlotRecurrenceInput(body);
        return {
          url: 'slots/set-slot-recurrence',
          method: 'POST',
          body
        }
      },
      /** Updates initial slot in cached getWeekSlots data. */
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const { data: slot } = res.data;
        const employeeId = slot.employeeId;
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);

        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: employeeId, start: start, end: end },
            [
              {
                op: 'replace',
                path: ['byId', slot.id],
                value: slot
              },
            ]
        ))
      },
    }),
    /**
     * Disables the recurrence of a slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to disable recurrence for.
     * @returns {Object} - Message and updated slot object.
    */
    disableSlotRecurrence: builder.mutation<{ message: string, data: Slot }, { slotId: string }>({
      query: (body) => {
        validateDisableSlotRecurrenceInput(body);
        return {
          url: 'slots/disable-slot-recurrence',
          method: 'POST',
          body
        }
      },
      /** Updates initial slot in cached getWeekSlots data. */
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const { data: slot } = res.data;
        const employeeId = slot.employeeId;
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);

        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: employeeId, start: start, end: end },
            [
              {
                op: 'replace',
                path: ['byId', slot.id],
                value: slot
              },
            ]
        ))
      },
    }),
  })
})

export const {
  useAddSlotMutation,
  useAddRecurringSlotMutation,
  useUndoAddRecurringSlotMutation,
  useUpdateSlotHourMutation,
  useUndoUpdateSlotHourMutation,
  useUpdateRecurringSlotHourMutation,
  useUpdateSlotMinutesMutation,
  useUpdateRecurringSlotMinutesMutation,
  useDeleteSlotsMutation,
  useUndoDeleteSlotsMutation,
  useDuplicateDayMutation,
  useSetSlotRecurrenceMutation,
  useDisableSlotRecurrenceMutation,
} = slotsSlice