import {
  api,
  type SprintData,
  type SprintRequest,
} from '@/services/api'
import { projectService } from '@/features/projects/services/projectService'
import type {
  Sprint,
  CreateSprintPayload,
  UpdateSprintPayload,
  CloseSprintPayload,
  SprintWorkItem,
  SprintStatus,
  BurndownDataPoint,
} from '../types'

function toIsoDate(d?: string | null): string {
  if (!d) {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  const trimmed = d.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const ddmmyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0')
    const month = ddmmyyyy[2].padStart(2, '0')
    const year = ddmmyyyy[3]
    return `${year}-${month}-${day}`
  }
  return trimmed
}

function formatDate(iso?: string | null): string {
  if (!iso) return 'Chưa xác định'
  const parts = iso.split('T')[0].split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return iso
}

function mapStatusToFe(status: string): SprintStatus {
  switch (status) {
    case 'ACTIVE': return 'active'
    case 'PLANNED': return 'planned'
    case 'CLOSED': return 'closed'
    default: return 'draft'
  }
}

function mapBeSprintToFe(data: SprintData): Sprint {
  const feStatus = mapStatusToFe(data.status)
  return {
    id: String(data.sprintId),
    code: `SPR-${data.sprintId}`,
    name: data.sprintName,
    goal: data.sprintGoal || '',
    status: feStatus,
    startDate: formatDate(data.startDate),
    endDate: formatDate(data.endDate),
    daysLeft: feStatus === 'active' ? 'Đang chạy' : feStatus === 'closed' ? 'Đã đóng' : 'Kế hoạch',
    totalSP: 0,
    completedSP: 0,
    capacitySP: 25,
    totalItemsCount: 0,
    completedItemsCount: 0,
    remainingItemsCount: 0,
    progressPercent: 0,
    membersCount: 0,
    items: [],
  }
}

let cachedSprints: Sprint[] = []

