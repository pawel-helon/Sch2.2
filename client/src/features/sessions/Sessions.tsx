import { useParams } from 'react-router-dom';
import { useGetWeekSessionsQuery } from 'src/redux/api';
import { ThemeToggle } from 'src/components/ThemeToggle';
import { Toasts } from 'src/components/Toasts';
import { Breadcrumbs } from './Breadcrumbs';
import { Header } from './Header';
import { Tabs } from 'src/components/Tabs';
import { DayDropdown } from './DayDropdown';
import { Week } from './week';
import { Day } from './day';
import { useHandleBreakpoint } from 'src/hooks/useHandleBreakpoint';
import { useHandleTheme } from 'src/hooks/useHandleTheme';
import { useSessionsStream } from 'src/hooks/useSessionsStream';
import { getWeekDays } from 'src/utils/dates/getWeekDays';
import { destructureParams } from 'src/utils/destructureParams';

export const Sessions = () => {
  const employeeId = '52ccfcd2-5825-4a2f-9a84-3a9d90b030a1';
  const { week, day } = useParams() as { week: string, day: string };
  const { year, weekNumber } = destructureParams(week);
  const weekDays = getWeekDays(year, weekNumber);
  useGetWeekSessionsQuery({ employeeId, start: weekDays[0], end: weekDays[weekDays.length - 1] });
  useHandleTheme();
  const isMobile = useHandleBreakpoint({ windowInnerWidth: 480 });
  const isTablet = useHandleBreakpoint({ windowInnerWidth: 640 });

  return (
    <div className='bg-background min-h-[100vh]'>
      <div id='sessions' className='mx-auto xl:max-w-screen-xl 2xl:max-w-screen-2xl'>
        <div className='w-full pl-3 pr-2 pb-8 xs:pl-6 xs:pr-5 xs:border-x-[1px] border-border overflow-y-auto scrollbar scrollbar-thumb-border scrollbar-thumb-rounded-full scrollbar-track-card-background scrollbar-w-1 scrollbar-h-1'>
          <div className='flex gap-1 sticky z-20 top-0 pb-1 bg-background w-full justify-between items-center pt-4'>
            <Breadcrumbs year={year} weekNumber={weekNumber} day={day} />
            <ThemeToggle />
          </div>
          <Header year={year} weekNumber={weekNumber} weekDays={weekDays} isMobile={isMobile} />
          <Tabs />
          {isTablet && <DayDropdown year={year} weekNumber={weekNumber} dayName={day} weekDays={weekDays} />}
          <main className='grid grid-cols-1 md:grid-cols-3 gap-4 md:pt-9'>
            <Day year={year} weekNumber={weekNumber} currentDay={day} isMobile={isMobile} />
            {!isMobile && <Week year={year} weekNumber={weekNumber} currentDay={day} />}
          </main>
        </div>
        <Toasts />
        <StreamReceiver
          employeeId={employeeId}
          weekDays={weekDays}
        />
      </div>
    </div>
  )
};

const StreamReceiver = (props: {
  employeeId: string,
  weekDays: string[]
}) => {
  useSessionsStream(props.employeeId, props.weekDays);
  return null;
}