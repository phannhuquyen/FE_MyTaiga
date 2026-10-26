import type {
  AdminUser,
  CreateAdminUserPayload,
  PermissionGroup,
  SystemSettings,
  UserFilterOptions,
} from '../types'
import { api } from '@/services/api'

const INITIAL_USERS: AdminUser[] = [
  {
    id: 'USR-0001',
    name: 'Nguyễn Quốc Bảo',
    email: 'quocbao.admin@scrumban.io',
    role: 'admin',
    roleLabel: 'Quản trị viên (Admin)',
    status: 'active',
    createdAt: '12/01/2024',
    lastLogin: 'Vừa xong',
    lastLoginIp: 'IP: 118.69.182.42 (Hà Nội, VN)',
    projectAccess: 'Tất cả dự án (6)',
    department: 'Kỹ thuật phần mềm (Engineering)',
    avatarCode: 'QB',
    bgColor: 'bg-emerald-700',
    isSelf: true,
    isOwner: true,
  },
  {
    id: 'USR-0002',
    name: 'Trần Thanh Trúc',
    email: 'truc.tran@scrumban.io',
    role: 'admin',
    roleLabel: 'Quản trị viên (Admin)',
    status: 'active',
    createdAt: '15/02/2024',
    lastLogin: '2 giờ trước',
    lastLoginIp: 'Chrome on macOS',
    projectAccess: 'Toàn quyền (6)',
    department: 'Ban Quản trị (Core)',
    avatarCode: 'TT',
    bgColor: 'bg-rose-600',
  },
  {
    id: 'USR-0003',
    name: 'Lê Hoàng Nam',
    email: 'hoangnam.le@scrumban.io',
    role: 'manager',
    roleLabel: 'Quản lý (Manager)',
    status: 'active',
    createdAt: '20/03/2024',
    lastLogin: 'Hôm qua lúc 17:42',
    lastLoginIp: 'Windows App',
    projectAccess: 'Fintech App, Core API',
    department: 'Kỹ thuật phần mềm (Engineering)',
    avatarCode: 'LH',
    bgColor: 'bg-teal-600',
  },
  {
    id: 'USR-0004',
    name: 'Phạm Phương Anh',
    email: 'phuonganh.dev@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '05/05/2024',
    lastLogin: '3 ngày trước',
    lastLoginIp: 'Web Browser',
    projectAccess: 'Design System UI',
    department: 'Thiết kế sản phẩm (Design)',
    avatarCode: 'PA',
    bgColor: 'bg-amber-600',
  },
  {
    id: 'USR-88219-VN',
    name: 'Vũ Đức Duy',
    email: 'duy.vu@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'locked',
    createdAt: '24/11/2024',
    lastLogin: '24/11/2024',
    projectAccess: '0 dự án',
    department: 'Đảm bảo chất lượng (QA)',
    avatarCode: 'VD',
    bgColor: 'bg-neutral-500',
    lockedReason: 'Xác thực OTP sai quá 5 lần',
    lockedBy: 'Admin',
    auditNote: 'Payment Gateway (Sprint 24)',
  },
  {
    id: 'USR-0006',
    name: 'Trần Minh Quân',
    email: 'minhquan.pm@scrumban.io',
    role: 'manager',
    roleLabel: 'Quản lý (Manager)',
    status: 'active',
    createdAt: '15/02/2024',
    lastLogin: 'Hôm nay 09:15',
    projectAccess: 'ScrumBan Core, FinTech API',
    department: 'Quản lý dự án (PMO)',
    avatarCode: 'MQ',
    bgColor: 'bg-blue-600',
  },
  {
    id: 'USR-0007',
    name: 'Lê Thùy Trang',
    email: 'thuytrang.fe@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '20/03/2024',
    lastLogin: 'Hôm nay 10:30',
    projectAccess: 'ScrumBan Core',
    department: 'Kỹ thuật phần mềm (Engineering)',
    avatarCode: 'TT',
    bgColor: 'bg-purple-600',
  },
  {
    id: 'USR-0008',
    name: 'Phạm Hoàng Long',
    email: 'hoanglong.dev@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '05/05/2024',
    lastLogin: 'Hôm qua 18:20',
    projectAccess: 'ScrumBan Core, Payment Hub',
    department: 'Kỹ thuật phần mềm (Engineering)',
    avatarCode: 'HL',
    bgColor: 'bg-indigo-600',
  },
  {
    id: 'USR-0009',
    name: 'Vũ Đức Trọng',
    email: 'ductrong.qa@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '18/08/2024',
    lastLogin: '3 ngày trước',
    projectAccess: 'ScrumBan Core',
    department: 'Đảm bảo chất lượng (QA)',
    avatarCode: 'DT',
    bgColor: 'bg-emerald-600',
  },
  {
    id: 'USR-0010',
    name: 'Đặng Tuấn Kiệt',
    email: 'tuankiet.devops@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '10/06/2024',
    lastLogin: 'Hôm qua 14:10',
    projectAccess: 'Toàn bộ hạ tầng CI/CD',
    department: 'Hạ tầng & Vận hành (DevOps)',
    avatarCode: 'TK',
    bgColor: 'bg-cyan-600',
  },
  {
    id: 'USR-0011',
    name: 'Ngô Thùy Dung',
    email: 'thuydung.ba@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '12/07/2024',
    lastLogin: '1 ngày trước',
    projectAccess: 'ScrumBan Core',
    department: 'Phân tích nghiệp vụ (BA)',
    avatarCode: 'TD',
    bgColor: 'bg-rose-500',
  },
  {
    id: 'USR-0012',
    name: 'Bùi Đức Anh',
    email: 'ducanh.sec@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '01/08/2024',
    lastLogin: '4 ngày trước',
    projectAccess: 'Security Compliance',
    department: 'An ninh thông tin (Security)',
    avatarCode: 'DA',
    bgColor: 'bg-amber-700',
  },
  {
    id: 'USR-0013',
    name: 'Hoàng Minh Châu',
    email: 'minhchau.ui@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '15/08/2024',
    lastLogin: 'Hôm nay 08:45',
    projectAccess: 'Design System UI',
    department: 'Thiết kế sản phẩm (Design)',
    avatarCode: 'MC',
    bgColor: 'bg-pink-600',
  },
  {
    id: 'USR-0014',
    name: 'Phan Đình Giáp',
    email: 'dinhgiap.be@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '22/08/2024',
    lastLogin: '5 ngày trước',
    projectAccess: 'Core API Service',
    department: 'Kỹ thuật phần mềm (Engineering)',
    avatarCode: 'DG',
    bgColor: 'bg-violet-600',
  },
  {
    id: 'USR-0015',
    name: 'Võ Mai Lan',
    email: 'mailan.qa@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '05/09/2024',
    lastLogin: 'Hôm qua 16:30',
    projectAccess: 'Automation Testing',
    department: 'Đảm bảo chất lượng (QA)',
    avatarCode: 'ML',
    bgColor: 'bg-emerald-500',
  },
  {
    id: 'USR-0016',
    name: 'Dương Gia Huy',
    email: 'giahuy.dev@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '12/09/2024',
    lastLogin: '6 ngày trước',
    projectAccess: 'Mobile React Native',
    department: 'Kỹ thuật phần mềm (Engineering)',
    avatarCode: 'GH',
    bgColor: 'bg-sky-600',
  },
  {
    id: 'USR-0017',
    name: 'Tạ Quang Khải',
    email: 'quangkhai.pm@scrumban.io',
    role: 'manager',
    roleLabel: 'Quản lý (Manager)',
    status: 'active',
    createdAt: '18/09/2024',
    lastLogin: '2 ngày trước',
    projectAccess: 'Payment Gateway',
    department: 'Quản lý dự án (PMO)',
    avatarCode: 'QK',
    bgColor: 'bg-blue-700',
  },
  {
    id: 'USR-0018',
    name: 'Lâm Khánh Linh',
    email: 'khanhlinh.hr@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '25/09/2024',
    lastLogin: '1 tuần trước',
    projectAccess: 'Internal Portal',
    department: 'Nhân sự (HR)',
    avatarCode: 'KL',
    bgColor: 'bg-fuchsia-600',
  },
  {
    id: 'USR-0019',
    name: 'Đoàn Nhật Minh',
    email: 'nhatminh.fe@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '01/10/2024',
    lastLogin: 'Hôm nay 11:20',
    projectAccess: 'ScrumBan Core',
    department: 'Kỹ thuật phần mềm (Engineering)',
    avatarCode: 'NM',
    bgColor: 'bg-lime-700',
  },
  {
    id: 'USR-0020',
    name: 'Trịnh Phương Thảo',
    email: 'phuongthao.ba@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '05/10/2024',
    lastLogin: '3 ngày trước',
    projectAccess: 'Fintech API',
    department: 'Phân tích nghiệp vụ (BA)',
    avatarCode: 'PT',
    bgColor: 'bg-orange-600',
  },
  {
    id: 'USR-0021',
    name: 'Cao Hoàng Quân',
    email: 'hoangquan.devops@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '08/10/2024',
    lastLogin: 'Hôm qua 19:00',
    projectAccess: 'Kubernetes Clusters',
    department: 'Hạ tầng & Vận hành (DevOps)',
    avatarCode: 'HQ',
    bgColor: 'bg-slate-600',
  },
  {
    id: 'USR-0022',
    name: 'Nguyễn Thị Bích',
    email: 'bich.nguyen@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '10/10/2024',
    lastLogin: '4 ngày trước',
    projectAccess: 'Payment Hub',
    department: 'Đảm bảo chất lượng (QA)',
    avatarCode: 'NB',
    bgColor: 'bg-teal-700',
  },
  {
    id: 'USR-0023',
    name: 'Lý Kiến Quốc',
    email: 'kienquoc.dev@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '12/10/2024',
    lastLogin: 'Hôm nay 08:15',
    projectAccess: 'ScrumBan Core',
    department: 'Kỹ thuật phần mềm (Engineering)',
    avatarCode: 'KQ',
    bgColor: 'bg-cyan-700',
  },
  {
    id: 'USR-0024',
    name: 'Trần Cẩm Tú',
    email: 'camtu.design@scrumban.io',
    role: 'member',
    roleLabel: 'Thành viên (Member)',
    status: 'active',
    createdAt: '14/10/2024',
    lastLogin: 'Hôm nay 09:40',
    projectAccess: 'Design System UI',
    department: 'Thiết kế sản phẩm (Design)',
    avatarCode: 'CT',
    bgColor: 'bg-rose-700',
  },
]

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

