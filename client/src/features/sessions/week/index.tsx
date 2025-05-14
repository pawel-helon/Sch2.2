import { memo, ReactNode } from 'react';
import { Card } from './card';
import { getNumOfPlaceholders } from 'src/utils/data/getNumOfPlaceholders';
import { getDayName } from 'src/utils/dates/getDayName';
import { getWeekDays } from 'src/utils/dates/getWeekDays';

interface WeekProps {
  year: number;
  weekNumber: number;
  currentDay: string;
}

export const Week = memo((props: WeekProps) => {
  const weekDays = getWeekDays(props.year, props.weekNumber);

  const cards = weekDays
    .filter((day) => getDayName(day) !== props.currentDay)
    .map((day, i) => (
      <Card key={i} year={props.year} weekNumber={props.weekNumber} day={day}/>
    ))
  
  let content: ReactNode = null;
  if (props.weekNumber === 1) {
    content = (
      <>
        <Placeholders weekNumber={props.weekNumber} weekLength={weekDays.length} />
        {cards}
      </>
    )  
  } else if (props.weekNumber === 53) {
    content = (
      <>
        {cards}
        <Placeholders weekNumber={props.weekNumber} weekLength={weekDays.length} />
      </>
    )
  } else {
    content = cards
  }

  return (
    <div className='col-span-1 flex flex-col gap-4'>
      {content}
    </div>
  )
});

interface PlaceholdersProps {
  weekNumber: number;
  weekLength: number;
}

const Placeholders = memo((props: PlaceholdersProps) => {
  const numOfPlaceholders = getNumOfPlaceholders(props.weekLength);

  return numOfPlaceholders.map((p: number) => (
    <div key={p} className='min-h-[180px] rounded-md border border-border shadow-shadow shadow-lg bg-background' />
  ))
});
