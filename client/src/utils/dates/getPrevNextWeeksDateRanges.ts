export const getPrevNextWeeksDateRanges = (weeks: { week: number; firstDay: string; lastDay: string }[], week: number) => {
  const selectedWeek = weeks.filter(w => w.week === week)
  const firstDay = selectedWeek[0].firstDay
  const lastDay = selectedWeek[0].lastDay
  const fromDate = `${String(new Date(firstDay).getDate()).padStart(2, '0')}.${String(new Date(firstDay).getMonth() + 1).padStart(2, '0')}`
  const toDate = `${String(new Date(lastDay).getDate()).padStart(2, '0')}.${String(new Date(lastDay).getMonth() + 1).padStart(2, '0')}`
  return `${fromDate} - ${toDate}`
}