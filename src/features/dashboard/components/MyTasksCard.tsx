import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { TaskItem, TaskStatus, TaskType } from '../types'

export interface MyTasksCardProps {
  tasks: TaskItem[]
  allTasksCount: number
  selectedTaskId: string
  onSelectTask: (id: string) => void
  searchTerm?: string
}

export function MyTasksCard({
  tasks,
  allTasksCount,
  selectedTaskId,
  onSelectTask,
  searchTerm = '',
}: MyTasksCardProps) {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Đang làm':
        return 'text-info-600'
      case 'Sẵn sàng Test':
        return 'text-warning-600'
      case 'Chờ duyệt':
        return 'text-warning-600'
      case 'Hoàn thành':
        return 'text-success-600'
      case 'Cần làm':
      default:
        return 'text-neutral-500'
    }
  }

  const getTypeBadge = (type: TaskType) => {
    switch (type) {
      case 'Bug':
        return { label: 'Bug', color: 'text-error-600' }
      case 'Story':
        return { label: 'Story', color: 'text-primary-600' }
      case 'Task':
      default:
        return { label: 'Task', color: 'text-neutral-600' }
    }
  }

  return (
    <section className="bg-whiteboard rounded-lg border border-neutral-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <h2 className="text-headline-sm font-semibold text-neutral-900">
            Việc của tôi
          </h2>
          <Badge variant="neutral">
            {allTasksCount} việc cần làm
          </Badge>
        </div>
        <Link
          to="/kanban"
          className="text-body-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Đến bảng Kanban</span>
          <span>→</span>
        </Link>
      </div>

      {/* Tasks Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-100 bg-paper-50 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              <th className="py-2.5 px-4">Mã & Tên công việc</th>
              <th className="py-2.5 px-3">Phân loại</th>
              <th className="py-2.5 px-3">Trạng thái</th>
              <th className="py-2.5 px-4 text-right">Hạn xong</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-body-sm">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-neutral-500">
                  {searchTerm
                    ? `Không tìm thấy công việc nào khớp với "${searchTerm}".`
                    : 'Chưa có công việc nào cần xử lý.'}
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isSelected = task.id === selectedTaskId
                const typeInfo = getTypeBadge(task.type)
                const isOverdueOrToday = task.dueDate === 'Hôm nay'

                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className={cn(
                      'transition-colors cursor-pointer group',
                      isSelected
                        ? 'bg-primary-50/70 border-l-4 border-primary-500'
                        : 'hover:bg-neutral-50 border-l-4 border-transparent',
                    )}
                  >
                    {/* Task Code & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            'text-xs font-semibold px-2 py-0.5 rounded shrink-0 transition-colors',
                            isSelected
                              ? 'bg-primary-500 text-whiteboard'
                              : 'bg-primary-100 text-primary-800 group-hover:bg-primary-200',
                          )}
                        >
                          {task.code}
                        </span>
                        <span className="font-medium text-neutral-800 line-clamp-1 group-hover:text-primary-700">
                          {task.title}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-body-sm">
                        <span
                          className={cn('w-1.5 h-1.5 rounded-full shrink-0', {
                            'bg-error-500': task.type === 'Bug',
                            'bg-primary-500': task.type === 'Story',
                            'bg-neutral-500': task.type === 'Task',
                          })}
                        />
                        <span className={typeInfo.color}>{typeInfo.label}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-body-sm">
                        <span
                          className={cn('w-1.5 h-1.5 rounded-full shrink-0', {
                            'bg-info-500': task.status === 'Đang làm',
                            'bg-warning-500':
                              task.status === 'Sẵn sàng Test' ||
                              task.status === 'Chờ duyệt',
                            'bg-success-500': task.status === 'Hoàn thành',
                            'bg-neutral-400': task.status === 'Cần làm',
                          })}
                        />
                        <span className={getStatusColor(task.status)}>
                          {task.status}
                        </span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={cn(
                          'text-body-sm',
                          isOverdueOrToday
                            ? 'text-danger-600 font-semibold'
                            : 'text-neutral-500',
                        )}
                      >
                        {task.dueDate}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
