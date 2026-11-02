import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none cursor-pointer'

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-primary-500 text-whiteboard hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow-md hover:shadow-primary-500/20',
    secondary:
      'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300',
    outline:
      'border border-neutral-300 bg-whiteboard text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 shadow-xs',
    ghost:
      'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200',
    danger:
      'bg-danger-500 text-whiteboard hover:bg-danger-600 active:bg-danger-700 shadow-sm hover:shadow-md hover:shadow-danger-500/20',
  }

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-body-sm px-2.5 py-1 gap-1.5',
    md: 'text-body-default px-3.5 py-1.5 gap-2',
    lg: 'text-headline-sm px-4 py-2 gap-2',
  }

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  )
}
