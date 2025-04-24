import { schedulingApi } from 'src/api/schedulingApi';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { UUID_REGEX } from 'src/constants/regex';
import { Slot } from 'src/types/slots';

const validateInput = (input: { slotId: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { slotId } = input;

  if (!slotId) {
    throw Error('slotId is required.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw Error('Invalid slotId format. Expected UUID.');
  }
}

const setSlotRecurrence = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Sets a slot as recurring for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.slotId - The ID of the slot to be set as recurring.
     * @returns {Object} - Message and slot object.
    */
    setSlotRecurrence: builder.mutation<{ message: string, data: Slot }, { slotId: string }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/set-slot-recurrence',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const { data: slot } = res.data;
        const employeeId = slot.employeeId;
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        /** Stores message and slot in cached undoSlice data. */
        const message = 'Slot recurrence has been set.';
        dispatch(undoAdded({ message, data: [slot] }));
        
        /** Updates initial slot in cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: employeeId, start: start, end: end },
            [
              {
                op: 'replace',
                path: ['byId', slot.id],
                value: slot
              },
            ]
        ))
      },
    }),
  }),
})

export const { useSetSlotRecurrenceMutation } = setSlotRecurrence;