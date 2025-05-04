export const destructureParams = (week: string) => {
  const year = Number(week.split('w')[0])
  const weekNumber = Number(week.split('w')[1])
  return { year, weekNumber }
}