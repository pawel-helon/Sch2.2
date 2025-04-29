import React from 'react';
import { useSelector } from 'react-redux';
import { Loader, Plus } from 'lucide-react';
import { RootState } from 'src/redux/store';
import { selectDaySlots } from 'src/redux/selectors/slots/selectDaySlots';
import { useAddSlotMutation } from 'src/redux/actions/slots/addSlot';
import { useAddRecurringSlotMutation } from 'src/redux/actions/slots/addRecurringSlot';
import { Actions } from './actions';
import { List } from './list';
import { Button } from 'src/components/Button';
import { Paragraph } from 'src/components/typography/Paragraph';
import { Badge } from 'src/components/Badge';
import { isPast } from 'src/utils/dates/isPast';
import { getDayName } from 'src/utils/dates/getDayName';
import { capitalizeFirstLetter } from 'src/utils/capitalizeFirstLetter';
import { filterSlotsByRecurrence } from 'src/utils/data/filterSlotsByRecurrence';
import { Slot } from 'src/types/slots'
import { infoAdded } from 'src/redux/slices/infoSlice';

export const Card = (props: {
  employeeId: string,
  year: number,
  weekNumber: number,
  day: string,
  isRecurringSlotsOnly: boolean,
  isMobile: boolean
}) => {
  const { data, status } = useSelector((state: RootState) => selectDaySlots(state, props.day));
  const slots = filterSlotsByRecurrence(data, props.isRecurringSlotsOnly);

  if (status === 'pending') {
    return <Loading isMobile={props.isMobile} />;
  } else {
    return (
      <Loaded
        employeeId={props.employeeId}
        slots={slots}
        year={props.year}
        weekNumber={props.weekNumber}
        day={props.day}
        isRecurringSlotsOnly={props.isRecurringSlotsOnly}
        isMobile={props.isMobile}
      />
    )
  }
}

const Loading = (props: {
  isMobile: boolean
}) => {
  if (props.isMobile) {
    return (
      <div className='flex relative h-[120px] col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
        <Loader className='size-6 text-text-tertiary animate-spin' />
      </div>
    )
  } else {
    return (
      <div className='aspect-[3/4] flex relative h-full col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
        <Loader className='size-6 text-text-tertiary absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 animate-spin' />
      </div>
    );
  }
}

const Loaded = (props: {
  employeeId: string,
  slots: Slot[],
  year: number,
  weekNumber: number,
  day: string,
  isRecurringSlotsOnly: boolean,
  isMobile: boolean
}) => {
  if (props.slots.length === 0) {
    return (
      <NoSlots 
        employeeId={props.employeeId}
        day={props.day}
        isRecurringSlotsOnly={props.isRecurringSlotsOnly}
        isMobile={props.isMobile}
      />
    );
  } else {
    return (
      <Slots
        employeeId={props.employeeId}
        slots={props.slots}
        year={props.year}
        weekNumber={props.weekNumber}
        day={props.day}
        isRecurringSlotsOnly={props.isRecurringSlotsOnly}
        isMobile={props.isMobile}
      />
    )
  }
}

const NoSlots = (props: {
  employeeId: string,
  day: string,
  isRecurringSlotsOnly: boolean,
  isMobile: boolean
}) => {
  let className: string = '';
  if (props.isMobile) {
    className = 'aspect-square flex relative h-full col-span-1 flex-col bg-background';
  } else {
    className = 'aspect-[3/4] flex relative h-full col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background';
  }

  if (!isPast(props.day)) {
    return (
      <div className={className}>
        <div className='absolute top-3 left-3 right-3 flex justify-between items-center bg-transparent'>
          <Paragraph variant='thick' size='sm' isMuted={isPast(props.day)}>
            {capitalizeFirstLetter(getDayName(props.day))}
          </Paragraph>
          <Badge day={props.day} />
        </div>
        <div className='absolute top-0 bottom-0 left-0 right-0 flex flex-col p-3 justify-center items-center gap-2 mt-4'>
          <Paragraph variant='thin' size='sm' className='w-full text-center text-text-tertiary text-balance'>
            There are no {props.isRecurringSlotsOnly && ' recurring '} slots created yet.
          </Paragraph>
          <AddSlotButton
            employeeId={props.employeeId}
            day={props.day}
            isRecurringSlotsOnly={props.isRecurringSlotsOnly}
            isMobile={props.isMobile}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className={className}>
        <Paragraph variant='thin' size='sm' className='w-full text-center text-text-tertiary text-balance absolute top-0 bottom-0 left-0 right-0 flex flex-col p-3 justify-center items-center gap-2 mt-4'>
          There are no slots available.
        </Paragraph>
      </div>
    );
  }
}

