import { api } from 'src/redux/api';
import { undoAdded } from 'src/redux/slices/undoSlice';
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

const updateSession = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Updates a session for a specific employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.sessionId - The ID of the session to be updated.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @returns {Object} Message and the data object containing prevStartTime date and session object.
    */
    updateSession: builder.mutation<{ message: string, data: { prevSlotId: string, prevStartTime: Date, session: Session } }, { sessionId: string, slotId: string }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'sessions/update-session',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { prevSlotId, prevStartTime, session } = res.data.data;
          console.log(res);
          const employeeId = session.employeeId;
          const prevDate = new Date(prevStartTime).toISOString().split('T')[0];
          const { start: prevStart } = getWeekStartEndDatesFromDay(prevDate);
          const nextDate = new Date(session.startTime).toISOString().split('T')[0];
          const { start: nextStart, end } = getWeekStartEndDatesFromDay(nextDate);
  
          /** Stores message adn sessions's previous state in cached undoSlice data. */
          const message = 'Session has been updated.';
          const sessionPrevState = {
            id: session.id,
            slotId: prevSlotId,
            employeeId: session.employeeId,
            customerId: session.customerId,
            startTime: prevStartTime,
            message: session.message,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
          }
          dispatch(undoAdded({ message, data: [sessionPrevState] }));
          
          /** Updates session in cached getWeekSessions data, if session stays in the same week*/
          if (prevStart === nextStart) {
            dispatch(api.util.patchQueryData(
              'getWeekSessions',
              { employeeId: employeeId, start: nextStart, end: end },
              [
                {
                  op: 'replace',
                  path: ['byId', session.id],
                  value: session
                },
              ]
            ));
          } else {
            dispatch(api.util.patchQueryData(
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
            ));
          }
        } catch (error) {
          console.error(error);
        }
      },
    }),
  }),
})

export const { useUpdateSessionMutation } = updateSession;