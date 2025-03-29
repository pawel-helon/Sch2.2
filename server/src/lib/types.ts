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

export interface Session {
  id: string;
  slotId: string;
  employeeId: string;
  customerId: string;
  startTime: Date;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}