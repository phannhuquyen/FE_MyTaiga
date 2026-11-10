import { allPages } from '@/lib/allPages'
import { api, type EpicData, type EpicRequest, type TaskData } from '@/services/api'
import { projectService } from '@/features/projects/services/projectService'
import type {
  Epic,
  CreateEpicPayload,
  UpdateEpicPayload,
  EpicProgressBreakdown,
  EpicPriority,
  EpicStatus,
} from '../types'
import { backlogService } from '@/features/backlog/services/backlogService'
import type { PBI } from '@/features/backlog/types'

const PALETTE = ['#0284c7', '#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626']

function getColor(id: number): string {
  return PALETTE[id % PALETTE.length]
}

function priorityToNumber(p?: EpicPriority): number {
  switch (p) {
    case 'urgent': return 1
    case 'high': return 2
    case 'medium': return 3
    case 'low': return 4
    default: return 3
  }
}

function numberToPriority(n: number): EpicPriority {
  switch (n) {
    case 1: return 'urgent'
    case 2: return 'high'
    case 3: return 'medium'
    case 4: return 'low'
    default: return 'medium'
  }
}

function statusToBe(s?: EpicStatus): 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CLOSED' {
  switch (s) {
    case 'open': return 'OPEN'
    case 'in_progress': return 'IN_PROGRESS'
    case 'completed': return 'DONE'
    case 'closed': return 'CLOSED'
    default: return 'OPEN'
  }
}

function statusToFe(s: string): EpicStatus {
  switch (s) {
    case 'OPEN': return 'open'
    case 'IN_PROGRESS': return 'in_progress'
    case 'DONE': return 'completed'
    case 'CLOSED': return 'closed'
    default: return 'open'
  }
}

function formatDate(iso?: string | null): string {
  if (!iso) return 'Chưa xác định'
  const parts = iso.split('T')[0].split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return iso
}

function mapBeEpicToFe(data: EpicData): Epic {
  return {
    id: String(data.epicId),
    code: `EPIC-0${data.epicId}`,
    name: data.title,
    description: data.description || '',
    status: statusToFe(data.status),
    priority: numberToPriority(data.priority),
    color: data.color || getColor(data.epicId),
    targetSprint: 'Chưa có dữ liệu kế hoạch',
    sprintRange: 'Chưa có dữ liệu kế hoạch',
    ownerName: 'Chưa có dữ liệu owner',
    ownerAvatar: '—',
    pbisCount: 0,
    tasksCount: 0,
    completedPoints: 0,
    totalPoints: 0,
    progressPercent: 0,
    tasks: [],
    createdAt: formatDate(data.createdAt),
    updatedAt: data.updatedAt ? formatDate(data.updatedAt) : 'Vừa xong',
  }
}

let cachedEpics: Epic[] = []

