import { api } from 'src/redux/api';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot, SlotsRecurringDate } from 'src/types';

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
    setRecurringDay: builder.mutation<{ message: string, data: SlotsRecurringDate | null }, { employeeId: string, day: string }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'setRecurringDay', data: body });
        return {
          url: 'slots/set-recurring-day',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'Recurring day has been set.') {
            dispatch(infoAdded({ message: 'Failed to set recurring day.' }));
            console.error(message);
            return;
          };

          const slotsRecurringDate = data as SlotsRecurringDate;

          /** Validate response data. */
          validateResponse({ endpoint: 'setRecurringDay', data: slotsRecurringDate });
          
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