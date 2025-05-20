import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';

const undoDeleteSlots = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undo delete slots for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {Slot[]} body.slots - An array of slot objects to be restored.
     * @returns {Object} - Message and normalized slots object.
    */
    undoDeleteSlots: builder.mutation<{ message: string, data: Slot[] | null }, { slots: Slot[] }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'undoDeleteSlots', data: body });
        return {
          url: 'slots/add-slots',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;
          
          /** Return on failed action. */
          if (message !== 'Slots have been restored.') {
            dispatch(infoAdded({ message: 'Failed to undo delete slots.' }));
            console.error(message);
            return;
          };
          
          const slots = data as Slot[];
          const date = new Date(slots[0].startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);

          /** Validate response data. */
          validateResponse({ endpoint: 'undoDeleteSlots', data: slots });
          
          /** Insert restored slots into cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: slots[0].employeeId, start: start, end: end },
            slots.flatMap(slot => [
              { op: 'add', path: ['byId', slot.id], value: slot },
              { op: 'add', path: ['allIds', '-'], value: slot.id }
            ])
          ));
        } catch (error) {
          console.error(error);
        }
      }
    }),
  }),
})

export const { useUndoDeleteSlotsMutation } = undoDeleteSlots;