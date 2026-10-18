import type { KanbanColumnConfig, KanbanTask } from '../types'
import { KanbanTaskCard } from './KanbanTaskCard'
import { Icon } from '@/components/ui'

export interface KanbanColumnProps {
  column: KanbanColumnConfig
  tasks: KanbanTask[]
  onTaskClick: (task: KanbanTask) => void
  onTaskDelete: (task: KanbanTask) => void
  onQuickAddTask: (columnId: KanbanColumnConfig['id']) => void
  onToggleCollapse: (columnId: KanbanColumnConfig['id']) => void
  onDropTask?: (taskId: string, targetColumnId: KanbanColumnConfig['id']) => void
}

export function KanbanColumn({
  column,
  tasks,
  onTaskClick,
  onTaskDelete,
  onQuickAddTask,
  onToggleCollapse,
  onDropTask,
}: KanbanColumnProps) {
  const currentCount = tasks.length
  const limit = column.wipLimit
  const isOverWIP = limit !== null && currentCount > limit
  const isAtWIP = limit !== null && currentCount === limit

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId && onDropTask) {
      onDropTask(taskId, column.id)
    }
  }

  if (column.isCollapsed) {
    return (
      <div
        onClick={() => onToggleCollapse(column.id)}
        className="w-12 bg-neutral-100 rounded-xl border border-neutral-200 p-2 flex flex-col items-center justify-between cursor-pointer hover:bg-neutral-200/70 transition-colors select-none shrink-0"
        title={`Mở rộng cột ${column.title}`}
      >
        <div className="flex flex-col items-center gap-2 pt-2">
          <span className={`w-2.5 h-2.5 rounded-full ${column.colorDot}`} />
          <span className="text-xs font-bold text-neutral-700 writing-mode-vertical rotate-180">
            {column.title}
          </span>
        </div>
        <div className="text-xs font-bold text-neutral-500 pb-2">
          {currentCount}
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`w-72 lg:w-80 flex flex-col rounded-xl border transition-colors select-none shrink-0 ${
        isOverWIP
          ? 'bg-danger-50/40 border-danger-300'
          : 'bg-neutral-100/90 border-neutral-200/90'
      }`}
    >
      {/* Column Header (S8-01, S8-03, S8-12) */}
      <div className="p-3 border-b border-neutral-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${column.colorDot}`} />
          <h3 className="text-xs font-bold text-neutral-800">
            {column.title}
          </h3>
          <span className="text-xs font-semibold text-neutral-500">
            {currentCount}
          </span>

          {/* WIP Badge (S8-03 & S8-12) */}
          {limit !== null && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                isOverWIP
                  ? 'bg-danger-600 text-white animate-pulse'
                  : isAtWIP
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {isOverWIP ? `⚠ ${currentCount}/${limit} Vượt WIP` : `${currentCount}/${limit}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onQuickAddTask(column.id)}
            className="p-1 text-neutral-500 hover:text-neutral-800 rounded hover:bg-neutral-200 transition-colors"
            title="Thêm thẻ vào cột này"
          >
            <Icon name="plus" size={14} />
          </button>
          <button
            type="button"
            onClick={() => onToggleCollapse(column.id)}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded hover:bg-neutral-200 transition-colors"
            title="Thu gọn cột"
          >
            <Icon name="chevron-left" size={14} />
          </button>
        </div>
      </div>

      {/* Task List container */}
      <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-270px)] min-h-[140px]">
        {tasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400 border border-dashed border-neutral-300 rounded-lg p-3">
            <span>Không có thẻ nào trong cột này</span>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', task.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
            >
              <KanbanTaskCard
                task={task}
                onClick={onTaskClick}
                onDelete={onTaskDelete}
              />
            </div>
          ))
        )}

        {/* Quick Add Button at bottom of column (S8-01) */}
        <button
          type="button"
          onClick={() => onQuickAddTask(column.id)}
          className="w-full py-2 px-3 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:text-primary-700 hover:border-primary-400 hover:bg-whiteboard transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
        >
          <Icon name="plus" size={13} />
          <span>Thêm task nhanh</span>
        </button>
      </div>
    </div>
  )
}
