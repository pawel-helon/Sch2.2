import React from 'react';
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

export const DuplicateDayModal = React.memo((props: DuplicateDayModalProps) => {
  let content: React.ReactNode = null;
  if (props.isMobile) {
    content = React.useMemo(() =>
      <Mobile {...props} />,
      [props.employeeId, props.year, props.weekNumber, props.day]
    )
  } else {
    content = React.useMemo(() =>
      <Desktop {...props} />,
      [props.employeeId, props.year, props.weekNumber, props.day]
    )
  }
  
  return content;
});

interface MobileProps {
  employeeId: string;
  year: number;
  weekNumber: number;
  day: string;
}

const Mobile = React.memo((props: MobileProps) => {
  const [open, setOpen] = React.useState<boolean>(false);

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

const Desktop = React.memo((props: DesktopProps) => {
  const [open, setOpen] = React.useState<boolean>(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen} >
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

const Form = React.memo((props: FormProps) => {
  const [ duplicateDay ] = useDuplicateDayMutation();
  const [selectedDays, setSelectedDays] = React.useState<string[]>([]);

  const handleSubmit = React.useCallback(async () => {
    props.setDialogOpen(false);
    try {
      await duplicateDay({ employeeId: props.employeeId, day: props.day, selectedDays });
    } catch (error) {
      console.error('Failed to duplicate day: ', error);
    }
  },[props.setDialogOpen, duplicateDay, props.employeeId, props.day, selectedDays])

  let placeholdersBefore: React.ReactNode = null;
  if (props.weekNumber === 1) {
    placeholdersBefore = React.useMemo(() =>
      <Placeholders year={props.year} weekNumber={props.weekNumber} />,
      [props.year, props.weekNumber]
    )
  }

  let placeholdersAfter: React.ReactNode = null;
  if (props.weekNumber === 53) {
    placeholdersAfter = React.useMemo(() =>
      <Placeholders year={props.year} weekNumber={props.weekNumber} />,
      [props.year, props.weekNumber]
    );
  }

  const content = React.useMemo(() =>
    <SelectDays 
      year={props.year} 
      weekNumber={props.weekNumber} 
      day={props.day} 
      selectedDays={selectedDays} 
      setSelectedDays={setSelectedDays}
    />,
    [props.year, props.weekNumber, props.day, selectedDays]
  );
  
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
});

interface PlaceholdersProps {
  year: number;
  weekNumber: number;
}

const Placeholders = React.memo((props: PlaceholdersProps) => {
  const weekDays = React.useMemo(() =>
    getWeekDays(props.year, props.weekNumber),
    [props.year, props.weekNumber]
  );
  const placeholders = React.useMemo(() =>
    getNumOfPlaceholders(weekDays.length),
    [weekDays]
  );

  return (
    placeholders.map((placeholder: number) => (
      <div
        key={placeholder}
        className='relative size-[88px] border border-border rounded-md bg-background shadow-md shadow-shadow'
      />
    )))
  });

interface SelectDaysProps {
  year: number;
  weekNumber: number;
  day: string;
  selectedDays: string[];
  setSelectedDays: (selectedDays: string[]) => void;
}

const SelectDays = React.memo((props: SelectDaysProps) => {
  const weekDays = React.useMemo(() =>
    getWeekDays(props.year, props.weekNumber),
    [props.year, props.weekNumber]
  )
  
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
});

interface DayProps {
  initialDay: string;
  weekDay: string;
  selectedDays: string[];
  setSelectedDays: (selectedDays: string[]) => void;
}

const Day = React.memo((props: DayProps) => {
  const handleClick = React.useCallback((weekDay: string) => {
    if (!props.selectedDays.includes(weekDay)) {
      props.setSelectedDays([...props.selectedDays, weekDay])
    } else {
      props.setSelectedDays(props.selectedDays.filter(day => day !== weekDay ))
    }
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