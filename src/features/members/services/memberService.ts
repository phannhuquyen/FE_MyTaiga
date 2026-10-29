import {
  api,
  type DepartmentData,
  type ProjectMemberData,
} from '@/services/api'
import { projectService } from '@/features/projects/services/projectService'
import type {
  Candidate,
  CreateDepartmentPayload,
  CreateMemberPayload,
  Department,
  Member,
  MemberRole,
  TransferDepartmentPayload,
  UpdateDepartmentPayload,
} from '../types'

const PALETTE = ['#076859', '#276749', '#7c3aed', '#d97706', '#2563eb', '#dc2626', '#0891b2']

function getColorForId(id: number): string {
  return PALETTE[id % PALETTE.length]
}

function formatDate(iso?: string | null): string {
  if (!iso) return 'Chưa xác định'
  const parts = iso.split('T')[0].split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return iso
}

function mapBeDepartmentToFe(d: DepartmentData): Department {
  return {
    id: String(d.departmentId),
    code: `DEP-${d.departmentId}`,
    name: d.departmentName,
    description: d.description || '',
    memberCount: d.memberCount,
    color: getColorForId(d.departmentId),
    sprintLoad: 75,
  }
}

function mapBeMemberToFe(m: ProjectMemberData): Member {
  const parts = m.fullName.trim().split(/\s+/)
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : m.fullName.slice(0, 2).toUpperCase()

  const isMgr = m.projectRole === 'MANAGER'

  return {
    id: String(m.userId),
    employeeCode: `EMP-${m.userId}`,
    name: m.fullName,
    avatarCode: initials,
    bgColor: isMgr ? 'bg-primary-800' : 'bg-neutral-700',
    email: m.email,
    role: (isMgr ? 'manager' : 'member') as MemberRole,
    roleTitle: isMgr ? 'Project Manager' : 'Team Member',
    departmentId: m.departmentId ? String(m.departmentId) : 'unassigned',
    departmentName: m.departmentName || 'Chưa phân phòng ban',
    joinDate: formatDate(m.joinedAt),
    isOnline: m.status === 1,
    assignedTasks: [],
    sharedFiles: [],
  }
}

// Fallback in-memory state when no project or offline
let cachedDepartments: Department[] = []
let cachedMembers: Member[] = []

