import { ReactNode, useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useUpdateSessionMutation } from 'src/redux/actions/sessions/updateSession';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { RootState } from 'src/redux/store';
import { selectSlotsForReschedulingSession } from 'src/redux/selectors/slots/selectSlotsForReschedulingSession';
import { useUpdateSlotsForReschedulingSessionMutation } from 'src/redux/actions/slots/updateSlotsForReschedulingSession';
import { Button } from 'src/components/Button';
import { Calendar } from 'src/components/Calendar';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from 'src/components/Dialog';
import { Paragraph } from 'src/components/typography/Paragraph';
import { getTime } from 'src/utils/dates/getTime';
import { getDate } from 'src/utils/dates/getDate';
import { Slot } from 'src/types/slots';

export const RescheduleSessionDesktop = (props: {
  employeeId: string,
  sessionId: string,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' className='w-fit'>
          Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby='' className='flex flex-col w-[480px]'>
        <DialogTitle>
          Reschedule meeting
        </DialogTitle>
        <Form
          employeeId={props.employeeId}
          sessionId={props.sessionId}
          open={open}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  )
}

const Form = (props: {
  employeeId: string,
  sessionId: string,
  open: boolean,
  setOpen: (open: boolean) => void
}) => {
  const [ date, setDate ] = useState<Date | undefined>(new Date());
  const [ selectedSlot, setSelectedSlot ] = useState<string>('');
  const [ updateSession ] = useUpdateSessionMutation();
  const { data: slots, status } = useSelector((state: RootState) => selectSlotsForReschedulingSession(state));

  const [ updateSlotsForReschedulingSession ] = useUpdateSlotsForReschedulingSessionMutation();

  useEffect(() => {
    updateSlotsForReschedulingSession({ employeeId: props.employeeId, day: getDate(date || new Date()) })
  },[updateSlotsForReschedulingSession, props.employeeId, date]);

  const handleSubmit = async () => {
    props.setOpen(false);
    try {
      await updateSession({ sessionId: props.sessionId, slotId: selectedSlot})
    } catch (error) {
      infoAdded({ message: 'Failed to update session.' });
      console.error(error);
    }
  }

  let content: ReactNode = null;
  if (status !== 'fulfilled') {
    content = <Loading />;
  } else if (slots.length === 0) {
    content = <NoSlots />;
  } else {
    content = (
      <SelectSlot
        slots={slots}
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
      />
    );
  }
  
  return (
    <form action={handleSubmit} className='mt-4'>
      <div className='grid grid-cols-3 gap-2'>
        <Calendar autoFocus selected={date} onSelect={setDate} mode='single' className='col-span-2' />
        {content}
      </div>
      <div className='absolute bottom-0 left-0 right-0 w-full flex justify-end p-6 pt-8'>
        <Button disabled={selectedSlot === ''} type='submit'>Reschedule</Button>
      </div>
    </form>
  )
}

const Loading = () => {
  return (
    <div className='w-full animate-fade-in transition-none duration-300 relative h-full col-span-1 flex justify-center items-center border rounded-md border-border shadow-lg shadow-shadow bg-background-sh'>
      <Loader className='size-6 animate-spin' />
    </div>
  )
}

const NoSlots = () => {
  return (
    <div className='w-full flex justify-center items-center'>
      <Paragraph variant='thin' size='sm' className='max-w-[32ch] text-center text-balance text-text-secondary'>
        No slots available. Please choose different day.
      </Paragraph>
    </div>
  )
}

const SelectSlot = (props: {
  slots: Slot[],
  selectedSlot: string,
  setSelectedSlot: (selectedSlot: string) => void,
}) => {
  return (
    <div className='max-h-[266px] pr-1 flex flex-col gap-2 overflow-y-scroll scrollbar scrollbar-thumb-border scrollbar-thumb-rounded-full scrollbar-track-card-background scrollbar-w-1 scrollbar-h-1'>
      {props.slots.map((slot) => (
        <Item
          key={slot.id}
          slot={slot}
          selectedSlot={props.selectedSlot}
          setSelectedSlot={props.setSelectedSlot}
        />
      ))}
    </div>
  )
}

const Item = (props: {
  slot: Slot,
  selectedSlot: string,
  setSelectedSlot: (selectedSlot: string) => void,
}) => {
  return (
    <Button
      key={props.slot.id} 
      type='button'
      onClick={() => props.setSelectedSlot(props.slot.id)}
      variant='outline' 
      isPressed={props.slot.id === props.selectedSlot}
      className='h-8 rounded-md px-3 text-xs hover:bg-text-tertiary/25'
    >
      {getTime(props.slot.startTime)}
    </Button>
  )
}