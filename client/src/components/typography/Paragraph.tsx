import * as React from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from 'src/utils/cn';

const paragraphVariants = cva(
  'font-poppins antialiased leading-snug',
  {
    variants: {
      variant: {
        thin: 'font-medium',
        thick: 'font-semibold'
      },
      size: {
        sm: 'text-xs',
        base: 'text-sm'
      },
      isMuted: {
        true: 'text-text-tertiary',
        false: 'text-text-primary '
      }
    },
    defaultVariants: {
      variant: 'thick',
      size: 'base',
      isMuted: false
    }
  }
)

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof paragraphVariants> {
  role?: string;
}

const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, variant, size, isMuted, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          paragraphVariants({ variant, size, isMuted }),
          className
        )}
        {...props}
      />
    )
  }
)

Paragraph.displayName = 'Paragraph'

export { Paragraph }