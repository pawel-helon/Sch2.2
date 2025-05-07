import { api } from 'src/redux/api';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { UUID_REGEX } from 'src/constants/regex';
import { Slot } from 'src/types/slots';

const validateInput = (input: { slotId: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }

  const { slotId } = input;

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slotId format. Expected UUID.');
  }
}

const undoAddRecurringSlot = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undoes adding recurring slot for a specific employee on a given day.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and added first recurring slot object.
    */
    undoAddRecurringSlot: builder.mutation<{ message: string, data: Slot }, { slotId: string }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/undo-add-recurring-slot',
          method: 'POST',
          body
        }
      },
      /** Inserts first recurring slot into cached getWeekSlots data. */
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const slot = res.data.data;
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);
          
          dispatch(api.util.patchQueryData(
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
          ));
        } catch (error) {
          console.error(error);
        }
      }
    }),
  }),
})

export const { useUndoAddRecurringSlotMutation } = undoAddRecurringSlot;