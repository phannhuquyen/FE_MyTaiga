import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

type DateInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>

export function DateInput({ className, ...props }: DateInputProps) {
  return <input type="date" min="0001-01-01" max="9999-12-31" {...props} className={cn('w-full min-w-0 dark:scheme-dark', className)} />
}
