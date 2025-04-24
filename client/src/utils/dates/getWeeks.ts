export const getWeeks = (year: number) => {
  const yearStart = new Date(year, 0, 1).getDay()
  const yearEnd = new Date(year, 11, 31).getDay()
  let week: number = 0
  let firstDay: string = ''
  let lastDay: string = ''
  const weeks: { week: number; firstDay: string; lastDay: string }[] = []

  for (week = 1; week <= 53; week++) {
    if (week === 1) {
      firstDay = `${year}-01-01`
      lastDay = `${year}-01-0${8 - yearStart}`
      weeks.push({week, firstDay, lastDay})
    } else if (week === 53) {
      firstDay = `${year}-12-${31 - ( yearEnd - 1 )}`
      lastDay = `${year}-12-31`
      weeks.push({week, firstDay, lastDay})
    } else {
      const firstDayDate = new Date(year, 0, 1 + (week - 1) * 7 - (yearStart || 7) + 1)
      const lastDayDate = new Date(year, 0, 1 + (week - 1) * 7 - (yearStart || 7) + 7)
      firstDay = `${firstDayDate.getFullYear()}-${firstDayDate.getMonth() + 1}-${firstDayDate.getDate()}`
      lastDay = `${lastDayDate.getFullYear()}-${lastDayDate.getMonth() + 1}-${lastDayDate.getDate()}`
      weeks.push({week, firstDay, lastDay})
    }
  }
  return weeks
}