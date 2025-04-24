import { NormalizedSlots, Slot } from 'src/types/slots';

export const getSlotsFromNormalized = (normalizedSlots: NormalizedSlots): Slot[] => {
  return normalizedSlots.allIds.map((id: string) => normalizedSlots.byId[id]);
};