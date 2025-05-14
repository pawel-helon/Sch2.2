import { ReactNode, useEffect } from 'react';
import { CheckIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion'; 
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { AppDispatch, RootState } from 'src/redux/store';
import { undoRemoved } from 'src/redux/slices/undoSlice';
import { infoRemoved } from 'src/redux/slices/infoSlice';
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
import { useUndoSetRecurringDayMutation } from 'src/redux/actions/slots/undoSetRecurringDay';
import { useUndoDisableRecurringDayMutation } from 'src/redux/actions/slots/undoDisableRecurringDay';
import { Button } from 'src/components/Button';
import { Paragraph } from 'src/components/typography/Paragraph';
import { useHandleBreakpoint } from 'src/hooks/useHandleBreakpoint';
import { Slot } from 'src/types/slots';
import { Session } from 'src/types/sessions';

export const Toasts = () => {
  const undos = useSelector((state: RootState) => state.undo);
  const infos = useSelector((state: RootState) => state.info);
  
  let content: ReactNode = null;
  if (Object.values(undos.payload).length > 0) {
    content = (
      <AnimatePresence>
        {Object.values(undos.payload).map((undo: { message: string, data: Slot[] | Session[] }) => (
          <Undo
            key={undo.data[0].id + uuid()}
            undo={undo}
          />
        ))}
      </AnimatePresence>
    )
  } else if (Object.values(infos.payload).length > 0) {
    content = (
      <AnimatePresence>
        {Object.values(infos.payload).map((info: { message: string }) => (
          <Info
            key={info.message[0]}
            info={info}
          />
        ))}
      </AnimatePresence>
    )
  }

  return content;
};

interface InfoProps {
  info: { message: string };
}

const Info = (props: InfoProps) => {
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    setTimeout(() => {
      dispatch(infoRemoved(props.info.message[0]));
    }, 5000);
  },[dispatch, props])

  return (
    <motion.div
      className='w-full fixed top-4 xs:-top-36 mx-auto flex justify-center px-3 xl:max-w-screen-xl 2xl:max-w-screen-2xl'
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 200, opacity: 1 }}
      exit={{ y: 200, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className='min-w-60 h-12 flex items-center gap-2 px-2 text-text-primary text-sm border border-border rounded-md shadow-shadow shadow-sm bg-background'>
        <CrossCircledIcon className='rounded-full text-red-500' />
        {props.info.message}
      </div>
    </motion.div>
  )
}

interface UndoProps {
  undo: { message: string, data: Slot[] | Session[] };
}

const Undo = (props: UndoProps) => {
  const isMobile = useHandleBreakpoint({ windowInnerWidth: 480 });
  const dispatch = useDispatch<AppDispatch>();
  
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
  const [ undoDeleteSession ] = useUndoDeleteSessionMutation();
  const [ undoSetRecurringDay ] = useUndoSetRecurringDayMutation();
  const [ undoDisableRecurringDay ] = useUndoDisableRecurringDayMutation();
  
  useEffect(() => {
    setTimeout(() => {
      dispatch(undoRemoved({ message: props.undo.message, id: props.undo.data[0].id }));
    }, 5000);
  },[dispatch, props])
  
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
    } else if (props.undo.message === 'Recurring day has been set.') {
      const employeeId = props.undo.data[0].employeeId;
      const day = props.undo.data[0].startTime.toISOString().split('T')[0];
      undoSetRecurringDay({ employeeId, day });
    } else if (props.undo.message === 'Recurring day has been disabled.') {
      const employeeId = props.undo.data[0].employeeId;
      const day = props.undo.data[0].startTime.toISOString().split('T')[0];
      undoDisableRecurringDay({ employeeId, day });
    } else if (props.undo.message === 'Session has been updated.') {
      const session = props.undo.data[0] as Session;
      undoUpdateSession({ sessionId: session.id, slotId: session.slotId })
    } else if (props.undo.message === 'Session has been deleted.') {
      const session = props.undo.data[0] as Session;
      undoDeleteSession({ session })
    }
    dispatch(undoRemoved({ message: props.undo.message, id: props.undo.data[0].id }));
  }

  const initialY = isMobile ? 10 : 100;
  const animateY = isMobile ? 20 : 200;
  const exitY = isMobile ? 20 : 200;

  return (
    <motion.div
      className='w-full fixed top-4 xs:-top-36 mx-auto flex justify-center px-3 xl:max-w-screen-xl 2xl:max-w-screen-2xl'
      initial={{ y: initialY, opacity: 0 }}
      animate={{ y: animateY, opacity: 1 }}
      exit={{ y: exitY, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className='min-w-60 h-12 flex items-center gap-2 px-2 text-sm border border-border rounded-md shadow-shadow shadow-sm bg-background'>
        <CheckIcon className='bg-green-500 rounded-full text-background' />
        {description}
        <Button onClick={ handleClick } variant='outline' size='sm' className='ml-8'>
          Undo
        </Button>
      </div>
    </motion.div>
  )
}