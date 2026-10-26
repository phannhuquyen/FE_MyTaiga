import { api, type EpicData, type EpicRequest } from '@/services/api'
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
    color: getColor(data.epicId),
    targetSprint: 'Sprint hiện tại',
    sprintRange: 'Sprint 1 - Sprint 3',
    ownerName: 'Manager dự án',
    ownerAvatar: 'PM',
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

      const res = await api.epics.list(projectId, {
        keyword: filters?.search?.trim() || undefined,
        status: beStatus,
        page: 1,
        pageSize: 100,
      })

      const list = res.data.items.map(mapBeEpicToFe)

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
    const numericId = parseInt(epicId.replace(/\D/g, ''), 10)
    if (numericId > 0) {
      try {
        const res = await api.epics.progress(numericId)
        const done = res.data.completedPbis
        const total = res.data.totalPbis
        const remain = Math.max(0, total - done)
        const percent = Math.round(res.data.pbiProgressPercent)

        return [
          {
            status: 'Hoàn thành',
            statusKey: 'done',
            pbiCount: done,
            taskCount: res.data.completedTasks,
            storyPoints: done * 3,
            percentage: percent,
            color: '#076859',
          },
          {
            status: 'Đang thực hiện',
            statusKey: 'in_progress',
            pbiCount: remain,
            taskCount: Math.max(0, res.data.totalTasks - res.data.completedTasks),
            storyPoints: remain * 3,
            percentage: 100 - percent,
            color: '#2563eb',
          },
        ]
      } catch {
        // fallback
      }
    }

    return [
      {
        status: 'Hoàn thành',
        statusKey: 'done',
        pbiCount: 6,
        taskCount: 10,
        storyPoints: 18,
        percentage: 50,
        color: '#076859',
      },
      {
        status: 'Đang kiểm tra',
        statusKey: 'testing',
        pbiCount: 2,
        taskCount: 3,
        storyPoints: 5,
        percentage: 15,
        color: '#2563eb',
      },
      {
        status: 'Đang làm',
        statusKey: 'in_progress',
        pbiCount: 3,
        taskCount: 5,
        storyPoints: 9,
        percentage: 25,
        color: '#0d9488',
      },
      {
        status: 'Cần làm',
        statusKey: 'todo',
        pbiCount: 1,
        taskCount: 2,
        storyPoints: 4,
        percentage: 10,
        color: '#d1d5db',
      },
    ]
  },

  async createEpic(payload: CreateEpicPayload): Promise<Epic> {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) throw new Error('Vui lòng chọn dự án trước khi tạo Epic.')

    if (!payload.name || payload.name.trim().length < 2) {
      throw new Error('Tiêu đề Epic phải chứa ít nhất 2 ký tự.')
    }

    const requestBody: EpicRequest = {
      title: payload.name.trim(),
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
    const numericEpicId = parseInt(epicId.replace(/\D/g, ''), 10)
    if (numericEpicId > 0) {
      for (const t of taskIds) {
        const numericTaskId = parseInt(t.replace(/\D/g, ''), 10)
        if (numericTaskId > 0) {
          await api.epics.linkTask(numericTaskId, { epicId: numericEpicId })
        }
      }
    }
  },
}
