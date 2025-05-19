import { memo, useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useUpdateSlotHourMutation } from 'src/redux/actions/slots/updateSlotHour';
import { useUpdateRecurringSlotHourMutation } from 'src/redux/actions/slots/updateRecurringSlotHour';
import { Button } from 'src/components/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from 'src/components/DropdownMenu';
import { HOURS } from 'src/constants';
import { cn } from 'src/utils/cn';
import { getSlotHourAndMinutes } from 'src/utils/dates/getSlotHourAndMinutes';

interface HourDropdownProps {
  slotId: string;
  startTime: Date;
  isRecurring: boolean;
}

export const HourDropdown = memo((props: HourDropdownProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const { hour } = getSlotHourAndMinutes(props.startTime);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='w-16 min-w-[64px] bg-background-background-hover'>
          {String(hour).padStart(2, '0')}
          <ChevronDown className='size-4 ml-2 text-text-primary' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom' align='start' className='w-16 min-w-[64px] flex flex-col shadow-shadow shadow-sm bg-background'>
        <Hours
          slotId={props.slotId}
          hour={hour}
          isRecurring={props.isRecurring}
          open={open}
          setOpen={setOpen}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
});

interface HoursProps {
  slotId: string;
  hour: number;
  isRecurring: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Hours = memo((props: HoursProps) => {
  return (
    <div className='w-full max-h-[320px] flex flex-col gap-0.5 overflow-y-scroll scrollbar scrollbar-thumb-muted scrollbar-thumb-rounded-full scrollbar-track-card-background scrollbar-w-1 scrollbar-h-1'>
      {HOURS.map((hour) => (
        <Hour
          key={hour}
          slotId={props.slotId}
          currentSlotHour={props.hour}
          hour={hour}
          isRecurring={props.isRecurring}
          open={props.open}
          setOpen={props.setOpen}
        />
      ))}
    </div>
  )
});

interface HourProps {
  slotId: string;
  currentSlotHour: number;
  hour: number;
  isRecurring: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Hour = memo((props: HourProps) => {
  const [ updateSlotHour ] = useUpdateSlotHourMutation();
  const [ updateRecurringSlotHour ] = useUpdateRecurringSlotHourMutation();
  
  const handleUpdateSlotHour = useCallback(async () => {
    props.setOpen(false);
    try {
      await updateSlotHour({ slotId: props.slotId, hour: props.hour });
    } catch (error) {
      console.error('Failed to update slot hour', error);
    }

  },[props.setOpen, updateSlotHour, props.slotId, props.hour]);

  const handleUpdateRecurringSlotHour = useCallback(async () => {
    props.setOpen(false);
    try {
      await updateRecurringSlotHour({ slotId: props.slotId, hour: props.hour });
    } catch (error) {
      console.error('Failed to update recurring slot hour', error);
    }

  },[props.setOpen, updateRecurringSlotHour, props.slotId, props.hour]);

  const handleClick = useMemo(() => !props.isRecurring ? handleUpdateSlotHour : handleUpdateRecurringSlotHour,
    [props.isRecurring, handleUpdateRecurringSlotHour, handleUpdateSlotHour]
  );
  
  const isCurrentSlotHour = props.currentSlotHour === props.hour;

  return (
    <Button 
      key={props.hour} 
      onClick={handleClick} 
      variant='ghost' 
      size='sm' 
      className={cn(
        isCurrentSlotHour ? 'bg-background-hover text-text-tertiary' : '',
        'h-8 py-2'
      )}
    >
      {String(props.hour).padStart(2, '0')}
    </Button>
  )
});
