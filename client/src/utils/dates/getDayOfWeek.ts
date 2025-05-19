import { DAYS_OF_WEEK } from 'src/constants';

export const getDayOfWeek = (day: string) => {
  return DAYS_OF_WEEK[new Date(day).getDay()];
}