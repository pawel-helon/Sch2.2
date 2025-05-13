import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetWeekSlotsQuery, useGetWeekSlotsRecurringDatesQuery } from 'src/redux/api';
import { ThemeToggle } from 'src/components/ThemeToggle';
import { Toasts } from 'src/components/Toasts';
import { Breadcrumbs } from 'src/features/slots/Breadcrumbs';
import { Header } from 'src/features/slots/Header';
import { Tabs } from 'src/components/Tabs';
import { Days } from 'src/features/slots/Days';
import { destructureParams } from 'src/utils/destructureParams';
import { useHandleBreakpoint } from 'src/hooks/useHandleBreakpoint';
import { useHandleTheme } from 'src/hooks/useHandleTheme';
import { useSlotsStream } from 'src/hooks/useSlotsStream';
import { getWeekDays } from 'src/utils/dates/getWeekDays';

export const Slots = memo(() => {
  const employeeId = '52ccfcd2-5825-4a2f-9a84-3a9d90b030a1';
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
});

const StreamReceiver = memo((props: {
  employeeId: string,
  weekDays: string[]
}) => {
  useSlotsStream(props.employeeId, props.weekDays);
  return null;
});
