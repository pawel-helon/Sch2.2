import { SlotsRecurringDate } from 'src/types/slots-recurring-dates';
import {
  validateDay,
  validateEmployeeId,
  validateSlotCreatedAt,
  validateSlotDuration,
  validateSlotId,
  validateSlotIds,
  validateSlotRecurring,
  validateSlotsRecurringDateId,
  validateSlotStartTime,
  validateSlotStartTimeHour,
  validateSlotStartTimeMinutes,
  validateSlotType,
  validateSlotUpdatedAt,
} from 'src/utils/validation/index';
import { Slot } from 'src/types/slots';

export const validateResponse = (
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
    | 'updateSlotsForReschedulingSession',
  data: any
) => {
  switch (endpoint) {
    case 'addSlot':
    case 'addRecurringSlot':
    case 'disableSlotRecurrence':
    case 'setSlotRecurrence':
    case 'undoAddRecurringSlot':
    case 'undoDisableSlotRecurrence':
    case 'undoSetSlotRecurrence': {
      const { slot }: { slot: Slot } = data;
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
      break;
    };
    case 'duplicateDay':
    case 'undoDeleteSlots':
    case 'updateSlotsForReschedulingSession': {
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
    case 'deleteSlots':
    case 'undoDuplicateDay':{
      const { employeeId, date, slotIds } = data;
      validateEmployeeId(employeeId);
      validateDay(date);
      validateSlotIds(slotIds);
      break;
    };
    case 'disableRecurringDay':
    case 'setRecurringDay':
    case 'undoDisableRecurringDay':
    case 'undoSetRecurringDay': {
      const { slotsRecurringDate }: { slotsRecurringDate: SlotsRecurringDate } = data;
      validateSlotsRecurringDateId(slotsRecurringDate.id);
      validateEmployeeId(slotsRecurringDate.employeeId);
      validateDay(slotsRecurringDate.date);
      break;
    };
    case 'undoUpdateSlotHour':
    case 'undoUpdateRecurringSlotHour':
    case 'updateRecurringSlotHour':
    case 'updateSlotHour': {
      const { prevHour, slot }: { prevHour: number, slot: Slot } = data;
      validateSlotStartTimeHour(prevHour);
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
      break;
    };
    case 'undoUpdateSlotMinutes':
    case 'undoUpdateRecurringSlotMinutes':
    case 'updateRecurringSlotMinutes': {
      const { prevMinutes, slot }: { prevMinutes: number, slot: Slot } = data;
      validateSlotStartTimeMinutes(prevMinutes);
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
      break;
    };
    default:
      throw new Error('Invalid endpoint.');
  }
}