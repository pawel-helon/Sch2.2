import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from 'src/components/DropdownMenu';
import { Tooltip, TooltipContent, TooltipTrigger } from 'src/components/Tooltip';
import { Heading } from 'src/components/typography/Heading';
import { Button } from 'src/components/Button';
import { getDateRange } from 'src/utils/dates/getDateRange';
import { getPrevNextWeeks } from 'src/utils/dates/getPrevNextWeeks';
import { getPrevNextWeeksDateRanges } from 'src/utils/dates/getPrevNextWeeksDateRanges';
import { getWeeks } from 'src/utils/dates/getWeeks';
import { cn } from 'src/utils/cn';

export const Header = (props: {
  year: number,
  weekNumber: number,
  weekDays: string[],
  isMobile: boolean
}) => {

  let content: React.ReactNode = null;
  if (props.isMobile) {
    content = (
      <Mobile
        year={props.year}
        weekNumber={props.weekNumber}
        weekDays={props.weekDays}
      />
    );
  } else {
    content = (
      <Desktop
        year={props.year}
        weekNumber={props.weekNumber}
        weekDays={props.weekDays}
      />
    );
  }

  return content;
}

const Mobile = (props: {
  year: number,
  weekNumber: number,
  weekDays: string[]
}) => {
  return (
    <div className='flex flex-col my-[4rem]'>
      <div className='flex justify-between items-start'>
        <SelectWeek
          year={props.year}
          weekNumber={props.weekNumber}
          weekDays={props.weekDays}
        />
        <PrevNextButtons
          year={props.year}
          weekNumber={props.weekNumber}
          weekDays={props.weekDays}
        />
      </div>
      <Heading variant='h1'>Scheduling</Heading>
    </div>
  )
}


const Desktop = (props: {
  year: number,
  weekNumber: number,
  weekDays: string[]
}) => {
  return (
    <div className='flex flex-col gap-2 my-[4rem]'>
      <div className='flex gap-2 items-center'>
        <PrevNextButtons
          year={props.year}
          weekDays={props.weekDays}
          weekNumber={props.weekNumber}
        />
      </div>
      <div className='flex items-start gap-2'>
        <Heading variant='h1'>Scheduling</Heading>
        <SelectWeek
          year={props.year}
          weekDays={props.weekDays}
          weekNumber={props.weekNumber}
        />
      </div>
    </div>
  )
}

const SelectWeek = (props: {
  year: number,
  weekNumber: number,
  weekDays: string[]
}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const weeks = getWeeks(props.year);
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <div className='min-w-[8rem] h-6 inline-flex justify-between items-center px-3 border border-border text-xs text-text-primary font-semibold rounded-full shadow-shadow shadow-sm bg-background cursor-pointer'>
          {getDateRange(props.weekDays[0], props.weekDays[props.weekDays.length - 1])}
          <ChevronDown size={16} className='ml-2 -mr-1'/>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom' sideOffset={8} align='start' className='h-min flex flex-col bg-background-hover'>
        <div className='bg-background-hover w-full max-h-[280px] flex flex-col pr-1 gap-0.5 overflow-y-scroll scrollbar scrollbar-thumb-muted scrollbar-thumb-rounded-full scrollbar-track-card-background scrollbar-w-1 scrollbar-h-1'>
          {weeks.map((w: { week: number, firstDay: string, lastDay: string}) => (
            <a key={w.week} href={`/sessions/${props.year}w${w.week}`} className={cn(w.week === props.weekNumber ? 'bg-background-hover' : '' ,'h-8 text-xs text-left px-1.5 py-2 rounded-md hover:bg-background-hover hover:text-text-tertiary')}>
              {getDateRange(w.firstDay, w.lastDay)}
            </a>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const PrevNextButtons = (props: {
  year: number,
  weekDays: string[],
  weekNumber: number
}) => {
  const weeks = getWeeks(props.year);
  const { prevWeekNumber, nextWeekNumber, yearOnBackwardNavigation, yearOnForewardNavigation } = getPrevNextWeeks(props.weekDays, props.weekNumber);

  return (
    <div className='flex gap-2 items-center'>
      <Tooltip>
        <TooltipTrigger asChild>
          <a href={`/sessions/${yearOnBackwardNavigation}w${prevWeekNumber}`}>
            <Button size='icon' variant='outline' className='rounded-full'>
              <ChevronLeft size={18}/>
            </Button>
          </a>
        </TooltipTrigger>
        <TooltipContent side='top' sideOffset={16} align='start' className='text-xs rounded-full'>
          {getPrevNextWeeksDateRanges(weeks, prevWeekNumber)}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <a href={`/sessions/${yearOnForewardNavigation}w${nextWeekNumber}`}>
            <Button size='icon' variant='outline' className='rounded-full'>
              <ChevronRight size={18}/>
            </Button>
          </a>
        </TooltipTrigger>
        <TooltipContent side='top' sideOffset={16} align='start' className='text-xs rounded-full'>
          {getPrevNextWeeksDateRanges(weeks, nextWeekNumber)}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
