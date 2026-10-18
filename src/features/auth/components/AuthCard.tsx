import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface AuthCardProps {
  children: ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        'bg-whiteboard border border-neutral-200/90 rounded-xl p-8 sm:p-10 shadow-sm relative overflow-hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}
