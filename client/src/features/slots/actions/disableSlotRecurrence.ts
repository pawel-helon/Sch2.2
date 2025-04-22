import { UUID_REGEX } from "src/lib/constants";
import { getWeekStartEndDatesFromDay } from "src/lib/helpers";
import { schedulingApi } from "src/lib/schedulingApi";
import { Slot } from "src/lib/types";
import { undoAdded } from "src/lib/undoSlice";

const validateInput = (input: { slotId: string }): void => {
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

const disableSlotRecurrence = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Disables the recurrence of a slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to disable recurrence for.
     * @returns {Object} - Message and updated slot object.
    */
    disableSlotRecurrence: builder.mutation<{ message: string, data: Slot }, { slotId: string }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/disable-slot-recurrence',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const { data: slot } = res.data;
        const employeeId = slot.employeeId;
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);

        /** Stores message and initial slot previous state in undoSlice data. */
        const message = 'Slot recurrence has been disabled.';
        const prevSlotState = {
          id: slot.id,
          employeeId: slot.employeeId,
          type: slot.type,
          startTime: slot.startTime,
          duration: slot.duration,
          recurring: false,
          createdAt: slot.createdAt,
          updatedAt: new Date()
        }
        dispatch(undoAdded({ message, data: [prevSlotState] }));
        
        /** Updates initial slot in cached getWeekSlots data. */
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
  }),
})

export const { useDisableSlotRecurrenceMutation } = disableSlotRecurrence;