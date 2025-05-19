import { DAYS_OF_WEEK } from 'src/constants';
import { getWeekDays } from "./getWeekDays"

export const getDateFromParams = (year: number, weekNumber: number, dayName: string) => {
  const weekDays = getWeekDays(year, weekNumber);
  const day = weekDays.filter((d) => DAYS_OF_WEEK[new Date(d).getDay()].toLowerCase() === dayName)[0];
  return day;
}