import { validateDate, validateId, validateSlotDuration, validateSlotIds, validateSlotRecurring, validateSlotStartTimeHour, validateSlotStartTimeMinutes, validateSlotType, validateTimeStamp } from "./items";
import { createResponse } from "../createResponse";
import { NormalizedSessions, NormalizedSlots, NormalizedSlotsRecurringDates, Session, Slot, SlotsRecurringDate, ValidationProps } from "../../types";

export const validateResult = (props: ValidationProps) => {
  switch (props.endpoint) {
    case "getWeekSlots":
    case "getSlotsForReschedulingSession": {
      const normalizedSlots: NormalizedSlots = props.data;
      const { byId, allIds } = normalizedSlots;
      if (!byId || !allIds || typeof byId !== "object" || !Object.keys(byId).length || !Array.isArray(allIds)) {
        return createResponse(props.res, "byId and allIds are required. byId must be a non-empty object, allIds must be an array.");
      }
      for (const id in byId) {
        validateId(props.res, id, "slotId");
        const slot = byId[id];
        if (!slot || typeof slot !== "object" || !Object.keys(slot).length) {
          return createResponse(props.res, "Missing or invalid slot. Expected an object.");
        }
        validateId(props.res, slot.id, "slotId");
        validateId(props.res, slot.employeeId, "employeeId");
        validateSlotType(props.res, slot.type);
        validateTimeStamp(props.res, slot.startTime, "startTime");
        validateSlotDuration(props.res, slot.duration);
        validateSlotRecurring(props.res, slot.recurring);
        validateTimeStamp(props.res, slot.createdAt, "createdAt");
        validateTimeStamp(props.res, slot.updatedAt, "updatedAt");
      }
      validateSlotIds(props.res, allIds);
      const byIdKeys = Object.keys(byId);
      if (byIdKeys.length !== allIds.length || !allIds.every(id => byIdKeys.includes(id))) {
        return createResponse(props.res, "Mismatch between allIds and byId keys.");
      }
      break;
    }
    case "getWeekSlotsRecurringDates": {
      const normalizedSlotsRecurringDates: NormalizedSlotsRecurringDates = props.data;
      const { byId, allIds } = normalizedSlotsRecurringDates;
      if (!byId || !allIds || typeof byId !== "object" || !Object.keys(byId).length || !Array.isArray(allIds)) {
        return createResponse(props.res, "byId and allIds are required. byId must be a non-empty object, allIds must be an array.");
      }
      for (const id in byId) {
        validateId(props.res, id, "slotsRecurringDateId");
        const slotsRecurringDate = byId[id];
        validateId(props.res, id, "slotsRecurringDateId");
        validateId(props.res, slotsRecurringDate.employeeId, "SlotsRecurringDateEmployeeId");
        validateDate(props.res, slotsRecurringDate.date, "slotsRecurringDate");
      }
      break;
    }
    case "getWeekSessions": {
      const normalizedSessions: NormalizedSessions = props.data;
      const { byId, allIds } = normalizedSessions;
      if (!byId || !allIds || typeof byId !== "object" || !Object.keys(byId).length || !Array.isArray(allIds)) {
        return createResponse(props.res, "byId and allIds are required. byId must be a non-empty object, allIds must be an array.");
      }
      for (const id in byId) {
        validateId(props.res, id, "sessionId");
        const session = byId[id];
        if (!session || typeof session !== "object" || !Object.keys(session).length) {
          return createResponse(props.res, "Missing or invalid slot. Expected an object.");
        }
        validateId(props.res, session.id, "sessionId");
        validateId(props.res, session.slotId, "slotId");
        validateId(props.res, session.employeeId, "employeeId");
        validateId(props.res, session.customerId, "customerId");
        validateTimeStamp(props.res, session.startTime, "startTime");
        validateTimeStamp(props.res, session.createdAt, "createdAt");
        validateTimeStamp(props.res, session.updatedAt, "updatedAt");
      }
      validateSlotIds(props.res, allIds);
      const byIdKeys = Object.keys(byId);
      if (byIdKeys.length !== allIds.length || !allIds.every(id => byIdKeys.includes(id))) {
        return createResponse(props.res, "Mismatch between allIds and byId keys.");
      }
      break;
    }
    case "addSlot":
    case "addRecurringSlot":
    case "disableSlotRecurrence":
    case "setSlotRecurrence":
    case "undoAddRecurringSlot": {
      const slot: Slot = props.data;
      if (!slot || typeof slot !== "object" || !Object.keys(slot).length) {
        return createResponse(props.res, "Missing or invalid slot. Expected an object.");
      }
      validateId(props.res, slot.id, "slotId");
      validateId(props.res, slot.employeeId, "employeeId");
      validateSlotType(props.res, slot.type);
      validateTimeStamp(props.res, slot.startTime, "startTime");
      validateSlotDuration(props.res, slot.duration);
      validateSlotRecurring(props.res, slot.recurring);
      validateTimeStamp(props.res, slot.createdAt, "createdAt");
      validateTimeStamp(props.res, slot.updatedAt, "updatedAt");
      break;
    };
    case "duplicateDay":
    case "addSlots":
    case "updateSlotsForReschedulingSession": {
      const slots: Slot[] = props.data;
      if (!slots || !Array.isArray(slots) || !slots.length) {
        return createResponse(props.res, "Missing or invalid slots. Expected non-empty array.");
      }
      for (const slot of slots) {
        if (!slot || typeof slot !== "object" || !Object.keys(slot).length) {
          return createResponse(props.res, "Missing or invalid slot. Expected an object.");
        }
        validateId(props.res, slot.id, "slotId");
        validateId(props.res, slot.employeeId, "employeeId");
        validateSlotType(props.res, slot.type);
        validateTimeStamp(props.res, slot.startTime, "startTime");
        validateSlotDuration(props.res, slot.duration);
        validateSlotRecurring(props.res, slot.recurring);
        validateTimeStamp(props.res, slot.createdAt, "createdAt");
        validateTimeStamp(props.res, slot.updatedAt, "updatedAt");
      }
      break;
    };
    case "deleteSlots": {
      const { employeeId, date, slotIds } = props.data;
      validateId(props.res, employeeId, "employeeId");
      validateDate(props.res, date);
      if (new Date().getTime() > new Date(new Date(date).setHours(23,59,59,999)).getTime()) {
        return createResponse(props.res, "Invalid date. Expected non-past date.");
      }
      validateSlotIds(props.res, slotIds);
      break;
    };
    case "disableRecurringDay":
    case "setRecurringDay": {
      const slotsRecurringDate: SlotsRecurringDate  = props.data;
      validateId(props.res, slotsRecurringDate.id, "slotsRecurringDateId");
      validateId(props.res, slotsRecurringDate.employeeId, "employeeId");
      validateDate(props.res, slotsRecurringDate.date);
      if (new Date().getTime() > new Date(new Date(slotsRecurringDate.date).setHours(23,59,59,999)).getTime()) {
        return createResponse(props.res, "Invalid date. Expected non-past date.");
      }     
      break;
    };
    case "undoUpdateSlotHour":
    case "updateRecurringSlotHour":
    case "updateSlotHour": {
      const { prevHour, slot }: { prevHour: number, slot: Slot } = props.data;
      
      validateSlotStartTimeHour(props.res, prevHour);
      if (!slot || typeof slot !== "object" || !Object.keys(slot).length) {
        return createResponse(props.res, "Missing or invalid slot. Expected an object.");
      };

      validateId(props.res, slot.id, "slotId");
      validateId(props.res, slot.employeeId, "employeeId");
      validateSlotType(props.res, slot.type);
      validateTimeStamp(props.res, slot.startTime, "startTime");
      validateSlotDuration(props.res, slot.duration);
      validateSlotRecurring(props.res, slot.recurring);
      validateTimeStamp(props.res, slot.createdAt, "createdAt");
      validateTimeStamp(props.res, slot.updatedAt, "updatedAt");
      break;
    };
    case "updateSlotMinutes":
    case "undoUpdateSlotMinutes":
    case "updateRecurringSlotMinutes": {
      const { prevMinutes, slot }: { prevMinutes: number, slot: Slot } = props.data;
      validateSlotStartTimeMinutes(props.res, prevMinutes);
      if (!slot || typeof slot !== "object" || !Object.keys(slot).length) {
        return createResponse(props.res, "Missing or invalid slot. Expected an object.");
      };
      validateId(props.res, slot.id, "slotId");
      validateId(props.res, slot.employeeId, "employeeId");
      validateSlotType(props.res, slot.type);
      validateTimeStamp(props.res, slot.startTime, "startTime");
      validateSlotDuration(props.res, slot.duration);
      validateSlotRecurring(props.res, slot.recurring);
      validateTimeStamp(props.res, slot.createdAt, "createdAt");
      validateTimeStamp(props.res, slot.updatedAt, "updatedAt");
      break;
    };
    case "deleteSession": {
      const { sessionId, employeeId, startTime } = props.data;
      validateId(props.res, sessionId, "sessionId");
      validateId(props.res, employeeId, "employeeId");
      validateTimeStamp(props.res, startTime, "startTime");
      break;
    }
    case "undoDeleteSession": {
      const session: Session = props.data;
      if (!session || typeof session !== "object" || !Object.keys(session).length) {
        return createResponse(props.res, "Missing or invalid session. Expected a non-empy object.");
      }
      validateId(props.res, session.id, "sessionId");
      validateId(props.res, session.slotId, "slotId");
      validateId(props.res, session.employeeId, "employeeId");
      validateId(props.res, session.customerId, "customerId");
      validateTimeStamp(props.res, session.startTime, "startTime");
      validateTimeStamp(props.res, session.createdAt, "createdAt");
      validateTimeStamp(props.res, session.updatedAt, "updatedAt");
      break;
    }
    case "updateSession": {
      const { prevSlotId, prevStartTime, session }: { prevSlotId: string, prevStartTime: Date, session: Session } = props.data;
      validateId(props.res, prevSlotId, "prevSlotId");
      validateTimeStamp(props.res, prevStartTime, "prevStartTime");
      if (!session || typeof session !== "object" || !Object.keys(session).length) {
        return createResponse(props.res, "Missing or invalid session. Expected a non-empy object.");
      }
      validateId(props.res, session.id, "sessionId");
      validateId(props.res, session.slotId, "slotId");
      validateId(props.res, session.employeeId, "employeeId");
      validateId(props.res, session.customerId, "customerId");
      validateTimeStamp(props.res, session.startTime, "startTime");
      validateTimeStamp(props.res, session.createdAt, "createdAt");
      validateTimeStamp(props.res, session.updatedAt, "updatedAt");
      break;
    }
    default:
      return createResponse(props.res, "Invalid endpoint.");
  }
};