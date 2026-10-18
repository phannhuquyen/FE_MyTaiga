import { Badge, Button, Icon, ProgressBar } from '@/components/ui'
import type { ProjectInfo } from '../types'

export interface ProjectHeaderProps {
  project: ProjectInfo | null
  onConfigureWorkflow?: () => void
  onAddTask?: () => void
}

export function ProjectHeader({
  project,
  onConfigureWorkflow,
  onAddTask,
}: ProjectHeaderProps) {
  if (!project) return null

  return (
    <section className="bg-whiteboard rounded-lg border border-neutral-200 p-5 shadow-xs">
      {/* Top row: Title + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-headline-lg font-bold text-neutral-900 tracking-tight">
              {project.name}
            </h1>
            <Badge variant="primary" dot>
              {project.role}
            </Badge>
          </div>
          <p className="mt-1 text-body-sm text-neutral-500">
            Thời gian: {project.startDate} – {project.endDate} • {project.sprintCycle}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onConfigureWorkflow}
            leftIcon={<Icon name="sliders" size={16} className="text-neutral-500" />}
          >
            Cấu hình luồng
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onAddTask}
            leftIcon={<Icon name="plus" size={16} />}
          >
            Thêm công việc
          </Button>
        </div>
      </div>

      {/* Progress Bar Row */}
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <div className="flex justify-between items-center mb-1.5 text-body-sm">
          <span className="text-neutral-600 font-medium">
            Tiến độ tổng thể dự án
          </span>
          <span className="text-neutral-800 font-semibold">
            {project.progressPercentage}% hoàn thành ({project.completedTasks}/{project.totalTasks} công việc)
          </span>
        </div>
        <ProgressBar
          value={project.progressPercentage}
          variant="primary"
          height="md"
        />
      </div>
    </section>
  )
}
