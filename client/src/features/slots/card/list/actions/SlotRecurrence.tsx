import { Button } from 'src/components/Button';
import { useDisableSlotRecurrenceMutation } from 'src/redux/actions/slots/disableSlotRecurrence';
import { useSetSlotRecurrenceMutation } from 'src/redux/actions/slots/setSlotRecurrence';

export const SlotRecurrence = (props: {
  slotId: string,
  isRecurring: boolean,
  open: boolean,
  setOpen: (open: boolean) => void
}) => {
  const [ setSlotRecurrence ] = useSetSlotRecurrenceMutation();
  const [ disableSlotRecurrence ] = useDisableSlotRecurrenceMutation();

  const handleClick = () => {
    props.setOpen(false);
    try {
      if (!props.isRecurring) {
        setSlotRecurrence({ slotId: props.slotId });
      } else {
        disableSlotRecurrence({ slotId: props.slotId });
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  const copy = props.isRecurring ? 'Disable recurring' : 'Set recurring';
  
  return (
    <Button onClick={handleClick} variant='ghost' size='sm' className='justify-start text-left pl-1.5'>
      {copy}
    </Button>
  )
}