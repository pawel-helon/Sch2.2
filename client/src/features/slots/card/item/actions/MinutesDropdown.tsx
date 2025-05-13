import { memo, useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from 'src/components/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from 'src/components/DropdownMenu';
import { useUpdateRecurringSlotMinutesMutation } from 'src/redux/actions/slots/updateRecurringSlotMinutes';
import { useUpdateSlotMinutesMutation } from 'src/redux/actions/slots/updateSlotMinutes';
import { getSlotHourAndMinutes } from 'src/utils/dates/getSlotHourAndMinutes';
import { MINUTES } from 'src/constants/data';
import { cn } from 'src/utils/cn';

interface MinutesDropdownProps {
  slotId: string;
  startTime: Date;
  isRecurring: boolean;
}

export const MinutesDropdown = memo((props: MinutesDropdownProps) => {
  const [open, setOpen] = useState<boolean>(false);
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
});

interface MinutesProps {
  slotId: string;
  minutes: number;
  isRecurring: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Minutes = memo((props: MinutesProps) => {
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
});

interface MinuteProps {
  slotId: string;
  currentSlotMinute: number;
  minute: number;
  isRecurring: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Minute = memo((props: MinuteProps) => {
  const [ updateSlotMinutes ] = useUpdateSlotMinutesMutation();
  const [ updateRecurringSlotMinutes ] = useUpdateRecurringSlotMinutesMutation();

  const handleUpdateSlotMinutes = useCallback(async () => {
    props.setOpen(false);
    try {
      await updateSlotMinutes({ slotId: props.slotId, minutes: props.minute });
    } catch (error) {
      console.error('Failed to update slot minutes: ', error);
    }
  },[props.setOpen, updateSlotMinutes, props.slotId, props.minute])

  const handleUpdateRecurringSlotMinutes = useCallback(async () => {
    props.setOpen(false);
    try {
      await updateRecurringSlotMinutes({ slotId: props.slotId, minutes: props.minute });
    } catch (error) {
      console.error('Failed to update recurring slot minutes: ', error);
    }
  },[props.setOpen, props.slotId, props.minute]);

  const handleClick = useMemo(() => props.isRecurring ? handleUpdateRecurringSlotMinutes : handleUpdateSlotMinutes,
    [props.isRecurring, handleUpdateRecurringSlotMinutes, handleUpdateSlotMinutes]
  );
  
  const isCurrentSlotMinutes = props.currentSlotMinute === props.minute;
  
  return (
    <Button
      key={props.minute}
      onClick={handleClick} 
      variant='ghost' 
      size='sm'
      className={cn(
        isCurrentSlotMinutes ? 'bg-background-hover text-text-tertiary' : '',
        'h-8 py-2'
      )}
    >
      {String(props.minute).padStart(2, '0')}
    </Button>
  )
});