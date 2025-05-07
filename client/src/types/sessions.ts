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
}

export interface NormalizedSessions {
  byId: {
    [key: string]: Session
  },
  allIds: string[]
}
