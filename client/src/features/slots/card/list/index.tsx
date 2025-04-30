import React from 'react';
import { EllipsisVertical } from 'lucide-react';
import { SlotRecurrenceMenuItem } from 'src/features/slots/card/list/actions/SlotRecurrenceMenuItem';
import { HourDropdown } from 'src/features/slots/card/list/actions/HourDropdown';
import { MinutesDropdown } from 'src/features/slots/card/list/actions/MinutesDropdown';
import { DeleteSlotButton } from 'src/features/slots/card/list/actions/DeleteSlotButton';
import { Button } from 'src/components/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from 'src/components/DropdownMenu';
import { Slot } from 'src/types/slots';

export const List = (props: {
  slots: Slot[]
}) => {
  return (
    <div className='relative h-full flex flex-col gap-1 mt-10 mb-12 pl-3 pr-2 overflow-y-auto scrollbar scrollbar-thumb-border scrollbar-thumb-rounded-full scrollbar-track-card-background scrollbar-w-1 scrollbar-h-1 bg-background'>
      {props.slots.map((slot) => (
        <Item key={slot.id} slot={slot} />
      ))}
    </div>
  )
}

const Item = (props: {
  slot: Slot,
}) => {
  let recurringIndicator: React.ReactNode = null;
  if (props.slot.recurring) {
    recurringIndicator = <div className='absolute size-2 -top-1 -left-1 bg-accent-secondary rounded-full animate animate-in duration-200' />
  }
  
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
}

const MoreActions = (props: {
  slotId: string,
  isRecurring: boolean
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

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
}