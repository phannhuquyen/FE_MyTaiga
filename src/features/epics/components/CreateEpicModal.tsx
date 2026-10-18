import { useState } from 'react'
import { Modal, Button, Icon } from '@/components/ui'
import type { CreateEpicPayload, EpicPriority } from '../types'

export interface CreateEpicModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateEpicPayload) => Promise<void>
}

const COLOR_PALETTE = [
  { hex: '#0284c7', name: 'Màu ngọc biển' },
  { hex: '#2563eb', name: 'Xanh lam đậm' },
  { hex: '#d97706', name: 'Hổ phách' },
  { hex: '#dc2626', name: 'Đỏ cảnh báo' },
  { hex: '#076859', name: 'Xanh lục Taiga' },
  { hex: '#64748b', name: 'Xám ghi' },
]

export function CreateEpicModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateEpicModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<EpicPriority>('high')
  const [selectedColor, setSelectedColor] = useState('#0284c7')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    setName('')
    setDescription('')
    setPriority('high')
    setSelectedColor('#0284c7')
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên Epic.')
      return
    }
    if (name.trim().length < 5) {
      setError('Tên Epic phải có ít nhất 5 ký tự.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        priority,
        color: selectedColor,
      })
      handleClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo Epic.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo Epic mới"
      maxWidth="lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            leftIcon={<Icon name="plus" size={16} />}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo Epic'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-body-sm text-neutral-500">
          Nhóm các yêu cầu sản phẩm (PBI) theo sáng kiến chiến lược cấp cao để theo dõi mục tiêu dài hạn.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-body-sm rounded-md">
            <Icon name="alert-circle" size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Tên Epic */}
        <div>
          <label className="block text-caption font-semibold text-neutral-700 mb-1">
            Tên Epic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            placeholder="Ví dụ: Cổng xác thực & Quản lý danh tính (IAM)..."
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
            autoFocus
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-caption font-semibold text-neutral-700 mb-1">
            Mô tả sáng kiến chiến lược
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            placeholder="Mô tả mục tiêu kinh doanh, phạm vi kiến trúc và kết quả then chốt (OKRs)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Mức độ ưu tiên & Màu sắc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-caption font-semibold text-neutral-700 mb-1">
              Mức độ ưu tiên
            </label>
            <select
              className="w-full px-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
              value={priority}
              onChange={(e) => setPriority(e.target.value as EpicPriority)}
            >
              <option value="urgent">Khẩn cấp (Urgent)</option>
              <option value="high">Cao (High)</option>
              <option value="medium">Trung bình (Medium)</option>
              <option value="low">Thấp (Low)</option>
            </select>
          </div>

          <div>
            <label className="block text-caption font-semibold text-neutral-700 mb-1">
              Màu sắc định danh
            </label>
            <div className="flex items-center gap-2 pt-1">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer border ${
                    selectedColor === c.hex
                      ? 'scale-110 ring-2 ring-offset-2 ring-primary-500 border-white'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                >
                  {selectedColor === c.hex && (
                    <Icon name="check" size={14} className="text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
