import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { Member } from '../types'

interface RemoveMemberModalProps {
  isOpen: boolean
  onClose: () => void
  member: Member | null
  onConfirmRemove: (memberId: string, reassignToLead: boolean) => Promise<void>
}

export function RemoveMemberModal({
  isOpen,
  onClose,
  member,
  onConfirmRemove,
}: RemoveMemberModalProps) {
  const [reassignToLead, setReassignToLead] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !member) return null

  const tasks = member.assignedTasks || []

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirmRemove(member.id, reassignToLead)
      onClose()
    } catch {
      // Handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg bg-whiteboard rounded-xl shadow-2xl border border-neutral-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-member-title"
      >
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-danger-50 border border-danger-200 text-danger-600 flex items-center justify-center shrink-0">
              <Icon name="alert-triangle" size={22} className="text-danger-600" />
            </div>
            <div>
              <h2 id="remove-member-title" className="text-title-small font-bold text-neutral-900">
                Loại bỏ {member.name} khỏi dự án?
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Mã thành viên: {member.employeeCode || member.id} • scrum-core
              </p>
            </div>
          </div>

          {/* Explanation Alert */}
          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-body-sm text-neutral-700 leading-relaxed">
            Hành động này sẽ thu hồi quyền truy cập của{' '}
            <span className="font-semibold text-neutral-900">{member.name}</span> vào dự án{' '}
            <span className="font-semibold text-primary-700">ScrumBan Core Platform</span>. Các công
            việc và nhiệm vụ đang phân công cho thành viên này sẽ được chuyển về trạng thái{' '}
            <span className="font-medium text-danger-700">Chưa gán (Unassigned)</span>.
          </div>

          {/* Affected Tasks */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              TÁC VỤ CHỊU ẢNH HƯỞNG ({tasks.length} THẺ)
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded bg-neutral-100 text-body-sm text-neutral-900 border border-neutral-200"
                  >
                    <span className="font-medium truncate pr-2">
                      {task.id}: {task.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 shrink-0">
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 text-center">
                Không có thẻ nhiệm vụ nào bị ảnh hưởng trực tiếp.
              </div>
            )}
          </div>

          {/* Reassign Checkbox */}
          <label className="flex items-start gap-3 p-2 rounded hover:bg-neutral-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={reassignToLead}
              onChange={(e) => setReassignToLead(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-neutral-300"
            />
            <span className="text-body-sm text-neutral-800">
              Chuyển giao các tác vụ đang phụ trách cho Quản lý dự án (Nguyễn Văn An)
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-body-sm font-medium text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-body-sm font-medium text-whiteboard bg-danger-600 hover:bg-danger-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Icon name="user-minus" size={16} />
            {isSubmitting ? 'Đang xử lý...' : 'Loại bỏ thành viên'}
          </button>
        </div>
      </div>
    </div>
  )
}
