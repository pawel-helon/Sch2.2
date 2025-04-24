import { schedulingApi } from 'src/api/schedulingApi';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { UUID_REGEX } from 'src/constants/regex';
import { Session } from 'src/types/sessions';

const validateInput = (input: { sessionId: string, slotId: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }

  const { sessionId, slotId } = input;

  if (!sessionId || !slotId) {
    throw new Error('All fields are required: sessionId, slotId.');
  }

  if (!UUID_REGEX.test(sessionId)) {
    throw new Error('Invalid session ID format. Expected UUID.');
  }

  if (!UUID_REGEX.test(slotId)) {
    throw new Error('Invalid slot ID format. Expected UUID.');
  }
}

const undoUpdateSession = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undoes updating the session for a specific employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.sessionId - The ID of the session to be updated.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @returns {Object} Message and the data object containing prevStartTime date and session object.
    */
    undoUpdateSession: builder.mutation<{ message: string, data: { prevSlotId: string, prevStartTime: Date, session: Session } }, { sessionId: string, slotId: string }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'sessions/update-session',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        const { prevStartTime, session } = res.data.data;
        const employeeId = session.employeeId;
        const prevDate = new Date(prevStartTime).toISOString().split('T')[0];
        const { start: prevStart } = getWeekStartEndDatesFromDay(prevDate);
        const nextDate = new Date(session.startTime).toISOString().split('T')[0];
        const { start: nextStart, end } = getWeekStartEndDatesFromDay(nextDate);
        
        /** Updates session in cached getWeekSessions data, if session stays in the same week*/
        if (prevStart === nextStart) {
          dispatch(schedulingApi.util.patchQueryData(
            'getWeekSessions',
            { employeeId: employeeId, start: nextStart, end: end },
            [
              {
                op: 'replace',
                path: ['byId', session.id],
                value: session
              },
            ]
          ))
        } else {
          dispatch(schedulingApi.util.patchQueryData(
            'getWeekSessions',
            { employeeId: employeeId, start: nextStart, end: end },
            [
              {
                op: 'remove',
                path: ['byId', session.id],
              },
              {
                op: 'remove',
                path: ['allIds', '-']
              }
            ]
          ))
        }
      },
    }),
  }),
})

export const { useUndoUpdateSessionMutation } = undoUpdateSession;