const AddSlotButton = (props: {
  employeeId: string,
  day: string,
  isRecurringSlotsOnly: boolean,
  isMobile: boolean
}) => {
  const [ addSlot, { isLoading: isAddingSlot } ] = useAddSlotMutation();
  const [ addRecurringSlot, { isLoading: isAddingRecurringSlot } ] = useAddRecurringSlotMutation();

  const handleAddSlot = async () => {
    try {
      await addSlot({ employeeId: props.employeeId, day: props.day});
    } catch (error) {
      infoAdded({ message: 'Failed to add slot.' });
      console.error('Failed to add slot.', error);
    }
  }

  const handleAddRecurringSlot = async () => {
    try {
      await addRecurringSlot({ employeeId: props.employeeId, day: props.day});
    } catch (error) {
      infoAdded({ message: 'Failed to add recurring slot.' });
      console.error('Failed to add recurring slot.', error);
    }
  }

  const handleClick = props.isRecurringSlotsOnly ? handleAddRecurringSlot : handleAddSlot;

  return (
    <Button disabled={isAddingSlot || isAddingRecurringSlot} onClick={handleClick} size='sm' variant='outline' className='bg-background text-text-primary'>
      {isAddingSlot || isAddingRecurringSlot ? (
        <>
          <Loader className='w-4 h-4 -ml-2 mr-1 text-text-tertiary animate-spin' />
          'Adding'
        </>
      ) : (
        props.isRecurringSlotsOnly ? (
          <>
            <Plus className='w-4 h-4 -ml-2 mr-1' />
            Add recurring slot
          </>
        ) : (
          <>
            <Plus className='w-4 h-4 -ml-2 mr-1' />
            Add slot
          </>
        )
      )}
    </Button>
  )
}

const Slots = (props: {
  employeeId: string,
  slots: Slot[],
  year: number,
  weekNumber: number,
  day: string,
  isRecurringSlotsOnly: boolean,
  isMobile: boolean
}) => {
  let content: React.ReactNode = null;
  if (props.isMobile) {
    content = (
      <div className='aspect-square flex xs:hidden relative h-full col-span-1 flex-col bg-background'>
        <List slots={props.slots} />
        <Actions
          employeeId={props.employeeId}
          slots={props.slots}
          year={props.year}
          weekNumber={props.weekNumber}
          day={props.day}
          isRecurringSlotsOnly={props.isRecurringSlotsOnly}
          isMobile={props.isMobile}
          />
      </div>
    )
  } else {
    content = (
      <div className='aspect-[3/4] flex relative h-full col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
        <div className='absolute top-3 left-3 right-3 flex justify-between items-center bg-transparent'>
          <Paragraph variant='thick' size='sm' isMuted={isPast(props.day)}>
            {capitalizeFirstLetter(getDayName(props.day))}
          </Paragraph>
          <Badge day={props.day} />
        </div>
        <List slots={props.slots} />
        <Actions
          employeeId={props.employeeId}
          slots={props.slots}
          year={props.year}
          weekNumber={props.weekNumber}
          day={props.day}
          isRecurringSlotsOnly={props.isRecurringSlotsOnly}
          isMobile={props.isMobile}
        />
      </div>
    )
  }

  return content;
}
