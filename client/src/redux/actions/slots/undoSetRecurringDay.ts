import { schedulingApi } from 'src/api/schedulingApi';
import { DATE_REGEX, UUID_REGEX } from 'src/constants/regex';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { SlotsRecurringDate } from 'src/types/slots-recurring-dates';

const validateInput = (input: { employeeId: string, day: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, day } = input;
  
  if (!employeeId || !day) {
    throw new Error('All fields are required: employeeId, day.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!DATE_REGEX.test(day)) {
    throw new Error('Invalid day format. Expected YYYY-MM-DD.');
  }

  if (new Date().getTime() > new Date(new Date(day).setHours(23,59,59,999)).getTime()) {
    throw new Error('Invalid date. Expected non-past date.');
  }
}

const undoSetRecurringDay = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undoes duplicating day slots for recurring days.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and SlotsRecurringDate object for the first day.
    */
    undoSetRecurringDay: builder.mutation<{ message: string, data: SlotsRecurringDate }, { employeeId: string, day: string }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/disable-recurring-day',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const data = res.data.data;

        /** Removes deleted session from cached getWeekSessions data. */
        const { start, end } = getWeekStartEndDatesFromDay(data.date);
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlotsRecurringDates',
          { employeeId: data.employeeId, start: start, end: end },
            [
              {
                op: 'remove',
                path: ['byId', data.id],
                value: data
              },
              {
                op: 'remove',
                path: ['allIds', '-'],
              }
            ]
        ))
      }
    }),
  }),
})

export const { useUndoSetRecurringDayMutation } = undoSetRecurringDay;