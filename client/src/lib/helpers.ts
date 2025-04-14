import { DAYS_OF_WEEK } from 'src/lib/constants';
import { NormalizedSlots, Slot } from './types';

export const getCurrentWeek = () => {
  const today = new Date();
  const year = today.getFullYear();
  const dayOfWeek = today.getDay ();
  const dayName = DAYS_OF_WEEK[dayOfWeek].toLowerCase();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(today.setDate(today.getDate() + diffToMonday));
  const yearStart = new Date(monday.getFullYear(), 0 , 1);
  const weekNumber = Math.ceil((((monday.getTime() - yearStart.getTime()) / 86400000) + 2) / 7);
  return { year, weekNumber, dayName }
}

export const getWeekDays = (year: number, week: number) => {
  if (week < 1 || week > 53 || year > 2100) {
    throw new Error;
  }
  
  const yearStart = new Date(year, 0, 1).getDay();
  const yearEnd = new Date(year, 11, 31).getDay();
  let i: number = 0;;
  let weekDay: string = '';
  let weekDays: string[] = [];

  if (week === 1) {
    if (yearStart > 0) {
      for (i = yearStart; i <= 7; i++) {
        weekDay = `${year}-01-0${i - yearStart + 1}`;
        weekDays.push(weekDay);
      }
    } else {
      weekDay = `${year}-01-01`;
      weekDays.push(weekDay);
    }
  } else if (week === 53) {
      if (yearEnd > 0) {
        for (i = 31 - ( yearEnd - 1 ); i <= 31; i++) {
          weekDay = `${year}-12-${i}`;
          weekDays.push(weekDay);
        }
      } else {
        weekDay = `${year}-12-31`;
        weekDays.push(weekDay);
      }
  } else {
    const firstWeekday = new Date(year, 0, 1 + (week - 1) * 7 - (yearStart || 7) + 1);
    weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(firstWeekday);
      date.setDate(firstWeekday.getDate() + i);
      return `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    });
  }
  return weekDays
}

const getWeekNumber = (date: Date): number => {
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 2) / 7);
};

export const getWeekStartEndDatesFromDay = (day: string | Date): {start: string, end: string} => {
  const date = new Date(day);
  const dayOfWeek = date.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  
  const weekDays = getWeekDays(monday.getFullYear(), getWeekNumber(monday));
  return { start: weekDays[0], end: weekDays[weekDays.length - 1] };
}

export const getSlotsFromNormalized = (normalizedSlots: NormalizedSlots): Slot[] => {
  return normalizedSlots.allIds.map(id => normalizedSlots.byId[id]);
};