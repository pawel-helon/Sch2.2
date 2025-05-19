import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';

const updateSlotMinutes = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Update the minutes of a specyfic slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new minutes value in MM fomrat.
     * @returns {Object} - Message and an object containing previous minutes and slot object.
    */
    updateSlotMinutes: builder.mutation<{ message: string, data: { prevMinutes: number, slot: Slot } | null }, { slotId: string, minutes: number }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest('updateSlotMinutes', body);
        return {
          url: 'slots/update-slot-minutes',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'Slot minutes have been updated.') {
            dispatch(infoAdded({ message: 'Failed to update slot minutes.' }));
            console.error(message);
            return;
          };
          
          const { prevMinutes, slot } = data as { prevMinutes: number, slot: Slot };
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);

          /** Validate response data. */
          validateResponse('updateSlotMinutes', { prevMinutes, slot });
  
          /** Store slot's previous state in cached undoSlice data. */
          const slotPrevStartTimeHours = new Date(slot.startTime).getHours();  
          const slotPrevState = {
            id: slot.id,
            employeeId: slot.employeeId,
            type: slot.type,
            startTime: new Date(new Date(slot.startTime).setHours(slotPrevStartTimeHours, prevMinutes)),
            duration: slot.duration,
            recurring: slot.recurring,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt
          }
          dispatch(undoAdded({ message, data: [slotPrevState] }));
          
          /** Update slot in cached getWeekSlots data. */
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

export const { useUpdateSlotMinutesMutation } = updateSlotMinutes;