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