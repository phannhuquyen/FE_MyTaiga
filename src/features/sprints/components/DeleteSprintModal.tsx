import { useState } from 'react'
import type { Sprint } from '../types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

interface DeleteSprintModalProps {
  isOpen: boolean
  onClose: () => void
  sprint: Sprint
  onConfirm: () => Promise<void>
}

export function DeleteSprintModal({
  isOpen,
  onClose,
  sprint,
  onConfirm,
}: DeleteSprintModalProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirmed) return
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa Sprint"
      maxWidth="md"
    >
      <div className="space-y-4">
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark -mt-2">
          Hành động này không thể hoàn tác
        </p>
        {/* Warning banner */}
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <div className="text-red-600 dark:text-red-400 shrink-0 mt-0.5">
            <Icon name="alert-triangle" size={20} />
          </div>
          <div className="text-xs text-red-800 dark:text-red-300 space-y-1">
            <p className="font-semibold text-sm">
              Bạn đang chuẩn bị xóa <span className="font-bold underline">{sprint.name}</span>
            </p>
            <p>
              Hãy kiểm tra kỹ các hạng mục công việc bên dưới trước khi xác nhận thao tác xóa.
            </p>
          </div>
        </div>

        {/* Safety Impact Explanation */}
        <div className="space-y-2.5 rounded-lg border border-border-light bg-neutral-50/60 p-3.5 text-xs text-text-secondary-light dark:border-border-dark dark:bg-neutral-900/40 dark:text-text-secondary-dark">
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
            <div>
              <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                Dữ liệu PBI an toàn:
              </span>{' '}
              Tất cả {sprint.totalItemsCount} User Stories & Nhiệm vụ ({sprint.totalSP} SP) trong Sprint này sẽ được tự động hoàn trả về Product Backlog với trạng thái ban đầu, không bị mất dữ liệu.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">!</span>
            <div>
              <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                Lịch sử burndown & velocity:
              </span>{' '}
              Các chỉ số vận hành và chuỗi dữ liệu Burndown gắn liền với Sprint này sẽ bị xóa khỏi báo cáo chung của dự án.
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 rounded border-border-light text-red-600 focus:ring-red-500"
          />
          <span className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
            Tôi hiểu rằng các nhiệm vụ sẽ được chuyển về Backlog và dữ liệu báo cáo Sprint sẽ bị xóa vĩnh viễn.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-light dark:border-border-dark">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={!confirmed || isDeleting}
            onClick={handleDelete}
            leftIcon={<Icon name="trash" size={16} />}
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận Xóa Sprint'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
