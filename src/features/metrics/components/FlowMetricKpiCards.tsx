import { Icon } from '@/components/ui'
import type { FlowMetricsData } from '../types'

interface FlowMetricKpiCardsProps {
  data: FlowMetricsData
}

export function FlowMetricKpiCards({ data }: FlowMetricKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. WIP Hiện Tại */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs space-y-1.5">
        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          WIP HIỆN TẠI
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
            {data.wipCurrent !== null ? data.wipCurrent : '--'}
          </span>
          <span className="text-xs text-neutral-500 font-medium">thẻ</span>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 pt-1">
          {data.wipCurrent !== null ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{data.wipStatusText}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-neutral-300 shrink-0" />
              <span>Chưa có dữ liệu hoàn tất</span>
            </>
          )}
        </div>
      </div>

      {/* 2. Throughput */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs space-y-1.5">
        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          THROUGHPUT
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
            {data.throughputCount}
          </span>
          <span className="text-xs text-neutral-500 font-medium">{data.throughputPeriodText}</span>
        </div>
        <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1 font-medium">
          {data.isEmpty ? (
            <span className="text-neutral-400">Chưa có dữ liệu hoàn tất</span>
          ) : (
            <>
              <Icon name="chevron-up" size={14} className="text-emerald-500" />
              <span>{data.throughputTrendText}</span>
            </>
          )}
        </div>
      </div>

      {/* 3. Cycle Time Trung Bình */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs space-y-1.5">
        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>CYCLE TIME TRUNG BÌNH</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
            {data.cycleTimeAvgDays !== null ? data.cycleTimeAvgDays : '--'}
          </span>
          <span className="text-xs text-neutral-500 font-medium">ngày</span>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 pt-1">
          {data.cycleTimeAvgDays !== null ? (
            <span>{data.cycleTimeNote}</span>
          ) : (
            <span>Chưa có dữ liệu hoàn tất</span>
          )}
        </div>
      </div>

      {/* 4. Work Item Age Trung Bình */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs space-y-1.5">
        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>WORK ITEM AGE TRUNG BÌNH</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
            {data.workItemAgeAvgDays !== null ? data.workItemAgeAvgDays : '--'}
          </span>
          <span className="text-xs text-neutral-500 font-medium">ngày</span>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 pt-1">
          {data.workItemAgeAvgDays !== null ? (
            <>
              <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
              <span>Tuổi thọ trung bình thẻ đang dở dang</span>
            </>
          ) : (
            <span>Chưa có dữ liệu hoàn tất</span>
          )}
        </div>
      </div>
    </div>
  )
}
