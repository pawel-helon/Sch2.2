export const getPrevNextWeeks = (weekDays: string[], weekNumber: number) => {
  const prevWeek = Array.from({ length: 7 }, (_, i) => new Date(new Date(weekDays[0]).setDate(new Date(weekDays[0]).getDate() + i - 7)).toISOString().split('T')[0]);
  const nextWeek = Array.from({ length: 7 }, (_, i) => new Date(new Date(weekDays[0]).setDate(new Date(weekDays[0]).getDate() + i + 7)).toISOString().split('T')[0]);
  const yearOnBackwardNavigation: number = new Date(prevWeek[0]).getFullYear();
  const yearOnForewardNavigation: number = new Date(nextWeek[nextWeek.length - 1]).getFullYear();

  let prevWeekNumber: number = weekNumber
  if (new Date(weekDays[0]).getFullYear() > new Date(prevWeek[prevWeek.length - 1]).getFullYear()) {
    prevWeekNumber = 53;
  } else {
    prevWeekNumber = weekNumber - 1;
  }

  let nextWeekNumber: number = weekNumber
  if (new Date(weekDays[weekDays.length - 1]).getFullYear() < new Date(nextWeek[prevWeek.length - 1]).getFullYear()) {
    nextWeekNumber = 1;
  } else {
    nextWeekNumber = weekNumber + 1;
  }
  return { prevWeekNumber, nextWeekNumber, yearOnBackwardNavigation, yearOnForewardNavigation };
}