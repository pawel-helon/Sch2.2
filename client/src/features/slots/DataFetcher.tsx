import { useGetWeekSlotsQuery } from 'src/lib/schedulingApi';

export function DataFetcher(props: {
  employeeId: string,
  start: string,
  end: string
}) {
  useGetWeekSlotsQuery({ employeeId: props.employeeId, start: props.start, end: props.end });
  return null;
}
