import { useSelector } from 'react-redux'
import { selectDaySessions } from 'src/redux/selectors/sessions/selectDaySessions';
import { RootState } from 'src/redux/store'
import { getDateFromParams } from 'src/utils/dates/getDateFromParams';

export const DaySessions = (props: {
  year: number,
  weekNumber: number,
  dayName: string
}) => {
  const day = getDateFromParams(props.year, props.weekNumber, props.dayName);
  const { data: sessions } = useSelector((state: RootState) => selectDaySessions(state, day))

  return (
    <div>
      {/* TODO */}
    </div>
  )
}