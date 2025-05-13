import { memo, useCallback, useMemo } from 'react';
import { Button } from 'src/components/Button';
import { useDisableSlotRecurrenceMutation } from 'src/redux/actions/slots/disableSlotRecurrence';
import { useSetSlotRecurrenceMutation } from 'src/redux/actions/slots/setSlotRecurrence';

interface SlotRecurrenceMenuItemProps {
  slotId: string;
  isRecurring: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const SlotRecurrenceMenuItem = memo((props: SlotRecurrenceMenuItemProps) => {
  const [ setSlotRecurrence ] = useSetSlotRecurrenceMutation();
  const [ disableSlotRecurrence ] = useDisableSlotRecurrenceMutation();

  const handleSetSlotRecurrence = useCallback(async () => {
    props.setOpen(false);
    try {
      await setSlotRecurrence({ slotId: props.slotId });
    } catch (error) {
      console.error('Failed to set slot recurrence: ', error);
    }
  },[props.setOpen, setSlotRecurrence, props.slotId]);

  const handleDisableSlotRecurrence = useCallback(async () => {
    props.setOpen(false);
    try {
      await disableSlotRecurrence({ slotId: props.slotId });
    } catch (error) {
      console.error('Failed to disable slot recurrence: ', error);
    }
  },[props.setOpen, setSlotRecurrence, props.slotId]);

  const handleClick = useMemo(() => !props.isRecurring ? handleSetSlotRecurrence : handleDisableSlotRecurrence,
    [props.isRecurring, handleSetSlotRecurrence, handleDisableSlotRecurrence]
  )
  
  return (
    <Button onClick={handleClick} variant='ghost' size='sm' className='justify-start text-left pl-1.5'>
      {props.isRecurring ? 'Disable recurring' : 'Set recurring'}
    </Button>
  )
});