import {
  api,
  type BacklogRequest,
  type ProductBacklogItemData,
} from '@/services/api'
import { projectService } from '@/features/projects/services/projectService'
import type {
  PBI,
  EpicSummary,
  SprintSummary,
  CreatePBIPayload,
  UpdatePBIPayload,
  BacklogSummaryMetrics,
  PBIPriority,
  PBIStatus,
} from '../types'

function priorityToNumber(p?: PBIPriority): number {
  switch (p) {
    case 'urgent': return 1
    case 'high': return 2
    case 'medium': return 3
    case 'low': return 4
    default: return 3
  }
}

function numberToPriority(n: number): PBIPriority {
  switch (n) {
    case 1: return 'urgent'
    case 2: return 'high'
    case 3: return 'medium'
    case 4: return 'low'
    default: return 'medium'
  }
}

function statusToBe(s?: PBIStatus): 'NEW' | 'READY' | 'IN_SPRINT' | 'DONE' {
  switch (s) {
    case 'new': return 'NEW'
    case 'ready': return 'READY'
    case 'in_progress':
    case 'review':
    case 'locked':
      return 'IN_SPRINT'
    case 'done': return 'DONE'
    default: return 'NEW'
  }
}

function statusToFe(s: string): PBIStatus {
  switch (s) {
    case 'NEW': return 'new'
    case 'READY': return 'ready'
    case 'IN_SPRINT': return 'in_progress'
    case 'DONE': return 'done'
    default: return 'ready'
  }
}

function formatDate(iso?: string | null): string {
  if (!iso) return 'Chưa xác định'
  const parts = iso.split('T')[0].split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return iso
}

function mapBePbiToFe(
  item: ProductBacklogItemData,
  epicNameMap: Map<number, string>,
): PBI {
  const epicName = epicNameMap.get(item.epicId) || `Epic ${item.epicId}`
  return {
    id: String(item.pbiId),
    code: `SB-${item.pbiId}`,
    title: item.title,
    description: item.description || '',
    itemType: 'user_story',
    priority: numberToPriority(item.priority),
    status: statusToFe(item.status),
    storyPoints: item.storyPoint,
    epicId: String(item.epicId),
    epicName,
    epicColor: '#0284c7',
    sprintId: undefined,
    sprintName: item.status === 'IN_SPRINT' ? 'Chưa tải được liên kết Sprint' : undefined,
    reporterName: 'Chưa có dữ liệu người tạo',
    reporterAvatar: '—',
    reporterRole: 'Backend chưa cung cấp',
    createdAt: formatDate(item.createdAt),
    updatedAt: item.updatedAt ? formatDate(item.updatedAt) : 'Vừa xong',
    subtasks: [],
    acceptanceCriteria: [],
    comments: [],
  }
}

let cachedPBIs: PBI[] = []
let cachedEpics: EpicSummary[] = []
let cachedSprints: SprintSummary[] = []

async function resolveSprintLinks(items: PBI[], projectId: number) {
  if (!items.some(item => item.status === 'in_progress')) return
  const sprints = await api.sprints.list({ projectId, page: 1, pageSize: 100 })
  await Promise.all(sprints.data.items.filter(sprint => sprint.status !== 'CLOSED').map(async sprint => {
    const progress = await api.sprints.progress(sprint.sprintId)
    for (const linked of progress.data.items) {
      const item = items.find(row => row.id === String(linked.pbiId) && row.status === 'in_progress')
      if (item) { item.sprintId = String(sprint.sprintId); item.sprintName = sprint.sprintName }
    }
  }))
}

