/**
 * src/services/api.ts
 * TẬP TRUNG TẤT CẢ CÁC API CỦA HỆ THỐNG TRONG MỘT FILE DUY NHẤT.
 *
 * Quy tắc kiến trúc:
 * 1. Biến API_ROOT lưu địa chỉ gốc của Backend. Khi đổi host/port chỉ cần sửa biến này.
 * 2. Tất cả API đều console.log res.data kèm mô tả tiếng Việt.
 * 3. Tập trung đầy đủ 124 endpoints Backend theo chuẩn OpenAPI 3.0.1.
 * 4. Không tạo axios instance riêng lẻ ở các feature.
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
  timeout: 20000,
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

// ─── GENERIC RESPONSE TYPES ───────────────────────────────────────────────────

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

// ─── AUTH & USER TYPES (UC1–UC3) ──────────────────────────────────────────────

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
  status: 'ACTIVE' | 'CLOSED' | 'DELETED'
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

// ─── TASKS & SUBTASKS TYPES (UC13–UC15) ──────────────────────────────────────

export interface TaskData {
  taskId: number
  projectId: number
  sprintId: number | null
  epicId: number | null
  parentTaskId: number | null
  assigneeId: number | null
  reporterId: number
  title: string
  description: string | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: string
  deadline: string | null
  progressPercent: number
  position: number
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string | null
}

export interface TaskDetailData {
  task: TaskData
  subtasks: TaskData[]
}

export interface TaskCreatePayload {
  title: string
  description?: string | null
  sprintId?: number | null
  epicId?: number | null
  parentTaskId?: number | null
  assigneeId?: number | null
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  deadline?: string | null
}

export interface TaskUpdatePayload {
  title: string
  description?: string | null
}

export interface AssignTaskPayload {
  assigneeId: number | null
}

export interface TaskPriorityPayload {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export interface TaskDeadlinePayload {
  deadline: string | null
}

export interface TaskProgressPayload {
  progressPercent: number
}

export interface ListTasksQuery {
  page?: number
  pageSize?: number
  sprintId?: number
  assigneeId?: number
  keyword?: string
  status?: string
}

export interface DeadlineAlertItem {
  task: TaskData
  alert: 'OVERDUE' | 'DUE_SOON'
}

export interface DeadlineAlertsData {
  items: DeadlineAlertItem[]
  total: number
  page: number
  pageSize: number
  warningHours: number
  asOfUtc: string
}

// ─── BOARD & KANBAN TYPES (UC16–UC17) ────────────────────────────────────────

export interface BoardTaskCard {
  taskId: number
  title: string
  status: string
  position: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  progressPercent: number
  assigneeId: number | null
  sprintId: number | null
  epicId: number | null
  parentTaskId: number | null
  deadline: string | null
}

export interface BoardColumnData {
  boardColumnId: number
  columnName: string
  position: number
  wipLimit: number | null
  totalCount: number
  matchingCount: number
  isOverloaded: boolean
  hasMore: boolean
  tasks: BoardTaskCard[]
}

export interface BoardData {
  projectId: number
  columns: BoardColumnData[]
  page: number
  pageSize: number
}

export interface MoveTaskPayload {
  toStatus: string
  newPosition: number
}

export interface MoveTaskResult {
  taskId: number
  fromStatus: string
  toStatus: string
  position: number
  progressPercent: number
  startedAt: string | null
  completedAt: string | null
}

export interface BoardFilterQuery {
  sprintId?: number
  assigneeId?: number
  keyword?: string
  page?: number
  pageSize?: number
}

// ─── WIP LIMITS TYPES (UC18–UC19) ────────────────────────────────────────────

export interface WipColumnData {
  boardColumnId: number
  columnName: string
  position: number
  wipLimit: number | null
  taskCount: number
  isOverloaded: boolean
  atCapacity: boolean
  excess: number
}

export interface WipStatusData {
  projectId: number
  columns: WipColumnData[]
  asOfUtc: string
}

export interface WipLimitPayload {
  wipLimit: number
}

export interface WipLimitResult {
  boardColumnId: number
  columnName: string
  wipLimit: number | null
  taskCount: number
  isOverloaded: boolean
  changed: boolean
}

// ─── FLOW METRICS TYPES (UC20–UC23) ──────────────────────────────────────────

export interface FlowWipData {
  projectId: number
  sprintId: number | null
  wip: number
  inProgress: number
  inReview: number
  asOfUtc: string
}

export interface ThroughputPoint {
  date: string
  doneTasks: number
  historyComplete: boolean
}

export interface ThroughputData {
  projectId: number
  sprintId: number | null
  from: string
  to: string
  totalDoneTasks: number
  points: ThroughputPoint[]
  importedBaselineCount: number
  historyTrackingStartedAtUtc: string | null
  hasPartialHistoricalCoverage: boolean
  definition: string
  asOfUtc: string
}

export interface SprintThroughputItem {
  sprintId: number
  name: string
  status: string
  dates: string
  doneTasks: number
}

export interface SprintsThroughputData {
  items: SprintThroughputItem[]
  total: number
  page: number
  pageSize: number
  historyTrackingStartedAtUtc: string | null
  hasPartialHistoricalCoverage: boolean
  asOfUtc: string
}

export interface CycleTimeItem {
  taskId: number
  title: string
  sprintId: number | null
  startedAt: string
  completedAt: string
  cycleTimeDays: number
}

export interface CycleTimeAverageData {
  projectId: number
  sprintId: number | null
  validTasks: number
  skippedInvalidTasks: number
  averageCycleTimeDays: number | null
  asOfUtc: string
}

export interface WorkItemAgeItem {
  taskId: number
  title: string
  sprintId: number | null
  status: string
  assigneeId: number | null
  startedAt: string
  workItemAgeDays: number
}

export interface WorkItemAgeData {
  items: WorkItemAgeItem[]
  total: number
  page: number
  pageSize: number
  minAgeDays: number
  asOfUtc: string
  definition: string
}

// ─── BUGS TYPES (UC24–UC25) ──────────────────────────────────────────────────

export interface BugData {
  bugId: number
  taskId: number
  reporterId: number
  assigneeId: number | null
  title: string
  description: string
  environment: string | null
  severity: 'TRIVIAL' | 'MINOR' | 'MAJOR' | 'BLOCKER'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED'
  createdAt: string
  updatedAt: string | null
  resolvedAt: string | null
}

export interface BugCreatePayload {
  taskId: number
  title: string
  description: string
  environment?: string | null
  severity: 'TRIVIAL' | 'MINOR' | 'MAJOR' | 'BLOCKER'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export interface BugUpdatePayload {
  title: string
  description: string
  environment?: string | null
  severity: 'TRIVIAL' | 'MINOR' | 'MAJOR' | 'BLOCKER'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export interface BugAssigneePayload {
  assigneeId: number | null
}

export interface BugPriorityPayload {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export interface BugStatusPayload {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED'
}

export interface BugDetailData {
  bug: BugData
  task: TaskData | null
  taskComments: CommentData[]
  taskAttachments: AttachmentData[]
  history: ActivityLogItem[]
}

export interface ListBugsQuery {
  status?: string
  severity?: string
  priority?: string
  assigneeId?: number
  taskId?: number
  keyword?: string
  page?: number
  pageSize?: number
}

// ─── COMMENTS TYPES (UC26) ───────────────────────────────────────────────────

export interface CommentData {
  commentId: number
  taskId: number
  userId: number
  content: string
  mentionedUserIds: number[]
  createdAt: string
  updatedAt: string | null
}

export interface CommentPayload {
  content: string
}

// ─── ATTACHMENTS TYPES (UC27) ────────────────────────────────────────────────

export interface AttachmentData {
  attachmentId: number
  taskId: number
  fileName: string
  fileSize: number
  uploadedBy: number
  uploadedAt: string
  previewUrl: string
  downloadUrl: string
}

// ─── NOTIFICATIONS & ACTIVITY LOGS TYPES (UC28) ──────────────────────────────

export interface NotificationData {
  notificationId: number
  userId: number
  title: string
  message: string
  type: string
  referenceType: string | null
  referenceId: number | null
  isRead: boolean
  createdAt: string
  readAt: string | null
}

export interface ListNotificationsQuery {
  unreadOnly?: boolean
  page?: number
  pageSize?: number
}

export interface ActivityLogItem {
  activityLogId: number
  userId: number
  action: string
  entityType: string
  entityId: number | null
  description: string
  createdAt: string
}

export interface ListActivityLogsQuery {
  entityType?: string
  action?: string
  page?: number
  pageSize?: number
}

// ─── CHAT & REALTIME TYPES (UC29–UC32) ───────────────────────────────────────

export interface ChatParticipantData {
  userId: number
  fullName: string
  avatar: string | null
  role: string
  joinedAt: string
}

export interface ChatAttachmentData {
  chatAttachmentId: number
  chatMessageId: number
  fileName: string
  fileSize: number
  previewUrl: string
  downloadUrl: string
}

export interface ChatMessageData {
  chatMessageId: number
  chatRoomId: number
  senderId: number
  content: string | null
  createdAt: string
  attachments?: ChatAttachmentData[]
}

export interface ChatRoomData {
  chatRoomId: number
  roomType: 'PRIVATE' | 'GROUP'
  roomName: string | null
  projectId: number | null
  privateUserLowId: number | null
  privateUserHighId: number | null
  createdBy: number
  createdAt: string
  lastMessage?: ChatMessageData | null
  unreadCount?: number
}

export interface CreateRoomPayload {
  roomType: 'PRIVATE' | 'GROUP'
  recipientId?: number | null
  projectId?: number | null
  roomName?: string | null
  participantIds?: number[]
}

export interface SendMessagePayload {
  content?: string
}

export interface ReadChatPayload {
  messageId?: number | null
}

export interface ListMessagesQuery {
  before?: number
  limit?: number
  keyword?: string
}

// ─── SYSTEM ADMIN & PERMISSIONS TYPES (UC33–UC35) ────────────────────────────

export interface AdminUserData {
  userId: number
  fullName: string
  email: string
  status: 0 | 1
  systemRole: 'ADMIN' | 'USER'
  createdAt: string
}

export interface ListAdminUsersQuery {
  keyword?: string
  status?: 0 | 1
  page?: number
  pageSize?: number
}

export interface SystemRoleData {
  roleId: number
  roleName: string
  scope: string
  description: string | null
}

export interface SystemConfigData {
  values: Record<string, string>
}

export interface PermissionsData {
  systemRole: string
  systemPermissions: string[]
  projectId: number | null
  projectRole: string | null
  projectPermissions: string[]
}


// ─── 2. ĐỊNH NGHĨA VÀ EXPORT TẤT CẢ API (124 ENDPOINTS TẬP TRUNG) ─────────────

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

  // ── NHÓM 3: ADMIN USERS (LOCK / UNLOCK) (/api/v1/admin/users) ───────────────
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

    linkProductBacklogItem: async (pbiId: number, payload: LinkEpicPayload): Promise<ApiResponse<{ itemId: number; epicId: number }>> => {
      const res = await httpClient.patch<ApiResponse<{ itemId: number; epicId: number }>>(`/product-backlog-items/${pbiId}/epic`, payload)
      console.log(`📢 [API] Liên kết PBI ${pbiId} với Epic ${payload.epicId} (route mở rộng):`, res.data)
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

    getBacklogItems: async (sprintId: number): Promise<ApiResponse<ProductBacklogItemData[]>> => {
      const res = await httpClient.get<ApiResponse<ProductBacklogItemData[]>>(`/sprints/${sprintId}/backlog-items`)
      console.log(`📢 [API] Lấy danh sách PBI trong Sprint ID ${sprintId}:`, res.data)
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

  // ── NHÓM 10: TASKS & SUBTASKS (/api/v1/projects/{projectId}/tasks & /api/v1/tasks) ──
  tasks: {
    list: async (projectId: number, query?: ListTasksQuery): Promise<ApiResponse<PaginatedData<TaskData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<TaskData>>>(`/projects/${projectId}/tasks`, { params: query })
      console.log(`📢 [API] Lấy danh sách công việc dự án ${projectId}:`, res.data)
      return res.data
    },

    create: async (projectId: number, payload: TaskCreatePayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.post<ApiResponse<TaskData>>(`/projects/${projectId}/tasks`, payload)
      console.log(`📢 [API] Tạo công việc mới trong dự án ${projectId}:`, res.data)
      return res.data
    },

    get: async (taskId: number): Promise<ApiResponse<TaskDetailData>> => {
      const res = await httpClient.get<ApiResponse<TaskDetailData>>(`/tasks/${taskId}`)
      console.log(`📢 [API] Lấy chi tiết công việc ID ${taskId}:`, res.data)
      return res.data
    },

    update: async (taskId: number, payload: TaskUpdatePayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.put<ApiResponse<TaskData>>(`/tasks/${taskId}`, payload)
      console.log(`📢 [API] Cập nhật công việc ID ${taskId}:`, res.data)
      return res.data
    },

    delete: async (taskId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/tasks/${taskId}`)
      console.log(`📢 [API] Xóa công việc ID ${taskId}:`, res.data)
      return res.data
    },

    createSubtask: async (taskId: number, payload: TaskCreatePayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.post<ApiResponse<TaskData>>(`/tasks/${taskId}/subtasks`, payload)
      console.log(`📢 [API] Tạo subtask cho task ID ${taskId}:`, res.data)
      return res.data
    },

    assign: async (taskId: number, payload: AssignTaskPayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.patch<ApiResponse<TaskData>>(`/tasks/${taskId}/assignee`, payload)
      console.log(`📢 [API] Gán người thực hiện task ID ${taskId}:`, res.data)
      return res.data
    },

    changePriority: async (taskId: number, payload: TaskPriorityPayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.patch<ApiResponse<TaskData>>(`/tasks/${taskId}/priority`, payload)
      console.log(`📢 [API] Đổi độ ưu tiên task ID ${taskId}:`, res.data)
      return res.data
    },

    setDeadline: async (taskId: number, payload: TaskDeadlinePayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.patch<ApiResponse<TaskData>>(`/tasks/${taskId}/deadline`, payload)
      console.log(`📢 [API] Cài đặt hạn chót task ID ${taskId}:`, res.data)
      return res.data
    },

    updateProgress: async (taskId: number, payload: TaskProgressPayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.patch<ApiResponse<TaskData>>(`/tasks/${taskId}/progress`, payload)
      console.log(`📢 [API] Cập nhật tiến độ task ID ${taskId}:`, res.data)
      return res.data
    },

    getOverdue: async (projectId: number, page: number = 1, pageSize: number = 20): Promise<ApiResponse<PaginatedData<TaskData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<TaskData>>>(`/projects/${projectId}/tasks/overdue`, {
        params: { page, pageSize },
      })
      console.log(`📢 [API] Lấy danh sách task quá hạn dự án ${projectId}:`, res.data)
      return res.data
    },

    getDeadlineAlerts: async (projectId: number, page: number = 1, pageSize: number = 20): Promise<ApiResponse<DeadlineAlertsData>> => {
      const res = await httpClient.get<ApiResponse<DeadlineAlertsData>>(`/projects/${projectId}/tasks/deadline-alerts`, {
        params: { page, pageSize },
      })
      console.log(`📢 [API] Lấy cảnh báo deadline dự án ${projectId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 11: BOARD & KANBAN (/api/v1/projects/{projectId}/board & /api/v1/tasks/{taskId}/move) ──
  board: {
    get: async (projectId: number, query?: BoardFilterQuery): Promise<ApiResponse<BoardData>> => {
      const res = await httpClient.get<ApiResponse<BoardData>>(`/projects/${projectId}/board`, { params: query })
      console.log(`📢 [API] Lấy dữ liệu bảng Kanban dự án ${projectId}:`, res.data)
      return res.data
    },

    move: async (taskId: number, payload: MoveTaskPayload): Promise<ApiResponse<MoveTaskResult>> => {
      const res = await httpClient.patch<ApiResponse<MoveTaskResult>>(`/tasks/${taskId}/move`, payload)
      console.log(`📢 [API] Di chuyển công việc ID ${taskId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 12: WIP LIMITS (/api/v1/projects/{projectId}/wip) ───────────────────
  wip: {
    get: async (projectId: number): Promise<ApiResponse<WipStatusData>> => {
      const res = await httpClient.get<ApiResponse<WipStatusData>>(`/projects/${projectId}/wip`)
      console.log(`📢 [API] Lấy trạng thái giới hạn WIP dự án ${projectId}:`, res.data)
      return res.data
    },

    getAlerts: async (projectId: number): Promise<ApiResponse<WipStatusData>> => {
      const res = await httpClient.get<ApiResponse<WipStatusData>>(`/projects/${projectId}/wip/alerts`)
      console.log(`📢 [API] Lấy cảnh báo quá tải WIP dự án ${projectId}:`, res.data)
      return res.data
    },

    setLimit: async (projectId: number, columnId: number, payload: WipLimitPayload): Promise<ApiResponse<WipLimitResult>> => {
      const res = await httpClient.put<ApiResponse<WipLimitResult>>(`/projects/${projectId}/board/columns/${columnId}/wip-limit`, payload)
      console.log(`📢 [API] Đặt giới hạn WIP cho cột ${columnId} dự án ${projectId}:`, res.data)
      return res.data
    },

    removeLimit: async (projectId: number, columnId: number): Promise<ApiResponse<WipLimitResult>> => {
      const res = await httpClient.delete<ApiResponse<WipLimitResult>>(`/projects/${projectId}/board/columns/${columnId}/wip-limit`)
      console.log(`📢 [API] Xóa bỏ giới hạn WIP cột ${columnId} dự án ${projectId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 13: FLOW METRICS (/api/v1/projects/{projectId}/flow-metrics) ────────
  flowMetrics: {
    wip: async (projectId: number, sprintId?: number): Promise<ApiResponse<FlowWipData>> => {
      const res = await httpClient.get<ApiResponse<FlowWipData>>(`/projects/${projectId}/flow-metrics/wip`, {
        params: { sprintId },
      })
      console.log(`📢 [API] Lấy chỉ số WIP luồng dự án ${projectId}:`, res.data)
      return res.data
    },

    throughput: async (projectId: number, query?: { from?: string; to?: string; sprintId?: number }): Promise<ApiResponse<ThroughputData>> => {
      const res = await httpClient.get<ApiResponse<ThroughputData>>(`/projects/${projectId}/flow-metrics/throughput`, {
        params: query,
      })
      console.log(`📢 [API] Lấy Throughput dự án ${projectId}:`, res.data)
      return res.data
    },

    throughputSprints: async (projectId: number, query?: { from?: string; to?: string; page?: number; pageSize?: number }): Promise<ApiResponse<SprintsThroughputData>> => {
      const res = await httpClient.get<ApiResponse<SprintsThroughputData>>(`/projects/${projectId}/flow-metrics/throughput/sprints`, {
        params: query,
      })
      console.log(`📢 [API] Lấy so sánh Throughput theo Sprint dự án ${projectId}:`, res.data)
      return res.data
    },

    cycleTime: async (projectId: number, query?: { sprintId?: number; page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedData<CycleTimeItem>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<CycleTimeItem>>>(`/projects/${projectId}/flow-metrics/cycle-time`, {
        params: query,
      })
      console.log(`📢 [API] Lấy danh sách Cycle Time dự án ${projectId}:`, res.data)
      return res.data
    },

    cycleTimeAverage: async (projectId: number, sprintId?: number): Promise<ApiResponse<CycleTimeAverageData>> => {
      const res = await httpClient.get<ApiResponse<CycleTimeAverageData>>(`/projects/${projectId}/flow-metrics/cycle-time/average`, {
        params: { sprintId },
      })
      console.log(`📢 [API] Lấy Cycle Time trung bình dự án ${projectId}:`, res.data)
      return res.data
    },

    workItemAge: async (projectId: number, query?: { sprintId?: number; minAgeDays?: number; page?: number; pageSize?: number }): Promise<ApiResponse<WorkItemAgeData>> => {
      const res = await httpClient.get<ApiResponse<WorkItemAgeData>>(`/projects/${projectId}/flow-metrics/work-item-age`, {
        params: query,
      })
      console.log(`📢 [API] Lấy Work Item Age dự án ${projectId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 14: BUGS (/api/v1/projects/{projectId}/bugs & /api/v1/bugs) ──────────
  bugs: {
    list: async (projectId: number, query?: ListBugsQuery): Promise<ApiResponse<PaginatedData<BugData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<BugData>>>(`/projects/${projectId}/bugs`, { params: query })
      console.log(`📢 [API] Lấy danh sách Bug dự án ${projectId}:`, res.data)
      return res.data
    },

    create: async (payload: BugCreatePayload): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.post<ApiResponse<BugData>>('/bugs', payload)
      console.log('📢 [API] Tạo Bug mới:', res.data)
      return res.data
    },

    createForTask: async (taskId: number, payload: Omit<BugCreatePayload, 'taskId'>): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.post<ApiResponse<BugData>>(`/tasks/${taskId}/bugs`, payload)
      console.log(`📢 [API] Tạo Bug gắn với Task ID ${taskId}:`, res.data)
      return res.data
    },

    get: async (bugId: number): Promise<ApiResponse<BugDetailData>> => {
      const res = await httpClient.get<ApiResponse<BugDetailData>>(`/bugs/${bugId}`)
      console.log(`📢 [API] Lấy chi tiết Bug ID ${bugId}:`, res.data)
      return res.data
    },

    update: async (bugId: number, payload: BugUpdatePayload): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.put<ApiResponse<BugData>>(`/bugs/${bugId}`, payload)
      console.log(`📢 [API] Cập nhật Bug ID ${bugId}:`, res.data)
      return res.data
    },

    delete: async (bugId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/bugs/${bugId}`)
      console.log(`📢 [API] Xóa Bug ID ${bugId}:`, res.data)
      return res.data
    },

    assign: async (bugId: number, payload: BugAssigneePayload): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.patch<ApiResponse<BugData>>(`/bugs/${bugId}/assignee`, payload)
      console.log(`📢 [API] Gán người sửa Bug ID ${bugId}:`, res.data)
      return res.data
    },

    changePriority: async (bugId: number, payload: BugPriorityPayload): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.patch<ApiResponse<BugData>>(`/bugs/${bugId}/priority`, payload)
      console.log(`📢 [API] Đổi độ ưu tiên Bug ID ${bugId}:`, res.data)
      return res.data
    },

    changeStatus: async (bugId: number, payload: BugStatusPayload): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.patch<ApiResponse<BugData>>(`/bugs/${bugId}/status`, payload)
      console.log(`📢 [API] Chuyển trạng thái Bug ID ${bugId}:`, res.data)
      return res.data
    },

    close: async (bugId: number): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.post<ApiResponse<BugData>>(`/bugs/${bugId}/close`)
      console.log(`📢 [API] Đóng Bug ID ${bugId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 15: COMMENTS (/api/v1/tasks/{taskId}/comments & /api/v1/comments) ───
  comments: {
    listByTask: async (taskId: number, page: number = 1, pageSize: number = 20): Promise<ApiResponse<PaginatedData<CommentData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<CommentData>>>(`/tasks/${taskId}/comments`, {
        params: { page, pageSize },
      })
      console.log(`📢 [API] Lấy bình luận Task ID ${taskId}:`, res.data)
      return res.data
    },

    createForTask: async (taskId: number, payload: CommentPayload): Promise<ApiResponse<CommentData>> => {
      const res = await httpClient.post<ApiResponse<CommentData>>(`/tasks/${taskId}/comments`, payload)
      console.log(`📢 [API] Thêm bình luận Task ID ${taskId}:`, res.data)
      return res.data
    },

    get: async (commentId: number): Promise<ApiResponse<CommentData>> => {
      const res = await httpClient.get<ApiResponse<CommentData>>(`/comments/${commentId}`)
      console.log(`📢 [API] Lấy chi tiết bình luận ID ${commentId}:`, res.data)
      return res.data
    },

    update: async (commentId: number, payload: CommentPayload): Promise<ApiResponse<CommentData>> => {
      const res = await httpClient.put<ApiResponse<CommentData>>(`/comments/${commentId}`, payload)
      console.log(`📢 [API] Sửa bình luận ID ${commentId}:`, res.data)
      return res.data
    },

    delete: async (commentId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/comments/${commentId}`)
      console.log(`📢 [API] Xóa bình luận ID ${commentId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 16: ATTACHMENTS (/api/v1/tasks/{taskId}/attachments & /api/v1/attachments) ──
  attachments: {
    uploadForTask: async (taskId: number, files: File[]): Promise<ApiResponse<{ items: AttachmentData[] }>> => {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      const res = await httpClient.post<ApiResponse<{ items: AttachmentData[] }>>(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log(`📢 [API] Đính kèm tệp cho Task ID ${taskId}:`, res.data)
      return res.data
    },

    listByTask: async (taskId: number, page: number = 1, pageSize: number = 20): Promise<ApiResponse<PaginatedData<AttachmentData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<AttachmentData>>>(`/tasks/${taskId}/attachments`, {
        params: { page, pageSize },
      })
      console.log(`📢 [API] Lấy tệp đính kèm Task ID ${taskId}:`, res.data)
      return res.data
    },

    get: async (attachmentId: number): Promise<ApiResponse<AttachmentData>> => {
      const res = await httpClient.get<ApiResponse<AttachmentData>>(`/attachments/${attachmentId}`)
      console.log(`📢 [API] Lấy metadata tệp ID ${attachmentId}:`, res.data)
      return res.data
    },

    delete: async (attachmentId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/attachments/${attachmentId}`)
      console.log(`📢 [API] Xóa tệp đính kèm ID ${attachmentId}:`, res.data)
      return res.data
    },

    downloadBlob: async (attachmentId: number): Promise<Blob> => {
      const res = await httpClient.get(`/attachments/${attachmentId}/download`, {
        responseType: 'blob',
      })
      return res.data
    },

    previewBlob: async (attachmentId: number): Promise<Blob> => {
      const res = await httpClient.get(`/attachments/${attachmentId}/preview`, {
        responseType: 'blob',
      })
      return res.data
    },
  },

  // ── NHÓM 17: NOTIFICATIONS (/api/v1/notifications) ───────────────────────────
  notifications: {
    list: async (query?: ListNotificationsQuery): Promise<ApiResponse<PaginatedData<NotificationData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<NotificationData>>>('/notifications', { params: query })
      console.log('📢 [API] Lấy danh sách thông báo:', res.data)
      return res.data
    },

    getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
      const res = await httpClient.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count')
      console.log('📢 [API] Lấy số thông báo chưa đọc:', res.data)
      return res.data
    },

    markAsRead: async (notificationId: number): Promise<ApiResponse<NotificationData>> => {
      const res = await httpClient.patch<ApiResponse<NotificationData>>(`/notifications/${notificationId}/read`)
      console.log(`📢 [API] Đánh dấu đã đọc thông báo ID ${notificationId}:`, res.data)
      return res.data
    },

    markAllAsRead: async (): Promise<ApiResponse<{ updated: number }>> => {
      const res = await httpClient.patch<ApiResponse<{ updated: number }>>('/notifications/read-all')
      console.log('📢 [API] Đánh dấu đã đọc tất cả thông báo:', res.data)
      return res.data
    },
  },

  // ── NHÓM 18: ACTIVITY LOGS (/api/v1/projects/{projectId}/activity-logs) ──────
  activityLogs: {
    listByProject: async (projectId: number, query?: ListActivityLogsQuery): Promise<ApiResponse<PaginatedData<ActivityLogItem>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<ActivityLogItem>>>(`/projects/${projectId}/activity-logs`, { params: query })
      console.log(`📢 [API] Lấy nhật ký hoạt động dự án ${projectId}:`, res.data)
      return res.data
    },
  },

  // ── NHÓM 19: CHAT & REALTIME (/api/v1/chat) ──────────────────────────────────
  chat: {
    listRooms: async (): Promise<ApiResponse<ChatRoomData[]>> => {
      const res = await httpClient.get<ApiResponse<ChatRoomData[]>>('/chat/rooms')
      console.log('📢 [API] Lấy danh sách phòng chat:', res.data)
      return res.data
    },

    createRoom: async (payload: CreateRoomPayload): Promise<ApiResponse<ChatRoomData>> => {
      const res = await httpClient.post<ApiResponse<ChatRoomData>>('/chat/rooms', payload)
      console.log('📢 [API] Tạo phòng chat mới:', res.data)
      return res.data
    },

    listParticipants: async (roomId: number): Promise<ApiResponse<ChatParticipantData[]>> => {
      const res = await httpClient.get<ApiResponse<ChatParticipantData[]>>(`/chat/rooms/${roomId}/participants`)
      console.log(`📢 [API] Lấy thành viên phòng chat ID ${roomId}:`, res.data)
      return res.data
    },

    addParticipants: async (roomId: number, userIds: number[]): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>(`/chat/rooms/${roomId}/participants`, { userIds })
      console.log(`📢 [API] Thêm thành viên vào phòng chat ID ${roomId}:`, res.data)
      return res.data
    },

    removeParticipant: async (roomId: number, userId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/chat/rooms/${roomId}/participants/${userId}`)
      console.log(`📢 [API] Xóa thành viên ${userId} khỏi phòng chat ${roomId}:`, res.data)
      return res.data
    },

    listMessages: async (roomId: number, query?: ListMessagesQuery): Promise<ApiResponse<ChatMessageData[]>> => {
      const res = await httpClient.get<ApiResponse<ChatMessageData[]>>(`/chat/rooms/${roomId}/messages`, { params: query })
      console.log(`📢 [API] Lấy tin nhắn phòng chat ID ${roomId}:`, res.data)
      return res.data
    },

    sendMessage: async (roomId: number, payload: SendMessagePayload, files?: File[]): Promise<ApiResponse<ChatMessageData>> => {
      if (files && files.length > 0) {
        const formData = new FormData()
        if (payload.content) formData.append('content', payload.content)
        files.forEach((f) => formData.append('files', f))
        const res = await httpClient.post<ApiResponse<ChatMessageData>>(`/chat/rooms/${roomId}/messages`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        console.log(`📢 [API] Gửi tin nhắn kèm tệp vào phòng ${roomId}:`, res.data)
        return res.data
      }
      const res = await httpClient.post<ApiResponse<ChatMessageData>>(`/chat/rooms/${roomId}/messages`, payload)
      console.log(`📢 [API] Gửi tin nhắn vào phòng ${roomId}:`, res.data)
      return res.data
    },

    markRead: async (roomId: number, payload?: ReadChatPayload): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>(`/chat/rooms/${roomId}/read`, payload || {})
      console.log(`📢 [API] Đánh dấu đã đọc phòng chat ID ${roomId}:`, res.data)
      return res.data
    },

    getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
      const res = await httpClient.get<ApiResponse<{ unreadCount: number }>>('/chat/unread-count')
      console.log('📢 [API] Lấy số tin nhắn chat chưa đọc:', res.data)
      return res.data
    },

    downloadAttachmentBlob: async (attachmentId: number): Promise<Blob> => {
      const res = await httpClient.get(`/chat/attachments/${attachmentId}`, {
        responseType: 'blob',
      })
      return res.data
    },

    previewAttachmentBlob: async (attachmentId: number): Promise<Blob> => {
      const res = await httpClient.get(`/chat/attachments/${attachmentId}/preview`, {
        responseType: 'blob',
      })
      return res.data
    },
  },

  // ── NHÓM 20: SYSTEM ADMIN (/api/v1/admin) ────────────────────────────────────
  admin: {
    listUsers: async (query?: ListAdminUsersQuery): Promise<ApiResponse<PaginatedData<AdminUserData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<AdminUserData>>>('/admin/users', { params: query })
      console.log('📢 [API] Admin lấy danh sách người dùng toàn hệ thống:', res.data)
      return res.data
    },

    createUser: async (payload: RegisterPayload): Promise<ApiResponse<{ userId: number; systemRole: string }>> => {
      const res = await httpClient.post<ApiResponse<{ userId: number; systemRole: string }>>('/admin/users', payload)
      console.log('📢 [API] Admin tạo người dùng mới:', res.data)
      return res.data
    },

    listRoles: async (): Promise<ApiResponse<SystemRoleData[]>> => {
      const res = await httpClient.get<ApiResponse<SystemRoleData[]>>('/admin/roles')
      console.log('📢 [API] Admin lấy danh mục vai trò hệ thống:', res.data)
      return res.data
    },

    updateUserRole: async (userId: number, role: 'ADMIN' | 'USER'): Promise<ApiResponse<{ userId: number; systemRole: string }>> => {
      const res = await httpClient.put<ApiResponse<{ userId: number; systemRole: string }>>(`/admin/users/${userId}/role`, { role })
      console.log(`📢 [API] Admin cập nhật vai trò người dùng ${userId}:`, res.data)
      return res.data
    },

    getConfig: async (): Promise<ApiResponse<SystemConfigData>> => {
      const res = await httpClient.get<ApiResponse<SystemConfigData>>('/admin/system-config')
      console.log('📢 [API] Admin lấy cấu hình hệ thống:', res.data)
      return res.data
    },

    updateConfig: async (values: Record<string, string>): Promise<ApiResponse<SystemConfigData>> => {
      const res = await httpClient.put<ApiResponse<SystemConfigData>>('/admin/system-config', { values })
      console.log('📢 [API] Admin cập nhật cấu hình hệ thống:', res.data)
      return res.data
    },

    activityLogs: async (page: number = 1, pageSize: number = 20): Promise<ApiResponse<PaginatedData<ActivityLogItem>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<ActivityLogItem>>>('/admin/activity-logs', {
        params: { page, pageSize },
      })
      console.log('📢 [API] Admin lấy nhật ký kiểm toán hệ thống:', res.data)
      return res.data
    },
  },

  // ── NHÓM 21: PERMISSIONS (/api/v1/me/permissions) ────────────────────────────
  permissions: {
    getMePermissions: async (projectId?: number): Promise<ApiResponse<PermissionsData>> => {
      const res = await httpClient.get<ApiResponse<PermissionsData>>('/me/permissions', {
        params: { projectId },
      })
      console.log('📢 [API] Lấy quyền hạn thực tế của người dùng:', res.data)
      return res.data
    },
  },
}

export default api
