import { memo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DayRecurrenceMenuItem } from './DayRecurrenceMenuItem';
import { DeleteSlotsMenuItem } from './DeleteSlotsMenuItem';
import { DuplicateDayModal } from './DuplicateDayModal';
import { AddSlotButton } from './AddSlotButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from 'src/components/DropdownMenu';
import { Button } from 'src/components/Button';
import { Slot } from 'src/types/slots';

interface ActionsProps {
  employeeId: string;
  slots: Slot[];
  year: number;
  weekNumber: number;
  day: string;
  isRecurringSlotsOnly: boolean;
  isMobile: boolean;
}

export const Actions = memo((props: ActionsProps) => {
  return (
    <div className='absolute bottom-0 left-0 right-0 flex justify-between gap-2 p-3 bg-background'>
      <div className='flex'>
        <DuplicateDayModal
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
      <AddSlotButton
        employeeId={props.employeeId}
        day={props.day}
        isRecurringSlotsOnly={props.isRecurringSlotsOnly}
        isMobile={props.isMobile}
      />
    </div>
  )
});

interface MoreActionsProps {
  employeeId: string;
  slots: Slot[];
  year: number;
  weekNumber: number;
  day: string;
  isRecurringSlotsOnly: boolean;
}

const MoreActions = memo((props: MoreActionsProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='w-12 xs:w-8 rounded-l-none px-1.5'>
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[132px] flex flex-col bg-background shadow-shadow shadow-sm p-1'>
        <DayRecurrenceMenuItem
          employeeId={props.employeeId}
          day={props.day}
          dropdownOpen={open}
          setDropdownOpen={setOpen}
        />
        <DeleteSlotsMenuItem
          slots={props.slots}
          dropdownOpen={open}
          setDropdownOpen={setOpen}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
});