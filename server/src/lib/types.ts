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