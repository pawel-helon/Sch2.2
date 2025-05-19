import {
  validateCustomerId,
  validateDay,
  validateEmployeeId,
  validateSessionCreatedAt,
  validateSessionId,
  validateSessionStartTime,
  validateSessionUpdatedAt,
  validateSlotCreatedAt,
  validateSlotDuration,
  validateSlotId,
  validateSlotIds,
  validateSlotRecurring,
  validateSlotsRecurringDateDate,
  validateSlotsRecurringDateEmployeeId,
  validateSlotsRecurringDateId,
  validateSlotStartTime,
  validateSlotStartTimeHour,
  validateSlotStartTimeMinutes,
  validateSlotType,
  validateSlotUpdatedAt,
} from 'src/utils/validation/index';
import { NormalizedSessions, NormalizedSlots, NormalizedSlotsRecurringDates, Session, Slot, SlotsRecurringDate} from 'src/types';

export const validateResponse = (
  endpoint: 'getWeekSlots'
    | 'getSlotsForReschedulingSession'
    | 'getWeekSlotsRecurringDates'
    | 'getWeekSessions'
    | 'addSlot'
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
    | 'updateSlotMinutes'
    | 'undoUpdateSlotMinutes'
    | 'updateRecurringSlotHour'
    | 'updateSlotHour'
    | 'updateRecurringSlotMinutes'
    | 'updateSlotsForReschedulingSession'
    | 'deleteSession'
    | 'undoDeleteSession'
    | 'undoUpdateSession'
    | 'updateSession',
  data: any
) => {
  switch (endpoint) {
    case 'getWeekSlots':
    case 'getSlotsForReschedulingSession': {
      const normalizedSlots: NormalizedSlots = data;
      const { byId, allIds } = normalizedSlots;
      if (!byId || !allIds || typeof byId !== 'object' || !Object.keys(byId).length || !Array.isArray(allIds)) {
        throw new Error('byId and allIds are required. byId must be a non-empty object, allIds must be an array.');
      }
      for (const id in byId) {
        validateSlotId(id);
        const slot = byId[id];
        if (!slot || typeof slot !== 'object' || !Object.keys(slot).length) {
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
      validateSlotIds(allIds);
      const byIdKeys = Object.keys(byId);
      if (byIdKeys.length !== allIds.length || !allIds.every(id => byIdKeys.includes(id))) {
        throw Error('Mismatch between allIds and byId keys.');
      }
      break;
    }
    case 'getWeekSlotsRecurringDates': {
      const normalizedSlotsRecurringDates: NormalizedSlotsRecurringDates = data;
      const { byId, allIds } = normalizedSlotsRecurringDates;
      if (!byId || !allIds || typeof byId !== 'object' || !Object.keys(byId).length || !Array.isArray(allIds)) {
        throw new Error('byId and allIds are required. byId must be a non-empty object, allIds must be an array.');
      }
      for (const id in byId) {
        validateSlotsRecurringDateId(id);
        const slotsRecurringDate = byId[id];
        validateSlotsRecurringDateId(slotsRecurringDate.id);
        validateSlotsRecurringDateEmployeeId(slotsRecurringDate.employeeId);
        validateSlotsRecurringDateDate(slotsRecurringDate.date);
      }
      break;
    }
    case 'getWeekSessions': {
      const normalizedSessions: NormalizedSessions = data;
      const { byId, allIds } = normalizedSessions;
      if (!byId || !allIds || typeof byId !== 'object' || !Object.keys(byId).length || !Array.isArray(allIds)) {
        throw new Error('byId and allIds are required. byId must be a non-empty object, allIds must be an array.');
      }
      for (const id in byId) {
        validateSessionId(id);
        const session = byId[id];
        if (!session || typeof session !== 'object' || !Object.keys(session).length) {
          throw new Error (`Missing or invalid slot. Expected an object.`);
        }
        validateSessionId(session.id);
        validateSlotId(session.slotId);
        validateEmployeeId(session.employeeId);
        validateCustomerId(session.customerId);
        validateSessionStartTime(session.startTime);
        validateSessionCreatedAt(session.createdAt);
        validateSessionUpdatedAt(session.updatedAt);
      }
      validateSlotIds(allIds);
      const byIdKeys = Object.keys(byId);
      if (byIdKeys.length !== allIds.length || !allIds.every(id => byIdKeys.includes(id))) {
        throw Error('Mismatch between allIds and byId keys.');
      }
      break;
    }
    case 'addSlot':
    case 'addRecurringSlot':
    case 'disableSlotRecurrence':
    case 'setSlotRecurrence':
    case 'undoAddRecurringSlot':
    case 'undoDisableSlotRecurrence':
    case 'undoSetSlotRecurrence': {
      const slot: Slot = data;
      if (!slot || typeof slot !== 'object' || !Object.keys(slot).length) {
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
      const slots: Slot[] = data;
      if (!slots || !Array.isArray(slots) || !slots.length) {
        throw new Error('Missing or invalid slots. Expected non-empty array.');
      }
      for (const slot of slots) {
        if (!slot || typeof slot !== 'object' || !Object.keys(slot).length) {
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
      const slotsRecurringDate: SlotsRecurringDate  = data;
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
      if (!slot || typeof slot !== 'object' || !Object.keys(slot).length) {
        throw new Error (`Missing or invalid slot. Expected an object.`);
      };

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
    case 'updateSlotMinutes':
    case 'undoUpdateSlotMinutes':
    case 'undoUpdateRecurringSlotMinutes':
    case 'updateRecurringSlotMinutes': {
      const { prevMinutes, slot }: { prevMinutes: number, slot: Slot } = data;
      console.log(prevMinutes);

      validateSlotStartTimeMinutes(prevMinutes);
      if (!slot || typeof slot !== 'object' || !Object.keys(slot).length) {
        throw new Error (`Missing or invalid slot. Expected an object.`);
      };
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
    case 'deleteSession': {
      const { sessionId, employeeId, startTime } = data;
      validateSessionId(sessionId);
      validateEmployeeId(employeeId);
      validateSessionStartTime(startTime);
      break;
    }
    case 'undoDeleteSession': {
      const session: Session = data;
      if (!session || typeof session !== 'object' || !Object.keys(session).length) {
        throw new Error (`Missing or invalid session. Expected a non-empy object.`);
      }
      validateSessionId(session.id);
      validateSlotId(session.slotId);
      validateEmployeeId(session.employeeId);
      validateCustomerId(session.customerId);
      validateSessionStartTime(session.startTime);
      validateSessionCreatedAt(session.createdAt);
      validateSessionUpdatedAt(session.updatedAt);
      break;
    }
    case 'undoUpdateSession': {
      const { prevStartTime, session }: { prevStartTime: Date, session: Session } = data;
      validateSessionStartTime(prevStartTime);
      if (!session || typeof session !== 'object' || !Object.keys(session).length) {
        throw new Error (`Missing or invalid session. Expected a non-empy object.`);
      }
      validateSessionId(session.id);
      validateSlotId(session.slotId);
      validateEmployeeId(session.employeeId);
      validateCustomerId(session.customerId);
      validateSessionStartTime(session.startTime);
      validateSessionCreatedAt(session.createdAt);
      validateSessionUpdatedAt(session.updatedAt);
      break;
    }
    case 'updateSession': {
      const { prevSlotId, prevStartTime, session }: { prevSlotId: string, prevStartTime: Date, session: Session } = data;
      validateSessionId(prevSlotId);
      validateSessionStartTime(prevStartTime);
      if (!session || typeof session !== 'object' || !Object.keys(session).length) {
        throw new Error (`Missing or invalid session. Expected a non-empy object.`);
      }
      validateSessionId(session.id);
      validateSlotId(session.slotId);
      validateEmployeeId(session.employeeId);
      validateCustomerId(session.customerId);
      validateSessionStartTime(session.startTime);
      validateSessionCreatedAt(session.createdAt);
      validateSessionUpdatedAt(session.updatedAt);
      break;
    }
    default:
      throw new Error('Invalid endpoint.');
  }
}