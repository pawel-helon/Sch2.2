import { useGetWeekSlotsQuery } from "./slotsSlice";

export const AvailabilityLayout = () => {
  const employeeId = '1d371399-6cdb-4e1f-a05c-367a83ba1228';
  const start = '2025-04-08';
  const end = '2025-04-12';

  const { data } = useGetWeekSlotsQuery({ employeeId, start, end });
  console.log(data);
  
  return (
    <div>
      Availability layout
    </div>
  )
}