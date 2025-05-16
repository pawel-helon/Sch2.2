import { api } from 'src/redux/api';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { DATE_REGEX, TIMESTAMP_REGEX, UUID_REGEX } from 'src/constants/regex';
import { Slot } from 'src/types/slots';
import { SLOT_DURATIONS, SLOT_TYPES } from 'src/constants/data';

const validateRequest = (request: { employeeId: string, day: string }): void => {
  if (!request || typeof request !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  
  const { employeeId, day } = request;
  
  if (!employeeId || !UUID_REGEX.test(employeeId)) {
    throw new Error('Missing or invalid employeeId format. Expected UUID.');
  }
  if (!day || !DATE_REGEX.test(day)) {
    throw new Error('Missing or invalid day format. Expected YYYY-MM-DD.');
  }
  if (new Date().getTime() > new Date(new Date(day).setHours(23,59,59,999)).getTime()) {
    throw new Error('Invalid date. Expected non-past date.');
  }
}

const validateResponse = (response: { message: string, data: Slot } ): void => {
  if (!response || typeof response !== 'object') {
    throw new Error('Missing or invalid response. Expected an object.');
  }

  const { message, data: slot } = response;

  if(!message || message !== 'New slot has been added.'){
    throw new Error(`Missing or invalid message. Expected 'New slot has been added.'.`);
  }
  
  if (!slot || typeof slot !== 'object') {
    throw new Error('Missing or invalid slot. Expected an object.');
  }
  if (!slot.id || !UUID_REGEX.test(slot.id)) {
    throw new Error('Missing or invalid id. Expected UUID.');
  }
  if (!slot.employeeId || !UUID_REGEX.test(slot.employeeId)) {
    throw new Error('Missing or invalid employeeId. Expected UUID.');
  }
  if (!slot.type || !SLOT_TYPES.includes(slot.type)) {
    throw Error(`Missing or invalid type. Expected 'AVAILABLE', 'BLOCKED', or 'BOOKED'.`);
  }
  if (!slot.startTime || !TIMESTAMP_REGEX.test(new Date(slot.startTime).toISOString())) {
    throw new Error('Missing or invalid startTime. Expected Date object.');
  }
  if (!slot.duration || !SLOT_DURATIONS.includes(slot.duration.minutes)) {
    throw new Error('Missing or invalid duration. Expected { minutes: 30 }, { minutes: 45 }, or { minutes: 60 }.');
  }
  if (typeof slot.recurring !== 'boolean') {
    throw new Error('Invalid recurring. Expected boolean.');
  }
  if (!slot.createdAt || !TIMESTAMP_REGEX.test(new Date(slot.createdAt).toISOString())) {
    throw new Error('Missing or invalid createdAt. Expected Date object.');
  }
  if (!slot.updatedAt || !TIMESTAMP_REGEX.test(new Date(slot.updatedAt).toISOString())) {
    throw new Error('Missing or invalid updatedAt. Expected Date object.');
  }
}

const addSlot = api.injectEndpoints({
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
        validateRequest(body);
        return {
          url: 'slots/add-slot',
          method: 'POST',
          body
        }
      },
      /** Insert slot into cached getWeekSlots data. */
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          validateResponse(res.data);
          const data = res.data.data;
          const date = new Date(data.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);
          
          dispatch(api.util.patchQueryData(
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
          ));
        } catch (error) {
          console.error(error);
        }
      },
    })
  }),
})

export const { useAddSlotMutation } = addSlot;