import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'src/utils/cn';

const buttonVariants = cva(
  'text-text-button cursor-pointer flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent-primary hover:bg-accent-primary-hover shadow',
        recurringSlots: 'bg-accent-secondary hover:accent-secondary-hover shadow',
        alert: 'bg-alert hover:alert-hover shadow-sm',
        outline: 'text-text-primary border border-border bg-background hover:bg-background-hover shadow-sm',
        ghost: 'text-text-primary hover:bg-background-hover hover:text-text-tertiary',
        link: 'text-accent-primary hover:accent-primary-hover underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
      isPressed: {
        true: 'bg-background-hover',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      isPressed: false,
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { asChild?: boolean }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isPressed, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, isPressed, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
