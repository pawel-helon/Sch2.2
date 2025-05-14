import { memo, useCallback, useState } from 'react';
import { useDeleteSessionMutation } from 'src/redux/actions/sessions/deleteSession';
import { infoAdded } from 'src/redux/slices/infoSlice';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from 'src/components/Dialog';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from 'src/components/Sheet';
import { Button } from 'src/components/Button';
import { Paragraph } from 'src/components/typography/Paragraph';
import { Session } from 'src/types/sessions';

interface CancelSessionModalProps {
  session: Session;
  isMobile: boolean;
}

export const CancelSessionModal = memo((props: CancelSessionModalProps) => {
  const [ open, setOpen ] = useState<boolean>(false);
  const [ deleteSession ] = useDeleteSessionMutation();

  const handleRemoveSession = useCallback(async () => {
    setOpen(false);
    try {
      await deleteSession({ session: props.session })
    } catch (error) {
      infoAdded({ message: 'Failed to cancel session.'})
      console.error('Failed to cancel session: ', error)
    }
  },[setOpen, deleteSession, props.session, infoAdded]);
  
  return props.isMobile ?
    (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='sm' className='w-full'>
            Cancel
          </Button>
        </SheetTrigger>
        <SheetContent aria-describedby='' side='bottom' className='min-h-[320px] flex flex-col flex-start bg-background'>
          <SheetTitle className='mb-8'>
            Cancel session
          </SheetTitle>
          <Paragraph variant='thin' size='base' className='leading-relaxed text-text-secondary'>
            {`Are you sure you want to cancel session with `}
            <span className='text-text-primary'>
              {props.session.customerFullName}
            </span>
            {' ?'} 
          </Paragraph>
          <div className='w-full absolute bottom-0 left-0 right-0 flex flex-col p-6 gap-2'>
            <Button onClick={handleRemoveSession}>
              Cancel session
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    ) : (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant='ghost' size='sm' className='w-fit'>
            Cancel
          </Button>
        </DialogTrigger>
        <DialogContent aria-describedby='' className='flex flex-col w-[480px]'>
          <DialogTitle>
            Cancel session
          </DialogTitle>
          <Paragraph variant='thin' size='base' className='mt-12 mb-20 leading-relaxed text-text-secondary'>
            {`Are you sure you want to cancel session with `}
            <span className='text-text-primary'>
              {props.session.customerFullName}
            </span>
            {' ?'} 
          </Paragraph>
          <div className='w-full absolute bottom-0 left-0 right-0 flex justify-end p-6 gap-2'>
            <Button onClick={handleRemoveSession} className='w-fit'>
              Cancel session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
});