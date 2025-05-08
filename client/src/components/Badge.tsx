import { isPast } from 'src/utils/dates/isPast';
import { getMonthAndDay } from 'src/utils/dates/getMonthAndDay';
import { cn } from 'src/utils/cn';
import { getTime } from 'src/utils/dates/getTime';

export function Badge(props: {
  day: string | Date,
  value: 'time' | 'date'
}) {
  const textColor = isPast(props.day) ? 'text-text-tertiary' : 'text-text-primary';

  let copy: string = '';
  if (props.value === 'date') {
    copy = getMonthAndDay(props.day);
  } else if (props.value === 'time') {
    copy = getTime(props.day)
  }
  
  return (
    <div className={cn(
      textColor,
      'h-5 inline-flex items-center p-2 text-xs font-semibold border border-border rounded-full shadow-shadow shadow-sm')}
    >
      {copy}
    </div>
  )
}