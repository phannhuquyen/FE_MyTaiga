export type ConversationType = 'direct' | 'channel'

export interface ChatMember {
  id: string
  name: string
  avatar: string
  role: string
  department?: string
  email?: string
  status?: 'online' | 'offline' | 'busy'
}

export interface ChatAttachment {
  id: string
  name: string
  size: string
  bytes: number
  type: 'pdf' | 'image' | 'code' | 'archive' | 'log'
  url?: string
  uploadedBy?: string
  uploadedAt?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar: string
  senderRole?: string
  timestamp: string
  createdAt: string
  content: string
  isSelf: boolean
  isRead?: boolean
  isNew?: boolean
  codeSnippet?: {
    language: string
    code: string
    result?: string
  }
  replyTo?: {
    id: string
    senderName: string
    text: string
  }
  taskRef?: {
    code: string
    status?: string
    statusColor?: string
  }
  attachments?: ChatAttachment[]
  reactions?: Array<{
    emoji: string
    count: number
    users: string[]
  }>
  threadRepliesCount?: number
  threadReplies?: ChatMessage[]
}

export interface Conversation {
  id: string
  type: ConversationType
  name: string
  avatar?: string
  roleBadge?: string
  status?: 'online' | 'offline' | 'busy'
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isPinned?: boolean
  isResolved?: boolean
  membersCount?: number
  members?: ChatMember[]
  description?: string
  sprintTag?: string
}

export interface CreateChannelPayload {
  name: string
  description: string
  memberIds: string[]
}

export interface CreateDirectMessagePayload {
  memberId: string
}
