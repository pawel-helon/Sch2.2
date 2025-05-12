import { api } from 'src/redux/api';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { UUID_REGEX } from 'src/constants/regex';
import { Slot } from 'src/types/slots';
import { MINUTES } from 'src/constants/data';

const validateInput = (input: { slotId: string, minutes: number }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { slotId, minutes } = input;

  if (!slotId || !MINUTES.includes(minutes)) {
    throw new Error('All fields are required: slotId, hour.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slotId format. Expected UUID.');
  }

  if (minutes < 0 || minutes > 59 || typeof minutes !== "number") {
    throw new Error('Invalid minutes format. Expected MM.');
  }
}

const undoUpdateSlotMinutes = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undoes minutes updates of the a specyfic slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new minutes value in MM fomrat.
     * @returns {Object} - Message and an object containing previous minutes and slot object.
    */
    undoUpdateSlotMinutes: builder.mutation<{ message: string, data: { prevMinutes: string, slot: Slot} }, { slotId: string, minutes: number } >({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/update-slot-minutes',
          method: 'PUT',
          body
        }
      },
      /** Updates slot in cached getWeekSlots data. */
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const slot = res.data.data.slot;
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);
          
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

export const { useUndoUpdateSlotMinutesMutation } = undoUpdateSlotMinutes;