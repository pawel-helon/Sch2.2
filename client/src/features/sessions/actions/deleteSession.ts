import { TIMESTAMP_REGEX, UUID_REGEX } from "src/lib/constants";
import { getWeekStartEndDatesFromDay } from "src/lib/helpers";
import { schedulingApi } from "src/lib/schedulingApi";
import { Session } from "src/lib/types";
import { undoAdded } from "src/lib/undoSlice";

export const validateInput = (input: { session: Session }): void => {
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

const deleteSession = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Deletes a session for a specific employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.sessionId - The ID of the session to be deleted.
     * @returns {Object} The ID of the deleted session, the ID of the employee, and start time of the session.
    */
    deleteSession: builder.mutation<{ message: string, data: { sessionId: string, employeeId: string, startTime: Date } }, { session: Session }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'sessions/delete-session',
          method: 'DELETE',
          body: { sessionId: body.session.id }
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const { sessionId, employeeId, startTime } = res.data.data;
        const date = new Date(startTime).toISOString().split('T')[0];
        const { start, end } = getWeekStartEndDatesFromDay(date);

        /** Updates session in cached undoSlice data.*/
        const message = 'TODO';
        dispatch(undoAdded({ message, data: [args.session] }));
        
        /** Removes deleted session from cached getWeekSessions data. */
        dispatch(schedulingApi.util.patchQueryData(
          'getWeekSessions',
          { employeeId: employeeId, start: start, end: end },
            [
              {
                op: 'remove',
                path: ['byId', sessionId],
                value: sessionId
              },
              {
                op: 'remove',
                path: ['allIds', '-'],
              }
            ]
        ))
      },
    }),
  }),
})

export const { useDeleteSessionMutation } = deleteSession;