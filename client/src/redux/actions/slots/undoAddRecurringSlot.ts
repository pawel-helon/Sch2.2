import { api } from 'src/redux/api';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types/slots';

const undoAddRecurringSlot = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undo adding recurring slot for a specific employee on a given day.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and added first recurring slot object.
    */
    undoAddRecurringSlot: builder.mutation<{ message: string, data: Slot }, { slotId: string }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest('undoAddRecurringSlot', body);
        return {
          url: 'slots/undo-add-recurring-slot',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const slot = res.data.data;
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);
          
          /** Validate response data. */
          validateResponse('undoAddRecurringSlot', slot);
          
          /** Insert first recurring slot into cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: slot.employeeId, start: start, end: end},
            [
              { op: 'remove', path: ['byId', slot.id] },
              { op: 'remove', path: ['allIds', '-'] }
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