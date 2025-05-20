import { validateDate, validateId, validateSlotDuration, validateSlotIds, validateSlotRecurring, validateSlotStartTimeHour, validateSlotStartTimeMinutes, validateSlotType, validateTimeStamp } from 'src/utils/validation/items';
import { NormalizedSessions, NormalizedSlots, NormalizedSlotsRecurringDates, Session, Slot, SlotsRecurringDate, ValidationProps } from 'src/types';

export const validateResponse = (props: ValidationProps) => {
  switch (props.endpoint) {
    case 'getWeekSlots':
    case 'getSlotsForReschedulingSession': {
      const normalizedSlots: NormalizedSlots = props.data;
      const { byId, allIds } = normalizedSlots;
      if (!byId || !allIds || typeof byId !== 'object' || !Object.keys(byId).length || !Array.isArray(allIds)) {
        throw new Error('byId and allIds are required. byId must be a non-empty object, allIds must be an array.');
      }
      for (const id in byId) {
        validateId(id, 'slotId');
        const slot = byId[id];
        if (!slot || typeof slot !== 'object' || !Object.keys(slot).length) {
          throw new Error('Missing or invalid slot. Expected an object.');
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
      validateSlotIds(allIds);
      const byIdKeys = Object.keys(byId);
      if (byIdKeys.length !== allIds.length || !allIds.every(id => byIdKeys.includes(id))) {
        throw Error('Mismatch between allIds and byId keys.');
      }
      break;
    }
    case 'getWeekSlotsRecurringDates': {
      const normalizedSlotsRecurringDates: NormalizedSlotsRecurringDates = props.data;
      const { byId, allIds } = normalizedSlotsRecurringDates;
      if (!byId || !allIds || typeof byId !== 'object' || !Object.keys(byId).length || !Array.isArray(allIds)) {
        throw new Error('byId and allIds are required. byId must be a non-empty object, allIds must be an array.');
      }
      for (const id in byId) {
        validateId(id, 'slotsRecurringDateId');
        const slotsRecurringDate = byId[id];
        validateId(id, 'slotsRecurringDateId');
        validateId(slotsRecurringDate.employeeId, 'SlotsRecurringDateEmployeeId');
        validateDate(slotsRecurringDate.date, 'slotsRecurringDate');
      }
      break;
    }
    case 'getWeekSessions': {
      const normalizedSessions: NormalizedSessions = props.data;
      const { byId, allIds } = normalizedSessions;
      if (!byId || !allIds || typeof byId !== 'object' || !Object.keys(byId).length || !Array.isArray(allIds)) {
        throw new Error('byId and allIds are required. byId must be a non-empty object, allIds must be an array.');
      }
      for (const id in byId) {
        validateId(id, 'sessionId');
        const session = byId[id];
        if (!session || typeof session !== 'object' || !Object.keys(session).length) {
          throw new Error('Missing or invalid slot. Expected an object.');
        }
        validateId(session.id, 'sessionId');
        validateId(session.slotId, 'slotId');
        validateId(session.employeeId, 'employeeId');
        validateId(session.customerId, 'customerId');
        validateTimeStamp(session.startTime, 'startTime');
        validateTimeStamp(session.createdAt, 'createdAt');
        validateTimeStamp(session.updatedAt, 'updatedAt');
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
      const slot: Slot = props.data;
      if (!slot || typeof slot !== 'object' || !Object.keys(slot).length) {
        throw new Error(`Missing or invalid slot. Expected an object.`);
      }
      validateId(slot.id, 'slotId');
      validateId(slot.employeeId, 'employeeId');
      validateSlotType(slot.type);
      validateTimeStamp(slot.startTime, 'startTime');
      validateSlotDuration(slot.duration);
      validateSlotRecurring(slot.recurring);
      validateTimeStamp(slot.createdAt, 'createdAt');
      validateTimeStamp(slot.updatedAt, 'updatedAt');
      break;
    };
    case 'duplicateDay':
    case 'undoDeleteSlots':
    case 'updateSlotsForReschedulingSession': {
      const slots: Slot[] = props.data;
      if (!slots || !Array.isArray(slots) || !slots.length) {
        throw new Error('Missing or invalid slots. Expected non-empty array.');
      }
      for (const slot of slots) {
        if (!slot || typeof slot !== 'object' || !Object.keys(slot).length) {
          throw new Error(`Missing or invalid slot. Expected an object.`);
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
    case 'deleteSlots':
    case 'undoDuplicateDay':{
      const { employeeId, date, slotIds } = props.data;
      validateId(employeeId, 'employeeId');
      validateDate(date);
      if (new Date().getTime() > new Date(new Date(date).setHours(23,59,59,999)).getTime()) {
        throw new Error('Invalid date. Expected non-past date.');
      }
      validateSlotIds(slotIds);
      break;
    };
    case 'disableRecurringDay':
    case 'setRecurringDay':
    case 'undoDisableRecurringDay':
    case 'undoSetRecurringDay': {
      const slotsRecurringDate: SlotsRecurringDate  = props.data;
      validateId(slotsRecurringDate.id, 'slotsRecurringDateId');
      validateId(slotsRecurringDate.employeeId, 'employeeId');
      validateDate(slotsRecurringDate.date);
      if (new Date().getTime() > new Date(new Date(slotsRecurringDate.date).setHours(23,59,59,999)).getTime()) {
        throw new Error('Invalid date. Expected non-past date.');
      }     
      break;
    };
    case 'undoUpdateSlotHour':
    case 'undoUpdateRecurringSlotHour':
    case 'updateRecurringSlotHour':
    case 'updateSlotHour': {
      const { prevHour, slot }: { prevHour: number, slot: Slot } = props.data;
      
      validateSlotStartTimeHour(prevHour);
      if (!slot || typeof slot !== 'object' || !Object.keys(slot).length) {
        throw new Error(`Missing or invalid slot. Expected an object.`);
      };

      validateId(slot.id, 'slotId');
      validateId(slot.employeeId, 'employeeId');
      validateSlotType(slot.type);
      validateTimeStamp(slot.startTime, 'startTime');
      validateSlotDuration(slot.duration);
      validateSlotRecurring(slot.recurring);
      validateTimeStamp(slot.createdAt, 'createdAt');
      validateTimeStamp(slot.updatedAt, 'updatedAt');
      break;
    };
    case 'updateSlotMinutes':
    case 'undoUpdateSlotMinutes':
    case 'undoUpdateRecurringSlotMinutes':
    case 'updateRecurringSlotMinutes': {
      const { prevMinutes, slot }: { prevMinutes: number, slot: Slot } = props.data;
      validateSlotStartTimeMinutes(prevMinutes);
      if (!slot || typeof slot !== 'object' || !Object.keys(slot).length) {
        throw new Error(`Missing or invalid slot. Expected an object.`);
      };
      validateId(slot.id, 'slotId');
      validateId(slot.employeeId, 'employeeId');
      validateSlotType(slot.type);
      validateTimeStamp(slot.startTime, 'startTime');
      validateSlotDuration(slot.duration);
      validateSlotRecurring(slot.recurring);
      validateTimeStamp(slot.createdAt, 'createdAt');
      validateTimeStamp(slot.updatedAt, 'updatedAt');
      break;
    };
    case 'deleteSession': {
      const { sessionId, employeeId, startTime } = props.data;
      validateId(sessionId, 'sessionId');
      validateId(employeeId, 'employeeId');
      validateTimeStamp(startTime, 'startTime');
      break;
    }
    case 'undoDeleteSession': {
      const session: Session = props.data;
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
    case 'undoUpdateSession': {
      const { prevStartTime, session }: { prevStartTime: Date, session: Session } = props.data;
      validateTimeStamp(prevStartTime, 'prevStartTime');
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
    case 'updateSession': {
      const { prevSlotId, prevStartTime, session }: { prevSlotId: string, prevStartTime: Date, session: Session } = props.data;
      validateId(prevSlotId, 'prevSlotId');
      validateTimeStamp(prevStartTime, 'prevStartTime');
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
    default:
      throw new Error('Invalid endpoint.');
  }
};