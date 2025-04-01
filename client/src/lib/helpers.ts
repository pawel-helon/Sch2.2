import { DAYS_OF_WEEK } from 'src/lib/constants';

export function getCurrentWeek() {
  const today = new Date()
  const year = today.getFullYear()
  const dayOfWeek = today.getDay ()
  const dayName = DAYS_OF_WEEK[dayOfWeek].toLowerCase()
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek
  const monday = new Date(today.setDate(today.getDate() + diffToMonday))
  const yearStart = new Date(monday.getFullYear(), 0 , 1)
  const weekNumber = Math.ceil((((monday.getTime() - yearStart.getTime()) / 86400000) + 2) / 7)
  return { year, weekNumber, dayName }
}
