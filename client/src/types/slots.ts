export interface Slot {
  id: string;
  employeeId: string;
  type: 'AVAILABLE' | 'BLOCKED' | 'BOOKED';
  startTime: Date;
  duration: string;
  recurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedSlots {
  byId: {
    [key: string]: Slot
  },
  allIds: string[]
}

export interface SlotState {
  data: {
    byId: {
      [key: string]: Slot
    },
    allIds: string[]
  },
  status: 'uninitialized' | 'pending' | 'fulfilled' | 'rejected',
  error: string | null
}