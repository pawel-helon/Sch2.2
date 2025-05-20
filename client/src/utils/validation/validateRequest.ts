import { validateDate, validateId, validateSelectedDays, validateSlotDuration, validateSlotRecurring, validateSlotStartTimeHour, validateSlotStartTimeMinutes, validateSlotType, validateTimeStamp } from 'src/utils/validation/items';
import { Session, Slot, ValidationProps } from 'src/types';

export const validateRequest = (props: ValidationProps) => {
  switch (props.endpoint) {
    case 'getWeekSlots':
    case 'getWeekSlotsRecurringDates':
    case 'getWeekSessions': {
      const { employeeId, start, end }: { employeeId: string, start: string, end: string } = props.data;
      validateId(employeeId, 'employeeId');
      validateDate(start, 'start');
      validateDate(end, 'end');
      break;
    }
    case 'getSlotsForReschedulingSession': {
      const { employeeId }: { employeeId: string } = props.data;
      validateId(employeeId, 'employeeId');
      break;
    }
    case 'addSlot':
    case 'addRecurringSlot':
    case 'disableRecurringDay':
    case 'setRecurringDay':
    case 'undoDisableRecurringDay':
    case 'undoSetRecurringDay':
    case 'updateSlotsForReschedulingSession': {
      const { employeeId, day }: { employeeId: string, day: string } = props.data;
      validateId(employeeId, 'employeeId');
      validateDate(day);
      if (new Date().getTime() > new Date(new Date(day).setHours(23,59,59,999)).getTime()) {
        throw new Error('Invalid date. Expected non-past date.');
      }
      break;
    };
    case 'deleteSlots':
    case 'undoDeleteSlots':
    case 'undoDuplicateDay': {
      const { slots }: { slots: Slot[] } = props.data;
      if (!slots || !Array.isArray(slots) || !slots.length) {
        throw new Error('Missing or invalid slots. Expected non-empty array.');
      }
      for (const slot of slots) {
        if (!slot || typeof slot !== 'object' || !Object.keys(slot).length) {
          throw new Error(`Missing or invalid slot. Expected a non-empy object.`);
        }
        validateId(slot.id, 'slotId');
        validateId(slot.employeeId, 'employeeId');
        validateSlotType(slot.type);
        validateTimeStamp(slot.startTime, 'startTime');
        validateSlotDuration(slot.duration);
        validateSlotRecurring(slot.recurring);
        validateTimeStamp(slot.createdAt, 'createdAt');
        validateTimeStamp(slot.updatedAt, 'updatedAt');
      }
      break;
    };
    case 'disableSlotRecurrence':
    case 'setSlotRecurrence':
    case 'undoAddRecurringSlot':
    case 'undoDisableSlotRecurrence':
    case 'undoSetSlotRecurrence': {
      const { slotId }: { slotId: string } = props.data;
      validateId(slotId, 'slotId');
      break;
    };
    case 'duplicateDay': {
      const { employeeId, day, selectedDays }: { employeeId: string, day: string, selectedDays: string[] } = props.data;
      validateId(employeeId, 'employeeId');
      validateDate(day);
      if (new Date().getTime() > new Date(new Date(day).setHours(23,59,59,999)).getTime()) {
        throw new Error('Invalid date. Expected non-past date.');
      }
      validateSelectedDays(selectedDays);
      break;
    };
    case 'undoUpdateSlotHour':
    case 'undoUpdateRecurringSlotHour':
    case 'updateRecurringSlotHour':
    case 'updateSlotHour': {
      const { slotId, hour }: { slotId: string, hour: number } = props.data;
      validateId(slotId, 'slotId');
      validateSlotStartTimeHour(hour);
      break;
    };
    case 'undoUpdateSlotMinutes':
    case 'undoUpdateRecurringSlotMinutes':
    case 'updateRecurringSlotMinutes':
    case 'updateSlotMinutes': {
      const { slotId, minutes }: { slotId: string, minutes: number } = props.data;
      validateId(slotId, 'slotId');
      validateSlotStartTimeMinutes(minutes);
      break;
    };
    case 'deleteSession':
    case 'undoDeleteSession': {
      const { session }: { session: Session } = props.data;
      if (!session || typeof session !== 'object' || !Object.keys(session).length) {
        throw new Error(`Missing or invalid session. Expected a non-empy object.`);
      }
      validateId(session.id, 'sessionId');
      validateId(session.slotId, 'slotId');
      validateId(session.employeeId, 'employeeId');
      validateId(session.customerId, 'customerId');
      validateTimeStamp(session.startTime, 'startTime');
      validateTimeStamp(session.createdAt, 'createdAt');
      validateTimeStamp(session.updatedAt, 'updatedAt');
      break;
    }
    case 'updateSession':
    case 'undoUpdateSession': {
      const { sessionId, slotId }:{ sessionId: string, slotId: string } = props.data;
      validateId(sessionId, 'sessionId');
      validateId(slotId, 'slotId');
      break;
    }
    default:
      throw new Error('Invalid endpoint.');
  }
};