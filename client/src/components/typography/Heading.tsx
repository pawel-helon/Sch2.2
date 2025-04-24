import * as React from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from 'src/utils/cn';

const headingVariants = cva(
  'font-inter antialiased text-text-primary leading-tight font-semibold',
  {
    variants: {
      variant: {
        h1: 'text-4xl',
        h2: 'text-3xl',
        h3: 'text-2xl',
        h4: 'text-xl',
        h5: 'text-lg',
        h6: 'text-base'
      }
    },
    defaultVariants: {
      variant: 'h1'
    }
  }
)

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  role?: string;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, ...props }, ref) => {
    const Tag = variant === 'h1' ? 'h1' : variant === 'h2' ? 'h2' : variant === 'h3' ? 'h3' : variant === 'h4' ? 'h4' : variant === 'h5' ? 'h5' : 'h6'
    return (
      <Tag
        ref={ref}
        className={cn(
          headingVariants({ variant }),
          className
        )}
        {...props}
      />
    )
  }
)
Heading.displayName = 'Heading'

export { Heading }