import { useState } from 'react'
import type { Sprint } from '../types'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'

interface SprintBurndownTabProps {
  sprint: Sprint
}

export function SprintBurndownTab({ sprint }: SprintBurndownTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'burndown' | 'throughput'>('burndown')
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  const burndown = sprint.burndownPoints || []
  const maxSP = Math.max(sprint.totalSP || 24, 24)

  // SVG Chart dimensions
  const chartWidth = 720
  const chartHeight = 240
  const paddingX = 40
  const paddingY = 30
  const graphWidth = chartWidth - paddingX * 2
  const graphHeight = chartHeight - paddingY * 2

  // Coordinates helper
  const getX = (index: number) => {
    const totalPoints = Math.max(burndown.length - 1, 1)
    return paddingX + (index / totalPoints) * graphWidth
  }

  const getY = (sp: number) => {
    return paddingY + (1 - Math.min(Math.max(sp, 0), maxSP) / maxSP) * graphHeight
  }

  // Ideal line path
  const idealPath = burndown.length > 0
    ? burndown.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.idealRemaining)}`).join(' ')
    : ''

  // Actual line path (only for points with actualRemaining defined)
  const actualPoints = burndown.filter((pt) => pt.actualRemaining !== undefined)
  const actualPath = actualPoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.actualRemaining!)}`)
    .join(' ')

  const incompleteItems = sprint.items.filter((item) => item.status !== 'done')
  const incompleteSP = incompleteItems.reduce((acc, item) => acc + item.storyPoints, 0)

  return (
    <div className="space-y-6">
      {/* Sub-view switcher & High-level KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-light pb-4 dark:border-border-dark">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('burndown')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeSubTab === 'burndown'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-neutral-100 text-text-secondary-light hover:bg-neutral-200 dark:bg-neutral-800 dark:text-text-secondary-dark'
            }`}
          >
            <Icon name="metrics" size={14} />
            Biểu đồ Burndown
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('throughput')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeSubTab === 'throughput'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-neutral-100 text-text-secondary-light hover:bg-neutral-200 dark:bg-neutral-800 dark:text-text-secondary-dark'
            }`}
          >
            <Icon name="dashboard" size={14} />
            Throughput & Vận tốc
          </button>
        </div>

        {/* Quick KPI badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800">
            <span className="text-text-secondary-light dark:text-text-secondary-dark">Tổng điểm:</span>
            <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{sprint.totalSP} SP</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <span>Đã đốt:</span>
            <span className="font-bold">{sprint.completedSP} SP ({sprint.progressPercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <span>Còn lại:</span>
            <span className="font-bold">{incompleteSP} SP</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            <span>Thời gian:</span>
            <span className="font-bold">{sprint.daysLeft || '4 ngày'}</span>
          </div>
        </div>
      </div>

      {activeSubTab === 'burndown' ? (
        <>
          {/* Main SVG Burndown Chart Container */}
          <div className="rounded-xl border border-border-light bg-white p-5 shadow-xs dark:border-border-dark dark:bg-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                  Biểu đồ tiêu hao năng lực (Burndown Chart)
                </h3>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  Theo dõi số Story Points còn lại theo từng ngày thực tế so với đường chuẩn lý thuyết.
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-neutral-400" />
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Đường lý tưởng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-primary-600" />
                  <span className="font-semibold text-primary-700 dark:text-primary-400">Thực tế</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-amber-500 rounded-2xs" />
                  <span className="text-amber-600 dark:text-amber-400">Hôm nay (D10)</span>
                </div>
              </div>
            </div>

            {/* SVG Visual */}
            <div className="overflow-x-auto">
              <div className="min-w-[680px]">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-64 overflow-visible"
                >
                  {/* Grid Lines */}
                  {[0, 6, 12, 18, 24].map((gridSp) => (
                    <g key={gridSp}>
                      <line
                        x1={paddingX}
                        y1={getY(gridSp)}
                        x2={chartWidth - paddingX}
                        y2={getY(gridSp)}
                        stroke="currentColor"
                        strokeOpacity="0.08"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={paddingX - 8}
                        y={getY(gridSp) + 4}
                        textAnchor="end"
                        className="text-[10px] fill-neutral-400 font-medium"
                      >
                        {gridSp}
                      </text>
                    </g>
                  ))}

                  {/* Ideal Line (Dashed) */}
                  <path
                    d={idealPath}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Today Marker Vertical Bar */}
                  {burndown.findIndex((p) => p.isToday) !== -1 && (
                    <g>
                      <line
                        x1={getX(burndown.findIndex((p) => p.isToday))}
                        y1={paddingY}
                        x2={getX(burndown.findIndex((p) => p.isToday))}
                        y2={chartHeight - paddingY}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    </g>
                  )}

                  {/* Actual Burndown Path (Solid Brand) */}
                  <path
                    d={actualPath}
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Actual Data Points */}
                  {actualPoints.map((pt, i) => {
                    const cx = getX(i)
                    const cy = getY(pt.actualRemaining!)
                    const isHovered = hoveredPoint === i

                    return (
                      <g
                        key={pt.dayLabel}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(i)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <circle
                          cx={cx}
                          cy={cy}
                          r={pt.isToday ? 6 : isHovered ? 5 : 3.5}
                          className={`${
                            pt.isToday
                              ? 'fill-amber-500 stroke-white dark:stroke-neutral-800'
                              : 'fill-primary-600 stroke-white dark:stroke-neutral-800'
                          }`}
                          strokeWidth="2"
                        />

                        {/* Special Callout for Today */}
                        {pt.isToday && (
                          <g transform={`translate(${cx}, ${cy - 28})`}>
                            <rect
                              x="-42"
                              y="-10"
                              width="84"
                              height="20"
                              rx="5"
                              className="fill-amber-500 drop-shadow-xs"
                            />
                            <text
                              x="0"
                              y="4"
                              textAnchor="middle"
                              className="text-[10px] font-bold fill-white"
                            >
                              Hôm nay: Còn {pt.actualRemaining}
                            </text>
                          </g>
                        )}

                        {/* Interactive Tooltip on hover */}
                        {isHovered && !pt.isToday && (
                          <g transform={`translate(${cx}, ${cy - 26})`}>
                            <rect
                              x="-38"
                              y="-9"
                              width="76"
                              height="18"
                              rx="4"
                              className="fill-neutral-900 drop-shadow-xs"
                            />
                            <text
                              x="0"
                              y="4"
                              textAnchor="middle"
                              className="text-[9px] font-semibold fill-white"
                            >
                              Còn {pt.actualRemaining} SP
                            </text>
                          </g>
                        )}
                      </g>
                    )
                  })}

                  {/* X Axis Day Labels */}
                  {burndown.map((pt, i) => (
                    <g key={pt.dayLabel}>
                      <text
                        x={getX(i)}
                        y={chartHeight - paddingY + 16}
                        textAnchor="middle"
                        className={`text-[9px] ${
                          pt.isToday
                            ? 'font-bold fill-amber-600 dark:fill-amber-400'
                            : 'fill-neutral-400 font-medium'
                        }`}
                      >
                        D{i + 1}
                      </text>
                      {i % 3 === 0 && (
                        <text
                          x={getX(i)}
                          y={chartHeight - paddingY + 28}
                          textAnchor="middle"
                          className="text-[8px] fill-neutral-400"
                        >
                          {pt.dateStr}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* 2-Column Details: Score Adjustments & Remaining Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Score Adjustments / Scope Changes Log */}
            <div className="rounded-xl border border-border-light bg-white p-5 shadow-xs dark:border-border-dark dark:bg-neutral-800">
              <div className="flex items-center justify-between mb-3.5">
                <h4 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">
                  Lịch sử điều chỉnh điểm & Scope changes
                </h4>
                <Badge variant="neutral">3 biến động</Badge>
              </div>

              <div className="space-y-3">
                {(sprint.scoreAdjustments || []).map((adj) => (
                  <div
                    key={adj.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-border-light/80 bg-neutral-50/50 dark:border-border-dark/80 dark:bg-neutral-900/40 text-xs"
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                          {adj.taskCode}
                        </span>
                        <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                          {adj.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                        {adj.dateLabel}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 font-bold px-2 py-0.5 rounded-sm ${
                        adj.pointsDelta > 0
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}
                    >
                      {adj.pointsDelta > 0 ? `+${adj.pointsDelta} SP` : `${adj.pointsDelta} SP`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Remaining Items & Velocity forecast */}
            <div className="rounded-xl border border-border-light bg-white p-5 shadow-xs dark:border-border-dark dark:bg-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">
                  Nhiệm vụ còn lại trong 4 ngày tới
                </h4>
                <Badge variant="warning">{incompleteItems.length} thẻ ({incompleteSP} SP)</Badge>
              </div>

              <div className="space-y-2.5">
                {incompleteItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border-light bg-white shadow-2xs dark:border-border-dark dark:bg-neutral-900/60 text-xs"
                  >
                    <div className="space-y-1 truncate pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-primary-600 dark:text-primary-400">
                          {item.code}
                        </span>
                        <span className="truncate font-medium text-text-primary-light dark:text-text-primary-dark">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                        <span>Phụ trách: {item.assigneeName || 'Chưa gán'}</span>
                        <span>•</span>
                        <span>{item.criteriaCount || '3/4 tiêu chí'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={item.status === 'in_progress' ? 'warning' : 'neutral'}>
                        {item.status === 'in_progress' ? 'Đang làm' : 'Sẵn sàng'}
                      </Badge>
                      <span className="font-bold text-text-primary-light dark:text-text-primary-dark">
                        {item.storyPoints} SP
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Warning / Pace forecast */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-start gap-2.5">
                <Icon name="check-circle" size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <span className="font-bold">Đánh giá tiến độ (On track):</span> Còn 4 ngày làm việc cho {incompleteSP} SP còn lại. Với vận tốc trung bình 1.5 SP/ngày của nhóm, Sprint hoàn toàn có khả năng hoàn thành đúng hạn 100%.
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Throughput & Flow Metrics View (S7-11) */
        <div className="space-y-6">
          {/* Top flow stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border-light bg-white p-4 shadow-2xs dark:border-border-dark dark:bg-neutral-800">
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Throughput Sprint</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">18 SP</span>
                <span className="text-xs font-semibold text-emerald-600">6 thẻ xong</span>
              </div>
              <p className="mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">Đạt 75% kế hoạch cam kết</p>
            </div>

            <div className="rounded-xl border border-border-light bg-white p-4 shadow-2xs dark:border-border-dark dark:bg-neutral-800">
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Hiệu suất luồng (Flow Efficiency)</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">78%</span>
                <span className="text-xs font-semibold text-emerald-600">+4% vs SP13</span>
              </div>
              <p className="mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">Thời gian chờ hàng đợi thấp</p>
            </div>

            <div className="rounded-xl border border-border-light bg-white p-4 shadow-2xs dark:border-border-dark dark:bg-neutral-800">
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Lead Time trung bình</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">3.2 ngày</span>
                <span className="text-xs font-semibold text-text-secondary-light">/ thẻ PBI</span>
              </div>
              <p className="mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">Từ khi cam kết đến Done</p>
            </div>

            <div className="rounded-xl border border-border-light bg-white p-4 shadow-2xs dark:border-border-dark dark:bg-neutral-800">
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">W.I.P trung bình</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">1.8 thẻ</span>
                <span className="text-xs text-emerald-600 font-semibold">Tối ưu (&lt; 2)</span>
              </div>
              <p className="mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">Giới hạn nghẽn cổ chai tốt</p>
            </div>
          </div>

          {/* Historical Velocity Comparison */}
          <div className="rounded-xl border border-border-light bg-white p-5 shadow-xs dark:border-border-dark dark:bg-neutral-800 space-y-4">
            <h4 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">
              So sánh Vận tốc (Velocity) qua các Sprint gần nhất
            </h4>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Sprint 12 (Đã hoàn tất)</span>
                  <span className="font-semibold text-text-secondary-light">19 / 20 SP (95%)</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-700 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-neutral-400 h-full rounded-full" style={{ width: '95%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Sprint 13 (Đã hoàn tất)</span>
                  <span className="font-semibold text-emerald-600">22 / 22 SP (100%)</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-700 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-primary-700 dark:text-primary-400 font-semibold">Sprint 14 (Đang chạy - Hiện tại)</span>
                  <span className="font-bold text-primary-600">18 / 24 SP (75%) • Dự kiến: 24 SP</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-700 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-primary-600 h-full rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
