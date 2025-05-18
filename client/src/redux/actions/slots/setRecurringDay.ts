import { api } from 'src/redux/api';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types/slots';
import { SlotsRecurringDate } from 'src/types/slots-recurring-dates';

const setRecurringDay = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Duplicate day slots for recurring days.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and SlotsRecurringDate object for the first day.
    */
    setRecurringDay: builder.mutation<{ message: string, data: SlotsRecurringDate }, { employeeId: string, day: string }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest('setRecurringDay', body);
        return {
          url: 'slots/set-recurring-day',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data: slotsRecurringDate } = res.data;

          /** Validate response data. */
          validateResponse('setRecurringDay', slotsRecurringDate);
          
          /** Store message and slot in cached undoSlice data (slot constant is being created only to fit undoSlice setup).*/
          const slot = {
            id: slotsRecurringDate.employeeId,
            employeeId: slotsRecurringDate.employeeId,
            type: 'AVAILABLE',
            startTime: new Date(slotsRecurringDate.date),
            duration: { minutes: 30},
            recurring: true,
            createdAt: new Date(slotsRecurringDate.date),
            updatedAt: new Date(slotsRecurringDate.date)
          }
          dispatch(undoAdded({ message, data: [slot] as Slot[] }));
  
          /** Add first slotsRecurringDate in cached getWeekSlotsRecurringDates data. */
          const { start, end } = getWeekStartEndDatesFromDay(slotsRecurringDate.date);
          dispatch(api.util.patchQueryData(
            'getWeekSlotsRecurringDates',
            { employeeId: slotsRecurringDate.employeeId, start: start, end: end },
              [
                { op: 'add', path: ['byId', slotsRecurringDate.id], value: slotsRecurringDate },
                { op: 'add', path: ['allIds', '-'], value: slotsRecurringDate.id }
              ]
          ));
        } catch (error) {
          console.error(error);
        }
      }
    }),
  }),
})

export const { useSetRecurringDayMutation } = setRecurringDay;