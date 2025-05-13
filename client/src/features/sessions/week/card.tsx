import { Loader } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Badge } from 'src/components/Badge'
import { Paragraph } from 'src/components/typography/Paragraph'
import { selectDaySessions } from 'src/redux/selectors/sessions/selectDaySessions'
import { RootState } from 'src/redux/store'
import { Session } from 'src/types/sessions'
import { capitalizeFirstLetter } from 'src/utils/capitalizeFirstLetter'
import { getSessionsLink } from 'src/utils/data/getSessionsLink'
import { getDayName } from 'src/utils/dates/getDayName'
import { isPast } from 'src/utils/dates/isPast'
import { handleScrollToTop } from 'src/utils/handleScrollToTop'
import { getTime } from 'src/utils/dates/getTime'

export const Card = (props: {
  year: number,
  weekNumber: number,
  day: string
}) => {
  const { data: sessions, status } = useSelector((state: RootState) => selectDaySessions(state, props.day))
  
  return status === 'pending'
    ? <Loading />
    : <Loaded {...props} sessions={sessions} />
}

const Loading = () => {
  return (
    <div className='aspect-[3/4] flex relative h-full col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
      <Loader className='size-6 text-text-tertiary absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 animate-spin' />
    </div>
  )
}

const Loaded = (props: {
  year: number,
  weekNumber: number,
  day: string,
  sessions: Session[]
}) => {
  const link = getSessionsLink(props.year, props.weekNumber, props.day);

  const content = props.sessions.length === 0
    ? <NoSessions day={props.day} />
    : <Sessions sessions={props.sessions} />

  return (
    <a onClick={handleScrollToTop} href={link} className='min-h-[180px] relative flex h-full flex-col border border-border rounded-md shadow-md bg-background animation duration-200 transition-none hover:bg-background-hover'>
      <div className='w-full flex justify-between items-center p-3'>
        <Paragraph variant='thick' size='sm' isMuted={isPast(props.day)}>
          {capitalizeFirstLetter(getDayName(props.day))}
        </Paragraph>
        <Badge day={props.day} value='date'/>
      </div>
      {content}
    </a>
  )
}

const NoSessions = (props: {
  day: string,
}) => {
  const copy = isPast(props.day)
    ? `There were no meetings scheduled.`
    : 'There are no meetings scheduled yet.'
  
  return (
    <div className='absolute top-0 bottom-0 left-0 right-0 flex flex-col p-3 justify-center items-center mt-4'>
      <Paragraph variant='thin' size='sm' isMuted={isPast(props.day)} className='w-full text-center text-balance'>
        {copy}
      </Paragraph>
    </div>
  )
}

const Sessions = (props: {
  sessions: Session[],
}) => {
  return (
    <div className='h-full w-full flex flex-col gap-4 pt-2 px-3 overflow-y-auto scrollbar scrollbar-thumb-muted scrollbar-thumb-rounded-full scrollbar-track-card-background scrollbar-w-1 scrollbar-h-1'>
      {props.sessions.map((s) => (
        <div key={s.id} className='flex justify-between gap-2'>
          <div className='w-full flex justify-between'>
            <Paragraph variant='thick' size='sm' className='text-text-secondary'>
              {s.customerFullName}
            </Paragraph>
            <Paragraph variant='thick' size='sm' className='text-right text-text-primary'>
              {getTime(new Date(s.startTime))}
            </Paragraph>
          </div>
        </div>
      ))}
    </div>
  )
}