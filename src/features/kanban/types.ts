export type KanbanColumnId = 'todo' | 'in_progress' | 'review' | 'done'

export type KanbanPriority = 'urgent' | 'high' | 'medium' | 'low'

export interface KanbanSubtask {
  id: string
  title: string
  completed: boolean
  statusLabel?: 'Xong' | 'Đang làm' | 'Chờ'
}

export interface KanbanAttachment {
  id: string
  name: string
  size: string
  uploadedBy: string
}

export interface KanbanComment {
  id: string
  authorName: string
  authorRole: string
  authorAvatar: string
  timestamp: string
  content: string
}

export interface KanbanTask {
  id: string
  code: string // e.g. "TASK-241", "CORE-201", "SCRUM-142"
  title: string
  description?: string
  columnId: KanbanColumnId
  priority: KanbanPriority
  storyPoints?: number
  deadline?: string // e.g. "Hôm nay 18:00", "28/10/2024"
  daysRemainingText?: string // e.g. "còn 3 ngày", "Hôm nay"
  isOverdue?: boolean
  assignee: {
    name: string
    avatarCode: string
    role?: string
    isCurrentUser?: boolean
  }
  creator?: {
    name: string
    role?: string
  }
  pbiId?: string
  pbiCode?: string // e.g. "#SB-142"
  pbiTitle?: string
  epicName?: string
  epicColor?: string
  tags?: string[] // e.g. ["Bảo mật", "SSO"], ["Backend", "Gateway"]
  subtasks: KanbanSubtask[]
  attachments?: KanbanAttachment[]
  comments?: KanbanComment[]
  updatedAt?: string
  order: number
}

export interface KanbanColumnConfig {
  id: KanbanColumnId
  title: string // "Cần làm", "Đang làm", "Đang kiểm tra", "Hoàn thành"
  subtitleEn: string // "To Do", "In Progress", "Testing / Review", "Done"
  colorDot: string // Tailwind color class or hex
  wipLimit: number | null // null = unlimited (∞)
  isCollapsed?: boolean
}

export interface CreateTaskPayload {
  title: string
  columnId?: KanbanColumnId
  assigneeName?: string
  priority?: KanbanPriority
  deadline?: string
  storyPoints?: number
  pbiId?: string
  description?: string
  tags?: string[]
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  columnId?: KanbanColumnId
  priority?: KanbanPriority
  deadline?: string
  assigneeName?: string
  storyPoints?: number
  tags?: string[]
  subtasks?: KanbanSubtask[]
}

export interface WIPSettingsPayload {
  limits: Record<KanbanColumnId, number | null>
}
