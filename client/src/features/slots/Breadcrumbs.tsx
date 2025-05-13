import { memo } from 'react';
import { Slash } from 'lucide-react';
import { getCurrentWeek } from 'src/utils/dates/getCurrentWeek';

interface BreadcrumbsProps {
  year: number;
  weekNumber: number;
}

export const Breadcrumbs = memo((props: BreadcrumbsProps) => {
  const { year, weekNumber } = getCurrentWeek();
  
  return (
    <ul className='flex gap-1'>
      <li className='inline-flex items-center gap-1.5 font-medium  text-sm text-text-primary hover:text-text-tertiary cursor-pointer'>
        <a href={`/availability/${year}w${weekNumber}`} />
        Availability
      </li>
      <Slash className='size-4 text-text-tertiary'/>
      <li className='inline-flex items-center gap-1.5 text-sm text-text-primary font-medium'>
        {`Week ${props.weekNumber}`}
      </li>
    </ul>
  )
});