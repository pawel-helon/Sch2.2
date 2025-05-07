import { api } from 'src/redux/api';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { DATE_REGEX, UUID_REGEX } from 'src/constants/regex';
import { Slot } from 'src/types/slots';
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

const disableRecurringDay = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Removes duplicated day slots for recurring days.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and SlotsRecurringDate object for the first day.
    */
    disableRecurringDay: builder.mutation<{ message: string, data: SlotsRecurringDate }, { employeeId: string, day: string }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/disable-recurring-day',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const message = res.data.message;
          const data = res.data.data;
  
          /** Stores message and slot in cached undoSlice data (slot constant is being created only to fit undoSlice setup).*/
          const slot = {
            id: args.employeeId,
            employeeId: args.employeeId,
            type: 'AVAILABLE',
            startTime: new Date(args.day),
            duration: { minutes: 30},
            recurring: true,
            createdAt: new Date(args.day),
            updatedAt: new Date(args.day)
          }
  
          dispatch(undoAdded({ message, data: [slot] as Slot[] }));
  
          /** Removes first slotsRecurringDate in cached getWeekSlotsRecurringDates data. */
          const { start, end } = getWeekStartEndDatesFromDay(data.date);
          dispatch(api.util.patchQueryData(
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
          ));
        } catch (error) {
          console.error(error);
        }
      }
    }),
  }),
})

export const { useDisableRecurringDayMutation } = disableRecurringDay;