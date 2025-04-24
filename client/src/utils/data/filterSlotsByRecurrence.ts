import { Slot } from "src/types/slots";

export const filterSlotsByRecurrence = (slots: Slot[], isRecurringSlotsOnly: boolean) => {
  if (isRecurringSlotsOnly) {
    slots.filter((slot) => slot.recurring === true);
  }
  return slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}