export const epicService = {
  async getEpics(filters?: {
    search?: string
    status?: string
    priority?: string
  }): Promise<Epic[]> {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) return cachedEpics

    try {
      const beStatus =
        filters?.status && filters.status !== 'all' ? statusToBe(filters.status as EpicStatus) : undefined

      const rows = await allPages(page => api.epics.list(projectId, {
        keyword: filters?.search?.trim() || undefined,
        status: beStatus,
        page,
        pageSize: 100,
      }))

      const pbis = await allPages(page => api.productBacklog.list({ projectId, page, pageSize: 100 }))
      const list = rows.map(data => {
        const epic = mapBeEpicToFe(data)
        const items = pbis.filter(item => item.epicId === data.epicId)
        epic.totalPoints = items.reduce((sum, item) => sum + item.storyPoint, 0)
        epic.completedPoints = items.filter(item => item.status === 'DONE').reduce((sum, item) => sum + item.storyPoint, 0)
        return epic
      })

      // Parallel fetch progress for each epic
      await Promise.all(
        list.map(async (epic) => {
          try {
            const prog = await api.epics.progress(parseInt(epic.id, 10))
            epic.pbisCount = prog.data.totalPbis
            epic.tasksCount = prog.data.totalTasks
            epic.progressPercent = Math.round(prog.data.pbiProgressPercent)
          } catch {
            // Ignore progress error if any
          }
        }),
      )

      cachedEpics = list
      return list
    } catch (error) {
      console.warn(`⚠️ [EpicService] Lỗi khi lấy danh sách Epic dự án ${projectId}:`, error)
      let list = [...cachedEpics]
      if (filters?.search?.trim()) {
        const q = filters.search.trim().toLowerCase()
        list = list.filter((e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q))
      }
      if (filters?.status && filters.status !== 'all') {
        list = list.filter((e) => e.status === filters.status)
      }
      return list
    }
  },

  async getEpicById(id: string): Promise<Epic | undefined> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (Number.isNaN(numericId) || numericId <= 0) {
      return cachedEpics.find((e) => e.id === id || e.code.toLowerCase() === id.toLowerCase())
    }

    try {
      const res = await api.epics.get(numericId)
      const mapped = mapBeEpicToFe(res.data)
      try {
        const prog = await api.epics.progress(numericId)
        mapped.pbisCount = prog.data.totalPbis
        mapped.tasksCount = prog.data.totalTasks
        mapped.progressPercent = Math.round(prog.data.pbiProgressPercent)
      } catch {
        // ignore
      }
      const projectId = res.data.projectId
      const [pbis, tasks] = await Promise.all([
        allPages(page => api.productBacklog.list({ projectId, epicId: numericId, page, pageSize: 100 })),
        allPages(page => api.tasks.list(projectId, { page, pageSize: 100 })),
      ])
      mapped.totalPoints = pbis.reduce((sum, item) => sum + item.storyPoint, 0)
      mapped.completedPoints = pbis.filter(item => item.status === 'DONE').reduce((sum, item) => sum + item.storyPoint, 0)
      mapped.tasks = tasks.filter(item => item.epicId === numericId).map(item => ({
        id: String(item.taskId), code: `TASK-${item.taskId}`, title: item.title,
        status: taskStatus(item), assigneeName: item.assignee?.fullName || item.assigneeName || 'Chưa giao',
        assigneeAvatar: item.assigneeAvatarCode || '—',
      }))
      return mapped
    } catch {
      return cachedEpics.find((e) => e.id === id || e.code.toLowerCase() === id.toLowerCase())
    }
  },

  async getEpicPBIs(epicId: string): Promise<PBI[]> {
    const all = await backlogService.getPBIs()
    return all.filter((p) => p.epicId === epicId)
  },

  async getProgressBreakdown(epicId: string): Promise<EpicProgressBreakdown[]> {
    const projectId = projectService.getActiveProjectId()
    if (!projectId || !/^\d+$/.test(epicId)) return []
    const [pbis, tasks] = await Promise.all([
      allPages(page => api.productBacklog.list({ projectId, epicId: Number(epicId), page, pageSize: 100 })),
      allPages(page => api.tasks.list(projectId, { page, pageSize: 100 })),
    ])
    const epicTasks = tasks.filter(item => item.epicId === Number(epicId))
    const groups = [
      { status: 'Hoàn thành', statusKey: 'done' as const, color: '#076859', pbis: pbis.filter(item => item.status === 'DONE'), tasks: epicTasks.filter(item => item.status === 'DONE') },
      { status: 'Đang thực hiện / Còn lại', statusKey: 'in_progress' as const, color: '#2563eb', pbis: pbis.filter(item => item.status !== 'DONE'), tasks: epicTasks.filter(item => item.status !== 'DONE') },
    ]
    return groups.map(group => ({
      status: group.status, statusKey: group.statusKey, color: group.color,
      pbiCount: group.pbis.length, taskCount: group.tasks.length,
      storyPoints: group.pbis.reduce((sum, item) => sum + item.storyPoint, 0),
      percentage: pbis.length ? Math.round(group.pbis.length / pbis.length * 100) : 0,
    }))
  },

  async createEpic(payload: CreateEpicPayload): Promise<Epic> {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) throw new Error('Vui lòng chọn dự án trước khi tạo Epic.')

    if (!payload.name || payload.name.trim().length < 2) {
      throw new Error('Tiêu đề Epic phải chứa ít nhất 2 ký tự.')
    }

    const requestBody: EpicRequest = {
      title: payload.name.trim(),
      color: payload.color,
      description: payload.description?.trim() || null,
      priority: priorityToNumber(payload.priority),
      status: 'OPEN',
    }

    const res = await api.epics.create(projectId, requestBody)
    const newEpic = mapBeEpicToFe(res.data)
    cachedEpics = [newEpic, ...cachedEpics]
    return newEpic
  },

  async updateEpic(id: string, payload: UpdateEpicPayload): Promise<Epic> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (Number.isNaN(numericId) || numericId <= 0) {
      throw new Error('ID Epic không hợp lệ.')
    }

    const current = await this.getEpicById(id)
    const requestBody: EpicRequest = {
      title: (payload.name ?? current?.name ?? 'Epic').trim(),
      color: payload.color,
      description: payload.description ?? current?.description ?? null,
      priority: priorityToNumber(payload.priority ?? current?.priority),
      status: statusToBe(payload.status ?? current?.status),
    }

    const res = await api.epics.update(numericId, requestBody)
    const updated = mapBeEpicToFe(res.data)
    cachedEpics = cachedEpics.map((e) => (e.id === id ? updated : e))
    return updated
  },

  async deleteEpic(id: string): Promise<boolean> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (Number.isNaN(numericId) || numericId <= 0) {
      throw new Error('ID Epic không hợp lệ.')
    }

    await api.epics.delete(numericId)
    cachedEpics = cachedEpics.filter((e) => e.id !== id)
    return true
  },

  async linkPBI(epicId: string, pbiId: string): Promise<void> {
    const numericEpicId = parseInt(epicId.replace(/\D/g, ''), 10)
    const numericPbiId = parseInt(pbiId.replace(/\D/g, ''), 10)
    if (numericEpicId > 0 && numericPbiId > 0) {
      await api.epics.linkPbi(numericPbiId, { epicId: numericEpicId })
    }
  },

  async unlinkPBI(epicId: string, pbiId: string): Promise<void> {
    console.log(`Unlink PBI ${pbiId} from Epic ${epicId} (BE yêu cầu gán sang Epic khác vì PBI bắt buộc có Epic)`)
  },

  async linkTasks(epicId: string, taskIds: string[]): Promise<void> {
    if (!/^[1-9]\d*$/.test(epicId) || taskIds.some(id => !/^[1-9]\d*$/.test(id))) {
      throw new Error('ID Epic hoặc Task không hợp lệ; vui lòng chọn dữ liệu từ dự án.')
    }
    for (const id of taskIds) await api.epics.linkTask(Number(id), { epicId: Number(epicId) })
  },
}

function taskStatus(item: TaskData): 'todo' | 'in_progress' | 'testing' | 'done' {
  return item.status === 'DONE' ? 'done' : item.status === 'IN_REVIEW' ? 'testing' : item.status === 'IN_PROGRESS' ? 'in_progress' : 'todo'
}
