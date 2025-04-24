export const getWeekNumber = (date: Date): number => {
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 2) / 7);
};