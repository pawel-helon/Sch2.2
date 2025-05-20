import { api } from 'src/redux/api';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';

const disableSlotRecurrence = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Disable the recurrence of a slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to disable recurrence for.
     * @returns {Object} - Message and updated slot object.
    */
    disableSlotRecurrence: builder.mutation<{ message: string, data: Slot | null }, { slotId: string }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'disableSlotRecurrence', data: body });
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
            dispatch(infoAdded({ message: 'Failed to disable recurring slot.' }));
            console.error(message);
            return;
          };

          const slot = data as Slot;
          const employeeId = slot.employeeId;
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);
          
          /** Validate response data. */
          validateResponse({ endpoint: 'disableSlotRecurrence', data: slot });
          
          /** Store message and initial slot previous state in undoSlice data. */
          const prevSlotState = {
            id: slot.id,
            employeeId: slot.employeeId,
            type: slot.type,
            startTime: slot.startTime,
            duration: slot.duration,
            recurring: false,
            createdAt: slot.createdAt,
            updatedAt: new Date()
          }
          dispatch(undoAdded({ message, data: [prevSlotState] }));
          
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

export const { useDisableSlotRecurrenceMutation } = disableSlotRecurrence;