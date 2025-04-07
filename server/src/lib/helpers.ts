import { DAYS_OF_WEEK } from "./constants";

export function getSlotTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const time = `${hours}:${minutes}`
  return time;
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getNameOfDay(day: string | Date) {
  return DAYS_OF_WEEK[new Date(day).getDay()].toLowerCase();
}

export function getHoursAndMinutes(dateTime: Date) {
  return `${String(dateTime.getHours()).padStart(2, "0")}:${String(dateTime.getMinutes()).padStart(2, "0")}`;
}

export function getTestDates() {
  const currentYear = new Date().getFullYear();
  const pastDate = new Date(new Date().setFullYear(currentYear - 1)).toISOString().split("T")[0];
  const futureStartDate = new Date(new Date().setFullYear(currentYear + 1)).toISOString().split("T")[0];
  const futureEndDate = new Date(new Date().setFullYear(currentYear + 1) + 518400000).toISOString().split("T")[0];
  return { pastDate, futureStartDate, futureEndDate };
}