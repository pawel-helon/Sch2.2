import { Trash2 } from 'lucide-react';
import { Button } from 'src/components/Button';
import { useDeleteSlotsMutation } from 'src/redux/actions/slots/deleteSlots';
import { Slot } from 'src/types/slots';

export const DeleteSlot = (props: {
  slot: Slot
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