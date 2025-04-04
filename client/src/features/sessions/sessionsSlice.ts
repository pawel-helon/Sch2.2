import { schedulingApi } from "src/lib/schedulingApi";
import { NormalizedSessions, Session } from "src/lib/types";

export const sessionsSlice = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeekSessions: builder.query<NormalizedSessions[], { employeeId: string, start: string, end: string}>({
      query: (body) => ({
        url: '/sessions/get-week-sessions',
        method: 'POST',
        body
      }),
      transformResponse: (response: { message: string, data: NormalizedSessions}) => {
        return [response.data];
      },
      providesTags: ['Sessions']
    }),
    addSession: builder.mutation<Session, Session>({
      query: (body) => ({
        url: 'sessions/add-session',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Sessions']
    }),
    updateSession: builder.mutation<Session, { sessionId: string, slotId: string }>({
      query: (body) => ({
        url: 'sessions/update-session',
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Sessions']
    }),
    deleteSession: builder.mutation<{ sessionId: string }, { sessionId: string}>({
      query: (body) => ({
        url: 'sessions/delete-session',
        method: 'POST',
        body
      }),
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