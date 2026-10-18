export type MemberRole = 'manager' | 'member' | 'lead' | 'guest'

export interface Department {
  id: string
  code: string
  name: string
  description?: string
  leadId?: string
  leadName?: string
  memberCount: number
  color: string
  sprintLoad?: number
}

export interface MemberTask {
  id: string
  title: string
  status: string
  statusColor?: string
}

export interface MemberSharedFile {
  name: string
  size: string
  time: string
  type: 'spec' | 'report' | 'doc'
}

export interface Member {
  id: string
  employeeCode?: string
  name: string
  avatarCode: string
  bgColor?: string
  email: string
  role: MemberRole
  roleTitle: string
  departmentId: string
  departmentName: string
  joinDate: string
  isOnline?: boolean
  assignedTasks?: MemberTask[]
  sharedFiles?: MemberSharedFile[]
}

export interface Candidate {
  id: string
  employeeCode: string
  name: string
  avatarCode: string
  email: string
  roleTitle: string
  departmentName: string
  isOnline?: boolean
  alreadyInProject?: boolean
  existingDepartment?: string
}

export interface CreateMemberPayload {
  candidateId: string
  departmentId: string
  role: MemberRole
}

export interface TransferDepartmentPayload {
  memberId: string
  newDepartmentId: string
}

export interface CreateDepartmentPayload {
  name: string
  description?: string
  leadId?: string
  color?: string
}

export interface UpdateDepartmentPayload {
  name: string
  description?: string
  leadId?: string
  color?: string
}
