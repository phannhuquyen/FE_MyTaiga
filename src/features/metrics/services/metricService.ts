import type { FlowMetricsData } from '../types'
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
  ): Promise<FlowMetricsData> {
    const limit = customWipLimit ?? this.currentWipLimit

    if (projectId) {
      try {
        const numSprintId = sprintId ? parseInt(sprintId.replace(/\D/g, ''), 10) || undefined : undefined
        const [wipRes, tpRes, avgCtRes, ctRes, ageRes] = await Promise.all([
          api.flowMetrics.wip(projectId, numSprintId).catch(() => null),
          api.flowMetrics.throughput(projectId, { sprintId: numSprintId }).catch(() => null),
          api.flowMetrics.cycleTimeAverage(projectId, numSprintId).catch(() => null),
          api.flowMetrics.cycleTime(projectId, { sprintId: numSprintId }).catch(() => null),
          api.flowMetrics.workItemAge(projectId, { sprintId: numSprintId, minAgeDays: 0 }).catch(() => null),
        ])

        const resData: FlowMetricsData = {
          ...SPRINT_14_METRICS,
          wipTargetMax: limit,
        }

        if (wipRes?.data) {
          resData.wipCurrent = wipRes.data.wip
          resData.wipStatusText = `${wipRes.data.inProgress} đang làm • ${wipRes.data.inReview} chờ kiểm duyệt`
          // Add current WIP point to chart
          resData.wipRunData = [
            ...SPRINT_14_METRICS.wipRunData.slice(0, -1),
            {
              date: 'Hôm nay',
              actualWip: wipRes.data.wip,
              wipLimit: limit,
              isHighlighted: true,
            },
          ]
        }

        if (tpRes?.data) {
          resData.throughputCount = tpRes.data.totalDoneTasks
          resData.dateRangeLabel = `${tpRes.data.from} — ${tpRes.data.to} (UTC)`
        }

        if (avgCtRes?.data && avgCtRes.data.averageCycleTimeDays !== null) {
          resData.cycleTimeAvgDays = parseFloat(avgCtRes.data.averageCycleTimeDays.toFixed(1))
        }

        if (ctRes?.data?.items) {
          resData.cycleTimeScatterData = ctRes.data.items.map((c) => ({
            id: `ct-${c.taskId}`,
            taskCode: `#TASK-${c.taskId}`,
            taskTitle: c.title,
            date: new Date(c.completedAt).toLocaleDateString('vi-VN'),
            cycleTimeDays: parseFloat(c.cycleTimeDays.toFixed(1)),
            assigneeName: 'Thành viên',
            isOutlier: c.cycleTimeDays > 5.0,
            outlierReason: c.cycleTimeDays > 5.0 ? 'Thời gian hoàn thành vượt ngưỡng' : undefined,
          }))
        }

        if (ageRes?.data?.items) {
          resData.workItemAgeChartData = ageRes.data.items.map((item) => ({
            id: `wia-${item.taskId}`,
            taskCode: `#TASK-${item.taskId}`,
            taskTitle: item.title,
            totalAgeDays: parseFloat(item.workItemAgeDays.toFixed(1)),
            backlogDays: 0,
            inProgressDays: parseFloat(item.workItemAgeDays.toFixed(1)),
            reviewDays: 0,
            isExceeded: item.workItemAgeDays > 5.0,
            note: item.workItemAgeDays > 5.0 ? 'Tuổi việc vượt ngưỡng 5 ngày' : undefined,
          }))

          resData.workItemAgeTableData = ageRes.data.items.map((item) => ({
            id: `wia-${item.taskId}`,
            taskCode: `#TASK-${item.taskId}`,
            taskTitle: item.title,
            priority: 'Medium',
            currentColumn: item.status,
            assigneeName: item.assigneeId ? `User #${item.assigneeId}` : 'Chưa giao',
            assigneeRole: 'Kỹ sư',
            ageDays: parseFloat(item.workItemAgeDays.toFixed(1)),
            statusBadgeText: item.workItemAgeDays > 5.0 ? `Tồn đọng ${item.workItemAgeDays.toFixed(1)} ngày` : `${item.workItemAgeDays.toFixed(1)} ngày`,
            statusDetailText: `Bắt đầu lúc ${new Date(item.startedAt).toLocaleDateString('vi-VN')}`,
            canIntervene: item.workItemAgeDays > 5.0,
            interveneType: 'urge',
          }))

          if (ageRes.data.items.length > 0) {
            const sumAge = ageRes.data.items.reduce((acc, cur) => acc + cur.workItemAgeDays, 0)
            resData.workItemAgeAvgDays = parseFloat((sumAge / ageRes.data.items.length).toFixed(1))
            resData.workItemAgeMaxDays = parseFloat(Math.max(...ageRes.data.items.map((i) => i.workItemAgeDays)).toFixed(1))
            resData.workItemAgeWarningCount = ageRes.data.items.filter((i) => i.workItemAgeDays > 5.0).length
          }
        }

        return resData
      } catch (err) {
        console.warn('⚠️ [MetricService] Lỗi lấy flow metrics từ API:', err)
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
