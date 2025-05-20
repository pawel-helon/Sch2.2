import { infoAdded } from 'src/redux/slices/infoSlice';
import { api } from 'src/redux/api';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';

const undoDuplicateDay = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undo duplicate day for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {Slot[]} body.slots - An array of slot objects to be deleted.
     * @returns {Object} - Message and data object containing employeeId, date, and an array of deleted slot IDs.
    */
    undoDuplicateDay: builder.mutation<{ message: string, data: { employeeId: string, date: string, slotIds: string[] } | null }, { slots: Slot[] }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'undoDuplicateDay', data: body });
        const slotIds = body.slots.map(slot => slot.id);
        return {
          url: 'slots/delete-slots',
          method: 'DELETE',
          body: { slotIds }
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'Slot(s) have been deleted.') {
            dispatch(infoAdded({ message: 'Failed to undo duplicate day.' }));
            console.error(message);
            return;
          };
          
          const { employeeId, date, slotIds } = data as { employeeId: string, date: string, slotIds: string[] };
          const { start, end } = getWeekStartEndDatesFromDay(date);

          /** Validate response data. */
          validateResponse({ endpoint: 'undoDuplicateDay', data: { employeeId, date, slotIds }});
          
          /** Remove deleted slots from cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: employeeId, start: start, end: end },
            slotIds.flatMap((slotId) =>
              [
                { op: 'remove', path: ['byId', slotId], value: slotId },
                { op: 'remove', path: ['allIds', '-'] }
              ]
            )
          ));
        } catch (error) {
          console.error(error);
        }
      },
    }),
  }),
})

export const { useUndoDuplicateDayMutation } = undoDuplicateDay;