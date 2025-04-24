export const isPast = (day: string | Date) => {
  const now = new Date().getTime();
  const date = new Date(new Date(day).setHours(23,59,59,999)).getTime();
  const result = now > date ? true : false;
  return result;
}