import { useEffect, useRef } from 'react'
import { Icon } from '@/components/ui'

export interface ProfileToastProps {
  message?: string
  description?: string
  isVisible: boolean
  onClose: () => void
  duration?: number
  autoClose?: boolean
  variant?: 'success' | 'error'
}

export function ProfileToast({
  message = 'Đã cập nhật hồ sơ thành công',
  description = 'Các thay đổi đã được lưu và đồng bộ toàn hệ thống.',
  isVisible,
  onClose,
  duration = 7000,
  autoClose = true,
  variant = 'success',
}: ProfileToastProps) {
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    if (!isVisible || !autoClose) return
    const timer = setTimeout(() => {
      closeRef.current()
    }, duration)
    return () => clearTimeout(timer)
  }, [isVisible, duration, autoClose])

  if (!isVisible) return null

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className="fixed top-5 right-5 z-50 flex items-start gap-3 bg-neutral-900 text-whiteboard px-4 py-3.5 rounded-xl shadow-2xl border border-neutral-700 max-w-sm sm:max-w-md animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className={`shrink-0 mt-0.5 ${variant === 'error' ? 'text-danger-400' : 'text-success-400'}`}>
        <Icon name={variant === 'error' ? 'alert-circle' : 'check-circle'} size={20} />
      </div>
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-body-sm font-semibold text-whiteboard tracking-tight">
          {message}
        </h4>
        <p className="text-[12px] text-neutral-400 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 text-neutral-400 hover:text-whiteboard p-1 rounded transition-colors cursor-pointer"
        aria-label="Đóng thông báo"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  )
}
