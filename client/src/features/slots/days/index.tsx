import React from 'react';
import { MobileDayCard, DesktopDayCard } from 'src/features/slots/days/Card';
import { Switch } from 'src/components/Switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'src/components/Accordion';
import { Paragraph } from 'src/components/typography/Paragraph';
import { cn } from 'src/utils/cn';
import { getDayOfWeek } from 'src/utils/dates/getDayOfWeek';
import { isPast } from 'src/utils/dates/isPast';
import { getNumOfPlaceholders } from 'src/utils/data/getNumOfPlaceholders';
import { useHandleBreakpoint } from 'src/hooks/useHandleBreakpoint';
import { Badge } from 'src/components/Badge';

export const Days = (props: {
  year: number,
  weekNumber: number,
  weekDays: string[]
}) => {
  const isMobile = useHandleBreakpoint({ windowInnerWidth: 480 });
  const [isRecurringSlotsOnly, setIsRecurringSlotsOnly] = React.useState<boolean>(false);

  let content: React.ReactNode = null;
  if (isMobile) {
    content = (
      <MobileDays
        year={props.year}
        weekNumber={props.weekNumber}
        weekDays={props.weekDays}
        isRecurringSlotsOnly={isRecurringSlotsOnly}
      />
    );
  } else {
    content = (
      <DesktopDays
        year={props.year}
        weekNumber={props.weekNumber}
        weekDays={props.weekDays}
        isRecurringSlotsOnly={isRecurringSlotsOnly}
      />
    );
  }

  return (
    <main>
      <div className='w-full flex justify-end items-center gap-2 mb-4'>
        <label htmlFor='only-recurring' className='text-sm text-text-primary font-medium leading-none'>Recurring only</label>
        <Switch checked={isRecurringSlotsOnly} onCheckedChange={() => setIsRecurringSlotsOnly(!isRecurringSlotsOnly)} className='data-[state=checked]:bg-accent-secondary' />
      </div>
      {content}
    </main>
  )
}

const MobileDays = (props: {
  year: number,
  weekNumber: number,
  weekDays: string[],
  isRecurringSlotsOnly: boolean,
}) => {
  return (
    <Accordion type='single' defaultValue={props.weekDays[0]} className='flex flex-col gap-4'>
      {props.weekDays.map((day) => (
        <AccordionItem key={day} value={day} className={cn('border border-border rounded-sm shadow-lg shadow-shadow bg-background')}>
         <AccordionTrigger className='px-2 hover:no-underline'>
           <div className='flex items-center gap-2'>
             <Badge day={day} />
             <Paragraph variant='thick' size='sm' isMuted={isPast(new Date(new Date(day).setHours(23,59,59,999)))} className='leading-none'>
               {getDayOfWeek(day)}
             </Paragraph>
           </div>
         </AccordionTrigger>
         <AccordionContent className='pb-0'>
          <MobileDayCard
            year={props.year}
            weekNumber={props.weekNumber}
            day={day}
            isRecurringSlotsOnly={props.isRecurringSlotsOnly}
          />
         </AccordionContent>
       </AccordionItem>
      ))}
    </Accordion>
  )
}

const DesktopDays = (props: {
  year: number,
  weekNumber: number,
  weekDays: string[],
  isRecurringSlotsOnly: boolean,
}) => {
  const numOfPlaceholders = getNumOfPlaceholders(props.weekDays.length);
  
  let placeholdersBefore: React.ReactNode;
  if (props.weekNumber === 1) {
    placeholdersBefore = (
      numOfPlaceholders.map((placeholder: number) => (
        <div key={placeholder} style={{ aspectRatio: '3/4' }} className='relative h-full col-span-1 flex flex-col border border-border rounded-md bg-background' />
      )
    ))
  }

  let placeholdersAfter: React.ReactNode;
  if (props.weekNumber === 53) {
    placeholdersAfter = (
      numOfPlaceholders.map((placeholder: number) => (
        <div key={placeholder} style={{ aspectRatio: '3/4' }} className='relative h-full col-span-1 flex flex-col border border-border rounded-md bg-background' />
      )
    ))
  }
  
  const content = (
    props.weekDays.map((day) => (
      <DesktopDayCard
        year={props.year}
        weekNumber={props.weekNumber}
        key={day}
        day={day}
        isRecurringSlotsOnly={props.isRecurringSlotsOnly}
      />
    ))
  )

  return (
    <div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-4 mb-16'>
      {placeholdersBefore}
      {content}
      {placeholdersAfter}
    </div>
  )
}