export const getSlotHourAndMinutes = (dateTime: Date) => {
  const hour = String(new Date(dateTime).getHours()).padStart(2, '0');
  const minute = String(new Date(dateTime).getMinutes()).padStart(2, '0');
  return { hour, minute }
}