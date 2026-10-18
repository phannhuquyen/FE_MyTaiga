import type {
  Sprint,
  CreateSprintPayload,
  UpdateSprintPayload,
  CloseSprintPayload,
  SprintWorkItem,
} from '../types'
import { backlogService } from '@/features/backlog/services/backlogService'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const SEED_SPRINT_14_ITEMS: SprintWorkItem[] = [
  {
    id: 'item-139',
    code: '#SB-139',
    title: 'Thiết lập cơ chế quay vòng token OAuth2 cho mobile app client',
    assigneeName: 'Nguyễn Quân',
    assigneeAvatar: 'NQ',
    assigneeRole: 'Tech Lead',
    storyPoints: 5,
    status: 'done',
    priority: 'high',
    criteriaCount: '4/4 tiêu chí nhận nghiệm',
    epicName: 'Cổng xác thực & IAM',
  },
  {
    id: 'item-140',
    code: '#SB-140',
    title: 'Tối ưu hóa pipe chuyển đổi WebP & resize avatar kích thước chuẩn',
    assigneeName: 'Hoàng Linh',
    assigneeAvatar: 'HL',
    assigneeRole: 'Frontend Dev',
    storyPoints: 3,
    status: 'done',
    priority: 'medium',
    criteriaCount: '3/3 tiêu chí nhận nghiệm',
    epicName: 'Core Infrastructure',
  },
  {
    id: 'item-141',
    code: '#SB-141',
    title: 'Cập nhật middleware rate-limiting cho các endpoint công khai',
    assigneeName: 'Tuấn Anh',
    assigneeAvatar: 'TA',
    assigneeRole: 'Backend Engineer',
    storyPoints: 2,
    status: 'done',
    priority: 'high',
    criteriaCount: '2/2 tiêu chí nhận nghiệm',
    epicName: 'Cổng xác thực & IAM',
  },
  {
    id: 'item-142',
    code: '#SB-142',
    title: 'Kiểm thử hiệu năng tải của Redis Cache cluster trên Staging',
    assigneeName: 'Minh Hải',
    assigneeAvatar: 'MH',
    assigneeRole: 'DevOps Lead',
    storyPoints: 5,
    status: 'in_progress',
    priority: 'high',
    criteriaCount: '2/4 tiêu chí nhận nghiệm',
    epicName: 'Core Infrastructure',
  },
  {
    id: 'item-143',
    code: '#SB-143',
    title: 'Viết unit test cho service xác thực 2 lớp (2FA TOTP)',
    assigneeName: 'Đỗ Thảo',
    assigneeAvatar: 'DT',
    assigneeRole: 'QA Engineer',
    storyPoints: 3,
    status: 'review',
    priority: 'medium',
    criteriaCount: '3/4 tiêu chí nhận nghiệm',
    epicName: 'Cổng xác thực & IAM',
  },
  {
    id: 'item-144',
    code: '#SB-144',
    title: 'Sửa bug memory leak khi upload tệp nhị phân trên Node 20 runtime',
    assigneeName: 'Hoàng Linh',
    assigneeAvatar: 'HL',
    assigneeRole: 'Frontend Dev',
    storyPoints: 5,
    status: 'done',
    priority: 'urgent',
    criteriaCount: '5/5 tiêu chí nhận nghiệm',
    epicName: 'Core Infrastructure',
  },
  {
    id: 'item-145',
    code: '#SB-145',
    title: 'Cấu hình bucket Cloudflare R2 backup tự động mỗi 6 giờ',
    assigneeName: 'Nguyễn Quân',
    assigneeAvatar: 'NQ',
    assigneeRole: 'Tech Lead',
    storyPoints: 3,
    status: 'done',
    priority: 'medium',
    criteriaCount: '3/3 tiêu chí nhận nghiệm',
    epicName: 'Core Infrastructure',
  },
  {
    id: 'item-146',
    code: '#SB-146',
    title: 'Cập nhật Swagger / OpenAPI specification cho gateway mới',
    assigneeName: 'Tuấn Anh',
    assigneeAvatar: 'TA',
    assigneeRole: 'Backend Engineer',
    storyPoints: 3,
    status: 'ready',
    priority: 'low',
    criteriaCount: '1/3 tiêu chí nhận nghiệm',
    epicName: 'Cổng xác thực & IAM',
  },
]

