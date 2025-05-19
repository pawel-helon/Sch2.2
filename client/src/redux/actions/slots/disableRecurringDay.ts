import { api } from 'src/redux/api';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { Slot, SlotsRecurringDate } from 'src/types';

const disableRecurringDay = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Remove duplicated day slots for recurring days.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and SlotsRecurringDate object for the first day.
    */
    disableRecurringDay: builder.mutation<{ message: string, data: SlotsRecurringDate | null }, { employeeId: string, day: string }>({
      query: (body) => {
        /** Validate request data */
        validateRequest('disableRecurringDay', body);
        return {
          url: 'slots/disable-recurring-day',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;
          
          /** Return on failed action. */
          if (message !== 'Recurring day has been disabled.') {
            dispatch(infoAdded({ message: 'Failed to disable recurring day.' }));
            console.error(message);
            return;
          };

          const slotsRecurringDate = data as SlotsRecurringDate;
          
          /** Validate response data */
          validateResponse('disableRecurringDay', slotsRecurringDate);
  
          /** Store message and slot in cached undoSlice data (slot constant is being created only to fit undoSlice setup).*/
          const slot = {
            id: args.employeeId,
            employeeId: args.employeeId,
            type: 'AVAILABLE',
            startTime: new Date(args.day),
            duration: { minutes: 30},
            recurring: true,
            createdAt: new Date(args.day),
            updatedAt: new Date(args.day)
          } as Slot;
          dispatch(undoAdded({ message, data: [slot] }));
  
          /** Remove first slotsRecurringDate in cached getWeekSlotsRecurringDates data. */
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

export const { useDisableRecurringDayMutation } = disableRecurringDay;