import type {
  Epic,
  CreateEpicPayload,
  UpdateEpicPayload,
  EpicProgressBreakdown,
  EpicTask,
} from '../types'
import { backlogService } from '@/features/backlog/services/backlogService'
import type { PBI } from '@/features/backlog/types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const INITIAL_EPIC_TASKS: EpicTask[] = [
  {
    id: 'task-301',
    code: 'TASK-301',
    title: 'Viết unit test cho middleware giải mã JWT token',
    status: 'done',
    assigneeName: 'Lê Minh Trí',
    assigneeAvatar: 'MT',
    parentPbiCode: 'PBI-12',
    parentPbiTitle: 'Core Auth Engine',
  },
  {
    id: 'task-302',
    code: 'TASK-302',
    title: 'Cập nhật schema migration bảng `user_auth_tokens`',
    status: 'done',
    assigneeName: 'Nguyễn Văn An',
    assigneeAvatar: 'VA',
    parentPbiCode: 'PBI-12',
    parentPbiTitle: 'Core Auth Engine',
  },
  {
    id: 'task-305',
    code: 'TASK-305',
    title: 'Cấu hình rate-limiting Redis trên cổng /auth/login',
    status: 'in_progress',
    assigneeName: undefined,
    parentPbiCode: 'PBI-15',
    parentPbiTitle: 'Session Redis Layer',
  },
  {
    id: 'task-308',
    code: 'TASK-308',
    title: 'Tích hợp dịch vụ SMS Twilio gửi OTP dự phòng',
    status: 'todo',
    assigneeName: 'Đặng Quốc Khánh',
    assigneeAvatar: 'QK',
    parentPbiCode: 'PBI-19',
    parentPbiTitle: 'SMS 2FA Gateway',
  },
  {
    id: 'task-312',
    code: 'TASK-312',
    title: 'Kiểm thử bảo mật Pentest endpoint xác thực 2FA',
    status: 'todo',
    assigneeName: 'Phạm Kim Ngân',
    assigneeAvatar: 'KN',
    parentPbiCode: 'PBI-22',
    parentPbiTitle: 'Security Hardening',
  },
]

