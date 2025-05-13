import { memo, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from 'src/components/Button';
import { useDeleteSlotsMutation } from 'src/redux/actions/slots/deleteSlots';
import { Slot } from 'src/types/slots';

interface DeleteSlotButtonProps {
  slot: Slot;
}

export const DeleteSlotButton = memo((props: DeleteSlotButtonProps) => {
  const [ deleteSlots ] = useDeleteSlotsMutation();
  
  const handleDeleteSlot = useCallback(async() => {
    try {
     await deleteSlots({slots: [props.slot]})
    } catch (error) {
      console.error('Failed to delete slot: ', error);
    }
  },[deleteSlots, props.slot]);
  
  return (
    <Button onClick={handleDeleteSlot} variant='outline' size='sm' className='w-8 px-0'>
      <Trash2 size={16} />
    </Button>
  )
});