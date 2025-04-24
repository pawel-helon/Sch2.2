import { schedulingApi } from 'src/api/schedulingApi';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { TIMESTAMP_REGEX, UUID_REGEX } from 'src/constants/regex';
import { Slot } from 'src/types/slots';

const validateInput = (input: { slots: Slot[] }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { slots } = input;

  if (!Array.isArray(slots) || !slots.length) {
    throw new Error('Slots must be a non-empty array.');
  }

  if (!slots.every(slot => slot && typeof slot === 'object')) {
    throw new Error('Each slot must be a valid object.');
  }

  if (!slots.every(slot => slot.id && UUID_REGEX.test(slot.id))) {
    throw new Error('Invalid id format in slots. Expected UUID.');
  }

  if (!slots.every(slot => slot.employeeId && UUID_REGEX.test(slot.employeeId))) {
    throw new Error('Invalid employeeId format in slots. Expected UUID.');
  }

  if (!slots.every(slot => slot.type && (slot.type === 'AVAILABLE' || slot.type === 'BLOCKED' || slot.type !== 'BOOKED'))) {
    throw new Error('Invalid type in slots. Expected AVAILABLE, BLOCKED or BOOKED.');
  }

  if (!slots.every(slot => slot.startTime && TIMESTAMP_REGEX.test(new Date(slot.startTime).toISOString()))) {
    throw new Error('Invalid startTime format in slots.');
  }

  if (!slots.every(slot => slot.duration && typeof slot.duration === 'object')) {
    throw new Error('Invalid duration format in slots. Expected object.');
  }

  if (!slots.every(slot => typeof slot.recurring === 'boolean')) {
    throw new Error('Invalid recurring format in slots. Expected boolean.');
  }

  if (!slots.every(slot => slot.createdAt && TIMESTAMP_REGEX.test(new Date(slot.createdAt).toISOString()))) {
    throw new Error('Invalid createdAt format in slots.');
  }

  if (!slots.every(slot => slot.updatedAt && TIMESTAMP_REGEX.test(new Date(slot.updatedAt).toISOString()))) {
    throw new Error('Invalid updatedAt format in slots.');
  }
}

const undoDuplicateDay = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undoes duplicate day for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {Slot[]} body.slots - An array of slot objects to be deleted.
     * @returns {Object} - Message and data object containing employeeId, date, and an array of deleted slot IDs.
    */
    undoDuplicateDay: builder.mutation<{ message: string, data: { employeeId: string, date: string, slotIds: string[] } }, { slots: Slot[] }>({
      query: (body) => {
        validateInput(body);
        const slotIds = body.slots.map(slot => slot.id);
        return {
          url: 'slots/delete-slots',
          method: 'DELETE',
          body: { slotIds }
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const { employeeId, date, slotIds } = res.data.data;
        const { start, end } = getWeekStartEndDatesFromDay(date);
        
        /** Removes deleted slots from cached getWeekSlots data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSlots',
          { employeeId: employeeId, start: start, end: end },
          slotIds.flatMap((slotId) =>
            [
              {
                op: 'remove',
                path: ['byId', slotId],
                value: slotId
              },
              {
                op: 'remove',
                path: ['allIds', '-']
              }
            ]
          )
        ));
      },
    }),
  }),
})

export const { useUndoDuplicateDayMutation } = undoDuplicateDay;