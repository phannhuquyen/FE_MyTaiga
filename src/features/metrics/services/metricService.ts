import type { FlowMetricsData } from '../types'

const SPRINT_14_METRICS: FlowMetricsData = {
  isEmpty: false,
  sprintId: 'sprint-14',
  sprintName: 'Sprint 14: Tối ưu luồng (Đang diễn ra)',
  sprintStatus: 'active',
  dateRangeLabel: '14/10/2024 - 28/10/2024 (14 ngày qua)',
  lastSyncTime: '10:45',

  // 4 KPI Cards
  wipCurrent: 7,
  wipTargetMax: 8,
  wipStatusText: 'Mục tiêu trần: ≤ 8 thẻ • Ổn định',

  throughputCount: 18,
  throughputPeriodText: 'thẻ / chu kỳ',
  throughputTrendText: '+12% so với trung bình quý trước',

  cycleTimeAvgDays: 3.2,
  cycleTimeTargetDays: 4.0,
  cycleTimeNote: 'Từ In-Progress đến Done (Sprint 14)',

  workItemAgeAvgDays: 2.1,
  workItemAgeMaxDays: 4.8,
  workItemAgeWarningCount: 1,

  // WIP Run Chart Data (14 points, S10-01)
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

  // Cycle Time Scatter Data (18 points, S10-03)
  cycleTimeScatterData: [
    { id: 'ct-1', taskCode: '#SB-121', taskTitle: 'Setup database migration script', date: '14/10', cycleTimeDays: 1.8, assigneeName: 'Hoàng Long' },
    { id: 'ct-2', taskCode: '#SB-122', taskTitle: 'Fix typo in email template', date: '15/10', cycleTimeDays: 1.2, assigneeName: 'Tuấn Anh' },
    { id: 'ct-3', taskCode: '#SB-125', taskTitle: 'Refactor Auth session headers', date: '16/10', cycleTimeDays: 2.6, assigneeName: 'Minh Quân' },
    { id: 'ct-4', taskCode: '#SB-127', taskTitle: 'Update Tailwind colors theme', date: '17/10', cycleTimeDays: 1.5, assigneeName: 'Thùy Trang' },
    { id: 'ct-5', taskCode: '#SB-128', taskTitle: 'Fix dropdown overflow in modal', date: '18/10', cycleTimeDays: 2.1, assigneeName: 'Thùy Trang' },
    { id: 'ct-6', taskCode: '#SB-130', taskTitle: 'Optimize Postgres indexes on audit table', date: '19/10', cycleTimeDays: 1.0, assigneeName: 'Hoàng Long' },
    { id: 'ct-7', taskCode: '#SB-131', taskTitle: 'Unit test API endpoints with mock', date: '20/10', cycleTimeDays: 3.1, assigneeName: 'Minh Quân' },
    { id: 'ct-8', taskCode: '#SB-132', taskTitle: 'Implement datepicker component', date: '20/10', cycleTimeDays: 2.0, assigneeName: 'Thùy Trang' },
    { id: 'ct-9', taskCode: '#SB-133', taskTitle: 'Tối ưu phản hồi API Gateway', date: '21/10', cycleTimeDays: 7.4, assigneeName: 'Minh Quân', isOutlier: true, outlierReason: 'Chậm do chờ khóa bảo mật' },
    { id: 'ct-10', taskCode: '#SB-129', taskTitle: 'Cấu hình phân quyền RBAC đa chi nhánh', date: '21/10', cycleTimeDays: 6.1, assigneeName: 'Tuấn Anh', isOutlier: true, outlierReason: 'Chờ đối soát nghiệp vụ' },
    { id: 'ct-11', taskCode: '#SB-140', taskTitle: 'Refactor token refresh session Redis', date: '21/10', cycleTimeDays: 5.2, assigneeName: 'Đỗ Thảo' },
    { id: 'ct-12', taskCode: '#SB-135', taskTitle: 'Fix double toast on network error', date: '22/10', cycleTimeDays: 1.8, assigneeName: 'Thùy Trang' },
    { id: 'ct-13', taskCode: '#SB-137', taskTitle: 'Write Cypress integration test suite', date: '22/10', cycleTimeDays: 2.4, assigneeName: 'Tuấn Anh' },
    { id: 'ct-14', taskCode: '#SB-142', taskTitle: 'Viết kịch bản kiểm thử tải k6', date: '22/10', cycleTimeDays: 4.0, assigneeName: 'Minh Quân' },
    { id: 'ct-15', taskCode: '#SB-144', taskTitle: 'Sửa lỗi rò rỉ bộ nhớ WebSocket', date: '23/10', cycleTimeDays: 3.8, assigneeName: 'Hoàng Linh' },
    { id: 'ct-16', taskCode: '#SB-146', taskTitle: 'Chỉnh sửa padding nút bấm mobile', date: '25/10', cycleTimeDays: 1.6, assigneeName: 'Thùy Trang' },
    { id: 'ct-17', taskCode: '#SB-147', taskTitle: 'Update Swagger API schema v2', date: '27/10', cycleTimeDays: 1.3, assigneeName: 'Hoàng Long' },
    { id: 'ct-18', taskCode: '#SB-149', taskTitle: 'Fix focus state for accessibility', date: '28/10', cycleTimeDays: 0.9, assigneeName: 'Thùy Trang' },
  ],

  // 5 Slowest Tasks Table (S10-03)
  slowestTasks: [
    {
      id: 'st-1',
      taskCode: '#SB-133',
      taskTitle: 'Tối ưu hóa thời gian phản hồi API Gateway',
      hasFlag: true,
      assigneeName: 'Minh Quân',
      assigneeAvatar: 'MQ',
      startDate: '14/10/2024',
      completedDate: '21/10/2024',
      cycleTimeDays: 7.4,
      isExceeded: true,
    },
    {
      id: 'st-2',
      taskCode: '#SB-129',
      taskTitle: 'Cấu hình phân quyền RBAC đa chi nhánh',
      assigneeName: 'Tuấn Anh',
      assigneeAvatar: 'TA',
      startDate: '15/10/2024',
      completedDate: '21/10/2024',
      cycleTimeDays: 6.1,
      isExceeded: true,
    },
    {
      id: 'st-3',
      taskCode: '#SB-140',
      taskTitle: 'Refactor token refresh session Redis',
      assigneeName: 'Đỗ Thảo',
      assigneeAvatar: 'DT',
      startDate: '16/10/2024',
      completedDate: '21/10/2024',
      cycleTimeDays: 5.2,
      isExceeded: true,
    },
    {
      id: 'st-4',
      taskCode: '#SB-142',
      taskTitle: 'Viết kịch bản kiểm thử tải k6',
      assigneeName: 'Minh Quân',
      assigneeAvatar: 'MQ',
      startDate: '18/10/2024',
      completedDate: '22/10/2024',
      cycleTimeDays: 4.0,
      isExceeded: false,
    },
    {
      id: 'st-5',
      taskCode: '#SB-144',
      taskTitle: 'Sửa lỗi rò rỉ bộ nhớ WebSocket',
      assigneeName: 'Hoàng Linh',
      assigneeAvatar: 'HL',
      startDate: '19/10/2024',
      completedDate: '23/10/2024',
      cycleTimeDays: 3.8,
      isExceeded: false,
    },
  ],

  // Work Item Age Chart (S10-04)
  workItemAgeChartData: [
    {
      id: 'wia-1',
      taskCode: '#SB-148',
      taskTitle: 'Audit telemetry log',
      totalAgeDays: 6.5,
      backlogDays: 1.2,
      inProgressDays: 2.1,
      reviewDays: 3.2,
      isExceeded: true,
      note: '6.5 ngày !',
    },
    {
      id: 'wia-2',
      taskCode: '#SB-145',
      taskTitle: 'Kịch bản kiểm thử tải k6 VUs',
      totalAgeDays: 4.8,
      backlogDays: 0.8,
      inProgressDays: 2.2,
      reviewDays: 1.8,
      isExceeded: false,
      note: '4.8 ngày (Cận ngưỡng)',
    },
    {
      id: 'wia-3',
      taskCode: '#SB-151',
      taskTitle: 'Đồng bộ Kafka consumer',
      totalAgeDays: 3.2,
      backlogDays: 0.9,
      inProgressDays: 2.3,
      reviewDays: 0.0,
      isExceeded: false,
      note: '3.2 ngày',
    },
    {
      id: 'wia-4',
      taskCode: '#SB-152',
      taskTitle: 'Chuẩn hóa OpenAPI spec',
      totalAgeDays: 2.0,
      backlogDays: 0.7,
      inProgressDays: 1.3,
      reviewDays: 0.0,
      isExceeded: false,
      note: '2.0 ngày',
    },
    {
      id: 'wia-5',
      taskCode: '#SB-155',
      taskTitle: 'Thiết kế schema DB',
      totalAgeDays: 1.5,
      backlogDays: 0.6,
      inProgressDays: 0.9,
      reviewDays: 0.0,
      isExceeded: false,
      note: '1.5 ngày',
    },
    {
      id: 'wia-6',
      taskCode: '#SB-158',
      taskTitle: 'Cập nhật giao diện Task Drawer',
      totalAgeDays: 1.1,
      backlogDays: 0.4,
      inProgressDays: 0.7,
      reviewDays: 0.0,
      isExceeded: false,
      note: '1.1 ngày',
    },
    {
      id: 'wia-7',
      taskCode: '#SB-160',
      taskTitle: 'Unit test Auth middleware',
      totalAgeDays: 0.6,
      backlogDays: 0.0,
      inProgressDays: 0.6,
      reviewDays: 0.0,
      isExceeded: false,
      note: '0.6 ngày',
    },
  ],

  // Work Item Age Table (S10-04)
  workItemAgeTableData: [
    {
      id: 'wiat-1',
      taskCode: '#SB-148',
      taskTitle: 'Audit telemetry log & export parquet schema',
      priority: 'Critical',
      currentColumn: 'Đang kiểm thử (QA)',
      assigneeName: 'Trần Hùng',
      assigneeRole: 'QA Lead',
      assigneeAvatar: 'TH',
      ageDays: 6.5,
      statusBadgeText: 'Ùn tắc nghiêm trọng',
      statusDetailText: 'Kẹt ở QA 3.2 ngày liên tục',
      canIntervene: true,
      interveneType: 'blockage',
    },
    {
      id: 'wiat-2',
      taskCode: '#SB-145',
      taskTitle: 'Kịch bản kiểm thử tải k6 VUs cho API Gateway',
      priority: 'High',
      currentColumn: 'Đang làm (Dev)',
      assigneeName: 'Minh Quân',
      assigneeRole: 'Tech Lead',
      assigneeAvatar: 'MQ',
      ageDays: 4.8,
      statusBadgeText: 'Cận ngưỡng SLA (5.0d)',
      statusDetailText: 'Cần cập nhật trạng thái hôm nay',
      canIntervene: true,
      interveneType: 'urge',
    },
    {
      id: 'wiat-3',
      taskCode: '#SB-151',
      taskTitle: 'Đồng bộ Kafka consumer với cluster dự phòng',
      priority: 'Medium',
      currentColumn: 'Đang làm (Dev)',
      assigneeName: 'Văn Nam',
      assigneeRole: 'DevOps',
      assigneeAvatar: 'VN',
      ageDays: 3.2,
      statusBadgeText: 'Di chuyển bình thường',
      statusDetailText: 'Tiến độ đồng đều theo sprint',
      canIntervene: false,
    },
  ],

  // Flow Risks & Blockers (S10-01)
  flowRisks: [
    {
      id: 'fr-1',
      taskCode: 'CORE-389',
      taskTitle: 'Tối ưu truy vấn SQL cho module tính toán điểm Story',
      blockageText: 'Bị nghẽn 4.5 ngày (Vượt quá Work Item Age TB) • Phụ trách: Nam Hoàng',
      assigneeName: 'Nam Hoàng',
      currentColumn: 'Review',
      badgeText: 'Đang làm: Review',
      badgeColor: 'warning',
      level: 'critical',
    },
    {
      id: 'fr-2',
      taskCode: 'CORE-402',
      taskTitle: 'Tích hợp Webhook đồng bộ thẻ từ GitHub Pull Requests',
      blockageText: 'Chờ kiểm thử chấp nhận (UAT) • Tuổi thẻ: 3.1 ngày • Phụ trách: Thùy Trang',
      assigneeName: 'Thùy Trang',
      currentColumn: 'UAT',
      badgeText: 'Chờ duyệt',
      badgeColor: 'warning',
      level: 'warning',
    },
    {
      id: 'fr-3',
      taskCode: 'CORE-415',
      taskTitle: 'Xây dựng bộ lọc trạng thái kanban theo nhãn đa cấp',
      blockageText: 'Tiến độ bình thường • Tuổi thẻ: 1.2 ngày • Phụ trách: Minh Quân',
      assigneeName: 'Minh Quân',
      currentColumn: 'In Progress',
      badgeText: 'Đang thực hiện',
      badgeColor: 'teal',
      level: 'normal',
    },
  ],
}

