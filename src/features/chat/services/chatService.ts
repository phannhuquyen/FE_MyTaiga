import type {
  Conversation,
  ChatMessage,
  ChatMember,
  ChatAttachment,
  CreateChannelPayload,
} from '../types'

export const AVAILABLE_CHAT_MEMBERS: ChatMember[] = [
  {
    id: 'mem-mq',
    name: 'Minh Quân',
    avatar: 'MQ',
    role: 'Quản lý (Manager)',
    department: 'Management',
    email: 'quan.minh@company.com',
    status: 'online',
  },
  {
    id: 'mem-hl',
    name: 'Hoàng Long',
    avatar: 'HL',
    role: 'Backend Lead',
    department: 'Engineering',
    email: 'long.hoang@company.com',
    status: 'online',
  },
  {
    id: 'mem-ta',
    name: 'Tuấn Anh',
    avatar: 'TA',
    role: 'QA Lead',
    department: 'Quality',
    email: 'anh.tuan@company.com',
    status: 'online',
  },
  {
    id: 'mem-tt',
    name: 'Thùy Trang',
    avatar: 'TT',
    role: 'Frontend Dev',
    department: 'Engineering',
    email: 'trang.thuy@company.com',
    status: 'online',
  },
  {
    id: 'mem-dt',
    name: 'Đỗ Thảo',
    avatar: 'ĐT',
    role: 'Tester',
    department: 'Quality',
    email: 'thao.do@company.com',
    status: 'busy',
  },
  {
    id: 'mem-hn',
    name: 'Hải Nam',
    avatar: 'HN',
    role: 'DevOps Lead',
    department: 'Infrastructure',
    email: 'nam.hai@company.com',
    status: 'online',
  },
  {
    id: 'mem-lc',
    name: 'Đỗ Lan Chi',
    avatar: 'LC',
    role: 'QA Engineer',
    department: 'Quality',
    email: 'chi.lan@company.com',
    status: 'offline',
  },
  {
    id: 'mem-nt',
    name: 'Nguyễn Thảo',
    avatar: 'NT',
    role: 'Product Owner',
    department: 'Product',
    email: 'thao.nguyen@company.com',
    status: 'online',
  },
]

