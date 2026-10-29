import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { AdminUser } from '../types'

interface LockUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: AdminUser | null
  onConfirmLock: (userId: string, reason: string, auditNote?: string) => Promise<{ success: boolean; error?: string }>
}

const LOCK_REASONS = [
  'Tạm ngưng công tác / Nghỉ việc',
  'Nghi vấn xâm phạm bảo mật',
  'Vi phạm chính sách nội bộ',
  'Xác thực OTP sai quá 5 lần',
  'Khác',
]

export function LockUserModal({ isOpen, onClose, user, onConfirmLock }: LockUserModalProps) {
  const [reason, setReason] = useState(LOCK_REASONS[0])
  const [auditNote, setAuditNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !user) return null

  const handleConfirm = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await onConfirmLock(user.id, reason, auditNote)
      if (result.success) onClose()
      else setError(result.error || 'Không thể khóa tài khoản.')
    } catch {
      setError('Không thể khóa tài khoản. Vui lòng thử lại.')
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
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Icon name="alert-triangle" size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Khóa tài khoản người dùng?
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                Hành động bảo mật quản trị
              </p>
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
          {/* User Card */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-600 text-whiteboard flex items-center justify-center text-xs font-bold shrink-0">
                {user.avatarCode}
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 block">
                  {user.name}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {user.email}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-neutral-200/70 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
              {user.roleLabel}
            </span>
          </div>

          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Bạn có chắc chắn muốn khóa tài khoản của <strong>{user.name}</strong> ({user.email})?
          </p>

          {/* Warning callout */}
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border-l-4 border-rose-500 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
            Khi bị khóa, người dùng sẽ bị <strong>đăng xuất khỏi tất cả phiên làm việc ngay lập tức</strong> và không thể truy cập hệ thống ScrumBan Flow cho đến khi được quản trị viên mở khóa trở lại.
          </div>

          {/* Reason Select */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Lý do khóa tài khoản:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              {LOCK_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Audit Note */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Ghi chú kiểm toán (Tùy chọn):
            </label>
            <input
              type="text"
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
              placeholder="Nhập số quyết định hoặc mã phiếu yêu cầu HR..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
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
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-whiteboard flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Icon name="lock" size={14} />
            <span>Xác nhận khóa</span>
          </button>
        </div>
      </div>
    </div>
  )
}
