import React from 'react';
import { Button } from 'src/components/Button';
import { Calendar } from 'src/components/Calendar';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from 'src/components/Dialog';
import { useUpdateSessionMutation } from 'src/redux/actions/sessions/updateSession';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { Session } from 'src/types/sessions';
import { Loader } from 'lucide-react';
import { Paragraph } from 'src/components/typography/Paragraph';
import { Slot } from 'src/types/slots';
import { getTime } from 'src/utils/dates/getTime';
import { RootState } from 'src/redux/store';
import { useSelector } from 'react-redux';
import { selectDaySlots } from 'src/redux/selectors/slots/selectDaySlots';
import { getDate } from 'src/utils/dates/getDate';

export const Desktop = (props: {
  session: Session
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

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
        <Form session={props.session} open={open} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}

const Form = (props: {
  session: Session,
  open: boolean,
  setOpen: (open: boolean) => void
}) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = React.useState<string>('');
  const [ updateSession ] = useUpdateSessionMutation();

  const customerFullName = props.session.customerFirstName! + props.session.customerLastName;

  const { data: slots, status } = useSelector((state: RootState) => selectDaySlots(state, getDate(date || new Date())))

  const handleSubmit = async () => {
    props.setOpen(false);
    try {
      await updateSession({ sessionId: props.session.id, slotId: selectedSlot})
    } catch (error) {
      infoAdded({ message: 'Failed to update session.' });
      console.error(error);
    }
  }
  let content: React.ReactNode = null;
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
        sessionId={props.session.id}
        customerFullName={customerFullName}
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
        <Button type='submit'>Reschedule</Button>
      </div>
    </form>
  )
}

const Loading = () => {
  return (
    <div className='w-full animate-fade-in transition-all duration-300 relative h-full col-span-1 flex justify-center items-center border rounded-md border-border shadow-lg shadow-shadow bg-background-sh'>
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
  sessionId: string,
  customerFullName: string
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