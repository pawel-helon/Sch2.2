import { api } from 'src/redux/api';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { Slot } from 'src/types/slots';

const undoUpdateRecurringSlotMinutes = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undo update of the recurring slot hour for a given employee
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new minutes value in MM fomrat.
     * @returns {Object} - Message and an object containing previous minutes and slot object.
    */
    undoUpdateRecurringSlotMinutes: builder.mutation<{ message: string, data: { prevMinutes: number, slot: Slot} }, { slotId: string, minutes: number }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest('undoUpdateRecurringSlotMinutes', body);
        return {
          url: 'slots/update-recurring-slot-minutes',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { prevMinutes, slot } = res.data.data;
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);

          /** Validate response data. */
          validateResponse('undoUpdateRecurringSlotMinutes', { prevMinutes, slot });
          
          /** Update initial slot in cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: slot.employeeId, start: start, end: end },
            [
              { op: 'replace', path: ['byId', slot.id], value: slot },
            ]
          ));
        } catch (error) {
          console.error(error);
        }
      },
    }),
  }),
})

export const { useUndoUpdateRecurringSlotMinutesMutation } = undoUpdateRecurringSlotMinutes;