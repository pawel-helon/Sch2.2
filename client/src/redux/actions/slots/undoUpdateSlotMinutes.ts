import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';

const undoUpdateSlotMinutes = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undo minutes updates of the a specyfic slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new minutes value in MM fomrat.
     * @returns {Object} - Message and an object containing previous minutes and slot object.
    */
    undoUpdateSlotMinutes: builder.mutation<{ message: string, data: { prevMinutes: number, slot: Slot } | null }, { slotId: string, minutes: number }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'undoUpdateSlotMinutes', data: body });
        return {
          url: 'slots/update-slot-minutes',
          method: 'PUT',
          body
        }
      },
      /** Update slot in cached getWeekSlots data. */
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'Slot minutes have been updated.') {
            dispatch(infoAdded({ message: 'Failed to undo update slot minutes.' }));
            console.error(message);
            return;
          };
          
          const { prevMinutes, slot } = data as { prevMinutes: number, slot: Slot };
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);

          /** Validate response data. */
          validateResponse({ endpoint: 'undoUpdateSlotMinutes', data: { prevMinutes, slot } });
          
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

export const { useUndoUpdateSlotMinutesMutation } = undoUpdateSlotMinutes;