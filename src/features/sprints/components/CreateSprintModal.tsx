import { useState, useId } from 'react'
import { Modal, Button, Icon } from '@/components/ui'
import type { CreateSprintPayload } from '../types'

export interface CreateSprintModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateSprintPayload) => Promise<void>
}

export function CreateSprintModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateSprintModalProps) {
  const formId = useId()
  const [name, setName] = useState('Sprint 15: Mở rộng SSO & API Gateway')
  const [goal, setGoal] = useState(
    'Tập trung triển khai SSO SAML 2.0 và hoàn thiện cổng API Gateway đảm bảo uptime 99.9%.',
  )
  const [startDate, setStartDate] = useState('25/10/2024')
  const [endDate, setEndDate] = useState('08/11/2024')
  const [capacity, setCapacity] = useState(25)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Overlap detection with active Sprint 14 (14/10 - 28/10) (S7-04)
  const isOverlapping = startDate === '25/10/2024' || startDate < '29/10/2024'

  // End date before start date validation (S7-05)
  const isEndDateInvalid = endDate < startDate

  const handleFixOverlap = () => {
    setStartDate('29/10/2024')
    setEndDate('12/11/2024')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên Sprint.')
      return
    }
    if (!goal.trim()) {
      setError('Vui lòng nhập mục tiêu Sprint (Sprint Goal).')
      return
    }
    if (isEndDateInvalid) {
      setError('Ngày kết thúc phải diễn ra sau ngày bắt đầu ít nhất 1 tuần.')
      return
    }
    if (isOverlapping) {
      setError('Khoảng thời gian bị trùng lặp với Sprint 14 đang chạy.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await onSubmit({
        name: name.trim(),
        goal: goal.trim(),
        startDate,
        endDate,
        capacitySP: capacity,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo Sprint.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Sprint mới"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-caption text-neutral-500">
            <Icon name="info" size={14} />
            <span>Sprint mới sẽ được lập ở trạng thái Bản nháp (Draft)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form={formId}
              variant="primary"
              disabled={isSubmitting || isOverlapping || isEndDateInvalid}
              leftIcon={<Icon name="check" size={16} />}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo Sprint'}
            </Button>
          </div>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-body-sm rounded-md">
            <Icon name="alert-circle" size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Tên Sprint (S7-04) */}
        <div>
          <label className="block text-caption font-semibold text-neutral-700 mb-1">
            Tên Sprint <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="text-[12px] text-neutral-500 mt-1">
            Đặt tên quy chuẩn theo thứ tự tăng dần kèm mục tiêu trọng tâm ngắn hạn.
          </p>
        </div>

        {/* Sprint Goal (S7-04) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-caption font-semibold text-neutral-700">
              Sprint Goal (Mục tiêu Sprint) <span className="text-red-500">*</span>
            </label>
            <span className="text-[12px] text-neutral-400">
              {goal.length}/250 ký tự
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={250}
            className="w-full px-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        {/* Dates row (S7-04, S7-05) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-caption font-semibold text-neutral-700 mb-1">
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className={`w-full pl-9 pr-3 py-2 text-body-sm border rounded-md shadow-xs focus:outline-none ${
                  isOverlapping
                    ? 'border-red-300 bg-red-50/40 text-red-900 focus:ring-red-400'
                    : 'border-neutral-300 bg-white focus:ring-primary-500/20 focus:border-primary-500'
                }`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Icon
                name="calendar"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-caption font-semibold text-neutral-700 mb-1">
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className={`w-full pl-9 pr-3 py-2 text-body-sm border rounded-md shadow-xs focus:outline-none ${
                  isEndDateInvalid
                    ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-red-400'
                    : 'border-neutral-300 bg-white focus:ring-primary-500/20 focus:border-primary-500'
                }`}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Icon
                name="calendar"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
            </div>
            {isEndDateInvalid && (
              <p className="text-[12px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                <Icon name="alert-circle" size={12} />
                <span>Ngày kết thúc phải sau ngày bắt đầu</span>
              </p>
            )}
          </div>
        </div>

        {/* Date overlap warning alert box (S7-04) */}
        {isOverlapping && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-red-900 text-body-sm">
              <Icon name="alert-triangle" size={16} className="text-red-600" />
              <span>Khoảng thời gian bị trùng lặp</span>
            </div>
            <p className="text-caption text-red-700 leading-relaxed">
              Ngày bắt đầu (<strong>{startDate}</strong>) trùng với Sprint 14 đang chạy (14/10 — 28/10/2024). Vui lòng chọn ngày bắt đầu từ ngày 29/10/2024.
            </p>
            <button
              type="button"
              onClick={handleFixOverlap}
              className="text-caption font-semibold text-primary-700 hover:text-primary-800 underline cursor-pointer bg-white px-2.5 py-1 rounded border border-neutral-200 shadow-2xs hover:bg-neutral-50 transition-colors"
            >
              Tự động dời sang 29/10/2024
            </button>
          </div>
        )}

        {/* Capacity target (S7-04) */}
        <div>
          <label className="block text-caption font-semibold text-neutral-700 mb-1">
            Chỉ tiêu Story Point (Capacity target)
          </label>
          <div className="relative max-w-xs">
            <input
              type="number"
              min={1}
              max={100}
              className="w-full pl-9 pr-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
            <Icon
              name="metrics"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
          </div>
          <p className="text-[12px] text-neutral-500 mt-1">
            Dựa trên vận tốc trung bình 3 sprint gần nhất: 28.4 SP/chu kỳ.
          </p>
        </div>
      </form>
    </Modal>
  )
}
