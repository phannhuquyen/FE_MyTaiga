import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { AdminUser } from '../types'

interface UnlockUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: AdminUser | null
  onConfirmUnlock: (userId: string) => Promise<{ success: boolean; error?: string }>
}

export function UnlockUserModal({
  isOpen,
  onClose,
  user,
  onConfirmUnlock,
}: UnlockUserModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  if (!isOpen || !user) return null

  const handleConfirm = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await onConfirmUnlock(user.id)
      if (result.success) onClose()
      else setError(result.error || 'Không thể mở khóa tài khoản.')
    } catch {
      setError('Không thể mở khóa tài khoản. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-whiteboard dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Icon name="unlock" size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Bảo mật hệ thống
              </p>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                Mở khóa tài khoản người dùng?
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && <p role="alert" className="text-danger-600">{error}</p>}
          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Khôi phục quyền truy cập cho tài khoản <strong>{user.name}</strong> ({user.email})? Người dùng sẽ có thể đăng nhập lại bình thường với vai trò <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-semibold">{user.roleLabel}</span> và tiếp tục tham gia các dự án đã được phân công.
          </p>

          {/* Email notice callout */}
          <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200 flex items-start gap-2.5">
            <Icon name="info" size={16} className="text-cyan-600 shrink-0 mt-0.5" />
            <p>Hệ thống sẽ gửi email thông báo tài khoản đã được kích hoạt lại cho người dùng.</p>
          </div>

          {/* Details table box */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
              <span>Mã định danh (UUID):</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                {user.id}
              </span>
            </div>
            <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
              <span>Lý do khóa trước đây:</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {user.lockedReason || 'Xác thực OTP sai quá 5 lần'}
              </span>
            </div>
            <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
              <span>Dự án ảnh hưởng:</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {user.projectAccess || 'Payment Gateway (Sprint 24)'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2.5 bg-neutral-50/50 dark:bg-neutral-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-whiteboard flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Icon name="check" size={14} />
            <span>Xác nhận mở khóa</span>
          </button>
        </div>
      </div>
    </div>
  )
}
