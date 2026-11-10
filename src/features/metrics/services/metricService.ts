import type { FlowMetricsData } from '../types'
import { allPages } from '@/lib/allPages'
import { api } from '@/services/api'

const SPRINT_14_METRICS: FlowMetricsData = {
  isEmpty: false,
  sprintId: 'sprint-14',
  sprintName: 'Sprint Hiện tại (Đang diễn ra)',
  sprintStatus: 'active',
  dateRangeLabel: '14 ngày gần nhất (UTC)',
  lastSyncTime: 'Vừa xong',

  // 4 KPI Cards
  wipCurrent: 7,
  wipTargetMax: 8,
  wipStatusText: 'Mục tiêu trần: ≤ 8 thẻ • Ổn định',

  throughputCount: 18,
  throughputPeriodText: 'thẻ hoàn thành',
  throughputTrendText: 'Đo lường thời gian thực từ Kestrel Backend',

  cycleTimeAvgDays: 3.2,
  cycleTimeTargetDays: 4.0,
  cycleTimeNote: 'Thời gian từ bắt đầu đến hoàn thành',

  workItemAgeAvgDays: 2.1,
  workItemAgeMaxDays: 4.8,
  workItemAgeWarningCount: 1,

  // WIP Run Chart Data
  wipRunData: [
    { date: '14/10', actualWip: 4, wipLimit: 8 },
    { date: '15/10', actualWip: 5, wipLimit: 8 },
    { date: '16/10', actualWip: 6, wipLimit: 8 },
    { date: '17/10', actualWip: 5, wipLimit: 8 },
    { date: '18/10', actualWip: 4, wipLimit: 8 },
    { date: '19/10', actualWip: 4, wipLimit: 8 },
    { date: '20/10', actualWip: 5, wipLimit: 8 },
    { date: '21/10', actualWip: 7, wipLimit: 8, isHighlighted: true },
    { date: '22/10', actualWip: 6, wipLimit: 8 },
    { date: '23/10', actualWip: 6, wipLimit: 8 },
    { date: '24/10', actualWip: 5, wipLimit: 8 },
    { date: '25/10', actualWip: 6, wipLimit: 8 },
    { date: '27/10', actualWip: 7, wipLimit: 8 },
    { date: '28/10', actualWip: 7, wipLimit: 8 },
  ],

  // Cycle Time Scatter Data
  cycleTimeScatterData: [
    { id: 'ct-1', taskCode: '#TASK-121', taskTitle: 'Setup database migration script', date: '14/10', cycleTimeDays: 1.8, assigneeName: 'Hoàng Long' },
    { id: 'ct-2', taskCode: '#TASK-122', taskTitle: 'Fix typo in email template', date: '15/10', cycleTimeDays: 1.2, assigneeName: 'Tuấn Anh' },
    { id: 'ct-3', taskCode: '#TASK-125', taskTitle: 'Refactor Auth session headers', date: '16/10', cycleTimeDays: 2.6, assigneeName: 'Minh Quân' },
    { id: 'ct-4', taskCode: '#TASK-127', taskTitle: 'Update Tailwind colors theme', date: '17/10', cycleTimeDays: 1.5, assigneeName: 'Thùy Trang' },
  ],

  // 5 Slowest Tasks Table
  slowestTasks: [],

  // Work Item Age Chart (Stacked Columns)
  workItemAgeChartData: [
    { id: 'wia-1', taskCode: '#TASK-138', taskTitle: 'Đồng bộ danh bạ LDAP/Active Directory', totalAgeDays: 5.6, backlogDays: 0, inProgressDays: 5.6, reviewDays: 0, isExceeded: true, note: 'Tồn đọng > 5 ngày' },
    { id: 'wia-2', taskCode: '#TASK-141', taskTitle: 'Tích hợp thanh toán QR Code PayOS', totalAgeDays: 4.2, backlogDays: 0, inProgressDays: 4.2, reviewDays: 0, isExceeded: false },
  ],

  // Work Item Age Detail Table
  workItemAgeTableData: [
    {
      id: 'wia-1',
      taskCode: '#TASK-138',
      taskTitle: 'Đồng bộ danh bạ LDAP/Active Directory',
      priority: 'High',
      currentColumn: 'Đang làm',
      assigneeName: 'Tuấn Anh',
      assigneeRole: 'DevOps Lead',
      assigneeAvatar: 'TA',
      ageDays: 5.6,
      statusBadgeText: 'Chậm trễ 5.6 ngày',
      statusDetailText: 'Vượt ngưỡng mục tiêu luồng 5.0 ngày',
      canIntervene: true,
      interveneType: 'blockage',
    },
  ],

  // Flow Risks & Blockers
  flowRisks: [],
}

