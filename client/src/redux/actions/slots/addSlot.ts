import { api } from 'src/redux/api';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { Slot } from 'src/types/slots';
import { validateRequest, } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';

const addSlot = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Add first available slot for a specific employee on a given day.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and added slot object.
    */
    addSlot: builder.mutation<{ message: string, data: Slot }, { employeeId: string, day: string }>({
      query: (body) => {
        /** Validate request data */
        validateRequest('addSlot', body);
        return {
          url: 'slots/add-slot',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const slot = res.data.data;

          /** Validate response data. */
          validateResponse('addSlot', slot);
          
          /** Insert slot into cached getWeekSlots data. */
          const date = new Date(slot.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: slot.employeeId, start: start, end: end },
            [
              { op: 'add', path: ['byId', slot.id], value: slot },
              { op: 'add', path: ['allIds', '-'], value: slot.id }
            ]
          ));
        } catch (error) {
          console.error(error);
        }
      },
    })
  }),
})

export const { useAddSlotMutation } = addSlot;