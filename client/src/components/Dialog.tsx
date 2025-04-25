import React from 'react';
import { cn } from 'src/utils/cn';

interface DialogProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
  children: React.ReactNode
  isOpen: boolean
  className?: string
}

const Dialog = React.forwardRef<HTMLDialogElement, DialogProps>(
  ({ isOpen, children, className }, ref) => {
    return (
      <>
        {isOpen && (
          <div className='relatve h-[100vh] w-[100vw]'>
            <div className='z-40 inset-0 fixed bg-black/40' />
            <dialog
              ref={ref}
              className={cn(
                'min-w-[480px] fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col gap-4 z-50 p-6 max-w-lg border border-border shadow-lg rounded-md sm:rounded-lg bg-background focus-visible:ring-white/60',
                className
              )}
            >
              {children}
            </dialog>
          </div>
        )}
      </>
    )
  }
)

Dialog.displayName = 'Dialog'

export { Dialog }