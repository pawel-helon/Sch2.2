import { Plus } from 'lucide-react';
import { useAddRecurringSlotMutation } from 'src/redux/actions/slots/addRecurringSlot';
import { useAddSlotMutation } from 'src/redux/actions/slots/addSlot';
import { Button } from 'src/components/Button';
import React from 'react';

interface AddSlotButtonProps {
  employeeId: string;
  day: string;
  isRecurringSlotsOnly: boolean;
  isMobile: boolean;
}

export const AddSlotButton = React.memo((props: AddSlotButtonProps) => {
  const [ addSlot ] = useAddSlotMutation();
  const [ addRecurringSlot ] = useAddRecurringSlotMutation();

  const handleAddSlot = React.useCallback(async () => {
    try {
      await addSlot({ employeeId: props.employeeId, day: props.day });
    } catch (error) {
      console.error('Failed to add slot: ', error);
    }
  },[addSlot, props.employeeId, props.day]);

  const handleAddRecurringSlot = React.useCallback(async () => {
    try {
      await addRecurringSlot({ employeeId: props.employeeId, day: props.day });
    } catch (error) {
      console.error('Failed to add recurring slot: ', error);
    }
  },[addRecurringSlot, props.employeeId, props.day])
  
  const handleClick = React.useMemo(
    () => props.isRecurringSlotsOnly ? handleAddRecurringSlot : handleAddSlot,
    [props.isRecurringSlotsOnly, handleAddRecurringSlot, handleAddSlot]
  );

  const handleVariant = React.useMemo(
    () => props.isRecurringSlotsOnly ? 'recurringSlots' : 'default',
    [props.isRecurringSlotsOnly]
  );
  const cta = React.useMemo(
    () => props.isRecurringSlotsOnly ? 'Add recurring slot' : 'Add slot',
    [props.isRecurringSlotsOnly]
  );
  
  let content: React.ReactNode = null;
  if (props.isMobile) {
    content = React.useMemo(() =>
      <Button onClick={handleClick} variant={handleVariant} size='sm' className='text-xs w-full'>
        <Plus className='size-4 mr-1'/>
        {cta}
      </Button>
    ,[handleClick])
  } else {
    content = React.useMemo(() =>
      <Button onClick={handleClick} variant={handleVariant} size='sm' className='size-8 p-0'>
        <Plus size={16} />
      </Button>
    ,[handleClick])
  }
  
  return content;
});
