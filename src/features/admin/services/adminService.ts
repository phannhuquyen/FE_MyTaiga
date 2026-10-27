import type {
  AdminUser,
  CreateAdminUserPayload,
  PermissionGroup,
  SystemSettings,
  UserFilterOptions,
} from '../types'
import { api, type AdminUserData } from '@/services/api'
import { authStorage } from '@/lib/tokenStorage'

const INITIAL_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'group-projects',
    name: 'Quản lý Dự án & Kế hoạch',
    iconName: 'folder',
    operations: [
      {
        id: 'op-create-delete-project',
        name: 'Tạo và xóa Dự án',
        description: 'Khởi tạo workspace mới, lưu trữ hoặc xóa toàn bộ thực thể',
        admin: true,
        manager: true,
        member: false,
      },
      {
        id: 'op-configure-sprint',
        name: 'Cấu hình Sprint & Kế hoạch (Planning)',
        description: 'Thiết lập mục tiêu sprint, velocity và gán tác vụ vào sprint mới',
        admin: true,
        manager: true,
        member: false,
      },
      {
        id: 'op-close-reopen-sprint',
        name: 'Đóng / Mở lại Sprint',
        description: 'Kết thúc chu kỳ sprint, chuyển dời backlog dư và tạo báo cáo burndown',
        admin: true,
        manager: true,
        member: false,
      },
    ],
  },
  {
    id: 'group-kanban',
    name: 'Bảng Kanban & Tác vụ',
    iconName: 'kanban',
    badge: '2 thay đổi',
    operations: [
      {
        id: 'op-drag-drop-cards',
        name: 'Kéo thả thẻ & Di chuyển trạng thái',
        description: 'Di chuyển các task card qua các cột To Do, In Progress, Review, Done',
        admin: true,
        manager: true,
        member: true,
      },
      {
        id: 'op-configure-wip',
        name: 'Cấu hình giới hạn WIP (WIP Limit)',
        description: 'Thiết lập ngưỡng số lượng card tối đa cho từng cột trên luồng làm việc',
        badge: 'ScrumBan Core',
        admin: true,
        manager: true,
        member: false,
      },
      {
        id: 'op-create-assign-task',
        name: 'Tạo mới và gán Tác vụ',
        description: 'Tạo task con, gán assignee, định mức story points và đính kèm tài liệu',
        admin: true,
        manager: true,
        member: true,
      },
      {
        id: 'op-delete-task',
        name: 'Xóa Tác vụ',
        description: 'Xóa vĩnh viễn thẻ tác vụ khỏi backlog và sprint đang diễn ra',
        admin: true,
        manager: true,
        member: false,
      },
    ],
  },
  {
    id: 'group-bugs',
    name: 'Báo cáo lỗi (Bug Tracker)',
    iconName: 'bug',
    operations: [
      {
        id: 'op-report-bug',
        name: 'Báo cáo lỗi mới',
        description: 'Gửi bug report kèm log, ảnh chụp màn hình và mức độ nghiêm trọng (Severity)',
        admin: true,
        manager: true,
        member: true,
      },
      {
        id: 'op-close-bug',
        name: 'Đóng lỗi (Close Bug)',
        description: 'Nghiệm thu bản vá lỗi và đóng thẻ lỗi chính thức',
        badge: 'chỉ QA/Manager',
        admin: true,
        manager: true,
        member: false,
      },
    ],
  },
  {
    id: 'group-system',
    name: 'Quản trị Hệ thống',
    iconName: 'shield',
    operations: [
      {
        id: 'op-manage-users',
        name: 'Quản lý Tài khoản & Phân quyền',
        description: 'Thêm, xóa thành viên, khóa tài khoản và thiết lập ma trận vai trò',
        admin: true,
        manager: false,
        member: false,
      },
      {
        id: 'op-configure-system',
        name: 'Cấu hình thông số Hệ thống',
        description: 'Tham số mail SMTP, webhook bảo mật, tích hợp Git và backup định kỳ',
        admin: true,
        manager: false,
        member: false,
      },
    ],
  },
]

const INITIAL_SETTINGS: SystemSettings = {
  dueSoonHours: 24,
  workAgeThresholdDays: 5.0,
  maxFileSizeMb: 25,
  maxAttachmentsPerCard: 10,
  sessionTimeout: '8 giờ làm việc',
  maxLoginAttempts: 5,
  lastUpdated: '14/10/2024',
  policyScope: 'Toàn hệ thống (Global)',
  storageUsedGb: 148.2,
  storageTotalGb: 500,
  agingCardsCount: 3,
}

