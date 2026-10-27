export type AdminRole = 'admin' | 'manager' | 'member'
export type AdminUserStatus = 'active' | 'locked'

export interface AdminUser {
  id: string // e.g. "USR-0001"
  name: string
  email: string
  role: AdminRole
  roleLabel: string // e.g. "Quản trị viên (Admin)", "Quản lý (Manager)", "Thành viên (Member)"
  status: AdminUserStatus
  createdAt: string // e.g. "12/01/2024"
  lastLogin: string // e.g. "Vừa xong", "2 giờ trước", "Hôm qua lúc 17:42"
  lastLoginIp?: string // e.g. "IP: 118.69.182.42 (Hà Nội, VN)"
  projectAccess: string // e.g. "Tất cả dự án (6)", "Toàn quyền (6)", "Fintech App, Core API", "0 dự án"
  department?: string // e.g. "Kỹ thuật phần mềm (Engineering)"
  avatarCode: string
  bgColor?: string
  isSelf?: boolean
  isOwner?: boolean
  lockedReason?: string
  lockedBy?: string
  auditNote?: string
}

export interface CreateAdminUserPayload {
  name: string
  email: string
  role: AdminRole
  department?: string
  activateImmediately: boolean
  password?: string
}

export interface PermissionOperation {
  id: string
  name: string
  description: string
  badge?: string // e.g. "ScrumBan Core", "chỉ QA/Manager"
  admin: boolean
  manager: boolean
  member: boolean
}

export interface PermissionGroup {
  id: string
  name: string
  iconName: string
  badge?: string // e.g. "2 thay đổi"
  operations: PermissionOperation[]
}

export interface SystemSettings {
  dueSoonHours: number // 24 giờ
  workAgeThresholdDays: number // 5.0 ngày
  maxFileSizeMb: number // 25 MB
  maxAttachmentsPerCard: number // 10 tệp
  sessionTimeout: string // "8 giờ làm việc"
  maxLoginAttempts: number // 5 lần
  lastUpdated: string // "14/10/2024"
  policyScope: string // "Toàn hệ thống (Global)"
  storageUsedGb: number // 148.2
  storageTotalGb: number // 500
  agingCardsCount: number // 3
}

export interface UserFilterOptions {
  search?: string
  role?: string
  status?: string
}
