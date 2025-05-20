import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { SlotsRecurringDate } from 'src/types';

const undoSetRecurringDay = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undo duplicating day slots for recurring days.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and SlotsRecurringDate object for the first day.
    */
    undoSetRecurringDay: builder.mutation<{ message: string, data: SlotsRecurringDate | null }, { employeeId: string, day: string }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'undoSetRecurringDay', data: body });
        return {
          url: 'slots/disable-recurring-day',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'Recurring day has been disabled.') {
            dispatch(infoAdded({ message: 'Failed to undo set recurring day.' }));
            console.error(message);
            return;
          };
          
          const slotsRecurringDate = data as SlotsRecurringDate;
          
          /** Validate response data. */
          validateResponse({ endpoint: 'undoSetRecurringDay', data: slotsRecurringDate });
  
          /** Remove deleted session from cached getWeekSessions data. */
          const { start, end } = getWeekStartEndDatesFromDay(slotsRecurringDate.date);
          dispatch(api.util.patchQueryData(
            'getWeekSlotsRecurringDates',
            { employeeId: slotsRecurringDate.employeeId, start: start, end: end },
              [
                { op: 'remove', path: ['byId', slotsRecurringDate.id], value: slotsRecurringDate },
                { op: 'remove', path: ['allIds', '-'] }
              ]
          ));
        } catch (error) {
          console.error(error);
        }
      }
    }),
  }),
})

export const { useUndoSetRecurringDayMutation } = undoSetRecurringDay;