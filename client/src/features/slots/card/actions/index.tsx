import React from 'react';
import { ChevronDown } from 'lucide-react';
import { DayRecurrence } from './DayRecurrence';
import { DeleteSlots } from './DeleteSlots';
import { DuplicateDay } from './DuplicateDay';
import { AddSlot } from './AddSlot';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from 'src/components/DropdownMenu';
import { Button } from 'src/components/Button';
import { Slot } from 'src/types/slots';

export const Actions = (props: {
  employeeId: string,
  slots: Slot[],
  year: number,
  weekNumber: number,
  day: string,
  isRecurringSlotsOnly: boolean,
  isMobile: boolean
}) => {
  return (
  <div className='absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-3 bg-background-background'>
    <div className='flex'>
      <DuplicateDay
        employeeId={props.employeeId}
        year={props.year}
        weekNumber={props.weekNumber}
        day={props.day}
        isMobile={props.isMobile}
      />
      <MoreActions
        employeeId={props.employeeId}
        slots={props.slots}
        year={props.year}
        weekNumber={props.weekNumber}
        day={props.day}
        isRecurringSlotsOnly={props.isRecurringSlotsOnly}
      />
    </div>
    <AddSlot
      employeeId={props.employeeId}
      day={props.day}
      isRecurringSlotsOnly={props.isRecurringSlotsOnly}
      isMobile={props.isMobile}
    />
  </div>
  )
}

const MoreActions = (props: {
  employeeId: string,
  slots: Slot[],
  year: number,
  weekNumber: number,
  day: string,
  isRecurringSlotsOnly: boolean
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='w-12 xs:w-8 rounded-l-none px-1.5'>
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[132px] flex flex-col bg-background shadow-shadow shadow-sm p-1'>
        <DayRecurrence />
        <DeleteSlots
          slots={props.slots}
          dropdownOpen={open}
          setDropdownOpen={setOpen}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}