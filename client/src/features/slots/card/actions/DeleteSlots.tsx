// TODO: add confirmation dialog
import { Button } from 'src/components/Button';
import { useDeleteSlotsMutation } from 'src/redux/actions/slots/deleteSlots';
import { Slot } from 'src/types/slots';

export const DeleteSlots = (props: {
  slots: Slot[],
  dropdownOpen: boolean,
  setDropdownOpen: (open: boolean) => void
}) => {
  const [ deleteSlots ] = useDeleteSlotsMutation();
  
  const handleClick = async () => {
    props.setDropdownOpen(false);
    try {
      deleteSlots({ slots: props.slots });
    } catch (error) {
      console.error('Failed to delete slots: ', error);
    }
  }
  
  return (
    <Button onClick={handleClick} variant='ghost' size='sm' className='justify-start text-left pl-1.5'>
      Delete slots
    </Button>
  )
}