const SEED_SPRINTS: Sprint[] = [
  {
    id: 'sprint-14',
    code: 'SPR-14',
    name: 'Sprint 14: Tối ưu luồng & Đồng bộ dữ liệu',
    goal: 'Hoàn thiện gateway xác thực OAuth2 và nén ảnh tự động cho hệ thống lưu trữ, giảm độ trễ API xuống dưới 120ms.',
    status: 'active',
    startDate: '14/10/2024',
    endDate: '28/10/2024',
    daysLeft: 'Còn 4 ngày',
    totalSP: 24,
    completedSP: 18,
    capacitySP: 24,
    totalItemsCount: 8,
    completedItemsCount: 6,
    remainingItemsCount: 2,
    progressPercent: 75,
    membersCount: 6,
    items: [...SEED_SPRINT_14_ITEMS],
    burndownPoints: [
      { dayLabel: 'Ngày 1 (14/10)', dateStr: '14/10', idealRemaining: 24, actualRemaining: 24 },
      { dayLabel: 'Ngày 2', dateStr: '15/10', idealRemaining: 22.3, actualRemaining: 24 },
      { dayLabel: 'Ngày 3', dateStr: '16/10', idealRemaining: 20.6, actualRemaining: 22 },
      { dayLabel: 'Ngày 4 (17/10)', dateStr: '17/10', idealRemaining: 18.9, actualRemaining: 20 },
      { dayLabel: 'Ngày 5', dateStr: '18/10', idealRemaining: 17.1, actualRemaining: 19 },
      { dayLabel: 'Ngày 6', dateStr: '19/10', idealRemaining: 15.4, actualRemaining: 17 },
      { dayLabel: 'Ngày 7 (20/10)', dateStr: '20/10', idealRemaining: 13.7, actualRemaining: 15 },
      { dayLabel: 'Ngày 8', dateStr: '21/10', idealRemaining: 12.0, actualRemaining: 12 },
      { dayLabel: 'Ngày 9', dateStr: '22/10', idealRemaining: 10.3, actualRemaining: 9 },
      { dayLabel: 'Ngày 10 (Hôm nay)', dateStr: '23/10', idealRemaining: 8.6, actualRemaining: 6, isToday: true },
      { dayLabel: 'Ngày 11', dateStr: '24/10', idealRemaining: 6.9 },
      { dayLabel: 'Ngày 12', dateStr: '25/10', idealRemaining: 5.1 },
      { dayLabel: 'Ngày 13', dateStr: '26/10', idealRemaining: 3.4 },
      { dayLabel: 'Ngày 14 (28/10)', dateStr: '28/10', idealRemaining: 0 },
    ],
    scoreAdjustments: [
      {
        id: 'adj-1',
        taskCode: 'SCRUM-104',
        title: 'Đồng bộ Kafka consumer',
        pointsDelta: -3,
        dateLabel: 'Ngày 10 • bởi Minh Quân',
      },
      {
        id: 'adj-2',
        taskCode: 'SCRUM-109',
        title: 'Refactor API Core middleware',
        pointsDelta: -3,
        dateLabel: 'Ngày 9 • bởi Thu Trang',
      },
      {
        id: 'adj-3',
        taskCode: 'SCRUM-112',
        title: 'Cắt giao diện Kanban board',
        pointsDelta: -2,
        dateLabel: 'Ngày 7 • bởi Hoàng Nam',
      },
      {
        id: 'adj-4',
        taskCode: 'Hotfix DB',
        title: 'Thêm thẻ Hotfix DB Timeout',
        pointsDelta: 1,
        dateLabel: 'Ngày 5 • Scope Creep được duyệt',
      },
    ],
  },
  {
    id: 'sprint-15',
    code: 'SPR-15',
    name: 'Sprint 15: Mở rộng SSO & API Gateway',
    goal: 'Tích hợp đăng nhập SAML 2.0 và cấu hình rate limiting với Redis cluster.',
    status: 'planned',
    startDate: '29/10/2024',
    endDate: '12/11/2024',
    daysLeft: 'Kế tiếp',
    totalSP: 13,
    completedSP: 0,
    capacitySP: 25,
    totalItemsCount: 2,
    completedItemsCount: 0,
    remainingItemsCount: 2,
    progressPercent: 0,
    membersCount: 5,
    items: [
      {
        id: 'item-142-p',
        code: '#SB-142',
        title: 'Xây dựng luồng đăng nhập SSO SAML 2.0',
        assigneeName: 'Minh Quân',
        assigneeAvatar: 'MQ',
        assigneeRole: 'Tech Lead',
        storyPoints: 8,
        status: 'ready',
        priority: 'high',
        criteriaCount: '4/4 tiêu chí nhận nghiệm',
        epicName: 'Epic IAM',
      },
      {
        id: 'item-144-p',
        code: '#SB-144',
        title: 'Cấu hình Token Refresh Rotation với Redis',
        assigneeName: 'Lan Anh',
        assigneeAvatar: 'LA',
        assigneeRole: 'Backend Engineer',
        storyPoints: 5,
        status: 'ready',
        priority: 'medium',
        criteriaCount: '3/3 tiêu chí nhận nghiệm',
        epicName: 'Epic IAM',
      },
    ],
  },
  {
    id: 'sprint-16',
    code: 'SPR-16',
    name: 'Sprint 16: Tự động hóa Báo cáo & Metrics',
    goal: 'Xuất dữ liệu CFD, Throughput và Lead Time ra PDF/Excel.',
    status: 'draft',
    startDate: '13/11/2024',
    endDate: '27/11/2024',
    daysLeft: 'Dự thảo',
    totalSP: 0,
    completedSP: 0,
    capacitySP: 25,
    totalItemsCount: 0,
    completedItemsCount: 0,
    remainingItemsCount: 0,
    progressPercent: 0,
    membersCount: 0,
    items: [],
  },
  {
    id: 'sprint-13',
    code: 'SPR-13',
    name: 'Sprint 13: Kiến trúc Core Database',
    goal: 'Migration PostgreSQL schema sang phân tán multitenant, cấu hình PgBouncer connection pooling, và thiết lập automated failover test suites trên môi trường Staging.',
    status: 'closed',
    startDate: '30/09/2024',
    endDate: '13/10/2024',
    daysLeft: 'Đã đóng',
    totalSP: 22,
    completedSP: 22,
    capacitySP: 22,
    totalItemsCount: 6,
    completedItemsCount: 6,
    remainingItemsCount: 0,
    progressPercent: 100,
    releaseVersion: 'v1.4.0',
    velocityAchieved: 22,
    flowEfficiency: 91.4,
    leadTimeAvgDays: 3.4,
    membersCount: 6,
    items: [
      {
        id: 'core-201',
        code: 'CORE-201',
        title: 'Tái cấu trúc lược đồ Multitenant PostgreSQL 16',
        assigneeName: 'Minh Quân',
        assigneeAvatar: 'MQ',
        storyPoints: 8,
        status: 'done',
        epicName: 'Core Engine',
      },
      {
        id: 'core-204',
        code: 'CORE-204',
        title: 'Tích hợp PgBouncer kết nối microservices pooling',
        assigneeName: 'Tuấn Anh',
        assigneeAvatar: 'TA',
        storyPoints: 5,
        status: 'done',
        epicName: 'Infra & DevOps',
      },
      {
        id: 'core-209',
        code: 'CORE-209',
        title: 'Tối ưu câu truy vấn Backlog tree CTE hierarchical query',
        assigneeName: 'Hoàng Long',
        assigneeAvatar: 'HL',
        storyPoints: 3,
        status: 'done',
        epicName: 'Core Engine',
      },
      {
        id: 'core-211',
        code: 'CORE-211',
        title: 'Thiết lập Database Replication Read-Replica Node 02',
        assigneeName: 'Tuấn Anh',
        assigneeAvatar: 'TA',
        storyPoints: 3,
        status: 'done',
        epicName: 'Infra & DevOps',
      },
      {
        id: 'core-215',
        code: 'CORE-215',
        title: 'Benchmark kịch bản chịu tải 2,500 conn/giây qua k6',
        assigneeName: 'Thúy Hằng',
        assigneeAvatar: 'TH',
        storyPoints: 2,
        status: 'done',
        epicName: 'Quality Assurance',
      },
      {
        id: 'core-218',
        code: 'CORE-218',
        title: 'Tài liệu hóa Migration guide & Rollback plan trong trường hợp failover',
        assigneeName: 'Minh Quân',
        assigneeAvatar: 'MQ',
        storyPoints: 1,
        status: 'done',
        epicName: 'Docs & Ops',
      },
    ],
  },
]

