import React from 'react';
import { EllipsisVertical, Trash2 } from 'lucide-react';
import { Slot } from 'src/types/slots';
import { getSlotHourAndMinutes } from 'src/utils/dates/getSlotHourAndMinutes';
import { AppDispatch } from 'src/redux/store';
import { Button } from 'src/components/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from 'src/components/DropdownMenu';
import { useDeleteSlotsMutation } from 'src/redux/actions/slots/deleteSlots';
import { useSetSlotRecurrenceMutation } from 'src/redux/actions/slots/setSlotRecurrence';
import { useDisableSlotRecurrenceMutation } from 'src/redux/actions/slots/disableSlotRecurrence';

export const SlotList = (props: {
  slots: Slot[],
  dispatch: AppDispatch
}) => {
  return (
    <div className='mt-10 mb-12 pl-3 pr-2 flex relative flex-col h-full overflow-y-scroll scrollbar scrollbar-thumb-border scrollbar-thumb-rounded-full scrollbar-track-card-background scrollbar-w-1 scrollbar-h-1 bg-background'>
      {props.slots.map((slot) => (
        <Item key={slot.id} slot={slot} dispatch={props.dispatch} />
      ))}
    </div>
  )
}

const Item = (props: {
  slot: Slot,
  dispatch: AppDispatch
}) => {
  const { hour, minute } = getSlotHourAndMinutes(props.slot.startTime);
  
  let recurringIndicator: React.ReactNode = null;
  if (props.slot.recurring) {
    recurringIndicator = <div className='absolute size-2 -top-1 -left-1 bg-accent-secondary rounded-full animate animate-in duration-200' />
  }
  
  return (
    <div className='relative flex justify-between my-2'>
      {recurringIndicator}
      <div className='flex gap-1'>
        {/* <HoursDropdown slotId={props.slot.id} hour={hour} isRecurring={props.slot.recurring} dispatch={props.dispatch} />
        <MinutesDropdown slotId={props.slot.id} minute={minute} isRecurring={props.slot.recurring} dispatch={props.dispatch} /> */}
      </div>
      <div className='flex gap-1'>
        {/* <Delete slot={props.slot} dispatch={props.dispatch} />
        <MoreDropdown slotId={props.slot.id} isRecurring={props.slot.recurring} dispatch={props.dispatch} /> */}
      </div>
    </div>
  )
}

const Delete = (props: {
  slot: Slot,
  dispatch: AppDispatch
}) => {
  const [ deleteSlots ] = useDeleteSlotsMutation();
  const handleDeleteSlot = () => {
    try {
     deleteSlots({slots: [props.slot]})
    } catch (error) {
      console.error(error);
    }
  }
  
  return (
    <Button onClick={handleDeleteSlot} variant='outline' size='sm' className='w-8 px-0'>
      <Trash2 size={16} />
    </Button>
  )
}

const MoreDropdown = (props: {
  slotId: string,
  isRecurring: boolean,
  dispatch: AppDispatch
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='w-8 px-0'>
          <EllipsisVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom' align='end' className='flex flex-col shadow-shadow shadow-sm bg-background-background-hover'>
        <SetSlotRecurrence
          slotId={props.slotId} 
          isRecurring={props.isRecurring} 
          open={open}
          setOpen={setOpen}
          dispatch={props.dispatch}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const SetSlotRecurrence = (props: {
  slotId: string,
  isRecurring: boolean,
  open: boolean,
  setOpen: (open: boolean) => void,
  dispatch: AppDispatch
}) => {
  const [ setSlotRecurrence ] = useSetSlotRecurrenceMutation();
  const [ disableSlotRecurrence ] = useDisableSlotRecurrenceMutation();

  const setRecurrence = () => {
    props.setOpen(false);
    try {
     setSlotRecurrence({ slotId: props.slotId });
    } catch (error) {
      console.error(error);
    }
  }

  const disableRecurrence = () => {
    props.setOpen(false);
    try {
      disableSlotRecurrence({ slotId: props.slotId });
    } catch (error) {
      console.error(error);
    }
  }
  
  const handleClick = props.isRecurring ? disableRecurrence : setRecurrence;
  const copy = props.isRecurring ? 'Disable recurring' : 'Set recurring';
  
  return (
    <Button onClick={handleClick} variant='ghost' size='sm' className='justify-start text-left pl-1.5'>
      {copy}
    </Button>
  )
}