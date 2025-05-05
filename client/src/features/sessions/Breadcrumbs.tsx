import { Slash } from 'lucide-react';
import { capitalizeFirstLetter } from 'src/utils/capitalizeFirstLetter';
import { getCurrentWeek } from 'src/utils/dates/getCurrentWeek';

export function Breadcrumbs(props: {
  year: number,
  weekNumber: number,
  day: string
}) {
  const { year, weekNumber } = getCurrentWeek();
  
  return (
    <ul className='flex gap-1'>
      <li className='inline-flex items-center gap-1.5 font-medium  text-sm text-text-primary hover:text-text-tertiary cursor-pointer'>
        <a href={`/availability/${year}w${weekNumber}`} />
        Sessions
      </li>
      <Slash className='size-4 text-text-tertiary'/>
      <li className='inline-flex items-center gap-1.5 text-sm text-text-primary font-medium'>
        {`Week ${props.weekNumber}`}
      </li>
      <Slash className='size-4 text-text-tertiary'/>
      <li className='inline-flex items-center gap-1.5 text-sm text-text-primary font-medium'>
        {capitalizeFirstLetter(props.day)}
      </li>
    </ul>
  )
}