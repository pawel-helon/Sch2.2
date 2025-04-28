export interface SlotsAccumulator {
  byId: Record<string, Slot>;
  allIds: string[]
}

export interface Slot {
  id: string;
  employeeId: string;
  type: 'AVAILABLE' | 'BLOCKED' | 'BOOKED';
  startTime: Date;
  duration: { minutes: 30 } | { minutes: 45 } | { minutes: 60 };
  recurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionsAccumulator {
  byId: Record<string, Session>;
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