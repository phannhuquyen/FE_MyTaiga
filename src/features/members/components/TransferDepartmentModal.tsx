import { useState, useId } from 'react'
import { Icon } from '@/components/ui'
import type { Department, Member } from '../types'

interface TransferDepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  member: Member | null
  departments: Department[]
  onConfirmTransfer: (memberId: string, newDepartmentId: string) => Promise<void>
}

export function TransferDepartmentModal({
  isOpen,
  onClose,
  member,
  departments,
  onConfirmTransfer,
}: TransferDepartmentModalProps) {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    departments.find((d) => d.id !== member?.departmentId)?.id || departments[0]?.id || '',
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const deptSelectId = useId()

  if (!isOpen || !member) return null

  const handleTransfer = async () => {
    if (!selectedDeptId || selectedDeptId === member.departmentId) return
    setIsSubmitting(true)
    try {
      await onConfirmTransfer(member.id, selectedDeptId)
      onClose()
    } catch {
      // Handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableDepts = departments.filter((d) => d.id !== member.departmentId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md bg-whiteboard rounded-xl shadow-2xl border border-neutral-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-dept-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 id="transfer-dept-title" className="text-title-small font-bold text-neutral-900">
              Chuyển phòng ban
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Cập nhật đơn vị công tác trực thuộc cho thành viên dự án.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
            aria-label="Đóng"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Member Card */}
          <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary-800 text-whiteboard font-semibold text-body-sm flex items-center justify-center shrink-0">
                {member.avatarCode}
              </div>
              <div className="min-w-0">
                <div className="text-body-sm font-bold text-neutral-900 truncate">
                  {member.name}
                </div>
                <div className="text-xs text-neutral-500 truncate">{member.email}</div>
                <div className="text-xs text-neutral-600 mt-0.5">
                  Phòng ban hiện tại:{' '}
                  <span className="font-semibold text-neutral-800">{member.departmentName}</span>
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-100 text-primary-800 border border-primary-200 shrink-0">
              {member.role === 'manager' ? 'Quản lý' : 'Thành viên'}
            </span>
          </div>

          {/* New Department Select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={deptSelectId} className="text-body-sm font-medium text-neutral-800">
                Phòng ban mới
              </label>
              <span className="text-xs text-danger-600 font-medium">Bắt buộc</span>
            </div>
            <select
              id={deptSelectId}
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-body-sm text-neutral-900 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              {availableDepts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1.5 leading-normal">
              Thành viên sẽ được điều chỉnh phân quyền và nhận thông báo công việc tương ứng trong
              backlog Sprint.
            </p>
          </div>

          {/* Info notice */}
          <div className="p-3 rounded-lg bg-primary-50/60 border border-primary-200/60 text-xs text-primary-900 flex items-start gap-2">
            <Icon name="info" size={15} className="text-primary-600 shrink-0 mt-0.5" />
            <span>
              Việc chuyển đổi phòng ban không làm gián đoạn các nhiệm vụ Kanban đang gắn thẻ cho{' '}
              <span className="font-semibold">{member.name}</span>.
            </span>
          </div>
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
            onClick={handleTransfer}
            disabled={isSubmitting || !selectedDeptId}
            className="flex items-center gap-2 px-4 py-2 text-body-sm font-medium text-whiteboard bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Icon name="check" size={16} />
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  )
}
