import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store';
import { useDisableRecurringDayMutation } from 'src/redux/actions/slots/disableRecurringDay';
import { useSetRecurringDayMutation } from 'src/redux/actions/slots/setRecurringDay';
import { selectSlotsRecurringDay } from 'src/redux/selectors/slots/selectSlotsRecurringDay';
import { Button } from 'src/components/Button';

export const DayRecurrence = (props: {
  employeeId: string,
  day: string,
  dropdownOpen: boolean,
  setDropdownOpen: (open: boolean) => void
}) => {
  const { data: isRecurringDay } = useSelector((state: RootState) => selectSlotsRecurringDay(state, props.day));
  const [ setRecurringDay ] = useSetRecurringDayMutation();
  const [ disableRecurringDay ] = useDisableRecurringDayMutation();

  const handleSetRecurringDay = async () => {
    props.setDropdownOpen(false);
    try {
      await setRecurringDay({ employeeId: props.employeeId, day: props.day });
    } catch (error) {
      console.error('Failed to disable recurring day: ', error);
    }
  }

  const handleDisableRecurringDay = async () => {
    props.setDropdownOpen(false);
    try {
      await disableRecurringDay({ employeeId: props.employeeId, day: props.day });
    } catch (error) {
      console.error('Failed to set recurring day: ', error);
    }
  }

  const handleClick = isRecurringDay ? handleDisableRecurringDay : handleSetRecurringDay;
  const cta: string = isRecurringDay ? 'Disable recurring day' : 'Set recurring day';  
  
  return (
    <Button onClick={handleClick} variant='ghost' size='sm' className='justify-start text-left pl-1.5'>
      {cta}
    </Button>
  )
}