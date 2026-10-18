/**
 * Types for the Dashboard (Tổng quan dự án) feature.
 */

export type TaskType = 'Task' | 'Story' | 'Bug'

export type TaskStatus =
  | 'Cần làm'
  | 'Đang làm'
  | 'Sẵn sàng Test'
  | 'Chờ duyệt'
  | 'Hoàn thành'

export type TaskPriority = 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp'

export interface DoDItem {
  id: string
  content: string
  completed: boolean
}

export interface TaskComment {
  id: string
  author: string
  authorAvatar?: string
  content: string
  timeAgo: string
  createdAt: string
}

export interface TaskItem {
  id: string
  code: string // e.g., 'SB-104'
  title: string
  type: TaskType
  status: TaskStatus
  dueDate: string // e.g., 'Hôm nay', '18/11'
  storyPoints?: number
  estimatedHours?: number
  assignee: {
    name: string
    avatarCode: string
    role: string
  }
  sprint: string
  priority: TaskPriority
  dod: DoDItem[]
  comments: TaskComment[]
}

export interface ActivityItem {
  id: string
  author: string
  avatarCode: string
  action: string
  targetCode?: string
  targetTitle?: string
  targetState?: string
  timeAgo: string
}

export interface SprintInfo {
  id: string
  name: string
  number: number
  status: 'Đang diễn ra' | 'Sắp tới' | 'Đã hoàn thành'
  daysLeft: number
  goal: string
  committedPoints: number
  completedPoints: number
  wipCount: number
}

export interface ProjectInfo {
  id: string
  code: string
  name: string
  role: string
  startDate: string
  endDate: string
  sprintCycle: string
  totalTasks: number
  completedTasks: number
  progressPercentage: number
}
