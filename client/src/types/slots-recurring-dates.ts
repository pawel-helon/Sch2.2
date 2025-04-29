export interface NormalizedSlotsRecurringDates {
  byId: {
    [key: string]: SlotsRecurringDate
  },
  allIds: string[]
}
export interface SlotsRecurringDate {
  id: string;
  employeeId: string;
  date: string;
}