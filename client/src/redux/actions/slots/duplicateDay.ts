import { api } from 'src/redux/api';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';

const duplicateDay = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Duplicate slots from a specific day for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to duplicate slots from in YYYY-MM-DD format.
     * @param {string[]} body.selectedDays - An array of selected days to duplicate slots to.
     * @returns {Object} - Message and slots array. 
    */
    duplicateDay: builder.mutation<{ message: string, data: Slot[] | null }, { employeeId: string, day: string, selectedDays: string[] }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'duplicateDay', data: body });
        return {
          url: 'slots/duplicate-day',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;
          const { start, end } = getWeekStartEndDatesFromDay(args.day);

          /** Return on failed action. */
          if (message !== 'Day has been duplicated.') {
            dispatch(infoAdded({ message: 'Failed to duplicate day.' }));
            console.error(message);
            return;
          };

          const slots = data as Slot[];

          /** Validate response data. */
          validateResponse({ endpoint: 'duplicateDay', data: slots });
  
          /** Store message and duplicated slots in undoSlice data. */
          dispatch(undoAdded({ message, data: slots }));
          
          /** Insert duplicated slots into cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: args.employeeId, start: start, end: end },
            slots.flatMap((slot) =>
              [
                { op: 'add', path: ['byId', slot.id], value: slot },
                { op: 'add', path: ['allIds', '-'], value: slot.id }
              ]
            )
          ));
        } catch (error) {
          console.error(error);
        }
      },
    }),
  }),
})

export const { useDuplicateDayMutation } = duplicateDay;