class MetricService {
  private currentWipLimit = 8

  public async getMetricsData(
    projectId?: number,
    sprintId?: string,
    customWipLimit?: number,
    period: { from?: string; to?: string } = {},
  ): Promise<FlowMetricsData> {
    const limit = customWipLimit ?? this.currentWipLimit

    if (projectId) {
      try {
        const numSprintId = sprintId && /^\d+$/.test(sprintId) ? Number(sprintId) : undefined
        const query = { ...period, sprintId: numSprintId }
        const [wipRes, tpRes, avgCtRes, cycles, ages, sprintRows, members, tasks] = await Promise.all([
          api.flowMetrics.wip(projectId, numSprintId),
          api.flowMetrics.throughput(projectId, query),
          api.flowMetrics.cycleTimeAverage(projectId, numSprintId),
          allPages(page => api.flowMetrics.cycleTime(projectId, { sprintId: numSprintId, page, pageSize: 100 })),
          allPages(page => api.flowMetrics.workItemAge(projectId, { sprintId: numSprintId, minAgeDays: 0, page, pageSize: 100 })),
          allPages(page => api.flowMetrics.throughputSprints(projectId, { ...period, page, pageSize: 100 })),
          allPages(page => api.projectMembers.list(projectId, { page, pageSize: 100 })),
          allPages(page => api.tasks.list(projectId, { page, pageSize: 100 })),
        ])
        const taskMap = new Map(tasks.map(task => [task.taskId, task]))
        const assigneeName = (taskId: number) => { const task = taskMap.get(taskId); return task?.assignee?.fullName || task?.assigneeName || (task?.assigneeId ? `User #${task.assigneeId}` : 'Chưa giao') }
        const people = new Map(members.map(member => [member.userId, member]))
        const validCycles = cycles.filter(item => item.cycleTimeDays !== null && Number.isFinite(item.cycleTimeDays) && item.completedAt)
        const scatter = validCycles.map(item => ({
          id: String(item.taskId), taskCode: `TASK-${item.taskId}`, taskTitle: item.title,
          date: new Date(item.completedAt!).toLocaleDateString('vi-VN'),
          cycleTimeDays: Number(item.cycleTimeDays!.toFixed(1)), assigneeName: assigneeName(item.taskId),
          isOutlier: item.cycleTimeDays! > 5,
        }))
        const ageRows = ages.map(item => {
          const member = item.assigneeId ? people.get(item.assigneeId) : undefined
          return {
            id: String(item.taskId), taskCode: `TASK-${item.taskId}`, taskTitle: item.title,
            priority: ({ CRITICAL: 'Critical', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low', '': undefined } as const)[taskMap.get(item.taskId)?.priority ?? ''], currentColumn: item.status,
            assigneeName: member?.fullName || (item.assigneeId ? `User #${item.assigneeId}` : 'Chưa giao'),
            assigneeRole: member?.projectRole || 'Chưa có thông tin',
            ageDays: Number(item.workItemAgeDays.toFixed(1)),
            statusBadgeText: `${item.workItemAgeDays.toFixed(1)} ngày`,
            statusDetailText: `Bắt đầu lúc ${new Date(item.startedAt).toLocaleString('vi-VN')}`,
          }
        })
        const asOf = tpRes.data.asOfUtc || wipRes.data.asOfUtc
        return {
          ...SPRINT_14_METRICS,
          source: 'api',
          wipRunData: [],
          sprintId: sprintId || 'all',
          sprintName: numSprintId ? sprintRows.find(item => item.sprintId === numSprintId)?.sprintName || `Sprint #${numSprintId}` : 'Tất cả Sprint',
          isEmpty: false,
          wipCurrent: wipRes.data.wip ?? null,
          wipTargetMax: limit,
          wipStatusText: `${wipRes.data.inProgress ?? 0} đang làm • ${wipRes.data.inReview ?? 0} chờ kiểm duyệt`,
          throughputCount: tpRes.data.totalDoneTasks ?? 0,
          throughputPoints: tpRes.data.points || [],
          throughputSprints: sprintRows,
          partialHistory: tpRes.data.hasPartialHistoricalCoverage,
          throughputHistoryStart: tpRes.data.historyTrackingStartedAtUtc,
          importedBaselineCount: tpRes.data.importedBaselineCount,
          dateRangeLabel: `${tpRes.data.from || '—'} — ${tpRes.data.to || '—'} (UTC)`,
          lastSyncTime: asOf ? new Date(asOf).toLocaleString('vi-VN') : 'Chưa có thời điểm đồng bộ',
          throughputTrendText: tpRes.data.hasPartialHistoricalCoverage ? 'Lịch sử chưa phủ đầy đủ khoảng ngày' : tpRes.data.definition || 'Theo lịch sử hoàn thành từ máy chủ',
          cycleTimeNote: `${avgCtRes.data.validTasks ?? 0} Task hợp lệ • ${avgCtRes.data.skippedInvalidTasks ?? 0} Task thiếu mốc thời gian bị bỏ qua`,
          cycleTimeAvgDays: avgCtRes.data.averageCycleTimeDays == null ? null : Number(avgCtRes.data.averageCycleTimeDays.toFixed(1)),
          cycleTimeScatterData: scatter,
          slowestTasks: [...validCycles].sort((a, b) => b.cycleTimeDays! - a.cycleTimeDays!).slice(0, 5).map(item => ({
            id: String(item.taskId), taskCode: `TASK-${item.taskId}`, taskTitle: item.title,
            assigneeName: assigneeName(item.taskId), startDate: item.startedAt ? new Date(item.startedAt).toLocaleDateString('vi-VN') : 'Chưa có',
            completedDate: new Date(item.completedAt!).toLocaleDateString('vi-VN'),
            cycleTimeDays: Number(item.cycleTimeDays!.toFixed(1)), isExceeded: item.cycleTimeDays! > 5,
          })),
          workItemAgeAvgDays: ages.length ? Number((ages.reduce((sum, item) => sum + item.workItemAgeDays, 0) / ages.length).toFixed(1)) : null,
          workItemAgeMaxDays: ages.length ? Math.max(...ages.map(item => item.workItemAgeDays)) : 0,
          workItemAgeWarningCount: ages.filter(item => item.workItemAgeDays > 5).length,
          workItemAgeTableData: ageRows,
          workItemAgeChartData: ages.map(item => ({
            id: String(item.taskId), taskCode: `TASK-${item.taskId}`, taskTitle: item.title,
            totalAgeDays: item.workItemAgeDays, backlogDays: 0, inProgressDays: item.workItemAgeDays, reviewDays: 0,
            isExceeded: item.workItemAgeDays > 5, note: 'Tổng tuổi việc. Chưa có thời gian từng trạng thái.',
          })),
        }
      } catch (err) {
        const status = (err as { response?: { status?: number } }).response?.status
        throw new Error(status === 403 ? 'Bạn không có quyền xem Flow Metrics của dự án này.' : 'Không thể tải Flow Metrics. Vui lòng thử lại.')
      }
    }

    return {
      ...SPRINT_14_METRICS,
      wipTargetMax: limit,
      wipRunData: SPRINT_14_METRICS.wipRunData.map((d) => ({
        ...d,
        wipLimit: limit,
      })),
    }
  }

  public setWipLimit(limit: number) {
    this.currentWipLimit = limit
  }

  public getWipLimit() {
    return this.currentWipLimit
  }
}

export const metricService = new MetricService()
