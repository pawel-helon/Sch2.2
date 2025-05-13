import { Loader } from 'lucide-react';
import { useSelector } from 'react-redux'
import { RootState } from 'src/redux/store'
import { selectDaySessions } from 'src/redux/selectors/sessions/selectDaySessions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'src/components/Accordion';
import { Card } from './card';
import { Badge } from 'src/components/Badge';
import { Paragraph } from 'src/components/typography/Paragraph';
import { getDateFromParams } from 'src/utils/dates/getDateFromParams';
import { capitalizeFirstLetter } from 'src/utils/capitalizeFirstLetter';
import { cn } from 'src/utils/cn';
import { Session } from 'src/types/sessions';

export const Day = (props: {
  year: number,
  weekNumber: number,
  currentDay: string,
  isMobile: boolean
}) => {
  const day = getDateFromParams(props.year, props.weekNumber, props.currentDay);
  const { data: sessions, status } = useSelector((state: RootState) => selectDaySessions(state, day))

  const content = status !== 'fulfilled'
    ? <Loading isMobile={props.isMobile} />
    : <Loaded sessions={sessions} {...props} />

  return (
    <div className='col-span-2 flex flex-col gap-4'>
      {content}
    </div>
  )
}

const Loading = (props: {
  isMobile: boolean
}) => {
  return props.isMobile ?
    (
      <div className='flex relative h-[120px] col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
        <Loader className='size-6 text-text-tertiary animate-spin' />
      </div>
    ) : (
      <div className='aspect-[3/4] flex relative h-full col-span-1 flex-col border rounded-md border-border shadow-lg shadow-shadow bg-background'>
        <Loader className='size-6 text-text-tertiary absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 animate-spin' />
      </div>
    )
}

const Loaded = (props: {
  year: number,
  weekNumber: number,
  currentDay: string,
  sessions: Session[],
  isMobile: boolean
}) => {
  const content = props.sessions.length === 0
    ? <NoSessions dayName={props.currentDay} />
    : <Sessions sessions={props.sessions} isMobile={props.isMobile} />
  
  return (
    <div className='col-span-2 md:col-span-2 flex flex-col gap-4'>
      {content}
    </div>
  )
}

const NoSessions = (props: {
  dayName: string
}) => {
  return (
    <div className='relative h-[320px] flex p-4 border border-border rounded-md shadow-shadow shadow-lg bg-background'>
      <Paragraph variant='thick' size='sm' className='text-center text-balance text-text-secondary absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2'>
        You don't have any sessions scheduled on {capitalizeFirstLetter(props.dayName)}
      </Paragraph>
    </div>
  )
}

const Sessions = (props: {
  sessions: Session[],
  isMobile: boolean,
}) => {
  return props.isMobile ?
    (
      <Accordion type='single' defaultValue={props.sessions[0].id} className='flex flex-col gap-4'>
        {props.sessions.map((session) => (
          <AccordionItem key={session.id} value={session.id} className={cn('border border-border rounded-sm shadow-lg shadow-shadow bg-background')}>
            <AccordionTrigger className='px-2 hover:no-underline'>
              <div className='flex items-center gap-2'>
                <Badge day={new Date(session.startTime)} value='time' />
              </div>
            </AccordionTrigger>
            <AccordionContent className='pb-0'>
              <Card
                session={session}
                isMobile={props.isMobile}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    ) : (
      <div className='flex flex-col gap-4'>
        {props.sessions.map((session) => (
          <Card key={session.id} session={session} isMobile={props.isMobile} />
        ))}
      </div>
    )
}