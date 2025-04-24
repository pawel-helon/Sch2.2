import { schedulingApi } from 'src/api/schedulingApi';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { TIMESTAMP_REGEX, UUID_REGEX } from 'src/constants/regex';
import { Session } from 'src/types/sessions';

const validateInput = (input: { session: Session }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }

  const { session } = input;

  if (!session || typeof session !== 'object' || !Object.keys(session).length) {
    throw new Error('Invalid input data: session must be a non-empty object.');
  }

  if (!session.id || !session.slotId || !session.employeeId || !session.customerId || !session.startTime || !session.createdAt || !session.updatedAt) {
    throw new Error('Required fields: id, slotId, employeeId, customerId, startTime, createdAt, updatedAt.');
  }

  if (!UUID_REGEX.test(session.id)) {
    throw new Error('Invalid session ID format. Expected UUID.');
  }

  if (!UUID_REGEX.test(session.slotId)) {
    throw new Error('Invalid slot ID format. Expected UUID.');
  }
  
  if (!UUID_REGEX.test(session.employeeId)) {
    throw new Error('Invalid employee ID format. Expected UUID.');
  }

  if (!UUID_REGEX.test(session.customerId)) {
    throw new Error('Invalid customer ID format. Expected UUID.');
  }

  if (!TIMESTAMP_REGEX.test(new Date(session.startTime).toISOString())) {
    throw new Error('Invalid startTime format. Expected a Date object.');
  }
  
  if (!TIMESTAMP_REGEX.test(new Date(session.createdAt).toISOString())) {
    throw new Error('Invalid createdAt format. Expected a Date object.');
  }

  if (!TIMESTAMP_REGEX.test(new Date(session.updatedAt).toISOString())) {
    throw new Error('Invalid updateAt format. Expected a Date object.');
  }
}

const undoDeleteSession = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undoes deleting session for a specific employee.
     * 
     * @param {Object} body - The request payload.
     * @param {Session} body.session - The session object to be added.
     * @returns {Object} Message and restored session object.
    */
    undoDeleteSession: builder.mutation<{message: string, data: Session }, { session: Session }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'sessions/undo-delete-session',
          method: 'POST',
          body
        }
      },
      /** Inserts restored session into cached getWeekSessions data. */
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const { data: session } = res.data;
        const employeeId = session.employeeId;
        const date = new Date(session.startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);
  
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSessions',
          { employeeId: employeeId, start: start, end: end },
            [
              {
                op: 'add',
                path: ['byId', session.id],
                value: session
              },
              {
                op: 'add',
                path: ['allIds', '-'],
                value: session.id
              }
            ]
        ))
      },
    }),
  }),
})

export const { useUndoDeleteSessionMutation } = undoDeleteSession;