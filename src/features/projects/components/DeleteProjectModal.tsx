import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { Project } from '../types'

export interface DeleteProjectModalProps {
  isOpen: boolean
  project: Project | null
  onClose: () => void
  onConfirmDelete: (id: string) => Promise<void>
  onSwitchToCloseProject: (id: string) => Promise<void>
}

export function DeleteProjectModal({
  isOpen,
  project,
  onClose,
  onConfirmDelete,
  onSwitchToCloseProject,
}: DeleteProjectModalProps) {
  if (!isOpen || !project) return null

  return (
    <DeleteProjectModalContent
      key={project.id}
      project={project}
      onClose={onClose}
      onConfirmDelete={onConfirmDelete}
      onSwitchToCloseProject={onSwitchToCloseProject}
    />
  )
}

function DeleteProjectModalContent({
  project,
  onClose,
  onConfirmDelete,
  onSwitchToCloseProject,
}: {
  project: Project
  onClose: () => void
  onConfirmDelete: (id: string) => Promise<void>
  onSwitchToCloseProject: (id: string) => Promise<void>
}) {
  const [typedName, setTypedName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isMatched = typedName.trim() === project.name.trim()

  const handleDelete = async () => {
    if (!isMatched) return
    try {
      setIsDeleting(true)
      await onConfirmDelete(project.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi xóa dự án.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseProject = async () => {
    try {
      await onSwitchToCloseProject(project.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi đóng dự án.')
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
        aria-labelledby="delete-project-title"
        className="relative z-10 w-full max-w-lg bg-whiteboard rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-danger-50 text-danger-600 flex items-center justify-center shrink-0 border border-danger-200/60">
              <Icon name="trash" size={20} />
            </div>
            <div>
              <span className="block text-[11px] font-bold tracking-wider text-danger-600 uppercase mb-0.5">
                HÀNH ĐỘNG NGUY HIỂM
              </span>
              <h3
                id="delete-project-title"
                className="text-body-large font-bold text-neutral-900 tracking-tight"
              >
                Xóa dự án {project.name}?
              </h3>
            </div>
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

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-body-xs flex items-center gap-2">
              <Icon name="alert-circle" size={16} />
              <span>{error}</span>
            </div>
          )}

          <p className="text-body-sm text-neutral-600 leading-relaxed">
            Hành động này <span className="text-danger-600 font-bold">không thể hoàn tác</span>. Toàn bộ Backlog, bảng Sprint, thẻ công việc và lịch sử trao đổi của dự án sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </p>

          {/* Archive Alternative Callout */}
          <div className="p-4 rounded-xl bg-paper-50 border border-neutral-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-body-xs font-bold text-neutral-800">
                <Icon name="folder" size={14} className="text-primary-600" />
                <span>Bạn chỉ muốn lưu trữ dự án?</span>
              </div>
              <button
                type="button"
                onClick={handleCloseProject}
                className="text-primary-600 hover:text-primary-700 font-semibold text-body-xs hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>Đóng dự án</span>
                <span>→</span>
              </button>
            </div>
            <p className="text-[12px] text-neutral-500 leading-snug">
              Đóng dự án sẽ chuyển toàn bộ thẻ sang chế độ chỉ đọc, ẩn khỏi thanh điều hướng chính nhưng vẫn giữ nguyên vẹn 100% dữ liệu lịch sử để tra cứu khi cần.
            </p>
          </div>

          {/* Typing confirmation input */}
          <div>
            <div className="flex items-center justify-between text-body-xs mb-1.5">
              <label htmlFor="confirmNameInput" className="font-semibold text-neutral-800">
                Nhập chính xác tên dự án để xác nhận:
              </label>
              <button
                type="button"
                onClick={() => setTypedName(project.name)}
                className="text-primary-600 hover:underline text-[11px] font-medium cursor-pointer"
              >
                Gõ mẫu
              </button>
            </div>

            {/* Target name guide badge */}
            <div className="px-3.5 py-2 rounded-lg bg-paper-100 border border-neutral-200 text-body-sm font-semibold text-neutral-800 mb-2 select-all">
              {project.name}
            </div>

            <div className="relative">
              <input
                id="confirmNameInput"
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Nhập lại tên dự án..."
                className={`w-full px-3.5 py-2 rounded-lg border text-body-sm focus:outline-none transition-colors ${
                  isMatched
                    ? 'border-success-500 bg-success-50/20 text-neutral-900 focus:ring-2 focus:ring-success-500/20'
                    : 'border-neutral-300 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20'
                }`}
                autoFocus
              />
              {isMatched && (
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-success-600 font-semibold text-body-xs gap-1">
                  <Icon name="check-circle" size={14} />
                  <span>Khớp</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-danger-600 mt-1.5 flex items-center gap-1">
              <span>ⓘ</span>
              <span>Tên dự án xác nhận sẽ kích hoạt xóa vĩnh viễn ngay lập tức.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-paper-50 border-t border-neutral-200">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Icon name="lock" size={13} />
            <span>Thao tác yêu cầu quyền Quản trị viên</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-neutral-300 rounded-lg text-body-sm font-medium text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isMatched || isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-danger-600 hover:bg-danger-700 text-whiteboard rounded-lg text-body-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="trash" size={14} />
              <span>{isDeleting ? 'Đang xóa...' : 'Xác nhận xóa dự án'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
