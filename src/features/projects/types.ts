export type ProjectMethodology = 'scrumban' | 'kanban'
export type ProjectStatus = 'active' | 'closed'

export interface ProjectMember {
  name: string
  avatarCode: string
  bgColor?: string
}

export interface Project {
  id: string
  key: string
  code: string
  name: string
  description: string
  versionTag?: string
  badgeTag?: string
  startDate: string
  endDate: string
  methodology: ProjectMethodology
  leadName: string
  leadAvatar: string
  members: ProjectMember[]
  totalMembersCount: number
  status: ProjectStatus
  statusText: string
  colorClass: string
  createdAt: string
}

export interface CreateProjectPayload {
  name: string
  key: string
  description?: string
  startDate: string
  endDate: string
  methodology: ProjectMethodology
}

export interface UpdateProjectPayload {
  name: string
  description?: string
  startDate: string
  endDate: string
  leadName?: string
  status: ProjectStatus
}