const INITIAL_CONVERSATIONS: Conversation[] = [
  // ── Channels (Nhóm) ──
  {
    id: 'conv-ch-core',
    type: 'channel',
    name: 'dev-core-sync',
    roleBadge: 'Kênh chung',
    description:
      'Thảo luận kỹ thuật kiến trúc backend, data contract & Sprint 24 release candidate',
    lastMessage: 'Minh Quân: Cần chốt API endpoint cho module xác thực...',
    lastMessageTime: '10:47',
    unreadCount: 3,
    membersCount: 7,
    isPinned: true,
  },
  {
    id: 'conv-ch-daily',
    type: 'channel',
    name: 'scrum-daily-blocker',
    roleBadge: 'Daily sync',
    description: 'Thảo luận khó khăn hằng ngày, chia sẻ blocker để đội ngũ tháo gỡ',
    lastMessage: 'Thu Trang: Task SB-142 đã được unblock nhờ PR hotfix',
    lastMessageTime: '09:15',
    unreadCount: 0,
    membersCount: 12,
  },
  {
    id: 'conv-ch-incident',
    type: 'channel',
    name: 'incident-prod-p1',
    roleBadge: 'Sự cố P1',
    description: 'Kênh điều phối xử lý sự cố khẩn cấp môi trường Production',
    lastMessage: 'Tuấn Anh: Đã triển khai canary deploy hoàn tất lúc 22:40',
    lastMessageTime: 'Hôm qua',
    unreadCount: 0,
    isResolved: true,
    membersCount: 8,
  },
  {
    id: 'conv-ch-leads',
    type: 'channel',
    name: 'leads-product-roadmap',
    roleBadge: 'Riêng tư',
    description: 'Lộ trình phát triển sản phẩm & kế hoạch phân bổ tài nguyên',
    lastMessage: 'Minh Quân: Bảng burndown chart tuần này rất ổn định',
    lastMessageTime: 'Thứ 3',
    unreadCount: 0,
    membersCount: 3,
  },

  // ── Direct Messages (Cá nhân) ──
  {
    id: 'conv-hl',
    type: 'direct',
    name: 'Hoàng Long',
    avatar: 'HL',
    roleBadge: 'Backend Lead',
    status: 'online',
    lastMessage: 'Đã tích hợp xong webhook...',
    lastMessageTime: '10:42',
    unreadCount: 2,
    sprintTag: 'Sprint 24: Tối ưu hạ tầng thanh toán',
  },
  {
    id: 'conv-group-dev',
    type: 'direct',
    name: 'Nhóm Core Dev',
    avatar: '👥',
    roleBadge: 'Squad',
    lastMessage: 'Tuấn Anh: Đã push branch...',
    lastMessageTime: '09:15',
    unreadCount: 0,
    membersCount: 5,
  },
  {
    id: 'conv-ld',
    type: 'direct',
    name: 'Linh Đan',
    avatar: 'LĐ',
    roleBadge: 'QA Engineer',
    status: 'busy',
    lastMessage: 'Test case #BUG-104...',
    lastMessageTime: 'Hôm qua',
    unreadCount: 0,
  },
  {
    id: 'conv-td',
    type: 'direct',
    name: 'Trần Đức',
    avatar: 'TĐ',
    roleBadge: 'DevOps Lead',
    status: 'online',
    lastMessage: 'Cluster K8s đã cập nhật bản vá.',
    lastMessageTime: '23/10',
    unreadCount: 0,
  },
  {
    id: 'conv-lc',
    type: 'direct',
    name: 'Đỗ Lan Chi',
    avatar: 'LC',
    roleBadge: 'QA Engineer',
    status: 'offline',
    lastMessage: 'Test case Sprint 14 đã verified xong 8/10 task.',
    lastMessageTime: '09:12',
    unreadCount: 0,
  },
  {
    id: 'conv-ta',
    type: 'direct',
    name: 'Tuấn Anh',
    avatar: 'TA',
    roleBadge: 'Frontend Dev',
    status: 'online',
    lastMessage: 'Nhờ anh Quân review hộ em PR #122.',
    lastMessageTime: 'Hôm qua',
    unreadCount: 0,
  },
]

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  // ── Messages for Hoàng Long (S13-01 & S13-04) ──
  'conv-hl': [
    {
      id: 'hl-msg-1',
      conversationId: 'conv-hl',
      senderId: 'mem-hl',
      senderName: 'Hoàng Long',
      senderAvatar: 'HL',
      senderRole: 'Backend Lead',
      timestamp: '10:30',
      createdAt: '2024-10-24T10:30:00Z',
      content:
        'Chào anh Quân, API gateway đã cấu hình rate limit xong theo kịch bản k6 test rồi nhé. Nguyên nhân timeout là do middleware chưa tối ưu connection pool với Redis cache.',
      isSelf: false,
    },
    {
      id: 'hl-msg-2',
      conversationId: 'conv-hl',
      senderId: 'mem-hl',
      senderName: 'Hoàng Long',
      senderAvatar: 'HL',
      senderRole: 'Backend Lead',
      timestamp: '10:32',
      createdAt: '2024-10-24T10:32:00Z',
      content: 'Em đã vá hotfix trực tiếp và test thử lại đường dẫn này:\nĐộ trễ trung bình giảm từ 840ms xuống còn 42ms trên môi trường Staging.',
      codeSnippet: {
        language: 'bash',
        code: 'POST /api/v1/auth/token-refresh -> 200 OK',
        result: 'latency_p99: 42ms',
      },
      isSelf: false,
    },
    {
      id: 'hl-msg-3',
      conversationId: 'conv-hl',
      senderId: 'mem-mq',
      senderName: 'Minh Quân (Bạn)',
      senderAvatar: 'MQ',
      senderRole: 'Manager',
      timestamp: '10:34',
      createdAt: '2024-10-24T10:34:00Z',
      content:
        'Rất tốt! Cảm ơn Long đã xử lý nhanh. Em đã cập nhật lại trạng thái của thẻ bug #BUG-408 trên bảng Kanban chưa?',
      replyTo: {
        id: 'hl-msg-1',
        senderName: 'Hoàng Long',
        text: 'Chào anh Quân, bên em vừa điều tra xong lỗi timeout...',
      },
      taskRef: {
        code: '#BUG-408',
        status: 'Chờ kiểm thử',
        statusColor: 'warning',
      },
      isSelf: true,
      isRead: true,
    },
    {
      id: 'hl-msg-4',
      conversationId: 'conv-hl',
      senderId: 'mem-hl',
      senderName: 'Hoàng Long',
      senderAvatar: 'HL',
      senderRole: 'Backend Lead',
      timestamp: '10:35',
      createdAt: '2024-10-24T10:35:00Z',
      content:
        'Dạ em vừa chuyển qua cột Chờ duyệt (Review) rồi ạ. Nhờ bạn Chi chạy regression test lần cuối trước khi deploy lên Production.',
      isSelf: false,
      isNew: true,
    },
    {
      id: 'hl-msg-5',
      conversationId: 'conv-hl',
      senderId: 'mem-hl',
      senderName: 'Hoàng Long',
      senderAvatar: 'HL',
      senderRole: 'Backend Lead',
      timestamp: '10:42',
      createdAt: '2024-10-24T10:42:00Z',
      content: 'Vâng anh, em đang trigger deployment qua GitHub Actions.',
      attachments: [
        {
          id: 'att-k6',
          name: 'k6_performance_report_sprint14.pdf',
          size: '3.4 MB',
          bytes: 3400000,
          type: 'pdf',
          uploadedBy: 'Hoàng Long',
          uploadedAt: '10:42',
        },
      ],
      isSelf: false,
      isNew: true,
    },
  ],

  // ── Messages for #dev-core-sync (S13-07 & S13-05) ──
  'conv-ch-core': [
    {
      id: 'core-msg-1',
      conversationId: 'conv-ch-core',
      senderId: 'mem-hn',
      senderName: 'Hải Nam',
      senderAvatar: 'HN',
      senderRole: 'DevOps',
      timestamp: '16:20',
      createdAt: '2024-10-24T16:20:00Z',
      content:
        'Môi trường Staging đã được cập nhật bản build `v2.4.0-rc3`. Mọi người có thể test flow webhook thanh toán ngay bây giờ.',
      isSelf: false,
    },
    {
      id: 'core-msg-2',
      conversationId: 'conv-ch-core',
      senderId: 'mem-ta',
      senderName: 'Thu Trang',
      senderAvatar: 'TT',
      senderRole: 'QA Lead',
      timestamp: '16:45',
      createdAt: '2024-10-24T16:45:00Z',
      content:
        'Đã ghi nhận test case cho ScrumBan card #SB-208. Đang kiểm tra lại regression test trên cổng kết nối API.',
      taskRef: {
        code: '#SB-208',
        status: 'Đang kiểm tra',
      },
      isSelf: false,
    },
    {
      id: 'core-msg-3',
      conversationId: 'conv-ch-core',
      senderId: 'mem-mq',
      senderName: 'Minh Quân',
      senderAvatar: 'MQ',
      senderRole: 'Manager',
      timestamp: '08:30',
      createdAt: '2024-10-25T08:30:00Z',
      content:
        'Chào buổi sáng team! Lưu ý mục tiêu sprint tuần này là dứt điểm 4 backlog user story liên quan đến luồng Kanban real-time websocket.',
      isSelf: true,
      isRead: true,
    },
    // UNREAD THRESHOLD
    {
      id: 'core-msg-4',
      conversationId: 'conv-ch-core',
      senderId: 'mem-hl',
      senderName: 'Hoàng Long',
      senderAvatar: 'HL',
      senderRole: 'Frontend',
      timestamp: '10:45',
      createdAt: '2024-10-25T10:45:00Z',
      content:
        'Mình vừa tích hợp xong event listener `message.received`. Khi có tin mới từ user khác, thanh chia unread divider sẽ tự động neo vị trí đầu tiên.',
      isSelf: false,
      isNew: true,
      reactions: [{ emoji: '👍', count: 3, users: ['Minh Quân', 'Hải Nam', 'Thu Trang'] }],
    },
    {
      id: 'core-msg-5',
      conversationId: 'conv-ch-core',
      senderId: 'mem-hn',
      senderName: 'Hải Nam',
      senderAvatar: 'HN',
      senderRole: 'DevOps',
      timestamp: '10:46',
      createdAt: '2024-10-25T10:46:00Z',
      content:
        'Cụm Redis pub/sub vừa scale thêm 2 pod worker để đảm bảo độ trễ broadcast tin nhắn dưới 35ms cho toàn bộ team webhook.',
      codeSnippet: {
        language: 'bash',
        code: 'latency_p99: 28.4ms | throughput: 1.2k req/s',
      },
      isSelf: false,
      isNew: true,
    },
    {
      id: 'core-msg-6',
      conversationId: 'conv-ch-core',
      senderId: 'mem-mq',
      senderName: 'Minh Quân',
      senderAvatar: 'MQ',
      senderRole: 'Manager',
      timestamp: '10:47',
      createdAt: '2024-10-25T10:47:00Z',
      content:
        'Tuyệt vời! @Hải Nam và @Hoàng Long tiếp tục monitor webhook telemetry nhé.',
      isSelf: true,
      isNew: true,
    },
  ],
}

