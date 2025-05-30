import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';

const updateSlotHour = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Update the hour of a specific slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new hour value in HH-MM fomrat.
     * @returns {Object} - Message and an object containing previous hour and slot object.
    */
    updateSlotHour: builder.mutation<{ message: string, data: { prevHour: number, slot: Slot } | null }, { slotId: string, hour: number }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'updateSlotHour', data: body });
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
            dispatch(infoAdded({ message: 'Failed to update slot hour.' }));
            console.error(message);
            return;
          };
          
          const { prevHour, slot } = data as { prevHour: number, slot: Slot };
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);
          
          /** Validate response data. */
          validateResponse({ endpoint: 'updateSlotHour', data: { prevHour, slot } });

          /** Store message and slot's previous state in cached undoSlice data. */
          const slotPrevStartTimeMinutes = new Date(slot.startTime).getMinutes();  
          const slotPrevState = {
            id: slot.id,
            employeeId: slot.employeeId,
            type: slot.type,
            startTime: new Date(new Date(slot.startTime).setHours(prevHour, slotPrevStartTimeMinutes)),
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

export const { useUpdateSlotHourMutation } = updateSlotHour;