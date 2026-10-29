import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Icon } from '@/components/ui'
import type { MetricTabId, FlowMetricsData } from './types'
import { metricService } from './services/metricService'
import { FlowMetricKpiCards } from './components/FlowMetricKpiCards'
import { WipRunChart } from './components/WipRunChart'
import { CycleTimeScatterplot } from './components/CycleTimeScatterplot'
import { WorkItemAgeChart } from './components/WorkItemAgeChart'
import { ThroughputChart } from './components/ThroughputChart'
import { FlowRisksBlockers } from './components/FlowRisksBlockers'
import { EmptyMetricsState } from './components/EmptyMetricsState'
import { ConfigAlertModal } from './components/ConfigAlertModal'
import { api, type SprintData } from '@/services/api'

export default function FlowMetricsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const numericProjectId = projectId ? parseInt(projectId, 10) : undefined

  const [selectedSprint, setSelectedSprint] = useState('all')
  const [sprints, setSprints] = useState<SprintData[]>([])
  const [selectedRange, setSelectedRange] = useState('current')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState<MetricTabId>('wip')
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [wipLimit, setWipLimit] = useState(metricService.getWipLimit())
  const [metricsData, setMetricsData] = useState<FlowMetricsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    metricService.getMetricsData(numericProjectId, selectedSprint, wipLimit).then(data => {
      if (!cancelled) {
        setMetricsData(data)
        setError(null)
      }
    }).catch((err: unknown) => {
      if (!cancelled) setError(err instanceof Error ? err.message : 'Không thể tải Flow Metrics.')
    })
    return () => { cancelled = true }
  }, [numericProjectId, selectedSprint, wipLimit])

  useEffect(() => {
    if (!numericProjectId) return
    let cancelled = false
    api.sprints.list({ projectId: numericProjectId, pageSize: 100 }).then(res => {
      if (!cancelled) setSprints(res.data.items)
    }).catch(() => { if (!cancelled) setSprints([]) })
    return () => { cancelled = true }
  }, [numericProjectId])

  const handleExport = () => {
    alert(
      'Đã xuất báo cáo Flow Metrics Sprint 14 định dạng PDF/CSV. Báo cáo bao gồm WIP Run Chart, Phân tích Cycle Time và Danh sách rủi ro luồng.',
    )
  }

  const handleSaveConfig = (newLimit: number) => {
    metricService.setWipLimit(newLimit)
    setWipLimit(newLimit)
  }

  if (error) return <div role="alert" className="p-8 text-danger-600">{error}</div>

  if (!metricsData) {
    return (
      <div className="p-8 text-center text-neutral-400">Đang tải dữ liệu Flow Metrics...</div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <p className="text-xs text-neutral-500" title="Một số biểu đồ lịch sử và mục tiêu chưa có nguồn dữ liệu API đầy đủ">
        WIP lịch sử và một số mục tiêu/ngưỡng còn dùng dữ liệu minh họa; không dùng làm báo cáo nghiệp vụ.
      </p>
      {/* Header & Breadcrumb (S10-01) */}
      <div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1.5">
          <span>Dự án</span>
          <span>/</span>
          <span>ScrumBan Core Platform</span>
          <span>/</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">Flow Metrics</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Chỉ số luồng (Flow Metrics)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
              <Icon name="shield" size={13} />
              Dành cho Quản lý (Manager Only)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExport}
              className="px-3.5 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Icon name="download" size={14} />
              <span>Xuất báo cáo PDF / CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Icon name="sliders" size={14} />
              <span>+ Cấu hình ngưỡng cảnh báo luồng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row (S10-01) */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sprint selector */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-medium">Sprint:</span>
              <select
                value={selectedSprint}
                onChange={(e) => setSelectedSprint(e.target.value)}
                className="font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">Tất cả Sprint</option>
                {sprints.map(sprint => <option key={sprint.sprintId} value={String(sprint.sprintId)}>{sprint.sprintName}</option>)}
              </select>
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-medium">Khoảng ngày:</span>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="current">14/10/2024 - 28/10/2024 (14 ngày qua)</option>
                <option value="future">01/11/2024 - 15/11/2024 (Sprint 16)</option>
                <option value="last30">30 ngày gần nhất</option>
              </select>
            </div>

            {/* Category / Epic */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-medium">Phân loại / Epic:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">Tất cả hạng mục</option>
                <option value="payment">Cổng Thanh Toán v2.0</option>
                <option value="core">Core Platform</option>
              </select>
            </div>
          </div>

          {/* Sync indicator */}
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Dữ liệu thời gian thực được đồng bộ lúc {metricsData.lastSyncTime}</span>
          </div>
        </div>
      </div>

      {/* If Empty State (S10-02) */}
      {metricsData.isEmpty ? (
        <>
          <FlowMetricKpiCards data={metricsData} />
          <EmptyMetricsState
            onSwitchToSprint14={() => {
              setSelectedSprint('sprint-14')
              setSelectedRange('current')
            }}
          />
        </>
      ) : (
        <>
          {/* KPI Summary (S10-01) */}
          <FlowMetricKpiCards data={metricsData} />

          {/* Chart View with Tabs (S10-01, S10-03, S10-04) */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-2xs space-y-6">
            {/* Tabs Header */}
            <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-3">
              {[
                { id: 'wip' as const, label: 'WIP (Work in Progress)' },
                { id: 'throughput' as const, label: 'Throughput' },
                { id: 'cycletime' as const, label: 'Cycle Time Scatterplot' },
                { id: 'workitemage' as const, label: 'Work Item Age' },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Contents */}
            {activeTab === 'wip' && (
              <WipRunChart data={metricsData.wipRunData} wipLimit={wipLimit} />
            )}

            {activeTab === 'throughput' && <ThroughputChart />}

            {activeTab === 'cycletime' && (
              <CycleTimeScatterplot
                scatterData={metricsData.cycleTimeScatterData}
                slowestTasks={metricsData.slowestTasks}
              />
            )}

            {activeTab === 'workitemage' && (
              <WorkItemAgeChart
                chartData={metricsData.workItemAgeChartData}
                tableData={metricsData.workItemAgeTableData}
              />
            )}
          </div>

          {/* Flow Risks & Blockers (S10-01 bottom) */}
          <FlowRisksBlockers risks={metricsData.flowRisks} />
        </>
      )}

      {/* Config Alert Modal */}
      <ConfigAlertModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentLimit={wipLimit}
        onSave={handleSaveConfig}
      />
    </div>
  )
}
