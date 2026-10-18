import { useState } from 'react'
import type { KanbanTask, KanbanColumnId, KanbanPriority } from '../types'
import { Button, Icon } from '@/components/ui'

export interface TaskDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  task: KanbanTask | null
  onUpdate: (id: string, payload: Partial<KanbanTask>) => Promise<void>
  onDeleteRequest: (task: KanbanTask) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>
  onAddSubtask: (taskId: string, title: string) => Promise<void>
  onAddComment: (taskId: string, content: string) => Promise<void>
}

const MEMBERS = [
  { name: 'Minh Quân', role: 'Tech Lead', avatar: 'MQ' },
  { name: 'Tuấn Anh', role: 'Backend Engineer', avatar: 'TA' },
  { name: 'Hoàng Linh', role: 'Frontend Dev', avatar: 'HL' },
  { name: 'Minh Hải', role: 'DevOps Lead', avatar: 'MH' },
  { name: 'Đỗ Thảo', role: 'QA Lead', avatar: 'ĐT' },
  { name: 'Thùy Trang', role: 'Frontend Dev', avatar: 'TT' },
]

interface DrawerInnerProps {
  task: KanbanTask
  onClose: () => void
  onUpdate: (id: string, payload: Partial<KanbanTask>) => Promise<void>
  onDeleteRequest: (task: KanbanTask) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>
  onAddSubtask: (taskId: string, title: string) => Promise<void>
  onAddComment: (taskId: string, content: string) => Promise<void>
}

