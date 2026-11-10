import { api, type ProjectData, type ProjectRequest } from '@/services/api'
import { allPages } from '@/lib/allPages'
import type {
  CreateProjectPayload,
  Project,
  ProjectStatus,
  UpdateProjectPayload,
} from '../types'

const ACTIVE_PROJECT_KEY = 'mytaiga_active_project_id'

function toIsoDate(d?: string | null): string | null {
  if (!d) return null
  const trimmed = d.trim()
  if (!trimmed) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const ddmmyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0')
    const month = ddmmyyyy[2].padStart(2, '0')
    const year = ddmmyyyy[3]
    return `${year}-${month}-${day}`
  }
  return null
}

function formatDate(isoDate?: string | null): string {
  if (!isoDate) return 'Chưa xác định'
  const parts = isoDate.split('T')[0].split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return isoDate
}

function mapBeProjectToFe(data: ProjectData): Project {
  const words = data.projectName.trim().split(/\s+/)
  const key =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : data.projectName.slice(0, 2).toUpperCase() || 'PR'

  const isActive = data.status === 'ACTIVE'

  return {
    id: String(data.projectId),
    key,
    code: `PRJ-${data.projectId}`,
    name: data.projectName,
    description: data.description || 'Chưa có mô tả dự án.',
    startDate: formatDate(data.startDate),
    endDate: formatDate(data.endDate),
    methodology: 'scrumban',
    leadName: 'Chưa tải được quản lý dự án',
    leadAvatar: '—',
    members: [],
    totalMembersCount: null,
    status: (isActive ? 'active' : 'closed') as ProjectStatus,
    statusText: isActive ? 'Đang thực hiện' : 'Đã đóng',
    colorClass: isActive ? 'bg-primary-50 text-primary-700' : 'bg-neutral-100 text-neutral-600',
    createdAt: data.createdAt,
  }
}

class ProjectService {
  private cachedProjects: Project[] = []

  private async withMembers(project: Project): Promise<Project> {
    try {
      const members = await allPages(page => api.projectMembers.list(Number(project.id), { page, pageSize: 100 }))
      const initials = (name: string) => name.trim().split(/\s+/).slice(-2).map(part => part[0]).join('').toUpperCase()
      const managers = members.filter(member => member.projectRole === 'MANAGER')
      return {
        ...project,
        members: members.map(member => ({ id: member.userId, name: member.fullName, avatarCode: initials(member.fullName), avatarUrl: member.avatar })),
        totalMembersCount: members.length,
        leadName: managers.map(member => member.fullName).join(', ') || 'Chưa có quản lý',
        leadAvatar: managers[0] ? initials(managers[0].fullName) : '—',
      }
    } catch {
      return project
    }
  }

  getActiveProjectId(): number | null {
    const stored = localStorage.getItem(ACTIVE_PROJECT_KEY)
    if (stored) {
      const parsed = parseInt(stored, 10)
      if (!Number.isNaN(parsed) && parsed > 0) return parsed
    }
    if (this.cachedProjects.length > 0) {
      const firstId = parseInt(this.cachedProjects[0].id, 10)
      if (!Number.isNaN(firstId)) return firstId
    }
    return null
  }

  setActiveProjectId(id: number | string): void {
    localStorage.setItem(ACTIVE_PROJECT_KEY, String(id))
  }

  async getProjects(status?: ProjectStatus, search?: string): Promise<Project[]> {
    try {
      const beStatus = status ? (status.toUpperCase() as 'ACTIVE' | 'CLOSED') : undefined
      const rows = await allPages(page => api.projects.list({
        status: beStatus,
        keyword: search?.trim() || undefined,
        page,
        pageSize: 100,
      }))

      const list = await Promise.all(rows.map(item => this.withMembers(mapBeProjectToFe(item))))
      this.cachedProjects = list
      if (list.length > 0 && !localStorage.getItem(ACTIVE_PROJECT_KEY)) {
        localStorage.setItem(ACTIVE_PROJECT_KEY, list[0].id)
      }
      return list
    } catch (error) {
      console.warn('⚠️ [ProjectService] Lỗi khi gọi API danh sách dự án, sử dụng cache:', error)
      let result = [...this.cachedProjects]
      if (status) result = result.filter((p) => p.status === status)
      if (search && search.trim()) {
        const q = search.trim().toLowerCase()
        result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      }
      return result
    }
  }

