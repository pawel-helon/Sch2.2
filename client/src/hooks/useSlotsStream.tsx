import { RefObject, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { api } from 'src/redux/api';
import { AppDispatch } from 'src/redux/store';
import { getPatchOperations } from 'src/redux/utils/getPatchOperations';
import { getDate } from 'src/utils/dates/getDate';
import { Slot } from 'src/types/slots';

export const useSlotsStream = (
  employeeId: string,
  weekDays: string[]
) => {
  const dispatch = useDispatch<AppDispatch>();
  const socketRef: RefObject<Socket | null> = useRef(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_STREAMING_URL);

    const handleSlotsUpdate = (payload: {
      eventAction: 'create' | 'update' | 'delete';
      data: Slot
    }) => {
      const start = weekDays[0];
      const end = weekDays[weekDays.length - 1];
      const slot = payload.data as Slot;
      const slotDate = getDate(new Date(slot.startTime));

      if (!weekDays.includes(slotDate)) return;

      const queryArgs = { employeeId: employeeId, start, end };
      const patchOperations = getPatchOperations(payload.eventAction, slot);

      dispatch(api.util.patchQueryData('getWeekSlots', queryArgs, patchOperations));
    }

    socketRef.current.on('slots', handleSlotsUpdate);

    return () => {
      socketRef.current?.off('slots', handleSlotsUpdate);
      socketRef.current?.disconnect();
    }
  },[dispatch, employeeId, weekDays]);
}
