import { useState, useId, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/services/api'
import type { KanbanColumnId, KanbanPriority, CreateTaskPayload } from '../types'
import { Modal, Button, Icon } from '@/components/ui'

export interface QuickCreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  defaultColumnId?: KanbanColumnId
  onCreate: (payload: CreateTaskPayload) => Promise<void>
}

export function QuickCreateTaskModal({
  isOpen,
  onClose,
  defaultColumnId = 'todo',
  onCreate,
}: QuickCreateTaskModalProps) {
  const formId = useId()
  const { projectId } = useParams()
  const [members, setMembers] = useState<{ userId: number; fullName: string }[]>([])
  const [title, setTitle] = useState('')
  const [columnId, setColumnId] = useState<KanbanColumnId>(defaultColumnId)
  const [assigneeId, setAssigneeId] = useState('')
  const [priority, setPriority] = useState<KanbanPriority>('high')
  const [deadline, setDeadline] = useState('')
  const [storyPoints, setStoryPoints] = useState(3)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  useEffect(() => {
    if (!isOpen) return
    setColumnId(defaultColumnId)
    let cancelled = false
    if (projectId) api.projectMembers.list(Number(projectId), { pageSize: 100 }).then(res => {
      if (!cancelled) setMembers(res.data.items)
    }).catch(() => { if (!cancelled) setError('Không thể tải thành viên dự án.') })
    return () => { cancelled = true }
  }, [isOpen, projectId, defaultColumnId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Tiêu đề tác vụ là bắt buộc.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onCreate({
        title: title.trim(),
        columnId,
        assigneeId: Number(assigneeId) || undefined,
        priority,
        deadline,
        storyPoints,
      })
      setTitle('')
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi tạo tác vụ.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo tác vụ mới (Task)"
      maxWidth="md"
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        {/* Subtitle / sprint indicator (S9-01) */}
        <div className="text-xs text-neutral-500 -mt-2">
          Công việc được lưu vào dự án hiện tại.
        </div>

        {error && (
          <div className="p-2.5 bg-danger-50 border border-danger-200 text-danger-700 text-xs rounded flex items-center gap-1.5">
            <Icon name="alert-circle" size={14} className="shrink-0 text-danger-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Title */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-semibold text-neutral-700">
            <label htmlFor="task-title">
              Tiêu đề tác vụ <span className="text-danger-500">*</span>
            </label>
            <span className="text-neutral-400 font-normal">Bắt buộc</span>
          </div>
          <input
            id="task-title"
            type="text"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setError(null)
            }}
            placeholder="Viết kịch bản tự động kiểm thử tải k6 cho API Gateway"
            className="w-full text-xs py-2 px-3 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-800"
          />
          <p className="text-[11px] text-neutral-400">
            Mẹo: Đặt tên tác vụ rõ ràng, bắt đầu bằng động từ hành động.
          </p>
        </div>

        {/* Assignee */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-700">
            Người thực hiện (Assignee)
          </label>
          <div className="relative">
            <select
              aria-label="Người thực hiện"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full text-xs py-2 px-3 border border-neutral-300 rounded bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="">Chưa giao</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.fullName}
                </option>
              ))}
            </select>
            <Icon
              name="chevron-down"
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Priority Radio Buttons (S9-01) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">
            Độ ưu tiên (Priority)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'urgent', label: 'Khẩn cấp', color: 'text-danger-600', dot: 'bg-danger-500' },
              { id: 'high', label: 'Cao', color: 'text-amber-700', dot: 'bg-amber-600' },
              { id: 'medium', label: 'Vừa', color: 'text-primary-600', dot: 'bg-primary-500' },
              { id: 'low', label: 'Thấp', color: 'text-neutral-500', dot: 'bg-neutral-400' },
            ].map((p) => {
              const isSelected = priority === p.id
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id as KanbanPriority)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs rounded border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-neutral-800 bg-neutral-100 font-semibold text-neutral-900 shadow-xs'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                  <span>{p.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Deadline & Target Column */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700">
              Hạn chót (Deadline)
            </label>
            <div className="relative">
              <input
                type="date"
                aria-label="Hạn chót"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="28/10/2024"
                className="w-full text-xs py-2 px-3 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-800"
              />
            </div>
            <p className="text-[11px] text-neutral-400">Để trống nếu chưa có hạn.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700">
              Thêm vào cột
            </label>
            <div className="relative">
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value as KanbanColumnId)}
                className="w-full text-xs py-2 px-3 border border-neutral-300 rounded bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none pr-8 cursor-pointer"
              >
                <option value="todo">Cần làm (Mặc định)</option>
                <option value="in_progress">Đang làm</option>
                <option value="review">Đang kiểm tra</option>
                <option value="done">Hoàn thành</option>
              </select>
              <Icon
                name="chevron-down"
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>
            <p className="text-[11px] text-neutral-400">Vị trí xuất hiện đầu tiên trên bảng</p>
          </div>
        </div>

        {/* Story Points */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-700">
            Điểm ước lượng (Story Points)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 8, 13].map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setStoryPoints(sp)}
                className={`flex-1 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  storyPoints === sp
                    ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {sp} SP
              </button>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !title.trim()}
            leftIcon={<Icon name="plus" size={14} />}
          >
            {isSubmitting ? 'Đang tạo...' : '+ Tạo Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
