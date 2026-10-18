import { useState, useMemo } from 'react'
import { Icon } from '@/components/ui'
import { AVAILABLE_CHAT_MEMBERS } from '../services/chatService'
import type { ChatMember } from '../types'

interface CreateDirectMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectMember: (memberId: string) => void
}

export function CreateDirectMessageModal({
  isOpen,
  onClose,
  onSelectMember,
}: CreateDirectMessageModalProps) {
  const [search, setSearch] = useState('')

  const filteredMembers = useMemo(() => {
    return AVAILABLE_CHAT_MEMBERS.filter((m) => {
      if (m.name === 'Minh Quân') return false // skip self
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        m.name.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.department?.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
      )
    })
  }, [search])

  if (!isOpen) return null

  const getDepartmentBadge = (dept?: string) => {
    switch (dept) {
      case 'Engineering':
        return 'bg-rose-50 text-rose-600 border-rose-200'
      case 'Quality':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200'
      case 'Infrastructure':
        return 'bg-amber-50 text-amber-600 border-amber-200'
      case 'Product':
        return 'bg-sky-50 text-sky-600 border-sky-200'
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-whiteboard dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header (S13-02) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 text-primary-700 dark:text-primary-300">
            <Icon name="message-square" size={20} />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Bắt đầu cuộc trò chuyện mới
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md cursor-pointer"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Search input (S13-02) */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc email thành viên..."
              autoFocus
              className="w-full pl-9 pr-4 py-2 text-xs bg-paper-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Member list section (S13-02) */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            <span>Gợi ý gần đây</span>
            <span>{filteredMembers.length} thành viên</span>
          </div>

          <div className="space-y-2">
            {filteredMembers.map((member: ChatMember) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 text-neutral-100 flex items-center justify-center font-bold text-xs shrink-0">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {member.name}
                      </span>
                      {member.department && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getDepartmentBadge(
                            member.department,
                          )}`}
                        >
                          {member.department}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {member.role} • {member.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectMember(member.id)
                    onClose()
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-primary-50 dark:bg-neutral-800 dark:hover:bg-primary-950 text-neutral-700 hover:text-primary-700 dark:text-neutral-300 dark:hover:text-primary-300 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
                >
                  Nhắn tin
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer (S13-02) */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs">
          <span className="text-neutral-400">Nhấn Esc để đóng hộp thoại</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  )
}
