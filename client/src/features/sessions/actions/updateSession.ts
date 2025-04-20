import { UUID_REGEX } from "src/lib/constants";
import { getWeekStartEndDatesFromDay } from "src/lib/helpers";
import { schedulingApi } from "src/lib/schedulingApi";
import { Session } from "src/lib/types";
import { undoAdded } from "src/lib/undoSlice";

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

const updateSession = schedulingApi.injectEndpoints({
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
        const res = await queryFulfilled;
        const { prevSlotId, prevStartTime, session } = res.data.data;
        const employeeId = session.employeeId;
        const prevDate = new Date(prevStartTime).toISOString().split('T')[0];
        const { start: prevStart } = getWeekStartEndDatesFromDay(prevDate);
        const nextDate = new Date(session.startTime).toISOString().split('T')[0];
        const { start: nextStart, end } = getWeekStartEndDatesFromDay(nextDate);

        /** Stores sessions's previous state in cached sessionsMutationsSlice data. */
        const message = 'TODO';
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
        dispatch(undoAdded({ message, data: sessionPrevState}));
        
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

export const { useUpdateSessionMutation } = updateSession;