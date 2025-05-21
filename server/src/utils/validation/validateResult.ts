import { validateDate, validateId, validateSlotDuration, validateSlotIds, validateSlotRecurring, validateSlotStartTimeHour, validateSlotStartTimeMinutes, validateSlotType, validateTimeStamp } from "./items";
import { sendResponse } from "../sendResponse";
import { NormalizedSessions, NormalizedSlots, NormalizedSlotsRecurringDates, Session, Slot, SlotsRecurringDate, ValidationProps } from "../../types";

export const validateResult = async (props: ValidationProps): Promise<void | "validated"> => {
  switch (props.endpoint) {
    case "getWeekSlots":
    case "getSlotsForReschedulingSession": {
      const normalizedSlots: NormalizedSlots = props.data;
      const { byId, allIds } = normalizedSlots;
      if (!allIds.length) return;
      if (!byId || !allIds || typeof byId !== "object" || !Array.isArray(allIds)) {
        return sendResponse(props.res, "byId and allIds are required. byId must be an object, allIds must be an array.");
      }
      for (const id in byId) {
        validateId(props.res, id, "slotId");
        const slot = byId[id];
        if (!slot || typeof slot !== "object" || !Object.keys(slot).length) {
          return sendResponse(props.res, "Missing or invalid slot. Expected an object.");
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
        return sendResponse(props.res, "Mismatch between allIds and byId keys.");
      }
      return "validated";
    }
    case "getWeekSlotsRecurringDates": {
      const normalizedSlotsRecurringDates: NormalizedSlotsRecurringDates = props.data;
      const { byId, allIds } = normalizedSlotsRecurringDates;
      if (!allIds.length) return;
      if (!byId || !allIds || typeof byId !== "object" || !Array.isArray(allIds)) {
        return sendResponse(props.res, "byId and allIds are required. byId must be a non-empty object, allIds must be an array.");
      }
      for (const id in byId) {
        validateId(props.res, id, "slotsRecurringDateId");
        const slotsRecurringDate = byId[id];
        validateId(props.res, id, "slotsRecurringDateId");
        validateId(props.res, slotsRecurringDate.employeeId, "SlotsRecurringDateEmployeeId");
        validateDate(props.res, slotsRecurringDate.date, "slotsRecurringDate");
      }
      return "validated";
    }
    case "getWeekSessions": {
      const normalizedSessions: NormalizedSessions = props.data;
      const { byId, allIds } = normalizedSessions;
      if (!allIds.length) return;
      if (!byId || !allIds || typeof byId !== "object" || !Array.isArray(allIds)) {
        return sendResponse(props.res, "byId and allIds are required. byId must be a non-empty object, allIds must be an array.");
      }
      for (const id in byId) {
        validateId(props.res, id, "sessionId");
        const session = byId[id];
        if (!session || typeof session !== "object" || !Object.keys(session).length) {
          return sendResponse(props.res, "Missing or invalid slot. Expected an object.");
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
        return sendResponse(props.res, "Mismatch between allIds and byId keys.");
      }
      return "validated";
    }
    case "addSlot":``
    case "addRecurringSlot":
    case "disableSlotRecurrence":
    case "setSlotRecurrence":
    case "undoAddRecurringSlot": {
      const slot: Slot = props.data;
      if (!slot || typeof slot !== "object" || !Object.keys(slot).length) {
        return sendResponse(props.res, "Missing or invalid slot. Expected an object.");
      }
      validateId(props.res, slot.id, "slotId");
      validateId(props.res, slot.employeeId, "employeeId");
      validateSlotType(props.res, slot.type);
      validateTimeStamp(props.res, slot.startTime, "startTime");
      validateSlotDuration(props.res, slot.duration);
      validateSlotRecurring(props.res, slot.recurring);
      validateTimeStamp(props.res, slot.createdAt, "createdAt");
      validateTimeStamp(props.res, slot.updatedAt, "updatedAt");
      return "validated";
    };
    case "duplicateDay":
    case "addSlots":
    case "updateSlotsForReschedulingSession": {
      const slots: Slot[] = props.data;
      if (!slots || !Array.isArray(slots) || !slots.length) {
        return sendResponse(props.res, "Missing or invalid slots. Expected non-empty array.");
      }
      for (const slot of slots) {
        if (!slot || typeof slot !== "object" || !Object.keys(slot).length) {
          return sendResponse(props.res, "Missing or invalid slot. Expected an object.");
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
      return "validated";
    };
    case "deleteSlots": {
      const { employeeId, date, slotIds } = props.data;
      validateId(props.res, employeeId, "employeeId");
      validateDate(props.res, date);
      if (new Date().getTime() > new Date(new Date(date).setHours(23,59,59,999)).getTime()) {
        return sendResponse(props.res, "Invalid date. Expected non-past date.");
      }
      validateSlotIds(props.res, slotIds);
      return "validated";
    };
    case "disableRecurringDay":
    case "setRecurringDay": {
      const slotsRecurringDate: SlotsRecurringDate  = props.data;
      validateId(props.res, slotsRecurringDate.id, "slotsRecurringDateId");
      validateId(props.res, slotsRecurringDate.employeeId, "employeeId");
      validateDate(props.res, slotsRecurringDate.date);
      if (new Date().getTime() > new Date(new Date(slotsRecurringDate.date).setHours(23,59,59,999)).getTime()) {
        return sendResponse(props.res, "Invalid date. Expected non-past date.");
      }     
      return "validated";
    };
    case "undoUpdateSlotHour":
    case "updateRecurringSlotHour":
    case "updateSlotHour": {
      const { prevHour, slot }: { prevHour: number, slot: Slot } = props.data;
      
      validateSlotStartTimeHour(props.res, prevHour);
      if (!slot || typeof slot !== "object" || !Object.keys(slot).length) {
        return sendResponse(props.res, "Missing or invalid slot. Expected an object.");
      };

      validateId(props.res, slot.id, "slotId");
      validateId(props.res, slot.employeeId, "employeeId");
      validateSlotType(props.res, slot.type);
      validateTimeStamp(props.res, slot.startTime, "startTime");
      validateSlotDuration(props.res, slot.duration);
      validateSlotRecurring(props.res, slot.recurring);
      validateTimeStamp(props.res, slot.createdAt, "createdAt");
      validateTimeStamp(props.res, slot.updatedAt, "updatedAt");
      return "validated";
    };
    case "updateSlotMinutes":
    case "undoUpdateSlotMinutes":
    case "updateRecurringSlotMinutes": {
      const { prevMinutes, slot }: { prevMinutes: number, slot: Slot } = props.data;
      validateSlotStartTimeMinutes(props.res, prevMinutes);
      if (!slot || typeof slot !== "object" || !Object.keys(slot).length) {
        return sendResponse(props.res, "Missing or invalid slot. Expected an object.");
      };
      validateId(props.res, slot.id, "slotId");
      validateId(props.res, slot.employeeId, "employeeId");
      validateSlotType(props.res, slot.type);
      validateTimeStamp(props.res, slot.startTime, "startTime");
      validateSlotDuration(props.res, slot.duration);
      validateSlotRecurring(props.res, slot.recurring);
      validateTimeStamp(props.res, slot.createdAt, "createdAt");
      validateTimeStamp(props.res, slot.updatedAt, "updatedAt");
      return "validated";
    };
    case "deleteSession": {
      const { sessionId, employeeId, startTime } = props.data;
      validateId(props.res, sessionId, "sessionId");
      validateId(props.res, employeeId, "employeeId");
      validateTimeStamp(props.res, startTime, "startTime");
      return "validated";
    }
    case "undoDeleteSession": {
      const session: Session = props.data;
      if (!session || typeof session !== "object" || !Object.keys(session).length) {
        return sendResponse(props.res, "Missing or invalid session. Expected a non-empy object.");
      }
      validateId(props.res, session.id, "sessionId");
      validateId(props.res, session.slotId, "slotId");
      validateId(props.res, session.employeeId, "employeeId");
      validateId(props.res, session.customerId, "customerId");
      validateTimeStamp(props.res, session.startTime, "startTime");
      validateTimeStamp(props.res, session.createdAt, "createdAt");
      validateTimeStamp(props.res, session.updatedAt, "updatedAt");
      return "validated";
    }
    case "updateSession": {
      const { prevSlotId, prevStartTime, session }: { prevSlotId: string, prevStartTime: Date, session: Session } = props.data;
      validateId(props.res, prevSlotId, "prevSlotId");
      validateTimeStamp(props.res, prevStartTime, "prevStartTime");
      if (!session || typeof session !== "object" || !Object.keys(session).length) {
        return sendResponse(props.res, "Missing or invalid session. Expected a non-empy object.");
      }
      validateId(props.res, session.id, "sessionId");
      validateId(props.res, session.slotId, "slotId");
      validateId(props.res, session.employeeId, "employeeId");
      validateId(props.res, session.customerId, "customerId");
      validateTimeStamp(props.res, session.startTime, "startTime");
      validateTimeStamp(props.res, session.createdAt, "createdAt");
      validateTimeStamp(props.res, session.updatedAt, "updatedAt");
      return "validated";
    }
    default:
      return sendResponse(props.res, "Invalid endpoint.");
  }
};