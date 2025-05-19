export interface Slot {
  id: string;
  employeeId: string;
  type: 'AVAILABLE' | 'BLOCKED' | 'BOOKED';
  startTime: Date;
  duration: { minutes: 30 } | { minutes: 45 } | { minutes: 60 };
  recurring: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface NormalizedSlots {
  byId: Record<string, Slot>;
  allIds: string[];
};

export interface SlotsRecurringDate {
  id: string;
  employeeId: string;
  date: string;
};

export interface NormalizedSlotsRecurringDates {
  byId: Record<string, SlotsRecurringDate>;
  allIds: string[];
};

export interface Session {
  id: string;
  slotId: string;
  employeeId: string;
  customerId: string;
  startTime: Date;
  customerFullName?: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface NormalizedSessions {
  byId: Record<string, Session>;
  allIds: string[];
};
