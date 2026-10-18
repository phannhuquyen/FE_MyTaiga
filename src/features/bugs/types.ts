export type BugSeverity = 'blocker' | 'major' | 'minor' | 'trivial'

export type BugPriority = 'p1' | 'p2' | 'p3' | 'p4'

export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export type ResolutionReason =
  | 'resolved_verified'
  | 'cannot_reproduce'
  | 'duplicate'
  | 'as_designed'

export interface BugAttachment {
  id: string
  name: string
  size: string
  type: 'image' | 'log' | 'video' | 'doc'
  url?: string
  uploadedAt: string
  uploadedBy?: string
}

export interface BugComment {
  id: string
  authorName: string
  authorRole: string
  authorAvatar?: string
  content: string
  createdAt: string
  isInternal?: boolean
}

export interface BugAssignee {
  id: string
  name: string
  email: string
  role: string
  department?: 'Dev' | 'QA' | 'DevOps'
  avatar?: string
  statusText?: string
  activeBugCount?: number
  isAvailable?: boolean
}

export interface BugItem {
  id: string
  code: string // e.g. '#BUG-104'
  title: string
  description: string
  stepsToReproduce: string
  expectedResult?: string
  actualResult?: string
  stackTrace?: string
  environment: string
  infrastructure?: {
    environment: string
    cluster: string
    cache: string
  }
  severity: BugSeverity
  priority: BugPriority
  status: BugStatus

  relatedTaskId?: string
  relatedTaskCode?: string
  relatedTaskTitle?: string

  relatedPbiId?: string
  sprintId?: string
  sprintName?: string
  epicId?: string
  epicName?: string

  assignee?: BugAssignee
  reporter: {
    id: string
    name: string
    role: string
    avatar?: string
  }

  storyPointsEstimate?: number
  discoveredAt: string
  deadline: string
  createdAt: string
  updatedAt: string

  closedAt?: string
  resolutionReason?: ResolutionReason
  resolutionNote?: string
  cycleTimeDisplay?: string

  attachments: BugAttachment[]
  comments: BugComment[]
}

export interface BugFilters {
  search?: string
  status?: string // 'all' | BugStatus
  severity?: string // 'all' | BugSeverity
  assigneeId?: string // 'all' | 'unassigned' | string
  page?: number
  pageSize?: number
}

export interface CreateBugPayload {
  title: string
  description: string
  stepsToReproduce?: string
  expectedResult?: string
  actualResult?: string
  environment: string
  severity: BugSeverity
  priority: BugPriority
  relatedTaskId?: string
  sprintId?: string
  epicId?: string
  assigneeId?: string
  attachments?: File[]
}

export interface CloseBugPayload {
  resolutionReason: ResolutionReason
  resolutionNote?: string
}

export interface StatusTransitionResult {
  allowed: boolean
  errorMessage?: string
  suggestedStatus?: BugStatus
  explanation?: string
}
