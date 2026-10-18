export type EpicStatus = 'in_progress' | 'open' | 'completed' | 'closed'
export type EpicPriority = 'urgent' | 'high' | 'medium' | 'low'

export interface EpicTask {
  id: string
  code: string // e.g. "TASK-301"
  title: string
  status: 'todo' | 'in_progress' | 'testing' | 'done'
  assigneeName?: string
  assigneeAvatar?: string
  parentPbiCode?: string
  parentPbiTitle?: string
}

export interface Epic {
  id: string
  code: string // e.g. "EPIC-01"
  name: string
  description: string
  status: EpicStatus
  priority: EpicPriority
  color: string // hex e.g. "#0284c7"
  targetSprint?: string // e.g. "Sprint 16 (Q3/2025)"
  sprintRange?: string // e.g. "Sprint 14 - Sprint 16"
  ownerName: string
  ownerAvatar: string
  pbisCount: number
  tasksCount: number
  completedPoints: number
  totalPoints: number
  progressPercent: number
  tasks?: EpicTask[]
  createdAt: string
  updatedAt: string
}

export interface CreateEpicPayload {
  name: string
  description?: string
  priority: EpicPriority
  color: string
}

export interface UpdateEpicPayload {
  name?: string
  description?: string
  status?: EpicStatus
  priority?: EpicPriority
  color?: string
  targetSprint?: string
}

export interface EpicProgressBreakdown {
  status: string
  statusKey: 'done' | 'testing' | 'in_progress' | 'todo'
  pbiCount: number
  taskCount: number
  storyPoints: number
  percentage: number
  color: string
}
