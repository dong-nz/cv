interface BadgeProps {
  children: React.ReactNode
  variant?: 'accent' | 'outline' | 'muted'
  className?: string
}

const variantClasses: Record<'accent' | 'outline' | 'muted', string> = {
  accent: 'badge badge-accent',
  outline: 'badge badge-outline',
  muted: 'badge badge-muted',
}

export function Badge({ children, variant = 'muted', className = '' }: BadgeProps) {
  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