const INITIAL_EPICS: Epic[] = [
  {
    id: 'epic-1',
    code: 'EPIC-01',
    name: 'Cổng xác thực & Quản lý danh tính (IAM)',
    description:
      'Xây dựng hệ thống định danh tập trung SSO, OAuth2/OIDC, bảo mật 2 lớp 2FA và phân quyền RBAC đa phòng ban trên toàn bộ hệ thống microservices.',
    status: 'in_progress',
    priority: 'high',
    color: '#0284c7', // Sky / tealish blue
    targetSprint: 'Sprint 16 (Q3/2025)',
    sprintRange: 'Sprint 14 - Sprint 16',
    ownerName: 'Minh Quân',
    ownerAvatar: 'MQ',
    pbisCount: 12,
    tasksCount: 20,
    completedPoints: 13,
    totalPoints: 20,
    progressPercent: 65,
    tasks: [...INITIAL_EPIC_TASKS],
    createdAt: '01/10/2024',
    updatedAt: '2 phút trước',
  },
  {
    id: 'epic-2',
    code: 'EPIC-02',
    name: 'Tích hợp Thanh toán & Đối soát tự động',
    description:
      'Hỗ trợ cổng thanh toán NAPAS, Momo và đối soát giao dịch định kỳ.',
    status: 'in_progress',
    priority: 'high',
    color: '#2563eb', // Blue
    targetSprint: 'Sprint 17 (Q4/2025)',
    sprintRange: 'Sprint 15 - Sprint 17',
    ownerName: 'Minh Quân',
    ownerAvatar: 'MQ',
    pbisCount: 8,
    tasksCount: 15,
    completedPoints: 6,
    totalPoints: 15,
    progressPercent: 42,
    tasks: [],
    createdAt: '05/10/2024',
    updatedAt: '1 ngày trước',
  },
  {
    id: 'epic-3',
    code: 'EPIC-03',
    name: 'Tối ưu hóa Pipeline CI/CD & Microservices',
    description:
      'Triển khai Kubernetes cluster nội bộ và rút ngắn thời gian build.',
    status: 'open',
    priority: 'medium',
    color: '#d97706', // Amber / Gold
    targetSprint: 'Sprint 18 (Q4/2025)',
    sprintRange: 'Sprint 16 - Sprint 18',
    ownerName: 'Minh Quân',
    ownerAvatar: 'MQ',
    pbisCount: 6,
    tasksCount: 10,
    completedPoints: 2,
    totalPoints: 10,
    progressPercent: 15,
    tasks: [],
    createdAt: '08/10/2024',
    updatedAt: '3 ngày trước',
  },
  {
    id: 'epic-4',
    code: 'EPIC-04',
    name: 'Hệ thống Báo cáo & Flow Metrics Realtime',
    description:
      'Trực quan hóa Cycle Time, Throughput và Cumulative Flow Diagram.',
    status: 'completed',
    priority: 'low',
    color: '#076859', // Primary green
    targetSprint: 'Sprint 14 (Hoàn thành)',
    sprintRange: 'Sprint 12 - Sprint 14',
    ownerName: 'Minh Quân',
    ownerAvatar: 'MQ',
    pbisCount: 14,
    tasksCount: 24,
    completedPoints: 24,
    totalPoints: 24,
    progressPercent: 100,
    tasks: [],
    createdAt: '15/09/2024',
    updatedAt: '1 tuần trước',
  },
  {
    id: 'epic-5',
    code: 'EPIC-05',
    name: 'Chuyển đổi dữ liệu Legacy Database v1.0',
    description:
      'Di chuyển 2.4M bản ghi từ MSSQL sang PostgreSQL schema mới.',
    status: 'closed',
    priority: 'low',
    color: '#64748b', // Slate gray
    targetSprint: 'Đã đóng',
    sprintRange: 'Sprint 10 - Sprint 12',
    ownerName: 'Minh Quân',
    ownerAvatar: 'MQ',
    pbisCount: 9,
    tasksCount: 12,
    completedPoints: 12,
    totalPoints: 12,
    progressPercent: 100,
    tasks: [],
    createdAt: '01/09/2024',
    updatedAt: '2 tuần trước',
  },
]

let epicsState = [...INITIAL_EPICS]
let nextEpicIndex = 6

