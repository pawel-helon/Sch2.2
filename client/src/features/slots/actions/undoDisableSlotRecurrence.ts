import { UUID_REGEX } from "src/lib/constants";
import { getWeekStartEndDatesFromDay } from "src/lib/helpers";
import { schedulingApi } from "src/lib/schedulingApi";
import { Slot } from "src/lib/types";

const validateInput = (input: { slotId: string }): void => {
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

const undoDisableSlotRecurrence = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undoes disabling recurrence of a slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.slotId - The ID of the slot to be set as recurring.
     * @returns {Object} - Message and slot object.
    */
    undoDisableSlotRecurrence: builder.mutation<{ message: string, data: Slot }, { slotId: string }>({
      query: (body) => {
        validateInput(body);
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
  }),
})

export const { useUndoDisableSlotRecurrenceMutation } = undoDisableSlotRecurrence;