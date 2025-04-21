import React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion'; 
import { useDispatch, useSelector } from 'react-redux';
import { undoRemoved } from 'src/lib/undoSlice';

import { Paragraph } from 'src/lib/typography';
import { Button } from 'src/ui/button';
import { AppDispatch, RootState } from 'src/lib/store';
import { Session, Slot } from 'src/lib/types';
import { useUndoUpdateSlotHourMutation } from 'src/features/slots/actions/undoUpdateSlotHour';
import { useUndoAddRecurringSlotMutation } from './actions/undoAddRecurringSlot';
import { useUndoUpdateRecurringSlotHourMutation } from './actions/undoUpdateRecurringSlotHour';
import { useUndoDeleteSlotsMutation } from './actions/undoDeleteSlots';
import { useUndoDuplicateDayMutation } from './actions/undoDuplicateDay';
import { useUndoSetSlotRecurrenceMutation } from './actions/undoSetSlotRecurrence';
import { useUndoDisableSlotRecurrenceMutation } from './actions/undoDisableSlotRecurrence';

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
  const [ undoAddRecurringSlot ] = useUndoAddRecurringSlotMutation();
  const [ undoUpdateRecurringSlotHour ] = useUndoUpdateRecurringSlotHourMutation();
  const [ undoDeleteSlots ] = useUndoDeleteSlotsMutation();
  const [ undoDuplicateDay ] = useUndoDuplicateDayMutation();
  const [ undoSetSlotRecurrence ] = useUndoSetSlotRecurrenceMutation();
  const [ undoDisableSlotRecurrence ] = useUndoDisableSlotRecurrenceMutation();

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
    props.dispatch(undoRemoved(props.undo.data[0].id));
    if (props.undo.message === 'Recurring slot has been added.') {
      undoAddRecurringSlot({ slotId: props.undo.data[0].id });
    } else if (props.undo.message === 'Slot hour has been updated.') {
      const hour = new Date(props.undo.data[0].startTime).getHours();
      undoUpdateSlotHour({ slotId: props.undo.data[0].id, hour });
    } else if (props.undo.message === 'Recurring slot hour has been updated.') {
      undoUpdateRecurringSlotHour({ slotId: props.undo.data[0].id, hour: new Date(props.undo.data[0].startTime).getHours() });
    } else if (props.undo.message === 'Slots have been deleted.') {
      undoDeleteSlots({ slots: props.undo.data as Slot[]});
    } else if (props.undo.message === 'Day has been duplicated.') {
      undoDuplicateDay({ slots: props.undo.data as Slot[] });
    } else if (props.undo.message === 'Slot recurrence has been set.') {
      undoSetSlotRecurrence({ slotId: props.undo.data[0].id });
    } else if (props.undo.message === 'Slot recurrence has been disabled.') {
      undoDisableSlotRecurrence({ slotId: props.undo.data[0].id });
    }
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