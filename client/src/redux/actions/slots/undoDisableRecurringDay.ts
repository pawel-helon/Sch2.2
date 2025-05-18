import { api } from 'src/redux/api';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { SlotsRecurringDate } from 'src/types/slots-recurring-dates';

const undoDisableRecurringDay = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undo removing duplicated day slots for recurring days.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and SlotsRecurringDate object for the first day.
    */
    undoDisableRecurringDay: builder.mutation<{ message: string, data: SlotsRecurringDate }, { employeeId: string, day: string }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest('undoDisableRecurringDay', body);
        return {
          url: 'slots/set-recurring-day',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const slotsRecurringDate = res.data.data;

          /** Validate response data. */
          validateResponse('undoDisableRecurringDay', slotsRecurringDate);
        
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

export const { useUndoDisableRecurringDayMutation } = undoDisableRecurringDay;