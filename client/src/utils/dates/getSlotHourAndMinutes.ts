export const getSlotHourAndMinutes = (dateTime: Date) => {
  const hour = new Date(dateTime).getHours();
  const minutes = new Date(dateTime).getMinutes();
  return { hour, minutes }
}