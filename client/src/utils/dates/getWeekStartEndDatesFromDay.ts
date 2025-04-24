import { getWeekDays } from 'src/utils/dates/getWeekDays';
import { getWeekNumber } from 'src/utils/dates/getWeekNumber';

export const getWeekStartEndDatesFromDay = (day: string | Date): {start: string, end: string} => {
  const date = new Date(day);
  const dayOfWeek = date.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  
  const weekDays = getWeekDays(monday.getFullYear(), getWeekNumber(monday));
  return { start: weekDays[0], end: weekDays[weekDays.length - 1] };
}
