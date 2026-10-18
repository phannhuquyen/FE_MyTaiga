export type SprintStatus = 'active' | 'planned' | 'draft' | 'closed'

export interface SprintWorkItem {
  id: string
  code: string // e.g. "#SB-139"
  title: string
  assigneeName?: string
  assigneeAvatar?: string
  assigneeRole?: string
  storyPoints: number
  status: 'done' | 'in_progress' | 'review' | 'ready' | 'todo'
  epicName?: string
  priority?: 'urgent' | 'high' | 'medium' | 'low'
  criteriaCount?: string // e.g. "4/4 tiêu chí nhận nghiệm"
}

export interface BurndownDataPoint {
  dayLabel: string // e.g. "Ngày 1 (14/10)", "Ngày 2", ...
  dateStr: string
  idealRemaining: number
  actualRemaining?: number
  isToday?: boolean
}

export interface ScoreAdjustmentEvent {
  id: string
  taskCode: string
  title: string
  pointsDelta: number // e.g. -3 or +1
  dateLabel: string // e.g. "Ngày 10 • bởi Minh Quân"
}

export interface Sprint {
  id: string
  code: string // e.g. "SPR-14", "SP-2024-Q4"
  name: string // e.g. "Sprint 14: Tối ưu luồng & Đồng bộ dữ liệu"
  goal: string
  status: SprintStatus
  startDate: string // DD/MM/YYYY
  endDate: string // DD/MM/YYYY
  daysLeft?: string // e.g. "Còn 4 ngày"
  totalSP: number
  completedSP: number
  capacitySP: number
  totalItemsCount: number
  completedItemsCount: number
  remainingItemsCount: number
  progressPercent: number
  releaseVersion?: string // e.g. "v1.4.0"
  velocityAchieved?: number
  flowEfficiency?: number
  leadTimeAvgDays?: number
  membersCount: number
  items: SprintWorkItem[]
  burndownPoints?: BurndownDataPoint[]
  scoreAdjustments?: ScoreAdjustmentEvent[]
}

export interface CreateSprintPayload {
  name: string
  goal: string
  startDate: string
  endDate: string
  capacitySP: number
}

export interface UpdateSprintPayload {
  name?: string
  goal?: string
  startDate?: string
  endDate?: string
  capacitySP?: number
  status?: SprintStatus
}

export interface CloseSprintPayload {
  unfinishedResolution: 'backlog' | 'next_sprint'
  nextSprintId?: string
}
