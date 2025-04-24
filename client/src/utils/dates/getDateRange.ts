export const getDateRange = (from: string, to: string) => {
  const fromDate = `${String(new Date(from).getDate()).padStart(2, '0')}.${String(new Date(from).getMonth() + 1).padStart(2, '0')}`
  const toDate = `${String(new Date(to).getDate()).padStart(2, '0')}.${String(new Date(to).getMonth() + 1).padStart(2, '0')}`
  return `${fromDate} - ${toDate}`
}