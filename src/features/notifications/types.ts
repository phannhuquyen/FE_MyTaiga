export type NotificationCategory =
  | 'all'
  | 'unread'
  | 'mention'
  | 'deadline_wip'
  | 'system'

export type NotificationType =
  | 'mention'
  | 'wip_alert'
  | 'attachment'
  | 'bug'
  | 'deadline'
  | 'sprint'

export interface NotificationActor {
  name: string
  avatar: string
  role?: string
  email?: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  category: NotificationType
  categoryLabel: string
  actor: NotificationActor
  targetCode?: string
  targetType?: 'task' | 'bug' | 'board' | 'sprint' | 'attachment'
  targetLink?: string
  timestamp: string
  createdAt: string
  isRead: boolean
  isUrgent?: boolean
  urgencyDetails?: {
    reason: string
    timeLeft?: string
    daysOverdue?: number
    currentWip?: number
    maxWip?: number
    sprintName?: string
  }
}

export interface NotificationFilterOptions {
  category?: NotificationCategory
  search?: string
  projectId?: string
  timeRange?: '7d' | '14d' | '30d' | 'all'
}

export interface ActivityItem {
  id: string
  dateGroup: string
  dateString: string
  time: string
  actor: {
    name: string
    avatar: string
    role: string
    isBot?: boolean
  }
  actionType:
    | 'task_complete'
    | 'mention_comment'
    | 'wip_warning'
    | 'bug_report'
    | 'system_alert'
    | 'epic_link'
  summaryHtml?: string
  title: string
  targetCode?: string
  quote?: string
  badge?: {
    text: string
    variant: 'success' | 'warning' | 'danger' | 'info' | 'primary'
  }
  metaInfo?: string
  warningBanner?: string
  linkedCodes?: string[]
}
