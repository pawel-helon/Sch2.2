import { Switch } from 'src/components/Switch';

interface RecurringSlotsToggleProps {
  isRecurringSlotsOnly: boolean;
  setRecurringSlotsOnly: (isRecurringSlotsOnly: boolean) => void;
}

export const RecurringSlotsToggle = (props: RecurringSlotsToggleProps) => {
  return (
    <div className='w-full flex justify-end items-center gap-2 mb-4'>
      <label htmlFor='recurring-slots-only' className='text-sm text-text-primary font-medium leading-none'>
        Recurring only
      </label>
      <Switch
        checked={props.isRecurringSlotsOnly}
        onCheckedChange={() => props.setRecurringSlotsOnly(!props.isRecurringSlotsOnly)}
        className='data-[state=checked]:bg-accent-secondary'
      />
    </div>
  )
}