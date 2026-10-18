import { useState, useId } from 'react'
import { Modal, Button, Icon } from '@/components/ui'
import type { Sprint, UpdateSprintPayload } from '../types'

export interface EditSprintModalProps {
  isOpen: boolean
  sprint: Sprint | null
  onClose: () => void
  onSubmit: (id: string, payload: UpdateSprintPayload) => Promise<void>
  onDeleteRequest?: (sprint: Sprint) => void
}

interface EditSprintFormProps {
  sprint: Sprint
  onClose: () => void
  onSubmit: (id: string, payload: UpdateSprintPayload) => Promise<void>
  onDeleteRequest?: (sprint: Sprint) => void
}

function EditSprintForm({
  sprint,
  onClose,
  onSubmit,
  onDeleteRequest,
}: EditSprintFormProps) {
  const formId = useId()
  const [name, setName] = useState(sprint.name)
  const [goal, setGoal] = useState(sprint.goal)
  const [endDate, setEndDate] = useState(sprint.endDate)
  const [capacity, setCapacity] = useState(sprint.capacitySP)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLockedStartDate = sprint.status === 'active'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên Sprint.')
      return
    }
    if (!goal.trim()) {
      setError('Vui lòng nhập mục tiêu Sprint.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await onSubmit(sprint.id, {
        name: name.trim(),
        goal: goal.trim(),
        endDate,
        capacitySP: capacity,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Chỉnh sửa Sprint — [${sprint.code}]`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          {onDeleteRequest && sprint.status !== 'closed' ? (
            <button
              type="button"
              onClick={() => {
                onClose()
                onDeleteRequest(sprint)
              }}
              className="flex items-center gap-1.5 text-caption font-semibold text-red-600 hover:text-red-800 cursor-pointer p-1 rounded hover:bg-red-50 transition-colors"
            >
              <Icon name="trash" size={16} />
              <span>Xóa Sprint này</span>
            </button>
          ) : (
            <div />
          )}

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
              disabled={isSubmitting}
              leftIcon={<Icon name="check" size={16} />}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
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

        {/* Tên Sprint */}
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
        </div>

        {/* Mục tiêu Sprint */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-caption font-semibold text-neutral-700">
              Mục tiêu Sprint (Sprint Goal) <span className="text-red-500">*</span>
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

        {/* Dates row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {isLockedStartDate && (
                <Icon name="lock" size={14} className="text-neutral-500" />
              )}
              <label className="text-caption font-semibold text-neutral-700">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                disabled={isLockedStartDate}
                className={`w-full pl-9 pr-3 py-2 text-body-sm border rounded-md shadow-xs ${
                  isLockedStartDate
                    ? 'bg-neutral-100/80 border-neutral-200 text-neutral-500 cursor-not-allowed'
                    : 'bg-white border-neutral-300'
                }`}
                value={sprint.startDate}
              />
              <Icon
                name="calendar"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
            </div>
            {isLockedStartDate && (
              <p className="text-[12px] text-amber-700 mt-1 flex items-center gap-1">
                <Icon name="info" size={12} />
                <span>Sprint đang chạy không thể sửa ngày bắt đầu</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-caption font-semibold text-neutral-700">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              {sprint.daysLeft && (
                <span className="text-[11px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded">
                  {sprint.daysLeft}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Icon
                name="calendar"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
            </div>
            <p className="text-[12px] text-neutral-500 mt-1">
              Tổng thời gian: 14 ngày làm việc
            </p>
          </div>
        </div>

        {/* Dung lượng mục tiêu */}
        <div>
          <label className="block text-caption font-semibold text-neutral-700 mb-1">
            Dung lượng mục tiêu (Target Capacity)
          </label>
          <div className="relative max-w-xs">
            <input
              type="number"
              min={1}
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
            Đội ngũ hiện tại: {sprint.membersCount || 5} kỹ sư backend & infra
          </p>
        </div>

        {/* Notice callout */}
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-caption text-neutral-600 flex items-start gap-2">
          <Icon name="bell" size={16} className="text-primary-600 shrink-0 mt-0.5" />
          <span>
            <strong>Lưu ý:</strong> Thay đổi mục tiêu hoặc ngày kết thúc sẽ được thông báo tự động đến tất cả thành viên trong nhóm dự án.
          </span>
        </div>
      </form>
    </Modal>
  )
}

export function EditSprintModal({
  isOpen,
  sprint,
  onClose,
  onSubmit,
  onDeleteRequest,
}: EditSprintModalProps) {
  if (!isOpen || !sprint) return null

  return (
    <EditSprintForm
      key={sprint.id}
      sprint={sprint}
      onClose={onClose}
      onSubmit={onSubmit}
      onDeleteRequest={onDeleteRequest}
    />
  )
}
