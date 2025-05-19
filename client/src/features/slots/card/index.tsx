import { memo, useCallback, useMemo } from 'react';
import { Loader, Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store';
import { selectDaySlots } from 'src/redux/selectors/slots/selectDaySlots';
import { useAddSlotMutation } from 'src/redux/actions/slots/addSlot';
import { useAddRecurringSlotMutation } from 'src/redux/actions/slots/addRecurringSlot';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { Actions } from './actions';
import { Item } from './item';
import { Button } from 'src/components/Button';
import { Paragraph } from 'src/components/typography/Paragraph';
import { Badge } from 'src/components/Badge';
import { isPast } from 'src/utils/dates/isPast';
import { getDayName } from 'src/utils/dates/getDayName';
import { capitalizeFirstLetter } from 'src/utils/capitalizeFirstLetter';
import { filterSlotsByRecurrence } from 'src/utils/data/filterSlotsByRecurrence';
import { Slot } from 'src/types';

interface CardProps {
  employeeId: string;
  year: number;
  weekNumber: number;
  day: string;
  isRecurringSlotsOnly: boolean;
  isMobile: boolean;
}

export const Card = memo((props: CardProps) => {
  const { data, status } = useSelector((state: RootState) => selectDaySlots(state, props.day));
  const slots = filterSlotsByRecurrence(data, props.isRecurringSlotsOnly);

  return status === 'pending'
    ? <Loading isMobile={props.isMobile} />
    : <Loaded slots={slots} {...props} />
});

interface LoadingProps {
  isMobile: boolean;
}

const Loading = memo((props: LoadingProps) => {
  return props.isMobile ?
    (
      <div className='flex relative h-[120px] col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
        <Loader className='size-6 text-text-tertiary animate-spin' />
      </div>
    ) : (
      <div className='aspect-[3/4] flex relative col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
        <Loader className='size-6 text-text-tertiary absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 animate-spin' />
      </div>
    )
});

interface LoadedProps {
  employeeId: string;
  slots: Slot[];
  year: number;
  weekNumber: number;
  day: string;
  isRecurringSlotsOnly: boolean;
  isMobile: boolean;
}

const Loaded = memo((props: LoadedProps) => {
  return props.slots.length === 0
    ? <NoSlots employeeId={props.employeeId} day={props.day} isRecurringSlotsOnly={props.isRecurringSlotsOnly} isMobile={props.isMobile} />
    : <Slots {...props} />
});

interface NoSlotsProps {
  employeeId: string;
  day: string;
  isRecurringSlotsOnly: boolean;
  isMobile: boolean;
}

const NoSlots = memo((props: NoSlotsProps) => {
  return props.isMobile
    ? <Mobile {...props} />
    : <Desktop {...props} />
});

interface MobileProps {
  employeeId: string;
  day: string;
  isRecurringSlotsOnly: boolean;
  isMobile: boolean;
}

const Mobile = memo((props: MobileProps) => {
  return !isPast(props.day) ?
    (
      <div className='aspect-square flex relative h-full col-span-1 flex-col bg-background'>
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
    ) : null
});

interface DesktopProps {
  employeeId: string;
  day: string;
  isRecurringSlotsOnly: boolean;
  isMobile: boolean;
}

const Desktop = memo((props: DesktopProps) => {
  const header = useMemo(() =>
    <div className='absolute top-3 left-3 right-3 flex justify-between items-center bg-transparent'>
      <Paragraph variant='thick' size='sm' isMuted={isPast(props.day)}>
        {capitalizeFirstLetter(getDayName(props.day))}
      </Paragraph>
      <Badge day={props.day} value='date' />
    </div>,
    [capitalizeFirstLetter, getDayName, props.day]
  );
  
  return !isPast(props.day) ?
    (
      <div className='aspect-[3/4] flex relative col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
        {header}
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
    ) : (
      <div className='aspect-[3/4] flex relative col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
        {header}
        <Paragraph variant='thin' size='sm' className='text-center text-text-tertiary text-balance absolute top-0 bottom-0 left-0 right-0 flex flex-col p-3 justify-center items-center gap-2 mt-4'>
          There are no slots available.
        </Paragraph>
      </div>
    )
});

interface AddSlotButtonProps {
  employeeId: string;
  day: string;
  isRecurringSlotsOnly: boolean;
  isMobile: boolean;
}

const AddSlotButton = (props: AddSlotButtonProps) => {
  const [ addSlot, { isLoading: isAddingSlot } ] = useAddSlotMutation();
  const [ addRecurringSlot, { isLoading: isAddingRecurringSlot } ] = useAddRecurringSlotMutation();

  const handleAddSlot = useCallback(async () => {
    try {
      await addSlot({ employeeId: props.employeeId, day: props.day});
    } catch (error) {
      infoAdded({ message: 'Failed to add slot.' });
      console.error('Failed to add slot.', error);
    }
  },[addSlot, props.employeeId, props.day, infoAdded])

  const handleAddRecurringSlot = useCallback(async () => {
    try {
      await addRecurringSlot({ employeeId: props.employeeId, day: props.day});
    } catch (error) {
      infoAdded({ message: 'Failed to add recurring slot.' });
      console.error('Failed to add recurring slot.', error);
    }
  },[addRecurringSlot, props.employeeId, props.day, infoAdded])

  const handleClick = useMemo(() => props.isRecurringSlotsOnly ? handleAddRecurringSlot : handleAddSlot,
    [props.isRecurringSlotsOnly, handleAddRecurringSlot, handleAddSlot]
  );

  return (
    <Button disabled={isAddingSlot || isAddingRecurringSlot} onClick={handleClick} size='sm' variant='outline' className='bg-background text-text-primary'>
      {isAddingSlot || isAddingRecurringSlot ? (
        <>
          <Loader className='w-4 h-4 -ml-2 mr-1 text-text-tertiary animate-spin' />
          Adding
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

interface SlotsProps {
  employeeId: string;
  slots: Slot[];
  year: number;
  weekNumber: number;
  day: string;
  isRecurringSlotsOnly: boolean;
  isMobile: boolean;
}

const Slots = memo((props: SlotsProps) => {
  const slotList = useMemo(() => 
    <div className='max-h-[calc(100%-56px)] flex flex-col gap-1 xs:mt-10 pl-3 pr-2 pb-10 overflow-y-auto scrollbar scrollbar-thumb-border scrollbar-thumb-rounded-full scrollbar-track-card-background scrollbar-w-1 scrollbar-h-1 bg-background'>
      {props.slots.map((slot) => (
        <Item key={slot.id} slot={slot} />
      ))}
    </div>,
    [props.slots]
  )
  
  return props.isMobile ?
    (
      <div className='relative aspect-square border border-border flex col-span-1 flex-col bg-background'>
        {slotList}
        <Actions {...props} />
      </div>
    ) : (
      <div className='relative aspect-[3/4] flex flex-col col-span-1 border border-border shadow-lg shadow-shadow rounded-md bg-background'>
        <div className='absolute top-3 left-3 right-3 flex justify-between items-center bg-transparent'>
          <Paragraph variant='thick' size='sm' isMuted={isPast(props.day)}>
            {capitalizeFirstLetter(getDayName(props.day))}
          </Paragraph>
          <Badge day={props.day} value='date' />
        </div>
        {slotList}
        <Actions {...props} />
      </div>
    )
});
