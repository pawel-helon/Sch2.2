import React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion'; 
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/redux/store';
import { undoRemoved } from 'src/redux/slices/undoSlice';
import { useUndoUpdateSlotHourMutation } from 'src/redux/actions/slots/undoUpdateSlotHour';
import { useUndoAddRecurringSlotMutation } from 'src/redux/actions/slots/undoAddRecurringSlot';
import { useUndoUpdateRecurringSlotHourMutation } from 'src/redux/actions/slots/undoUpdateRecurringSlotHour';
import { useUndoDeleteSlotsMutation } from 'src/redux/actions/slots/undoDeleteSlots';
import { useUndoDuplicateDayMutation } from 'src/redux/actions/slots/undoDuplicateDay';
import { useUndoSetSlotRecurrenceMutation } from 'src/redux/actions/slots/undoSetSlotRecurrence';
import { useUndoDisableSlotRecurrenceMutation } from 'src/redux/actions/slots/undoDisableSlotRecurrence';
import { useUndoDeleteSessionMutation } from 'src/redux/actions/sessions/undoDeleteSession';
import { useUndoUpdateSessionMutation } from 'src/redux/actions/sessions/undoUpdateSession';
import { useUndoUpdateRecurringSlotMinutesMutation } from 'src/redux/actions/slots/undoUpdateRecurringSlotMinutes';
import { Button } from 'src/components/Button';
import { Paragraph } from 'src/components/typography/Paragraph';
import { Slot } from 'src/types/slots';
import { Session } from 'src/types/sessions';

export const Toasts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const undos = useSelector((state: RootState) => state.undo)
  
  let content: React.ReactNode = null;

  if (Object.values(undos.payload).length > 0) {
    content = (
      <AnimatePresence>
        {Object.values(undos.payload).map((undo: { message: string, data: Slot[] | Session[] }) => (
          <Toast key={undo.data[0].id} undo={undo} dispatch={dispatch} />
        ))}
      </AnimatePresence>
    )
  }
  return content;
}

const Toast = (props: {
  undo: { message: string, data: Slot[] | Session[] }
  dispatch: AppDispatch;
}) => {
  const [ undoUpdateSlotHour ] = useUndoUpdateSlotHourMutation();
  const [ undoUpdateSlotMinutes ] = useUndoUpdateRecurringSlotMinutesMutation();
  const [ undoAddRecurringSlot ] = useUndoAddRecurringSlotMutation();
  const [ undoUpdateRecurringSlotHour ] = useUndoUpdateRecurringSlotHourMutation();
  const [ undoUpdateRecurringSlotMinutes ] = useUndoUpdateRecurringSlotMinutesMutation();
  const [ undoDeleteSlots ] = useUndoDeleteSlotsMutation();
  const [ undoDuplicateDay ] = useUndoDuplicateDayMutation();
  const [ undoSetSlotRecurrence ] = useUndoSetSlotRecurrenceMutation();
  const [ undoDisableSlotRecurrence ] = useUndoDisableSlotRecurrenceMutation();
  const [ undoUpdateSession ] = useUndoUpdateSessionMutation();
  const [ undoDeleteSession ] = useUndoDeleteSessionMutation()
  
  React.useEffect(() => {
    setTimeout(() => {
      props.dispatch(undoRemoved(props.undo.data[0].id));
    }, 5000);
  },[props])
  
  const description = (
    <Paragraph variant='thin' size='sm'>
      {props.undo.message}
    </Paragraph>
  );

  const handleClick = () => {
    if (props.undo.message === 'Recurring slot has been added.') {
      const slot = props.undo.data[0] as Slot;
      undoAddRecurringSlot({ slotId: slot.id });
    } else if (props.undo.message === 'Slot hour has been updated.') {
      const slot = props.undo.data[0] as Slot;
      const hour = new Date(slot.startTime).getHours();
      undoUpdateSlotHour({ slotId: props.undo.data[0].id, hour });
    } else if (props.undo.message === 'Recurring slot hour has been updated.') {
      const slot = props.undo.data[0] as Slot;
      undoUpdateRecurringSlotHour({ slotId: slot.id, hour: new Date(slot.startTime).getHours() });
    } else if (props.undo.message === 'Slot minutes have been updated.') {
      const slot = props.undo.data[0] as Slot;
      undoUpdateSlotMinutes({ slotId: slot.id, minutes: new Date(slot.startTime).getMinutes() })
    } else if (props.undo.message === 'Recurring slot minutes have been updated.') {
      const slot = props.undo.data[0] as Slot;
      undoUpdateRecurringSlotMinutes({ slotId: slot.id, minutes: new Date(slot.startTime).getMinutes() })
    } else if (props.undo.message === 'Slots have been deleted.') {
      const slots = props.undo.data as Slot[];
      undoDeleteSlots({ slots: slots});
    } else if (props.undo.message === 'Day has been duplicated.') {
      const slots = props.undo.data as Slot[];
      undoDuplicateDay({ slots });
    } else if (props.undo.message === 'Slot recurrence has been set.') {
      const slot = props.undo.data[0] as Slot;
      undoSetSlotRecurrence({ slotId: slot.id });
    } else if (props.undo.message === 'Slot recurrence has been disabled.') {
      const slot = props.undo.data[0];
      undoDisableSlotRecurrence({ slotId: slot.id });
    } else if (props.undo.message === 'Session has been updated.') {
      const session = props.undo.data[0] as Session;
      undoUpdateSession({ sessionId: session.id, slotId: session.slotId })
    } else if (props.undo.message === 'Session has been deleted.') {
      const session = props.undo.data[0] as Session;
      undoDeleteSession({ session })
    }
    props.dispatch(undoRemoved(props.undo.data[0].id));
  }
  
  return (
    <motion.div
      className='w-full fixed top-4 xs:-top-36 mx-auto flex justify-center px-3 xl:max-w-screen-xl 2xl:max-w-screen-2xl'
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 200, opacity: 1 }}
      exit={{ y: 200, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className='h-12 flex items-center gap-2 px-2 border border-border rounded-md shadow-shadow shadow-sm bg-background'>
        <CheckIcon className='bg-green-500 rounded-full text-background' />
          {description}
        <Button onClick={ handleClick } variant='outline' size='sm' className='ml-8'>
          Undo
        </Button>
      </div>
    </motion.div>
  )
}