import { api } from 'src/redux/api';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';

const setSlotRecurrence = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Set a slot as recurring for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.slotId - The ID of the slot to be set as recurring.
     * @returns {Object} - Message and slot object.
    */
    setSlotRecurrence: builder.mutation<{ message: string, data: Slot | null }, { slotId: string }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'setSlotRecurrence', data: body });
        return {
          url: 'slots/set-slot-recurrence',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;
          
          /** Return on failed action. */
          if (message !== 'Recurring slot has been set.') {
            dispatch(infoAdded({ message: 'Failed to set recurring slot.' }));
            console.error(message);
            return;
          };

          const slot = data as Slot;
          const employeeId = slot.employeeId;
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);

          /** Validate response data. */
          validateResponse({ endpoint: 'setSlotRecurrence', data: slot });
          
          /** Store message and slot in cached undoSlice data. */
          dispatch(undoAdded({ message, data: [slot] }));
          
          /** Update initial slot in cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: employeeId, start: start, end: end },
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

export const { useSetSlotRecurrenceMutation } = setSlotRecurrence;