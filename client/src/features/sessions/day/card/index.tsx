import { memo } from 'react';
import { Paragraph } from 'src/components/typography/Paragraph';
import { Badge } from 'src/components/Badge';
import { RescheduleSessionDesktop } from './RescheduleSessionDesktop';
import { useGetSlotsForReschedulingSessionQuery } from 'src/redux/api';
import { CancelSessionModal } from './CancelSessionModal';
import { RescheduleSessionMobile } from './RescheduleSessionMobile';
import { Session } from 'src/types';

interface CardProps {
  session: Session;
  isMobile: boolean;
}

export const Card = memo((props: CardProps) => {
  useGetSlotsForReschedulingSessionQuery({ employeeId: props.session.employeeId });

  return props.isMobile ?
    (
      <div className='flex flex-col gap-2 px-4'>
        <Item label='Full name' value={props.session.customerFullName} />
        <Item label='Phone number' value={props.session.customerPhoneNumber} />
        <Item label='Email' value={props.session.customerEmail} />
        <Item label='Message' value={props.session.message} />
        <div className='w-full flex-col gap-2 my-4'>
          <CancelSessionModal session={props.session} isMobile={props.isMobile} />
          <RescheduleSessionMobile employeeId={props.session.employeeId} sessionId={props.session.id} />
        </div>
      </div>
    ) : (
      <div key={props.session.id} className='w-full flex flex-col p-4 border border-border rounded-md shadow-shadow shadow-lg bg-background'>
        <div className='w-full flex justify-between mb-8'>
          <Paragraph variant='thick' size='base'>{props.session.customerFullName}</Paragraph>
          <Badge day={props.session.startTime} value='time' />
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div className='col-span-1 flex flex-col gap-4'>
            <Item label='Full name' value={props.session.customerFullName} />
            <Item label='Phone number' value={props.session.customerPhoneNumber} />
            <Item label='Email' value={props.session.customerEmail} />
            <Item label='Message' value={props.session.message} />
          </div>
          <div className='col-span-1 flex flex-col'>
            <div className='grow flex flex-col gap-2'>
              <Paragraph variant='thick' size='sm' className='text-text-tertiary'>
                Message
              </Paragraph>
              <div className='flex grow w-full rounded-md border border-border bg-transparent p-3 text-xs text-text-primary shadow-sm'>
                {props.session.message || ''}
              </div>
            </div>
          </div>
        </div>
        <div className='w-full flex justify-end gap-2 mt-8'>
          <CancelSessionModal session={props.session} isMobile={props.isMobile} />
          <RescheduleSessionDesktop employeeId={props.session.employeeId} sessionId={props.session.id} />
        </div>
      </div>
    )
});

interface ItemProps {
  label: string;
  value: string | undefined | null;
}

const Item = memo((props: ItemProps) => {
  return (
    <div className='first:mt-4 grow flex flex-col gap-2'>
      <Paragraph variant='thick' size='sm' className='text-text-tertiary'>{props.label}</Paragraph>
      <Paragraph variant='thick' size='sm' className='w-full h-9 flex items-center rounded-md border border-border bg-transparent px-3 py-1 shadow-sm'>
        {props.value || ''}
      </Paragraph>
    </div>
  )
});