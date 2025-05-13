import { memo, useState } from 'react';
import { EllipsisVertical } from 'lucide-react';
import { SlotRecurrenceMenuItem } from 'src/features/slots/card/item/actions/SlotRecurrenceMenuItem';
import { HourDropdown } from 'src/features/slots/card/item/actions/HourDropdown';
import { MinutesDropdown } from 'src/features/slots/card/item/actions/MinutesDropdown';
import { DeleteSlotButton } from 'src/features/slots/card/item/actions/DeleteSlotButton';
import { Button } from 'src/components/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from 'src/components/DropdownMenu';
import { Slot } from 'src/types/slots';

interface ItemProps {
  slot: Slot;
}

export const Item = memo((props: ItemProps) => {
  const recurringIndicator = props.slot.recurring
    ? <div className='absolute size-2 -top-1 -left-1 bg-accent-secondary rounded-full animate animate-in duration-200' />
    : null
  
  return (
    <div className='first:mt-2 relative flex justify-between'>
      {recurringIndicator}
      <div className='flex gap-1'>
        <HourDropdown
          slotId={props.slot.id}
          startTime={props.slot.startTime}
          isRecurring={props.slot.recurring}
        />
        <MinutesDropdown
          slotId={props.slot.id}
          startTime={props.slot.startTime}
          isRecurring={props.slot.recurring}
        />
      </div>
      <div className='flex gap-1'>
        <DeleteSlotButton slot={props.slot} />
        <MoreActions
          slotId={props.slot.id}
          isRecurring={props.slot.recurring}
        />
      </div>
    </div>
  )
});

interface MoreActionsProps {
  slotId: string;
  isRecurring: boolean;
}

const MoreActions = memo((props: MoreActionsProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='w-8 px-0'>
          <EllipsisVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom' align='end' className='flex flex-col shadow-shadow shadow-sm bg-background background-hover'>
        <SlotRecurrenceMenuItem
          slotId={props.slotId} 
          isRecurring={props.isRecurring} 
          open={open}
          setOpen={setOpen}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
});