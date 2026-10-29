import { Icon } from '@/components/ui'
import type { SprintInfo } from '../types'

export interface SprintBannerProps {
  sprint: SprintInfo | null
}

export function SprintBanner({ sprint }: SprintBannerProps) {
  if (!sprint) return <section className="bg-whiteboard rounded-lg border border-neutral-200 p-4 text-neutral-500">Chưa có Sprint đang diễn ra trong dự án.</section>

  return (
    <section className="bg-whiteboard rounded-lg border border-neutral-200 p-4 shadow-xs">
      {/* Header: Sprint title + Status badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
          <h2 className="text-headline-sm font-semibold text-neutral-900">
            {sprint.name}
          </h2>
        </div>
        <div className="text-body-sm text-neutral-600 flex items-center gap-1.5 shrink-0 self-start sm:self-auto bg-neutral-100 px-2 py-0.5 rounded">
          <span className="text-primary-600">⚡</span>
          <span className="font-medium text-neutral-800">{sprint.status}</span>
          <span className="text-neutral-400">•</span>
          <span>Còn {sprint.daysLeft} ngày</span>
        </div>
      </div>

      {/* Goal description */}
      <p className="mt-2 text-body-default text-neutral-600 leading-relaxed">
        {sprint.goal}
      </p>

      {/* Metrics Row */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-4 sm:gap-6 text-body-sm text-neutral-700">
        <div className="flex items-center gap-1.5">
          <Icon name="flag" size={16} className="text-neutral-400" />
          <span>Cam kết:</span>
          <span className="font-semibold text-neutral-900">
            {sprint.committedPoints} Story Points
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Icon name="check-circle" size={16} className="text-success-500" />
          <span>Đã đạt:</span>
          <span className="font-semibold text-neutral-900">
            {sprint.completedPoints}/{sprint.committedPoints} SP (
            {Math.round(
              sprint.committedPoints ? (sprint.completedPoints / sprint.committedPoints) * 100 : 0,
            )}
            %)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Icon name="clock" size={16} className="text-warning-500" />
          <span>WIP hiện tại:</span>
          <span className="font-semibold text-neutral-900">
            {sprint.wipCount} việc
          </span>
        </div>
      </div>
    </section>
  )
}
