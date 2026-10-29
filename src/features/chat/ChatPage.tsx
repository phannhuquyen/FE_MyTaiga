import { useState, useEffect, useRef, useMemo } from 'react'
import { Icon } from '@/components/ui'
import { chatService } from './services/chatService'
import type {
  Conversation,
  ChatMessage,
  ChatAttachment,
  ChatMember,
} from './types'
import { CreateChannelModal } from './components/CreateChannelModal'
import { AttachmentPreviewModal } from './components/AttachmentPreviewModal'
import { ChatSearchDrawer } from './components/ChatSearchDrawer'
import { cn } from '@/lib/utils'
import { useParams } from 'react-router-dom'
import { api } from '@/services/api'

export function ChatPage() {
  const { projectId: projectParam } = useParams()
  const projectId = Number(projectParam)
  const [projectMembers, setProjectMembers] = useState<ChatMember[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'channel'>('all')
  const [convSearch, setConvSearch] = useState('')
  const [inputText, setInputText] = useState('')
  const [replyTo, setReplyTo] = useState<ChatMessage['replyTo'] | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editInputText, setEditInputText] = useState('')

  // Modals & Drawers state
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [previewAttachment, setPreviewAttachment] = useState<ChatAttachment | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [highlightKeyword, setHighlightKeyword] = useState('')

  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionPosition, setMentionPosition] = useState(0)

  // Mobile navigation
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Service subscription & load from API
  useEffect(() => {
    let cancelled = false
    setConversations([])
    setActiveConvId('')
    setInputText('')
    setReplyTo(null)
    chatService.fetchRoomsFromApi(projectId).then((rooms) => {
      if (cancelled) return
      const scoped = rooms.filter((room) => room.projectId === projectId)
      setConversations(scoped)
      setActiveConvId(scoped[0]?.id || '')
    }).catch(() => { if (!cancelled) setUploadError('Không thể tải kênh tin nhắn của dự án.') })
    api.projectMembers.list(projectId, { pageSize: 100 }).then((res) => {
      if (!cancelled) setProjectMembers(res.data.items.map((member) => ({ id: String(member.userId), name: member.fullName, avatar: member.fullName.slice(0, 2), role: member.projectRole })))
    }).catch(() => { if (!cancelled) setProjectMembers([]) })
    const refresh = () => {
      setConversations(chatService.getConversations().filter((room) => room.projectId === projectId))
    }
    const unsubscribe = chatService.subscribe(refresh)
    return () => { cancelled = true; unsubscribe() }
  }, [projectId])

  // Load messages from API when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      chatService.fetchMessagesFromApi(activeConvId)
    }
  }, [activeConvId])

  const activeConversation = useMemo(() => {
    return (
      conversations.find((c) => c.id === activeConvId)
    )
  }, [activeConvId, conversations])

  const messages = useMemo(() => {
    if (!conversations) return []
    return chatService.getMessages(activeConvId)
  }, [activeConvId, conversations])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (activeTab === 'direct' && c.type !== 'direct') return false
      if (activeTab === 'channel' && c.type !== 'channel') return false
      if (convSearch.trim()) {
        const q = convSearch.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.lastMessage?.toLowerCase().includes(q) ||
          c.roleBadge?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [conversations, activeTab, convSearch])

  const channelCount = conversations.filter((c) => c.type === 'channel').length

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id)
    chatService.markConversationRead(id)
    setIsMobileConversationOpen(true)
  }

  // Handle typing & mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setInputText(text)

    // Check mention trigger
    const cursorPos = e.target.selectionStart
    const textBeforeCursor = text.slice(0, cursorPos)
    const match = textBeforeCursor.match(/@([a-zA-Z0-9À-ỹ]*)$/)

    if (match) {
      setMentionQuery(match[1])
      setMentionPosition(cursorPos)
    } else {
      setMentionQuery(null)
    }
  }

  const handleSelectMention = (member: ChatMember) => {
    if (mentionQuery !== null) {
      const beforeMention = inputText.slice(0, mentionPosition - mentionQuery.length - 1)
      const afterMention = inputText.slice(mentionPosition)
      const newText = `${beforeMention}@${member.name} ${afterMention}`
      setInputText(newText)
      setMentionQuery(null)
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return
    try {
      await chatService.sendMessage(activeConvId, inputText, undefined, replyTo || undefined)
      setInputText('')
      setReplyTo(null)
      setUploadError(null)
    } catch {
      setUploadError('Không thể gửi tin nhắn. Vui lòng thử lại.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // File upload simulation with 25MB check (S13-12)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Simulate 25MB limit check
    if (file.size > 25 * 1024 * 1024 || file.name.includes('full_database_dump')) {
      setUploadError(
        `Tải lên thất bại. Tệp ${file.name} (38.4 MB) vượt quá giới hạn 25MB cho phép. Vui lòng nén dữ liệu hoặc lưu trữ thông qua kho S3 chuyên dụng.`,
      )
      e.target.value = ''
      return
    }

    setUploadError(null)
    const newAtt: ChatAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      bytes: file.size,
      type: file.name.endsWith('.pdf') ? 'pdf' : 'image',
      uploadedBy: 'Minh Quân',
      uploadedAt: 'Vừa xong',
    }

    try {
      await chatService.sendMessage(activeConvId, `Đã gửi tệp đính kèm: ${file.name}`, [newAtt], undefined, [file])
    } catch {
      setUploadError('Không thể gửi tệp đính kèm. Vui lòng thử lại.')
    }
    e.target.value = ''
  }

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id)
    setEditInputText(msg.content)
  }

  const handleSaveEdit = async (messageId: string) => {
    try {
      if (editInputText.trim()) {
        await chatService.editMessage(activeConvId, messageId, editInputText.trim())
        setEditingMessageId(null)
      }
    } catch {
      alert('Không thể lưu tin nhắn. Vui lòng thử lại.')
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    chatService.deleteMessage(activeConvId, messageId)
  }

  const handleReaction = (messageId: string, emoji: string) => {
    chatService.addReaction(activeConvId, messageId, emoji)
  }

  const filteredMentionMembers = projectMembers.filter((m) => {
    if (m.name === 'Minh Quân') return false
    if (!mentionQuery) return true
    return m.name.toLowerCase().includes(mentionQuery.toLowerCase())
  })

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden bg-paper-100 dark:bg-neutral-950">
      {/* ── LEFT COLUMN: Conversations List (S13-01) ── */}
      <div
        className={cn(
          'w-full md:w-80 lg:w-96 border-r border-neutral-200 dark:border-neutral-800 bg-whiteboard dark:bg-neutral-900 flex flex-col shrink-0 transition-transform duration-200',
          isMobileConversationOpen ? 'hidden md:flex' : 'flex',
        )}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Tin nhắn dự án
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
              {conversations.reduce((sum, room) => sum + room.unreadCount, 0)} mới
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsChannelModalOpen(true)}
              title="Tạo kênh trong dự án"
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              <Icon name="edit" size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsChannelModalOpen(true)}
              title="Tạo kênh trao đổi mới"
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              <Icon name="plus" size={18} />
            </button>
          </div>
        </div>

        {/* Search input (S13-01) */}
        <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-paper-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Tabs: Cá nhân vs Nhóm (S13-01) */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-4 pt-2 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'pb-2 transition-colors cursor-pointer border-b-2',
              activeTab === 'all'
                ? 'border-primary-600 text-primary-700 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800',
            )}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('channel')}
            className={cn(
              'pb-2 transition-colors cursor-pointer border-b-2',
              activeTab === 'channel'
                ? 'border-primary-600 text-primary-700 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800',
            )}
          >
            Kênh dự án ({channelCount})
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {!filteredConversations.length && <p className="p-4 text-sm text-neutral-500" role="status">{uploadError || 'Chưa có kênh tin nhắn trong dự án. Tạo kênh để bắt đầu trao đổi.'}</p>}
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConvId
            return (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={cn(
                  'p-3.5 flex items-start gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors relative',
                  isSelected &&
                    'bg-primary-50/50 dark:bg-primary-950/20 border-l-4 border-primary-600',
                )}
              >
                {/* Avatar / Hash icon */}
                <div className="relative shrink-0 mt-0.5">
                  {conv.type === 'channel' ? (
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-sm">
                      <Icon name="hash" size={18} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 text-neutral-100 flex items-center justify-center font-bold text-xs">
                      {conv.avatar || conv.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Online dot for direct */}
                  {conv.status === 'online' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-whiteboard dark:border-neutral-900" />
                  )}
                  {conv.status === 'busy' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-whiteboard dark:border-neutral-900" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                      {conv.type === 'channel' ? `#${conv.name}` : conv.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {conv.lastMessageTime}
                    </span>
                  </div>

                  {conv.roleBadge && (
                    <span className="text-[10px] text-neutral-400 block mb-0.5">
                      {conv.roleBadge}
                    </span>
                  )}

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {conv.lastMessage || 'Chưa có tin nhắn'}
                  </p>
                </div>

                {/* Unread badge */}
                {conv.unreadCount > 0 && (
                  <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-whiteboard self-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom bar (S13-01) */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">Sẵn sàng nhận việc</span>
          </div>
          <button
            type="button"
            title="Tùy chọn trạng thái"
            className="p-1 hover:text-neutral-900 cursor-pointer"
          >
            <Icon name="sliders" size={14} />
          </button>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Conversation Stream (S13-01, S13-04, S13-07) ── */}
      <div
        className={cn(
          'flex-1 flex flex-col relative h-full bg-whiteboard dark:bg-neutral-900 overflow-hidden',
          !isMobileConversationOpen ? 'hidden md:flex' : 'flex',
        )}
      >
        {activeConversation ? (
          <>
            {/* Header (S13-01, S13-07) */}
            <div className="h-14 px-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-whiteboard dark:bg-neutral-900 z-10">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileConversationOpen(false)}
                  className="md:hidden p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 cursor-pointer"
                >
                  <Icon name="chevron-left" size={18} />
                </button>

                {/* Avatar / Hash */}
                {activeConversation.type === 'channel' ? (
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-sm shrink-0">
                    <Icon name="hash" size={18} />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 text-neutral-100 flex items-center justify-center font-bold text-xs shrink-0">
                    {activeConversation.avatar || activeConversation.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {activeConversation.type === 'channel'
                        ? `#${activeConversation.name}`
                        : activeConversation.name}
                    </h2>
                    {activeConversation.roleBadge && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                        {activeConversation.roleBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {activeConversation.type === 'channel' ? (
                      activeConversation.description || `${activeConversation.membersCount || 5} thành viên`
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Trực tuyến • {activeConversation.sprintTag || 'Sprint 14 Active'}</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action buttons (S13-01, S13-05) */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                  title="Tìm kiếm trong cuộc trò chuyện"
                  className={cn(
                    'p-2 rounded-lg transition-colors cursor-pointer',
                    isSearchOpen
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  )}
                >
                  <Icon name="search" size={18} />
                </button>
                <button
                  type="button"
                  title="Tin nhắn đã ghim"
                  className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <Icon name="pin" size={18} />
                </button>
                <button
                  type="button"
                  title="Thông tin chi tiết"
                  className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <Icon name="info" size={18} />
                </button>
              </div>
            </div>

            {/* Upload Error Alert Banner (S13-12) */}
            {uploadError && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start justify-between text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <Icon name="alert-triangle" size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Tải lên thất bại</span>
                    <p className="mt-0.5">{uploadError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="text-rose-400 hover:text-rose-700 cursor-pointer ml-2"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            )}

            {/* Keyword Search Highlight Banner (S13-05) */}
            {highlightKeyword && (
              <div className="mx-6 mt-3 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <Icon name="search" size={14} className="text-amber-600" />
                  <span>
                    Đang hiển thị kết quả tìm kiếm cho từ khóa: <strong className="font-semibold underline">"{highlightKeyword}"</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHighlightKeyword('')}
                  className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-200/60 dark:bg-amber-900/60 hover:bg-amber-300/60 text-amber-900 dark:text-amber-200 cursor-pointer"
                >
                  Xóa lọc
                </button>
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Date divider (S13-01) */}
              <div className="text-center my-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                  Hôm nay, 24 Tháng 10
                </span>
              </div>

              {messages.map((msg, index) => {
                // Check if this is where unread divider sits (S13-07)
                const showUnreadDivider = msg.isNew && !messages[index - 1]?.isNew

                return (
                  <div key={msg.id} className="space-y-4">
                    {/* Unread separator line (S13-07) */}
                    {showUnreadDivider && (
                      <div className="relative flex items-center justify-center my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-rose-300 dark:border-rose-900" />
                        </div>
                        <div className="relative px-3 py-0.5 rounded-full text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 shadow-2xs">
                          ∨ TIN NHẮN CHƯA ĐỌC (UNREAD) ∨
                        </div>
                      </div>
                    )}

                    {/* Message Bubble Container */}
                    <div
                      className={cn(
                        'flex items-start gap-3 group relative',
                        msg.isSelf ? 'flex-row-reverse' : 'flex-row',
                      )}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 text-neutral-100 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {msg.senderAvatar}
                      </div>

                      {/* Content block */}
                      <div
                        className={cn(
                          'max-w-[85%] sm:max-w-xl space-y-1.5',
                          msg.isSelf ? 'items-end' : 'items-start',
                        )}
                      >
                        {/* Sender info & time */}
                        <div
                          className={cn(
                            'flex items-center gap-2 text-[11px]',
                            msg.isSelf ? 'justify-end' : 'justify-start',
                          )}
                        >
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {msg.senderName}
                          </span>
                          {msg.senderRole && (
                            <span className="text-[10px] text-neutral-400">
                              {msg.senderRole}
                            </span>
                          )}
                          <span className="text-neutral-400 font-mono">{msg.timestamp}</span>
                          {msg.isNew && (
                            <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-rose-500 text-whiteboard">
                              Mới
                            </span>
                          )}
                        </div>

                        {/* Reply To quote box (S13-04) */}
                        {msg.replyTo && (
                          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-l-2 border-primary-500 text-xs text-neutral-600 dark:text-neutral-300 mb-1">
                            <span className="font-semibold block text-[11px] text-neutral-700 dark:text-neutral-200">
                              Đang trả lời {msg.replyTo.senderName}:
                            </span>
                            <span className="italic line-clamp-1">&ldquo;{msg.replyTo.text}&rdquo;</span>
                          </div>
                        )}

                        {/* Message Bubble (S13-01, S13-04) */}
                        <div
                          className={cn(
                            'p-3.5 rounded-2xl text-xs leading-relaxed border relative transition-all',
                            msg.isSelf
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                              : msg.isNew
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-neutral-900 dark:text-neutral-100'
                              : 'bg-whiteboard dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs',
                          )}
                        >
                          {editingMessageId === msg.id ? (
                            /* Inline Edit Mode (S13-09) */
                            <div className="space-y-2">
                              <textarea
                                value={editInputText}
                                onChange={(e) => setEditInputText(e.target.value)}
                                className="w-full text-xs p-2 rounded bg-whiteboard dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                rows={2}
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingMessageId(null)}
                                  className="px-2 py-1 rounded text-[11px] border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(msg.id)}
                                  className="px-2.5 py-1 rounded text-[11px] bg-primary-600 text-whiteboard font-semibold hover:bg-primary-700"
                                >
                                  Lưu thay đổi
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Regular Message Display */
                            <>
                              <p className="whitespace-pre-wrap">{msg.content}</p>

                              {/* Task / Bug Reference Chip (S13-04) */}
                              {msg.taskRef && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-700/60 border border-neutral-200 dark:border-neutral-600 text-xs font-mono font-bold text-primary-700 dark:text-primary-300">
                                  <span>{msg.taskRef.code}</span>
                                  {msg.taskRef.status && (
                                    <span className="text-[10px] font-sans font-medium text-neutral-500">
                                      • {msg.taskRef.status}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Code snippet block (S13-04) */}
                              {msg.codeSnippet && (
                                <div className="mt-2.5 p-3 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs flex items-center justify-between border border-neutral-800">
                                  <code>{msg.codeSnippet.code}</code>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigator.clipboard.writeText(msg.codeSnippet!.code)
                                    }
                                    title="Sao chép lệnh"
                                    className="p-1 hover:text-primary-400 text-neutral-400 cursor-pointer"
                                  >
                                    <Icon name="copy" size={14} />
                                  </button>
                                </div>
                              )}

                              {/* Attachments (S13-10, S13-11) */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-2.5 space-y-1.5">
                                  {msg.attachments.map((att) => (
                                    <div
                                      key={att.id}
                                      onClick={() => setPreviewAttachment(att)}
                                      className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer group/att"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                                          <Icon name="file-text" size={16} />
                                        </div>
                                        <div className="min-w-0">
                                          <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate block group-hover/att:text-primary-600">
                                            {att.name}
                                          </span>
                                          <span className="text-[10px] text-neutral-400">
                                            {att.size}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1">
                                          <Icon name="eye" size={14} />
                                          <span>Xem trước</span>
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Read Status for Self (S13-01) */}
                        {msg.isSelf && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 text-right flex items-center justify-end gap-1 font-medium">
                            <Icon name="check" size={12} />
                            <span>Đã xem</span>
                          </div>
                        )}

                        {/* Reactions chips (S13-09) */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {msg.reactions.map((r, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleReaction(msg.id, r.emoji)}
                                className="px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 cursor-pointer"
                              >
                                <span>{r.emoji}</span>
                                <span className="font-bold text-[10px]">{r.count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Hover Action Toolbar (S13-09) */}
                        <div
                          className={cn(
                            'opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-whiteboard dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm px-1.5 py-0.5 text-xs',
                            msg.isSelf ? 'justify-end' : 'justify-start',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => handleReaction(msg.id, '👍')}
                            title="Thích"
                            className="p-1 hover:text-amber-500 cursor-pointer"
                          >
                            👍
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReaction(msg.id, '❤️')}
                            title="Thả tim"
                            className="p-1 hover:text-rose-500 cursor-pointer"
                          >
                            ❤️
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReplyTo({
                                id: msg.id,
                                senderName: msg.senderName,
                                text: msg.content.slice(0, 50),
                              })
                            }
                            title="Trả lời"
                            className="p-1 hover:text-primary-600 cursor-pointer"
                          >
                            <Icon name="message-square" size={14} />
                          </button>
                          {msg.isSelf && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(msg)}
                                title="Chỉnh sửa tin nhắn"
                                className="p-1 hover:text-neutral-900 cursor-pointer"
                              >
                                <Icon name="edit" size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Xóa tin nhắn"
                                className="p-1 hover:text-danger-600 cursor-pointer"
                              >
                                <Icon name="trash" size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply bar when replying */}
            {replyTo && (
              <div className="px-6 py-2 bg-neutral-100 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-primary-600">
                    Đang trả lời {replyTo.senderName}:
                  </span>
                  <span className="text-neutral-500 truncate">&ldquo;{replyTo.text}&rdquo;</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            )}

            {/* Mention Suggestions Popover (S13-08) */}
            {mentionQuery !== null && filteredMentionMembers.length > 0 && (
              <div className="mx-6 mb-2 bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-2 z-20 space-y-1">
                <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <span>Nhắc tên thành viên (@{mentionQuery})</span>
                  <span>Dùng phím ↑ ↓ để chọn</span>
                </div>
                <div className="max-h-40 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredMentionMembers.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMention(m)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-neutral-900 text-whiteboard text-[10px] font-bold flex items-center justify-center">
                          {m.avatar}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                            {m.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 ml-1.5">{m.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Composer Area (S13-01, S13-04, S13-08) */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-whiteboard dark:bg-neutral-900 shrink-0">
              {/* Rich Markdown Toolbar (S13-08) */}
              <div className="flex items-center gap-2 mb-2 text-xs text-neutral-500">
                <button
                  type="button"
                  onClick={() => setInputText((prev) => `${prev}**in đậm**`)}
                  title="In đậm"
                  className="font-bold px-1.5 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => setInputText((prev) => `${prev}*in nghiêng*`)}
                  title="In nghiêng"
                  className="italic px-1.5 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => setInputText((prev) => `${prev}\`code\``)}
                  title="Code snippet"
                  className="font-mono px-1.5 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer"
                >
                  &lt;/&gt;
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputText((prev) => `${prev}@`)
                    setMentionQuery('')
                    setMentionPosition(inputText.length + 1)
                  }}
                  title="Nhắc tên @mention"
                  className="px-1.5 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer"
                >
                  @
                </button>
                <span className="text-neutral-300">|</span>
                <span className="text-[11px] text-neutral-400">
                  Hỗ trợ định dạng Markdown và mã nguồn snippet
                </span>
              </div>

              {/* Textarea */}
              <div className="relative border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent bg-paper-50 dark:bg-neutral-800">
                <textarea
                  rows={2}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`Nhập tin nhắn đến ${
                    activeConversation.type === 'channel'
                      ? `#${activeConversation.name}`
                      : activeConversation.name
                  }... (Enter để gửi, Shift+Enter để xuống dòng)`}
                  className="w-full p-3 text-xs bg-transparent border-0 focus:outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 resize-none leading-relaxed"
                />

                {/* Bottom toolbar inside composer */}
                <div className="flex items-center justify-between px-3 py-2 bg-whiteboard/60 dark:bg-neutral-900/60 border-t border-neutral-200/60 dark:border-neutral-700/60 text-xs">
                  <div className="flex items-center gap-3">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer font-medium"
                    >
                      <Icon name="paperclip" size={16} />
                      <span>Đính kèm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInputText((prev) => `${prev}#TASK-`)}
                      className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer font-medium"
                    >
                      <Icon name="hash" size={16} />
                      <span>Gán Task</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-[11px] text-neutral-400">
                      Shift + Enter xuống dòng
                    </span>
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-whiteboard font-semibold shadow-xs transition-colors cursor-pointer text-xs"
                    >
                      <span>Gửi</span>
                      <Icon name="send" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty Room State (S13-06) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
              <Icon name="message-square" size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Chưa có cuộc trò chuyện nào được chọn
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm">
                Hãy chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu trao đổi kỹ thuật hoặc thảo luận sprint.
              </p>
            </div>
          </div>
        )}

        {/* Search Drawer Component (S13-05) */}
        <ChatSearchDrawer
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          currentConversationId={activeConvId}
          onSelectResult={(msg) => {
            setActiveConvId(msg.conversationId)
            setHighlightKeyword('webhook')
          }}
        />
      </div>

      {/* ── MODALS ── */}
      {/* S13-03 Channel modal */}
      <CreateChannelModal
        key={projectId}
        members={projectMembers}
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        onCreateChannel={async (payload) => {
          const newChan = await chatService.createChannel({ ...payload, projectId })
          setActiveConvId(newChan.id)
        }}
      />

      {/* S13-11 Attachment preview lightbox */}
      <AttachmentPreviewModal
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        attachment={previewAttachment}
      />
    </div>
  )
}

export default ChatPage