class AdminService {
  private users: AdminUser[] = JSON.parse(JSON.stringify(INITIAL_USERS))
  private permissionGroups: PermissionGroup[] = JSON.parse(
    JSON.stringify(INITIAL_PERMISSION_GROUPS),
  )
  private settings: SystemSettings = { ...INITIAL_SETTINGS }
  private listeners: Array<() => void> = []

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((l) => l())
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

  createUser(payload: CreateAdminUserPayload): AdminUser {
    const roleLabels = {
      admin: 'Quản trị viên (Admin)',
      manager: 'Quản lý (Manager)',
      member: 'Thành viên (Member)',
    }

    const initials = payload.name
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'NV'

    const newUser: AdminUser = {
      id: `USR-${String(this.users.length + 1).padStart(4, '0')}`,
      name: payload.name.trim(),
      email: payload.email.trim(),
      role: payload.role,
      roleLabel: roleLabels[payload.role],
      status: payload.activateImmediately ? 'active' : 'locked',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      lastLogin: 'Chưa từng đăng nhập',
      projectAccess: payload.role === 'admin' ? 'Tất cả dự án (6)' : 'ScrumBan Core',
      department: payload.department || 'Kỹ thuật phần mềm (Engineering)',
      avatarCode: initials,
      bgColor: 'bg-emerald-600',
    }

    this.users.unshift(newUser)
    this.notify()
    return newUser
  }

