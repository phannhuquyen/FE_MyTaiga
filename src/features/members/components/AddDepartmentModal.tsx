import { useState, useId } from 'react'
import { Icon } from '@/components/ui'
import type { Member } from '../types'

interface AddDepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  members: Member[]
  onAddDepartment: (payload: {
    name: string
    description?: string
    leadId?: string
    color?: string
  }) => Promise<void>
}

const COLOR_OPTIONS = [
  { value: '#076859', label: 'Teal Đậm' },
  { value: '#9c4221', label: 'Rust Đỏ' },
  { value: '#475569', label: 'Slate Xám' },
  { value: '#262626', label: 'Dark Than' },
]

export function AddDepartmentModal({
  isOpen,
  onClose,
  members,
  onAddDepartment,
}: AddDepartmentModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [leadId, setLeadId] = useState('')
  const [color, setColor] = useState(COLOR_OPTIONS[0].value)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameInputId = useId()
  const descInputId = useId()
  const leadSelectId = useId()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên phòng ban')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onAddDepartment({
        name: name.trim(),
        description: description.trim() || undefined,
        leadId: leadId || undefined,
        color,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi tạo phòng ban')
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
        aria-labelledby="add-dept-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Icon name="folder-plus" size={18} />
            </div>
            <div>
              <h2 id="add-dept-title" className="text-title-small font-bold text-neutral-900">
                Thêm phòng ban mới
              </h2>
              <p className="text-xs text-neutral-500">
                Tạo phòng ban chức năng để nhóm và phân loại thành viên trong dự án.
              </p>
            </div>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-xs text-danger-800 flex items-center gap-2">
              <Icon name="alert-circle" size={14} className="text-danger-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Department Name */}
          <div>
            <label htmlFor={nameInputId} className="block text-body-sm font-medium text-neutral-800 mb-1">
              Tên phòng ban <span className="text-danger-600">*</span>
            </label>
            <input
              id={nameInputId}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              placeholder="vd: Mobile Development, Data Analytics..."
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Tên định danh hiển thị trên toàn bộ thẻ công việc và bộ lọc.
            </p>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor={descInputId} className="text-body-sm font-medium text-neutral-800">
                Mô tả phòng ban
              </label>
              <span className="text-xs text-neutral-400">Tùy chọn</span>
            </div>
            <textarea
              id={descInputId}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả vai trò chuyên môn hoặc phạm vi hoạt động của phòng ban này (tùy chọn)..."
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Department Lead */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor={leadSelectId} className="text-body-sm font-medium text-neutral-800">
                Trưởng phòng ban / Đại diện
              </label>
              <span className="text-xs text-neutral-400">Tùy chọn</span>
            </div>
            <select
              id={leadSelectId}
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-body-sm text-neutral-900 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Chọn thành viên phụ trách chính trong dự án...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} - {m.roleTitle} ({m.departmentName})
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              Người chịu trách nhiệm phân luồng hạng mục công việc và ký duyệt release sprint.
            </p>
          </div>

          {/* Color Tag Picker */}
          <div>
            <label className="block text-body-sm font-medium text-neutral-800 mb-2">
              Nhãn màu nhận diện
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-sm transition-transform cursor-pointer flex items-center justify-center ${
                    color === c.value ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {color === c.value && <Icon name="check" size={14} className="text-whiteboard" />}
                </button>
              ))}
            </div>
          </div>
        </form>

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
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 text-body-sm font-medium text-whiteboard bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Icon name="check" size={16} />
            {isSubmitting ? 'Đang tạo...' : 'Tạo phòng ban'}
          </button>
        </div>
      </div>
    </div>
  )
}
