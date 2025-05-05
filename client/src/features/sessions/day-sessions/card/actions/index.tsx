import { CancelSessionModal } from './CancelSessionModal';
import { Session } from 'src/types/sessions';

export const Actions = (props: {
  session: Session,
  isMobile: boolean
}) => {
  let content: React.ReactNode = null; 
  if (props.isMobile) {
    content = (
      <div className='w-full flex-col gap-2'>
        <CancelSessionModal session={props.session} isMobile={props.isMobile} />
      </div>
    )
  } else {
    content = (
      <div className='w-full flex justify-end gap-2'>
        <CancelSessionModal session={props.session} isMobile={props.isMobile} />
      </div>
    )
  }
  return content;
}