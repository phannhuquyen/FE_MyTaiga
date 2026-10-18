import { Icon } from '@/components/ui'
import type { PBI } from '../types'

interface DeletePBIModalProps {
  pbi: PBI | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
}

export function DeletePBIModal({ pbi, isOpen, onClose, onConfirm }: DeletePBIModalProps) {
  if (!isOpen || !pbi) return null

  const taskCount = pbi.subtasks.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-whiteboard rounded-xl shadow-2xl border border-neutral-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-pbi-title"
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
            <Icon name="alert-triangle" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold tracking-wider text-danger-700 uppercase">
              Cảnh báo dữ liệu Backlog
            </span>
            <h2 id="delete-pbi-title" className="text-body-lg font-bold text-neutral-900 mt-0.5">
              Xóa Product Backlog Item #{pbi.code}?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors cursor-pointer"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          <p className="text-body-sm text-neutral-600 leading-relaxed">
            Hành động này sẽ xóa vĩnh viễn PBI{' '}
            <strong className="text-neutral-900">"{pbi.title}"</strong> cùng{' '}
            <strong className="text-primary-700">{taskCount} Task kỹ thuật</strong> liên quan khỏi
            hệ thống. Không thể hoàn tác sau khi xác nhận.
          </p>

          {/* Impact Summary Table */}
          <div className="rounded-lg bg-paper-50 border border-neutral-200 divide-y divide-neutral-200 text-xs">
            <div className="p-2.5 flex items-center justify-between">
              <span className="text-neutral-500 flex items-center gap-1.5">
                <Icon name="refresh" size={14} />
                <span>Số điểm hoàn trả Backlog:</span>
              </span>
              <span className="font-bold text-neutral-900">{pbi.storyPoints} Story Points</span>
            </div>
            <div className="p-2.5 flex items-center justify-between">
              <span className="text-neutral-500 flex items-center gap-1.5">
                <Icon name="tag" size={14} />
                <span>Trạng thái hiện tại:</span>
              </span>
              <span className="font-semibold text-primary-700">
                {pbi.sprintName ? `Thuộc ${pbi.sprintName}` : 'Mới (Chưa đưa vào Sprint nào)'}
              </span>
            </div>
            <div className="p-2.5 flex items-center justify-between">
              <span className="text-neutral-500 flex items-center gap-1.5">
                <Icon name="shield" size={14} />
                <span>Điều kiện an toàn:</span>
              </span>
              <span className="font-semibold text-primary-700 flex items-center gap-1">
                <Icon name="check-circle" size={12} />
                <span>Đủ thẩm quyền xóa (Manager)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-paper-50 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-body-medium rounded-lg font-medium transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm(pbi.id)
              onClose()
            }}
            className="flex items-center gap-1.5 px-4.5 py-2 bg-danger-600 hover:bg-danger-700 text-whiteboard text-body-medium rounded-lg font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Icon name="trash" size={16} />
            <span>Xác nhận xóa PBI</span>
          </button>
        </div>
      </div>
    </div>
  )
}
