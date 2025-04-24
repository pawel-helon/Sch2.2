import { isPast } from 'src/utils/dates/isPast';
import { getMonthAndDay } from 'src/utils/dates/getMonthAndDay';
import { cn } from 'src/utils/cn';

export function Badge(props: {
  day: string | Date
}) {
  const textColor = isPast(props.day) ? 'text-text-tertiary' : 'text-text-primary';
  
  return (
    <div className={cn(
      textColor,
      'h-5 inline-flex items-center p-2 text-xs font-semibold border border-border rounded-full shadow-shadow shadow-sm')}
    >
      {getMonthAndDay(props.day)}
    </div>
  )
}