export const getMonthAndDay = (day: string | Date) => {
  return `${String(new Date(day).getDate()).padStart(2, '0')}.${String(new Date(day).getMonth() + 1).padStart(2, '0')}`;
}