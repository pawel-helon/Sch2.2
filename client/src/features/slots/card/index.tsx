import React from 'react';
import { Loader, Plus } from 'lucide-react';
import { RootState } from 'src/redux/store';
import { Button } from 'src/components/Button';
import { Paragraph } from 'src/components/typography/Paragraph';
import { capitalizeFirstLetter } from 'src/utils/capitalizeFirstLetter';
import { filterSlotsByRecurrence } from 'src/utils/data/filterSlotsByRecurrence';
import { isPast } from 'src/utils/dates/isPast';
import { getDayName } from 'src/utils/dates/getDayName';
import { Slot } from 'src/types/slots'
import { useSelector } from 'react-redux';
import { Badge } from 'src/components/Badge';
import { selectDaySlots } from 'src/redux/selectors/slots/selectDaySlots';
import { useAddSlotMutation } from 'src/redux/actions/slots/addSlot';
import { useAddRecurringSlotMutation } from 'src/redux/actions/slots/addRecurringSlot';
import { Actions } from './actions';

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

  let content: React.ReactNode;
  if (status === 'pending') {
    content = <Loading isMobile={props.isMobile} />;
  } else {
    content = (
      <Loaded
        employeeId={props.employeeId}
        slots={slots}
        year={props.year}
        weekNumber={props.weekNumber}
        day={props.day}
        isRecurringSlotsOnly={props.isRecurringSlotsOnly}
        isMobile={props.isMobile}
      />
    );
  }

  return content;
}

const Loading = (props: {
  isMobile: boolean
}) => {
  let content: React.ReactNode = null;
  if (props.isMobile) {
    content = (
      <div className='flex relative h-[120px] col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
        <Loader className='size-6 text-text-tertiary animate-spin' />
      </div>
    )
  } else {
    content = (
      <div style={{ aspectRatio: '3/4' }} className='flex relative h-full col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
        <Loader className='size-6 text-text-tertiary absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 animate-spin' />
      </div>
    )
  }
  return content;
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
  let content: React.ReactNode = null;
  
  if (props.slots.length === 0) {
    content = (
      <NoSlots 
        employeeId={props.employeeId}
        day={props.day}
        isRecurringSlotsOnly={props.isRecurringSlotsOnly}
      />
    );
  } else {
    if (props.isMobile) {
      content = (
        <Mobile
          employeeId={props.employeeId}
          slots={props.slots}
          year={props.year}
          weekNumber={props.weekNumber}
          day={props.day}
          isRecurringSlotsOnly={props.isRecurringSlotsOnly}
          isMobile={props.isMobile}
        />
      )
    } else {
      content = (
        <Desktop
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
  return content;
}

const NoSlots = (props: {
  employeeId: string,
  day: string,
  isRecurringSlotsOnly: boolean,
}) => {
  const [ addSlot ] = useAddSlotMutation();
  const [ addRecurringSlot ] = useAddRecurringSlotMutation();

  const handleAddSlot = async () => {
    try {
      await addSlot({ employeeId: props.employeeId, day: props.day})
    } catch (error) {
      console.error(error);
    }
  }

  const handleAddRecurringSlot = async () =>  {
    try {
      await addRecurringSlot({ employeeId: props.employeeId, day: props.day})
    } catch (error) {
      console.error(error);
    }
  }

  const action = props.isRecurringSlotsOnly ? handleAddRecurringSlot : handleAddSlot;
  
  let content: React.ReactNode = null;
  if (!isPast(props.day)) {
    content = (
      <div className='absolute top-0 bottom-0 left-0 right-0 flex flex-col p-3 justify-center items-center gap-2 mt-4'>
        <Paragraph variant='thin' size='sm' className='w-full text-center text-text-tertiary text-balance'>
          There are no {props.isRecurringSlotsOnly && ' recurring '} slots created yet.
        </Paragraph>
        <Button onClick={action} size='sm' variant='outline' className='bg-background text-text-primary'>
          <Plus className='size-4 -ml-2 mr-1'/>
          {props.isRecurringSlotsOnly ? 'Add recurring slot' : 'Add slot'}
        </Button>
      </div>
    );
  } else {
    content = (
      <Paragraph variant='thin' size='sm' className='w-full text-center text-text-tertiary text-balance absolute top-0 bottom-0 left-0 right-0 flex flex-col p-3 justify-center items-center gap-2 mt-4'>
        There are no slots available.
      </Paragraph>
    );
  }
  
  return content;
}

const Mobile = (props: {
  employeeId: string,
  slots: Slot[],
  year: number,
  weekNumber: number,
  day: string,
  isRecurringSlotsOnly: boolean,
  isMobile: boolean
}) => {
  const content = (
    <>
      {/* TODO: Slot list */}
      <Actions
        employeeId={props.employeeId}
        slots={props.slots}
        year={props.year}
        weekNumber={props.weekNumber}
        day={props.day}
        isRecurringSlotsOnly={props.isRecurringSlotsOnly}
        isMobile={props.isMobile}
      />
    </>
  ) 
  
  return (
    <div style={{ aspectRatio: '1' }} className='flex xs:hidden relative h-full col-span-1 flex-col bg-blaskish500'>
      {content}
    </div>
  )
}

export const Desktop = (props: {
  employeeId: string,
  slots: Slot[],
  year: number,
  weekNumber: number,
  day: string,
  isRecurringSlotsOnly: boolean,
  isMobile: boolean
}) => {
  const content = (
    <>
      {/* TODO: Slot list */}
      <Actions
        employeeId={props.employeeId}
        slots={props.slots}
        year={props.year}
        weekNumber={props.weekNumber}
        day={props.day}
        isRecurringSlotsOnly={props.isRecurringSlotsOnly}
        isMobile={props.isMobile}
      />
    </>
  ) 
  
  return (
    <div style={{ aspectRatio: '3/4' }} className='flex relative h-full col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
      <div className='absolute top-3 left-3 right-3 flex justify-between items-center'>
        <Paragraph variant='thick' size='sm' isMuted={isPast(props.day)}>
          {capitalizeFirstLetter(getDayName(props.day))}
        </Paragraph>
        <Badge day={props.day} />
      </div>
      {content}
    </div>
  )
}
