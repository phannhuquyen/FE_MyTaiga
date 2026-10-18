import { useState, useId } from 'react'
import type { KanbanColumnConfig, WIPSettingsPayload } from '../types'
import { Modal, Button, Icon } from '@/components/ui'

export interface WIPConfigModalProps {
  isOpen: boolean
  onClose: () => void
  columns: KanbanColumnConfig[]
  currentCounts: Record<string, number>
  onSave: (payload: WIPSettingsPayload) => Promise<void>
}

export function WIPConfigModal({
  isOpen,
  onClose,
  columns,
  currentCounts,
  onSave,
}: WIPConfigModalProps) {
  const formId = useId()
  const [limits, setLimits] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    columns.forEach((c) => {
      init[c.id] = c.wipLimit !== null ? String(c.wipLimit) : ''
    })
    return init
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLimitChange = (colId: string, val: string) => {
    setLimits((prev) => ({ ...prev, [colId]: val }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validation: if specified, must be positive integer (S8-13)
    for (const [colId, val] of Object.entries(limits)) {
      if (val.trim() !== '') {
        const num = Number(val)
        if (!Number.isInteger(num) || num <= 0) {
          setError(`Giới hạn WIP cho cột ${colId} phải là số nguyên dương lớn hơn 0.`)
          return
        }
      }
    }

    const payload: WIPSettingsPayload = {
      limits: {
        todo: limits.todo ? Number(limits.todo) : null,
        in_progress: limits.in_progress ? Number(limits.in_progress) : null,
        review: limits.review ? Number(limits.review) : null,
        done: limits.done ? Number(limits.done) : null,
      },
    }

    setIsSubmitting(true)
    try {
      await onSave(payload)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi lưu cấu hình WIP')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu hình Giới hạn WIP (WIP Limits)"
      maxWidth="lg"
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        {/* Header note with icon */}
        <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600">
          <div className="p-1.5 bg-primary-50 text-primary-600 rounded">
            <Icon name="sliders" size={16} />
          </div>
          <div>
            <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
              <span>Kiểm soát số lượng công việc đang xử lý đồng thời</span>
              <span className="text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-medium">
                Quản lý
              </span>
            </div>
            <p className="mt-0.5">
              Áp dụng lý thuyết dòng chảy (Flow) để tránh quá tải nhóm và phát hiện sớm các điểm tắc nghẽn.
            </p>
          </div>
        </div>

        {/* Validation Error Banner (S8-13) */}
        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-danger-50 border border-danger-200 text-danger-700 rounded-md text-xs">
            <Icon name="alert-triangle" size={14} className="shrink-0 text-danger-500" />
            <span>{error}</span>
          </div>
        )}

        {/* WIP Table (S8-10) */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
                <th className="py-2.5 px-3">Cột Kanban</th>
                <th className="py-2.5 px-3 w-24">Hiện tại</th>
                <th className="py-2.5 px-3 w-36">Giới hạn tối đa</th>
                <th className="py-2.5 px-3 w-36">Mức sử dụng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {columns.map((col) => {
                const current = currentCounts[col.id] || 0
                const rawLimit = limits[col.id]
                const limitNum = rawLimit ? Number(rawLimit) : null
                const isOver = limitNum !== null && current > limitNum
                const percent = limitNum ? Math.min(Math.round((current / limitNum) * 100), 100) : 0

                return (
                  <tr key={col.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${col.colorDot}`} />
                        <div>
                          <div className="font-semibold text-neutral-800">{col.title}</div>
                          <div className="text-[11px] text-neutral-400">{col.subtitleEn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-neutral-700">
                      {current} thẻ
                    </td>
                    <td className="py-3 px-3">
                      {col.id === 'done' ? (
                        <span className="text-neutral-400 italic text-[11px]">Không áp dụng</span>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={limits[col.id] || ''}
                            onChange={(e) => handleLimitChange(col.id, e.target.value)}
                            placeholder="∞ Không giới hạn"
                            className="w-full text-xs py-1.5 px-2.5 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium text-neutral-800 placeholder:text-neutral-400"
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {col.id === 'done' ? (
                        <span className="text-neutral-400 italic text-[11px]">—</span>
                      ) : limitNum === null ? (
                        <div className="text-[11px] text-primary-600 font-medium">
                          {current} / ∞ (An toàn)
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className={isOver ? 'text-danger-600 font-bold' : 'text-neutral-700 font-medium'}>
                              {current} / {limitNum} {isOver ? '(Vượt WIP)' : percent === 100 ? '(Đầy)' : `(${percent}%)`}
                            </span>
                          </div>
                          <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isOver ? 'bg-danger-500' : percent === 100 ? 'bg-amber-500' : 'bg-primary-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Tip hint */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 p-2.5 rounded border border-neutral-200">
          <Icon name="info" size={14} className="text-neutral-400 shrink-0" />
          <span>Để trống ô nhập số nếu muốn gỡ bỏ giới hạn WIP cho cột tương ứng.</span>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
          <span className="text-[11px] text-neutral-400">
            Thay đổi có hiệu lực ngay lập tức cho toàn đội ngũ
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              leftIcon={<Icon name="check" size={14} />}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu cấu hình'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
