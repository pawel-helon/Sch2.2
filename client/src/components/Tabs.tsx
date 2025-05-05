import React from 'react';
import { getCurrentWeek } from 'src/utils/dates/getCurrentWeek';

export const Tabs = () => {
  const { year, weekNumber, dayName } = getCurrentWeek();
  const [sessionsTabClassName, setSessionsTabClassName] = React.useState<string>('');
  const [availabilityTabClassName, setAvailabilityTabClassName] = React.useState<string>('');

  React.useEffect(() => {
    const availabilityTab = document.getElementById('slots');
    const sessionsTab = document.getElementById('sessions');

    const activeTabClassName = '-mb-[2px] flex items-center justify-center px-3 text-sm font-medium text-accent-primary border-b-2 border-accent-primary hover:cursor-pointer ';
    const inactiveTabClassName = '-mb-[2px] flex items-center justify-center px-3 text-sm font-medium text-text-tertiary border-b-2 border-border hover:cursor-pointer ';

    if (sessionsTab) {
      setSessionsTabClassName(activeTabClassName);
      setAvailabilityTabClassName(inactiveTabClassName);
    } else if (availabilityTab) {
      setSessionsTabClassName(inactiveTabClassName);
      setAvailabilityTabClassName(activeTabClassName);
    }
  },[])
  
  return (
    <ul role='tablist' className='h-11 mb-8 flex border-b-2 border-border'>
      <li role='tab' className={sessionsTabClassName}>
        <a href={`/sessions/${year}w${weekNumber}/${dayName}`}>
          Sessions
        </a>
      </li>
      <li role='tab' className={availabilityTabClassName}>
        <a href={`/availability/${year}w${weekNumber}`}>
          Availability
        </a>
      </li>
    </ul>
  )
}