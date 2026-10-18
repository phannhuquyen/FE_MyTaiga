import { useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui'
import type { CreateProjectPayload, ProjectMethodology } from '../types'

export interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (payload: CreateProjectPayload) => Promise<void>
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreate,
}: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [key, setKey] = useState('PAY')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('15/11/2024')
  const [endDate, setEndDate] = useState('30/04/2025')
  const [methodology, setMethodology] = useState<ProjectMethodology>('scrumban')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  // Auto generate key from name if not manually customized
  const handleNameChange = (val: string) => {
    setName(val)
    if (error) setError(null)
    const words = val.trim().split(/\s+/).filter(Boolean)
    if (words.length >= 2) {
      setKey((words[0][0] + words[1][0] + (words[2] ? words[2][0] : '')).toUpperCase())
    } else if (words.length === 1 && words[0].length >= 3) {
      setKey(words[0].slice(0, 3).toUpperCase())
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Tên dự án là bắt buộc.')
      return
    }

    try {
      setIsLoading(true)
      await onCreate({
        name: name.trim(),
        key: key.trim() || 'PRJ',
        description: description.trim(),
        startDate,
        endDate,
        methodology,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi tạo dự án.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        className="relative z-10 w-full max-w-xl bg-whiteboard rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-primary-700">
            <Icon name="folder-plus" size={20} />
            <h3
              id="create-project-title"
              className="text-body-large font-bold text-neutral-900 tracking-tight"
            >
              Tạo dự án mới
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-body-xs flex items-center gap-2">
              <Icon name="alert-circle" size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Tên dự án & Mã khóa */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="projectName" className="block text-body-xs font-semibold text-neutral-800 mb-1.5">
                Tên dự án <span className="text-danger-500">*</span>
              </label>
              <input
                id="projectName"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="vd: Cổng thanh toán quốc tế v2"
                className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 bg-paper-50 focus:bg-whiteboard focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-body-sm text-neutral-900"
                autoFocus
              />
            </div>
            <div className="w-32">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-semibold text-neutral-800">Mã khóa</span>
                <span className="text-neutral-400 font-bold tracking-wider">TỰ ĐỘNG</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full pl-3.5 pr-8 py-2 rounded-lg border border-neutral-300 bg-paper-50 text-body-sm font-bold text-neutral-900 tracking-wider focus:outline-none focus:border-primary-500"
                />
                <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-neutral-400">
                  <Icon name="sparkles" size={14} />
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Mô tả ngắn mục tiêu */}
          <div>
            <div className="flex items-center justify-between text-body-xs mb-1.5">
              <label htmlFor="projectDesc" className="font-semibold text-neutral-800">
                Mô tả ngắn mục tiêu
              </label>
              <span className="text-neutral-400 text-body-xs">Tùy chọn</span>
            </div>
            <textarea
              id="projectDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả mục tiêu chính, phạm vi bàn giao và các bên liên quan của dự án..."
              className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 bg-paper-50 focus:bg-whiteboard focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-body-sm text-neutral-900 resize-none"
            />
          </div>

          {/* Row 3: Ngày bắt đầu & Ngày kết thúc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-body-xs font-semibold text-neutral-800 mb-1.5">
                Ngày bắt đầu
              </label>
              <div className="relative">
                <input
                  id="startDate"
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2 rounded-lg border border-neutral-300 bg-paper-50 text-body-sm text-neutral-900 focus:outline-none focus:border-primary-500"
                  placeholder="DD/MM/YYYY"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
                  <Icon name="calendar" size={15} />
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-body-xs font-semibold text-neutral-800 mb-1.5">
                Ngày dự kiến kết thúc
              </label>
              <div className="relative">
                <input
                  id="endDate"
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2 rounded-lg border border-neutral-300 bg-paper-50 text-body-sm text-neutral-900 focus:outline-none focus:border-primary-500"
                  placeholder="DD/MM/YYYY"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
                  <Icon name="calendar" size={15} />
                </span>
              </div>
            </div>
          </div>

          {/* Row 4: Quy trình phân phối sản phẩm */}
          <div>
            <label className="block text-body-xs font-semibold text-neutral-800 mb-2">
              Quy trình phân phối sản phẩm
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: ScrumBan kết hợp */}
              <div
                onClick={() => setMethodology('scrumban')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  methodology === 'scrumban'
                    ? 'border-primary-600 bg-primary-50/20'
                    : 'border-neutral-200 hover:border-neutral-300 bg-whiteboard'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    methodology === 'scrumban' ? 'border-primary-600 bg-primary-600' : 'border-neutral-400'
                  }`}>
                    {methodology === 'scrumban' && <div className="w-1.5 h-1.5 rounded-full bg-whiteboard" />}
                  </div>
                  <span className="font-bold text-body-sm text-neutral-900">
                    ScrumBan kết hợp
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-100 text-primary-700">
                    Mặc định
                  </span>
                </div>
                <p className="text-[12px] text-neutral-500 leading-snug pl-6">
                  Lập kế hoạch sprint linh hoạt, giới hạn WIP và cải tiến liên tục.
                </p>
              </div>

              {/* Option 2: Kanban thuần túy */}
              <div
                onClick={() => setMethodology('kanban')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  methodology === 'kanban'
                    ? 'border-primary-600 bg-primary-50/20'
                    : 'border-neutral-200 hover:border-neutral-300 bg-whiteboard'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    methodology === 'kanban' ? 'border-primary-600 bg-primary-600' : 'border-neutral-400'
                  }`}>
                    {methodology === 'kanban' && <div className="w-1.5 h-1.5 rounded-full bg-whiteboard" />}
                  </div>
                  <span className="font-bold text-body-sm text-neutral-900">
                    Kanban thuần túy
                  </span>
                </div>
                <p className="text-[12px] text-neutral-500 leading-snug pl-6">
                  Dòng chảy luân chuyển công việc liên tục, không chia vòng sprint cố định.
                </p>
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <div className="text-[12px] text-neutral-500 flex items-center gap-1.5">
              <span>ⓘ</span>
              <span>Có thể tùy chỉnh cấu hình chi tiết sau khi tạo</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-body-sm font-medium text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-whiteboard rounded-lg text-body-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Icon name="check" size={15} />
                <span>{isLoading ? 'Đang tạo...' : 'Tạo dự án'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
