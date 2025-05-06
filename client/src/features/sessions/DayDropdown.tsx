import React from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from 'src/components/DropdownMenu';
import { Paragraph } from 'src/components/typography/Paragraph';
import { capitalizeFirstLetter } from 'src/utils/capitalizeFirstLetter';
import { getDayName } from 'src/utils/dates/getDayName';
import { getMonthAndDay } from 'src/utils/dates/getMonthAndDay';

export const DayDropdown = (props: {
  year: number,
  weekNumber: number,
  dayName: string,
  weekDays: string[]
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <div className='w-full flex md:hidden justify-end mb-4'>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <div className='min-w-[9rem] h-8 inline-flex items-center justify-between px-3 text-xs text-text-primary font-semibold border border-border rounded-full shadow-shadow shadow-sm'>
            {capitalizeFirstLetter(props.dayName)}
            <ChevronDown size={16} className='ml-2 -mr-1'/>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent side='bottom' sideOffset={8} align='end' className='min-w-[9rem] h-min flex flex-col bg-background shadow-shadow shadow-sm'>
          {props.weekDays
            .filter((d) => getDayName(d) !== props.dayName)
            .map((d) => (
              <a
              key={d}
              href={`/sessions/${props.year}w${props.weekNumber}/${getDayName(d)}`}
              onClick={() => setOpen(!open)}
              className='h-8 flex justify-between text-xs text-right px-1.5 py-2 rounded-md hover:bg-background-hover hover:text-text-tertiary'
              >
                <Paragraph variant='thick' size='sm' className='text-text-tertiary'>{capitalizeFirstLetter(getDayName(d))}</Paragraph>
                <Paragraph variant='thin' size='sm' className='text-text-primary'>{getMonthAndDay(d)}</Paragraph>
              </a>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
