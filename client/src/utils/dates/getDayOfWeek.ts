import { DAYS_OF_WEEK } from 'src/constants/dates';

export const getDayOfWeek = (day: string) => {
  return DAYS_OF_WEEK[new Date(day).getDay()];
}