export const getTime = (date: string | Date) => {
  const hour = String(new Date(date).getHours()).padStart(2, '0');
  const minutes = String(new Date(date).getMinutes()).padStart(2, '0');
  const time = hour + ':' + minutes;
  return time;
}