import { RefObject, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { api } from 'src/redux/api';
import { AppDispatch } from 'src/redux/store';
import { getPatchOperations } from 'src/utils/getPatchOperations';
import { getDate } from 'src/utils/dates/getDate';
import { Session } from 'src/types';

export const useSessionsStream = (
  employeeId: string,
  weekDays: string[]
) => {
  const dispatch = useDispatch<AppDispatch>();
  const socketRef: RefObject<Socket | null> = useRef(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_STREAMING_URL);

    const handleSessionsUpdate = (payload: {
      eventAction: 'create' | 'update' | 'delete',
      data: Session
    }) => {
      const start = weekDays[0];
      const end = weekDays[weekDays.length - 1];
      const session = payload.data as Session;
      const sessionDate = getDate(new Date(session.startTime));

      if (!weekDays.includes(sessionDate)) return;

      const queryArgs = { employeeId: employeeId, start, end };
      const patchOperations = getPatchOperations(payload.eventAction, session);

      dispatch(api.util.patchQueryData('getWeekSessions', queryArgs, patchOperations));
    }

    socketRef.current.on('sessions', handleSessionsUpdate);

    return () => {
      socketRef.current?.off('sessions', handleSessionsUpdate);
      socketRef.current?.disconnect();
    }
  },[dispatch, employeeId, weekDays]);
}
