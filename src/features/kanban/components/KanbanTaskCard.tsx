import type { KanbanTask } from '../types'
import { Icon } from '@/components/ui'

export interface KanbanTaskCardProps {
  task: KanbanTask
  onClick: (task: KanbanTask) => void
  onDelete: (task: KanbanTask) => void
}

export function KanbanTaskCard({ task, onClick, onDelete }: KanbanTaskCardProps) {
  const getPriorityDot = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'bg-danger-500'
      case 'high':
        return 'bg-amber-500'
      case 'medium':
        return 'bg-primary-500'
      default:
        return 'bg-neutral-400'
    }
  }

  const subtaskCount = task.subtasks?.length || 0
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0

  return (
    <div
      onClick={() => onClick(task)}
      className="group relative bg-whiteboard rounded-lg border border-neutral-200 p-3 shadow-xs hover:shadow-md hover:border-primary-300 transition-all cursor-pointer select-none space-y-2.5"
    >
      {/* Top Header: Code, Priority dot & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${getPriorityDot(task.priority)} shrink-0`} />
          <span className="font-mono text-xs font-bold text-neutral-800">
            {task.code}
          </span>
          {task.pbiCode && (
            <span className="text-[10px] text-neutral-400 font-mono">
              ({task.pbiCode})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {task.storyPoints !== undefined && (
            <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-1.5 py-0.2 rounded">
              {task.storyPoints} SP
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-danger-600 rounded transition-opacity"
            title="Xóa tác vụ"
          >
            <Icon name="trash" size={13} />
          </button>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-semibold text-neutral-900 line-clamp-2 leading-relaxed">
        {task.title}
      </h4>

      {/* Tags if any */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Metadata: Deadline, Subtask counter & Assignee */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-xs">
        <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
          {task.deadline && (
            <span className="flex items-center gap-1">
              <Icon name="calendar" size={12} className="text-neutral-400" />
              <span>{task.deadline}</span>
            </span>
          )}

          {subtaskCount > 0 && (
            <span className="flex items-center gap-0.5 text-neutral-400">
              <Icon name="check" size={12} />
              <span>{completedSubtasks}/{subtaskCount}</span>
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        <div
          className="w-6 h-6 rounded-full bg-neutral-800 text-whiteboard text-[10px] font-bold flex items-center justify-center ring-2 ring-whiteboard shrink-0"
          title={`Người thực hiện: ${task.assignee.name}`}
        >
          {task.assignee.avatarCode}
        </div>
      </div>
    </div>
  )
}
