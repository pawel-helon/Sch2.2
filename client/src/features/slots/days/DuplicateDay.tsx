import React from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { duplicateDay } from 'src/features/slots/slotsSlice';
import { Slot } from 'src/lib/types';
import { Button } from 'src/ui/button';
import { Dialog } from 'src/ui/dialog';
import { Heading } from 'src/lib/typography';
import { AppDispatch } from 'src/lib/store';
import { cn } from 'src/lib/utils';
import { Sheet, SheetContent, SheetTitleH as SheetTitle, SheetTrigger } from 'src/ui/sheet';
import { capitalizeFirstLetter, getMonthAndDay, getNameOfDay, getNumOfPlaceholders, getWeekDays } from 'src/lib/helpers';
import { toastAdded } from 'src/features/toasts/toastSlice';

export function MobileDuplicateDay(props: {
  year: number,
  weekNumber: number,
  day: string,
  dispatch: AppDispatch
}) {
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
        <DuplicateDay
          year={props.year}
          weekNumber={props.weekNumber}
          day={props.day}
          dialogOpen={open}
          setDialogOpen={setOpen}
          dispatch={props.dispatch}
        />
      </SheetContent>
    </Sheet>
  )
}

export function DesktopDuplicateDay(props: {
  year: number,
  weekNumber: number,
  day: string,
  dispatch: AppDispatch
}) {
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
        <DuplicateDay
          year={props.year}
          weekNumber={props.weekNumber}
          day={props.day}
          dialogOpen={open}
          setDialogOpen={setOpen}
          dispatch={props.dispatch}
        />
      </Dialog> 
    </>
  )
}

function DuplicateDay(props: {
  year: number,
  weekNumber: number,
  day: string,
  dialogOpen: boolean,
  setDialogOpen: (dialogOpen: boolean) => void,
  dispatch: AppDispatch
}) {
  const [selectedDays, setSelectedDays] = React.useState<string[]>([]);

  const handleSubmit = () => {
    props.setDialogOpen(false);
    try {
      props.dispatch(duplicateDay({ day: props.day, selectedDays })).then((response) => {
        const payload = response.payload as { message: string, slots: Slot[] }
        const slotIds = payload.slots.map(slot => slot.id);
        props.dispatch(toastAdded({
          requestStatus: response.meta.requestStatus,
          description: payload.message,
          action: { name: 'undoDuplicateDay', payload: slotIds }
        }));
      })
    } catch (error) {
      console.error(error);
      props.dispatch(toastAdded({
        requestStatus: 'rejected',
        description: 'An error occurred while rescheduling meeting',
        action: { name: '', payload: [] }
      }));
    }
  }

  const placeholdersBefore = props.weekNumber === 1
    && <Placeholders year={props.year} weekNumber={props.weekNumber} />;

  const placeholdersAfter = props.weekNumber === 53
    && <Placeholders year={props.year} weekNumber={props.weekNumber} />;

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
        <Button onClick={handleSubmit} className='w-full xs:w-fit'>Duplicate</Button>
      </div>
    </>
  )
}

function Placeholders(props: {
  year: number,
  weekNumber: number,
}) {
  const weekDays = getWeekDays(props.year, props.weekNumber);
  const placeholders = getNumOfPlaceholders(weekDays.length);

  return placeholders.map((placeholder: number) => (
    <div
      key={placeholder}
      className='relative size-[88px] border border-border rounded-md bg-background shadow-md shadow-shadow'
    />
  ))
}

function SelectDays(props: {
  year: number,
  weekNumber: number,
  day: string,
  selectedDays: string[],
  setSelectedDays: (selectedDays: string[]) => void
}) {
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

function Day(props: {
  initialDay: string,
  weekDay: string,
  selectedDays: string[],
  setSelectedDays: (selectedDays: string[]) => void
}) {
  const handleClick = (weekDay: string) => {
    if (!props.selectedDays.includes(weekDay)) {
      props.setSelectedDays([...props.selectedDays, weekDay])
    } else {
      props.setSelectedDays(props.selectedDays.filter(day => day !== weekDay ))
    }
  }

  const className =  props.selectedDays.includes(props.weekDay) ? 'bg-background-hover' : 'bg-background';
  const dayName = capitalizeFirstLetter(getNameOfDay(props.weekDay));
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