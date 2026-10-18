import { useState } from 'react'
import type { Sprint } from '../types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'

interface CloseSprintModalProps {
  isOpen: boolean
  onClose: () => void
  sprint: Sprint
  availableNextSprints?: Sprint[]
  onConfirm: (resolution: 'backlog' | 'next_sprint', nextSprintId?: string) => Promise<void>
}

export function CloseSprintModal({
  isOpen,
  onClose,
  sprint,
  availableNextSprints = [],
  onConfirm,
}: CloseSprintModalProps) {
  const [resolution, setResolution] = useState<'backlog' | 'next_sprint'>('backlog')
  const defaultNextSprintId = availableNextSprints[0]?.id || ''
  const [nextSprintId, setNextSprintId] = useState<string>(defaultNextSprintId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const incompleteItems = sprint.items.filter((item) => item.status !== 'done')
  const incompleteSP = incompleteItems.reduce((acc, item) => acc + item.storyPoints, 0)
  const completedSP = sprint.completedSP
  const totalSP = sprint.totalSP || 1
  const progressPercent = Math.round((completedSP / totalSP) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onConfirm(resolution, resolution === 'next_sprint' ? nextSprintId : undefined)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Đóng ${sprint.name}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark -mt-2">
          Tổng kết Sprint & Xử lý các hạng mục chưa hoàn thành
        </p>
        {/* Sprint Performance Summary Card */}
        <div className="rounded-xl border border-border-light bg-neutral-50/70 p-4 space-y-3 dark:border-border-dark dark:bg-neutral-900/50">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-text-secondary-light dark:text-text-secondary-dark">
              Tiến độ hoàn thành
            </span>
            <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
              {progressPercent}% ({completedSP}/{totalSP} SP)
            </span>
          </div>

          <ProgressBar value={progressPercent} variant="primary" />

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-2xs border border-border-light dark:bg-neutral-800 dark:border-border-dark">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Số thẻ hoàn thành
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {sprint.completedItemsCount}/{sprint.totalItemsCount} thẻ
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-2xs border border-border-light dark:bg-neutral-800 dark:border-border-dark">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Thẻ chưa xong
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {incompleteItems.length} thẻ ({incompleteSP} SP)
              </span>
            </div>
          </div>
        </div>

        {/* Incomplete Items Handling */}
        {incompleteItems.length > 0 && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
              Xử lý {incompleteItems.length} thẻ chưa hoàn thành ({incompleteSP} SP)
            </label>

            {/* Incomplete Items List Preview */}
            <div className="max-h-36 overflow-y-auto rounded-lg border border-border-light bg-white p-2 divide-y divide-border-light/60 dark:border-border-dark dark:bg-neutral-800 dark:divide-border-dark/60">
              {incompleteItems.map((item) => (
                <div key={item.id} className="py-2 px-1.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-mono font-medium text-primary-600 dark:text-primary-400">
                      {item.code}
                    </span>
                    <span className="truncate text-text-primary-light dark:text-text-primary-dark">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={item.status === 'in_progress' ? 'warning' : 'neutral'}>
                      {item.status === 'in_progress' ? 'Đang xử lý' : item.status === 'review' ? 'Đang review' : 'Sẵn sàng'}
                    </Badge>
                    <span className="font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                      {item.storyPoints} SP
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Resolution Options */}
            <div className="space-y-2 pt-1">
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  resolution === 'backlog'
                    ? 'border-primary-500 bg-primary-50/40 dark:border-primary-400 dark:bg-primary-950/20'
                    : 'border-border-light bg-white hover:bg-neutral-50 dark:border-border-dark dark:bg-neutral-800/60 dark:hover:bg-neutral-800'
                }`}
              >
                <input
                  type="radio"
                  name="resolution"
                  value="backlog"
                  checked={resolution === 'backlog'}
                  onChange={() => setResolution('backlog')}
                  className="mt-0.5 text-primary-600 focus:ring-primary-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-1.5">
                    Chuyển về Product Backlog chung
                    <Badge variant="primary">Khuyến nghị</Badge>
                  </div>
                  <p className="mt-0.5 text-text-secondary-light dark:text-text-secondary-dark">
                    Các thẻ này sẽ quay về danh sách Backlog với độ ưu tiên giữ nguyên để PO sắp xếp lại trong lần lập kế hoạch sau.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  resolution === 'next_sprint'
                    ? 'border-primary-500 bg-primary-50/40 dark:border-primary-400 dark:bg-primary-950/20'
                    : 'border-border-light bg-white hover:bg-neutral-50 dark:border-border-dark dark:bg-neutral-800/60 dark:hover:bg-neutral-800'
                }`}
              >
                <input
                  type="radio"
                  name="resolution"
                  value="next_sprint"
                  checked={resolution === 'next_sprint'}
                  onChange={() => setResolution('next_sprint')}
                  className="mt-0.5 text-primary-600 focus:ring-primary-500"
                />
                <div className="text-xs flex-1">
                  <div className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                    Chuyển sang Sprint tiếp theo
                  </div>
                  <p className="mt-0.5 text-text-secondary-light dark:text-text-secondary-dark">
                    Tự động cam kết vào Sprint tiếp theo đang ở trạng thái Đã lên kế hoạch.
                  </p>

                  {resolution === 'next_sprint' && (
                    <div className="mt-2">
                      <select
                        value={nextSprintId}
                        onChange={(e) => setNextSprintId(e.target.value)}
                        className="w-full text-xs rounded-md border border-border-light bg-white px-2.5 py-1.5 text-text-primary-light focus:outline-hidden focus:ring-2 focus:ring-primary-500 dark:border-border-dark dark:bg-neutral-900 dark:text-text-primary-dark"
                      >
                        {availableNextSprints.length === 0 ? (
                          <option value="">Không có Sprint kế tiếp (Tạo Sprint mới sau)</option>
                        ) : (
                          availableNextSprints.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.startDate} - {s.endDate})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-light dark:border-border-dark">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            leftIcon={<Icon name="check-circle" size={16} />}
          >
            {isSubmitting ? 'Đang đóng...' : 'Xác nhận Đóng Sprint'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
