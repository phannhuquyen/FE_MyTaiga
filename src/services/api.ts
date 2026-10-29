/**
 * src/services/api.ts
 * TẬP TRUNG TẤT CẢ CÁC API CỦA HỆ THỐNG TRONG MỘT FILE DUY NHẤT.
 *
 * Quy tắc kiến trúc:
 * 1. Biến API_ROOT lưu địa chỉ gốc của Backend. Khi đổi host/port chỉ cần sửa biến này.
 * 2. Không log response payload vì có thể chứa token hoặc dữ liệu cá nhân.
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
    const currentToken = tokenStorage.get()
    const requestAuthorization = error.config?.headers?.Authorization
    if (error.response?.status === 401 && currentToken &&
      (!requestAuthorization || requestAuthorization === `Bearer ${currentToken}`)) {
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
  color?: string | null
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
  color?: string | null
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

export interface PersonSummary {
  userId: number
  fullName: string
  avatarCode: string
  avatarUrl: string | null
  role: string | null
}

export interface TaskExtra {
  assignee?: PersonSummary | null
  assigneeName?: string | null
  assigneeAvatarCode?: string | null
  assigneeRole?: string | null
  reporterName?: string | null
  epicTitle?: string | null
  epicColor?: string | null
  tags?: string[]
  storyPoints?: number | null
}

export interface DirectoryUserData {
  userId: number
  fullName: string
  email: string
  avatarUrl: string | null
}

export interface TaskData extends TaskExtra {
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
  tags?: string[]
  storyPoints?: number | null
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
  tags?: string[]
  storyPoints?: number | null
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

export interface BoardTaskCard extends TaskExtra {
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
  sprintName: string
  status: string
  startDate: string
  endDate: string
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

export interface BugData extends TaskExtra {
  taskTitle?: string | null
  taskCode?: string | null
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
  task: { taskId: number; title: string; status: string; sprintId: number | null }
  taskComments: { total: number; items: { commentId: number; userId: number; content: string; createdAt: string; updatedAt: string | null }[] }
  taskAttachments: { total: number; items: { attachmentId: number; fileName: string; fileSize: number; uploadedBy: number; uploadedAt: string }[] }
  history: { total: number; items: { activityLogId: number; userId: number; action: string; description: string; createdAt: string }[] }
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
  authorName?: string
  authorAvatarCode?: string
  authorRole?: string | null
  isEditable?: boolean
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
  originalFileName?: string
  uploadedByName?: string
  mimeType?: string
  fileSizeBytes?: number
  url?: string | null
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
  actorName?: string | null
  actorAvatarCode?: string | null
  actorRole?: string | null
  actorUnknown?: boolean
  targetTitle?: string | null
  isUrgent?: boolean
  notificationId: number
  title: string
  content: string | null
  type: string
  refType: string | null
  refId: number | null
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
  userName?: string | null
  userAvatarCode?: string | null
  userRole?: string | null
  entityTitle?: string | null
  isSystemAction?: boolean
  changes?: Record<string, { from: unknown; to: unknown }> | null
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
}

export interface ChatAttachmentData {
  originalFileName?: string
  mimeType?: string
  fileSizeBytes?: number
  previewUrl?: string | null
  url?: string | null
  messageAttachmentId: number
  fileName: string
  fileSize: number
  downloadUrl: string
}

export interface ChatMessageData {
  senderName?: string | null
  senderAvatarCode?: string | null
  senderRole?: string | null
  isEdited?: boolean
  editedAt?: string | null
  replyToMessageId?: number | null
  isEditable?: boolean
  messageId: number
  chatRoomId: number
  senderId: number
  content: string | null
  sentAt: string
  attachments?: ChatAttachmentData[]
}

export interface ChatMessagesData {
  items: ChatMessageData[]
  hasMore: boolean
  nextBefore: number | null
}

export interface ChatRoomData {
  otherParticipantName?: string | null
  otherParticipantAvatarCode?: string | null
  otherParticipantStatus?: 'ONLINE' | 'OFFLINE'
  participantsCount?: number
  lastMessageSenderName?: string | null
  chatRoomId: number
  roomType: 'PRIVATE' | 'GROUP'
  roomName: string | null
  projectId: number | null
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
  replyToMessageId?: number
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

export interface SystemConfigEntry {
  configKey: string
  configValue: string
  description: string | null
  updatedAt: string | null
}

export type SystemConfigData = SystemConfigEntry[]

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
      return res.data
    },

    logout: async (): Promise<ApiResponse<null>> => {
      const token = tokenStorage.get()
      const res = await httpClient.post<ApiResponse<null>>('/auth/logout', undefined, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      return res.data
    },

    register: async (payload: RegisterPayload): Promise<ApiResponse<RegisterResultData>> => {
      const res = await httpClient.post<ApiResponse<RegisterResultData>>('/auth/register', payload)
      return res.data
    },

    forgotPassword: async (payload: ForgotPasswordPayload): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>('/auth/forgot-password', payload)
      return res.data
    },

    resetPassword: async (payload: ResetPasswordPayload): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>('/auth/reset-password', payload)
      return res.data
    },

    changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>('/auth/change-password', payload)
      return res.data
    },
  },

  // ── NHÓM 2: USERS / PROFILE (/api/v1/users) ────────────────────────────────
  users: {
    search: async (query?: { keyword?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedData<DirectoryUserData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<DirectoryUserData>>>('/users', { params: query })
      return res.data
    },
    getMe: async (): Promise<ApiResponse<UserProfileData>> => {
      const res = await httpClient.get<ApiResponse<UserProfileData>>('/users/me')
      return res.data
    },

    updateMe: async (payload: UpdateProfilePayload): Promise<ApiResponse<UpdateProfileResultData>> => {
      const res = await httpClient.put<ApiResponse<UpdateProfileResultData>>('/users/me', payload)
      return res.data
    },

    uploadAvatar: async (file: File): Promise<ApiResponse<UpdateAvatarResultData>> => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await httpClient.put<ApiResponse<UpdateAvatarResultData>>('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
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
      return res.data
    },

    unlockUser: async (userId: number): Promise<ApiResponse<LockUnlockUserResultData>> => {
      const res = await httpClient.patch<ApiResponse<LockUnlockUserResultData>>(`/admin/users/${userId}/unlock`)
      return res.data
    },
  },

  // ── NHÓM 4: PROJECTS (/api/v1/projects) ─────────────────────────────────────
  projects: {
    create: async (payload: ProjectRequest): Promise<ApiResponse<ProjectData>> => {
      const res = await httpClient.post<ApiResponse<ProjectData>>('/projects', payload)
      return res.data
    },

    list: async (query?: ListProjectsQuery): Promise<ApiResponse<PaginatedData<ProjectData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<ProjectData>>>('/projects', { params: query })
      return res.data
    },

    get: async (projectId: number): Promise<ApiResponse<ProjectData>> => {
      const res = await httpClient.get<ApiResponse<ProjectData>>(`/projects/${projectId}`)
      return res.data
    },

    update: async (projectId: number, payload: ProjectRequest): Promise<ApiResponse<ProjectData>> => {
      const res = await httpClient.put<ApiResponse<ProjectData>>(`/projects/${projectId}`, payload)
      return res.data
    },

    close: async (projectId: number): Promise<ApiResponse<ProjectData>> => {
      const res = await httpClient.patch<ApiResponse<ProjectData>>(`/projects/${projectId}/close`)
      return res.data
    },

    delete: async (projectId: number): Promise<ApiResponse<ProjectData>> => {
      const res = await httpClient.delete<ApiResponse<ProjectData>>(`/projects/${projectId}`)
      return res.data
    },
  },

  // ── NHÓM 5: PROJECT MEMBERS (/api/v1/projects/{projectId}/members) ───────────
  projectMembers: {
    list: async (projectId: number, query?: ListProjectMembersQuery): Promise<ApiResponse<PaginatedData<ProjectMemberData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<ProjectMemberData>>>(`/projects/${projectId}/members`, { params: query })
      return res.data
    },

    add: async (projectId: number, payload: AddProjectMemberPayload): Promise<ApiResponse<ProjectMemberMutationResult>> => {
      const res = await httpClient.post<ApiResponse<ProjectMemberMutationResult>>(`/projects/${projectId}/members`, payload)
      return res.data
    },

    remove: async (projectId: number, userId: number): Promise<ApiResponse<ProjectMemberMutationResult>> => {
      const res = await httpClient.delete<ApiResponse<ProjectMemberMutationResult>>(`/projects/${projectId}/members/${userId}`)
      return res.data
    },

    promote: async (projectId: number, userId: number, payload: PromoteProjectMemberPayload = { role: 'MANAGER' }): Promise<ApiResponse<ProjectMemberMutationResult>> => {
      const res = await httpClient.patch<ApiResponse<ProjectMemberMutationResult>>(`/projects/${projectId}/members/${userId}/role`, payload)
      return res.data
    },
  },

  // ── NHÓM 6: PROJECT DEPARTMENTS (/api/v1/projects/{projectId}/departments) ──
  projectDepartments: {
    list: async (projectId: number, page: number = 1, pageSize: number = 20): Promise<ApiResponse<PaginatedData<DepartmentData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<DepartmentData>>>(`/projects/${projectId}/departments`, {
        params: { page, pageSize },
      })
      return res.data
    },

    create: async (projectId: number, payload: DepartmentRequest): Promise<ApiResponse<DepartmentMutationResult>> => {
      const res = await httpClient.post<ApiResponse<DepartmentMutationResult>>(`/projects/${projectId}/departments`, payload)
      return res.data
    },

    update: async (projectId: number, departmentId: number, payload: DepartmentRequest): Promise<ApiResponse<DepartmentMutationResult>> => {
      const res = await httpClient.put<ApiResponse<DepartmentMutationResult>>(`/projects/${projectId}/departments/${departmentId}`, payload)
      return res.data
    },

    delete: async (projectId: number, departmentId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/projects/${projectId}/departments/${departmentId}`)
      return res.data
    },

    assignMember: async (projectId: number, userId: number, payload: AssignDepartmentPayload): Promise<ApiResponse<AssignDepartmentResult>> => {
      const res = await httpClient.patch<ApiResponse<AssignDepartmentResult>>(`/projects/${projectId}/members/${userId}/department`, payload)
      return res.data
    },
  },

  // ── NHÓM 7: EPICS (/api/v1/projects/{projectId}/epics & /api/v1/epics) ───────
  epics: {
    list: async (projectId: number, query?: ListEpicsQuery): Promise<ApiResponse<PaginatedData<EpicData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<EpicData>>>(`/projects/${projectId}/epics`, { params: query })
      return res.data
    },

    create: async (projectId: number, payload: EpicRequest): Promise<ApiResponse<EpicData>> => {
      const res = await httpClient.post<ApiResponse<EpicData>>(`/projects/${projectId}/epics`, payload)
      return res.data
    },

    get: async (epicId: number): Promise<ApiResponse<EpicData>> => {
      const res = await httpClient.get<ApiResponse<EpicData>>(`/epics/${epicId}`)
      return res.data
    },

    update: async (epicId: number, payload: EpicRequest): Promise<ApiResponse<EpicData>> => {
      const res = await httpClient.put<ApiResponse<EpicData>>(`/epics/${epicId}`, payload)
      return res.data
    },

    delete: async (epicId: number): Promise<ApiResponse<EpicData>> => {
      const res = await httpClient.delete<ApiResponse<EpicData>>(`/epics/${epicId}`)
      return res.data
    },

    progress: async (epicId: number): Promise<ApiResponse<EpicProgressData>> => {
      const res = await httpClient.get<ApiResponse<EpicProgressData>>(`/epics/${epicId}/progress`)
      return res.data
    },

    linkPbi: async (pbiId: number, payload: LinkEpicPayload): Promise<ApiResponse<{ itemId: number; epicId: number }>> => {
      const res = await httpClient.patch<ApiResponse<{ itemId: number; epicId: number }>>(`/pbis/${pbiId}/epic`, payload)
      return res.data
    },

    linkProductBacklogItem: async (pbiId: number, payload: LinkEpicPayload): Promise<ApiResponse<{ itemId: number; epicId: number }>> => {
      const res = await httpClient.patch<ApiResponse<{ itemId: number; epicId: number }>>(`/product-backlog-items/${pbiId}/epic`, payload)
      return res.data
    },

    linkTask: async (taskId: number, payload: LinkEpicPayload): Promise<ApiResponse<{ itemId: number; epicId: number }>> => {
      const res = await httpClient.patch<ApiResponse<{ itemId: number; epicId: number }>>(`/tasks/${taskId}/epic`, payload)
      return res.data
    },
  },

  // ── NHÓM 8: PRODUCT BACKLOG (/api/v1/product-backlog-items) ─────────────────
  productBacklog: {
    list: async (query: ListBacklogQuery): Promise<ApiResponse<PaginatedData<ProductBacklogItemData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<ProductBacklogItemData>>>('/product-backlog-items', { params: query })
      return res.data
    },

    create: async (payload: BacklogRequest): Promise<ApiResponse<ProductBacklogItemData>> => {
      const res = await httpClient.post<ApiResponse<ProductBacklogItemData>>('/product-backlog-items', payload)
      return res.data
    },

    get: async (pbiId: number): Promise<ApiResponse<ProductBacklogItemData>> => {
      const res = await httpClient.get<ApiResponse<ProductBacklogItemData>>(`/product-backlog-items/${pbiId}`)
      return res.data
    },

    update: async (pbiId: number, payload: BacklogRequest): Promise<ApiResponse<ProductBacklogItemData>> => {
      const res = await httpClient.put<ApiResponse<ProductBacklogItemData>>(`/product-backlog-items/${pbiId}`, payload)
      return res.data
    },

    delete: async (pbiId: number): Promise<ApiResponse<ProductBacklogItemData>> => {
      const res = await httpClient.delete<ApiResponse<ProductBacklogItemData>>(`/product-backlog-items/${pbiId}`)
      return res.data
    },

    changePriority: async (pbiId: number, payload: ChangePriorityPayload): Promise<ApiResponse<ProductBacklogItemData>> => {
      const res = await httpClient.patch<ApiResponse<ProductBacklogItemData>>(`/product-backlog-items/${pbiId}/priority`, payload)
      return res.data
    },

    reorder: async (payload: BacklogOrderPayload): Promise<ApiResponse<{ epicId: number; pbiIds: number[] }>> => {
      const res = await httpClient.put<ApiResponse<{ epicId: number; pbiIds: number[] }>>('/product-backlog-items/order', payload)
      return res.data
    },
  },

  // ── NHÓM 9: SPRINTS (/api/v1/sprints) ───────────────────────────────────────
  sprints: {
    list: async (query: ListSprintsQuery): Promise<ApiResponse<PaginatedData<SprintData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<SprintData>>>('/sprints', { params: query })
      return res.data
    },

    create: async (payload: SprintRequest): Promise<ApiResponse<SprintData>> => {
      const res = await httpClient.post<ApiResponse<SprintData>>('/sprints', payload)
      return res.data
    },

    get: async (sprintId: number): Promise<ApiResponse<SprintData>> => {
      const res = await httpClient.get<ApiResponse<SprintData>>(`/sprints/${sprintId}`)
      return res.data
    },

    update: async (sprintId: number, payload: SprintRequest): Promise<ApiResponse<SprintData>> => {
      const res = await httpClient.put<ApiResponse<SprintData>>(`/sprints/${sprintId}`, payload)
      return res.data
    },

    delete: async (sprintId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/sprints/${sprintId}`)
      return res.data
    },

    start: async (sprintId: number): Promise<ApiResponse<SprintData>> => {
      const res = await httpClient.post<ApiResponse<SprintData>>(`/sprints/${sprintId}/start`)
      return res.data
    },

    close: async (sprintId: number): Promise<ApiResponse<SprintData>> => {
      const res = await httpClient.post<ApiResponse<SprintData>>(`/sprints/${sprintId}/close`)
      return res.data
    },

    addBacklogItems: async (sprintId: number, payload: AddPbisToSprintPayload): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>(`/sprints/${sprintId}/backlog-items`, payload)
      return res.data
    },

    getBacklogItems: async (sprintId: number): Promise<ApiResponse<SprintProgressData>> => {
      const res = await httpClient.get<ApiResponse<SprintProgressData>>(`/sprints/${sprintId}/backlog-items`)
      return res.data
    },

    removeBacklogItem: async (sprintId: number, pbiId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/sprints/${sprintId}/backlog-items/${pbiId}`)
      return res.data
    },

    progress: async (sprintId: number): Promise<ApiResponse<SprintProgressData>> => {
      const res = await httpClient.get<ApiResponse<SprintProgressData>>(`/sprints/${sprintId}/progress`)
      return res.data
    },

    burndown: async (sprintId: number): Promise<ApiResponse<SprintBurndownData>> => {
      const res = await httpClient.get<ApiResponse<SprintBurndownData>>(`/sprints/${sprintId}/burndown`)
      return res.data
    },
  },

  // ── NHÓM 10: TASKS & SUBTASKS (/api/v1/projects/{projectId}/tasks & /api/v1/tasks) ──
  tasks: {
    list: async (projectId: number, query?: ListTasksQuery): Promise<ApiResponse<PaginatedData<TaskData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<TaskData>>>(`/projects/${projectId}/tasks`, { params: query })
      return res.data
    },

    create: async (projectId: number, payload: TaskCreatePayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.post<ApiResponse<TaskData>>(`/projects/${projectId}/tasks`, payload)
      return res.data
    },

    get: async (taskId: number): Promise<ApiResponse<TaskDetailData>> => {
      const res = await httpClient.get<ApiResponse<TaskDetailData>>(`/tasks/${taskId}`)
      return res.data
    },

    update: async (taskId: number, payload: TaskUpdatePayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.put<ApiResponse<TaskData>>(`/tasks/${taskId}`, payload)
      return res.data
    },

    delete: async (taskId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/tasks/${taskId}`)
      return res.data
    },

    createSubtask: async (taskId: number, payload: TaskCreatePayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.post<ApiResponse<TaskData>>(`/tasks/${taskId}/subtasks`, payload)
      return res.data
    },

    assign: async (taskId: number, payload: AssignTaskPayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.patch<ApiResponse<TaskData>>(`/tasks/${taskId}/assignee`, payload)
      return res.data
    },

    changePriority: async (taskId: number, payload: TaskPriorityPayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.patch<ApiResponse<TaskData>>(`/tasks/${taskId}/priority`, payload)
      return res.data
    },

    setDeadline: async (taskId: number, payload: TaskDeadlinePayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.patch<ApiResponse<TaskData>>(`/tasks/${taskId}/deadline`, payload)
      return res.data
    },

    updateProgress: async (taskId: number, payload: TaskProgressPayload): Promise<ApiResponse<TaskData>> => {
      const res = await httpClient.patch<ApiResponse<TaskData>>(`/tasks/${taskId}/progress`, payload)
      return res.data
    },

    getOverdue: async (projectId: number, page: number = 1, pageSize: number = 20): Promise<ApiResponse<PaginatedData<TaskData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<TaskData>>>(`/projects/${projectId}/tasks/overdue`, {
        params: { page, pageSize },
      })
      return res.data
    },

    getDeadlineAlerts: async (projectId: number, page: number = 1, pageSize: number = 20): Promise<ApiResponse<DeadlineAlertsData>> => {
      const res = await httpClient.get<ApiResponse<DeadlineAlertsData>>(`/projects/${projectId}/tasks/deadline-alerts`, {
        params: { page, pageSize },
      })
      return res.data
    },
  },

  // ── NHÓM 11: BOARD & KANBAN (/api/v1/projects/{projectId}/board & /api/v1/tasks/{taskId}/move) ──
  board: {
    get: async (projectId: number, query?: BoardFilterQuery): Promise<ApiResponse<BoardData>> => {
      const res = await httpClient.get<ApiResponse<BoardData>>(`/projects/${projectId}/board`, { params: query })
      return res.data
    },

    move: async (taskId: number, payload: MoveTaskPayload): Promise<ApiResponse<MoveTaskResult>> => {
      const res = await httpClient.patch<ApiResponse<MoveTaskResult>>(`/tasks/${taskId}/move`, payload)
      return res.data
    },
  },

  // ── NHÓM 12: WIP LIMITS (/api/v1/projects/{projectId}/wip) ───────────────────
  wip: {
    get: async (projectId: number): Promise<ApiResponse<WipStatusData>> => {
      const res = await httpClient.get<ApiResponse<WipStatusData>>(`/projects/${projectId}/wip`)
      return res.data
    },

    getAlerts: async (projectId: number): Promise<ApiResponse<WipStatusData>> => {
      const res = await httpClient.get<ApiResponse<WipStatusData>>(`/projects/${projectId}/wip/alerts`)
      return res.data
    },

    setLimit: async (projectId: number, columnId: number, payload: WipLimitPayload): Promise<ApiResponse<WipLimitResult>> => {
      const res = await httpClient.put<ApiResponse<WipLimitResult>>(`/projects/${projectId}/board/columns/${columnId}/wip-limit`, payload)
      return res.data
    },

    removeLimit: async (projectId: number, columnId: number): Promise<ApiResponse<WipLimitResult>> => {
      const res = await httpClient.delete<ApiResponse<WipLimitResult>>(`/projects/${projectId}/board/columns/${columnId}/wip-limit`)
      return res.data
    },
  },

  // ── NHÓM 13: FLOW METRICS (/api/v1/projects/{projectId}/flow-metrics) ────────
  flowMetrics: {
    wip: async (projectId: number, sprintId?: number): Promise<ApiResponse<FlowWipData>> => {
      const res = await httpClient.get<ApiResponse<FlowWipData>>(`/projects/${projectId}/flow-metrics/wip`, {
        params: { sprintId },
      })
      return res.data
    },

    throughput: async (projectId: number, query?: { from?: string; to?: string; sprintId?: number }): Promise<ApiResponse<ThroughputData>> => {
      const res = await httpClient.get<ApiResponse<ThroughputData>>(`/projects/${projectId}/flow-metrics/throughput`, {
        params: query,
      })
      return res.data
    },

    throughputSprints: async (projectId: number, query?: { from?: string; to?: string; page?: number; pageSize?: number }): Promise<ApiResponse<SprintsThroughputData>> => {
      const res = await httpClient.get<ApiResponse<SprintsThroughputData>>(`/projects/${projectId}/flow-metrics/throughput/sprints`, {
        params: query,
      })
      return res.data
    },

    cycleTime: async (projectId: number, query?: { sprintId?: number; page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedData<CycleTimeItem>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<CycleTimeItem>>>(`/projects/${projectId}/flow-metrics/cycle-time`, {
        params: query,
      })
      return res.data
    },

    cycleTimeAverage: async (projectId: number, sprintId?: number): Promise<ApiResponse<CycleTimeAverageData>> => {
      const res = await httpClient.get<ApiResponse<CycleTimeAverageData>>(`/projects/${projectId}/flow-metrics/cycle-time/average`, {
        params: { sprintId },
      })
      return res.data
    },

    workItemAge: async (projectId: number, query?: { sprintId?: number; minAgeDays?: number; page?: number; pageSize?: number }): Promise<ApiResponse<WorkItemAgeData>> => {
      const res = await httpClient.get<ApiResponse<WorkItemAgeData>>(`/projects/${projectId}/flow-metrics/work-item-age`, {
        params: query,
      })
      return res.data
    },
  },

  // ── NHÓM 14: BUGS (/api/v1/projects/{projectId}/bugs & /api/v1/bugs) ──────────
  bugs: {
    list: async (projectId: number, query?: ListBugsQuery): Promise<ApiResponse<PaginatedData<BugData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<BugData>>>(`/projects/${projectId}/bugs`, { params: query })
      return res.data
    },

    create: async (payload: BugCreatePayload): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.post<ApiResponse<BugData>>('/bugs', payload)
      return res.data
    },

    createForTask: async (taskId: number, payload: Omit<BugCreatePayload, 'taskId'>): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.post<ApiResponse<BugData>>(`/tasks/${taskId}/bugs`, payload)
      return res.data
    },

    get: async (bugId: number): Promise<ApiResponse<BugDetailData>> => {
      const res = await httpClient.get<ApiResponse<BugDetailData>>(`/bugs/${bugId}`)
      return res.data
    },

    update: async (bugId: number, payload: BugUpdatePayload): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.put<ApiResponse<BugData>>(`/bugs/${bugId}`, payload)
      return res.data
    },

    delete: async (bugId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/bugs/${bugId}`)
      return res.data
    },

    assign: async (bugId: number, payload: BugAssigneePayload): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.patch<ApiResponse<BugData>>(`/bugs/${bugId}/assignee`, payload)
      return res.data
    },

    changePriority: async (bugId: number, payload: BugPriorityPayload): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.patch<ApiResponse<BugData>>(`/bugs/${bugId}/priority`, payload)
      return res.data
    },

    changeStatus: async (bugId: number, payload: BugStatusPayload): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.patch<ApiResponse<BugData>>(`/bugs/${bugId}/status`, payload)
      return res.data
    },

    close: async (bugId: number): Promise<ApiResponse<BugData>> => {
      const res = await httpClient.post<ApiResponse<BugData>>(`/bugs/${bugId}/close`)
      return res.data
    },
  },

  // ── NHÓM 15: COMMENTS (/api/v1/tasks/{taskId}/comments & /api/v1/comments) ───
  comments: {
    listByTask: async (taskId: number, page: number = 1, pageSize: number = 20): Promise<ApiResponse<PaginatedData<CommentData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<CommentData>>>(`/tasks/${taskId}/comments`, {
        params: { page, pageSize },
      })
      return res.data
    },

    createForTask: async (taskId: number, payload: CommentPayload): Promise<ApiResponse<CommentData>> => {
      const res = await httpClient.post<ApiResponse<CommentData>>(`/tasks/${taskId}/comments`, payload)
      return res.data
    },

    get: async (commentId: number): Promise<ApiResponse<CommentData>> => {
      const res = await httpClient.get<ApiResponse<CommentData>>(`/comments/${commentId}`)
      return res.data
    },

    update: async (commentId: number, payload: CommentPayload): Promise<ApiResponse<CommentData>> => {
      const res = await httpClient.put<ApiResponse<CommentData>>(`/comments/${commentId}`, payload)
      return res.data
    },

    delete: async (commentId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/comments/${commentId}`)
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
      return res.data
    },

    listByTask: async (taskId: number, page: number = 1, pageSize: number = 20): Promise<ApiResponse<PaginatedData<AttachmentData>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<AttachmentData>>>(`/tasks/${taskId}/attachments`, {
        params: { page, pageSize },
      })
      return res.data
    },

    get: async (attachmentId: number): Promise<ApiResponse<AttachmentData>> => {
      const res = await httpClient.get<ApiResponse<AttachmentData>>(`/attachments/${attachmentId}`)
      return res.data
    },

    delete: async (attachmentId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/attachments/${attachmentId}`)
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
      return res.data
    },

    getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
      const res = await httpClient.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count')
      return res.data
    },

    markAsRead: async (notificationId: number): Promise<ApiResponse<NotificationData>> => {
      const res = await httpClient.patch<ApiResponse<NotificationData>>(`/notifications/${notificationId}/read`)
      return res.data
    },

    markAllAsRead: async (): Promise<ApiResponse<{ updated: number }>> => {
      const res = await httpClient.patch<ApiResponse<{ updated: number }>>('/notifications/read-all')
      return res.data
    },
  },

  // ── NHÓM 18: ACTIVITY LOGS (/api/v1/projects/{projectId}/activity-logs) ──────
  activityLogs: {
    listByProject: async (projectId: number, query?: ListActivityLogsQuery): Promise<ApiResponse<PaginatedData<ActivityLogItem>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<ActivityLogItem>>>(`/projects/${projectId}/activity-logs`, { params: query })
      return res.data
    },
  },

  // ── NHÓM 19: CHAT & REALTIME (/api/v1/chat) ──────────────────────────────────
  chat: {
    editMessage: async (roomId: number, messageId: number, content: string): Promise<ApiResponse<ChatMessageData>> => {
      const res = await httpClient.put<ApiResponse<ChatMessageData>>(`/chat/rooms/${roomId}/messages/${messageId}`, { content })
      return res.data
    },
    listRooms: async (): Promise<ApiResponse<ChatRoomData[]>> => {
      const res = await httpClient.get<ApiResponse<ChatRoomData[]>>('/chat/rooms')
      return res.data
    },

    createRoom: async (payload: CreateRoomPayload): Promise<ApiResponse<{ chatRoomId: number }>> => {
      const res = await httpClient.post<ApiResponse<{ chatRoomId: number }>>('/chat/rooms', payload)
      return res.data
    },

    listParticipants: async (roomId: number): Promise<ApiResponse<ChatParticipantData[]>> => {
      const res = await httpClient.get<ApiResponse<ChatParticipantData[]>>(`/chat/rooms/${roomId}/participants`)
      return res.data
    },

    addParticipants: async (roomId: number, userIds: number[]): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>(`/chat/rooms/${roomId}/participants`, { userIds })
      return res.data
    },

    removeParticipant: async (roomId: number, userId: number): Promise<ApiResponse<null>> => {
      const res = await httpClient.delete<ApiResponse<null>>(`/chat/rooms/${roomId}/participants/${userId}`)
      return res.data
    },

    listMessages: async (roomId: number, query?: ListMessagesQuery): Promise<ApiResponse<ChatMessagesData>> => {
      const res = await httpClient.get<ApiResponse<ChatMessagesData>>(`/chat/rooms/${roomId}/messages`, { params: query })
      return res.data
    },

    sendMessage: async (roomId: number, payload: SendMessagePayload, files?: File[]): Promise<ApiResponse<ChatMessageData>> => {
      if (files && files.length > 0) {
        const formData = new FormData()
        if (payload.content) formData.append('content', payload.content)
        if (payload.replyToMessageId) formData.append('replyToMessageId', String(payload.replyToMessageId))
        files.forEach((f) => formData.append('files', f))
        const res = await httpClient.post<ApiResponse<ChatMessageData>>(`/chat/rooms/${roomId}/messages`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        return res.data
      }
      const res = await httpClient.post<ApiResponse<ChatMessageData>>(`/chat/rooms/${roomId}/messages`, payload)
      return res.data
    },

    markRead: async (roomId: number, payload?: ReadChatPayload): Promise<ApiResponse<null>> => {
      const res = await httpClient.post<ApiResponse<null>>(`/chat/rooms/${roomId}/read`, payload || {})
      return res.data
    },

    getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
      const res = await httpClient.get<ApiResponse<{ unreadCount: number }>>('/chat/unread-count')
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
      return res.data
    },

    createUser: async (payload: RegisterPayload): Promise<ApiResponse<{ userId: number; systemRole: string }>> => {
      const res = await httpClient.post<ApiResponse<{ userId: number; systemRole: string }>>('/admin/users', payload)
      return res.data
    },

    listRoles: async (): Promise<ApiResponse<SystemRoleData[]>> => {
      const res = await httpClient.get<ApiResponse<SystemRoleData[]>>('/admin/roles')
      return res.data
    },

    updateUserRole: async (userId: number, role: 'ADMIN' | 'USER'): Promise<ApiResponse<{ userId: number; systemRole: string }>> => {
      const res = await httpClient.put<ApiResponse<{ userId: number; systemRole: string }>>(`/admin/users/${userId}/role`, { role })
      return res.data
    },

    getConfig: async (): Promise<ApiResponse<SystemConfigData>> => {
      const res = await httpClient.get<ApiResponse<SystemConfigData>>('/admin/system-config')
      return res.data
    },

    updateConfig: async (values: Record<string, string>): Promise<ApiResponse<null>> => {
      const res = await httpClient.put<ApiResponse<null>>('/admin/system-config', { values })
      return res.data
    },

    activityLogs: async (page: number = 1, pageSize: number = 20): Promise<ApiResponse<PaginatedData<ActivityLogItem>>> => {
      const res = await httpClient.get<ApiResponse<PaginatedData<ActivityLogItem>>>('/admin/activity-logs', {
        params: { page, pageSize },
      })
      return res.data
    },
  },

  // ── NHÓM 21: PERMISSIONS (/api/v1/me/permissions) ────────────────────────────
  permissions: {
    getMePermissions: async (projectId?: number): Promise<ApiResponse<PermissionsData>> => {
      const res = await httpClient.get<ApiResponse<PermissionsData>>('/me/permissions', {
        params: { projectId },
      })
      return res.data
    },
  },
}

export default api
