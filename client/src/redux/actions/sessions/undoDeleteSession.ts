import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Session } from 'src/types';

const undoDeleteSession = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Undo deleting session for a specific employee.
     * 
     * @param {Object} body - The request payload.
     * @param {Session} body.session - The session object to be added.
     * @returns {Object} Message and restored session object.
    */
    undoDeleteSession: builder.mutation<{ message: string, data: Session | null }, { session: Session }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest({ endpoint: 'undoDeleteSession', data: body });
        return {
          url: 'sessions/undo-delete-session',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'Session has been restored.') {
            dispatch(infoAdded({ message: 'Failed to restore session.' }));
            console.error(message);
            return;
          };

          const session = data as Session;
          const employeeId = session.employeeId;
          const date = new Date(session.startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);

          /** Validate response data. */
          validateResponse({ endpoint: 'undoDeleteSession', data: session })
    
          /** Insert restored session into cached getWeekSessions data. */
          dispatch(api.util.patchQueryData(
            'getWeekSessions',
            { employeeId: employeeId, start: start, end: end },
              [
                { op: 'add', path: ['byId', session.id], value: session },
                { op: 'add', path: ['allIds', '-'], value: session.id }
              ]
          ));
        } catch (error) {
          console.error(error);
        }
      },
    }),
  }),
})

export const { useUndoDeleteSessionMutation } = undoDeleteSession;