  async getProjectById(id: string | number): Promise<Project | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id
    if (Number.isNaN(numericId) || numericId <= 0) return null

    try {
      const res = await api.projects.get(numericId)
      return this.withMembers(mapBeProjectToFe(res.data))
    } catch (error) {
      console.warn(`⚠️ [ProjectService] Lỗi khi lấy chi tiết dự án ID ${numericId}:`, error)
      return this.cachedProjects.find((p) => p.id === String(id)) ?? null
    }
  }

  async getProjectCounts(): Promise<{ activeCount: number; closedCount: number; totalMembers: number | null }> {
    try {
      const [activeRes, closedRes] = await Promise.all([
        api.projects.list({ status: 'ACTIVE', page: 1, pageSize: 1 }),
        api.projects.list({ status: 'CLOSED', page: 1, pageSize: 1 }),
      ])
      const projects = await allPages(page => api.projects.list({ page, pageSize: 100 }))
      const memberships = await Promise.allSettled(projects.map(project => allPages(page => api.projectMembers.list(project.projectId, { page, pageSize: 100 }))))
      const complete = memberships.every(result => result.status === 'fulfilled')
      const ids = new Set(memberships.flatMap(result => result.status === 'fulfilled' ? result.value.map(member => member.userId) : []))
      return {
        activeCount: activeRes.data.total,
        closedCount: closedRes.data.total,
        totalMembers: complete ? ids.size : null,
      }
    } catch {
      const active = this.cachedProjects.filter((p) => p.status === 'active')
      const closed = this.cachedProjects.filter((p) => p.status === 'closed')
      return {
        activeCount: active.length,
        closedCount: closed.length,
        totalMembers: null,
      }
    }
  }

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    const name = payload.name.trim()
    if (!name) {
      throw new Error('Tên dự án không được để trống.')
    }

    const requestBody: ProjectRequest = {
      projectName: name,
      description: payload.description?.trim() || null,
      startDate: toIsoDate(payload.startDate),
      endDate: toIsoDate(payload.endDate),
    }

    const res = await api.projects.create(requestBody)
    const newProject = mapBeProjectToFe(res.data)
    this.cachedProjects = [newProject, ...this.cachedProjects]
    this.setActiveProjectId(newProject.id)
    return newProject
  }

  async updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const name = payload.name.trim()
    if (!name) {
      throw new Error('Tên dự án không được để trống.')
    }

    const numericId = parseInt(id, 10)
    if (Number.isNaN(numericId) || numericId <= 0) {
      throw new Error('ID dự án không hợp lệ.')
    }

    const requestBody: ProjectRequest = {
      projectName: name,
      description: payload.description?.trim() || null,
      startDate: toIsoDate(payload.startDate),
      endDate: toIsoDate(payload.endDate),
    }

    const res = await api.projects.update(numericId, requestBody)
    const updated = mapBeProjectToFe(res.data)

    const index = this.cachedProjects.findIndex((p) => p.id === id)
    if (index !== -1) {
      this.cachedProjects[index] = updated
    }
    return updated
  }

  async toggleProjectStatus(id: string): Promise<Project> {
    const numericId = parseInt(id, 10)
    if (Number.isNaN(numericId) || numericId <= 0) {
      throw new Error('ID dự án không hợp lệ.')
    }

    const current = this.cachedProjects.find((p) => p.id === id)
    if (current && current.status === 'active') {
      const res = await api.projects.close(numericId)
      const closed = mapBeProjectToFe(res.data)
      const index = this.cachedProjects.findIndex((p) => p.id === id)
      if (index !== -1) this.cachedProjects[index] = closed
      return closed
    }

    throw new Error('Backend chưa hỗ trợ mở lại dự án đã đóng.')
  }

  async deleteProject(id: string): Promise<void> {
    const numericId = parseInt(id, 10)
    if (Number.isNaN(numericId) || numericId <= 0) {
      throw new Error('ID dự án không hợp lệ.')
    }

    await api.projects.delete(numericId)
    this.cachedProjects = this.cachedProjects.filter((p) => p.id !== id)
  }
}

export const projectService = new ProjectService()