export const memberService = {
  getDepartments: async (): Promise<Department[]> => {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) return cachedDepartments

    try {
      const res = await api.projectDepartments.list(projectId, 1, 100)
      cachedDepartments = res.data.items.map(mapBeDepartmentToFe)
      return cachedDepartments
    } catch (error) {
      console.warn(`⚠️ [MemberService] Lỗi khi lấy danh sách phòng ban dự án ${projectId}:`, error)
      return cachedDepartments
    }
  },

  getMembers: async (filter?: {
    departmentId?: string
    searchQuery?: string
    role?: string
  }): Promise<Member[]> => {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) return cachedMembers

    try {
      const deptId =
        filter?.departmentId && filter.departmentId !== 'all' && filter.departmentId !== 'unassigned'
          ? parseInt(filter.departmentId, 10)
          : undefined

      const res = await api.projectMembers.list(projectId, {
        departmentId: Number.isNaN(deptId) ? undefined : deptId,
        keyword: filter?.searchQuery?.trim() || undefined,
        page: 1,
        pageSize: 100,
      })

      let list = res.data.items.map(mapBeMemberToFe)
      if (filter?.role && filter.role !== 'all') {
        list = list.filter((m) => m.role === filter.role)
      }
      cachedMembers = list
      return list
    } catch (error) {
      console.warn(`⚠️ [MemberService] Lỗi khi lấy danh sách thành viên dự án ${projectId}:`, error)
      let result = [...cachedMembers]
      if (filter?.departmentId && filter.departmentId !== 'all') {
        result = result.filter((m) => m.departmentId === filter.departmentId)
      }
      if (filter?.role && filter.role !== 'all') {
        result = result.filter((m) => m.role === filter.role)
      }
      return result
    }
  },

  getCandidates: async (query?: string): Promise<Candidate[]> => {
    const users = []
    let page = 1
    let total = 0
    do {
      const res = await api.users.search({ keyword: query?.trim() || undefined, page, pageSize: 100 })
      users.push(...res.data.items)
      total = res.data.total
      if (!res.data.items.length) break
      page++
    } while (users.length < total)
    return users.map((user) => {
      const member = cachedMembers.find((m) => m.id === String(user.userId))
      return {
        id: String(user.userId),
        employeeCode: `USER-${user.userId}`,
        name: user.fullName,
        email: user.email,
        avatarCode: user.fullName.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase(),
        roleTitle: 'Chưa có thông tin chức danh',
        departmentName: member?.departmentName || 'Chưa có thông tin phòng ban',
        alreadyInProject: Boolean(member),
        existingDepartment: member?.departmentName,
      }
    })
  },

  addMember: async (payload: CreateMemberPayload): Promise<Member> => {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) throw new Error('Vui lòng chọn dự án trước khi thêm thành viên.')

    const numericUserId = /^\d+$/.test(payload.candidateId) ? Number(payload.candidateId) : NaN
    if (!Number.isSafeInteger(numericUserId) || numericUserId <= 0) {
      throw new Error('Ứng viên đang là dữ liệu mẫu, chưa có User ID thật để thêm vào dự án.')
    }

    // 1. Add to project
    await api.projectMembers.add(projectId, { userId: numericUserId })

    // 2. If department specified, assign department
    const numericDeptId = parseInt(payload.departmentId, 10)
    if (!Number.isNaN(numericDeptId) && numericDeptId > 0) {
      await api.projectDepartments.assignMember(projectId, numericUserId, { departmentId: numericDeptId })
    }

    // 3. If role is manager, promote
    if (payload.role === 'manager') {
      await api.projectMembers.promote(projectId, numericUserId, { role: 'MANAGER' })
    }

    const memberList = await memberService.getMembers()
    const found = memberList.find((m) => m.id === String(numericUserId))
    if (found) return found

    return {
      id: String(numericUserId),
      name: `Thành viên ID ${numericUserId}`,
      avatarCode: 'TM',
      email: `user${numericUserId}@scrumban.io`,
      role: payload.role,
      roleTitle: payload.role === 'manager' ? 'Project Manager' : 'Team Member',
      departmentId: payload.departmentId,
      departmentName: 'Phòng ban',
      joinDate: new Date().toLocaleDateString('vi-VN'),
    }
  },

  removeMember: async (
    memberId: string,
    reassignToLead = true,
  ): Promise<{ success: boolean; removedName: string; reallocatedCount: number }> => {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) throw new Error('Chưa chọn dự án.')

    const numericUserId = parseInt(memberId, 10)
    if (Number.isNaN(numericUserId)) throw new Error('ID thành viên không hợp lệ.')

    const member = cachedMembers.find((m) => m.id === memberId)
    await api.projectMembers.remove(projectId, numericUserId)
    cachedMembers = cachedMembers.filter((m) => m.id !== memberId)

    return {
      success: true,
      removedName: member?.name || `ID ${memberId}`,
      reallocatedCount: reassignToLead ? (member?.assignedTasks?.length ?? 0) : 0,
    }
  },

  transferDepartment: async (payload: TransferDepartmentPayload): Promise<Member> => {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) throw new Error('Chưa chọn dự án.')

    const numericUserId = parseInt(payload.memberId, 10)
    const numericDeptId = payload.newDepartmentId === 'unassigned' ? null : parseInt(payload.newDepartmentId, 10)

    await api.projectDepartments.assignMember(projectId, numericUserId, { departmentId: numericDeptId })

    const list = await memberService.getMembers()
    const updated = list.find((m) => m.id === payload.memberId)
    if (updated) return updated

    throw new Error('Chuyển phòng ban thành công nhưng không tìm thấy dữ liệu cập nhật.')
  },

  promoteMember: async (memberId: string): Promise<Member> => {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) throw new Error('Chưa chọn dự án.')

    const numericUserId = parseInt(memberId, 10)
    await api.projectMembers.promote(projectId, numericUserId, { role: 'MANAGER' })

    const list = await memberService.getMembers()
    const updated = list.find((m) => m.id === memberId)
    if (updated) return updated

    throw new Error('Nâng quyền Manager thành công.')
  },

  addDepartment: async (payload: CreateDepartmentPayload): Promise<Department> => {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) throw new Error('Chưa chọn dự án.')

    const res = await api.projectDepartments.create(projectId, {
      departmentName: payload.name.trim(),
      description: payload.description?.trim() || null,
    })

    const newDept: Department = {
      id: String(res.data.departmentId),
      code: `DEP-${res.data.departmentId}`,
      name: res.data.departmentName,
      description: res.data.description || '',
      memberCount: 0,
      color: getColorForId(res.data.departmentId),
      sprintLoad: 0,
    }
    cachedDepartments = [...cachedDepartments, newDept]
    return newDept
  },

  updateDepartment: async (id: string, payload: UpdateDepartmentPayload): Promise<Department> => {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) throw new Error('Chưa chọn dự án.')

    const numericDeptId = parseInt(id, 10)
    const res = await api.projectDepartments.update(projectId, numericDeptId, {
      departmentName: payload.name.trim(),
      description: payload.description?.trim() || null,
    })

    const updated: Department = {
      id: String(res.data.departmentId),
      code: `DEP-${res.data.departmentId}`,
      name: res.data.departmentName,
      description: res.data.description || '',
      memberCount: 0,
      color: getColorForId(res.data.departmentId),
      sprintLoad: 0,
    }
    cachedDepartments = cachedDepartments.map((d) => (d.id === id ? updated : d))
    return updated
  },

  deleteDepartment: async (
    id: string,
  ): Promise<{ success: boolean; affectedCount: number; deptName: string }> => {
    const projectId = projectService.getActiveProjectId()
    if (!projectId) throw new Error('Chưa chọn dự án.')

    const numericDeptId = parseInt(id, 10)
    const target = cachedDepartments.find((d) => d.id === id)
    await api.projectDepartments.delete(projectId, numericDeptId)
    cachedDepartments = cachedDepartments.filter((d) => d.id !== id)

    return {
      success: true,
      affectedCount: 0,
      deptName: target?.name || `ID ${id}`,
    }
  },

  resetToDefault: () => {
    cachedDepartments = []
    cachedMembers = []
  },
}
