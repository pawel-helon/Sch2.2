import { schedulingApi } from 'src/api/schedulingApi';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { UUID_REGEX } from 'src/constants/regex';
import { Slot } from 'src/types/slots';

const validateInput = (input: { slotId: string, minutes: number }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { slotId, minutes } = input;

  if (!slotId || !minutes) {
    throw new Error('All fields are required: slotId, hour.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slotId format. Expected UUID.');
  }

  if (minutes < 0 || minutes > 59 || typeof minutes !== "number") {
    throw new Error('Invalid minutes format. Expected MM.');
  }
}

const updateRecurringSlotMinutes = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Updates the minutes of a specyfic recurring slot for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @param {string} body.hour - The new minutes value in MM fomrat.
     * @returns {Object} - Message and an object containing previous minutes and slot object.
    */
    updateRecurringSlotMinutes: builder.mutation<{ message: string, data: { prevMinutes: string, slot: Slot} }, { slotId: string, minutes: number }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/update-recurring-slot-minutes',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const slot = res.data.data.slot;
        const prevMinutes = Number(res.data.data.prevMinutes);
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        /** Stores slot's previous state in cached undoSlice data. */
        const message = 'Recurring slot minutes have been updated.';
        const slotPrevStartTimeHours = new Date(slot.startTime).getHours();  
        const slotPrevState = {
          id: slot.id,
          employeeId: slot.employeeId,
          type: slot.type,
          startTime: new Date(new Date(slot.startTime).setHours(slotPrevStartTimeHours, prevMinutes)),
          duration: slot.duration,
          recurring: slot.recurring,
          createdAt: slot.createdAt,
          updatedAt: slot.updatedAt
        }
        dispatch(undoAdded({ message, data: [slotPrevState] }));
        
        /** Updates initial slot in cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: slot.employeeId, start: start, end: end },
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

export const { useUpdateRecurringSlotMinutesMutation } = updateRecurringSlotMinutes;