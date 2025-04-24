export const getDayEnd = (day: string): Date => {
  return new Date(new Date(day).setHours(23,59,59,999));
}