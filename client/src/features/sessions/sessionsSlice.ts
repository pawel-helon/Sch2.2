import { schedulingApi } from "src/lib/schedulingApi";
import {
  validateAddSessionInput,
  validateDeleteSessionInput,
  validateUpdateSessionInput,
} from 'src/utils/inputValidation';
import { Session } from "src/lib/types";
import { getWeekStartEndDatesFromDay } from "src/lib/helpers";
import { sessionsMutationAdded } from "./sessionsMutationsSlice";

export const sessionsSlice = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Restores a session for a specific employee.
     * 
     * @param {Object} body - The request payload.
     * @param {Session} body.session - The session object to be added.
     * @returns {Object} Message and restored session object.
    */
    addSession: builder.mutation<{message: string, data: Session }, { session: Session }>({
      query: (body) => {
        validateAddSessionInput(body);
        return {
          url: 'sessions/add-session',
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
        validateUpdateSessionInput(body);
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
        dispatch(sessionsMutationAdded(sessionPrevState));
        
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
    /**
     * Deletes a session for a specific employee.
     * 
     * @param {Object} body - The request payload.
     * @param {string} body.sessionId - The ID of the session to be deleted.
     * @returns {Object} The ID of the deleted session, the ID of the employee, and start time of the session.
    */
    deleteSession: builder.mutation<{ message: string, data: { sessionId: string, employeeId: string, startTime: Date } }, { session: Session }>({
      query: (body) => {
        validateDeleteSessionInput(body);
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

        /** Updates session in cached getWeekSessions data, if session stays in the same week*/
        dispatch(sessionsMutationAdded(args.session));
        
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
  })
})

export const {
  useAddSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation
} = sessionsSlice