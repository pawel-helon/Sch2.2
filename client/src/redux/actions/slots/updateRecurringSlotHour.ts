import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';

const updateRecurringSlotHour = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Update the hour of a specyfic recurring slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new hour value in HH-MM fomrat.
     * @returns {Object} - Message and an object containing previous hour and slot object.
    */
    updateRecurringSlotHour: builder.mutation<{ message: string, data: { prevHour: number, slot: Slot } | null }, { slotId: string, hour: number }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'updateRecurringSlotHour', data: body });
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
            dispatch(infoAdded({ message: 'Failed to update recurring slot hour.' }));
            console.error(message);
            return;
          };
          
          const { prevHour, slot } = data as { prevHour: number, slot: Slot } ;
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);

          /** Validate response data. */
          validateResponse({ endpoint: 'updateRecurringSlotHour', data: { prevHour, slot } });

          /** Store slot's previous state in cached undoSlice data. */
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

export const { useUpdateRecurringSlotHourMutation } = updateRecurringSlotHour;