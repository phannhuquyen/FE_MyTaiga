import { useState } from 'react'
import { Modal, Icon } from '@/components/ui'

interface ConfigAlertModalProps {
  isOpen: boolean
  onClose: () => void
  currentLimit: number
  onSave: (newLimit: number) => void
}

export function ConfigAlertModal({
  isOpen,
  onClose,
  currentLimit,
  onSave,
}: ConfigAlertModalProps) {
  const [limit, setLimit] = useState(currentLimit)
  const [slaDays, setSlaDays] = useState(5.0)

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(limit)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <form onSubmit={handleSave} className="p-6">
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 flex items-center justify-center">
              <Icon name="sliders" size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Cấu hình ngưỡng cảnh báo luồng
              </h3>
              <p className="text-xs text-neutral-500">
                Thiết lập ngưỡng WIP trần và chỉ số SLA để tự động kích hoạt cảnh báo bottleneck
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="space-y-4 py-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Ngưỡng WIP trần toàn dự án (thẻ)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 1)}
              className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Định mức khuyến nghị: &le; 8 thẻ cho nhóm 5 người.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Ngưỡng rủi ro SLA Work Item Age (ngày)
            </label>
            <input
              type="number"
              step="0.5"
              min={1}
              max={30}
              value={slaDays}
              onChange={(e) => setSlaDays(Number(e.target.value) || 1)}
              className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Các thẻ dở dang vượt quá số ngày này sẽ được gán cờ rủi ro SLA.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-xs transition-colors"
          >
            Lưu thiết lập
          </button>
        </div>
      </form>
    </Modal>
  )
}
