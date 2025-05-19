import { DAYS_OF_WEEK } from 'src/constants';

export const getDayName = (day: string) => {
  return DAYS_OF_WEEK[new Date(day).getDay()].toLowerCase()
}