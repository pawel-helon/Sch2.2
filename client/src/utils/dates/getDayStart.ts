export const getDayStart = (day: string): Date => {
  return new Date(new Date(day).setHours(0,0,0));
}