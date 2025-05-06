import React from 'react';
import { useDeleteSessionMutation } from 'src/redux/actions/sessions/deleteSession';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from 'src/components/Dialog';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from 'src/components/Sheet';
import { Button } from 'src/components/Button';
import { Paragraph } from 'src/components/typography/Paragraph';
import { Session } from 'src/types/sessions';

export const CancelSessionModal = (props: {
  session: Session,
  isMobile: boolean
}) => {
  const [ open, setOpen ] = React.useState<boolean>(false);
  const [ deleteSession ] = useDeleteSessionMutation();
  const handleRemoveSession = async () => {
    setOpen(false);
    try {
      await deleteSession({ session: props.session })
    } catch (error) {
      infoAdded({ message: 'An error occurred while cancelling session.'})
      console.error(error)
    }
  }
  
  let content: React.ReactNode = null;
  if (props.isMobile) {
    content = (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='sm' className='w-full'>
            Cancel
          </Button>
        </SheetTrigger>
        <SheetContent aria-describedby='' side='bottom' className='min-h-[320px] flex flex-col flex-start bg-background'>
          <SheetTitle className='mb-8'>
            Cancel meeting
          </SheetTitle>
          <Paragraph variant='thin' size='base' className='leading-relaxed text-text-secondary'>
            {`Are you sure you want to cancel meeting with `}
            <span className='text-text-primary'>
              {props.session.customerFirstName}{' '}{props.session.customerLastName}
            </span>
            {' ?'} 
          </Paragraph>
          <div className='w-full absolute bottom-0 left-0 right-0 flex flex-col p-6 gap-2'>
            <Button onClick={handleRemoveSession}>
              Cancel meeting
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  } else {
    content = (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant='ghost' size='sm' className='w-fit'>
            Cancel
          </Button>
        </DialogTrigger>
        <DialogContent aria-describedby='' className='flex flex-col w-[480px]'>
          <DialogTitle>
            Cancel meeting
          </DialogTitle>
          <Paragraph variant='thin' size='base' className='mt-12 mb-20 leading-relaxed text-text-secondary'>
            {`Are you sure you want to cancel meeting with `}
            <span className='text-text-primary'>
              {props.session.customerFirstName}{' '}{props.session.customerLastName}
            </span>
            {' ?'} 
          </Paragraph>
          <div className='w-full absolute bottom-0 left-0 right-0 flex justify-end p-6 gap-2'>
            <Button onClick={handleRemoveSession} className='w-fit'>
              Cancel meeting
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  return content;
}