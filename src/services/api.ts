/**
 * src/services/api.ts
 * TẬP TRUNG TẤT CẢ CÁC API CỦA HỆ THỐNG TRONG MỘT FILE DUY NHẤT.
 *
 * Quy tắc:
 * 1. Biến API_ROOT lưu địa chỉ gốc của Backend. Khi đổi host/port chỉ cần sửa biến này.
 * 2. Tất cả API đều console.log res.data kèm mô tả tiếng Việt.
 * 3. Tập trung đầy đủ các API Backend hiện có (49 endpoints).
 */

import axios, { type AxiosInstance } from 'axios'
import { tokenStorage } from '@/lib/tokenStorage'

// ─── 1. BIẾN ROOT CỦA API (THAY ĐỔI TẠI ĐÂY) ─────────────────────────────────
// Mặc định để '' để sử dụng Vite Proxy chuyển tiếp tới http://localhost:5141 (tránh lỗi CORS)
export const API_ROOT = ''
// ─────────────────────────────────────────────────────────────────────────────

// Base URL cấp v1
export const API_V1 = API_ROOT ? `${API_ROOT}/api/v1` : '/api/v1'

// Khởi tạo axios client
export const httpClient: AxiosInstance = axios.create({
  baseURL: API_V1,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Tự động gắn Bearer Token nếu có
httpClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor bắt lỗi phản hồi
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.remove()
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/reset-sent']
      const isPublic = publicPaths.some((p) => window.location.pathname.startsWith(p))
      if (!isPublic) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

// ─── GENERIC RESPONSE TYPE ───────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// ─── AUTH & USER TYPES ────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResultData {
  accessToken: string
  tokenType: string
  expiresAtUtc: string
  user: {
    userId: number
    fullName: string
    email: string
    systemRole: 'ADMIN' | 'USER'
  }
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterResultData {
  userId: number
  systemRole: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserProfileData {
  userId: number
  fullName: string
  email: string
  phoneNumber: string | null
  avatar: string | null
  systemRole: 'ADMIN' | 'USER'
  createdAt: string
}

export interface UpdateProfilePayload {
  fullName: string
  email: string
  phoneNumber?: string | null
}

export interface UpdateProfileResultData {
  userId: number
  fullName: string
  email: string
  phoneNumber: string | null
  updatedAt: string
}

export interface UpdateAvatarResultData {
  avatar: string
}

export interface LockUnlockUserResultData {
  userId: number
  status: 0 | 1
}

// ─── PROJECT TYPES (UC4) ──────────────────────────────────────────────────────

export interface ProjectData {
  projectId: number
  projectName: string
  description: string | null
  startDate: string | null
  endDate: string | null
  status: 'ACTIVE' | 'CLOSED'
  createdBy: number
  projectRole: 'MANAGER' | 'MEMBER' | null
  createdAt: string
  updatedAt: string | null
}

export interface ProjectRequest {
  projectName: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
}

export interface ListProjectsQuery {
  page?: number
  pageSize?: number
  keyword?: string
  status?: 'ACTIVE' | 'CLOSED'
}

// ─── PROJECT MEMBERS TYPES (UC5) ─────────────────────────────────────────────

export interface ProjectMemberData {
  userId: number
  fullName: string
  email: string
  avatar: string | null
  status: number
  projectRole: 'MANAGER' | 'MEMBER'
  departmentId: number | null
  departmentName: string | null
  joinedAt: string
}

export interface ListProjectMembersQuery {
  page?: number
  pageSize?: number
  keyword?: string
  departmentId?: number
}

export interface AddProjectMemberPayload {
  userId: number
}

export interface PromoteProjectMemberPayload {
  role: 'MANAGER'
}

export interface ProjectMemberMutationResult {
  projectId: number
  userId: number
  projectRole: 'MANAGER' | 'MEMBER' | null
}

// ─── PROJECT DEPARTMENTS TYPES (UC6) ─────────────────────────────────────────

export interface DepartmentData {
  departmentId: number
  projectId: number
  departmentName: string
  description: string | null
  memberCount: number
}

export interface DepartmentRequest {
  departmentName: string
  description?: string | null
}

export interface AssignDepartmentPayload {
  departmentId: number | null
}

export interface DepartmentMutationResult {
  projectId: number
  departmentId: number
  departmentName: string
  description: string | null
}

export interface AssignDepartmentResult {
  projectId: number
  userId: number
  departmentId: number | null
}

// ─── EPICS TYPES (UC9–UC10) ──────────────────────────────────────────────────

export interface EpicData {
  epicId: number
  projectId: number
  title: string
  description: string | null
  priority: number
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CLOSED'
  createdBy: number
  createdAt: string
  updatedAt: string | null
}

export interface EpicRequest {
  title: string
  description?: string | null
  priority: number
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CLOSED'
}

export interface ListEpicsQuery {
  page?: number
  pageSize?: number
  keyword?: string
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CLOSED'
}

export interface EpicProgressData {
  epicId: number
  totalPbis: number
  completedPbis: number
  pbiProgressPercent: number
  totalTasks: number
  completedTasks: number
  taskProgressPercent: number
}

export interface LinkEpicPayload {
  epicId: number
}

// ─── PRODUCT BACKLOG TYPES (UC7–UC8) ─────────────────────────────────────────

export interface ProductBacklogItemData {
  pbiId: number
  epicId: number
  title: string
  description: string | null
  storyPoint: number
  priority: number
  status: 'NEW' | 'READY' | 'IN_SPRINT' | 'DONE'
  createdAt: string
  updatedAt: string | null
}

export interface BacklogRequest {
  epicId: number
  title: string
  description?: string | null
  storyPoint: number
  priority: number
  status: 'NEW' | 'READY' | 'IN_SPRINT' | 'DONE'
}

export interface ListBacklogQuery {
  projectId: number
  epicId?: number
  page?: number
  pageSize?: number
  keyword?: string
  status?: 'NEW' | 'READY' | 'IN_SPRINT' | 'DONE'
}

export interface ChangePriorityPayload {
  priority: number
}

export interface BacklogOrderPayload {
  epicId: number
  pbiIds: number[]
}

// ─── SPRINTS TYPES (UC11–UC12) ───────────────────────────────────────────────

export interface SprintData {
  sprintId: number
  projectId: number
  sprintName: string
  sprintGoal: string | null
  startDate: string
  endDate: string
  status: 'PLANNED' | 'ACTIVE' | 'CLOSED'
}

export interface SprintRequest {
  projectId: number
  sprintName: string
  sprintGoal?: string | null
  startDate: string
  endDate: string
}

export interface ListSprintsQuery {
  projectId: number
  status?: 'PLANNED' | 'ACTIVE' | 'CLOSED'
  page?: number
  pageSize?: number
}

export interface AddPbisToSprintPayload {
  pbiIds: number[]
}

export interface SprintProgressItem {
  pbiId: number
  title: string
  storyPoint: number
  status: string
}

export interface SprintProgressData {
  sprint: SprintData
  items: SprintProgressItem[]
  totalPbis: number
  completedPbis: number
  totalStoryPoints: number
  completedStoryPoints: number
  remainingStoryPoints: number
  progressPercent: number
  totalTasks: number
  completedTasks: number
}

export interface BurndownPoint {
  date: string
  idealRemaining: number
  actualRemaining: number | null
}

export interface SprintBurndownData {
  sprintId: number
  unit: string
  totalScope: number
  historyAvailableFrom: string | null
  points: BurndownPoint[]
  note: string
}

// ─── 2. ĐỊNH NGHĨA VÀ EXPORT TẤT CẢ API (49 ENDPOINTS TẬP TRUNG) ───────────────

export const api = {
  // ── NHÓM 1: AUTHENTICATION (/api/v1/auth) ──────────────────────────────────
  auth: {
    login: async (payload: LoginPayload): Promise<ApiResponse<LoginResultData>> => {
      const res = await httpClient.post<ApiResponse<LoginResultData>>('/auth/login', payload)
      console.log('📢 [API] Đăng nhập thành công:', res.data)
      return res.data
    },

    logout: async (): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>('/auth/logout')
      console.log('📢 [API] Đăng xuất thành công:', res.data)
      return res.data
    },

    register: async (payload: RegisterPayload): Promise<ApiResponse<RegisterResultData>> => {
      const res = await httpClient.post<ApiResponse<RegisterResultData>>('/auth/register', payload)
      console.log('📢 [API] Đăng ký tài khoản thành công:', res.data)
      return res.data
    },

    forgotPassword: async (payload: ForgotPasswordPayload): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>('/auth/forgot-password', payload)
      console.log('📢 [API] Gửi yêu cầu quên mật khẩu:', res.data)
      return res.data
    },

    resetPassword: async (payload: ResetPasswordPayload): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>('/auth/reset-password', payload)
      console.log('📢 [API] Đặt lại mật khẩu thành công:', res.data)
      return res.data
    },

    changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>('/auth/change-password', payload)
      console.log('📢 [API] Đổi mật khẩu thành công:', res.data)
      return res.data
    },
  },

  // ── NHÓM 2: USERS / PROFILE (/api/v1/users) ────────────────────────────────
  users: {
    getMe: async (): Promise<ApiResponse<UserProfileData>> => {
      const res = await httpClient.get<ApiResponse<UserProfileData>>('/users/me')
      console.log('📢 [API] Lấy thông tin hồ sơ (users/me):', res.data)
      return res.data
    },

    updateMe: async (payload: UpdateProfilePayload): Promise<ApiResponse<UpdateProfileResultData>> => {
      const res = await httpClient.put<ApiResponse<UpdateProfileResultData>>('/users/me', payload)
      console.log('📢 [API] Cập nhật hồ sơ (users/me):', res.data)
      return res.data
    },

    uploadAvatar: async (file: File): Promise<ApiResponse<UpdateAvatarResultData>> => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await httpClient.put<ApiResponse<UpdateAvatarResultData>>('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log('📢 [API] Cập nhật ảnh đại diện:', res.data)
      return res.data
    },

    getAvatarBlob: async (fileName: string): Promise<Blob> => {
      const res = await httpClient.get(`/users/me/avatar/${fileName}`, {
        responseType: 'blob',
      })
      return res.data
    },
  },

  // ── NHÓM 3: ADMIN USERS (/api/v1/admin/users) ───────────────────────────────
  adminUsers: {
    lockUser: async (userId: number): Promise<ApiResponse<LockUnlockUserResultData>> => {
      const res = await httpClient.patch<ApiResponse<LockUnlockUserResultData>>(`/admin/users/${userId}/lock`)
      console.log(`📢 [API] Khóa tài khoản ID ${userId}:`, res.data)
      return res.data
    },

    unlockUser: async (userId: number): Promise<ApiResponse<LockUnlockUserResultData>> => {
      const res = await httpClient.patch<ApiResponse<LockUnlockUserResultData>>(`/admin/users/${userId}/unlock`)
      console.log(`📢 [API] Mở khóa tài khoản ID ${userId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 4: PROJECTS (/api/v1/projects) ─────────────────────────────────────
  projects: {
    create: async (payload: ProjectRequest): Promise<ApiResponse<ProjectData>> => {
      const res = await httpClient.post<ApiResponse<ProjectData>>('/projects', payload)
      console.log('📢 [API] Tạo dự án mới:', res.data)
      return res.data
    },

    list: async (query?: ListProjectsQuery): Promise<ApiResponse<PaginatedData<ProjectData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<ProjectData>>>('/projects', { params: query })
      console.log('📢 [API] Lấy danh sách dự án:', res.data)
      return res.data
    },

    get: async (projectId: number): Promise<ApiResponse<ProjectData>> => {
      const res = await httpClient.get<ApiResponse<ProjectData>>(`/projects/${projectId}`)
      console.log(`📢 [API] Lấy chi tiết dự án ID ${projectId}:`, res.data)
      return res.data
    },

    update: async (projectId: number, payload: ProjectRequest): Promise<ApiResponse<ProjectData>> => {
      const res = await httpClient.put<ApiResponse<ProjectData>>(`/projects/${projectId}`, payload)
      console.log(`📢 [API] Cập nhật dự án ID ${projectId}:`, res.data)
      return res.data
    },

    close: async (projectId: number): Promise<ApiResponse<ProjectData>> => {
      const res = await httpClient.patch<ApiResponse<ProjectData>>(`/projects/${projectId}/close`)
      console.log(`📢 [API] Đóng dự án ID ${projectId}:`, res.data)
      return res.data
    },

    delete: async (projectId: number): Promise<ApiResponse<ProjectData>> => {
      const res = await httpClient.delete<ApiResponse<ProjectData>>(`/projects/${projectId}`)
      console.log(`📢 [API] Xóa mềm dự án ID ${projectId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 5: PROJECT MEMBERS (/api/v1/projects/{projectId}/members) ───────────
  projectMembers: {
    list: async (projectId: number, query?: ListProjectMembersQuery): Promise<ApiResponse<PaginatedData<ProjectMemberData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<ProjectMemberData>>>(`/projects/${projectId}/members`, { params: query })
      console.log(`📢 [API] Lấy danh sách thành viên dự án ID ${projectId}:`, res.data)
      return res.data
    },

    add: async (projectId: number, payload: AddProjectMemberPayload): Promise<ApiResponse<ProjectMemberMutationResult>> => {
      const res = await httpClient.post<ApiResponse<ProjectMemberMutationResult>>(`/projects/${projectId}/members`, payload)
      console.log(`📢 [API] Thêm thành viên vào dự án ID ${projectId}:`, res.data)
      return res.data
    },

    remove: async (projectId: number, userId: number): Promise<ApiResponse<ProjectMemberMutationResult>> => {
      const res = await httpClient.delete<ApiResponse<ProjectMemberMutationResult>>(`/projects/${projectId}/members/${userId}`)
      console.log(`📢 [API] Xóa thành viên ${userId} khỏi dự án ID ${projectId}:`, res.data)
      return res.data
    },

    promote: async (projectId: number, userId: number, payload: PromoteProjectMemberPayload = { role: 'MANAGER' }): Promise<ApiResponse<ProjectMemberMutationResult>> => {
      const res = await httpClient.patch<ApiResponse<ProjectMemberMutationResult>>(`/projects/${projectId}/members/${userId}/role`, payload)
      console.log(`📢 [API] Nâng quyền Manager cho user ${userId} trong dự án ID ${projectId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 6: PROJECT DEPARTMENTS (/api/v1/projects/{projectId}/departments) ──
  projectDepartments: {
    list: async (projectId: number, page: number = 1, pageSize: number = 20): Promise<ApiResponse<PaginatedData<DepartmentData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<DepartmentData>>>(`/projects/${projectId}/departments`, {
        params: { page, pageSize },
      })
      console.log(`📢 [API] Lấy danh sách phòng ban dự án ID ${projectId}:`, res.data)
      return res.data
    },

    create: async (projectId: number, payload: DepartmentRequest): Promise<ApiResponse<DepartmentMutationResult>> => {
      const res = await httpClient.post<ApiResponse<DepartmentMutationResult>>(`/projects/${projectId}/departments`, payload)
      console.log(`📢 [API] Tạo phòng ban mới trong dự án ID ${projectId}:`, res.data)
      return res.data
    },

    update: async (projectId: number, departmentId: number, payload: DepartmentRequest): Promise<ApiResponse<DepartmentMutationResult>> => {
      const res = await httpClient.put<ApiResponse<DepartmentMutationResult>>(`/projects/${projectId}/departments/${departmentId}`, payload)
      console.log(`📢 [API] Cập nhật phòng ban ID ${departmentId} trong dự án ${projectId}:`, res.data)
      return res.data
    },

    delete: async (projectId: number, departmentId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/projects/${projectId}/departments/${departmentId}`)
      console.log(`📢 [API] Xóa phòng ban ID ${departmentId} khỏi dự án ${projectId}:`, res.data)
      return res.data
    },

    assignMember: async (projectId: number, userId: number, payload: AssignDepartmentPayload): Promise<ApiResponse<AssignDepartmentResult>> => {
      const res = await httpClient.patch<ApiResponse<AssignDepartmentResult>>(`/projects/${projectId}/members/${userId}/department`, payload)
      console.log(`📢 [API] Gán phòng ban cho user ${userId} trong dự án ${projectId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 7: EPICS (/api/v1/projects/{projectId}/epics & /api/v1/epics) ───────
  epics: {
    list: async (projectId: number, query?: ListEpicsQuery): Promise<ApiResponse<PaginatedData<EpicData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<EpicData>>>(`/projects/${projectId}/epics`, { params: query })
      console.log(`📢 [API] Lấy danh sách Epic của dự án ID ${projectId}:`, res.data)
      return res.data
    },

    create: async (projectId: number, payload: EpicRequest): Promise<ApiResponse<EpicData>> => {
      const res = await httpClient.post<ApiResponse<EpicData>>(`/projects/${projectId}/epics`, payload)
      console.log(`📢 [API] Tạo Epic mới trong dự án ID ${projectId}:`, res.data)
      return res.data
    },

    get: async (epicId: number): Promise<ApiResponse<EpicData>> => {
      const res = await httpClient.get<ApiResponse<EpicData>>(`/epics/${epicId}`)
      console.log(`📢 [API] Lấy chi tiết Epic ID ${epicId}:`, res.data)
      return res.data
    },

    update: async (epicId: number, payload: EpicRequest): Promise<ApiResponse<EpicData>> => {
      const res = await httpClient.put<ApiResponse<EpicData>>(`/epics/${epicId}`, payload)
      console.log(`📢 [API] Cập nhật Epic ID ${epicId}:`, res.data)
      return res.data
    },

    delete: async (epicId: number): Promise<ApiResponse<EpicData>> => {
      const res = await httpClient.delete<ApiResponse<EpicData>>(`/epics/${epicId}`)
      console.log(`📢 [API] Xóa Epic ID ${epicId}:`, res.data)
      return res.data
    },

    progress: async (epicId: number): Promise<ApiResponse<EpicProgressData>> => {
      const res = await httpClient.get<ApiResponse<EpicProgressData>>(`/epics/${epicId}/progress`)
      console.log(`📢 [API] Lấy tiến độ Epic ID ${epicId}:`, res.data)
      return res.data
    },

    linkPbi: async (pbiId: number, payload: LinkEpicPayload): Promise<ApiResponse<{ itemId: number; epicId: number }>> => {
      const res = await httpClient.patch<ApiResponse<{ itemId: number; epicId: number }>>(`/pbis/${pbiId}/epic`, payload)
      console.log(`📢 [API] Liên kết PBI ${pbiId} với Epic ${payload.epicId}:`, res.data)
      return res.data
    },

    linkTask: async (taskId: number, payload: LinkEpicPayload): Promise<ApiResponse<{ itemId: number; epicId: number }>> => {
      const res = await httpClient.patch<ApiResponse<{ itemId: number; epicId: number }>>(`/tasks/${taskId}/epic`, payload)
      console.log(`📢 [API] Liên kết Task ${taskId} với Epic ${payload.epicId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 8: PRODUCT BACKLOG (/api/v1/product-backlog-items) ─────────────────
  productBacklog: {
    list: async (query: ListBacklogQuery): Promise<ApiResponse<PaginatedData<ProductBacklogItemData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<ProductBacklogItemData>>>('/product-backlog-items', { params: query })
      console.log(`📢 [API] Lấy danh sách Product Backlog (Project ${query.projectId}):`, res.data)
      return res.data
    },

    create: async (payload: BacklogRequest): Promise<ApiResponse<ProductBacklogItemData>> => {
      const res = await httpClient.post<ApiResponse<ProductBacklogItemData>>('/product-backlog-items', payload)
      console.log('📢 [API] Tạo PBI mới:', res.data)
      return res.data
    },

    get: async (pbiId: number): Promise<ApiResponse<ProductBacklogItemData>> => {
      const res = await httpClient.get<ApiResponse<ProductBacklogItemData>>(`/product-backlog-items/${pbiId}`)
      console.log(`📢 [API] Lấy chi tiết PBI ID ${pbiId}:`, res.data)
      return res.data
    },

    update: async (pbiId: number, payload: BacklogRequest): Promise<ApiResponse<ProductBacklogItemData>> => {
      const res = await httpClient.put<ApiResponse<ProductBacklogItemData>>(`/product-backlog-items/${pbiId}`, payload)
      console.log(`📢 [API] Cập nhật PBI ID ${pbiId}:`, res.data)
      return res.data
    },

    delete: async (pbiId: number): Promise<ApiResponse<ProductBacklogItemData>> => {
      const res = await httpClient.delete<ApiResponse<ProductBacklogItemData>>(`/product-backlog-items/${pbiId}`)
      console.log(`📢 [API] Xóa PBI ID ${pbiId}:`, res.data)
      return res.data
    },

    changePriority: async (pbiId: number, payload: ChangePriorityPayload): Promise<ApiResponse<ProductBacklogItemData>> => {
      const res = await httpClient.patch<ApiResponse<ProductBacklogItemData>>(`/product-backlog-items/${pbiId}/priority`, payload)
      console.log(`📢 [API] Đổi priority PBI ID ${pbiId}:`, res.data)
      return res.data
    },

    reorder: async (payload: BacklogOrderPayload): Promise<ApiResponse<{ epicId: number; pbiIds: number[] }>> => {
      const res = await httpClient.put<ApiResponse<{ epicId: number; pbiIds: number[] }>>('/product-backlog-items/order', payload)
      console.log(`📢 [API] Sắp xếp lại PBI trong Epic ${payload.epicId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 9: SPRINTS (/api/v1/sprints) ───────────────────────────────────────
  sprints: {
    list: async (query: ListSprintsQuery): Promise<ApiResponse<PaginatedData<SprintData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<SprintData>>>('/sprints', { params: query })
      console.log(`📢 [API] Lấy danh sách Sprint (Project ${query.projectId}):`, res.data)
      return res.data
    },

    create: async (payload: SprintRequest): Promise<ApiResponse<SprintData>> => {
      const res = await httpClient.post<ApiResponse<SprintData>>('/sprints', payload)
      console.log('📢 [API] Tạo Sprint mới:', res.data)
      return res.data
    },

    get: async (sprintId: number): Promise<ApiResponse<SprintData>> => {
      const res = await httpClient.get<ApiResponse<SprintData>>(`/sprints/${sprintId}`)
      console.log(`📢 [API] Lấy chi tiết Sprint ID ${sprintId}:`, res.data)
      return res.data
    },

    update: async (sprintId: number, payload: SprintRequest): Promise<ApiResponse<SprintData>> => {
      const res = await httpClient.put<ApiResponse<SprintData>>(`/sprints/${sprintId}`, payload)
      console.log(`📢 [API] Cập nhật Sprint ID ${sprintId}:`, res.data)
      return res.data
    },

    delete: async (sprintId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/sprints/${sprintId}`)
      console.log(`📢 [API] Xóa Sprint ID ${sprintId}:`, res.data)
      return res.data
    },

    start: async (sprintId: number): Promise<ApiResponse<SprintData>> => {
      const res = await httpClient.post<ApiResponse<SprintData>>(`/sprints/${sprintId}/start`)
      console.log(`📢 [API] Bắt đầu Sprint ID ${sprintId}:`, res.data)
      return res.data
    },

    close: async (sprintId: number): Promise<ApiResponse<SprintData>> => {
      const res = await httpClient.post<ApiResponse<SprintData>>(`/sprints/${sprintId}/close`)
      console.log(`📢 [API] Đóng Sprint ID ${sprintId}:`, res.data)
      return res.data
    },

    addBacklogItems: async (sprintId: number, payload: AddPbisToSprintPayload): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>(`/sprints/${sprintId}/backlog-items`, payload)
      console.log(`📢 [API] Thêm PBI vào Sprint ID ${sprintId}:`, res.data)
      return res.data
    },

    removeBacklogItem: async (sprintId: number, pbiId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/sprints/${sprintId}/backlog-items/${pbiId}`)
      console.log(`📢 [API] Loại PBI ${pbiId} khỏi Sprint ${sprintId}:`, res.data)
      return res.data
    },

    progress: async (sprintId: number): Promise<ApiResponse<SprintProgressData>> => {
      const res = await httpClient.get<ApiResponse<SprintProgressData>>(`/sprints/${sprintId}/progress`)
      console.log(`📢 [API] Lấy tiến độ Sprint ID ${sprintId}:`, res.data)
      return res.data
    },

    burndown: async (sprintId: number): Promise<ApiResponse<SprintBurndownData>> => {
      const res = await httpClient.get<ApiResponse<SprintBurndownData>>(`/sprints/${sprintId}/burndown`)
      console.log(`📢 [API] Lấy dữ liệu Burndown Sprint ID ${sprintId}:`, res.data)
      return res.data
    },
  },
}

export default api
