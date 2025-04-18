import { getWeekStartEndDatesFromDay } from 'src/lib/helpers';
import { useGetWeekSlotsQuery } from 'src/lib/schedulingApi';
import { Toasts } from './Toasts';
import { useAddRecurringSlotMutation, useUpdateSlotHourMutation } from './slotsSlice';

export const AvailabilityLayout = () => {
  const employeeId = 'c722c52b-4222-4357-9eb6-3d90e2cb9367';
  const slotId = '0966cfed-eac8-4ea3-9982-bcbbf9b8dc30';
  const { start, end } = getWeekStartEndDatesFromDay(new Date());
  useGetWeekSlotsQuery({ employeeId, start, end });
  
  const day = '2025-04-19';
  
  const [ updateSlotHour ] = useUpdateSlotHourMutation();
  const [ addRecurringSlot ] = useAddRecurringSlotMutation();
  
  return (
    <>
      Availability layout
      <button
        className='border border-border p-2'
        onClick={() => updateSlotHour({ employeeId, slotId, hour: 20 })}
      >
        update slot hour
      </button>
      <button
        className='border border-border p-2'
        onClick={() => addRecurringSlot({ employeeId, day })}
      >
        add recurring slot
      </button>
      <Toasts />
    </>
  )
}