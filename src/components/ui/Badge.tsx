import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'paper'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
  dot?: boolean
}

export function Badge({
  variant = 'default',
  children,
  dot = false,
  className,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> =
    {
      default: {
        container: 'bg-neutral-100 text-neutral-700 border-neutral-200',
        dot: 'bg-neutral-500',
      },
      primary: {
        container: 'bg-primary-50 text-primary-800 border-primary-200',
        dot: 'bg-primary-500',
      },
      success: {
        container: 'bg-success-50 text-success-800 border-success-200',
        dot: 'bg-success-500',
      },
      warning: {
        container: 'bg-warning-50 text-warning-800 border-warning-200',
        dot: 'bg-warning-500',
      },
      danger: {
        container: 'bg-danger-50 text-danger-800 border-danger-200',
        dot: 'bg-danger-500',
      },
      info: {
        container: 'bg-info-50 text-info-800 border-info-200',
        dot: 'bg-info-500',
      },
      neutral: {
        container: 'bg-neutral-100 text-neutral-800 border-neutral-300',
        dot: 'bg-neutral-600',
      },
      paper: {
        container: 'bg-paper-200 text-paper-900 border-paper-300',
        dot: 'bg-paper-600',
      },
    }

  const currentVariant = variantStyles[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-default font-medium border',
        currentVariant.container,
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', currentVariant.dot)}
        />
      )}
      <span>{children}</span>
    </span>
  )
}
