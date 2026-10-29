import type {
  BugItem,
  BugAssignee,
  BugFilters,
  CreateBugPayload,
  CloseBugPayload,
  StatusTransitionResult,
  BugStatus,
  BugSeverity,
  BugPriority,
} from '../types'
import { api, type BugData } from '@/services/api'

export const AVAILABLE_ASSIGNEES: BugAssignee[] = [
  {
    id: 'user-mq',
    name: 'Minh Quân',
    email: 'quan.minh@scrumflow.io',
    role: 'Tech Lead',
    department: 'Dev',
    avatar: 'MQ',
    statusText: 'Đang phụ trách 2 bug',
    activeBugCount: 2,
    isAvailable: true,
  },
  {
    id: 'user-ta',
    name: 'Tuấn Anh',
    email: 'anh.tuan@scrumflow.io',
    role: 'QA Lead',
    department: 'QA',
    avatar: 'TA',
    statusText: 'Sẵn sàng nhận bug mới',
    activeBugCount: 1,
    isAvailable: true,
  },
  {
    id: 'user-tt',
    name: 'Thùy Trang',
    email: 'trang.thuy@scrumflow.io',
    role: 'Frontend Dev',
    department: 'Dev',
    avatar: 'TT',
    statusText: 'Đang xử lý 1 bug',
    activeBugCount: 1,
    isAvailable: true,
  },
  {
    id: 'user-hl',
    name: 'Hoàng Long',
    email: 'long.hoang@scrumflow.io',
    role: 'Backend Dev',
    department: 'Dev',
    avatar: 'HL',
    statusText: '2 bug đang xử lý',
    activeBugCount: 2,
    isAvailable: true,
  },
  {
    id: 'user-dt',
    name: 'Đỗ Thảo',
    email: 'thao.do@scrumflow.io',
    role: 'Tester',
    department: 'QA',
    avatar: 'DT',
    statusText: 'Sẵn sàng',
    activeBugCount: 0,
    isAvailable: true,
  },
  {
    id: 'user-vn',
    name: 'Văn Nam',
    email: 'nam.van@scrumflow.io',
    role: 'DevOps Engineer',
    department: 'DevOps',
    avatar: 'VN',
    statusText: 'Sẵn sàng',
    activeBugCount: 0,
    isAvailable: true,
  },
  {
    id: 'user-ld',
    name: 'Linh Đan',
    email: 'dan.linh@scrumflow.io',
    role: 'QA Engineer',
    department: 'QA',
    avatar: 'LD',
    statusText: 'Sẵn sàng',
    activeBugCount: 1,
    isAvailable: true,
  },
]

function mapStatusFromBe(s: string): BugStatus {
  switch ((s || '').toUpperCase()) {
    case 'IN_PROGRESS':
      return 'in_progress'
    case 'RESOLVED':
      return 'resolved'
    case 'CLOSED':
      return 'closed'
    case 'OPEN':
    case 'REOPENED':
    default:
      return 'open'
  }
}

function mapStatusToBe(s: string): 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED' {
  switch (s) {
    case 'in_progress':
      return 'IN_PROGRESS'
    case 'resolved':
      return 'RESOLVED'
    case 'closed':
      return 'CLOSED'
    case 'open':
    default:
      return 'OPEN'
  }
}

function mapSeverityFromBe(s: string): BugSeverity {
  switch ((s || '').toUpperCase()) {
    case 'BLOCKER':
      return 'blocker'
    case 'MAJOR':
      return 'major'
    case 'MINOR':
      return 'minor'
    case 'TRIVIAL':
    default:
      return 'trivial'
  }
}

function mapSeverityToBe(s?: string): 'TRIVIAL' | 'MINOR' | 'MAJOR' | 'BLOCKER' {
  switch ((s || '').toLowerCase()) {
    case 'blocker':
      return 'BLOCKER'
    case 'major':
      return 'MAJOR'
    case 'minor':
      return 'MINOR'
    case 'trivial':
    default:
      return 'TRIVIAL'
  }
}

