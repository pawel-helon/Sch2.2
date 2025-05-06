import { Loader } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { Button } from "src/components/Button";
import { Calendar } from "src/components/Calendar";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from 'src/components/Sheet';
import { Paragraph } from "src/components/typography/Paragraph";
import { useUpdateSessionMutation } from "src/redux/actions/sessions/updateSession";
import { selectDaySlots } from "src/redux/selectors/slots/selectDaySlots";
import { infoAdded } from "src/redux/slices/infoSlice";
import { RootState } from "src/redux/store";
import { Session } from "src/types/sessions";
import { Slot } from "src/types/slots";
import { sortAndFilterSlots } from "src/utils/data/sortAndFilterSlots";
import { getDate } from "src/utils/dates/getDate";
import { getTime } from "src/utils/dates/getTime";

export const Mobile = (props: {
  session: Session
}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size='sm' className='w-full'>
          Reschedule
        </Button>
      </SheetTrigger>
      <SheetContent aria-describedby='' side='right' className='min-h-[80vh] flex flex-col flex-start bg-background'>
        <SheetTitle className='mb-8'>
          Reschedule
        </SheetTitle>
        <Form session={props.session} open={open} setOpen={setOpen} />
      </SheetContent>
    </Sheet>
  )
}

const Form = (props: {
  session: Session,
  open: boolean,
  setOpen: (open: boolean) =>  void
}) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = React.useState<string>('');
  const [ updateSession ] = useUpdateSessionMutation();
  const { data: slots, status } = useSelector((state: RootState) => selectDaySlots(state, getDate(date || new Date())));
  
  const handleSubmit = async () => {
    props.setOpen(false);
    try {
      await updateSession({ sessionId: props.session.id, slotId: selectedSlot})
    } catch (error) {
      infoAdded({ message: 'Failed to update session.' });
      console.error(error);
    }
  }
  
  const customerFullName = props.session.customerFirstName! + props.session.customerLastName;

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
    <form action={handleSubmit} className='flex flex-col gap-4 mt-8'>
      <Calendar autoFocus selected={date} onSelect={setDate} mode='single' className='mb-4' />
      {content}
      <div className='w-full absolute bottom-0 left-0 right-0 flex p-4 pb-8'>
        <Button type='submit' disabled={selectedSlot === ''}className='w-full'>Reschedule</Button>
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
  const [firstSlot, setFirstSlot] = React.useState<number>(0);
  const [lastSlot, setlastSlot] = React.useState<number>(5);
  const displayedSlots = sortAndFilterSlots(props.slots, firstSlot, lastSlot);
  
  return (
    <div className='flex flex-col gap-2'>
      {displayedSlots.map((slot) => (
        <Button
          key={slot.id} 
          type='button'
          onClick={() => props.setSelectedSlot(slot.id)}
          variant='outline' 
          isPressed={slot.id === props.selectedSlot}
          className='h-8 rounded-md px-3 text-xs'
        >
          {getTime(slot.startTime)}
        </Button>
      ))}
      <NextPrevButtons
        slots={props.slots}
        selectedSlot={props.selectedSlot}
        setSelectedSlot={props.setSelectedSlot}
        firstSlot={firstSlot}
        setFirstSlot={setFirstSlot}
        lastSlot={lastSlot}
        setLastSlot={setlastSlot}
      />
    </div>
  )
}

const NextPrevButtons = (props: {
  slots: Slot[],
  selectedSlot: string,
  setSelectedSlot: (selectedSlot: string) => void,
  firstSlot: number,
  setFirstSlot: (firstSlot: number) => void,
  lastSlot: number,
  setLastSlot: (lastSlot: number) => void
}) => {
  
  const handlePrevSlots = () => {
    props.setSelectedSlot('');
    props.setFirstSlot(props.firstSlot - 5);
    props.setLastSlot(props.lastSlot - 5);
  }

  const  handleNextSlots = () => {
    props.setSelectedSlot('');
    props.setFirstSlot(props.firstSlot + 5);
    props.setLastSlot(props.lastSlot + 5);
  }
  
  return (
    <>
      <Button disabled={props.firstSlot === 0} onClick={handlePrevSlots} type='button' variant='outline' className='w-full text-xs pr-6 mt-2'>
        Previous
      </Button>
      <Button disabled={props.lastSlot >= props.slots.length} onClick={handleNextSlots} type='button' variant='outline' className='w-full text-xs pl-6'>
        Next
      </Button>
    </>
  )
}