const EMPTY_METRICS: FlowMetricsData = {
  isEmpty: true,
  sprintId: 'sprint-16',
  sprintName: 'Sprint 16: Tự động hóa Báo cáo (Chưa bắt đầu)',
  sprintStatus: 'future',
  dateRangeLabel: '01/11/2024 - 15/11/2024',
  lastSyncTime: 'Chưa có',

  wipCurrent: null,
  wipTargetMax: 8,
  wipStatusText: 'Chưa có dữ liệu hoàn tất',

  throughputCount: 0,
  throughputPeriodText: 'thẻ',
  throughputTrendText: 'Chưa có dữ liệu hoàn tất',

  cycleTimeAvgDays: null,
  cycleTimeTargetDays: 4.0,
  cycleTimeNote: 'Chưa có dữ liệu hoàn tất',

  workItemAgeAvgDays: null,
  workItemAgeMaxDays: 0,
  workItemAgeWarningCount: 0,

  wipRunData: [],
  cycleTimeScatterData: [],
  slowestTasks: [],
  workItemAgeChartData: [],
  workItemAgeTableData: [],
  flowRisks: [],
}

class MetricService {
  private currentWipLimit = 8

  public getMetricsDataSync(
    sprintId = 'sprint-14',
    dateRange = 'current',
    customWipLimit?: number,
  ): FlowMetricsData {
    if (sprintId === 'sprint-16' || dateRange === 'future') {
      return { ...EMPTY_METRICS }
    }

    const limit = customWipLimit ?? this.currentWipLimit

    return {
      ...SPRINT_14_METRICS,
      wipTargetMax: limit,
      wipRunData: SPRINT_14_METRICS.wipRunData.map((d) => ({
        ...d,
        wipLimit: limit,
      })),
    }
  }

  public async getMetricsData(
    sprintId = 'sprint-14',
    dateRange = 'current',
    customWipLimit?: number,
  ): Promise<FlowMetricsData> {
    return this.getMetricsDataSync(sprintId, dateRange, customWipLimit)
  }

  public setWipLimit(limit: number) {
    this.currentWipLimit = limit
  }

  public getWipLimit() {
    return this.currentWipLimit
  }
}

export const metricService = new MetricService()