class ChatService {
  private conversations: Conversation[] = [...INITIAL_CONVERSATIONS]
  private messages: Record<string, ChatMessage[]> = { ...INITIAL_MESSAGES }
  private listeners: Array<() => void> = []

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((l) => l())
  }

  getConversations(type?: 'direct' | 'channel', search?: string): Conversation[] {
    let result = [...this.conversations]
    if (type) {
      result = result.filter((c) => c.type === type)
    }
    if (search?.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.roleBadge?.toLowerCase().includes(q) ||
          c.lastMessage?.toLowerCase().includes(q),
      )
    }
    return result
  }

  getConversationById(id: string): Conversation | undefined {
    return this.conversations.find((c) => c.id === id)
  }

  getMessages(conversationId: string): ChatMessage[] {
    return this.messages[conversationId] || []
  }

  sendMessage(
    conversationId: string,
    content: string,
    attachments?: ChatAttachment[],
    replyTo?: ChatMessage['replyTo'],
  ): ChatMessage {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: 'mem-mq',
      senderName: 'Minh Quân (Bạn)',
      senderAvatar: 'MQ',
      senderRole: 'Manager',
      timestamp: `${hours}:${minutes}`,
      createdAt: now.toISOString(),
      content: content.trim(),
      attachments,
      replyTo,
      isSelf: true,
      isRead: true,
    }

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = []
    }
    this.messages[conversationId].push(newMessage)

    // Update conversation last message
    this.conversations = this.conversations.map((c) => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: content.slice(0, 45) || 'Đã gửi tệp đính kèm',
          lastMessageTime: `${hours}:${minutes}`,
        }
      }
      return c
    })

    this.notify()
    return newMessage
  }

  editMessage(conversationId: string, messageId: string, newContent: string) {
    if (this.messages[conversationId]) {
      this.messages[conversationId] = this.messages[conversationId].map((m) =>
        m.id === messageId ? { ...m, content: newContent } : m,
      )
      this.notify()
    }
  }

  deleteMessage(conversationId: string, messageId: string) {
    if (this.messages[conversationId]) {
      this.messages[conversationId] = this.messages[conversationId].filter(
        (m) => m.id !== messageId,
      )
      this.notify()
    }
  }

  addReaction(conversationId: string, messageId: string, emoji: string) {
    if (this.messages[conversationId]) {
      this.messages[conversationId] = this.messages[conversationId].map((m) => {
        if (m.id === messageId) {
          const reactions = m.reactions ? [...m.reactions] : []
          const existing = reactions.find((r) => r.emoji === emoji)
          if (existing) {
            existing.count += 1
            if (!existing.users.includes('Minh Quân')) existing.users.push('Minh Quân')
          } else {
            reactions.push({ emoji, count: 1, users: ['Minh Quân'] })
          }
          return { ...m, reactions }
        }
        return m
      })
      this.notify()
    }
  }

  markConversationRead(conversationId: string) {
    this.conversations = this.conversations.map((c) => {
      if (c.id === conversationId) {
        return { ...c, unreadCount: 0 }
      }
      return c
    })
    if (this.messages[conversationId]) {
      this.messages[conversationId] = this.messages[conversationId].map((m) => ({
        ...m,
        isNew: false,
        isRead: true,
      }))
    }
    this.notify()
  }

  createChannel(payload: CreateChannelPayload): Conversation {
    const newChan: Conversation = {
      id: `chan-${Date.now()}`,
      type: 'channel',
      name: payload.name.trim().toLowerCase().replace(/\s+/g, '-'),
      roleBadge: 'Kênh mới',
      description: payload.description.trim(),
      membersCount: payload.memberIds.length,
      unreadCount: 0,
      lastMessage: 'Kênh đã được tạo bởi Minh Quân',
      lastMessageTime: 'Vừa xong',
    }
    this.conversations.unshift(newChan)
    this.messages[newChan.id] = [
      {
        id: `msg-${Date.now()}`,
        conversationId: newChan.id,
        senderId: 'mem-mq',
        senderName: 'Minh Quân',
        senderAvatar: 'MQ',
        senderRole: 'Manager',
        timestamp: 'Vừa xong',
        createdAt: new Date().toISOString(),
        content: `Chào mừng mọi người đến với kênh #${newChan.name}! Kênh được tạo để ${payload.description}`,
        isSelf: true,
      },
    ]
    this.notify()
    return newChan
  }

  createDirectMessage(memberId: string): Conversation {
    const member = AVAILABLE_CHAT_MEMBERS.find((m) => m.id === memberId)
    if (!member) throw new Error('Thành viên không tồn tại')

    // Check existing
    const existing = this.conversations.find(
      (c) => c.type === 'direct' && c.name === member.name,
    )
    if (existing) return existing

    const newDm: Conversation = {
      id: `dm-${Date.now()}`,
      type: 'direct',
      name: member.name,
      avatar: member.avatar,
      roleBadge: member.role,
      status: member.status || 'online',
      unreadCount: 0,
      lastMessage: 'Bắt đầu cuộc trò chuyện mới',
      lastMessageTime: 'Vừa xong',
    }
    this.conversations.push(newDm)
    this.messages[newDm.id] = []
    this.notify()
    return newDm
  }

  searchMessages(
    keyword: string,
    conversationId?: string,
  ): Array<{ message: ChatMessage; conversationName: string }> {
    if (!keyword.trim()) return []
    const q = keyword.toLowerCase()
    const results: Array<{ message: ChatMessage; conversationName: string }> = []

    const targetEntries = conversationId
      ? Object.entries(this.messages).filter(([cId]) => cId === conversationId)
      : Object.entries(this.messages)

    targetEntries.forEach(([convId, msgs]) => {
      const conv = this.conversations.find((c) => c.id === convId)
      const convName = conv ? conv.name : convId
      msgs.forEach((m) => {
        if (
          m.content.toLowerCase().includes(q) ||
          m.codeSnippet?.code.toLowerCase().includes(q)
        ) {
          results.push({ message: m, conversationName: convName })
        }
      })
    })

    return results
  }
}

export const chatService = new ChatService()
