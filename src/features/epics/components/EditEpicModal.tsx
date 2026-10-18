import { useState } from 'react'
import { Modal, Button, Icon } from '@/components/ui'
import type { Epic, UpdateEpicPayload, EpicPriority, EpicStatus } from '../types'

export interface EditEpicModalProps {
  isOpen: boolean
  epic: Epic | null
  onClose: () => void
  onSubmit: (id: string, payload: UpdateEpicPayload) => Promise<void>
}

const COLOR_PALETTE = [
  { hex: '#0284c7', name: 'Màu ngọc biển' },
  { hex: '#2563eb', name: 'Xanh lam đậm' },
  { hex: '#d97706', name: 'Hổ phách' },
  { hex: '#dc2626', name: 'Đỏ cảnh báo' },
  { hex: '#076859', name: 'Xanh lục Taiga' },
  { hex: '#64748b', name: 'Xám ghi' },
]

interface EditEpicFormProps {
  epic: Epic
  onClose: () => void
  onSubmit: (id: string, payload: UpdateEpicPayload) => Promise<void>
}

function EditEpicForm({ epic, onClose, onSubmit }: EditEpicFormProps) {
  const [name, setName] = useState(epic.name)
  const [description, setDescription] = useState(epic.description)
  const [priority, setPriority] = useState<EpicPriority>(epic.priority)
  const [status, setStatus] = useState<EpicStatus>(epic.status)
  const [selectedColor, setSelectedColor] = useState(epic.color)
  const [targetSprint, setTargetSprint] = useState(epic.targetSprint || '')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên Epic.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await onSubmit(epic.id, {
        name: name.trim(),
        description: description.trim(),
        priority,
        status,
        color: selectedColor,
        targetSprint: targetSprint.trim() || undefined,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Chỉnh sửa Epic [${epic.code}]`}
      maxWidth="lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            leftIcon={<Icon name="check" size={16} />}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-body-sm rounded-md">
            <Icon name="alert-circle" size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-caption font-semibold text-neutral-700 mb-1">
            Tên Epic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
          />
        </div>

        <div>
          <label className="block text-caption font-semibold text-neutral-700 mb-1">
            Mô tả sáng kiến chiến lược
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-caption font-semibold text-neutral-700 mb-1">
              Trạng thái
            </label>
            <select
              className="w-full px-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
              value={status}
              onChange={(e) => setStatus(e.target.value as EpicStatus)}
            >
              <option value="open">Đang mở (Open)</option>
              <option value="in_progress">Đang làm (In Progress)</option>
              <option value="completed">Đã hoàn thành (Done)</option>
              <option value="closed">Đã đóng (Closed)</option>
            </select>
          </div>

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
              Sprint mục tiêu
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="Ví dụ: Sprint 16 (Q3/2025)"
              value={targetSprint}
              onChange={(e) => setTargetSprint(e.target.value)}
            />
          </div>
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
      </form>
    </Modal>
  )
}

export function EditEpicModal({
  isOpen,
  epic,
  onClose,
  onSubmit,
}: EditEpicModalProps) {
  if (!isOpen || !epic) return null

  return (
    <EditEpicForm
      key={epic.id}
      epic={epic}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
