import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'src/components/Accordion';
import { Paragraph } from 'src/components/typography/Paragraph';
import { Card } from './card';
import { RecurringSlotsToggle } from './RecurringSlotsToggle';
import { Badge } from 'src/components/Badge';
import { useHandleBreakpoint } from 'src/hooks/useHandleBreakpoint';
import { useHandleIsRecurringSlotsOnly } from 'src/hooks/useHandleIsRecurringSlots';
import { getDayOfWeek } from 'src/utils/dates/getDayOfWeek';
import { isPast } from 'src/utils/dates/isPast';
import { getNumOfPlaceholders } from 'src/utils/data/getNumOfPlaceholders';
import { cn } from 'src/utils/cn';

export const Days = (props: {
  employeeId: string,
  year: number,
  weekNumber: number,
  weekDays: string[],
  isMobile: boolean
}) => {
  const isMobile = useHandleBreakpoint({ windowInnerWidth: 480 });
  const { isRecurringSlotsOnly, setRecurringSlotsOnly } = useHandleIsRecurringSlotsOnly();

  let content: React.ReactNode = null;
  if (props.isMobile) {
    content = (
      <Mobile
        employeeId={props.employeeId}
        year={props.year}
        weekNumber={props.weekNumber}
        weekDays={props.weekDays}
        isRecurringSlotsOnly={isRecurringSlotsOnly}
        isMobile={isMobile}
      />
    );
  } else {
    content = (
      <Desktop
        employeeId={props.employeeId}
        year={props.year}
        weekNumber={props.weekNumber}
        weekDays={props.weekDays}
        isRecurringSlotsOnly={isRecurringSlotsOnly}
        isMobile={isMobile}
      />
    );
  }

  return (
    <main>
      <RecurringSlotsToggle
        isRecurringSlotsOnly={isRecurringSlotsOnly}
        setRecurringSlotsOnly={setRecurringSlotsOnly}
      />
      {content}
    </main>
  )
}

const Mobile = (props: {
  employeeId: string,
  year: number,
  weekNumber: number,
  weekDays: string[],
  isRecurringSlotsOnly: boolean,
  isMobile: boolean
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
          <Card
            employeeId={props.employeeId}
            year={props.year}
            weekNumber={props.weekNumber}
            day={day}
            isRecurringSlotsOnly={props.isRecurringSlotsOnly}
            isMobile={props.isMobile}
          />
         </AccordionContent>
       </AccordionItem>
      ))}
    </Accordion>
  )
}

const Desktop = (props: {
  employeeId: string,
  year: number,
  weekNumber: number,
  weekDays: string[],
  isRecurringSlotsOnly: boolean,
  isMobile: boolean
}) => {
  const numOfPlaceholders = getNumOfPlaceholders(props.weekDays.length);
  
  let placeholdersBefore: React.ReactNode = null;
  if (props.weekNumber === 1) {
    placeholdersBefore = (
      numOfPlaceholders.map((placeholder: number) => (
        <div key={placeholder} className='aspect-[3/4] relative h-full col-span-1 flex flex-col border border-border rounded-md bg-background' />
      )
    ))
  }

  let placeholdersAfter: React.ReactNode;
  if (props.weekNumber === 53) {
    placeholdersAfter = (
      numOfPlaceholders.map((placeholder: number) => (
        <div key={placeholder} className='aspect-[3/4] relative h-full col-span-1 flex flex-col border border-border rounded-md bg-background' />
      )
    ))
  }
  
  const content = (
    props.weekDays.map((day) => (
      <Card
        employeeId={props.employeeId}
        year={props.year}
        weekNumber={props.weekNumber}
        key={day}
        day={day}
        isRecurringSlotsOnly={props.isRecurringSlotsOnly}
        isMobile={props.isMobile}
      />
    ))
  )

  return (
    <div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-4'>
      {placeholdersBefore}
      {content}
      {placeholdersAfter}
    </div>
  )
}