import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

type CardVariant = 'default' | 'elevated' | 'featured'

interface CardProps extends ComponentPropsWithoutRef<'div'> {
  variant?: CardVariant
  children: React.ReactNode
}

const variantClasses: Record<CardVariant, string> = {
  default: 'card',
  elevated: 'card card-elevated',
  featured: 'card card-featured',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    return (
      <div
        className={`${variantClasses[variant]} ${className}`.trim()}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
