import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest, } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';

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
    addSlot: builder.mutation<{ message: string, data: Slot | null }, { employeeId: string, day: string }>({
      query: (body) => {
        /** Validate request data */
        validateRequest({ endpoint: 'addSlot', data: body });
        return {
          url: 'slots/add-slot',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'New slot has been added.') {
            dispatch(infoAdded({ message: 'Failed to add slot.' }));
            console.error(message);
            return;
          };

          const slot = data as Slot;

          /** Validate response data. */
          validateResponse({ endpoint: 'addSlot', data: slot });
          
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