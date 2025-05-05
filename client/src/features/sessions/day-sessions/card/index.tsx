import { Paragraph } from 'src/components/typography/Paragraph';
import { Session } from 'src/types/sessions';
import { Actions } from './actions';
import { Badge } from 'src/components/Badge';

export const Card = (props: {
  session: Session,
  isMobile: boolean
}) => {
  if (props.isMobile) {
    return (
      <div className='flex flex-col gap-2 px-4'>
        <div className='flex flex-col gap-2 mt-4'>
          <Paragraph variant='thick' size='sm' className='text-text-tertiary'>Phone number</Paragraph>
          <Paragraph variant='thick' size='sm' className='w-full h-9 flex items-center rounded-md border border-border bg-transparent px-3 py-1 shadow-sm'>
            {props.session.customerPhoneNumber}
          </Paragraph>
        </div>
        <div className='flex flex-col gap-2'>
          <Paragraph variant='thick' size='sm' className='text-text-tertiary'>Email</Paragraph>
          <Paragraph variant='thick' size='sm' className='w-full h-9 flex items-center rounded-md border border-border bg-transparent px-3 py-1 shadow-sm'>
            {props.session.customerEmail}
          </Paragraph>
        </div>
        <div className='grow flex flex-col gap-2'>
          <Paragraph variant='thick' size='sm' className='text-text-tertiary'>Message</Paragraph>
          <div className='flex min-h-[120px] w-full rounded-md border border-border bg-transparent p-3 text-xs shadow-sm text-text-primary'>
            {props.session.message || ''}
          </div>
        </div>
        <Actions session={props.session} isMobile={props.isMobile} />
      </div>
    )
  } else {
    return (
      <>
        <div key={props.session.id} className='w-full flex flex-col p-4 border border-border rounded-md shadow-shadow shadow-lg bg-background'>
          <div className='w-full flex justify-between mb-8'>
            <Paragraph variant='thick' size='base'>{props.session.customerFirstName}</Paragraph>
            <Badge day={props.session.startTime} tab='sessions' />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-1 flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <Paragraph variant='thick' size='sm' className='text-text-tertiary'>Phone number</Paragraph>
                <Paragraph variant='thick' size='sm' className='w-full h-9 flex items-center rounded-md border border-border bg-transparent px-3 py-1 shadow-sm'>
                  {props.session.customerPhoneNumber}
                </Paragraph>
              </div>
              <div className='flex flex-col gap-2'>
                <Paragraph variant='thick' size='sm' className='text-text-tertiary'>Email</Paragraph>
                <Paragraph variant='thick' size='sm' className='w-full h-9 flex items-center rounded-md border border-border bg-transparent px-3 py-1 shadow-sm'>
                  {props.session.customerEmail}
                </Paragraph>
              </div>
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
          <Actions session={props.session} isMobile={props.isMobile} />
      </div>
    </>
    )
  }
}