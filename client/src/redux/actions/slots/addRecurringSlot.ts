import { api } from 'src/redux/api';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { Slot } from 'src/types/slots';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';

const addRecurringSlot = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Add first available recurring slot for a specific employee on a given day.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and added first recurring slot object.
    */
    addRecurringSlot: builder.mutation<{ message: string, data: Slot }, { employeeId: string, day: string }>({
      query: (body) => {
        /** Validate request data */
        validateRequest('addRecurringSlot', body);
        return {
          url: 'slots/add-recurring-slot',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data: slot } = res.data;

          /** Validate response data. */
          validateResponse('addRecurringSlot', slot);
          
          /** Store message and slot's previous state in cached undoSlice data. */
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);
          dispatch(undoAdded({ message, data: [slot] }));
          
          /** Insert first recurring slot into cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: slot.employeeId, start: start, end: end},
            [
              { op: 'add', path: ['byId', slot.id], value: slot },
              { op: 'add', path: ['allIds', '-'], value: slot.id }
            ]
          ));
        } catch (error) {
          console.error(error);
        }
      }
    }),
  }),
})

export const { useAddRecurringSlotMutation } = addRecurringSlot;