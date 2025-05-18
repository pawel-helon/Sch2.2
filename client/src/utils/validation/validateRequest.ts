import { Slot } from 'src/types/slots';
import {
  validateDay,
  validateEmployeeId,
  validateSelectedDays,
  validateSlotCreatedAt,
  validateSlotDuration,
  validateSlotId,
  validateSlotRecurring,
  validateSlotStartTime,
  validateSlotStartTimeHour,
  validateSlotStartTimeMinutes,
  validateSlotType,
  validateSlotUpdatedAt,
} from 'src/utils/validation/index';

export const validateRequest = (
  endpoint: 'addSlot'
    | 'addRecurringSlot'
    | 'deleteSlots'
    | 'disableRecurringDay'
    | 'disableSlotRecurrence'
    | 'duplicateDay'
    | 'setRecurringDay'
    | 'setSlotRecurrence'
    | 'undoAddRecurringSlot'
    | 'undoDeleteSlots'
    | 'undoDisableRecurringDay'
    | 'undoDisableSlotRecurrence'
    | 'undoDuplicateDay'
    | 'undoSetRecurringDay'
    | 'undoSetSlotRecurrence'
    | 'undoUpdateRecurringSlotHour'
    | 'undoUpdateRecurringSlotMinutes'
    | 'undoUpdateSlotHour'
    | 'undoUpdateSlotMinutes'
    | 'updateRecurringSlotHour'
    | 'updateSlotHour'
    | 'updateRecurringSlotMinutes'
    | 'updateSlotMinutes'
    | 'updateSlotsForReschedulingSession',
  data: any
) => {
  switch (endpoint) {
    case 'addSlot':
    case 'addRecurringSlot':
    case 'disableRecurringDay':
    case 'setRecurringDay':
    case 'undoDisableRecurringDay':
    case 'undoSetRecurringDay':
    case 'updateSlotsForReschedulingSession':{
      const { employeeId, day }: { employeeId: string, day: string } = data;
      validateEmployeeId(employeeId);
      validateDay(day);
      break;
    };
    case 'deleteSlots':
    case 'undoDeleteSlots':
    case 'undoDuplicateDay': {
      const { slots }: { slots: Slot[]} = data;
      if (!slots || !Array.isArray(slots) || !slots.length) {
        throw new Error('Missing or invalid slots. Expected non-empty array.');
      }
      for (const slot of slots) {
        if (!slot || typeof slot !== 'object') {
          throw new Error (`Missing or invalid slot. Expected an object.`);
        }
        validateSlotId(slot.id);
        validateEmployeeId(slot.employeeId);
        validateSlotType(slot.type);
        validateSlotStartTime(slot.startTime);
        validateSlotDuration(slot.duration);
        validateSlotRecurring(slot.recurring);
        validateSlotCreatedAt(slot.createdAt);
        validateSlotUpdatedAt(slot.updatedAt);
      }
      break;
    };
    case 'disableSlotRecurrence':
    case 'setSlotRecurrence':
    case 'undoAddRecurringSlot':
    case 'undoDisableSlotRecurrence':
    case 'undoSetSlotRecurrence': {
      const { slotId }: { slotId: string } = data;
      validateSlotId(slotId);
      break;
    };
    case 'duplicateDay': {
      const { employeeId, day, selectedDays }: { employeeId: string, day: string, selectedDays: string[] } = data;
      validateEmployeeId(employeeId);
      validateDay(day);
      validateSelectedDays(selectedDays);
      break;
    };
    case 'undoUpdateSlotHour':
    case 'undoUpdateRecurringSlotHour':
    case 'updateRecurringSlotHour':
    case 'updateSlotHour': {
      const { slotId, hour }: { slotId: string, hour: number } = data;
      validateSlotId(slotId);
      validateSlotStartTimeHour(hour);
      break;
    };
    case 'undoUpdateSlotMinutes':
    case 'undoUpdateRecurringSlotMinutes':
    case 'updateRecurringSlotMinutes':
    case 'updateSlotMinutes': {
      const { slotId, minutes }: { slotId: string, minutes: number } = data;
      validateSlotId(slotId);
      validateSlotStartTimeMinutes(minutes);
      break;
    };
    default:
      throw new Error('Invalid endpoint.');
  }
};