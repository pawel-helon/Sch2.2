import React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion'; 
import { useDispatch, useSelector } from 'react-redux';
import { slotsMutationRemoved } from './slotsMutationsSlice';
import {
  useUndoAddRecurringSlotMutation,
  useUndoUpdateSlotHourMutation
} from './slotsSlice';
import { Paragraph } from 'src/lib/typography';
import { Button } from 'src/ui/button';
import { AppDispatch, RootState } from 'src/lib/store';
import { Slot } from 'src/lib/types';

export function Toasts() {
  const dispatch = useDispatch<AppDispatch>();
  const slotsMutations = useSelector((state: RootState) => state.slotsMutations);
  
  if (Object.values(slotsMutations.data).length > 0) {
    return (
      <AnimatePresence>
        {Object.values(slotsMutations.data).map((mutation: { message: string | null, slot: Slot }) => (
          <Toast key={mutation.slot.id} mutation={mutation} dispatch={dispatch} />
        ))}
      </AnimatePresence>
    )
  } else return null;
}

function Toast(props: {
  mutation: { message: string | null, slot: Slot }
  dispatch: AppDispatch;
}) {
  const [ undoUpdateSlotHour ] = useUndoUpdateSlotHourMutation();
  const [ undoAddRecurringSlot ] = useUndoAddRecurringSlotMutation();

  React.useEffect(() => {
    setTimeout(() => {
      props.dispatch(slotsMutationRemoved(props.mutation.slot.id));
    }, 5000);
  },[props])
  
  const description = (
    <Paragraph variant='thin' size='sm'>
      {props.mutation.message}
    </Paragraph>
  );

  const handleClick = () => {
    if ( props.mutation.message === 'Slot hour has been updated.') {
      const hour = new Date(props.mutation.slot.startTime).getHours();
      undoUpdateSlotHour({ employeeId: props.mutation.slot.employeeId, slotId: props.mutation.slot.id, hour });
    } else if ( props.mutation.message === 'Recurring slot has been added.') {
      undoAddRecurringSlot({ slotId: props.mutation.slot.id })
    }
    props.dispatch(slotsMutationRemoved(props.mutation.slot.id));
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