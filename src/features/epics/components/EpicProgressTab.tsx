import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui'
import { epicService } from '../services/epicService'
import type { Epic, EpicProgressBreakdown } from '../types'

export interface EpicProgressTabProps {
  epic: Epic
}

export function EpicProgressTab({ epic }: EpicProgressTabProps) {
  const [breakdown, setBreakdown] = useState<EpicProgressBreakdown[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    epicService.getProgressBreakdown(epic.id).then((data) => {
      if (active) {
        setBreakdown(data)
        setIsLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [epic.id])

  const totalPBIs = breakdown.reduce((acc, item) => acc + item.pbiCount, 0)
  const totalTasks = breakdown.reduce((acc, item) => acc + item.taskCount, 0)
  const totalSP = breakdown.reduce((acc, item) => acc + item.storyPoints, 0)
  const completedSP =
    breakdown.find((item) => item.statusKey === 'done')?.storyPoints || 0
  const completionRate =
    totalSP > 0 ? ((completedSP / totalSP) * 100).toFixed(1) : '0.0'
  const remainingSP = totalSP - completedSP

  if (isLoading) {
    return (
      <div className="p-8 text-center text-body-sm text-neutral-500">
        Đang tính toán tiến độ Epic...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 3 KPI Summary Cards (S6-04) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase">
              Độ hoàn thiện mốc tiêu
            </span>
            <span className="p-1 rounded bg-teal-50 text-teal-700">
              <Icon name="check-circle" size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {completionRate}%
          </div>
          <p className="text-caption text-neutral-500 mt-1">
            {completedSP} / {totalSP} Story Points hoàn thành
          </p>
        </div>

        {/* KPI 2 */}
        <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase">
              Khối lượng còn lại
            </span>
            <span className="p-1 rounded bg-amber-50 text-amber-700">
              <Icon name="clock" size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {remainingSP} SP ({totalPBIs - (breakdown.find(b => b.statusKey === 'done')?.pbiCount || 0) + totalTasks - (breakdown.find(b => b.statusKey === 'done')?.taskCount || 0)} mốc)
          </div>
          <p className="text-caption text-neutral-500 mt-1">
            {totalPBIs - (breakdown.find(b => b.statusKey === 'done')?.pbiCount || 0)} PBI và {totalTasks - (breakdown.find(b => b.statusKey === 'done')?.taskCount || 0)} Task đang làm / cần làm
          </p>
        </div>

        {/* KPI 3 */}
        <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase">
              Dự kiến hoàn thành
            </span>
            <span className="p-1 rounded bg-blue-50 text-blue-700">
              <Icon name="calendar" size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {epic.targetSprint || 'Kết thúc Sprint 16'}
          </div>
          <p className="text-caption text-neutral-500 mt-1">
            Đạt 100% mục tiêu quý Q3/2025
          </p>
        </div>
      </div>

      {/* Stacked Progress Bar (S6-04) */}
      <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-body-sm font-semibold text-neutral-900">
            Tiến độ phân bổ theo trạng thái thực thi
          </h3>
          <span className="text-caption text-neutral-500">
            Tổng: {totalSP} Story Points ({totalPBIs} PBIs, {totalTasks} Tasks)
          </span>
        </div>

        {/* Multi-segment Bar */}
        <div className="w-full h-4 bg-neutral-100 rounded-full overflow-hidden flex shadow-inner">
          {breakdown.map((item) => (
            <div
              key={item.statusKey}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
              title={`${item.status}: ${item.percentage}% (${item.storyPoints} SP)`}
              className="h-full transition-all duration-300 relative group"
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 pt-1 text-caption text-neutral-600">
          {breakdown.map((item) => (
            <div key={item.statusKey} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-neutral-800">{item.status}</span>
              <span className="text-neutral-500">
                ({item.percentage}% • {item.storyPoints} SP)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown Table (S6-04) */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h3 className="text-body-sm font-semibold text-neutral-900">
            Phân bổ khối lượng chi tiết
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-caption font-semibold text-neutral-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Số lượng PBI</th>
                <th className="px-5 py-3">Số nhiệm vụ kỹ thuật</th>
                <th className="px-5 py-3">Tổng Story Points</th>
                <th className="px-5 py-3 text-right">Tỷ trọng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {breakdown.map((row) => (
                <tr key={row.statusKey} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-neutral-900 flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    <span>{row.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-700">
                    {row.pbiCount} PBI
                  </td>
                  <td className="px-5 py-3.5 text-neutral-700">
                    {row.taskCount} Task
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-neutral-900">
                    {row.storyPoints} SP
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-neutral-800">
                    {row.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}

              {/* Total Summary Row */}
              <tr className="bg-neutral-50 font-semibold text-neutral-900">
                <td className="px-5 py-3.5">Tổng cộng</td>
                <td className="px-5 py-3.5">{totalPBIs} PBI</td>
                <td className="px-5 py-3.5">{totalTasks} Task</td>
                <td className="px-5 py-3.5 text-primary-700">{totalSP} SP</td>
                <td className="px-5 py-3.5 text-right">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
