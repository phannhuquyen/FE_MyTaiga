import { useState, useId } from 'react'
import { Icon } from '@/components/ui'
import type { Department, Member } from '../types'

interface EditDepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  department: Department | null
  members: Member[]
  onUpdateDepartment: (
    id: string,
    payload: {
      name: string
      description?: string
      leadId?: string
      color?: string
    },
  ) => Promise<void>
  onTriggerDelete: (dept: Department) => void
}

export function EditDepartmentModal({
  isOpen,
  onClose,
  department,
  members,
  onUpdateDepartment,
  onTriggerDelete,
}: EditDepartmentModalProps) {
  if (!isOpen || !department) return null

  return (
    <EditDepartmentModalContent
      key={department.id}
      department={department}
      members={members}
      onClose={onClose}
      onUpdateDepartment={onUpdateDepartment}
      onTriggerDelete={onTriggerDelete}
    />
  )
}

function EditDepartmentModalContent({
  department,
  members,
  onClose,
  onUpdateDepartment,
  onTriggerDelete,
}: {
  department: Department
  members: Member[]
  onClose: () => void
  onUpdateDepartment: (
    id: string,
    payload: {
      name: string
      description?: string
      leadId?: string
      color?: string
    },
  ) => Promise<void>
  onTriggerDelete: (dept: Department) => void
}) {
  const [name, setName] = useState(department.name)
  const [description, setDescription] = useState(department.description || '')
  const [leadId, setLeadId] = useState(department.leadId || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameInputId = useId()
  const descInputId = useId()
  const leadSelectId = useId()

  const deptMembers = members.filter((m) => m.departmentId === department.id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Tên phòng ban không được để trống')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onUpdateDepartment(department.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        leadId: leadId || undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi cập nhật phòng ban')
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
        aria-labelledby="edit-dept-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Icon name="edit" size={17} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Cài đặt tổ chức
              </div>
              <h2 id="edit-dept-title" className="text-title-small font-bold text-neutral-900">
                Chỉnh sửa phòng ban: {department.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            aria-label="Đóng"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-xs text-danger-800 flex items-center gap-2">
              <Icon name="alert-circle" size={14} className="text-danger-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Code */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor={nameInputId} className="text-body-sm font-medium text-neutral-800">
                Tên phòng ban <span className="text-danger-600">*</span>
              </label>
              <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                Mã khối: {department.code}
              </span>
            </div>
            <input
              id={nameInputId}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-body-sm text-neutral-900 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor={descInputId} className="text-body-sm font-medium text-neutral-800">
                Mô tả trách nhiệm
              </label>
              <span className="text-xs text-neutral-400">Tối đa 240 ký tự</span>
            </div>
            <textarea
              id={descInputId}
              rows={3}
              maxLength={240}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-body-sm text-neutral-900 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Members & Sprint Load Summary Box */}
          <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/70 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                <Icon name="users" size={14} className="text-primary-600" />
                <span>Đang có {deptMembers.length} thành viên trong phòng ban này.</span>
              </div>
              <span className="text-primary-600 font-medium">Xem danh sách ↗</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center -space-x-1.5">
                {deptMembers.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="w-7 h-7 rounded-full bg-neutral-700 text-whiteboard text-[10px] font-bold flex items-center justify-center ring-2 ring-whiteboard"
                    title={m.name}
                  >
                    {m.avatarCode}
                  </div>
                ))}
                {deptMembers.length > 4 && (
                  <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold flex items-center justify-center ring-2 ring-whiteboard">
                    +{deptMembers.length - 4}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Khối lượng Sprint:</span>
                <div className="w-20 bg-neutral-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary-600 h-full rounded-full"
                    style={{ width: `${department.sprintLoad || 81}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-neutral-800">
                  {department.sprintLoad || 81}%
                </span>
              </div>
            </div>
          </div>

          {/* Lead Select */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor={leadSelectId} className="text-body-sm font-medium text-neutral-800">
                Trưởng nhóm chuyên môn (Lead)
              </label>
              <span className="text-xs text-neutral-500">Quyền phân bổ thẻ và phê duyệt pull-request</span>
            </div>
            <select
              id={leadSelectId}
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-body-sm text-neutral-900 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Chưa chọn trưởng nhóm...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.roleTitle})
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          <button
            type="button"
            onClick={() => onTriggerDelete(department)}
            className="flex items-center gap-1.5 text-xs font-semibold text-danger-600 hover:text-danger-800 hover:underline cursor-pointer"
          >
            <Icon name="trash" size={14} />
            Xóa phòng ban này
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-body-sm font-medium text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 px-4 py-2 text-body-sm font-medium text-whiteboard bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Icon name="check" size={16} />
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
