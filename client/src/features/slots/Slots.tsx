import { useParams } from 'react-router-dom';
import { api, useGetWeekSlotsQuery, useGetWeekSlotsRecurringDatesQuery } from 'src/redux/api';
import { ThemeToggle } from 'src/components/ThemeToggle';
import { Toasts } from 'src/components/Toasts';
import { Breadcrumbs } from 'src/features/slots/Breadcrumbs';
import { Header } from 'src/features/slots/Header';
import { Tabs } from 'src/components/Tabs';
import { Days } from 'src/features/slots/Days';
import { destructureParams } from 'src/utils/destructureParams';
import { useHandleBreakpoint } from 'src/hooks/useHandleBreakpoint';
import { useHandleTheme } from 'src/hooks/useHandleTheme';
import { getWeekDays } from 'src/utils/dates/getWeekDays';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/redux/store';
import { io, Socket } from 'socket.io-client';
import React from 'react';
import { Slot } from 'src/types/slots';
import { getDate } from 'src/utils/dates/getDate';

export const Slots = () => {
  const employeeId = '071dcf39-b002-4588-95f4-dc7df1c2bc83';
  const { week } = useParams() as { week: string };
  const { year, weekNumber } = destructureParams(week);
  const weekDays = getWeekDays(year, weekNumber);
  useGetWeekSlotsQuery({ employeeId, start: weekDays[0], end: weekDays[weekDays.length - 1] });
  useGetWeekSlotsRecurringDatesQuery({ employeeId, start: weekDays[0], end: weekDays[weekDays.length - 1] });
  useHandleTheme();
  const isMobile = useHandleBreakpoint({ windowInnerWidth: 480 });

  return (
    <div className='bg-background min-h-[100vh]'>
      <div id='slots' className='mx-auto xl:max-w-screen-xl 2xl:max-w-screen-2xl'>
        <div className='w-full pl-3 pr-2 pb-8 xs:pl-6 xs:pr-5 xs:border-x-[1px] border-border overflow-y-auto scrollbar scrollbar-thumb-border scrollbar-thumb-rounded-full scrollbar-track-card-background scrollbar-w-1 scrollbar-h-1'>
          <div className='hidden xs:flex gap-1 sticky z-20 top-0 pb-1 bg-background w-full justify-between items-center pt-4'>
            <Breadcrumbs year={year} weekNumber={weekNumber} />
            <ThemeToggle />
          </div>
          <Header
            year={year}
            weekNumber={weekNumber}
            weekDays={weekDays}
            isMobile={isMobile}
          />
          <Tabs />
          <Days
            employeeId={employeeId}
            year={year}
            weekNumber={weekNumber}
            weekDays={weekDays}
            isMobile={isMobile}
          />
        </div>
        <Toasts />
        <StreamReceiver
          employeeId={employeeId}
          weekDays={weekDays}
        />
      </div>
    </div>
  )
}

const StreamReceiver = (props: {
  employeeId: string,
  weekDays: string[]
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const socketRef: React.RefObject<Socket | null> = React.useRef(null);
  
  React.useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_STREAMING_URL);

    const slotsUpdated = ( payload: {
      eventAction: 'create' | 'update' | 'delete',
      data: Slot
    } ) => {
      const start = props.weekDays[0];
      const end = props.weekDays[props.weekDays.length - 1]
      const slot = payload.data as Slot;
      const slotDate = getDate(new Date(slot.startTime));
      
      if (payload.eventAction === 'create') {
        if (props.weekDays.includes(slotDate)) {
          /** Inserts slot into cached getWeekSlots data. */
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: props.employeeId, start, end },
            [
              {
                op: 'add',
                path: ['byId', slot.id],
                value: slot
              },
              {
                op: 'add',
                path: ['allIds', '-'],
                value: slot.id
              }
            ]
          ));
        }
      } else if (payload.eventAction === 'update') {

        if (props.weekDays.includes(slotDate)) {
            /** Updates slot in cached getWeekSlots data. */
            dispatch(api.util.patchQueryData(
              'getWeekSlots',
              { employeeId: props.employeeId, start, end },
              [
                {
                  op: 'replace',
                  path: ['byId', slot.id],
                  value: slot
                } 
              ]
            ));
        }
      } else if (payload.eventAction === 'delete') {
        /** Removes deleted slot from cached getWeekSlots data. */
        dispatch(api.util.patchQueryData(
          'getWeekSlots',
          { employeeId: props.employeeId, start, end },
          [
            {
              op: 'remove',
              path: ['byId', slot.id],
              value: slot
            },
            {
              op: 'remove',
              path: ['allIds', '-']
            }
          ]
        ));
      }
    }
    socketRef.current.on('slots', slotsUpdated);
    
    return () => {
      socketRef.current?.off('slots', slotsUpdated);
    };
  },[dispatch, props])
  
  return null;
}
