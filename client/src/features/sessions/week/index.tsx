import { useSelector } from 'react-redux';
import { selectWeekSessions } from 'src/redux/selectors/sessions/selectWeekSessions';
import { RootState } from 'src/redux/store';

export const Week = (props: {
  year: number,
  weekNumber: number,
  dayName: string
}) => {
  const { data: sessions } = useSelector((state: RootState) => selectWeekSessions(state))
  
  return (
    <div>
      {/* TODO */}
    </div>
  )
}