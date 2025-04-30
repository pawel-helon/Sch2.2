import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from 'src/components/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from 'src/components/DropdownMenu';
import { useUpdateRecurringSlotMinutesMutation } from 'src/redux/actions/slots/updateRecurringSlotMinutes';
import { useUpdateSlotMinutesMutation } from 'src/redux/actions/slots/updateSlotMinutes';
import { getSlotHourAndMinutes } from 'src/utils/dates/getSlotHourAndMinutes';
import { MINUTES } from 'src/constants/data';
import { cn } from 'src/utils/cn';

export const MinutesDropdown = (props: {
  slotId: string,
  startTime: Date,
  isRecurring: boolean,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const { minutes } = getSlotHourAndMinutes(props.startTime);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='w-16 min-w-[64px] bg-background'>
          {String(minutes).padStart(2, '0')}
          <ChevronDown className='size-4 ml-2 text-text-primary' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom' align='start' className='w-16 min-w-[64px] flex flex-col shadow-shadow shadow-sm bg-background'>
        <Minutes
          slotId={props.slotId}
          minutes={minutes}
          isRecurring={props.isRecurring}
          open={open}
          setOpen={setOpen}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const Minutes = (props: {
  slotId: string,
  minutes: number,
  isRecurring: boolean,
  open: boolean,
  setOpen: (open: boolean) => void
}) => {
  return (
    <div className='w-full max-h-[320px] flex flex-col gap-0.5 overflow-y-scroll scrollbar scrollbar-thumb-muted scrollbar-thumb-rounded-full scrollbar-track-card-background scrollbar-w-1 scrollbar-h-1'>
      {MINUTES.map((minute) => (
        <Minute
          key={minute}
          slotId={props.slotId}
          currentSlotMinute={props.minutes}
          minute={minute}
          isRecurring={props.isRecurring}
          open={props.open}
          setOpen={props.setOpen}
        />
      ))}
    </div>
  )
}

const Minute = (props: {
  slotId: string,
  currentSlotMinute: number,
  minute: number,
  isRecurring: boolean,
  open: boolean,
  setOpen: (open: boolean) => void
}) => {
  const [ updateSlotMinutes ] = useUpdateSlotMinutesMutation();
  const [ updateRecurringSlotMinutes ] = useUpdateRecurringSlotMinutesMutation();
  
  const handleClick = async () => {
    props.setOpen(false);
    let errorMessage: string = '';
    try {
      if (!props.isRecurring) {
        await updateSlotMinutes({ slotId: props.slotId, minutes: props.minute });
        errorMessage = 'Failed to update slot minutes: ';
      } else {
        await updateRecurringSlotMinutes({ slotId: props.slotId, minutes: props.minute });
        errorMessage = 'Failed to update recurring slot minutes: ';
      }
    } catch (error) {
      console.error(errorMessage, error);
    }
  }

  const className = props.currentSlotMinute === props.minute ? 'bg-background-hover text-text-tertiary' : ''
  
  return (
    <Button
      key={props.minute}
      onClick={handleClick} 
      variant='ghost' 
      size='sm'
      className={cn(className, 'h-8 py-2')}
    >
      {String(props.minute).padStart(2, '0')}
    </Button>
  )
}