  /**
   * Khóa tài khoản người dùng.
   * BE: PATCH /api/v1/admin/users/{userId}/lock  [Requires ADMIN role]
   * Đồng thời cập nhật state local để UI phản ánh ngay lập tức.
   */
  async lockUser(id: string, reason: string, auditNote?: string): Promise<{ success: boolean; error?: string }> {
    const user = this.users.find((u) => u.id === id)
    if (!user) return { success: false, error: 'Không tìm thấy người dùng' }

    if (user.isSelf) {
      return {
        success: false,
        error: 'Không thể khóa tài khoản của chính bạn. Hãy bàn giao đặc quyền Quản trị viên tối cao trước.',
      }
    }

    try {
      const numericId = parseInt(id.replace(/\D/g, ''), 10)
      if (numericId > 0) {
        await api.adminUsers.lockUser(numericId)
      }

      // Cập nhật local state
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
   * Mở khóa tài khoản người dùng.
   * BE: PATCH /api/v1/admin/users/{userId}/unlock  [Requires ADMIN role]
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

  saveSettings(newSettings: Partial<SystemSettings>) {
    this.settings = {
      ...this.settings,
      ...newSettings,
      lastUpdated: new Date().toLocaleDateString('vi-VN'),
    }
    this.notify()
  }

  resetSettings() {
    this.settings = { ...INITIAL_SETTINGS }
    this.notify()
  }
}

export const adminService = new AdminService()
