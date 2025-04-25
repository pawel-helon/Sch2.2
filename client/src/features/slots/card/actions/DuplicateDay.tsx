import { Cross2Icon } from '@radix-ui/react-icons';
import React from 'react';
import { Button } from 'src/components/Button';
import { Dialog } from 'src/components/Dialog';
import {
  Sheet,
  SheetContent,
  SheetTitleH as SheetTitle,
  SheetTrigger
} from 'src/components/Sheet';
import { Heading } from 'src/components/typography/Heading';
import { useDuplicateDayMutation } from 'src/redux/actions/slots/duplicateDay';
import { capitalizeFirstLetter } from 'src/utils/capitalizeFirstLetter';
import { cn } from 'src/utils/cn';
import { getNumOfPlaceholders } from 'src/utils/data/getNumOfPlaceholders';
import { getDayName } from 'src/utils/dates/getDayName';
import { getMonthAndDay } from 'src/utils/dates/getMonthAndDay';
import { getWeekDays } from 'src/utils/dates/getWeekDays';

export const DuplicateDay = (props: {
  employeeId: string,
  year: number,
  weekNumber: number,
  day: string,
  isMobile: boolean
}) => {
  let content: React.ReactNode = null;

  if (props.isMobile) {
    content = (
      <Mobile
        employeeId={props.employeeId}
        year={props.year}
        weekNumber={props.weekNumber}
        day={props.day}
      />
    )
  } else {
    content = (
      <Desktop
        employeeId={props.employeeId}
        year={props.year}
        weekNumber={props.weekNumber}
        day={props.day}
      />
    )
  }
  
  return content;
}

const Mobile = (props: {
  employeeId: string,
  year: number,
  weekNumber: number,
  day: string
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild>
      <Button aria-label='duplicate-day' size='sm' variant='outline' onClick={() => setOpen(true)} className='w-full rounded-r-none px-1.5'>
        Duplicate
      </Button>
    </SheetTrigger>
    <SheetContent side='bottom' aria-describedby='duplicate-day'>
      <SheetTitle>Duplicate day</SheetTitle>
      <Form
        employeeId={props.employeeId}
        year={props.year}
        weekNumber={props.weekNumber}
        day={props.day}
        dialogOpen={open}
        setDialogOpen={setOpen}
      />
    </SheetContent>
  </Sheet>
  )
}

const Desktop = (props: {
  employeeId: string,
  year: number,
  weekNumber: number,
  day: string
}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  },[open])
  
  return (
    <>
      <Button size='sm' variant='outline' onClick={() => setOpen(true)} className='w-[100px] rounded-r-none px-1.5'>
        Duplicate
      </Button>
      <Dialog ref={dialogRef} isOpen={open} className='min-w-[480px]'>
        <div className='flex justify-between items-start text-left'>
          <Heading variant='h4'>Duplicate day</Heading>
          <button onClick={() => setOpen(false)} className='cursor-pointer text-text-secondary transition-colors hover:text-text-primary'>
            <Cross2Icon />
          </button>
        </div>
        <Form
          employeeId={props.employeeId}
          year={props.year}
          weekNumber={props.weekNumber}
          day={props.day}
          dialogOpen={open}
          setDialogOpen={setOpen}
        />
      </Dialog> 
    </>
  )
}

const Form = (props: {
  employeeId: string,
  year: number,
  weekNumber: number,
  day: string,
  dialogOpen: boolean,
  setDialogOpen: (dialogOpen: boolean) => void,
}) => {
  const [ duplicateDay ] = useDuplicateDayMutation();
  const [selectedDays, setSelectedDays] = React.useState<string[]>([]);

  const handleSubmit = async () => {
    props.setDialogOpen(false);
    try {
      await duplicateDay({ employeeId: props.employeeId, day: props.day, selectedDays });
    } catch (error) {
      console.error('Failed to duplicate day: ', error);
    }
  }

  let placeholdersBefore: React.ReactNode = null;
  if (props.weekNumber === 1) {
    placeholdersBefore = <Placeholders year={props.year} weekNumber={props.weekNumber} />;
  }

  let placeholdersAfter: React.ReactNode = null;
  if (props.weekNumber === 1) {
    placeholdersAfter = <Placeholders year={props.year} weekNumber={props.weekNumber} />;
  }

  const content = (
    <SelectDays 
      year={props.year} 
      weekNumber={props.weekNumber} 
      day={props.day} 
      selectedDays={selectedDays} 
      setSelectedDays={setSelectedDays}
    />
  )
  
  return (
    <>
      <div className='grid grid-cols-3 xs:grid-cols-5 gap-4 xs:gap-2 mt-8'>
        {placeholdersBefore}
        {content}
        {placeholdersAfter}
      </div>
      <div className='w-full flex justify-end mt-8 gap-2'>
        <Button onClick={handleSubmit} className='w-full xs:w-fit'>
          Duplicate
        </Button>
      </div>
    </>
  )
}

const Placeholders = (props: {
  year: number,
  weekNumber: number,
}) => {
  const weekDays = getWeekDays(props.year, props.weekNumber);
  const placeholders = getNumOfPlaceholders(weekDays.length);

  return placeholders.map((placeholder: number) => (
    <div
      key={placeholder}
      className='relative size-[88px] border border-border rounded-md bg-background shadow-md shadow-shadow'
    />
  ))
}

const SelectDays = (props: {
  year: number,
  weekNumber: number,
  day: string,
  selectedDays: string[],
  setSelectedDays: (selectedDays: string[]) => void
}) => {
  const weekDays = getWeekDays(props.year, props.weekNumber);
  
  return (
    weekDays.map((weekDay: string, i: number) => (
      <Day 
        key={i} 
        initialDay={props.day} 
        weekDay={weekDay} 
        selectedDays={props.selectedDays}
        setSelectedDays={props.setSelectedDays}
      />
    ))
  )

}

const Day = (props: {
  initialDay: string,
  weekDay: string,
  selectedDays: string[],
  setSelectedDays: (selectedDays: string[]) => void
}) => {
  const handleClick = (weekDay: string) => {
    if (!props.selectedDays.includes(weekDay)) {
      props.setSelectedDays([...props.selectedDays, weekDay])
    } else {
      props.setSelectedDays(props.selectedDays.filter(day => day !== weekDay ))
    }
  }

  const className =  props.selectedDays.includes(props.weekDay) ? 'bg-background-hover' : 'bg-background';
  const dayName = capitalizeFirstLetter(getDayName(props.weekDay));
  const dayDate = getMonthAndDay(props.weekDay);
  
  return (
    <button
      onClick={() => handleClick(props.weekDay)}
      disabled={props.weekDay === props.initialDay}
      className={cn(className, 'cursor-pointer text-text-primary text-xs relative size-[88px] border border-border rounded-md shadow-md shadow-shadow flex flex-col justify-center items-center gap-1 disabled:opacity-50',
    )}>
      {dayName}
      <span className='text-text-primary/80'>
        {dayDate}
      </span>
    </button>
  )
}