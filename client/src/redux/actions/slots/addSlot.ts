import { schedulingApi } from 'src/api/schedulingApi';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { DATE_REGEX, UUID_REGEX } from 'src/constants/regex';
import { Slot } from 'src/types/slots';

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

  if (new Date() > new Date(day)) {
    throw new Error('Invalid date');
  }
}

const addSlot = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Adds first available slot for a specific employee on a given day.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and added slot object.
    */
    addSlot: builder.mutation<{ message: string, data: Slot }, { employeeId: string, day: string }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/add-slot',
          method: 'POST',
          body
        }
      },
      /** Inserts slot into cached getWeekSlots data. */
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const data = res.data.data;
        const date = new Date(data.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: data.employeeId, start: start, end: end },
          [
            {
              op: 'add',
              path: ['byId', data.id],
              value: data
            },
            {
              op: 'add',
              path: ['allIds', '-'],
              value: data.id
            }
          ]
        ))
      },
    })
  }),
})

export const { useAddSlotMutation } = addSlot;