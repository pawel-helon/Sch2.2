import React, { memo, useCallback, useState } from 'react';
import { useDuplicateDayMutation } from 'src/redux/actions/slots/duplicateDay';
import { Button } from 'src/components/Button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from 'src/components/Dialog';
import {
  Sheet,
  SheetContent,
  SheetTitleH as SheetTitle,
  SheetTrigger
} from 'src/components/Sheet';
import { capitalizeFirstLetter } from 'src/utils/capitalizeFirstLetter';
import { getNumOfPlaceholders } from 'src/utils/data/getNumOfPlaceholders';
import { getDayName } from 'src/utils/dates/getDayName';
import { getMonthAndDay } from 'src/utils/dates/getMonthAndDay';
import { getWeekDays } from 'src/utils/dates/getWeekDays';
import { cn } from 'src/utils/cn';

interface DuplicateDayModalProps {
  employeeId: string;
  year: number;
  weekNumber: number;
  day: string;
  isMobile: boolean;
}

export const DuplicateDayModal = memo((props: DuplicateDayModalProps) => {
  return props.isMobile
    ? <Mobile {...props} />
    : <Desktop {...props} />
});

interface MobileProps {
  employeeId: string;
  year: number;
  weekNumber: number;
  day: string;
}

const Mobile = memo((props: MobileProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button aria-label='duplicate-day' size='sm' variant='outline' className='w-full rounded-r-none px-1.5'>
          Duplicate
        </Button>
      </SheetTrigger>
      <SheetContent side='bottom' aria-describedby='duplicate-day'>
        <SheetTitle>Duplicate day</SheetTitle>
        <Form
          {...props}
          dialogOpen={open}
          setDialogOpen={setOpen}
        />
      </SheetContent>
    </Sheet>
  )
});

interface DesktopProps {
  employeeId: string;
  year: number;
  weekNumber: number;
  day: string;
}

const Desktop = memo((props: DesktopProps) => {
  const [open, setOpen] = useState<boolean>(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' variant='outline' className='w-[100px] rounded-r-none px-1.5'>
          Duplicate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Duplicate day</DialogTitle>
        <Form
          {...props}
          dialogOpen={open}
          setDialogOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  )
});

interface FormProps {
  employeeId: string;
  year: number;
  weekNumber: number;
  day: string;
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
}

const Form = memo((props: FormProps) => {
  const [ duplicateDay ] = useDuplicateDayMutation();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const handleSubmit = useCallback(async () => {
    props.setDialogOpen(false);
    try {
      await duplicateDay({ employeeId: props.employeeId, day: props.day, selectedDays });
    } catch (error) {
      console.error('Failed to duplicate day: ', error);
    }
  },[props.setDialogOpen, duplicateDay, props.employeeId, props.day, selectedDays])

  const placeholdersBefore = props.weekNumber === 1
    ? <Placeholders year={props.year} weekNumber={props.weekNumber} />
    : null

  const placeholdersAfter = props.weekNumber === 53
  ? <Placeholders year={props.year} weekNumber={props.weekNumber} />
  : null
  
  return (
    <>
      <div className='grid grid-cols-3 xs:grid-cols-5 gap-4 xs:gap-2 mt-8'>
        {placeholdersBefore}
        <SelectDays 
          year={props.year} 
          weekNumber={props.weekNumber} 
          day={props.day} 
          selectedDays={selectedDays} 
          setSelectedDays={setSelectedDays}
        />
        {placeholdersAfter}
      </div>
      <div className='w-full flex justify-end mt-8 gap-2'>
        <Button onClick={handleSubmit} className='w-full xs:w-fit'>
          Duplicate
        </Button>
      </div>
    </>
  )
});

interface PlaceholdersProps {
  year: number;
  weekNumber: number;
}

const Placeholders = memo((props: PlaceholdersProps) => {
  const weekDays = getWeekDays(props.year, props.weekNumber);
  const placeholders = getNumOfPlaceholders(weekDays.length);

  return placeholders.map((placeholder: number) => (
    <div key={placeholder} className='relative size-[88px] border border-border rounded-md bg-background shadow-md shadow-shadow' />
  ))
});

interface SelectDaysProps {
  year: number;
  weekNumber: number;
  day: string;
  selectedDays: string[];
  setSelectedDays: (selectedDays: string[]) => void;
}

const SelectDays = memo((props: SelectDaysProps) => {
  const weekDays = getWeekDays(props.year, props.weekNumber);
  
  return weekDays.map((weekDay: string, i: number) => (
    <Day key={i} 
      initialDay={props.day} 
      weekDay={weekDay} 
      selectedDays={props.selectedDays}
      setSelectedDays={props.setSelectedDays}
    />
  ))
});

interface DayProps {
  initialDay: string;
  weekDay: string;
  selectedDays: string[];
  setSelectedDays: (selectedDays: string[]) => void;
}

const Day = memo((props: DayProps) => {
  const handleClick = useCallback((weekDay: string) => {
    props.selectedDays.includes(weekDay)
      ? props.setSelectedDays(props.selectedDays.filter(day => day !== weekDay))
      : props.setSelectedDays([...props.selectedDays, weekDay])
  },[props.selectedDays, props.setSelectedDays]);

  const isSelected = props.selectedDays.includes(props.weekDay);
  const dayName = capitalizeFirstLetter(getDayName(props.weekDay));
  const dayDate = getMonthAndDay(props.weekDay);
  
  return (
    <button
      onClick={() => handleClick(props.weekDay)}
      disabled={props.weekDay === props.initialDay}
      className={cn(
        isSelected ? 'bg-text-tertiary/25' : 'bg-background',
        'cursor-pointer text-text-primary text-xs relative size-[88px] border border-border rounded-md shadow-md shadow-shadow flex flex-col justify-center items-center gap-1 disabled:opacity-50'
    )}>
      {dayName}
      <span className='text-text-primary/80'>
        {dayDate}
      </span>
    </button>
  )
});