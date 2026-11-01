import { useState, useId } from 'react'
import { Modal, Button, Icon } from '@/components/ui'
import type { CreateSprintPayload } from '../types'
import { ProfileToast } from '@/features/profile/components/ProfileToast'
import { apiErrorMessage } from '@/lib/apiErrors'

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
  const [name, setName] = useState('')
  const [goal, setGoal] = useState(
    '',
  )
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [capacity, setCapacity] = useState(25)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEndDateInvalid = Boolean(startDate && endDate && endDate < startDate)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên Sprint.')
      return
    }
    if (isEndDateInvalid) {
      setError('Ngày kết thúc không được trước ngày bắt đầu.')
      return
    }
    if (!startDate || !endDate) { setError('Vui lòng chọn ngày bắt đầu và kết thúc.'); return }

    try {
      setIsSubmitting(true)
      setError(null)
      setNotice(null)
      await onSubmit({
        name: name.trim(),
        goal: goal.trim(),
        startDate,
        endDate,
        capacitySP: capacity,
      })
      onClose()
    } catch (err: unknown) {
      setNotice(apiErrorMessage(err, 'Không thể tạo Sprint. Vui lòng thử lại.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
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
              disabled={isSubmitting || !startDate || !endDate || isEndDateInvalid}
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
                type="date"
                aria-label="Ngày bắt đầu"
                className={`w-full pl-9 pr-3 py-2 text-body-sm border rounded-md shadow-xs focus:outline-none ${
                  'border-neutral-300 bg-white focus:ring-primary-500/20 focus:border-primary-500'
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
                type="date"
                aria-label="Ngày kết thúc"
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

        {/* Capacity target (S7-04) */}
        <div>
          <label className="block text-caption font-semibold text-neutral-700 mb-1">
            Chỉ tiêu Story Point (BE chưa hỗ trợ lưu)
          </label>
          <div className="relative max-w-xs">
            <input
              type="number"
              disabled title="Backend chưa có trường lưu capacity" min={1}
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
    <ProfileToast isVisible={Boolean(notice)} variant="error" message="Không thể tạo Sprint" description={notice || ''} duration={7000} onClose={() => setNotice(null)} />
    </>
  )
}
