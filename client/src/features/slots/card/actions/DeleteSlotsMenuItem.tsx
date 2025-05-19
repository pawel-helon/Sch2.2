import { memo, useCallback } from 'react';
import { Button } from 'src/components/Button';
import { useDeleteSlotsMutation } from 'src/redux/actions/slots/deleteSlots';
import { Slot } from 'src/types';

interface DeleteSlotsMenuItemProps {
  slots: Slot[];
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
}

export const DeleteSlotsMenuItem = memo((props: DeleteSlotsMenuItemProps) => {
  const [ deleteSlots ] = useDeleteSlotsMutation();
  
  const handleClick = useCallback(async () => {
    props.setDropdownOpen(false);
    try {
      deleteSlots({ slots: props.slots });
    } catch (error) {
      console.error('Failed to delete slots: ', error);
    }
  },[props.setDropdownOpen, deleteSlots, props.slots]);
  
  return (
    <Button onClick={handleClick} variant='ghost' size='sm' className='justify-start text-left pl-1.5'>
      Delete slots
    </Button>
  )
});