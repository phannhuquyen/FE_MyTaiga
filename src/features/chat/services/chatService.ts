import type {
  Conversation,
  ChatMessage,
  ChatMember,
  ChatAttachment,
  CreateChannelPayload,
} from '../types'
import { api, type ChatRoomData, type ChatMessageData } from '@/services/api'
import { authStorage } from '@/lib/tokenStorage'

function mapApiMessage(message: ChatMessageData, conversationId: string, history: ChatMessageData[] = []): ChatMessage {
  const parent = history.find(item => item.messageId === message.replyToMessageId)
  const currentUserId = Number(authStorage.getUser()?.userId)
  return {
    id: String(message.messageId), conversationId, senderId: String(message.senderId),
    senderName: message.senderName || `Thành viên #${message.senderId}`,
    senderAvatar: message.senderAvatarCode || `U${message.senderId}`,
    senderRole: message.senderRole || undefined,
    timestamp: new Date(message.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    createdAt: message.sentAt, content: message.content || '', isSelf: currentUserId === message.senderId,
    isEdited: message.isEdited, isEditable: message.isEditable,
    replyTo: message.replyToMessageId ? {
      id: String(message.replyToMessageId), senderName: parent?.senderName || 'Thành viên',
      text: parent?.content?.slice(0, 50) || 'Nội dung chưa được tải',
    } : undefined,
    attachments: message.attachments?.map(item => {
      const name = item.originalFileName || item.fileName
      const bytes = item.fileSizeBytes ?? item.fileSize
      return {
        id: String(item.messageAttachmentId), name, bytes, size: `${(bytes / (1024 * 1024)).toFixed(1)} MB`,
        type: item.mimeType?.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(name) ? 'image' : /\.pdf$/i.test(name) ? 'pdf' : 'archive',
        url: item.downloadUrl, previewUrl: item.previewUrl || item.url || undefined,
        uploadedBy: message.senderName || undefined, uploadedAt: message.sentAt,
      }
    }),
  }
}

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
  private roomsRequestVersion = 0
  private conversations: Conversation[] = [...INITIAL_CONVERSATIONS]
  private messages: Record<string, ChatMessage[]> = { ...INITIAL_MESSAGES }
  private listeners: Array<() => void> = []
  private ws: WebSocket | null = null
  private wsConnected = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  isWsConnected(): boolean {
    return this.wsConnected
  }

  constructor() {
    this.connectSignalR()
  }

  /**
   * Kết nối WebSocket SignalR Hub (/hubs/chat)
   */
  connectSignalR() {
    const token = authStorage.getToken()
    if (!token) return

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/hubs/chat?access_token=${encodeURIComponent(token)}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        // Gửi handshake SignalR JSON Hub Protocol (kết thúc bằng 0x1e)
        this.ws?.send(JSON.stringify({ protocol: 'json', version: 1 }) + '\x1e')
        this.wsConnected = true
        console.log('⚡ [SignalR] Đã kết nối WebSocket Chat Hub thành công')
      }

      this.ws.onmessage = (event) => {
        const raw = String(event.data)
        const parts = raw.split('\x1e').filter((p) => p.trim().length > 0)

        parts.forEach((part) => {
          try {
            const data = JSON.parse(part)
            // Ping / Keep-alive
            if (data.type === 6) {
              this.ws?.send(JSON.stringify({ type: 6 }) + '\x1e')
            }
            // Invocation: message.new
            else if (data.type === 1 && data.target === 'message.new') {
              const [msg] = data.arguments as [ChatMessageData]
              if (msg && msg.chatRoomId) {
                const convId = String(msg.chatRoomId)
                const currentUserId = authStorage.getUser()?.userId
                const isSelf = currentUserId === msg.senderId

                const newChatMsg = mapApiMessage(msg, convId)

                if (!this.messages[convId]) {
                  this.messages[convId] = []
                }
                // Tránh trùng tin nhắn nếu vừa gửi
                const existingIndex = this.messages[convId].findIndex((m) => m.id === newChatMsg.id)
                if (existingIndex < 0) {
                  this.messages[convId].push(newChatMsg)
                } else {
                  this.messages[convId][existingIndex] = { ...this.messages[convId][existingIndex], ...newChatMsg }
                }

                // Cập nhật last message của conversation
                this.conversations = this.conversations.map((c) =>
                  c.id === convId
                    ? {
                        ...c,
                        lastMessage: msg.content?.slice(0, 45) || 'Tin nhắn mới',
                        lastMessageTime: newChatMsg.timestamp,
                        unreadCount: isSelf || existingIndex >= 0 ? c.unreadCount : (c.unreadCount || 0) + 1,
                      }
                    : c,
                )
                this.notify()
              }
            }
          } catch {
            // Handshake response empty json {}
          }
        })
      }

      this.ws.onclose = () => {
        this.wsConnected = false
        // Tự động kết nối lại sau 5 giây
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
        this.reconnectTimer = setTimeout(() => this.connectSignalR(), 5000)
      }

      this.ws.onerror = (err) => {
        console.warn('⚠️ [SignalR] Lỗi kết nối WebSocket Chat:', err)
        this.ws?.close()
      }
    } catch (e) {
      console.warn('⚠️ [SignalR] Không thể khởi tạo WebSocket:', e)
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((l) => l())
  }

  /**
   * Tải danh sách phòng chat từ Backend API
   */
  async fetchRoomsFromApi(projectId?: number): Promise<Conversation[]> {
    const requestVersion = ++this.roomsRequestVersion
    try {
      const res = await api.chat.listRooms()
      if (requestVersion !== this.roomsRequestVersion) return this.conversations
      const rooms: ChatRoomData[] = (res.data || []).filter((room) => !projectId || (room.projectId === projectId && room.roomType === 'GROUP'))
      if (projectId) this.conversations = []
      if (rooms.length > 0) {
        const mappedConvs: Conversation[] = rooms.map((r) => ({
          id: String(r.chatRoomId),
          projectId: r.projectId,
          type: r.roomType === 'PRIVATE' ? 'direct' : 'channel',
          name: r.roomName || r.otherParticipantName || (r.roomType === 'PRIVATE' ? `Trò chuyện riêng #${r.chatRoomId}` : `Kênh #${r.chatRoomId}`),
          avatar: r.otherParticipantAvatarCode || undefined,
          status: r.otherParticipantStatus === 'ONLINE' ? 'online' : 'offline',
          membersCount: r.participantsCount,
          roleBadge: r.roomType === 'PRIVATE' ? 'Cá nhân' : 'Kênh nhóm',
          lastMessage: r.lastMessage?.content || 'Chưa có tin nhắn',
          lastMessageTime: r.lastMessage
            ? new Date(r.lastMessage.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : undefined,
          unreadCount: r.unreadCount || 0,
        }))

        // Gộp với mock list để không mất demo data nếu BE ít rooms
        this.conversations = projectId ? mappedConvs : [...mappedConvs, ...INITIAL_CONVERSATIONS.filter((c) => !mappedConvs.some((m) => m.id === c.id))]
        this.notify()
      }
    } catch (err) {
      if (requestVersion !== this.roomsRequestVersion) return this.conversations
      console.warn('⚠️ [ChatService] Lỗi tải phòng chat từ API:', err)
      if (projectId) { this.conversations = []; throw err }
    }
    return this.conversations
  }

  /**
   * Tải tin nhắn trong phòng chat từ Backend API
   */
  async fetchMessagesFromApi(conversationId: string): Promise<ChatMessage[]> {
    const numericRoomId = parseInt(conversationId.replace(/\D/g, ''), 10)
    if (numericRoomId > 0) {
      try {
        const res = await api.chat.listMessages(numericRoomId, { limit: 50 })
        const rawMsgs = res.data.items || []
        const mapped = rawMsgs.map((message: ChatMessageData) => mapApiMessage(message, conversationId, rawMsgs))

        this.messages[conversationId] = mapped
        this.notify()
        return mapped
      } catch (err) {
        console.warn('⚠️ [ChatService] Lỗi tải tin nhắn từ API:', err)
      }
    }
    return this.messages[conversationId] || []
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

  async sendMessage(
    conversationId: string,
    content: string,
    attachments?: ChatAttachment[],
    replyTo?: ChatMessage['replyTo'],
    files?: File[],
  ): Promise<ChatMessage> {
    // Numeric room IDs belong to the backend. Publish local success only after acceptance.
    const numRoomId = /^\d+$/.test(conversationId) ? Number(conversationId) : NaN
    const saved = numRoomId > 0
      ? await api.chat.sendMessage(numRoomId, { content: content.trim(), replyToMessageId: replyTo && /^\d+$/.test(replyTo.id) ? Number(replyTo.id) : undefined }, files)
      : null
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')

    const newMessage: ChatMessage = saved ? mapApiMessage(saved.data, conversationId) : {
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
    const existingIndex = this.messages[conversationId].findIndex(message => message.id === newMessage.id)
    if (existingIndex < 0) this.messages[conversationId].push(newMessage)
    else this.messages[conversationId][existingIndex] = newMessage

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

  async editMessage(conversationId: string, messageId: string, newContent: string) {
    if (/^\d+$/.test(conversationId) && /^\d+$/.test(messageId)) {
      await api.chat.editMessage(Number(conversationId), Number(messageId), newContent)
    }
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

  async markConversationRead(conversationId: string) {
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

    const numRoomId = parseInt(conversationId.replace(/\D/g, ''), 10)
    if (numRoomId > 0) {
      try {
        await api.chat.markRead(numRoomId)
      } catch (err) {
        console.warn('⚠️ Lỗi đánh dấu đã đọc chat trên BE:', err)
      }
    }
  }

  async createChannel(payload: CreateChannelPayload): Promise<Conversation> {
    let createdId = `chan-${Date.now()}`
    const res = await api.chat.createRoom({
      roomName: payload.name.trim().toLowerCase().replace(/\s+/g, '-'),
      roomType: 'GROUP',
      projectId: payload.projectId,
      participantIds: payload.memberIds.filter((id) => /^\d+$/.test(id)).map(Number),
    })
    if (res.data?.chatRoomId) {
      createdId = String(res.data.chatRoomId)
    }
    this.roomsRequestVersion++

    const newChan: Conversation = {
      id: createdId,
      projectId: payload.projectId,
      type: 'channel',
      name: payload.name.trim().toLowerCase().replace(/\s+/g, '-'),
      roleBadge: 'Kênh mới',
      description: payload.description.trim(),
      membersCount: payload.memberIds.length,
      unreadCount: 0,
      lastMessage: 'Kênh đã được tạo bởi bạn',
      lastMessageTime: 'Vừa xong',
    }
    this.conversations.unshift(newChan)
    this.messages[newChan.id] = payload.projectId ? [] : [
      {
        id: `msg-${Date.now()}`,
        conversationId: newChan.id,
        senderId: 'mem-mq',
        senderName: 'Tôi',
        senderAvatar: 'ME',
        senderRole: 'Thành viên',
        timestamp: 'Vừa xong',
        createdAt: new Date().toISOString(),
        content: `Chào mừng mọi người đến với kênh #${newChan.name}! Kênh được tạo để ${payload.description}`,
        isSelf: true,
      },
    ]
    this.notify()
    return newChan
  }

  async createDirectMessage(memberId: string): Promise<Conversation> {
    const member = AVAILABLE_CHAT_MEMBERS.find((m) => m.id === memberId)
    if (!member) throw new Error('Thành viên không tồn tại')

    // Check existing
    const existing = this.conversations.find(
      (c) => c.type === 'direct' && c.name === member.name,
    )
    if (existing) return existing

    let createdId = `dm-${Date.now()}`
    const numMemberId = parseInt(memberId.replace(/\D/g, ''), 10)
    if (numMemberId > 0) {
      try {
        const res = await api.chat.createRoom({
          roomType: 'PRIVATE',
          recipientId: numMemberId,
        })
        if (res.data?.chatRoomId) {
          createdId = String(res.data.chatRoomId)
        }
      } catch (err) {
        console.warn('⚠️ Lỗi tạo cuộc trò chuyện cá nhân trên BE:', err)
      }
    }

    const newDm: Conversation = {
      id: createdId,
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
