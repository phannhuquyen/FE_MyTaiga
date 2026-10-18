import { useState } from 'react'
import type { KanbanTask } from '../types'
import { Modal, Button, Icon } from '@/components/ui'

export interface DeleteTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: KanbanTask | null
  onConfirm: (id: string) => Promise<void>
}

export function DeleteTaskModal({
  isOpen,
  onClose,
  task,
  onConfirm,
}: DeleteTaskModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!task) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onConfirm(task.id)
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const subtaskCount = task.subtasks?.length || 0
  const attachmentCount = task.attachments?.length || 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Header with warning icon (S9-09) */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-danger-50 text-danger-600 rounded-lg shrink-0">
            <Icon name="trash" size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Xác nhận xóa Tác vụ #{task.code}?
            </h3>
            <p className="text-xs text-danger-600 font-semibold mt-0.5">
              Hành động không thể hoàn tác
            </p>
          </div>
        </div>

        {/* Warning text */}
        <p className="text-xs text-neutral-600 leading-relaxed">
          Hành động này sẽ xóa vĩnh viễn tác vụ{' '}
          <strong className="text-neutral-900 font-semibold">"{task.title}"</strong> cùng{' '}
          <strong className="text-neutral-900 font-semibold">{subtaskCount} nhiệm vụ con (Subtask)</strong>,{' '}
          <strong className="text-neutral-900 font-semibold">{attachmentCount} tệp đính kèm</strong> và toàn bộ lịch sử trao đổi. Dữ liệu không thể khôi phục.
        </p>

        {/* Task summary details box (S9-09) */}
        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-2">
          {task.pbiCode && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Thuộc PBI:</span>
              <span className="font-medium text-neutral-800">
                {task.pbiCode} {task.pbiTitle || ''}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Người thực hiện:</span>
            <div className="flex items-center gap-1.5 font-medium text-neutral-800">
              <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 text-[10px] flex items-center justify-center font-bold">
                {task.assignee.avatarCode}
              </span>
              <span>{task.assignee.name}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Trạng thái hiện tại:</span>
            <span className="font-semibold text-primary-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              {task.columnId === 'todo'
                ? 'Cần làm'
                : task.columnId === 'in_progress'
                ? 'Đang làm'
                : task.columnId === 'review'
                ? 'Đang kiểm tra'
                : 'Hoàn thành'}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={isDeleting}
            onClick={handleDelete}
            leftIcon={<Icon name="trash" size={14} />}
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa Tác vụ'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
