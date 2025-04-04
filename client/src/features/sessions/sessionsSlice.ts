import { schedulingApi } from "src/lib/schedulingApi";
import { NormalizedSessions, Session } from "src/lib/types";
import { validateAddSessionInput, validateDeleteSessionInput, validateGetWeekSessionsInput, validateUpdateSessionInput } from "src/utils/inputValidation";

export const sessionsSlice = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches weekly sessions for a specific employee within a date range.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.employeeId - The ID of the employee.
     * @param {string} body.start - The start date in YYYY-MM-DD format.
     * @param {string} body.end - The end date in YYYY-MM-DD format.
     * @returns {NormalizedSessions[]} An array of normalized sessions.
    */
    getWeekSessions: builder.query<NormalizedSessions[], { employeeId: string, start: string, end: string}>({
      query: (body) => {
        validateGetWeekSessionsInput(body);
        return {
          url: '/sessions/get-week-sessions',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string, data: NormalizedSessions}) => {
        return [response.data];
      },
      providesTags: ['Sessions']
    }),
    /**
     * Restores a session for a specific employee.
     * 
     * @param {Object} body - The request payload.
     * @param {Session} body.session - The session object to be added.
     * @returns {Session} The added session object.
    */
    addSession: builder.mutation<Session, { session: Session }>({
      query: (body) => {
        validateAddSessionInput(body);
        return {
          url: 'sessions/add-session',
          method: 'POST',
          body
        }
      },
      invalidatesTags: ['Sessions']
    }),
    /**
     * Updates a session for a specific employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.sessionId - The ID of the session to be updated.
     * @param {string} body.slotId - The ID of the slot to be updated.
     * @returns {Session} The updated session object.
    */
    updateSession: builder.mutation<Session, { sessionId: string, slotId: string }>({
      query: (body) => {
        validateUpdateSessionInput(body);
        return {
          url: 'sessions/update-session',
          method: 'PUT',
          body
        }
      },
      invalidatesTags: ['Sessions']
    }),
    /**
     * Deletes a session for a specific employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.sessionId - The ID of the session to be deleted.
     * @returns {string} The ID of the deleted session.
     */
    deleteSession: builder.mutation<{ sessionId: string }, { sessionId: string}>({
      query: (body) => {
        validateDeleteSessionInput(body);
        return {
          url: 'sessions/delete-session',
          method: 'POST',
          body
        }
      },
      invalidatesTags: ['Sessions']
    })
  })
})

export const {
  useGetWeekSessionsQuery,
  useAddSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation
} = sessionsSlice;