import { api } from 'src/redux/api';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { DATE_REGEX, UUID_REGEX } from 'src/constants/regex';
import { NormalizedSlots } from 'src/types/slots';
import { getSlotsFromNormalized } from 'src/utils/data/getSlotsFromNormalized';

const validateInput = (input: { employeeId: string, day: string, selectedDays: string[] }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, day, selectedDays } = input;

  if (!employeeId || !day || !selectedDays) {
    throw new Error('All fields are required: employeeId, day, selectedDays.');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!DATE_REGEX.test(day)) {
    throw new Error('Invalid day format. Expected YYYY-MM-DD.');
  }

  if (!Array.isArray(selectedDays) || !selectedDays.every(day => DATE_REGEX.test(day))) {
    throw new Error('Invalid selectedDays format. Expected an array of YYYY-MM-DD dates.');
  }
}


const duplicateDay = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Duplicates slots from a specific day for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to duplicate slots from in YYYY-MM-DD format.
     * @param {string[]} body.selectedDays - An array of selected days to duplicate slots to.
     * @returns {Object} - Message and normalized slots object. 
    */
    duplicateDay: builder.mutation<{ message: string, data: NormalizedSlots }, { employeeId: string, day: string, selectedDays: string[] }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/duplicate-day',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { data } = res.data;
          const slots = getSlotsFromNormalized(data);
          const employeeId = slots[0].employeeId;
          const date = new Date(slots[0].startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);
  
          /** Stores message and duplicated slots in undoSlice data. */
          const message = 'Day has been duplicated.';
          dispatch(undoAdded({ message, data: slots }));
          
          /** Inserts duplicated slots into cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: employeeId, start: start, end: end },
            slots.flatMap((slot) =>
              [
                {
                  op: 'add',
                  path: ['byId', slot.id],
                  value: slot
                },
                {
                  op: 'add',
                  path: ['allIds', '-'],
                  value: slot.id
                }
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