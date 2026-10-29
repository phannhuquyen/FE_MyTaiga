import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { PBI, PBIStatus, PBIPriority, SprintSummary } from '../types'

interface PBIDetailDrawerProps {
  pbi: PBI | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<PBI>) => Promise<void>
  onDeleteRequest: (pbi: PBI) => void
  onToggleLock: (id: string) => Promise<void>
  sprints: SprintSummary[]
  isReadOnly?: boolean
}

const STATUS_OPTIONS: { value: PBIStatus; label: string; color: string }[] = [
  { value: 'new', label: 'Cần làm', color: 'bg-neutral-500' },
  { value: 'ready', label: 'Sẵn sàng', color: 'bg-primary-500' },
  { value: 'in_progress', label: 'Đang làm', color: 'bg-warning-500' },
  { value: 'review', label: 'Chờ duyệt', color: 'bg-info-500' },
  { value: 'done', label: 'Hoàn thành', color: 'bg-success-500' },
]

export function PBIDetailDrawer({
  pbi,
  isOpen,
  onClose,
  onUpdate,
  onDeleteRequest,
  onToggleLock,
  sprints,
  isReadOnly = false,
}: PBIDetailDrawerProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [descriptionValue, setDescriptionValue] = useState('')
  const [newComment, setNewComment] = useState('')
  const [, setIsSubmittingComment] = useState(false)

  if (!isOpen || !pbi) return null

  const handleStatusChange = async (newStatus: PBIStatus) => {
    if (isReadOnly || pbi.isLocked) return
    await onUpdate(pbi.id, { status: newStatus })
  }

  const handleSprintChange = async (sprintId: string) => {
    if (isReadOnly || pbi.isLocked) return
    await onUpdate(pbi.id, { sprintId: sprintId || undefined })
  }

  const handleToggleCriteria = async (criteriaId: string) => {
    if (isReadOnly) return
    const updated = pbi.acceptanceCriteria.map((ac) =>
      ac.id === criteriaId ? { ...ac, isMet: !ac.isMet } : ac,
    )
    await onUpdate(pbi.id, { acceptanceCriteria: updated })
  }

  const handleSaveDescription = async () => {
    await onUpdate(pbi.id, { description: descriptionValue })
    setIsEditingDescription(false)
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    const comment = {
      id: `c-${Date.now()}`,
      authorName: 'Nguyễn Minh Quân',
      authorRole: 'Manager',
      authorAvatar: 'MQ',
      timestamp: 'Vừa xong',
      content: newComment.trim(),
    }
    const updatedComments = [...pbi.comments, comment]
    await onUpdate(pbi.id, { comments: updatedComments })
    setNewComment('')
    setIsSubmittingComment(false)
  }

  const completedTasks = pbi.subtasks.filter((t) => t.status === 'done').length
  const totalTasks = pbi.subtasks.length
  const taskProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const metCriteria = pbi.acceptanceCriteria.filter((ac) => ac.isMet).length
  const totalCriteria = pbi.acceptanceCriteria.length

  const getPriorityLabel = (priority: PBIPriority) => {
    switch (priority) {
      case 'urgent':
        return { text: 'Khẩn cấp (Urgent)', color: 'text-danger-600', icon: '↑' }
      case 'high':
        return { text: 'Cao (High)', color: 'text-warning-600', icon: '↑' }
      case 'medium':
        return { text: 'Trung bình', color: 'text-neutral-600', icon: '—' }
      case 'low':
        return { text: 'Thấp', color: 'text-success-600', icon: '↓' }
    }
  }

  const priorityMeta = getPriorityLabel(pbi.priority)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-xl bg-whiteboard shadow-2xl flex flex-col border-l border-neutral-200"
          role="dialog"
          aria-labelledby="drawer-title"
        >
          {/* Top Bar Header */}
          <div className="p-4 sm:px-6 border-b border-neutral-100 flex items-center justify-between bg-paper-50/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-2.5 py-1 rounded bg-primary-100 text-primary-800 text-xs font-bold tracking-wide">
                PBI #{pbi.code}
              </span>
              {pbi.epicName && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${pbi.epicColor || '#076859'}15`,
                    color: pbi.epicColor || '#076859',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: pbi.epicColor || '#076859' }}
                  />
                  <span className="truncate">{pbi.epicName}</span>
                </span>
              )}
              {pbi.isLocked && (
                <span className="px-2 py-0.5 bg-danger-100 text-danger-700 text-xs rounded-full font-bold flex items-center gap-1">
                  <Icon name="lock" size={12} />
                  <span>Đã khóa</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <>
                  <button
                    type="button"
                    onClick={() => onToggleLock(pbi.id)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                    title={pbi.isLocked ? 'Mở khóa PBI' : 'Khóa PBI'}
                  >
                    <Icon name={pbi.isLocked ? 'unlock' : 'lock'} size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRequest(pbi)}
                    className="p-1.5 text-danger-600 hover:text-danger-800 hover:bg-danger-50 rounded-md transition-colors cursor-pointer"
                    title="Xóa PBI này"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <h1 id="drawer-title" className="text-headline-sm font-bold text-neutral-900 leading-snug">
                {pbi.title}
              </h1>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-paper-50 border border-neutral-200">
              {/* Trạng thái */}
              <div>
                <label className="text-body-sm font-semibold text-neutral-500 block mb-1">
                  Trạng thái
                </label>
                {isReadOnly || pbi.isLocked ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                    {STATUS_OPTIONS.find((s) => s.value === pbi.status)?.label || pbi.status}
                  </span>
                ) : (
                  <select
                    value={pbi.status}
                    onChange={(e) => handleStatusChange(e.target.value as PBIStatus)}
                    className="w-full text-sm font-semibold text-neutral-800 bg-whiteboard border border-neutral-300 rounded-md px-2.5 py-1.5 focus:border-primary-500 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        ● {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Story Points */}
              <div>
                <label className="text-body-sm font-semibold text-neutral-500 block mb-1">
                  Story Points
                </label>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-neutral-900 text-whiteboard font-bold flex items-center justify-center text-sm shadow-xs">
                    {pbi.storyPoints}
                  </span>
                  <span className="text-[12px] text-neutral-500">
                    ({(pbi.storyPoints * 0.5).toFixed(1)} ngày công)
                  </span>
                </div>
              </div>

              {/* Độ ưu tiên */}
              <div>
                <label className="text-body-sm font-semibold text-neutral-500 block mb-1">
                  Độ ưu tiên
                </label>
                <div className={`text-sm font-bold flex items-center gap-1 ${priorityMeta.color}`}>
                  <span>{priorityMeta.icon}</span>
                  <span>{priorityMeta.text}</span>
                </div>
              </div>

              {/* Sprint */}
              <div>
                <label className="text-body-sm font-semibold text-neutral-500 block mb-1">
                  Sprint
                </label>
                {isReadOnly || pbi.isLocked ? (
                  <span className="text-sm font-semibold text-neutral-800">
                    {pbi.sprintName || 'Chưa gán (Backlog)'}
                  </span>
                ) : (
                  <select
                    aria-label="Sprint của Backlog"
                    value={pbi.sprintId || ''}
                    onChange={(e) => handleSprintChange(e.target.value)}
                    className="w-full text-sm font-semibold text-neutral-800 bg-whiteboard border border-neutral-300 rounded-md px-2.5 py-1.5 focus:border-primary-500 cursor-pointer"
                  >
                    <option value="">Chưa gán (Backlog)</option>
                    {sprints.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Người báo cáo */}
              <div>
                <label className="text-body-sm font-semibold text-neutral-500 block mb-1">
                  Người báo cáo
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-600 text-whiteboard text-[10px] font-bold flex items-center justify-center">
                    {pbi.reporterAvatar || '—'}
                  </div>
                  <span className="text-sm font-medium text-neutral-800">
                    {pbi.reporterName || 'Chưa có dữ liệu người tạo'}
                  </span>
                </div>
              </div>

              {/* Ngày tạo */}
              <div>
                <label className="text-body-sm font-semibold text-neutral-500 block mb-1">
                  Ngày tạo
                </label>
                <span className="text-sm text-neutral-700 flex items-center gap-1">
                  <Icon name="calendar" size={14} className="text-neutral-400" />
                  <span>{pbi.createdAt}</span>
                </span>
              </div>
            </div>

            {/* Mô tả yêu cầu */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-body-medium font-bold text-neutral-900 flex items-center gap-1.5">
                  <Icon name="file-text" size={16} className="text-primary-600" />
                  <span>Mô tả yêu cầu</span>
                </h2>
                {!isReadOnly && !pbi.isLocked && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isEditingDescription) {
                        setDescriptionValue(pbi.description)
                        setIsEditingDescription(true)
                      } else {
                        handleSaveDescription()
                      }
                    }}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    {isEditingDescription ? 'Lưu mô tả' : 'Chỉnh sửa'}
                  </button>
                )}
              </div>

              {isEditingDescription ? (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={descriptionValue}
                    onChange={(e) => setDescriptionValue(e.target.value)}
                    className="w-full p-3 rounded-lg border border-primary-500 text-body-sm focus:outline-hidden"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingDescription(false)}
                      className="px-2.5 py-1 text-xs border rounded hover:bg-neutral-100 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDescription}
                      className="px-2.5 py-1 text-xs bg-primary-600 text-whiteboard rounded font-semibold cursor-pointer"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-paper-50 border border-neutral-200 text-body-sm text-neutral-700 leading-relaxed">
                  {pbi.description || 'Chưa có mô tả chi tiết.'}
                </div>
              )}
            </div>

            {/* Danh sách Task kỹ thuật */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-body-medium font-bold text-neutral-900 flex items-center gap-1.5">
                    <Icon name="sliders" size={16} className="text-primary-600" />
                    <span>Danh sách Task kỹ thuật</span>
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-200 text-[11px] font-bold text-neutral-800">
                    {totalTasks}
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-500">
                  Tiến độ: <strong className="text-primary-600">{completedTasks}/{totalTasks}</strong> hoàn thành
                </span>
              </div>

              {/* Task progress bar */}
              <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${taskProgressPercent}%` }}
                />
              </div>

              <div className="space-y-2">
                {pbi.subtasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg border border-neutral-200 flex items-center justify-between text-xs hover:border-neutral-300 transition-colors bg-whiteboard"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-bold text-primary-700 shrink-0">{task.code}</span>
                      <span className="text-neutral-800 truncate">{task.title}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                        task.status === 'done'
                          ? 'bg-success-100 text-success-800'
                          : task.status === 'in_progress'
                            ? 'bg-warning-100 text-warning-800'
                            : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {task.status === 'done'
                        ? 'Hoàn thành'
                        : task.status === 'in_progress'
                          ? 'Đang làm'
                          : 'Cần làm'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tiêu chí hoàn thành (DoD / Acceptance Criteria) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-body-medium font-bold text-neutral-900 flex items-center gap-1.5">
                  <Icon name="check-circle" size={16} className="text-primary-600" />
                  <span>Tiêu chí hoàn thành (DoD)</span>
                </h2>
                <span className="text-xs font-semibold text-primary-600">
                  Đã duyệt {metCriteria}/{totalCriteria}
                </span>
              </div>

              <div className="space-y-2">
                {pbi.acceptanceCriteria.map((ac) => (
                  <label
                    key={ac.id}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={ac.isMet}
                      disabled
                      onChange={() => handleToggleCriteria(ac.id)}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                    <span
                      className={`text-body-sm leading-tight ${
                        ac.isMet ? 'text-neutral-800 font-medium' : 'text-neutral-600'
                      }`}
                    >
                      {ac.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Trao đổi & Thảo luận kỹ thuật (S5-04 reference) */}
            <div className="space-y-3 pt-2 border-t border-neutral-200">
              <h2 className="text-body-medium font-bold text-neutral-900 flex items-center gap-1.5">
                <Icon name="message-square" size={16} className="text-primary-600" />
                <span>Trao đổi & Thảo luận kỹ thuật</span>
              </h2>

              <div className="space-y-3">
                {pbi.comments.map((c) => (
                  <div key={c.id} className="p-3 bg-paper-50 rounded-lg border border-neutral-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-neutral-800 text-whiteboard text-[9px] font-bold flex items-center justify-center">
                          {c.authorAvatar}
                        </div>
                        <span className="text-xs font-bold text-neutral-800">{c.authorName}</span>
                      </div>
                      <span className="text-[11px] text-neutral-400">{c.timestamp}</span>
                    </div>
                    <p className="text-xs text-neutral-700 pl-7">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="space-y-2 pt-2">
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Backend chưa cung cấp API bình luận cho PBI"
                  disabled
                  className="w-full p-2.5 rounded-lg border border-neutral-300 text-xs focus:outline-hidden focus:border-primary-500 bg-paper-50 focus:bg-whiteboard resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-whiteboard text-xs rounded-md font-semibold cursor-pointer disabled:opacity-50"
                  >
                    <Icon name="send" size={12} />
                    <span>Gửi trao đổi</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 px-6 border-t border-neutral-200 bg-paper-50 flex items-center justify-between text-xs text-neutral-500">
            <span>Lần cập nhật cuối: {pbi.updatedAt}</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-neutral-300 hover:bg-neutral-100 rounded-md font-semibold text-neutral-700 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
