import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { CreatePBIPayload, EpicSummary, SprintSummary, PBIPriority, PBIItemType } from '../types'

interface CreatePBIModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreatePBIPayload) => Promise<void>
  epics: EpicSummary[]
  sprints: SprintSummary[]
  autoCode?: string
}

const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13, 20]

export function CreatePBIModal({
  isOpen,
  onClose,
  onSubmit,
  epics,
  sprints,
  autoCode = 'SB-153',
}: CreatePBIModalProps) {
  const [epicId, setEpicId] = useState<string>(epics[1]?.id || epics[0]?.id || '')
  const [title, setTitle] = useState('Tích hợp xác thực 2FA qua Authenticator App')
  const [description, setDescription] = useState(
    'Hỗ trợ mã TOTP 6 chữ số theo chuẩn RFC 6238. Cung cấp mã khôi phục khi mất thiết bị.',
  )
  const [storyPoints, setStoryPoints] = useState<number | null>(5)
  const [priority, setPriority] = useState<PBIPriority>('high')
  const [itemType, setItemType] = useState<PBIItemType>('feature')
  const [sprintId, setSprintId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showValidationDemo, setShowValidationDemo] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; storyPoints?: string }>({})

  if (!isOpen) return null

  const handleValidate = () => {
    const newErrors: { title?: string; storyPoints?: string } = {}
    if (!title || title.trim().length < 5) {
      newErrors.title = 'Tiêu đề PBI phải chứa ít nhất 5 ký tự và không được để trống.'
    }
    if (!storyPoints || storyPoints <= 0) {
      newErrors.storyPoints = 'Vui lòng ước lượng Story Points hợp lệ (từ 1 đến 20) trước khi tạo thẻ.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!handleValidate()) return

    try {
      setIsSubmitting(true)
      setSubmitError('')
      await onSubmit({
        title,
        description,
        itemType,
        priority,
        storyPoints: storyPoints || 1,
        epicId: epicId || undefined,
        sprintId: sprintId || undefined,
      })
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Không thể lưu Backlog. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleDemoValidationError = () => {
    if (!showValidationDemo) {
      setTitle('A')
      setStoryPoints(null)
      setErrors({
        title: 'Tiêu đề PBI phải chứa ít nhất 5 ký tự và không được để trống.',
        storyPoints: 'Vui lòng ước lượng Story Points hợp lệ (từ 1 đến 20) trước khi tạo thẻ.',
      })
      setShowValidationDemo(true)
    } else {
      setTitle('Tích hợp xác thực 2FA qua Authenticator App')
      setStoryPoints(5)
      setErrors({})
      setShowValidationDemo(false)
    }
  }

  const errorCount = Object.keys(errors).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-whiteboard rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-pbi-title"
      >
        {submitError && <p role="alert" className="p-4 text-error-700">{submitError}</p>}
        {!epics.length && <p className="p-4 text-neutral-600">Dự án chưa có Epic. Vui lòng tạo Epic trước khi tạo Backlog.</p>}
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
              <Icon name="check-circle" size={18} />
            </div>
            <div>
              <h2 id="create-pbi-title" className="text-body-lg font-bold text-neutral-900">
                Tạo Product Backlog Item (PBI) mới
              </h2>
              <p className="text-[12px] text-neutral-500">
                Thêm hạng mục mới vào danh sách backlog dự án
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDemoValidationError}
              className="text-[11px] px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded font-medium transition-colors cursor-pointer"
              title="Chuyển đổi màn hình S5-07 Lỗi kiểm tra tạo PBI"
            >
              {showValidationDemo ? 'Hủy demo lỗi' : 'Demo lỗi kiểm tra'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Global Error Banner (S5-07 reference) */}
        {errorCount > 0 && (
          <div className="mx-6 mt-4 p-3 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-2.5">
            <div className="text-danger-600 shrink-0 mt-0.5">
              <Icon name="alert-circle" size={18} />
            </div>
            <div className="text-[13px]">
              <div className="font-semibold text-danger-800">Không thể tạo PBI</div>
              <div className="text-danger-700">
                Vui lòng bổ sung các thông tin bắt buộc và kiểm tra độ dài tiêu đề.
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Thuộc Epic & Loại PBI (2 cột) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="pbi-epic" className="text-body-sm font-semibold text-neutral-800">
                  Thuộc Epic
                </label>
                <span className="text-[11px] text-neutral-400">Nhóm tính năng</span>
              </div>
              <div className="relative">
                <select
                  id="pbi-epic"
                  value={epicId}
                  onChange={(e) => setEpicId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 bg-paper-50 text-body-medium text-neutral-800 focus:outline-hidden focus:border-primary-500 appearance-none pr-8 cursor-pointer text-xs"
                >
                  <option value="">-- Không liên kết Epic --</option>
                  {epics.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      ● {ep.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <Icon name="chevron-down" size={14} />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="pbi-type" className="text-body-sm font-semibold text-neutral-800">
                  Loại hạng mục
                </label>
                <span className="text-[11px] text-neutral-400">Phân loại</span>
              </div>
              <div className="relative">
                <select
                  id="pbi-type"
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as PBIItemType)}
                  className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 bg-paper-50 text-body-medium text-neutral-800 focus:outline-hidden focus:border-primary-500 appearance-none pr-8 cursor-pointer text-xs"
                >
                  <option value="user_story">📖 User Story</option>
                  <option value="feature">⚡ Feature</option>
                  <option value="bug">🐛 Bug Fix</option>
                  <option value="technical_debt">⚙ Technical Debt</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <Icon name="chevron-down" size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Tiêu đề PBI */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="pbi-title" className="text-body-sm font-semibold text-neutral-800">
                Tiêu đề PBI <span className="text-danger-500">*</span>
              </label>
              <span
                className={`text-[11px] font-medium ${
                  errors.title ? 'text-danger-600 font-bold' : 'text-neutral-400'
                }`}
              >
                {title.length} / 120 ký tự
              </span>
            </div>
            <div className="relative">
              <input
                id="pbi-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }))
                }}
                placeholder="Nhập tiêu đề công việc..."
                className={`w-full px-3.5 py-2.5 rounded-lg border text-body-medium text-neutral-900 focus:outline-hidden transition-colors ${
                  errors.title
                    ? 'border-danger-400 bg-danger-50/40 text-danger-900 pr-10 focus:border-danger-500'
                    : 'border-neutral-300 bg-paper-50 focus:border-primary-500 focus:bg-whiteboard'
                }`}
              />
              {errors.title && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-danger-500">
                  <Icon name="alert-circle" size={18} />
                </div>
              )}
            </div>
            {errors.title && (
              <p className="mt-1 text-[12px] text-danger-600 flex items-center gap-1 font-medium">
                <span>⊘</span> {errors.title}
              </p>
            )}
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="pbi-desc" className="text-body-sm font-semibold text-neutral-800">
                Mô tả chi tiết
              </label>
              <span className="text-[11px] text-neutral-400">Đặc tả kỹ thuật & Nghiệm thu</span>
            </div>
            <textarea
              id="pbi-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mục tiêu nghiệp vụ, điều kiện hoàn thành (Definition of Done) hoặc bối cảnh người dùng..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-paper-50 text-body-medium text-neutral-800 focus:outline-hidden focus:border-primary-500 focus:bg-whiteboard resize-none"
            />
          </div>

          {/* SP & Độ ưu tiên (2 cột) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Story Points */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-body-sm font-semibold text-neutral-800">
                  Ước lượng (SP) <span className="text-danger-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-primary-600">
                  {storyPoints ? `Đã chọn: ${storyPoints} SP` : 'Fibonacci'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FIBONACCI_POINTS.map((num) => {
                  const isSelected = storyPoints === num
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setStoryPoints(num)
                        if (errors.storyPoints) {
                          setErrors((prev) => ({ ...prev, storyPoints: undefined }))
                        }
                      }}
                      className={`h-9 w-9 rounded-lg font-bold text-sm transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'bg-primary-600 text-whiteboard shadow-sm ring-2 ring-primary-300'
                          : 'bg-paper-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
                      }`}
                    >
                      {num}
                    </button>
                  )
                })}
              </div>
              {errors.storyPoints && (
                <p className="mt-1 text-[12px] text-danger-600 flex items-center gap-1 font-medium">
                  <span>⊘</span> {errors.storyPoints}
                </p>
              )}
            </div>

            {/* Độ ưu tiên */}
            <div>
              <label htmlFor="pbi-priority" className="block text-body-sm font-semibold text-neutral-800 mb-1.5">
                Độ ưu tiên
              </label>
              <div className="relative">
                <select
                  id="pbi-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PBIPriority)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-paper-50 text-body-medium text-neutral-800 focus:outline-hidden focus:border-primary-500 appearance-none pr-9 cursor-pointer"
                >
                  <option value="urgent">🔴 Khẩn cấp (Urgent)</option>
                  <option value="high">🟠 Cao (High)</option>
                  <option value="medium">🟡 Trung bình (Medium)</option>
                  <option value="low">🟢 Thấp (Low)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <Icon name="chevron-down" size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Phân bổ Sprint dự kiến */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="pbi-sprint" className="text-body-sm font-semibold text-neutral-800">
                Phân bổ Sprint dự kiến
              </label>
              <span className="text-[11px] text-neutral-400">Có thể để trống để đưa vào kho Backlog</span>
            </div>
            <div className="relative">
              <select
                id="pbi-sprint"
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-paper-50 text-body-medium text-neutral-800 focus:outline-hidden focus:border-primary-500 appearance-none pr-9 cursor-pointer"
              >
                <option value="">📅 Chưa gán (Để trong Backlog chung)</option>
                {sprints.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name} ({sp.dateRange})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                <Icon name="chevron-down" size={16} />
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="p-3 bg-neutral-50 rounded-lg text-[12px] text-neutral-600 flex items-center gap-2">
            <span className="text-primary-600">
              <Icon name="info" size={16} />
            </span>
            <span>
              PBI sẽ được tự động xếp vào đỉnh ngăn xếp Backlog sau khi tạo thành công.
            </span>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-paper-50 border-t border-neutral-200">
          <div className="text-[12px] text-neutral-500 flex items-center gap-1.5">
            {errorCount > 0 ? (
              <span className="font-semibold text-danger-600 flex items-center gap-1">
                <span>⊘</span> {errorCount} trường cần chỉnh sửa
              </span>
            ) : (
              <>
                <Icon name="tag" size={14} className="text-neutral-400" />
                <span>Mã thẻ tự động sinh:</span>
                <span className="font-bold text-neutral-800">{autoCode}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-body-medium rounded-lg font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-whiteboard text-body-medium rounded-lg font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Icon name="check" size={16} />
              <span>{isSubmitting ? 'Đang tạo...' : 'Tạo PBI'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
