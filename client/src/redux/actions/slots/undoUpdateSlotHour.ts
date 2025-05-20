import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { Slot } from 'src/types';

const undoUpdateSlotHour = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undo hour update of a specific slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new hour value in HH-MM fomrat.
     * @returns {Object} - Message and an object containing previous hour and slot object.
    */
    undoUpdateSlotHour: builder.mutation<{ message: string, data: { prevHour: number, slot: Slot } | null }, { slotId: string, hour: number }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'undoUpdateSlotHour', data: body });
        return {
          url: 'slots/update-slot-hour',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'Slot hour has been updated.') {
            dispatch(infoAdded({ message: 'Failed to undo update slot hour.' }));
            console.error(message);
            return;
          };
          
          const { prevHour, slot } = data as { prevHour: number, slot: Slot };
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);

          /** Validate response data. */
          validateResponse({ endpoint: 'undoUpdateSlotHour', data: { prevHour, slot } });
          
          /** Update slot in cached getWeekSlots data. */
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

export const { useUndoUpdateSlotHourMutation } = undoUpdateSlotHour;