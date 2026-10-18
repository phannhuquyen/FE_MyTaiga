import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  value: number // 0 to 100
  max?: number
  height?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  className?: string
  showLabel?: boolean
  label?: string
}

export function ProgressBar({
  value,
  max = 100,
  height = 'md',
  variant = 'primary',
  className,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100)

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  const variantStyles = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-body-sm text-neutral-600">
          <span>{label}</span>
          <span className="font-semibold text-neutral-800">{percentage}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-neutral-200 rounded-full overflow-hidden',
          heightStyles[height],
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 rounded-full',
            variantStyles[variant],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
