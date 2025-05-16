import { api } from 'src/redux/api';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { TIMESTAMP_REGEX, UUID_REGEX } from 'src/constants/regex';
import { Slot } from 'src/types/slots';

export const validateInput = (input: { slots: Slot[] } ): void => {
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


const undoDeleteSlots = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undoes delete slots for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {Slot[]} body.slots - An array of slot objects to be restored.
     * @returns {Object} - Message and normalized slots object.
    */
    undoDeleteSlots: builder.mutation<{ message: string, data: Slot[] }, { slots: Slot[] }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/add-slots',
          method: 'POST',
          body
        }
      },
      /** Inserts restored slots into cached getWeekSlots data. */
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const slots = res.data.data;
          const date = new Date(slots[0].startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);
  
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: slots[0].employeeId, start: start, end: end },
            slots.flatMap(slot => [
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
            ])
          ));
        } catch (error) {
          console.error(error);
        }
      }
    }),
  }),
})

export const { useUndoDeleteSlotsMutation } = undoDeleteSlots;