export const sprintService = {
  async getSprints(filters?: {
    search?: string
    status?: string
  }): Promise<Sprint[]> {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) return cachedSprints

    try {
      const beStatus =
        filters?.status && filters.status !== 'all'
          ? (filters.status === 'draft' ? 'PLANNED' : filters.status.toUpperCase() as 'PLANNED' | 'ACTIVE' | 'CLOSED')
          : undefined

      const res = await api.sprints.list({
        projectId,
        status: beStatus,
        page: 1,
        pageSize: 100,
      })

      const list = res.data.items.map(mapBeSprintToFe)

      // Fetch progress for each sprint
      await Promise.all(
        list.map(async (sprint) => {
          try {
            const prog = await api.sprints.progress(parseInt(sprint.id, 10))
            sprint.totalSP = prog.data.totalStoryPoints
            sprint.completedSP = prog.data.completedStoryPoints
            sprint.remainingItemsCount = Math.max(0, prog.data.totalPbis - prog.data.completedPbis)
            sprint.totalItemsCount = prog.data.totalPbis
            sprint.completedItemsCount = prog.data.completedPbis
            sprint.progressPercent = Math.round(prog.data.progressPercent)
            sprint.items = prog.data.items.map((it) => ({
              id: String(it.pbiId),
              code: `#SB-${it.pbiId}`,
              title: it.title,
              storyPoints: it.storyPoint,
              status: it.status === 'DONE' ? 'done' : 'in_progress',
            }))
          } catch {
            // ignore progress error
          }
        }),
      )

      cachedSprints = list
      return list
    } catch (error) {
      console.warn(`⚠️ [SprintService] Lỗi khi lấy danh sách Sprint dự án ${projectId}:`, error)
      return cachedSprints
    }
  },

  async getSprintById(id: string): Promise<Sprint | undefined> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (numericId > 0) {
      try {
        const res = await api.sprints.get(numericId)
        const mapped = mapBeSprintToFe(res.data)
        try {
          const prog = await api.sprints.progress(numericId)
          mapped.totalSP = prog.data.totalStoryPoints
          mapped.completedSP = prog.data.completedStoryPoints
          mapped.progressPercent = Math.round(prog.data.progressPercent)
          mapped.items = prog.data.items.map((it) => ({
            id: String(it.pbiId),
            code: `#SB-${it.pbiId}`,
            title: it.title,
            storyPoints: it.storyPoint,
            status: it.status === 'DONE' ? 'done' : 'in_progress',
          }))
        } catch {
          // ignore
        }
        return mapped
      } catch {
        // fallback
      }
    }
    return cachedSprints.find((s) => s.id === id)
  },

  async getActiveSprint(): Promise<Sprint | null> {
    const sprints = await this.getSprints()
    return sprints.find((s) => s.status === 'active') || null
  },

  async createSprint(payload: CreateSprintPayload): Promise<Sprint> {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) throw new Error('Vui lòng chọn dự án trước khi tạo Sprint.')

    if (!payload.name || payload.name.trim().length < 2) {
      throw new Error('Tên Sprint phải chứa ít nhất 2 ký tự.')
    }

    const requestBody: SprintRequest = {
      projectId,
      sprintName: payload.name.trim(),
      sprintGoal: payload.goal?.trim() || null,
      startDate: toIsoDate(payload.startDate),
      endDate: toIsoDate(payload.endDate),
    }

    const res = await api.sprints.create(requestBody)
    const newSprint = mapBeSprintToFe(res.data)
    cachedSprints = [newSprint, ...cachedSprints]
    return newSprint
  },

  async updateSprint(id: string, payload: UpdateSprintPayload): Promise<Sprint> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (Number.isNaN(numericId) || numericId <= 0) {
      throw new Error('ID Sprint không hợp lệ.')
    }

    const current = await this.getSprintById(id)
    const projectId = projectService.getActiveProjectId()
    if (!projectId || !current) throw new Error('Không xác định được Sprint/dự án. Vui lòng tải lại.')

    const requestBody: SprintRequest = {
      projectId,
      sprintName: (payload.name ?? current?.name ?? 'Sprint').trim(),
      sprintGoal: payload.goal ?? current?.goal ?? null,
      startDate: toIsoDate(payload.startDate ?? current?.startDate),
      endDate: toIsoDate(payload.endDate ?? current?.endDate),
    }

    const res = await api.sprints.update(numericId, requestBody)
    const updated = mapBeSprintToFe(res.data)
    cachedSprints = cachedSprints.map((s) => (s.id === id ? updated : s))
    return updated
  },

  async startSprint(id: string): Promise<Sprint> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (Number.isNaN(numericId) || numericId <= 0) {
      throw new Error('ID Sprint không hợp lệ.')
    }

    const res = await api.sprints.start(numericId)
    const updated = mapBeSprintToFe(res.data)
    cachedSprints = cachedSprints.map((s) => (s.id === id ? updated : s))
    return updated
  },

  async closeSprint(id: string, _payload?: CloseSprintPayload): Promise<Sprint> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (Number.isNaN(numericId) || numericId <= 0) {
      throw new Error('ID Sprint không hợp lệ.')
    }

    const res = await api.sprints.close(numericId)
    const updated = mapBeSprintToFe(res.data)
    cachedSprints = cachedSprints.map((s) => (s.id === id ? updated : s))
    return updated
  },

  async deleteSprint(id: string): Promise<boolean> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (Number.isNaN(numericId) || numericId <= 0) {
      throw new Error('ID Sprint không hợp lệ.')
    }

    await api.sprints.delete(numericId)
    cachedSprints = cachedSprints.filter((s) => s.id !== id)
    return true
  },

  async addWorkItem(
    sprintId: string,
    item: { pbiId?: number | string; title?: string; storyPoints?: number },
  ): Promise<SprintWorkItem> {
    const numericSprintId = parseInt(sprintId.replace(/\D/g, ''), 10)
    const numericPbiId = item.pbiId ? parseInt(String(item.pbiId).replace(/\D/g, ''), 10) : 0

    if (numericSprintId > 0 && numericPbiId > 0) {
      await api.sprints.addBacklogItems(numericSprintId, { pbiIds: [numericPbiId] })
    }

    return {
      id: String(numericPbiId || Date.now()),
      code: `#SB-${numericPbiId || 'NEW'}`,
      title: item.title || 'Công việc mới',
      storyPoints: item.storyPoints || 3,
      status: 'in_progress',
    }
  },

  async addWorkItemToSprint(
    sprintId: string,
    item: { title: string; storyPoints: number; priority?: string },
  ): Promise<SprintWorkItem> {
    return this.addWorkItem(sprintId, item)
  },

  async toggleWorkItemStatus(
    _sprintId: string,
    _itemId: string,
  ): Promise<void> {
    console.log('Toggle work item status in Sprint (Kanban card movements pending BE UC13-UC17)')
  },

  async assignBacklogItemsToSprint(
    sprintId: string,
    pbiIds: string[],
  ): Promise<void> {
    const numericSprintId = parseInt(sprintId.replace(/\D/g, ''), 10)
    const numericIds = pbiIds
      .map((id) => parseInt(id.replace(/\D/g, ''), 10))
      .filter((id) => id > 0)

    if (numericSprintId > 0 && numericIds.length > 0) {
      await api.sprints.addBacklogItems(numericSprintId, { pbiIds: numericIds })
    }
  },

  async removeItemFromSprint(sprintId: string, itemId: string): Promise<void> {
    await this.removeWorkItem(sprintId, itemId)
  },

  async removeWorkItem(sprintId: string, itemId: string): Promise<void> {
    const numericSprintId = parseInt(sprintId.replace(/\D/g, ''), 10)
    const numericPbiId = parseInt(itemId.replace(/\D/g, ''), 10)
    if (numericSprintId > 0 && numericPbiId > 0) {
      await api.sprints.removeBacklogItem(numericSprintId, numericPbiId)
    }
  },

  async updateItemStatus(
    _sprintId: string,
    _itemId: string,
    _newStatus: SprintWorkItem['status'],
  ): Promise<void> {
    console.log('Update item status in Sprint (Kanban card movements pending BE UC13-UC17)')
  },

  async getBurndownData(sprintId: string): Promise<BurndownDataPoint[]> {
    const numericSprintId = parseInt(sprintId.replace(/\D/g, ''), 10)
    if (numericSprintId > 0) {
      try {
        const res = await api.sprints.burndown(numericSprintId)
        return res.data.points.map((p, idx) => ({
          dayLabel: `Ngày ${idx + 1} (${p.date})`,
          dateStr: p.date,
          idealRemaining: p.idealRemaining,
          actualRemaining: p.actualRemaining ?? undefined,
          isToday: p.actualRemaining !== null,
        }))
      } catch (err) {
        console.warn('Burndown fetch error:', err)
      }
    }
    return []
  },
}
