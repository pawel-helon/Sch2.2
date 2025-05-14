import { memo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'src/components/Accordion';
import { Paragraph } from 'src/components/typography/Paragraph';
import { Card } from './card';
import { RecurringSlotsToggle } from './RecurringSlotsToggle';
import { Badge } from 'src/components/Badge';
import { useHandleIsRecurringSlotsOnly } from 'src/hooks/useHandleIsRecurringSlots';
import { getDayOfWeek } from 'src/utils/dates/getDayOfWeek';
import { isPast } from 'src/utils/dates/isPast';
import { getNumOfPlaceholders } from 'src/utils/data/getNumOfPlaceholders';
import { cn } from 'src/utils/cn';

interface DaysProps {
  employeeId: string;
  year: number;
  weekNumber: number;
  weekDays: string[];
  isMobile: boolean;
}

export const Days = memo((props: DaysProps) => {
  const { isRecurringSlotsOnly, setRecurringSlotsOnly } = useHandleIsRecurringSlotsOnly();

  const content = props.isMobile
    ? <Mobile {...props} isRecurringSlotsOnly={isRecurringSlotsOnly} />
    : <Desktop {...props} isRecurringSlotsOnly={isRecurringSlotsOnly} />

  return (
    <main>
      <RecurringSlotsToggle
        isRecurringSlotsOnly={isRecurringSlotsOnly}
        setRecurringSlotsOnly={setRecurringSlotsOnly}
      />
      {content}
    </main>
  )
});

interface MobileProps {
  employeeId: string;
  year: number;
  weekNumber: number;
  weekDays: string[];
  isRecurringSlotsOnly: boolean;
  isMobile: boolean;
}

const Mobile = memo((props: MobileProps) => {
  return (
    <Accordion type='single' defaultValue={props.weekDays[0]} className='flex flex-col gap-4'>
      {props.weekDays
        .filter((day) => new Date(day) >= new Date(new Date().setHours(0,0,0,0)))
        .map((day) => (
          <AccordionItem key={day} value={day} className={cn('border border-border rounded-sm shadow-lg shadow-shadow bg-background')}>
          <AccordionTrigger className='px-2 hover:no-underline'>
            <div className='flex items-center gap-2'>
              <Badge day={day} value='date' />
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
});

interface DesktopProps {
  employeeId: string;
  year: number;
  weekNumber: number;
  weekDays: string[];
  isRecurringSlotsOnly: boolean;
  isMobile: boolean;
}

const Desktop = memo((props: DesktopProps) => {
  const numOfPlaceholders = getNumOfPlaceholders(props.weekDays.length);

  const placeholdersBefore = props.weekNumber === 1
    ? numOfPlaceholders.map((placeholder: number) => (
        <div key={placeholder} className='aspect-[3/4] relative h-full col-span-1 flex flex-col border border-border rounded-md bg-background' />
      ))
    : null
  
  const placeholdersAfter = props.weekNumber === 53
    ? numOfPlaceholders.map((placeholder: number) => (
      <div key={placeholder} className='aspect-[3/4] relative h-full col-span-1 flex flex-col border border-border rounded-md bg-background' />
      ))
    : null

  const content = props.weekDays.map((day) => (
    <Card
      key={day}
      day={day}
      employeeId={props.employeeId}
      year={props.year}
      weekNumber={props.weekNumber}
      isRecurringSlotsOnly={props.isRecurringSlotsOnly}
      isMobile={props.isMobile}
    />
  ))

  return (
    <div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-4'>
      {placeholdersBefore}
      {content}
      {placeholdersAfter}
    </div>
  )
});