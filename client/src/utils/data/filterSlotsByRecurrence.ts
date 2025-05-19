import { Slot } from 'src/types';

export const filterSlotsByRecurrence = (data: Slot[], isRecurringSlotsOnly: boolean) => {
  let slots: Slot[] = data;
  slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  if (isRecurringSlotsOnly) {
    slots = data.filter((slot) => slot.recurring === true);
  }
  return slots;
}