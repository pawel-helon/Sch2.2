import { api } from 'src/redux/api';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { DATE_REGEX, TIMESTAMP_REGEX, UUID_REGEX } from 'src/constants/regex';
import { SLOT_DURATIONS, SLOT_TYPES } from 'src/constants/data';
import { Slot } from 'src/types/slots';

const validateRequest = (request: { slots: Slot[] }): void => {
  if (!request || typeof request !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { slots } = request;

  console.log('request: ', !slots, !Array.isArray(slots), !slots.length);

  if (!slots || !Array.isArray(slots) || !slots.length) {
    throw new Error('Slots must be a non-empty array.');
  }
  for (const slot of slots) {
    if (!slot || typeof slot !== 'object') {
      throw new Error (`Invalid slot for id: ${slot}. Expected an object.`);
    }
    if (!slot.id || !UUID_REGEX.test(slot.id)) {
      throw Error(`Invalid or missing id in the slot: ${slot.id}. Expected UUID.`);
    }
    if (!slot.employeeId || !UUID_REGEX.test(slot.employeeId)) {
      throw Error(`Invalid or missing employeeId in the slot: ${slot.id}. Expected UUID.`);
    }
    if (!slot.type || !SLOT_TYPES.includes(slot.type)) {
      throw Error(`Invalid type in the slot: ${slot.id}. Expected 'AVAILABLE', 'BLOCKED', or 'BOOKED'.`);
    }
    if (!slot.startTime || !TIMESTAMP_REGEX.test(new Date(slot.startTime).toISOString())) {
      throw Error(`Invalid or missing startTime in the slot: ${slot.id}. Expected Date object.`);
    }
    if (!slot.duration || !SLOT_DURATIONS.includes(slot.duration.minutes)) {
      throw Error(`Invalid or missing duration in the slot: ${slot.id}. Expected { minutes: 30 }, { minutes: 45 }, or { minutes: 60 }.`);
    }
    if (typeof slot.recurring !== 'boolean') {
      throw Error (`Invalid or missing recurring in the slot: ${slot.id}. Expected a boolean.`);
    }
    if (!slot.createdAt || !TIMESTAMP_REGEX.test(new Date(slot.createdAt).toISOString())) {
      throw Error(`Invalid or missing createdAt in the slot: ${slot.id}. Expected Date object.`);
    }
    if (!slot.updatedAt || !TIMESTAMP_REGEX.test(new Date(slot.updatedAt).toISOString())) {
      throw Error(`Invalid or missing updatedAt in the slot: ${slot.id}. Expected Date object.`);
    }
  }
}

const validateResponse = (response: { message: string, data: { employeeId: string, date: string, slotIds: string[] } }): void => {
  if (!response || typeof response !== 'object') {
    throw new Error('Response is required. Expected an object.');
  }

  const { message, data } = response;
  const { employeeId, date, slotIds } = data;

  if (!message || message !== 'Slots have been deleted.'){
    throw new Error(`Missing or invalid message. Expected 'Slots have been deleted.'.`);
  }
  if (!employeeId || !UUID_REGEX.test(employeeId)) {
    throw new Error('Missing or invalid employeeId. Expected UUID.');
  }
  if (!date || !DATE_REGEX.test(date)) {
    throw new Error('Missing or invalid date format. Expected YYYY-MM-DD.');
  }
  if (!slotIds || !Array.isArray(slotIds) || !slotIds.length) {
    throw new Error('Missing or invalid slotIds. Expected non-empty array of strings.');
  }
  if (!slotIds.every(slotId => UUID_REGEX.test(slotId))) {
    throw new Error ('Invalid id in the slotIds. Expected UUID.');
  }
}

const deleteSlots = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Deletes slots for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {Slot[]} body.slots - An array of slot objects to be deleted.
     * @returns {Object} - Message and data object containing employeeId, date, and an array of deleted slot IDs.
    */
    deleteSlots: builder.mutation<{ message: string, data: { employeeId: string, date: string, slotIds: string[] } }, { slots: Slot[] }>({
      query: (body) => {
        validateRequest(body);
        const slotIds = body.slots.map(slot => slot.id);
        return {
          url: 'slots/delete-slots',
          method: 'DELETE',
          body: { slotIds }
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          validateResponse(res.data);
          const { employeeId, date, slotIds } = res.data.data;
          const { start, end } = getWeekStartEndDatesFromDay(date);
          
          /** Stores message and deleted slots in cached undoSlice data. */
          const message = 'Slot(s) have been deleted.';
          dispatch(undoAdded({ message, data: args.slots }))
  
          /** Removes deleted slots from cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
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
        } catch (error) {
          console.error(error);
        }
      },
    }),
  }),
})

export const { useDeleteSlotsMutation } = deleteSlots;