function DrawerInner({
  task,
  onClose,
  onUpdate,
  onDeleteRequest,
  onToggleSubtask,
  onAddSubtask,
  onAddComment,
}: DrawerInnerProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const handleSaveTitle = async () => {
    if (title.trim() && title !== task.title) {
      await onUpdate(task.id, { title: title.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleSaveDesc = async () => {
    if (description !== task.description) {
      await onUpdate(task.id, { description })
    }
    setIsEditingDesc(false)
  }

  const handleStatusChange = async (colId: KanbanColumnId) => {
    await onUpdate(task.id, { columnId: colId })
  }

  const handlePriorityChange = async (p: KanbanPriority) => {
    await onUpdate(task.id, { priority: p })
  }

  const handleAssigneeChange = async (name: string) => {
    const member = MEMBERS.find((m) => m.name === name)
    if (member) {
      await onUpdate(task.id, {
        assignee: {
          name: member.name,
          avatarCode: member.avatar,
          role: member.role,
          isCurrentUser: member.name.includes('Quân'),
        },
      })
    }
  }

  const handleAddSubtaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    await onAddSubtask(task.id, newSubtaskTitle.trim())
    setNewSubtaskTitle('')
  }

  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setIsSubmittingComment(true)
    try {
      await onAddComment(task.id, newComment.trim())
      setNewComment('')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const subtasks = task.subtasks || []
  const completedSubtasks = subtasks.filter((s) => s.completed).length
  const subtasksPercent = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 z-40 transition-opacity backdrop-blur-2xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container (S9-02 & Html -> Body-5) */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-whiteboard shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-neutral-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-800">
              {task.pbiCode || 'PBI-142'}
            </span>
            <span>/</span>
            <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
              #{task.code}
            </span>
            <span className="text-[11px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded">
              Task
            </span>
          </div>

          <div className="flex items-center gap-1 text-neutral-500">
            <button
              type="button"
              onClick={() => onDeleteRequest(task)}
              className="p-1.5 text-neutral-400 hover:text-danger-600 rounded hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Xóa tác vụ"
            >
              <Icon name="trash" size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Đóng ngăn chi tiết"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Category tag & Last update info */}
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded font-medium">
              {task.tags?.[0] || 'Kỹ thuật hạ tầng'}
            </span>
            <span>{task.updatedAt || 'Cập nhật 42 phút trước'}</span>
          </div>

          {/* Task Title (Inline Edit S9-03) */}
          <div>
            {isEditingTitle ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  autoFocus
                  className="w-full text-lg font-bold py-1 px-2 border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-neutral-900"
                />
                <div className="flex items-center gap-2 text-xs">
                  <Button size="sm" variant="primary" onClick={handleSaveTitle}>
                    Lưu
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setIsEditingTitle(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group flex items-start gap-2">
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="text-lg font-bold text-neutral-900 cursor-pointer hover:text-primary-700 transition-colors flex-1"
                >
                  #{task.code}: {task.title}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-neutral-700 p-1 rounded"
                  title="Sửa tiêu đề"
                >
                  <Icon name="edit" size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Primary Properties Box (S9-02) */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
            {/* Status Selector */}
            <div className="space-y-1">
              <span className="text-neutral-500 font-medium">Trạng thái</span>
              <div className="relative">
                <select
                  value={task.columnId}
                  onChange={(e) => handleStatusChange(e.target.value as KanbanColumnId)}
                  className="w-full py-1.5 px-2 bg-white border border-neutral-300 rounded font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none pr-7 cursor-pointer"
                >
                  <option value="todo">● Cần làm</option>
                  <option value="in_progress">● Đang làm</option>
                  <option value="review">● Đang kiểm tra</option>
                  <option value="done">● Hoàn thành</option>
                </select>
                <Icon
                  name="chevron-down"
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Assignee Selector */}
            <div className="space-y-1">
              <span className="text-neutral-500 font-medium">Người thực hiện</span>
              <div className="relative">
                <select
                  value={task.assignee.name}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white border border-neutral-300 rounded font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none pr-7 cursor-pointer"
                >
                  {MEMBERS.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
                <Icon
                  name="chevron-down"
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1">
              <span className="text-neutral-500 font-medium">Độ ưu tiên</span>
              <div className="relative">
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as KanbanPriority)}
                  className="w-full py-1.5 px-2 bg-white border border-neutral-300 rounded font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none pr-7 cursor-pointer"
                >
                  <option value="urgent">🔴 Khẩn cấp (P0)</option>
                  <option value="high">🟠 Cao (P1)</option>
                  <option value="medium">🔵 Vừa (P2)</option>
                  <option value="low">⚪ Thấp (P3)</option>
                </select>
                <Icon
                  name="chevron-down"
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Deadline & Days Remaining */}
            <div className="space-y-1">
              <span className="text-neutral-500 font-medium">Hạn định</span>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-800 pt-1">
                <Icon name="calendar" size={14} className="text-neutral-400" />
                <span>{task.deadline || '28/10/2024'}</span>
                {task.daysRemainingText && (
                  <span className="text-[10px] bg-danger-50 text-danger-700 px-1.5 py-0.5 rounded font-medium">
                    {task.daysRemainingText}
                  </span>
                )}
              </div>
            </div>

            {/* Associated Epic */}
            <div className="space-y-1">
              <span className="text-neutral-500 font-medium">Epic</span>
              <div className="flex items-center gap-1.5 font-semibold text-primary-700">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>{task.epicName || 'IAM & Gateway Flow'}</span>
              </div>
            </div>

            {/* Associated Sprint & Story Points */}
            <div className="space-y-1">
              <span className="text-neutral-500 font-medium">Sprint liên kết</span>
              <div className="flex items-center gap-2 font-semibold text-neutral-800">
                <span>Sprint 14</span>
                <span className="text-[11px] bg-neutral-200 text-neutral-700 px-1.5 py-0.2 rounded font-bold">
                  {task.storyPoints || 3} SP
                </span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
              <span>MÔ TẢ CÔNG VIỆC</span>
              {!isEditingDesc && (
                <button
                  type="button"
                  onClick={() => setIsEditingDesc(true)}
                  className="text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="edit" size={12} />
                  <span>Sửa</span>
                </button>
              )}
            </div>

            {isEditingDesc ? (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-3 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-800 leading-relaxed"
                  placeholder="Nhập mô tả chi tiết cho tác vụ..."
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="primary" onClick={handleSaveDesc}>
                    Lưu mô tả
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setIsEditingDesc(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingDesc(true)}
                className="text-xs text-neutral-700 bg-neutral-50/70 p-3 rounded-lg border border-neutral-200/80 cursor-pointer hover:bg-neutral-50 transition-colors leading-relaxed"
              >
                {task.description ? (
                  <p className="whitespace-pre-line">{task.description}</p>
                ) : (
                  <span className="text-neutral-400 italic">Chưa có mô tả chi tiết. Nhấp vào đây để thêm...</span>
                )}
              </div>
            )}
          </div>

          {/* Subtask Checklist Section (S9-04) */}
          <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Icon name="check-circle" size={16} className="text-primary-600" />
                <span className="font-bold text-neutral-800">Danh sách kiểm tra (Checklist)</span>
                <span className="text-neutral-500 text-[11px]">
                  {completedSubtasks}/{subtasks.length} hoàn tất ({subtasksPercent}%)
                </span>
              </div>
            </div>

            {/* Checklist progress bar */}
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${subtasksPercent}%` }}
              />
            </div>

            {/* Subtask list */}
            <div className="space-y-1.5 pt-1">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-white transition-colors text-xs"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => onToggleSubtask(task.id, st.id)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                    <span
                      className={`${
                        st.completed ? 'line-through text-neutral-400 font-normal' : 'text-neutral-800 font-medium'
                      }`}
                    >
                      {st.title}
                    </span>
                  </label>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                      st.completed
                        ? 'bg-emerald-50 text-emerald-700'
                        : st.statusLabel === 'Đang làm'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {st.completed ? 'Xong' : st.statusLabel || 'Chờ'}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Add Subtask Form */}
            <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="+ Thêm nhiệm vụ con..."
                className="flex-1 text-xs py-1.5 px-3 bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-800 placeholder:text-neutral-400"
              />
              <Button size="sm" type="submit" variant="secondary" disabled={!newSubtaskTitle.trim()}>
                Thêm
              </Button>
            </form>
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
              <div className="flex items-center gap-1.5">
                <Icon name="paperclip" size={14} />
                <span>TỆP ĐÍNH KÈM ({task.attachments?.length || 0})</span>
              </div>
              <span className="text-[11px] text-primary-600 cursor-pointer hover:underline">
                + Tải tệp lên
              </span>
            </div>

            <div className="space-y-1.5">
              {(task.attachments || []).map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs hover:bg-neutral-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon name="file-text" size={16} className="text-primary-600 shrink-0" />
                    <span className="font-semibold text-neutral-800 truncate">{att.name}</span>
                    <span className="text-neutral-400 text-[11px]">({att.size})</span>
                  </div>
                  <button
                    type="button"
                    className="p-1 text-neutral-400 hover:text-primary-600 rounded transition-colors cursor-pointer"
                    title="Tải xuống tệp"
                  >
                    <Icon name="download" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Comments & Discussion Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 border-b border-neutral-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Icon name="message-square" size={14} />
                <span>TRAO ĐỔI & THẢO LUẬN ({task.comments?.length || 0})</span>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-3">
              {(task.comments || []).map((c) => (
                <div key={c.id} className="flex gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {c.authorAvatar}
                  </div>
                  <div className="flex-1 space-y-1 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">{c.authorName}</span>
                      <span className="text-[10px] text-neutral-400">{c.timestamp}</span>
                    </div>
                    <p className="text-neutral-700 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment box */}
            <form onSubmit={handleAddCommentSubmit} className="space-y-2 pt-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                placeholder="Nhập bình luận... Gõ @ để nhắc tên đồng nghiệp (@Tuấn Kiệt, @Huy Bảo...)"
                className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-800 placeholder:text-neutral-400 leading-relaxed"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5 text-[10px] text-neutral-400">
                  <span className="cursor-pointer hover:text-neutral-700">@Tuấn Anh</span>
                  <span>•</span>
                  <span className="cursor-pointer hover:text-neutral-700">@Minh Quân</span>
                </div>
                <Button
                  size="sm"
                  type="submit"
                  variant="primary"
                  disabled={!newComment.trim() || isSubmittingComment}
                  leftIcon={<Icon name="send" size={12} />}
                >
                  Gửi bình luận
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Drawer Bottom Bar */}
        <div className="px-6 py-3.5 border-t border-neutral-200 bg-neutral-50/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Icon name="check" size={14} className="text-emerald-600" />
            <span>Tự động sao lưu bản nháp</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={onClose}>
              Đóng
            </Button>
            <Button size="sm" variant="primary" onClick={onClose}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export function TaskDetailDrawer(props: TaskDetailDrawerProps) {
  if (!props.isOpen || !props.task) return null
  return <DrawerInner key={props.task.id} {...props} task={props.task} />
}