export const backlogService = {
  async getPBIs(filters?: {
    search?: string
    status?: string
    priority?: string
    epicId?: string
    sprintId?: string | 'unassigned'
  }): Promise<PBI[]> {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) return cachedPBIs

    try {
      const epicsRes = await api.epics.list(projectId, { page: 1, pageSize: 100 })
      const epicMap = new Map<number, string>()
      epicsRes.data.items.forEach((e) => epicMap.set(e.epicId, e.title))

      const numericEpicId =
        filters?.epicId && filters.epicId !== 'all'
          ? parseInt(filters.epicId.replace(/\D/g, ''), 10)
          : undefined

      const beStatus =
        filters?.status && filters.status !== 'all'
          ? statusToBe(filters.status as PBIStatus)
          : undefined

      const res = await api.productBacklog.list({
        projectId,
        epicId: numericEpicId && numericEpicId > 0 ? numericEpicId : undefined,
        status: beStatus,
        keyword: filters?.search?.trim() || undefined,
        page: 1,
        pageSize: 100,
      })

      let list = res.data.items.map((item) => mapBePbiToFe(item, epicMap))
      await resolveSprintLinks(list, projectId)

      if (filters?.priority && filters.priority !== 'all') {
        list = list.filter((p) => p.priority === filters.priority)
      }

      cachedPBIs = list
      return list
    } catch (error) {
      console.warn(`⚠️ [BacklogService] Lỗi khi lấy danh sách PBI dự án ${projectId}:`, error)
      return cachedPBIs
    }
  },

  async getPBIById(id: string): Promise<PBI | undefined> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (numericId > 0) {
      try {
        const res = await api.productBacklog.get(numericId)
        const item = mapBePbiToFe(res.data, new Map())
        const projectId = projectService.getActiveProjectId()
        if (projectId) await resolveSprintLinks([item], projectId)
        return item
      } catch {
        // fallback
      }
    }
    return cachedPBIs.find((p) => p.id === id)
  },

  async getEpics(): Promise<EpicSummary[]> {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) return cachedEpics

    try {
      const res = await api.epics.list(projectId, { page: 1, pageSize: 100 })
      cachedEpics = res.data.items.map((e) => ({
        id: String(e.epicId),
        name: e.title,
        color: '#0284c7',
        description: e.description || '',
        pbiCount: 0,
      }))
      return cachedEpics
    } catch {
      return cachedEpics
    }
  },

  async getSprints(): Promise<SprintSummary[]> {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) return cachedSprints

    try {
      const res = await api.sprints.list({ projectId, page: 1, pageSize: 100 })
      cachedSprints = res.data.items.map((s) => ({
        id: String(s.sprintId),
        name: s.sprintName,
        status: s.status.toLowerCase() as 'active' | 'planned' | 'draft' | 'closed',
        dateRange: `${formatDate(s.startDate)} - ${formatDate(s.endDate)}`,
        capacity: 25,
        assignedSP: 0,
        pbiCount: 0,
      }))
      return cachedSprints
    } catch {
      return cachedSprints
    }
  },

  async getMetrics(): Promise<BacklogSummaryMetrics> {
    const totalPBIs = cachedPBIs.length
    const totalStoryPoints = cachedPBIs.reduce((sum, p) => sum + p.storyPoints, 0)
    const unassignedList = cachedPBIs.filter((p) => !p.sprintId)
    const unassignedPBIs = unassignedList.length
    const unassignedStoryPoints = unassignedList.reduce((sum, p) => sum + p.storyPoints, 0)
    const teamVelocity = 24

    return {
      totalPBIs,
      totalStoryPoints,
      unassignedPBIs,
      unassignedStoryPoints,
      teamVelocity,
      estimatedSprintsLeft: Number((unassignedStoryPoints / (teamVelocity || 1)).toFixed(1)),
    }
  },

  async createPBI(payload: CreatePBIPayload): Promise<PBI> {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) throw new Error('Vui lòng chọn dự án.')

    if (!payload.title || payload.title.trim().length < 2) {
      throw new Error('Tiêu đề PBI phải chứa ít nhất 2 ký tự.')
    }

    // Determine target Epic (BE requires epicId)
    let epicIdNum = payload.epicId ? parseInt(payload.epicId.replace(/\D/g, ''), 10) : 0
    if (!epicIdNum || Number.isNaN(epicIdNum)) {
      const epics = await this.getEpics()
      if (epics.length === 0) {
        throw new Error('Dự án chưa có Epic nào. Vui lòng tạo Epic trước khi tạo thẻ Backlog.')
      }
      epicIdNum = parseInt(epics[0].id, 10)
    }

    const requestBody: BacklogRequest = {
      epicId: epicIdNum,
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      storyPoint: Math.max(0, payload.storyPoints || 1),
      priority: priorityToNumber(payload.priority),
      status: 'NEW',
    }

    const res = await api.productBacklog.create(requestBody)
    if (payload.sprintId) {
      try { await api.sprints.addBacklogItems(Number(payload.sprintId), { pbiIds: [res.data.pbiId] }) }
      catch { throw new Error(`Đã tạo PBI-${res.data.pbiId}, nhưng chưa thêm được vào Sprint. Vui lòng mở PBI này để thử lại, không tạo bản sao.`) }
    }
    const newPbi = mapBePbiToFe(res.data, new Map())
    cachedPBIs = [newPbi, ...cachedPBIs]
    return newPbi
  },

  async updatePBI(id: string, payload: UpdatePBIPayload): Promise<PBI> {
    if (Object.keys(payload).length === 1 && 'sprintId' in payload) return this.assignToSprint(id, payload.sprintId)
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (Number.isNaN(numericId) || numericId <= 0) {
      throw new Error('ID PBI không hợp lệ.')
    }

    const current = await this.getPBIById(id)
    const epicIdNum = payload.epicId
      ? parseInt(payload.epicId.replace(/\D/g, ''), 10)
      : current?.epicId
        ? parseInt(current.epicId.replace(/\D/g, ''), 10)
        : 0
    if (!epicIdNum) throw new Error('Không xác định được Epic của Backlog. Vui lòng tải lại chi tiết.')

    const requestBody: BacklogRequest = {
      epicId: epicIdNum,
      title: (payload.title ?? current?.title ?? 'PBI').trim(),
      description: payload.description ?? current?.description ?? null,
      storyPoint: payload.storyPoints ?? current?.storyPoints ?? 1,
      priority: priorityToNumber(payload.priority ?? current?.priority),
      status: statusToBe(payload.status ?? current?.status),
    }

    const res = await api.productBacklog.update(numericId, requestBody)
    const updated = mapBePbiToFe(res.data, new Map())
    cachedPBIs = cachedPBIs.map((p) => (p.id === id ? updated : p))
    return updated
  },

  async deletePBI(id: string): Promise<boolean> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (Number.isNaN(numericId) || numericId <= 0) {
      throw new Error('ID PBI không hợp lệ.')
    }

    await api.productBacklog.delete(numericId)
    cachedPBIs = cachedPBIs.filter((p) => p.id !== id)
    return true
  },

  async assignToSprint(pbiId: string, sprintId?: string): Promise<PBI> {
    const numericPbiId = parseInt(pbiId.replace(/\D/g, ''), 10)
    if (sprintId) {
      const numericSprintId = parseInt(sprintId.replace(/\D/g, ''), 10)
      if (numericSprintId > 0 && numericPbiId > 0) {
        await api.sprints.addBacklogItems(numericSprintId, { pbiIds: [numericPbiId] })
      }
    } else {
      const current = cachedPBIs.find((p) => p.id === pbiId)
      if (current?.sprintId) {
        const numericSprintId = parseInt(current.sprintId.replace(/\D/g, ''), 10)
        if (numericSprintId > 0 && numericPbiId > 0) {
          await api.sprints.removeBacklogItem(numericSprintId, numericPbiId)
        }
      }
    }
    return this.updatePBI(pbiId, { sprintId })
  },

  async linkEpic(pbiId: string, epicId?: string): Promise<PBI> {
    const numericPbiId = parseInt(pbiId.replace(/\D/g, ''), 10)
    if (epicId) {
      const numericEpicId = parseInt(epicId.replace(/\D/g, ''), 10)
      if (numericEpicId > 0 && numericPbiId > 0) {
        await api.epics.linkPbi(numericPbiId, { epicId: numericEpicId })
      }
    }
    return this.updatePBI(pbiId, { epicId })
  },

  async linkBatchToEpic(pbiIds: string[], epicId: string): Promise<void> {
    const numericEpicId = parseInt(epicId.replace(/\D/g, ''), 10)
    for (const p of pbiIds) {
      const numericPbiId = parseInt(p.replace(/\D/g, ''), 10)
      if (numericPbiId > 0 && numericEpicId > 0) {
        await api.epics.linkPbi(numericPbiId, { epicId: numericEpicId })
      }
    }
  },

  async toggleLockPBI(id: string): Promise<PBI> {
    const pbi = cachedPBIs.find((p) => p.id === id)
    if (!pbi) throw new Error('Không tìm thấy PBI.')
    return this.updatePBI(id, { isLocked: !pbi.isLocked })
  },

  async reorderPBIs(activeId: string, targetId: string): Promise<PBI[]> {
    const oldIndex = cachedPBIs.findIndex((p) => p.id === activeId)
    const newIndex = cachedPBIs.findIndex((p) => p.id === targetId)
    if (oldIndex === -1 || newIndex === -1) return cachedPBIs

    const [removed] = cachedPBIs.splice(oldIndex, 1)
    cachedPBIs.splice(newIndex, 0, removed)

    // Check if both have same epic, call order API
    if (removed.epicId) {
      const epicIdNum = parseInt(removed.epicId.replace(/\D/g, ''), 10)
      const sameEpicItems = cachedPBIs.filter((p) => p.epicId === removed.epicId)
      const pbiIds = sameEpicItems.map((p) => parseInt(p.id.replace(/\D/g, ''), 10)).filter((id) => id > 0)
      if (epicIdNum > 0 && pbiIds.length > 0) {
        try {
          await api.productBacklog.reorder({ epicId: epicIdNum, pbiIds })
        } catch (e) {
          console.warn('Reorder API sync:', e)
        }
      }
    }

    return [...cachedPBIs]
  },

  async resetToDefault(): Promise<void> {
    cachedPBIs = []
  },
}
