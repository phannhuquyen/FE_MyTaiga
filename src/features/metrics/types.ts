export type MetricTabId = 'wip' | 'throughput' | 'cycletime' | 'workitemage'

export interface WipRunPoint {
  date: string // e.g. '14/10', '15/10', ...
  actualWip: number
  wipLimit: number
  isHighlighted?: boolean
}

export interface CycleTimeScatterPoint {
  id: string
  taskCode: string
  taskTitle: string
  date: string // '14/10', etc.
  cycleTimeDays: number
  assigneeName: string
  isOutlier?: boolean
  outlierReason?: string
}

export interface SlowestTaskItem {
  id: string
  taskCode: string
  taskTitle: string
  hasFlag?: boolean
  assigneeName: string
  assigneeAvatar?: string
  startDate: string
  completedDate: string
  cycleTimeDays: number
  isExceeded: boolean // > 5.0 days
}

export interface WorkItemAgeChartItem {
  id: string
  taskCode: string
  taskTitle: string
  totalAgeDays: number
  backlogDays: number
  inProgressDays: number
  reviewDays: number
  isExceeded: boolean // > 5.0 days
  note?: string
}

export interface WorkItemAgeTableItem {
  id: string
  taskCode: string
  taskTitle: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  currentColumn: string
  assigneeName: string
  assigneeRole: string
  assigneeAvatar?: string
  ageDays: number
  statusBadgeText: string
  statusDetailText: string
  canIntervene?: boolean
  interveneType?: 'blockage' | 'urge'
}

export interface FlowRiskItem {
  id: string
  taskCode: string
  taskTitle: string
  blockageText: string
  assigneeName: string
  currentColumn: string
  badgeText: string
  badgeColor: 'danger' | 'warning' | 'teal'
  level: 'critical' | 'warning' | 'normal'
}

export interface FlowMetricsData {
  isEmpty: boolean
  sprintId: string
  sprintName: string
  sprintStatus: 'active' | 'future' | 'closed'
  dateRangeLabel: string
  lastSyncTime: string

  // KPI Summary
  wipCurrent: number | null
  wipTargetMax: number
  wipStatusText: string

  throughputCount: number
  throughputPeriodText: string
  throughputTrendText: string

  cycleTimeAvgDays: number | null
  cycleTimeTargetDays: number
  cycleTimeNote: string

  workItemAgeAvgDays: number | null
  workItemAgeMaxDays: number
  workItemAgeWarningCount: number

  // Charts data
  wipRunData: WipRunPoint[]
  cycleTimeScatterData: CycleTimeScatterPoint[]
  slowestTasks: SlowestTaskItem[]
  workItemAgeChartData: WorkItemAgeChartItem[]
  workItemAgeTableData: WorkItemAgeTableItem[]
  flowRisks: FlowRiskItem[]
}
