import { Slot } from 'src/types';

export const getFilteredSlots = (data: Slot[], isRecurringSlotsOnly: boolean) => {
  let slots: Slot[] = data;
  if (isRecurringSlotsOnly) {
    slots = slots.filter((slot) => slot.recurring === true);
  }
  slots = slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  return slots;
}