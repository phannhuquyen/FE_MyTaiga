import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { CycleTimeScatterPoint, SlowestTaskItem } from '../types'

interface CycleTimeScatterplotProps {
  scatterData: CycleTimeScatterPoint[]
  slowestTasks: SlowestTaskItem[]
}

export function CycleTimeScatterplot({
  scatterData,
  slowestTasks,
}: CycleTimeScatterplotProps) {
  const [hoveredPointId, setHoveredPointId] = useState<string | null>('ct-9') // default highlight #SB-133

  const chartHeight = 240
  const chartWidth = 740
  const paddingLeft = 40
  const paddingRight = 30
  const paddingTop = 25
  const paddingBottom = 30

  const innerWidth = chartWidth - paddingLeft - paddingRight
  const innerHeight = chartHeight - paddingTop - paddingBottom

  const maxY = 10
  const minY = 0

  const getX = (index: number) => {
    if (scatterData.length <= 1) return paddingLeft
    return paddingLeft + (index / (scatterData.length - 1)) * innerWidth
  }

  const getY = (val: number) => {
    return paddingTop + innerHeight - (val / (maxY - minY)) * innerHeight
  }

  const avgY = getY(3.2)
  const slaY = getY(5.0)

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
            <span>Tác vụ hoàn thành (&le; 5d)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-danger-600 inline-block" />
            <span>Dị biệt vượt ngưỡng (&gt; 6d)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-emerald-600 inline-block" />
            <span>Trung bình (3.2d)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-amber-800 dark:border-amber-400 inline-block" />
            <span>Phân vị 85% SLA (5.0d)</span>
          </div>
        </div>
      </div>

      {/* Scatterplot SVG */}
      <div className="w-full bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-700/80 rounded-xl p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[620px] select-none"
        >
          {/* Y Axis Grid & Labels */}
          {[0, 2, 4, 6, 8, 10].map((val) => {
            const y = getY(val)
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-neutral-200 dark:text-neutral-800"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-neutral-400"
                >
                  {val}d
                </text>
              </g>
            )
          })}

          {/* SLA 85% line (5.0d) */}
          <line
            x1={paddingLeft}
            y1={slaY}
            x2={chartWidth - paddingRight}
            y2={slaY}
            stroke="#991b1b"
            strokeDasharray="4 3"
            strokeWidth="1.5"
          />
          <text
            x={chartWidth - paddingRight}
            y={slaY - 6}
            textAnchor="end"
            className="text-[9px] font-bold fill-danger-700 dark:fill-danger-400"
          >
            85% HOÀN TẤT &le; 5.0 NGÀY (SLA CAM KẾT)
          </text>

          {/* Average Line (3.2d) */}
          <line
            x1={paddingLeft}
            y1={avgY}
            x2={chartWidth - paddingRight}
            y2={avgY}
            stroke="#059669"
            strokeWidth="2"
          />
          <text
            x={chartWidth - paddingRight}
            y={avgY - 6}
            textAnchor="end"
            className="text-[9px] font-bold fill-emerald-700 dark:fill-emerald-400"
          >
            TB: 3.2 NGÀY
          </text>

          {/* Scatter dots */}
          {scatterData.map((pt, i) => {
            const cx = getX(i)
            const cy = getY(pt.cycleTimeDays)
            const isHovered = hoveredPointId === pt.id
            const isOutlier = pt.isOutlier || pt.cycleTimeDays > 5.0

            return (
              <g
                key={pt.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPointId(pt.id)}
              >
                {/* Outlier vertical drop line */}
                {isOutlier && (
                  <line
                    x1={cx}
                    y1={cy}
                    x2={cx}
                    y2={paddingTop + innerHeight}
                    stroke="#dc2626"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                )}

                {/* Circle point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : isOutlier ? 5 : 4}
                  fill={isOutlier ? '#dc2626' : '#0d9488'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all"
                />

                {/* Interactive Tooltip on hovered point */}
                {isHovered && (
                  <g
                    transform={`translate(${
                      cx > chartWidth - 180 ? cx - 180 : cx < 80 ? cx : cx - 90
                    }, ${cy > 90 ? cy - 65 : cy + 15})`}
                  >
                    <rect
                      x="0"
                      y="0"
                      width="180"
                      height="54"
                      rx="6"
                      className="fill-neutral-900 shadow-lg"
                    />
                    <text
                      x="10"
                      y="18"
                      className="text-[10px] font-bold fill-white"
                    >
                      {pt.isOutlier ? '🔴 DỊ BIỆT (OUTLIER) ' : ''}
                      {pt.taskCode}
                    </text>
                    <text
                      x="10"
                      y="32"
                      className="text-[10px] fill-neutral-300 truncate"
                    >
                      {pt.taskTitle.slice(0, 26)}
                    </text>
                    <text
                      x="10"
                      y="46"
                      className="text-[9px] font-semibold fill-amber-300"
                    >
                      Cycle Time: {pt.cycleTimeDays} ngày ({pt.assigneeName})
                    </text>
                  </g>
                )}

                {/* Date marker tick on X axis */}
                {i % 3 === 0 && (
                  <text
                    x={cx}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-neutral-400"
                  >
                    {pt.date}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <span>Thời gian chu kỳ tính từ lúc thẻ chuyển sang &ldquo;Đang thực hiện&rdquo; đến &ldquo;Hoàn thành&rdquo;.</span>
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            Tổng số tác vụ hoàn tất: {scatterData.length} tác vụ
          </span>
        </div>
      </div>

      {/* Slowest 5 Tasks Table (S10-03) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="alert-triangle" size={16} className="text-danger-600" />
            5 tác vụ có chu kỳ hoàn tất lâu nhất (Slowest 5 Tasks)
          </h4>
          <span className="text-xs text-neutral-400">Xếp hạng theo độ trễ thời gian chu kỳ</span>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 font-semibold border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="py-2.5 px-4">Mã thẻ & Tiêu đề</th>
                <th className="py-2.5 px-4 w-40">Người thực hiện</th>
                <th className="py-2.5 px-4 w-28">Ngày bắt đầu</th>
                <th className="py-2.5 px-4 w-28">Ngày hoàn tất</th>
                <th className="py-2.5 px-4 w-28 text-right">Cycle Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700/60">
              {slowestTasks.map((task) => (
                <tr key={task.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-danger-600">{task.taskCode}</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {task.taskTitle}
                      </span>
                      {task.hasFlag && <Icon name="flag" size={13} className="text-danger-500" />}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-800 text-[10px] font-bold flex items-center justify-center">
                        {task.assigneeAvatar || 'MQ'}
                      </div>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {task.assigneeName}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-neutral-500 whitespace-nowrap">{task.startDate}</td>
                  <td className="py-2.5 px-4 text-neutral-500 whitespace-nowrap">
                    {task.completedDate}
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    {task.isExceeded ? (
                      <span className="px-2 py-0.5 rounded font-bold text-danger-700 bg-danger-50 border border-danger-200 dark:bg-danger-950 dark:text-danger-300">
                        {task.cycleTimeDays} ngày
                      </span>
                    ) : (
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                        {task.cycleTimeDays} ngày
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Manager Recommendation */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-xl flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">💡 Khuyến nghị quản lý:</span>
            <span>
              Tác vụ vượt quá 5.0 ngày chiếm 16.6% trong sprint này, cần phân tích nguyên nhân nghẽn
              mã tại buổi Retro.
            </span>
          </div>
          <button
            type="button"
            onClick={() => alert('Phân tích nguyên nhân: Thời gian chờ code review và UAT chiếm 65% tổng thời gian.')}
            className="text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            <span>Xem phân tích nguyên nhân tắc nghẽn</span>
            <Icon name="arrow-right" size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
