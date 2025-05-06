import { Slot } from 'src/types/slots';

export const sortAndFilterSlots = (slots: Slot[], firstSlot: number, lastSlot: number) => {
  const sortedSlots = slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const filteredSlots = sortedSlots.slice(firstSlot, lastSlot);
  return filteredSlots;
}
