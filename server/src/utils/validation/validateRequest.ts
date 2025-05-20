import { validateDate, validateId, validateSelectedDays, validateSlotDuration, validateSlotIds, validateSlotRecurring, validateSlotStartTimeHour, validateSlotStartTimeMinutes, validateSlotType, validateTimeStamp } from "./items";
import { createResponse } from "../createResponse";
import { Session, Slot, ValidationProps } from "../../types";

export const validateRequest = (props: ValidationProps) => {
  switch (props.endpoint) {
    case "getWeekSlots":
    case "getWeekSlotsRecurringDates":
    case "getWeekSessions": {
      const { employeeId, start, end }: { employeeId: string, start: string, end: string } = props.data;
      validateId(props.res, employeeId, "employeeId");
      validateDate(props.res, start, "start");
      validateDate(props.res, end, "end");
      break;
    }
    case "getSlotsForReschedulingSession": {
      const employeeId: string = props.data;
      validateId(props.res, employeeId, "employeeId");
      break;
    }
    case "addSlot":
    case "addRecurringSlot":
    case "disableRecurringDay":
    case "setRecurringDay":
    case "updateSlotsForReschedulingSession": {
      const { employeeId, day }: { employeeId: string, day: string } = props.data;
      validateId(props.res, employeeId, "employeeId");
      validateDate(props.res, day);
      if (new Date().getTime() > new Date(new Date(day).setHours(23,59,59,999)).getTime()) {
        return createResponse(props.res, "Invalid date. Expected non-past date.");
      }
      break;
    };
    case "deleteSlots": {
      const slotIds: string[] = props.data;
      validateSlotIds(props.res, slotIds);
    }
    case "addSlots": {
      const slots: Slot[] = props.data;
      if (!slots || !Array.isArray(slots) || !slots.length) {
        return createResponse(props.res, "Missing or invalid slots. Expected non-empty array.");
      }
      for (const slot of slots) {
        if (!slot || typeof slot !== "object" || !Object.keys(slot).length) {
          return createResponse(props.res, "Missing or invalid slot. Expected a non-empy object.");
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
    case "disableSlotRecurrence":
    case "setSlotRecurrence":
    case "undoAddRecurringSlot": {
      const slotId: string = props.data;
      validateId(props.res, slotId, "slotId");
      break;
    };
    case "duplicateDay": {
      const { employeeId, day, selectedDays }: { employeeId: string, day: string, selectedDays: string[] } = props.data;
      validateId(props.res, employeeId, "employeeId");
      validateDate(props.res, day);
      if (new Date().getTime() > new Date(new Date(day).setHours(23,59,59,999)).getTime()) {
        return createResponse(props.res, "Invalid date. Expected non-past date.");
      }
      validateSelectedDays(props.res, selectedDays);
      break;
    };
    case "undoUpdateSlotHour":
    case "updateRecurringSlotHour":
    case "updateSlotHour": {
      const { slotId, hour }: { slotId: string, hour: number } = props.data;
      validateId(props.res, slotId, "slotId");
      validateSlotStartTimeHour(props.res, hour);
      break;
    };
    case "undoUpdateSlotMinutes":
    case "updateRecurringSlotMinutes":
    case "updateSlotMinutes": {
      const { slotId, minutes }: { slotId: string, minutes: number } = props.data;
      validateId(props.res, slotId, "slotId");
      validateSlotStartTimeMinutes(props.res, minutes);
      break;
    };
    case "deleteSession": {
      const sessionId = props.data;
      validateId(props.res, sessionId, "sessionId");
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
      const { sessionId, slotId }:{ sessionId: string, slotId: string } = props.data;
      validateId(props.res, sessionId, "sessionId");
      validateId(props.res, slotId, "slotId");
      break;
    }
    default:
      return createResponse(props.res, "Invalid endpoint.");
  }
};