import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { SprintSummary, PBI } from '../types'

interface SprintCapacitySidebarProps {
  sprints: SprintSummary[]
  activeSprintId?: string
  draggedPBI: PBI | null
  onDropPBI: (sprintId: string) => void
  onDragEnd: () => void
  isReadOnly?: boolean
}

export function SprintCapacitySidebar({
  sprints,
  draggedPBI,
  onDropPBI,
  isReadOnly = false,
}: SprintCapacitySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-whiteboard border-l border-neutral-200 flex flex-col items-center py-4 gap-4">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-neutral-500 hover:text-neutral-800 rounded-md transition-colors cursor-pointer"
          title="Mở rộng Chu kỳ Sprint"
        >
          <Icon name="chevron-left" size={16} />
        </button>
        <span className="text-xs font-bold text-neutral-400 rotate-90 whitespace-nowrap mt-8">
          Chu kỳ Sprint
        </span>
      </aside>
    )
  }

  return (
    <aside className="w-80 lg:w-96 bg-whiteboard border-l border-neutral-200 flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <h2 className="text-body-medium font-bold text-neutral-900">Chu kỳ Sprint</h2>
          <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-bold">
            {sprints.length} Sprint
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors cursor-pointer"
          title="Thu gọn sidebar"
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      {/* Dragging alert banner */}
      {draggedPBI && (
        <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg animate-pulse text-xs text-primary-900 flex items-start gap-2">
          <Icon name="info" size={16} className="text-primary-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Đang kéo #{draggedPBI.code}</div>
            <div>Thả vào một trong các Sprint bên dưới để phân bổ thẻ ngay.</div>
          </div>
        </div>
      )}

      {/* Sprints List */}
      <div className="space-y-4">
        {sprints.map((sprint) => {
          const isTargetSprint = sprint.id === 'sprint-15' && Boolean(draggedPBI)
          const addedSP = draggedPBI ? draggedPBI.storyPoints : 0
          const projectedSP = isTargetSprint ? sprint.assignedSP + addedSP : sprint.assignedSP
          const percent = Math.min(100, Math.round((projectedSP / sprint.capacity) * 100))

          return (
            <div
              key={sprint.id}
              onDragOver={(e) => {
                if (!isReadOnly) e.preventDefault()
              }}
              onDrop={(e) => {
                if (!isReadOnly) {
                  e.preventDefault()
                  onDropPBI(sprint.id)
                }
              }}
              className={`rounded-xl border transition-all p-3.5 space-y-3 ${
                isTargetSprint
                  ? 'border-2 border-primary-500 bg-primary-50/40 shadow-md ring-2 ring-primary-200'
                  : sprint.status === 'active'
                    ? 'border-neutral-300 bg-paper-50/50'
                    : 'border-neutral-200 bg-whiteboard'
              }`}
            >
              {/* Title & Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-neutral-900 leading-snug truncate">
                    {sprint.name}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {sprint.dateRange} {sprint.daysLeft ? `(${sprint.daysLeft})` : ''}
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    sprint.status === 'active'
                      ? 'bg-success-100 text-success-800'
                      : sprint.status === 'planned'
                        ? 'bg-info-100 text-info-800'
                        : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  ● {sprint.status === 'active'
                    ? 'Đang chạy'
                    : sprint.status === 'planned'
                      ? 'Đã lên KH'
                      : 'Dự thảo'}
                </span>
              </div>

              {/* Capacity Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Dung lượng tải:</span>
                  <span className="font-semibold text-neutral-800">
                    {projectedSP} / {sprint.capacity} SP ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      percent > 90
                        ? 'bg-danger-500'
                        : percent > 75
                          ? 'bg-warning-500'
                          : 'bg-primary-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Drop Zone Box (S5-01 & S5-08 reference) */}
              {!isReadOnly && (
                <div
                  onClick={() => onDropPBI(sprint.id)}
                  className={`p-2.5 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    isTargetSprint
                      ? 'border-primary-500 bg-primary-100/60 text-primary-900'
                      : 'border-primary-300 hover:border-primary-500 bg-primary-50/20 hover:bg-primary-50/50 text-primary-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Icon name="clock" size={14} />
                    <span>
                      {isTargetSprint
                        ? `Thả vào đây để thêm vào ${sprint.name}`
                        : `Kéo thẻ hoặc click để gán vào ${sprint.name.split(':')[0]}`}
                    </span>
                  </div>
                  {isTargetSprint && addedSP > 0 && (
                    <span className="text-[11px] font-bold text-primary-800 mt-0.5">
                      +{addedSP} SP dự kiến từ #{draggedPBI?.code}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tip Box (S5-01 reference) */}
      <div className="p-3.5 bg-paper-100/80 rounded-xl border border-neutral-200 space-y-1.5 text-xs text-neutral-700">
        <div className="font-bold text-neutral-900 flex items-center gap-1.5">
          <span className="text-primary-600">💡</span>
          <span>Mẹo điều phối (ScrumBan)</span>
        </div>
        <p className="text-[11.5px] leading-relaxed text-neutral-600">
          Ưu tiên giải quyết các thẻ có trạng thái "Sẵn sàng" trước phiên họp Sprint Planning. Giữ
          giới hạn WIP cho Sprint 14 dưới 24 Story Points.
        </p>
      </div>
    </aside>
  )
}
