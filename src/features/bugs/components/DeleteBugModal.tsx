import { useState } from 'react'
import { Modal, Icon } from '@/components/ui'
import type { BugItem } from '../types'

interface DeleteBugModalProps {
  isOpen: boolean
  bug: BugItem | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteBugModal({ isOpen, bug, onClose, onConfirm }: DeleteBugModalProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen || !bug) return null

  const handleDelete = async () => {
    if (!confirmed) return
    try {
      setIsDeleting(true)
      await onConfirm()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3.5 pb-4">
          <div className="w-10 h-10 rounded-xl bg-danger-50 dark:bg-danger-950 text-danger-600 flex items-center justify-center shrink-0">
            <Icon name="alert-triangle" size={22} />
          </div>
          <div>
            <div className="text-xs font-semibold text-danger-600 dark:text-danger-400 mb-0.5">
              Hành động nguy hiểm • ID: {bug.code}
            </div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Xóa vĩnh viễn lỗi {bug.code}?
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 py-2">
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Hành động này sẽ xóa hoàn toàn báo cáo lỗi &ldquo;
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {bug.title}
            </span>
            &rdquo;, bao gồm toàn bộ nhật ký trao đổi, {bug.attachments.length} tệp đính kèm và lịch sử
            kiểm thử liên quan.
          </p>

          <div className="p-3.5 bg-danger-50 dark:bg-danger-950/50 border border-danger-200 dark:border-danger-800 rounded-xl text-xs space-y-1">
            <div className="font-bold text-danger-700 dark:text-danger-400 flex items-center gap-1.5">
              <Icon name="alert-circle" size={15} />
              Cảnh báo: Hành động này không thể hoàn tác
            </div>
            <p className="text-danger-600 dark:text-danger-400/90 leading-relaxed pl-5">
              Các liên kết với nhiệm vụ {bug.relatedTaskCode || '#TASK-239'} sẽ bị ngắt kết nối và
              các chỉ số Flow Metrics của {bug.sprintName || 'Sprint 14'} sẽ được tính toán lại.
            </p>
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 text-danger-600 focus:ring-danger-500 rounded"
            />
            <span className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Tôi hiểu rằng báo cáo lỗi này sẽ bị xóa khỏi dự án ScrumBan Core Platform và không có
              cách nào khôi phục.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={!confirmed || isDeleting}
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-semibold text-white bg-danger-600 hover:bg-danger-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Icon name="trash" size={16} />
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa Bug'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
