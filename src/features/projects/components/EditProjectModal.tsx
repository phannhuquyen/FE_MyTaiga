import { useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui'
import type { Project, ProjectStatus, UpdateProjectPayload } from '../types'

export interface EditProjectModalProps {
  isOpen: boolean
  project: Project | null
  onClose: () => void
  onSave: (id: string, payload: UpdateProjectPayload) => Promise<void>
}

export function EditProjectModal({
  isOpen,
  project,
  onClose,
  onSave,
}: EditProjectModalProps) {
  if (!isOpen || !project) return null

  return (
    <EditProjectModalContent
      key={project.id}
      project={project}
      onClose={onClose}
      onSave={onSave}
    />
  )
}

function EditProjectModalContent({
  project,
  onClose,
  onSave,
}: {
  project: Project
  onClose: () => void
  onSave: (id: string, payload: UpdateProjectPayload) => Promise<void>
}) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [startDate, setStartDate] = useState(project.startDate)
  const [endDate, setEndDate] = useState(project.endDate)
  const [leadName, setLeadName] = useState(project.leadName || 'Nguyễn Minh Quân (Bạn)')
  const [status, setStatus] = useState<ProjectStatus>(project.status)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Tên dự án không được để trống.')
      return
    }

    try {
      setIsLoading(true)
      await onSave(project.id, {
        name: name.trim(),
        description: description.trim(),
        startDate,
        endDate,
        leadName,
        status,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi cập nhật dự án.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-project-title"
        className="relative z-10 w-full max-w-xl bg-whiteboard rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <h3
              id="edit-project-title"
              className="text-body-large font-bold text-neutral-900 tracking-tight"
            >
              Chỉnh sửa dự án
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold text-neutral-600 bg-neutral-100 border border-neutral-200">
              {project.code}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-body-xs flex items-center gap-2">
              <Icon name="alert-circle" size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Tên dự án & Mã dự án (Key) */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="editProjectName" className="block text-body-xs font-semibold text-neutral-800 mb-1.5">
                Tên dự án <span className="text-danger-500">*</span>
              </label>
              <input
                id="editProjectName"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) setError(null)
                }}
                className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-body-sm text-neutral-900"
                autoFocus
              />
            </div>
            <div className="w-36">
              <div className="flex items-center justify-between text-body-xs mb-1.5">
                <span className="font-semibold text-neutral-800">Mã dự án (Key)</span>
                <Icon name="lock" size={12} className="text-neutral-400" />
              </div>
              <input
                type="text"
                value={project.code}
                disabled
                className="w-full px-3.5 py-2 rounded-lg border border-neutral-200 bg-paper-100 text-body-sm font-semibold text-neutral-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Row 2: Mô tả dự án */}
          <div>
            <div className="flex items-center justify-between text-body-xs mb-1.5">
              <label htmlFor="editProjectDesc" className="font-semibold text-neutral-800">
                Mô tả dự án
              </label>
              <span className="text-neutral-400 text-body-xs">Tùy chọn</span>
            </div>
            <textarea
              id="editProjectDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-body-sm text-neutral-900 resize-none leading-relaxed"
            />
          </div>

          {/* Row 3: Ngày bắt đầu & Ngày kết thúc dự kiến */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="editStartDate" className="block text-body-xs font-semibold text-neutral-800 mb-1.5">
                Ngày bắt đầu
              </label>
              <div className="relative">
                <input
                  id="editStartDate"
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2 rounded-lg border border-neutral-300 text-body-sm text-neutral-900 focus:outline-none focus:border-primary-500"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
                  <Icon name="calendar" size={15} />
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="editEndDate" className="block text-body-xs font-semibold text-neutral-800 mb-1.5">
                Ngày kết thúc dự kiến
              </label>
              <div className="relative">
                <input
                  id="editEndDate"
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2 rounded-lg border border-neutral-300 text-body-sm text-neutral-900 focus:outline-none focus:border-primary-500"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
                  <Icon name="calendar" size={15} />
                </span>
              </div>
            </div>
          </div>

          {/* Row 4: Quản lý dự án & Trạng thái hoạt động */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-xs font-semibold text-neutral-800 mb-1.5">
                Quản lý dự án (Project Lead)
              </label>
              <div className="relative">
                <select
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 bg-whiteboard text-body-sm text-neutral-900 focus:outline-none focus:border-primary-500 cursor-pointer"
                >
                  <option value="Nguyễn Minh Quân (Bạn)">Nguyễn Minh Quân (Bạn)</option>
                  <option value="Anh Khoa (Tech Lead)">Anh Khoa (Tech Lead)</option>
                  <option value="Mai Linh (Scrum Master)">Mai Linh (Scrum Master)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-body-xs font-semibold text-neutral-800 mb-1.5">
                Trạng thái hoạt động
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 bg-whiteboard text-body-sm text-neutral-900 focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="active">Đang thực hiện</option>
                <option value="closed">Đã đóng / Lưu trữ</option>
              </select>
            </div>
          </div>

          <p className="text-[12px] text-neutral-500 flex items-center gap-1.5">
            <span>ⓘ</span>
            <span>Thay đổi thông tin sẽ được thông báo đến tất cả thành viên trong dự án.</span>
          </p>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-body-sm font-medium text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-whiteboard rounded-lg text-body-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Icon name="check" size={15} />
              <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
