import { Slash } from 'lucide-react';
import { getCurrentWeek } from 'src/utils/dates/getCurrentWeek';

export function Breadcrumbs(props: {
  year: number,
  weekNumber: number
}) {
  const { year, weekNumber } = getCurrentWeek();
  
  return (
    <ul className='hidden xs:flex gap-1 sticky z-20 top-0 left-0 right-0 items-center pt-4 pb-1 bg-background'>
      <li className='inline-flex items-center gap-1.5 font-medium transition-colors text-sm text-text-primary hover:text-text-tertiary cursor-pointer'>
        <a href={`/availability/${year}w${weekNumber}`} />
        Availability
      </li>
      <Slash className='size-4 text-text-tertiary'/>
      <li className='inline-flex items-center gap-1.5 text-sm text-text-primary font-medium'>
        {`Week ${props.weekNumber}`}
      </li>
    </ul>
  )
}