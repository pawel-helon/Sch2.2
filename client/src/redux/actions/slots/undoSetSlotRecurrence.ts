import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';

const undoSetSlotRecurrence = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undo setting recurrence of a slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to disable recurrence for.
     * @returns {Object} - Message and updated slot object.
    */
    undoSetSlotRecurrence: builder.mutation<{ message: string, data: Slot | null }, { slotId: string }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'undoSetSlotRecurrence', data: body });
        return {
          url: 'slots/disable-slot-recurrence',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'Recurring slot have been disabled.') {
            dispatch(infoAdded({ message: 'Failed to undo set recurring slot.' }));
            console.error(message);
            return;
          };
          
          const slot= data as Slot;
          const employeeId = slot.employeeId;
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);

          /** Validate response data. */
          validateResponse({ endpoint: 'undoSetSlotRecurrence', data: slot });
          
          /** Update initial slot in cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: employeeId, start: start, end: end },
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

export const { useUndoSetSlotRecurrenceMutation } = undoSetSlotRecurrence;