import React, { memo, useCallback, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useAddRecurringSlotMutation } from 'src/redux/actions/slots/addRecurringSlot';
import { useAddSlotMutation } from 'src/redux/actions/slots/addSlot';
import { Button } from 'src/components/Button';

interface AddSlotButtonProps {
  employeeId: string;
  day: string;
  isRecurringSlotsOnly: boolean;
  isMobile: boolean;
}

export const AddSlotButton = memo((props: AddSlotButtonProps) => {
  const [ addSlot ] = useAddSlotMutation();
  const [ addRecurringSlot ] = useAddRecurringSlotMutation();

  const handleAddSlot = useCallback(async () => {
    try {
      await addSlot({ employeeId: props.employeeId, day: props.day });
    } catch (error) {
      console.error('Failed to add slot: ', error);
    }
  },[addSlot, props.employeeId, props.day]);

  const handleAddRecurringSlot = useCallback(async () => {
    try {
      await addRecurringSlot({ employeeId: props.employeeId, day: props.day });
    } catch (error) {
      console.error('Failed to add recurring slot: ', error);
    }
  },[addRecurringSlot, props.employeeId, props.day])
  
  const handleClick = useMemo(() => props.isRecurringSlotsOnly ? handleAddRecurringSlot : handleAddSlot,
    [props.isRecurringSlotsOnly, handleAddRecurringSlot, handleAddSlot]
  );

  const handleVariant = useMemo(() => props.isRecurringSlotsOnly ? 'recurringSlots' : 'default',
    [props.isRecurringSlotsOnly]
  );
  const cta = useMemo(() => props.isRecurringSlotsOnly ? 'Add recurring slot' : 'Add slot',
    [props.isRecurringSlotsOnly]
  );

  return props.isMobile
    ? (
      <Button onClick={handleClick} variant={handleVariant} size='sm' className='text-xs w-full'>
        <Plus className='size-4 mr-1'/>
        {cta}
      </Button>
    ) : (
      <Button onClick={handleClick} variant={handleVariant} size='sm' className='size-8 p-0'>
        <Plus size={16} />
      </Button>
    )
});
