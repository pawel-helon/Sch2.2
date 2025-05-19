import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';

const undoUpdateRecurringSlotHour = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undo update of the recurring slot hour for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new hour value in HH-MM fomrat.
     * @returns {Object} - Message and an object containing previous hour and slot object.
    */
    undoUpdateRecurringSlotHour: builder.mutation<{ message: string, data: { prevHour: number, slot: Slot } | null }, { slotId: string, hour: number }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest('undoUpdateRecurringSlotHour', body);
        return {
          url: 'slots/update-recurring-slot-hour',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'Recurring slot hour has been updated.') {
            dispatch(infoAdded({ message: 'Failed to undo update recurring slot hour.' }));
            console.error(message);
            return;
          };
          
          const { prevHour, slot } = data as { prevHour: number, slot: Slot };
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);

          /** Validate response data. */
          validateResponse('undoUpdateRecurringSlotHour', { prevHour, slot });
          
          /** Update initial slot in cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: slot.employeeId, start: start, end: end },
            [
              { op: 'replace', path: ['byId', slot.id], value: slot }
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