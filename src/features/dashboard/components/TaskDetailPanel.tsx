import { useState } from 'react'
import { Icon } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { TaskItem } from '../types'

export interface TaskDetailPanelProps {
  task: TaskItem | null
  onToggleDoD: (dodId: string) => void
  onAddComment: (content: string) => Promise<void>
  onClose?: () => void
}

export function TaskDetailPanel({
  task,
  onToggleDoD,
  onAddComment,
  onClose,
}: TaskDetailPanelProps) {
  const [commentInput, setCommentInput] = useState('')
  const [commentError, setCommentError] = useState('')
  const [pending, setPending] = useState(false)

  if (!task) {
    return (
      <aside className="bg-whiteboard rounded-lg border border-neutral-200 p-8 shadow-xs text-center text-neutral-400">
        <p className="text-body-default">Chọn một công việc để xem chi tiết.</p>
      </aside>
    )
  }

  const completedDoDCount = task.dod.filter((d) => d.completed).length
  const totalDoDCount = task.dod.length

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim()) return
    setPending(true); setCommentError('')
    try { await onAddComment(commentInput.trim()); setCommentInput('') }
    catch (err) { setCommentError(err instanceof Error ? err.message : 'Không thể lưu bình luận.') }
    finally { setPending(false) }
  }

  return (
    <aside className="bg-whiteboard rounded-lg border border-neutral-200 p-5 shadow-xs flex flex-col gap-4">
      {/* Top Header: Code badge, Title label, Action icons */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-0.5 rounded">
            {task.code}
          </span>
          <span className="text-body-sm font-medium text-neutral-500">
            Chi tiết công việc
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-400">
          <a
            href={task.href}
            className="p-1 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
            title="Mở tab mới"
          >
            <Icon name="external-link" size={16} />
          </a>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
              title="Đóng panel"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Task Title */}
      <div>
        <h3 className="text-headline-sm font-bold text-neutral-900 leading-snug">
          {task.title}
        </h3>

        {/* Status & Estimate row */}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-body-sm text-neutral-600">
          <span className="flex items-center gap-1.5 font-medium text-info-700 bg-info-50 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-info-500" />
            <span>{task.status}</span>
          </span>
          <span className="text-neutral-400">•</span>
          <span>
            Ước tính:{' '}
            <strong className="text-neutral-800">
              {task.storyPoints ?? 'Chưa ước lượng'}{task.storyPoints != null ? ' SP' : ''}
            </strong>{' '}
            ({task.estimatedHours != null ? `${task.estimatedHours}h` : 'Chưa có dữ liệu giờ ước lượng'})
          </span>
        </div>
      </div>

      {/* Metadata Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-y border-neutral-100 text-body-sm">
        <div>
          <span className="text-neutral-400 block text-xs mb-1">
            Người thực hiện
          </span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-neutral-800 text-whiteboard text-[11px] font-semibold flex items-center justify-center shrink-0">
              {task.assignee.avatarCode}
            </div>
            <span className="font-medium text-neutral-800 truncate">
              {task.assignee.name}
            </span>
          </div>
        </div>

        <div>
          <span className="text-neutral-400 block text-xs mb-1">Sprint</span>
          <span className="font-medium text-neutral-800">{task.sprint}</span>
        </div>

        <div>
          <span className="text-neutral-400 block text-xs mb-1">
            Độ ưu tiên
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-danger-600">
            <span>↑</span>
            <span>{task.priority} (High)</span>
          </span>
        </div>

        <div>
          <span className="text-neutral-400 block text-xs mb-1">Hạn xong</span>
          <span className="font-medium text-neutral-800">{task.dueDate}</span>
        </div>
      </div>

      {/* TIÊU CHÍ HOÀN THÀNH (DOD) */}
      <p className="text-body-sm text-neutral-700 whitespace-pre-wrap">{task.description || 'Chưa có mô tả.'}</p>
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-label-uppercase font-semibold text-neutral-500 tracking-wider">
            TIÊU CHÍ HOÀN THÀNH (DOD)
          </span>
          <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
            {completedDoDCount}/{totalDoDCount} đạt
          </span>
        </div>

        <div className="space-y-2">
          {!task.dod.length && <p className="text-xs text-neutral-500">Backend chưa cung cấp tiêu chí DoD cho công việc này.</p>}
          {task.dod.map((item) => (
            <label
              key={item.id}
              className={cn(
                'flex items-start gap-2.5 p-2 rounded border transition-colors cursor-pointer text-body-sm',
                item.completed
                  ? 'bg-success-50/50 border-success-200 text-neutral-700'
                  : 'bg-paper-50 border-neutral-200 text-neutral-800 hover:bg-neutral-50',
              )}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggleDoD(item.id)}
                className="mt-0.5 rounded text-primary-500 focus:ring-primary-500 cursor-pointer"
              />
              <span
                className={cn('leading-tight', {
                  'line-through text-neutral-400': item.completed,
                })}
              >
                {item.content}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* TRAO ĐỔI (Comments Stream) */}
      <div className="pt-2 border-t border-neutral-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-label-uppercase font-semibold text-neutral-500 tracking-wider">
            TRAO ĐỔI ({task.comments.length})
          </span>
        </div>

        {/* Comments List */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {task.comments.length === 0 ? (
            <p className="text-xs text-neutral-400 italic py-2">
              Chưa có bình luận nào. Hãy gửi phản hồi đầu tiên.
            </p>
          ) : (
            task.comments.map((comment) => (
              <div key={comment.id} className="text-body-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-neutral-900 text-xs">
                    {comment.author}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {comment.timeAgo}
                  </span>
                </div>
                <div className="bg-paper-100 border border-neutral-200/60 p-2.5 rounded text-neutral-700 leading-relaxed text-xs">
                  {comment.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Reply Form */}
        {!task.commentTaskId && <p className="text-xs text-neutral-500">Chưa có API bình luận cho Story.</p>}
        {task.type === 'Bug' && <p className="text-xs text-neutral-500">Trao đổi được lưu trên Task liên quan.</p>}
        {commentError && <p role="alert" className="text-error-700">{commentError}</p>}
        <form onSubmit={handleSubmitComment} className="flex items-center gap-2 mt-1">
          <input
            type="text"
            disabled={pending || !task.commentTaskId}
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Nhập phản hồi nhanh..."
            className="flex-1 px-3 py-1.5 text-xs bg-paper-50 border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-whiteboard transition-colors text-neutral-800 placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={pending || !task.commentTaskId || !commentInput.trim()}
            className="p-1.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-whiteboard rounded transition-colors cursor-pointer shrink-0"
            title="Gửi phản hồi"
          >
            <Icon name="send" size={16} className="transform rotate-90" />
          </button>
        </form>
      </div>
    </aside>
  )
}
