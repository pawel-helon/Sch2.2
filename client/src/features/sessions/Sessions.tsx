import { useParams } from 'react-router-dom';
import { useGetSlotsQuery, useGetWeekSessionsQuery } from 'src/api/schedulingApi';
import { ThemeToggle } from 'src/components/ThemeToggle';
import { Toasts } from 'src/components/Toasts';
import { Breadcrumbs } from './Breadcrumbs';
import { Header } from './Header';
import { Tabs } from 'src/components/Tabs';
import { DayDropdown } from './DayDropdown';
import { Week } from './week';
import { DaySessions } from './day-sessions';
import { useHandleBreakpoint } from 'src/hooks/useHandleBreakpoint';
import { useHandleTheme } from 'src/hooks/useHandleTheme';
import { getWeekDays } from 'src/utils/dates/getWeekDays';
import { destructureParams } from 'src/utils/destructureParams';

export const Sessions = () => {
  const employeeId = '071dcf39-b002-4588-95f4-dc7df1c2bc83';
  const { week, day } = useParams() as { week: string, day: string };
  const { year, weekNumber } = destructureParams(week);
  const weekDays = getWeekDays(year, weekNumber);
  useGetWeekSessionsQuery({ employeeId, start: weekDays[0], end: weekDays[weekDays.length - 1] });
  useGetSlotsQuery({ employeeId });
  useHandleTheme();
  const isMobile = useHandleBreakpoint({ windowInnerWidth: 480 });

  return (
    <div className='bg-background min-h-[100vh]'>
      <div id='sessions' className='mx-auto xl:max-w-screen-xl 2xl:max-w-screen-2xl'>
        <div className='w-full pl-3 pr-2 pb-8 xs:pl-6 xs:pr-5 xs:border-x-[1px] border-border overflow-y-auto scrollbar scrollbar-thumb-border scrollbar-thumb-rounded-full scrollbar-track-card-background scrollbar-w-1 scrollbar-h-1'>
          <div className='hidden xs:flex gap-1 sticky z-20 top-0 pb-1 bg-background w-full justify-between items-center pt-4'>
            <Breadcrumbs year={year} weekNumber={weekNumber} day={day} />
            <ThemeToggle />
          </div>
          <Header
            year={year}
            weekNumber={weekNumber}
            weekDays={weekDays}
            isMobile={isMobile}
          />
          <Tabs />
          <DayDropdown year={year} weekNumber={weekNumber} dayName={day} weekDays={weekDays} />
          <main className='grid grid-cols-1 md:grid-cols-3 gap-4 md:pt-9'>
            <DaySessions year={year} weekNumber={weekNumber} dayName={day} isMobile={isMobile} />
            <Week year={year} weekNumber={weekNumber} dayName={day} />
          </main>
        </div>
        <Toasts />
      </div>
    </div>
  )
}