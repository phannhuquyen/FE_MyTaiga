import { useState } from 'react'
import { Modal, Icon } from '@/components/ui'
import type { BugItem, ResolutionReason, CloseBugPayload } from '../types'

interface CloseBugModalProps {
  isOpen: boolean
  bug: BugItem | null
  onClose: () => void
  onConfirm: (payload: CloseBugPayload) => Promise<void>
}

export function CloseBugModal({ isOpen, bug, onClose, onConfirm }: CloseBugModalProps) {
  const [resolutionReason, setResolutionReason] = useState<ResolutionReason>('resolved_verified')
  const [resolutionNote, setResolutionNote] = useState(
    'Đã tích hợp Vector Clock và kiểm thử tự động k6 với 500 connections.',
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !bug) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await onConfirm({
        resolutionReason,
        resolutionNote: resolutionNote.trim() || undefined,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const options: Array<{ id: ResolutionReason; label: string; sublabel?: string }> = [
    {
      id: 'resolved_verified',
      label: 'Đã khắc phục & nghiệm thu',
    },
    {
      id: 'cannot_reproduce',
      label: 'Không thể tái hiện lỗi',
      sublabel: 'Cannot Reproduce',
    },
    {
      id: 'duplicate',
      label: 'Lỗi trùng lặp',
      sublabel: 'Duplicate',
    },
    {
      id: 'as_designed',
      label: 'Không phải lỗi kỹ thuật',
      sublabel: 'As Designed',
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <form onSubmit={handleSubmit} className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 flex items-center justify-center shrink-0">
            <Icon name="shield" size={22} />
          </div>
          <div>
            <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-0.5">
              Quy trình đóng lỗi • {bug.code}
            </div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Xác nhận đóng lỗi {bug.code}?
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
              Lỗi &ldquo;{bug.title}&rdquo; đã được QA thẩm định đạt chuẩn chất lượng.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Lý do giải quyết <span className="text-danger-500">*</span>
            </label>
            <div className="space-y-2">
              {options.map((opt) => {
                const isSelected = resolutionReason === opt.id
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 text-primary-900 dark:text-primary-100 font-medium'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="resolutionReason"
                        checked={isSelected}
                        onChange={() => setResolutionReason(opt.id)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span>{opt.label}</span>
                    </div>
                    {opt.sublabel && (
                      <span className="text-xs text-neutral-400">{opt.sublabel}</span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Ghi chú giải pháp
              </label>
              <span className="text-xs text-neutral-400">Không bắt buộc</span>
            </div>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Ghi nhận phương pháp sửa lỗi, PR liên quan hoặc lý do đóng..."
              className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
            />
            <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
              <Icon name="info" size={13} />
              Ghi chú này sẽ được đồng bộ lên nhật ký Sprint Retrospective.
            </p>
          </div>

          {/* Cycle Time pill card */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
              <Icon name="clock" size={16} className="text-primary-600" />
              <span>Thời gian chu kỳ (Cycle Time):</span>
            </div>
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
              {bug.cycleTimeDisplay || '1 ngày 4 giờ (Nhanh hơn 35%)'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-xs text-neutral-400 flex items-center gap-1.5">
            <Icon name="lock" size={14} />
            <span>Thao tác sẽ khóa chỉnh sửa thẻ</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Icon name="check" size={16} />
              {isSubmitting ? 'Đang đóng...' : 'Xác nhận đóng Bug'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
