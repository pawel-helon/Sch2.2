export interface NormalizedSlots {
  byId: {
    [key: string]: Slot
  },
  allIds: string[]
}

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

export interface NormalizedSessions {
  byId: {
    [key: string]: Session
  },
  allIds: string[]
}

export interface Session {
  id: string;
  slotId: string;
  employeeId: string;
  customerId: string;
  startTime: Date;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
}