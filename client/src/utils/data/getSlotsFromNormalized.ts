import { NormalizedSlots, Slot } from 'src/types/slots';

export const getSlotsFromNormalized = (normalizedSlots: NormalizedSlots): Slot[] => {
  if (normalizedSlots.allIds.length === 0) {
    return [];
  } else {
    return normalizedSlots.allIds.map((id: string) => normalizedSlots.byId[id]);
  }
};