import { api } from 'src/redux/api';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Session } from 'src/types';

const deleteSession = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Delete a session for a specific employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.sessionId - The ID of the session to be deleted.
     * @returns {Object} The ID of the deleted session, the ID of the employee, and start time of the session.
    */
    deleteSession: builder.mutation<{ message: string, data: { sessionId: string, employeeId: string, startTime: Date } | null }, { session: Session }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest('deleteSession', body);
        return {
          url: 'sessions/delete-session',
          method: 'DELETE',
          body: { sessionId: body.session.id }
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'Session has been deleted.') {
            dispatch(infoAdded({ message: 'Failed to delete session.' }));
            console.error(message);
            return;
          };
          
          const { sessionId, employeeId, startTime } = data as { sessionId: string, employeeId: string, startTime: Date };
          const date = new Date(startTime).toISOString().split('T')[0];
          const { start, end } = getWeekStartEndDatesFromDay(date);

          /** Validate response data. */
          validateResponse('deleteSession', { sessionId, employeeId, startTime });
  
          /** Store message and session in cached undoSlice data.*/
          dispatch(undoAdded({ message, data: [args.session] }));
          
          /** Remove deleted session from cached getWeekSessions data. */
          dispatch(api.util.patchQueryData(
            'getWeekSessions',
            { employeeId: employeeId, start: start, end: end },
              [
                { op: 'remove', path: ['byId', sessionId], value: sessionId },
                { op: 'remove', path: ['allIds', '-'] }
              ]
          ));
        } catch (error) {
          console.error(error);
        }
      },
    }),
  }),
})

export const { useDeleteSessionMutation } = deleteSession;