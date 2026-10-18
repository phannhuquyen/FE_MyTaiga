/**
 * Types for Product Backlog & PBI feature.
 */

export type PBIPriority = 'urgent' | 'high' | 'medium' | 'low'

export type PBIStatus = 'new' | 'ready' | 'in_progress' | 'review' | 'done' | 'locked'

export type PBIItemType = 'user_story' | 'feature' | 'bug' | 'technical_debt'

export interface PBISubtask {
  id: string
  code: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  assigneeName?: string
  assigneeAvatar?: string
}

export interface PBIAcceptanceCriteria {
  id: string
  text: string
  isMet: boolean
}

export interface PBIComment {
  id: string
  authorName: string
  authorRole: string
  authorAvatar: string
  timestamp: string
  content: string
}

export interface PBI {
  id: string
  code: string // e.g. "SB-142", "CORE-284"
  title: string
  description: string
  itemType: PBIItemType
  priority: PBIPriority
  status: PBIStatus
  storyPoints: number
  epicId?: string
  epicName?: string
  epicColor?: string // hex or token color name
  sprintId?: string // undefined if unassigned
  sprintName?: string
  assigneeId?: string
  assigneeName?: string
  assigneeAvatar?: string
  reporterName?: string
  reporterAvatar?: string
  reporterRole?: string
  createdAt: string
  updatedAt: string
  isLocked?: boolean
  subtasks: PBISubtask[]
  acceptanceCriteria: PBIAcceptanceCriteria[]
  comments: PBIComment[]
  tags?: string[]
}

export interface EpicSummary {
  id: string
  name: string
  color: string
  description?: string
  pbiCount: number
}

export interface SprintSummary {
  id: string
  name: string
  status: 'active' | 'planned' | 'draft' | 'closed'
  dateRange: string
  daysLeft?: string
  capacity: number
  assignedSP: number
  pbiCount: number
}

export interface CreatePBIPayload {
  title: string
  description: string
  itemType?: PBIItemType
  priority: PBIPriority
  storyPoints: number
  epicId?: string
  sprintId?: string
}

export interface UpdatePBIPayload {
  title?: string
  description?: string
  itemType?: PBIItemType
  priority?: PBIPriority
  status?: PBIStatus
  storyPoints?: number
  epicId?: string
  sprintId?: string
  assigneeName?: string
  assigneeAvatar?: string
  isLocked?: boolean
}

export interface BacklogSummaryMetrics {
  totalPBIs: number
  totalStoryPoints: number
  unassignedPBIs: number
  unassignedStoryPoints: number
  teamVelocity: number
  estimatedSprintsLeft: number
}
