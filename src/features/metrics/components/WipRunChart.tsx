import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { WipRunPoint } from '../types'

interface WipRunChartProps {
  data: WipRunPoint[]
  wipLimit?: number
}

export function WipRunChart({ data, wipLimit = 8 }: WipRunChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(7) // default highlight 21/10

  const chartHeight = 220
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
    if (data.length <= 1) return paddingLeft
    return paddingLeft + (index / (data.length - 1)) * innerWidth
  }

  const getY = (val: number) => {
    return paddingTop + innerHeight - (val / (maxY - minY)) * innerHeight
  }

  const pointsString = data
    .map((d, i) => `${getX(i)},${getY(d.actualWip)}`)
    .join(' ')

  const limitY = getY(wipLimit)

  return (
    <div className="space-y-4">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Xu hướng số lượng việc dở dang (WIP Run Chart)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Chuỗi 14 ngày làm việc từ 14/10 đến 28/10/2024
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-teal-700 dark:bg-teal-400 inline-block" />
            <span>WIP thực tế (hàng ngày)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-neutral-400 inline-block" />
            <span>Ngưỡng WIP trần (WIP Limit: {wipLimit})</span>
          </div>
          <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-500 rounded">
            Đo lường tại 18:00 hàng ngày
          </span>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="w-full bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-700/80 rounded-xl p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[620px] select-none"
        >
          {/* Horizontal grid lines & Y labels */}
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
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-neutral-400"
                >
                  {val}
                </text>
              </g>
            )
          })}

          {/* WIP Limit Dashed Line */}
          <line
            x1={paddingLeft}
            y1={limitY}
            x2={chartWidth - paddingRight}
            y2={limitY}
            stroke="#737373"
            strokeDasharray="4 3"
            strokeWidth="1.5"
          />
          <text
            x={chartWidth - paddingRight}
            y={limitY - 6}
            textAnchor="end"
            className="text-[9px] font-semibold fill-neutral-500"
          >
            NGƯỠNG TRẦN: {wipLimit} THẺ
          </text>

          {/* Actual WIP Polyline */}
          <polyline
            points={pointsString}
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {data.map((d, i) => {
            const cx = getX(i)
            const cy = getY(d.actualWip)
            const isHovered = hoveredIndex === i

            return (
              <g key={d.date} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(i)}>
                {/* Vertical dash on hover */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingTop}
                    x2={cx}
                    y2={paddingTop + innerHeight}
                    stroke="#0d9488"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                )}

                {/* Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#ffffff"
                  stroke="#0f766e"
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="transition-all"
                />

                {/* Tooltip on hovered point */}
                {isHovered && (
                  <g transform={`translate(${cx}, ${cy - 12})`}>
                    <rect
                      x="-42"
                      y="-22"
                      width="84"
                      height="20"
                      rx="4"
                      className="fill-neutral-900"
                    />
                    <text
                      x="0"
                      y="-8"
                      textAnchor="middle"
                      className="text-[10px] font-semibold fill-white"
                    >
                      {d.date}: {d.actualWip} thẻ
                    </text>
                  </g>
                )}

                {/* X axis date labels */}
                <text
                  x={cx}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className={`text-[10px] ${
                    isHovered ? 'font-bold fill-neutral-900 dark:fill-neutral-100' : 'fill-neutral-400'
                  }`}
                >
                  {d.date}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Assessment footer callout (S10-01) */}
      <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
        <Icon name="check-circle" size={16} className="text-emerald-600 shrink-0" />
        <div>
          <strong>Đánh giá điều phối:</strong> Luồng công việc duy trì ổn định dưới ngưỡng WIP trần
          (&le; {wipLimit} thẻ), không phát hiện tắc nghẽn (bottleneck) nghiêm trọng nào trong chu kỳ
          Sprint 14.
        </div>
      </div>
    </div>
  )
}