export const epicService = {
  async getEpics(filters?: {
    search?: string
    status?: string
    priority?: string
  }): Promise<Epic[]> {
    await delay(30)
    let list = [...epicsState]

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      )
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((e) => e.status === filters.status)
    }

    if (filters?.priority && filters.priority !== 'all') {
      list = list.filter((e) => e.priority === filters.priority)
    }

    return list
  },

  async getEpicById(id: string): Promise<Epic | undefined> {
    await delay(20)
    return epicsState.find((e) => e.id === id || e.code.toLowerCase() === id.toLowerCase())
  },

  async getEpicPBIs(epicId: string): Promise<PBI[]> {
    await delay(30)
    const all = await backlogService.getPBIs()
    return all.filter((p) => p.epicId === epicId)
  },

  async getProgressBreakdown(epicId: string): Promise<EpicProgressBreakdown[]> {
    await delay(20)
    const epic = epicsState.find((e) => e.id === epicId)
    if (!epic) return []

    // S6-04 exact distribution reference:
    // Hoàn thành: 50% (10 mốc, 6 PBI, 10 Task, 18 SP)
    // Đang kiểm tra: 15% (3 mốc, 2 PBI, 3 Task, 5 SP)
    // Đang làm: 25% (5 mốc, 3 PBI, 5 Task, 9 SP)
    // Cần làm: 10% (2 mốc, 1 PBI, 2 Task, 4 SP)
    return [
      {
        status: 'Hoàn thành',
        statusKey: 'done',
        pbiCount: 6,
        taskCount: 10,
        storyPoints: 18,
        percentage: 50,
        color: '#076859', // primary teal
      },
      {
        status: 'Đang kiểm tra',
        statusKey: 'testing',
        pbiCount: 2,
        taskCount: 3,
        storyPoints: 5,
        percentage: 15,
        color: '#2563eb', // blue
      },
      {
        status: 'Đang làm',
        statusKey: 'in_progress',
        pbiCount: 3,
        taskCount: 5,
        storyPoints: 9,
        percentage: 25,
        color: '#0d9488', // teal
      },
      {
        status: 'Cần làm',
        statusKey: 'todo',
        pbiCount: 1,
        taskCount: 2,
        storyPoints: 4,
        percentage: 10,
        color: '#d1d5db', // gray
      },
    ]
  },

  async createEpic(payload: CreateEpicPayload): Promise<Epic> {
    await delay(50)
    if (!payload.name || payload.name.trim().length < 5) {
      throw new Error('Tiêu đề Epic phải chứa ít nhất 5 ký tự.')
    }

    const code = `EPIC-0${nextEpicIndex++}`
    const id = `epic-${nextEpicIndex}`

    const newEpic: Epic = {
      id,
      code,
      name: payload.name.trim(),
      description: payload.description || '',
      status: 'open',
      priority: payload.priority || 'high',
      color: payload.color || '#0284c7',
      targetSprint: 'Sprint 17 (Dự thảo)',
      sprintRange: 'Sprint 15 - Sprint 17',
      ownerName: 'Minh Quân',
      ownerAvatar: 'MQ',
      pbisCount: 0,
      tasksCount: 0,
      completedPoints: 0,
      totalPoints: 0,
      progressPercent: 0,
      tasks: [],
      createdAt: 'Hôm nay',
      updatedAt: 'Vừa xong',
    }

    epicsState = [newEpic, ...epicsState]
    return newEpic
  },

  async updateEpic(id: string, payload: UpdateEpicPayload): Promise<Epic> {
    await delay(40)
    const index = epicsState.findIndex((e) => e.id === id)
    if (index === -1) {
      throw new Error('Không tìm thấy Epic.')
    }

    const current = epicsState[index]
    const updated: Epic = {
      ...current,
      ...payload,
      updatedAt: 'Vừa xong',
    }

    epicsState[index] = updated
    return updated
  },

  async deleteEpic(id: string): Promise<boolean> {
    await delay(50)
    const epic = epicsState.find((e) => e.id === id)
    if (!epic) throw new Error('Không tìm thấy Epic để xóa.')

    // Unlink all PBIs from this epic in backlog
    const pbis = await backlogService.getPBIs()
    const linkedPBIs = pbis.filter((p) => p.epicId === epic.id)
    for (const p of linkedPBIs) {
      await backlogService.linkEpic(p.id, undefined)
    }

    epicsState = epicsState.filter((e) => e.id !== id)
    return true
  },

  async linkPBI(epicId: string, pbiId: string): Promise<void> {
    await delay(40)
    const epic = epicsState.find((e) => e.id === epicId)
    if (!epic) throw new Error('Không tìm thấy Epic.')

    await backlogService.linkEpic(pbiId, epic.id)
    epic.pbisCount = (epic.pbisCount || 0) + 1
  },

  async unlinkPBI(epicId: string, pbiId: string): Promise<void> {
    await delay(30)
    const epic = epicsState.find((e) => e.id === epicId)
    await backlogService.linkEpic(pbiId, undefined)
    if (epic && epic.pbisCount > 0) {
      epic.pbisCount -= 1
    }
  },

  async linkTasks(epicId: string, taskIds: string[]): Promise<void> {
    await delay(40)
    const epic = epicsState.find((e) => e.id === epicId)
    if (!epic) throw new Error('Không tìm thấy Epic.')
    epic.tasksCount = (epic.tasksCount || 0) + taskIds.length
  },
}