function mapBeUserToAdminUser(beUser: AdminUserData, currentUserId?: string | null): AdminUser {
  const isSelf = String(beUser.userId) === currentUserId
  const initials = beUser.fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'NV'

  const role = beUser.systemRole === 'ADMIN' ? 'admin' : 'member'
  const roleLabel = beUser.systemRole === 'ADMIN' ? 'Quản trị viên (Admin)' : 'Thành viên (Member)'

  return {
    id: `USR-${String(beUser.userId).padStart(4, '0')}`,
    name: beUser.fullName,
    email: beUser.email,
    role,
    roleLabel,
    status: beUser.status === 1 ? 'active' : 'locked',
    createdAt: new Date(beUser.createdAt).toLocaleDateString('vi-VN'),
    lastLogin: 'Chưa ghi nhận (BE)',
    lastLoginIp: 'N/A',
    projectAccess: beUser.systemRole === 'ADMIN' ? 'Toàn quyền (Tất cả dự án)' : 'Theo phân quyền dự án',
    department: 'Ban Kỹ thuật & Quản trị',
    avatarCode: initials,
    bgColor: beUser.systemRole === 'ADMIN' ? 'bg-emerald-700' : 'bg-neutral-600',
    isSelf,
    isOwner: beUser.systemRole === 'ADMIN',
  }
}

class AdminService {
  private users: AdminUser[] = []
  private isLoading = false
  public isLoaded = false
  private permissionGroups: PermissionGroup[] = JSON.parse(
    JSON.stringify(INITIAL_PERMISSION_GROUPS),
  )
  private settings: SystemSettings = { ...INITIAL_SETTINGS }
  private listeners: Array<() => void> = []

  constructor() {
    this.loadUsers()
    this.loadConfig()
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((l) => l())
  }

  /**
   * Tải danh sách người dùng thật từ Backend
   */
  async loadUsers(): Promise<void> {
    if (this.isLoading) return
    this.isLoading = true
    try {
      const res = await api.admin.listUsers({ page: 1, pageSize: 100 })
      const currentUserId = authStorage.getUserId()
      this.users = res.data.items.map((u) => mapBeUserToAdminUser(u, currentUserId))
      this.isLoaded = true
      this.notify()
    } catch (err) {
      console.warn('⚠️ [AdminService] Lỗi khi tải users từ API thật:', err)
    } finally {
      this.isLoading = false
    }
  }

  /**
   * Tải cấu hình thật từ Backend
   */
  async loadConfig(): Promise<void> {
    try {
      const res = await api.admin.getConfig()
      const values = res.data.values || {}
      if (values.MAX_FILE_SIZE_MB) {
        this.settings.maxFileSizeMb = parseInt(values.MAX_FILE_SIZE_MB, 10) || 25
      }
      this.notify()
    } catch (err) {
      console.warn('⚠️ [AdminService] Lỗi khi tải config từ API thật:', err)
    }
  }

  // ── USER MANAGEMENT ──

