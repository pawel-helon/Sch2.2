import { UUID_REGEX } from "src/lib/constants";
import { getWeekStartEndDatesFromDay } from "src/lib/helpers";
import { schedulingApi } from "src/lib/schedulingApi";
import { Slot } from "src/lib/types";
import { undoAdded } from "src/lib/undoSlice";

const validateUpdateSlotHourInput = (input: { slotId: string, hour: number }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { slotId, hour } = input;
  
  if (!slotId || !hour) {
    throw new Error('All fields are required: slotId, hour.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slotId format. Expected UUID.');
  }

  if (hour < 0 || hour > 23 || typeof hour !== "number") {
    throw new Error("Invalid hour. Expected number between 0 and 23.");
  }
}

const updateSlotHour = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Updates the hour of a specific slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new hour value in HH-MM fomrat.
     * @returns {Object} - Message and an object containing previous hour and slot object.
    */
    updateSlotHour: builder.mutation<{ message: string, data: { prevHour: string, slot: Slot } }, { slotId: string, hour: number } >({
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
        const updatedSlot = res.data.data.slot;
        const prevHour = Number(res.data.data.prevHour);
        const date = new Date(updatedSlot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        /** Stores message and slot's previous state in cached slotsMutationsSlice data. */
        const message = 'Slot hour has been updated.';
        const slotPrevStartTimeMinutes = new Date(updatedSlot.startTime).getMinutes();  
        const slotPrevState = {
          id: updatedSlot.id,
          employeeId: updatedSlot.employeeId,
          type: updatedSlot.type,
          startTime: new Date(new Date(updatedSlot.startTime).setHours(prevHour, slotPrevStartTimeMinutes)),
          duration: updatedSlot.duration,
          recurring: updatedSlot.recurring,
          createdAt: updatedSlot.createdAt,
          updatedAt: updatedSlot.updatedAt
        }
        dispatch(undoAdded({ message, data: slotPrevState }));
        
        /** Updates slot in cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: updatedSlot.employeeId, start: start, end: end },
          [
            {
              op: 'replace',
              path: ['byId', updatedSlot.id],
              value: updatedSlot
            } 
          ]
        ))
      },
    }),
  }),
})

export const { useUpdateSlotHourMutation } = updateSlotHour;