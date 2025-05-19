export const getTestDates = () => {
  const currentYear = new Date().getFullYear();
  const pastDate = new Date(new Date().setFullYear(currentYear - 1)).toISOString().split("T")[0];
  const futureStartDate = new Date(new Date().setFullYear(currentYear + 1)).toISOString().split("T")[0];
  const futureEndDate = new Date(new Date().setFullYear(currentYear + 1) + 518400000).toISOString().split("T")[0];
  return { pastDate, futureStartDate, futureEndDate };
}