function mapPriorityFromBe(p: string): BugPriority {
  switch ((p || '').toUpperCase()) {
    case 'CRITICAL':
      return 'p1'
    case 'HIGH':
      return 'p2'
    case 'MEDIUM':
      return 'p3'
    case 'LOW':
    default:
      return 'p4'
  }
}

function mapPriorityToBe(p?: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  switch ((p || '').toLowerCase()) {
    case 'p1':
      return 'CRITICAL'
    case 'p2':
      return 'HIGH'
    case 'p3':
      return 'MEDIUM'
    case 'p4':
    default:
      return 'LOW'
  }
}

function mapBugDataToBugItem(b: BugData): BugItem {
  return {
    id: String(b.bugId),
    code: `#BUG-${b.bugId}`,
    title: b.title,
    description: b.description,
    stepsToReproduce: '',
    environment: b.environment || 'Chưa có thông tin môi trường',
    severity: mapSeverityFromBe(b.severity),
    priority: mapPriorityFromBe(b.priority),
    status: mapStatusFromBe(b.status),
    relatedTaskId: String(b.taskId),
    relatedTaskCode: b.taskCode || `#TASK-${b.taskId}`,
    relatedTaskTitle: b.taskTitle || `Task liên kết #${b.taskId}`,
    assignee: b.assigneeId
      ? {
          id: String(b.assigneeId),
          name: b.assigneeName || `Thành viên #${b.assigneeId}`,
          email: '',
          role: b.assigneeRole || 'Chưa có thông tin vai trò',
          avatar: b.assigneeAvatarCode || '?',
        }
      : undefined,
    reporter: {
      id: String(b.reporterId),
      name: b.reporterName || `User #${b.reporterId}`,
      role: 'Người báo cáo',
    },
    discoveredAt: b.createdAt,
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date(b.createdAt).toLocaleDateString('vi-VN'),
    updatedAt: b.updatedAt ? new Date(b.updatedAt).toLocaleDateString('vi-VN') : 'Mới tạo',
    attachments: [],
    comments: [],
  }
}

class BugService {
  private bugs: BugItem[] = []

  public async getBugs(
    filters: BugFilters & {
      assigneeId?: string
      page?: number
      pageSize?: number
    },
    projectId?: number,
  ): Promise<{
    items: BugItem[]
    total: number
    page: number
    pageSize: number
    stats: {
      totalOpen: number
      blockerCount: number
      majorCount: number
      mediumMinorCount: number
    }
  }> {
    if (projectId) {
      try {
        const queryParams = {
          keyword: filters.search,
          status: filters.status && filters.status !== 'all' ? mapStatusToBe(filters.status) : undefined,
          severity: filters.severity && filters.severity !== 'all' ? mapSeverityToBe(filters.severity) : undefined,
          page: filters.page || 1,
          pageSize: filters.pageSize || 7,
        }
        const res = await api.bugs.list(projectId, queryParams)
        const fetchedItems = res.data.items.map(mapBugDataToBugItem)
        this.bugs = fetchedItems

        const totalOpen = fetchedItems.filter((b) => b.status !== 'closed').length
        const blockerCount = fetchedItems.filter((b) => b.severity === 'blocker').length
        const majorCount = fetchedItems.filter((b) => b.severity === 'major').length
        const mediumMinorCount = fetchedItems.filter(
          (b) => b.severity === 'minor' || b.severity === 'trivial',
        ).length

        return {
          items: fetchedItems,
          total: res.data.total,
          page: res.data.page,
          pageSize: res.data.pageSize,
          stats: {
            totalOpen,
            blockerCount,
            majorCount,
            mediumMinorCount,
          },
        }
      } catch (err) {
        console.warn('⚠️ [BugService] Lỗi tải bugs từ API, dùng mock:', err)
      }
    }

    const page = filters.page || 1
    const pageSize = filters.pageSize || 7
    return {
      items: this.bugs.slice((page - 1) * pageSize, page * pageSize),
      total: this.bugs.length,
      page,
      pageSize,
      stats: {
        totalOpen: this.bugs.filter((b) => b.status !== 'closed').length,
        blockerCount: this.bugs.filter((b) => b.severity === 'blocker').length,
        majorCount: this.bugs.filter((b) => b.severity === 'major').length,
        mediumMinorCount: this.bugs.filter((b) => b.severity === 'minor' || b.severity === 'trivial').length,
      },
    }
  }

