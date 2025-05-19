import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { Session } from 'src/types';
import { validateResponse } from 'src/utils/validation/validateResponse';

const undoUpdateSession = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undo updating the session for a specific employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.sessionId - The ID of the session to be updated.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @returns {Object} Message and the data object containing prevStartTime date and session object.
    */
    undoUpdateSession: builder.mutation<{ message: string, data: { prevSlotId: string, prevStartTime: Date, session: Session } }, { sessionId: string, slotId: string }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest('undoUpdateSession', body);
        return {
          url: 'sessions/update-session',
          method: 'PUT',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'Session has been updated.') {
            dispatch(infoAdded({ message: 'Failed to undo update session.' }));
            console.error(message);
            return;
          };

          const { prevStartTime, session } = data as { prevStartTime: Date, session: Session };
          const employeeId = session.employeeId;
          const prevDate = new Date(prevStartTime).toISOString().split('T')[0];
          const { start: prevStart } = getWeekStartEndDatesFromDay(prevDate);
          const nextDate = new Date(session.startTime).toISOString().split('T')[0];
          const { start: nextStart, end } = getWeekStartEndDatesFromDay(nextDate);

          /** Validate response data. */
          validateResponse('undoUpdateSession', { prevStartTime, session });
          
          /** Update session in cached getWeekSessions data, if session stays in the same week*/
          if (prevStart === nextStart) {
            dispatch(api.util.patchQueryData(
              'getWeekSessions',
              { employeeId: employeeId, start: nextStart, end: end },
              [
                { op: 'replace', path: ['byId', session.id], value: session }
              ]
            ));
          } else {
            dispatch(api.util.patchQueryData(
              'getWeekSessions',
              { employeeId: employeeId, start: nextStart, end: end },
              [
                { op: 'remove', path: ['byId', session.id] },
                { op: 'remove', path: ['allIds', '-'] }
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

export const { useUndoUpdateSessionMutation } = undoUpdateSession;