let sprintsState = [...SEED_SPRINTS]
let nextItemCodeIndex = 148

export const sprintService = {
  async getSprints(filters?: {
    search?: string
    status?: string
    assignee?: string
  }): Promise<Sprint[]> {
    await delay(30)
    let list = [...sprintsState]

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.goal.toLowerCase().includes(q),
      )
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((s) => s.status === filters.status)
    }

    return list
  },

  async getSprintById(id: string): Promise<Sprint | undefined> {
    await delay(20)
    return sprintsState.find(
      (s) => s.id === id || s.code.toLowerCase() === id.toLowerCase(),
    )
  },

  async createSprint(payload: CreateSprintPayload): Promise<Sprint> {
    await delay(50)
    if (!payload.name || payload.name.trim().length < 5) {
      throw new Error('Tên Sprint phải chứa ít nhất 5 ký tự.')
    }

    const nextIndex = sprintsState.length + 14
    const newSprint: Sprint = {
      id: `sprint-${nextIndex}`,
      code: `SPR-${nextIndex}`,
      name: payload.name.trim(),
      goal: payload.goal.trim(),
      status: 'draft',
      startDate: payload.startDate,
      endDate: payload.endDate,
      daysLeft: 'Dự thảo',
      totalSP: 0,
      completedSP: 0,
      capacitySP: payload.capacitySP || 25,
      totalItemsCount: 0,
      completedItemsCount: 0,
      remainingItemsCount: 0,
      progressPercent: 0,
      membersCount: 0,
      items: [],
    }

    sprintsState = [newSprint, ...sprintsState]
    return newSprint
  },

  async updateSprint(id: string, payload: UpdateSprintPayload): Promise<Sprint> {
    await delay(40)
    const index = sprintsState.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Không tìm thấy Sprint.')

    const current = sprintsState[index]
    const updated: Sprint = {
      ...current,
      ...payload,
    }
    sprintsState[index] = updated
    return updated
  },

  async startSprint(id: string): Promise<Sprint> {
    await delay(40)
    const index = sprintsState.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Không tìm thấy Sprint.')

    const current = sprintsState[index]
    // Set active status
    const updated: Sprint = {
      ...current,
      status: 'active',
      daysLeft: 'Còn 14 ngày',
    }
    sprintsState[index] = updated
    return updated
  },

  async getActiveSprint(): Promise<Sprint | null> {
    await delay(20)
    return sprintsState.find((s) => s.status === 'active') || null
  },

  async closeSprint(id: string, payload: CloseSprintPayload): Promise<Sprint> {
    await delay(50)
    const index = sprintsState.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Không tìm thấy Sprint.')

    const current = sprintsState[index]
    const unfinishedItems = current.items.filter((i) => i.status !== 'done')

    if (payload.unfinishedResolution === 'backlog') {
      // Unfinished items move back to backlog
      for (const item of unfinishedItems) {
        await backlogService.assignToSprint(item.id, undefined)
      }
    } else if (payload.unfinishedResolution === 'next_sprint' && payload.nextSprintId) {
      // Unfinished items transferred to next sprint
      const nextSprint = sprintsState.find((s) => s.id === payload.nextSprintId)
      if (nextSprint) {
        nextSprint.items = [...nextSprint.items, ...unfinishedItems]
        nextSprint.totalSP += unfinishedItems.reduce((acc, i) => acc + i.storyPoints, 0)
        nextSprint.totalItemsCount += unfinishedItems.length
      }
    }

    const updated: Sprint = {
      ...current,
      status: 'closed',
      daysLeft: 'Đã đóng',
      releaseVersion: 'v1.5.0',
      velocityAchieved: current.completedSP,
      flowEfficiency: 88.5,
      leadTimeAvgDays: 4.0,
    }
    sprintsState[index] = updated
    return updated
  },

  async deleteSprint(id: string): Promise<boolean> {
    await delay(40)
    const sprint = sprintsState.find((s) => s.id === id)
    if (!sprint) throw new Error('Không tìm thấy Sprint để xóa.')

    // Return items to backlog
    for (const item of sprint.items) {
      await backlogService.assignToSprint(item.id, undefined)
    }

    sprintsState = sprintsState.filter((s) => s.id !== id)
    return true
  },

  async addWorkItem(
    sprintId: string,
    item: { title: string; storyPoints: number; assigneeName?: string },
  ): Promise<SprintWorkItem> {
    await delay(30)
    const sprint = sprintsState.find((s) => s.id === sprintId)
    if (!sprint) throw new Error('Không tìm thấy Sprint.')

    const newItem: SprintWorkItem = {
      id: `item-${nextItemCodeIndex++}`,
      code: `#SB-${nextItemCodeIndex}`,
      title: item.title.trim(),
      storyPoints: item.storyPoints || 3,
      assigneeName: item.assigneeName || 'Minh Quân',
      assigneeAvatar: 'MQ',
      status: 'ready',
    }

    sprint.items.push(newItem)
    sprint.totalSP += newItem.storyPoints
    sprint.totalItemsCount += 1
    sprint.remainingItemsCount += 1
    sprint.progressPercent = Math.round(
      (sprint.completedSP / Math.max(1, sprint.totalSP)) * 100,
    )

    return newItem
  },

  async toggleWorkItemStatus(
    sprintId: string,
    itemId: string,
  ): Promise<SprintWorkItem> {
    await delay(20)
    const sprint = sprintsState.find((s) => s.id === sprintId)
    if (!sprint) throw new Error('Không tìm thấy Sprint.')

    const item = sprint.items.find((i) => i.id === itemId)
    if (!item) throw new Error('Không tìm thấy thẻ công việc.')

    if (item.status === 'done') {
      item.status = 'ready'
      sprint.completedSP -= item.storyPoints
      sprint.completedItemsCount = Math.max(0, sprint.completedItemsCount - 1)
      sprint.remainingItemsCount += 1
    } else {
      item.status = 'done'
      sprint.completedSP += item.storyPoints
      sprint.completedItemsCount += 1
      sprint.remainingItemsCount = Math.max(0, sprint.remainingItemsCount - 1)
    }

    sprint.progressPercent = Math.round(
      (sprint.completedSP / Math.max(1, sprint.totalSP)) * 100,
    )
    return item
  },

  async addWorkItemToSprint(
    sprintId: string,
    item: { title: string; storyPoints: number; priority?: 'urgent' | 'high' | 'medium' | 'low' },
  ): Promise<SprintWorkItem> {
    await delay(30)
    const sprint = sprintsState.find((s) => s.id === sprintId)
    if (!sprint) throw new Error('Không tìm thấy Sprint.')

    const codeNum = sprint.items.length + 150
    const newItem: SprintWorkItem = {
      id: `item-${Date.now()}`,
      code: `#SB-${codeNum}`,
      title: item.title,
      storyPoints: item.storyPoints,
      priority: item.priority || 'medium',
      status: 'ready',
    }

    sprint.items.push(newItem)
    sprint.totalSP += newItem.storyPoints
    sprint.totalItemsCount += 1
    sprint.remainingItemsCount += 1
    sprint.progressPercent = Math.round(
      (sprint.completedSP / Math.max(1, sprint.totalSP)) * 100,
    )
    return newItem
  },

  async assignBacklogItemsToSprint(
    sprintId: string,
    itemIds: string[],
  ): Promise<void> {
    await delay(40)
    const sprint = sprintsState.find((s) => s.id === sprintId)
    if (!sprint) throw new Error('Không tìm thấy Sprint.')

    const backlogItems = await backlogService.getPBIs()
    for (const id of itemIds) {
      const pbi = backlogItems.find((p) => p.id === id)
      if (pbi) {
        await backlogService.assignToSprint(pbi.id, sprint.id)
        sprint.items.push({
          id: pbi.id,
          code: pbi.code,
          title: pbi.title,
          assigneeName: pbi.assigneeName,
          assigneeAvatar: pbi.assigneeAvatar,
          storyPoints: pbi.storyPoints,
          status: pbi.status === 'done' ? 'done' : 'ready',
          epicName: pbi.epicName,
          priority: pbi.priority,
        })
        sprint.totalSP += pbi.storyPoints
        sprint.totalItemsCount += 1
        sprint.remainingItemsCount += 1
      }
    }

    sprint.progressPercent = Math.round(
      (sprint.completedSP / Math.max(1, sprint.totalSP)) * 100,
    )
  },

  async removeItemFromSprint(sprintId: string, itemId: string): Promise<void> {
    await delay(30)
    const sprint = sprintsState.find((s) => s.id === sprintId)
    if (!sprint) return

    const item = sprint.items.find((i) => i.id === itemId)
    if (item) {
      await backlogService.assignToSprint(item.id, undefined)
      sprint.items = sprint.items.filter((i) => i.id !== itemId)
      sprint.totalSP -= item.storyPoints
      if (item.status === 'done') {
        sprint.completedSP -= item.storyPoints
        sprint.completedItemsCount = Math.max(0, sprint.completedItemsCount - 1)
      } else {
        sprint.remainingItemsCount = Math.max(0, sprint.remainingItemsCount - 1)
      }
      sprint.totalItemsCount = Math.max(0, sprint.totalItemsCount - 1)
      sprint.progressPercent = Math.round(
        (sprint.completedSP / Math.max(1, sprint.totalSP)) * 100,
      )
    }
  },
}
