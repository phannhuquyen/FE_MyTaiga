import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { Department, Member } from '../types'

interface DeleteDepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  department: Department | null
  members: Member[]
  onConfirmDelete: (deptId: string) => Promise<void>
}

export function DeleteDepartmentModal({
  isOpen,
  onClose,
  department,
  members,
  onConfirmDelete,
}: DeleteDepartmentModalProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !department) return null

  const affectedMembers = members.filter((m) => m.departmentId === department.id)

  const handleDelete = async () => {
    if (!confirmed) return
    setIsSubmitting(true)
    try {
      await onConfirmDelete(department.id)
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
        aria-labelledby="delete-dept-title"
      >
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-danger-50 border border-danger-200 text-danger-600 flex items-center justify-center shrink-0">
              <Icon name="alert-triangle" size={22} className="text-danger-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-danger-600 uppercase tracking-wider">
                HÀNH ĐỘNG NGUY HIỂM • Mã định danh: {department.code}
              </div>
              <h2 id="delete-dept-title" className="text-title-small font-bold text-neutral-900 mt-0.5">
                Xóa phòng ban {department.name}?
              </h2>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-body-sm text-neutral-700 space-y-1.5 leading-relaxed">
            <div className="flex items-start gap-2">
              <Icon name="info" size={16} className="text-neutral-500 shrink-0 mt-0.5" />
              <div>
                Phòng ban này hiện có{' '}
                <span className="font-semibold text-neutral-900">{affectedMembers.length} thành viên</span>.
                Sau khi xóa phòng ban, tất cả thành viên thuộc phòng ban này sẽ{' '}
                <span className="font-semibold text-neutral-900 underline">không bị xóa khỏi dự án</span> mà
                sẽ tự động chuyển sang trạng thái{' '}
                <span className="font-bold text-primary-700">&quot;Chưa phân phòng ban&quot;</span>.
              </div>
            </div>
            <div className="text-xs text-neutral-500 pl-6">
              Các quyền hạn của thẻ việc (Task/Story) hiện được gán cho nhân sự vẫn được duy trì nguyên trạng.
            </div>
          </div>

          {/* Affected Members List */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              <span>THÀNH VIÊN BỊ ẢNH HƯỞNG ({affectedMembers.length})</span>
              <span className="text-neutral-400 font-normal lowercase">Tất cả sẽ giữ vai trò cũ</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto border border-neutral-200 rounded-lg p-2 bg-neutral-50/50">
              {affectedMembers.length === 0 ? (
                <div className="text-xs text-neutral-500 py-3 text-center">
                  Phòng ban này hiện không có nhân sự nào trực thuộc.
                </div>
              ) : (
                affectedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded bg-whiteboard border border-neutral-200 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-neutral-700 text-whiteboard text-[10px] font-bold flex items-center justify-center shrink-0">
                        {m.avatarCode}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-neutral-900 block truncate">{m.name}</span>
                        <span className="text-neutral-500 truncate block text-[11px]">{m.email}</span>
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                        m.role === 'manager' || m.role === 'lead'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {m.role === 'lead' ? 'Trưởng nhóm' : m.role === 'manager' ? 'Quản lý' : 'Thành viên'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 p-2 rounded hover:bg-neutral-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-danger-600 focus:ring-danger-500 border-neutral-300"
            />
            <span className="text-body-sm text-neutral-800 font-medium">
              Tôi hiểu rằng hành động này không thể hoàn tác lại cấu trúc thư mục.
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
            onClick={handleDelete}
            disabled={!confirmed || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-body-sm font-medium text-whiteboard bg-danger-600 hover:bg-danger-700 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Icon name="trash" size={16} />
            {isSubmitting ? 'Đang xóa...' : 'Xóa phòng ban'}
          </button>
        </div>
      </div>
    </div>
  )
}
