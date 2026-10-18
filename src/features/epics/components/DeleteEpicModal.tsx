import { useState } from 'react'
import { Modal, Button, Icon } from '@/components/ui'
import type { Epic } from '../types'

export interface DeleteEpicModalProps {
  isOpen: boolean
  epic: Epic | null
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
}

export function DeleteEpicModal({
  isOpen,
  epic,
  onClose,
  onConfirm,
}: DeleteEpicModalProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setAcknowledged(false)
    setError(null)
    onClose()
  }

  const handleDelete = async () => {
    if (!epic || !acknowledged) return

    try {
      setIsDeleting(true)
      setError(null)
      await onConfirm(epic.id)
      handleClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa Epic.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!epic) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Xác nhận xóa Epic"
      maxWidth="md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={!acknowledged || isDeleting}
            leftIcon={<Icon name="trash" size={16} />}
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-body-sm rounded-md">
            <Icon name="alert-circle" size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
            <Icon name="alert-triangle" size={20} />
          </div>
          <div>
            <p className="text-body-sm text-neutral-700">
              Bạn có chắc chắn muốn xóa Epic{' '}
              <span className="font-semibold text-neutral-900">
                [{epic.code}] {epic.name}
              </span>{' '}
              không?
            </p>
          </div>
        </div>

        {/* Safety Callout Box (S6-06) */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg text-body-sm text-amber-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-900">
            <Icon name="info" size={16} />
            <span>Tác động tới các hạng mục liên quan:</span>
          </div>
          <p className="text-caption text-amber-800 leading-relaxed">
            Các Backlog Items ({epic.pbisCount || 0} PBI) và Nhiệm vụ kỹ thuật ({epic.tasksCount || 0} Task) liên kết với Epic này sẽ <strong>KHÔNG</strong> bị xóa. Chúng sẽ được bảo toàn và chuyển về trạng thái <strong>Chưa phân loại Epic</strong>.
          </p>
        </div>

        {/* Checkbox confirmation */}
        <label className="flex items-center gap-2 text-body-sm text-neutral-700 cursor-pointer pt-1">
          <input
            type="checkbox"
            className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500 cursor-pointer"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          <span>Tôi hiểu rằng thao tác xóa Epic này không thể hoàn tác.</span>
        </label>
      </div>
    </Modal>
  )
}
