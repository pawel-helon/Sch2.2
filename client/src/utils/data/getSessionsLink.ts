import { DAYS_OF_WEEK } from 'src/constants/dates';

export const getSessionsLink = (year: number, weekNumber: number, day: string) => {
  const dayName = DAYS_OF_WEEK[new Date(day).getDay()].toLowerCase()
  return `/sessions/${String(year)}w${String(weekNumber)}/${dayName}`
}