  getUsers(filters?: UserFilterOptions): AdminUser[] {
    let list = [...this.users]
    if (!filters) return list

    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase()
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
      )
    }

    if (filters.role && filters.role !== 'all') {
      list = list.filter((u) => u.role === filters.role)
    }

    if (filters.status && filters.status !== 'all') {
      list = list.filter((u) => u.status === filters.status)
    }

    return list
  }

  getUserById(id: string): AdminUser | undefined {
    return this.users.find((u) => u.id === id)
  }

  async createUser(payload: CreateAdminUserPayload): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
    try {
      const res = await api.admin.createUser({
        fullName: payload.name.trim(),
        email: payload.email.trim(),
        password: payload.password || 'User@123456',
        confirmPassword: payload.password || 'User@123456',
      })

      const newUserId = res.data.userId
      const currentUserId = authStorage.getUserId()
      const newUser: AdminUser = {
        id: `USR-${String(newUserId).padStart(4, '0')}`,
        name: payload.name.trim(),
        email: payload.email.trim(),
        role: 'member',
        roleLabel: 'Thành viên (Member)',
        status: payload.activateImmediately ? 'active' : 'locked',
        createdAt: new Date().toLocaleDateString('vi-VN'),
        lastLogin: 'Chưa từng đăng nhập',
        projectAccess: 'Theo phân quyền dự án',
        department: payload.department || 'Kỹ thuật phần mềm (Engineering)',
        avatarCode: payload.name.slice(0, 2).toUpperCase(),
        bgColor: 'bg-emerald-600',
        isSelf: String(newUserId) === currentUserId,
      }

      this.users.unshift(newUser)
      this.notify()
      return { success: true, user: newUser }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      return { success: false, error: errorObj.response?.data?.message || 'Lỗi khi tạo người dùng' }
    }
  }

  /**
   * Khóa tài khoản người dùng qua API thật
   */
  async lockUser(id: string, reason: string, auditNote?: string): Promise<{ success: boolean; error?: string }> {
    const user = this.users.find((u) => u.id === id)
    if (!user) return { success: false, error: 'Không tìm thấy người dùng' }

    if (user.isSelf) {
      return {
        success: false,
        error: 'Không thể khóa tài khoản của chính bạn. Hệ thống yêu cầu tối thiểu một Quản trị viên hoạt động.',
      }
    }

    try {
      const numericId = parseInt(id.replace(/\D/g, ''), 10)
      if (numericId > 0) {
        await api.adminUsers.lockUser(numericId)
      }

      user.status = 'locked'
      user.lockedReason = reason
      user.lockedBy = 'Admin'
      user.auditNote = auditNote
      this.notify()
      return { success: true }
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number; data?: { message?: string } } }
      const beMessage = errorObj.response?.data?.message
      const status = errorObj.response?.status

      if (status === 403) return { success: false, error: 'Không đủ quyền để khóa tài khoản này.' }
      if (status === 409) return { success: false, error: 'Tài khoản đã ở trạng thái bị khóa.' }
      if (status === 404) return { success: false, error: 'Không tìm thấy tài khoản.' }
      return { success: false, error: beMessage ?? 'Lỗi khi khóa tài khoản.' }
    }
  }

  /**
   * Mở khóa tài khoản người dùng qua API thật
   */
  async unlockUser(id: string): Promise<{ success: boolean; error?: string }> {
    const user = this.users.find((u) => u.id === id)
    if (!user) return { success: false, error: 'Không tìm thấy người dùng' }

    try {
      const numericId = parseInt(id.replace(/\D/g, ''), 10)
      if (numericId > 0) {
        await api.adminUsers.unlockUser(numericId)
      }

      user.status = 'active'
      user.lockedReason = undefined
      user.lockedBy = undefined
      user.auditNote = undefined
      this.notify()
      return { success: true }
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number; data?: { message?: string } } }
      const beMessage = errorObj.response?.data?.message
      const status = errorObj.response?.status

      if (status === 403) return { success: false, error: 'Không đủ quyền để mở khóa tài khoản này.' }
      if (status === 409) return { success: false, error: 'Tài khoản đã ở trạng thái hoạt động.' }
      if (status === 404) return { success: false, error: 'Không tìm thấy tài khoản.' }
      return { success: false, error: beMessage ?? 'Lỗi khi mở khóa tài khoản.' }
    }
  }

  /**
   * Đổi vai trò hệ thống người dùng
   */
  async updateUserRole(id: string, role: 'ADMIN' | 'USER'): Promise<{ success: boolean; error?: string }> {
    try {
      const numericId = parseInt(id.replace(/\D/g, ''), 10)
      if (numericId > 0) {
        await api.admin.updateUserRole(numericId, role)
      }

      const user = this.users.find((u) => u.id === id)
      if (user) {
        user.role = role === 'ADMIN' ? 'admin' : 'member'
        user.roleLabel = role === 'ADMIN' ? 'Quản trị viên (Admin)' : 'Thành viên (Member)'
        this.notify()
      }
      return { success: true }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      return { success: false, error: errorObj.response?.data?.message || 'Lỗi khi cập nhật vai trò' }
    }
  }

  // ── PERMISSIONS MATRIX ──

  getPermissionGroups(): PermissionGroup[] {
    return JSON.parse(JSON.stringify(this.permissionGroups))
  }

  savePermissionGroups(groups: PermissionGroup[]) {
    this.permissionGroups = JSON.parse(JSON.stringify(groups))
    this.notify()
  }

  resetPermissionGroups() {
    this.permissionGroups = JSON.parse(JSON.stringify(INITIAL_PERMISSION_GROUPS))
    this.notify()
  }

  // ── SYSTEM SETTINGS ──

  getSettings(): SystemSettings {
    return { ...this.settings }
  }

  async saveSettings(newSettings: Partial<SystemSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      const values: Record<string, string> = {}
      if (newSettings.maxFileSizeMb) values.MAX_FILE_SIZE_MB = String(newSettings.maxFileSizeMb)

      if (Object.keys(values).length > 0) {
        await api.admin.updateConfig(values)
      }

      this.settings = {
        ...this.settings,
        ...newSettings,
        lastUpdated: new Date().toLocaleDateString('vi-VN'),
      }
      this.notify()
      return { success: true }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      return { success: false, error: errorObj.response?.data?.message || 'Lỗi khi lưu cấu hình hệ thống' }
    }
  }

  resetSettings() {
    this.settings = { ...INITIAL_SETTINGS }
    this.notify()
  }
}

export const adminService = new AdminService()
