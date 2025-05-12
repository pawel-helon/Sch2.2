import { api } from 'src/redux/api';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { UUID_REGEX } from 'src/constants/regex';
import { Slot } from 'src/types/slots';
import { HOURS } from 'src/constants/data';

const validateInput = (input: { slotId: string, hour: number }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { slotId, hour } = input;
  
  if (!slotId || !HOURS.includes(hour)) {
    throw new Error('All fields are required: slotId, hour.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slotId format. Expected UUID.');
  }

  if (hour < 0 || hour > 23 || typeof hour !== "number") {
    throw new Error("Invalid hour. Expected number between 0 and 23.");
  }
}

const undoUpdateRecurringSlotHour = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undoes update of the recurring slot hour for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new hour value in HH-MM fomrat.
     * @returns {Object} - Message and an object containing previous hour and slot object.
    */
    undoUpdateRecurringSlotHour: builder.mutation<{ message: string, data: { prevHour: string, slot: Slot } }, { slotId: string, hour: number } >({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/update-recurring-slot-hour',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const slot = res.data.data.slot;
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);
          
          /** Updates initial slot in cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: slot.employeeId, start: start, end: end },
            [
              {
                op: 'replace',
                path: ['byId', slot.id],
                value: slot
              },
            ]
          ));
        } catch (error) {
          console.error(error);
        }
      },
    }),
  }),
})

export const { useUndoUpdateRecurringSlotHourMutation } = undoUpdateRecurringSlotHour;