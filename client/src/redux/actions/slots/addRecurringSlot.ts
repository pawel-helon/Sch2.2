import { schedulingApi } from 'src/api/schedulingApi';
import { undoAdded } from 'src/redux/slices/undoSlice';
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

  if (new Date().getTime() > new Date(new Date(day).setHours(23,59,59,999)).getTime()) {
    throw new Error('Invalid date. Expected non-past date.');
  }
}

const addRecurringSlot = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Adds first available recurring slot for a specific employee on a given day.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.day - The day to add the slot in YYYY-MM-DD format.
     * @returns {Object} - Message and added first recurring slot object.
    */
    addRecurringSlot: builder.mutation<{ message: string, data: Slot }, { employeeId: string, day: string }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/add-recurring-slot',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const slot = res.data.data;
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        /** Stores message and slot's previous state in cached undoSlice data. */
        const message = 'Recurring slot has been added.';
        dispatch(undoAdded({ message, data: [slot] }))
        
        /** Inserts first recurring slot into cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: slot.employeeId, start: start, end: end},
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
        ))
      }
    }),
  }),
})

export const { useAddRecurringSlotMutation } = addRecurringSlot;