  public async getBugById(id: string): Promise<BugItem | null> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (numericId > 0) {
      try {
        const res = await api.bugs.get(numericId)
        const b = res.data.bug
        const item = mapBugDataToBugItem(b)
        if (res.data.task) {
          item.relatedTaskTitle = res.data.task.title
          item.relatedTaskCode = `#TASK-${res.data.task.taskId}`
        }
        if (res.data.taskComments) {
          item.comments = res.data.taskComments.items.map((c) => ({
            id: String(c.commentId),
            authorName: `User #${c.userId}`,
            authorRole: 'Thành viên',
            content: c.content,
            createdAt: new Date(c.createdAt).toLocaleString('vi-VN'),
          }))
        }
        if (res.data.taskAttachments) {
          item.attachments = res.data.taskAttachments.items.map((a) => ({
            id: String(a.attachmentId),
            name: a.fileName,
            size: `${(a.fileSize / 1024).toFixed(1)} KB`,
            type: a.fileName.endsWith('.png') || a.fileName.endsWith('.jpg') ? 'image' : 'doc',
            uploadedAt: new Date(a.uploadedAt).toLocaleString('vi-VN'),
          }))
        }
        return item
      } catch (err) {
        console.warn('⚠️ [BugService] Lỗi lấy chi tiết bug từ API:', err)
      }
    }
    const found = this.bugs.find((b) => b.id === id || b.code === id || b.code.replace('#', '') === id)
    return found ? { ...found } : null
  }

  public validateStatusTransition(
    currentStatus: BugStatus,
    targetStatus: BugStatus,
  ): StatusTransitionResult {
    if (currentStatus === targetStatus) {
      return { allowed: true }
    }

    if (currentStatus === 'open' && targetStatus === 'closed') {
      return {
        allowed: false,
        suggestedStatus: 'in_progress',
        errorMessage: 'Chuyển trạng thái không hợp lệ (Invalid Status Transition)',
        explanation:
          'Không thể chuyển trực tiếp từ "Mở (Open)" sang "Đóng (Closed)". Mọi lỗi phải được kỹ sư phân tích tại bước Đang xử lý và nghiệm thu tại bước Đã sửa trước khi đóng.',
      }
    }

    return { allowed: true }
  }

  public async updateBugStatus(id: string, newStatus: BugStatus): Promise<BugItem> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (numericId > 0) {
      try {
        await api.bugs.changeStatus(numericId, { status: mapStatusToBe(newStatus) })
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } }
        throw new Error(errorObj.response?.data?.message || 'Không thể đổi trạng thái Bug')
      }
    }

    const bug = this.bugs.find((b) => b.id === id)
    if (!bug) throw new Error('Không tìm thấy lỗi')
    bug.status = newStatus
    bug.updatedAt = new Date().toISOString()
    return { ...bug }
  }

  public async closeBug(id: string, payload: CloseBugPayload): Promise<BugItem> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (numericId > 0) {
      try {
        await api.bugs.close(numericId)
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } }
        throw new Error(errorObj.response?.data?.message || 'Không thể đóng Bug')
      }
    }

    const bug = this.bugs.find((b) => b.id === id)
    if (!bug) throw new Error('Không tìm thấy lỗi')
    bug.status = 'closed'
    bug.closedAt = new Date().toISOString()
    bug.resolutionReason = payload.resolutionReason
    bug.resolutionNote = payload.resolutionNote
    return { ...bug }
  }

  public async assignBug(id: string, assigneeId?: string): Promise<BugItem> {
    const numericId = /^\d+$/.test(id) ? Number(id) : NaN
    const numericAssigneeId = assigneeId ? (/^\d+$/.test(assigneeId) ? Number(assigneeId) : NaN) : null
    if (!Number.isSafeInteger(numericId) || numericId <= 0 || (numericAssigneeId !== null && (!Number.isSafeInteger(numericAssigneeId) || numericAssigneeId <= 0))) {
      throw new Error('Vui lòng chọn Bug và thành viên có ID thật.')
    }
    try {
      const saved = await api.bugs.assign(numericId, { assigneeId: numericAssigneeId })
      const updated = mapBugDataToBugItem(saved.data)
      this.bugs = this.bugs.map(bug => bug.id === id ? updated : bug)
      return updated
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Không thể giao Bug')
    }
  }

  public async createBug(payload: CreateBugPayload): Promise<BugItem> {
    const numericTaskId = payload.relatedTaskId && /^\d+$/.test(payload.relatedTaskId) ? Number(payload.relatedTaskId) : NaN
    if (!Number.isSafeInteger(numericTaskId) || numericTaskId <= 0) throw new Error('Vui lòng chọn Task thật trong dự án cho Bug.')

    const combinedDescription = [
      payload.description,
      payload.stepsToReproduce ? `\n\n### Các bước tái hiện:\n${payload.stepsToReproduce}` : '',
      payload.expectedResult ? `\n\n### Kết quả mong đợi:\n${payload.expectedResult}` : '',
    ].join('')

    try {
      const res = await api.bugs.create({
        taskId: numericTaskId,
        title: payload.title.trim(),
        description: combinedDescription,
        environment: payload.environment,
        severity: mapSeverityToBe(payload.severity),
        priority: mapPriorityToBe(payload.priority),
      })

      const newItem = mapBugDataToBugItem(res.data)
      this.bugs.unshift(newItem)
      return newItem
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Lỗi khi tạo Bug mới')
    }
  }

  public async updateBug(id: string, updates: Partial<BugItem>): Promise<BugItem> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (numericId > 0) {
      try {
        await api.bugs.update(numericId, {
          title: updates.title || '',
          description: updates.description || '',
          environment: updates.environment,
          severity: mapSeverityToBe(updates.severity),
          priority: mapPriorityToBe(updates.priority),
        })
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } }
        throw new Error(errorObj.response?.data?.message || 'Lỗi khi cập nhật Bug')
      }
    }

    const index = this.bugs.findIndex((b) => b.id === id)
    if (index === -1) throw new Error('Không tìm thấy lỗi')
    this.bugs[index] = { ...this.bugs[index], ...updates }
    return { ...this.bugs[index] }
  }

  public async deleteBug(id: string): Promise<boolean> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (numericId > 0) {
      try {
        await api.bugs.delete(numericId)
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } }
        throw new Error(errorObj.response?.data?.message || 'Lỗi khi xóa Bug')
      }
    }
    this.bugs = this.bugs.filter((b) => b.id !== id)
    return true
  }

  public async addComment(bugId: string, content: string): Promise<BugItem> {
    const bug = await this.getBugById(bugId)
    if (!bug) throw new Error('Không tìm thấy lỗi')

    const numericTaskId = bug.relatedTaskId ? parseInt(bug.relatedTaskId.replace(/\D/g, ''), 10) : 0
    if (numericTaskId > 0) {
      try {
        await api.comments.createForTask(numericTaskId, { content })
      } catch (err) {
        console.warn('⚠️ Lỗi gửi bình luận trên BE:', err)
      }
    }

    bug.comments.push({
      id: `comm-${Date.now()}`,
      authorName: 'Tôi',
      authorRole: 'Thành viên',
      content,
      createdAt: 'Vừa xong',
    })
    return { ...bug }
  }
}

export const bugService = new BugService()
