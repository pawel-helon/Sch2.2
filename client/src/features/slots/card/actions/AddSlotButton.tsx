import { Plus } from 'lucide-react';
import { Button } from 'src/components/Button';
import { useAddRecurringSlotMutation } from 'src/redux/actions/slots/addRecurringSlot';
import { useAddSlotMutation } from 'src/redux/actions/slots/addSlot';

export const AddSlotButton = (props: {
  employeeId: string,
  day: string,
  isRecurringSlotsOnly: boolean,
  isMobile: boolean
}) => {
  const [ addSlot ] = useAddSlotMutation();
  const [ addRecurringSlot ] = useAddRecurringSlotMutation();

  const handleAddSlot = async () => {
    try {
      await addSlot({ employeeId: props.employeeId, day: props.day });
    } catch (error) {
      console.error('Failed to add slot: ', error);
    }
  }

  const handleAddRecurringSlot = async () => {
    try {
      await addRecurringSlot({ employeeId: props.employeeId, day: props.day });
    } catch (error) {
      console.error('Failed to add recurring slot: ', error);
    }
  }
  
  const handleClick = props.isRecurringSlotsOnly ? handleAddRecurringSlot : handleAddSlot;
  const handleVariant = props.isRecurringSlotsOnly ? 'recurringSlots' : 'default';
  const cta = props.isRecurringSlotsOnly ? 'Add recurring slot' : 'Add slot';
  
  let content: React.ReactNode = null;
  if (props.isMobile) {
    content = (
      <Button onClick={handleClick} variant={handleVariant} size='sm' className='text-xs w-full'>
        <Plus className='size-4 mr-1'/>
        {cta}
      </Button>
    )
  } else {
    content = (
      <Button onClick={handleClick} variant={handleVariant} size='sm' className='size-8 p-0'>
        <Plus size={16} />
      </Button>
    )
  }
  return content;
}
