import { getWeekStartEndDatesFromDay } from 'src/lib/helpers';
import { useGetWeekSlotsQuery } from 'src/lib/schedulingApi';
import { Toasts } from './Toasts';

import { useAddSlotMutation } from 'src/features/slots/actions/addSlot';
import { useAddRecurringSlotMutation } from './actions/addRecurringSlot';
import { useUpdateSlotHourMutation } from './actions/updateSlotHour';

export const AvailabilityLayout = () => {
  const employeeId = '06daeca5-1878-4adf-abf4-58045206a555';
  const slotId = '13b29d83-23b6-4aea-b676-81867bc60f0d';
  const { start, end } = getWeekStartEndDatesFromDay(new Date());
  useGetWeekSlotsQuery({ employeeId, start, end });
  
  const day = '2025-04-20';
  
  const [ addSlot ] = useAddSlotMutation();
  const [ addRecurringSlot ] = useAddRecurringSlotMutation();
  const [ updateSlotHour ] = useUpdateSlotHourMutation();
  const [ updateRecurringSlotHour ] = useUpdateRecurringSlotHourMutation();
  const [ updateRecurringSlotMinutes ] = useUpdateRecurringSlotMinutesMutation();
  const [ deleteSlots ] = useDeleteSlotsMutation();

  return (
    <>
      Availability layout
      <button
        className='border border-border p-2'
        onClick={() => addSlot({ employeeId, day: '2025-04-21' })}
      >
        add slot
      </button>
      <button
        className='border border-border p-2'
        onClick={() => updateSlotHour({ slotId, hour: 12 })}
      >
        update slot hour
      </button>
      <button
        className='border border-border p-2'
        onClick={() => updateRecurringSlotHour({ slotId, hour: 17 })}
      >
        update recurring slot hour
      </button>
      <button
        className='border border-border p-2'
        onClick={() => updateRecurringSlotMinutes({ employeeId, slotId, minutes: 12 })}
      >
        update recurring slot minutes
      </button>
      <button
        className='border border-border p-2'
        onClick={() => addRecurringSlot({ employeeId, day })}
      >
        add recurring slot
      </button>
      <button
        className='border border-border p-2'
        onClick={() => deleteSlots({ slots })}
      >
        delete slots
      </button>
      <Toasts />
    </>
  )
}

const slodIds = ['16c0ea88-5b48-46e5-a282-735715242b61', '599e317c-5464-4d82-bd12-095dd935e5b7']

const slots = [
  {
    id: '16c0ea88-5b48-46e5-a282-735715242b61',
    employeeId: '06daeca5-1878-4adf-abf4-58045206a555',
    type: 'AVAILABLE' as 'AVAILABLE',
    startTime: new Date(new Date('2025-04-20').setHours(8,13)),
    duration: '00:30:00',
    recurring: false,
    createdAt: new Date(new Date('2025-04-20').setHours(8,13)),
    updatedAt: new Date(new Date('2025-04-20').setHours(8,13))
  },
  {
    id: '599e317c-5464-4d82-bd12-095dd935e5b7',
    employeeId: '06daeca5-1878-4adf-abf4-58045206a555',
    type: 'AVAILABLE' as 'AVAILABLE',
    startTime: new Date(new Date('2025-04-20').setHours(9,13)),
    duration: '00:30:00',
    recurring: false,
    createdAt: new Date(new Date('2025-04-20').setHours(9,13)),
    updatedAt: new Date(new Date('2025-04-20').setHours(9,13))
  }
]