import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { CreateChannelPayload, ChatMember } from '../types'

interface CreateChannelModalProps {
  members?: ChatMember[]
  isOpen: boolean
  onClose: () => void
  onCreateChannel: (payload: CreateChannelPayload) => Promise<void>
}

export function CreateChannelModal({
  isOpen,
  onClose,
  onCreateChannel,
  members = [],
}: CreateChannelModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState(
    '',
  )
  const [searchMember, setSearchMember] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([
  ])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const toggleMember = (id: string) => {
    if (id === 'mem-mq') return // Owner cannot be unselected
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    )
  }

  const handleRemoveChip = (id: string) => {
    if (id === 'mem-mq') return
    setSelectedMemberIds((prev) => prev.filter((m) => m !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Tên nhóm không được để trống')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await onCreateChannel({
        name: name.trim(),
        description: description.trim(),
        memberIds: selectedMemberIds,
      })
      onClose()
    } catch {
      setError('Không thể tạo nhóm. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredMembers = members.filter((m) => {
    if (!searchMember.trim()) return true
    const q = searchMember.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      m.department?.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    )
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-whiteboard dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header (S13-03) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Tạo nhóm trao đổi mới
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Quản lý (Manager)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md cursor-pointer"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-2.5 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Group Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Tên nhóm <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              placeholder="VD: Core Engineering & Release Squad"
              className="w-full px-3 py-2 text-xs bg-paper-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Group Goal / Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Mục tiêu / Mô tả nhóm
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Trao đổi kỹ thuật, đồng bộ kiến trúc và phát hành Sprint 14"
              className="w-full px-3 py-2 text-xs bg-paper-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
            />
          </div>

          {/* Select Members Section (S13-03) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Chọn thành viên tham gia
              </label>
              <span className="text-xs text-neutral-500">
                Đã chọn: {selectedMemberIds.length}
              </span>
            </div>

            {/* Member Search input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Icon name="search" size={14} />
              </span>
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Tìm thành viên theo tên hoặc phòng ban..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-paper-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-neutral-400"
              />
            </div>

            {/* Selected Chips Box (S13-03) */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-paper-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-800 min-h-[42px]">
              {selectedMemberIds.map((id) => {
                const mem = members.find((m) => m.id === id)
                if (!mem) return null
                const isOwner = id === 'mem-mq'
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-whiteboard dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-2xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-neutral-900 text-neutral-100 text-[10px] font-bold flex items-center justify-center">
                      {mem.avatar}
                    </span>
                    <span className="font-medium">
                      {mem.name} {isOwner ? '(Bạn - Trưởng nhóm)' : ''}
                    </span>
                    {!isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChip(id)}
                        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    )}
                  </span>
                )
              })}
            </div>

            {/* Checkbox Member List */}
            <div className="max-h-48 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl">
              {filteredMembers.map((member) => {
                const isChecked = selectedMemberIds.includes(member.id)
                const isOwner = member.id === 'mem-mq'
                return (
                  <div
                    key={member.id}
                    onClick={() => !isOwner && toggleMember(member.id)}
                    className="flex items-center justify-between p-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isOwner}
                        onChange={() => toggleMember(member.id)}
                        className="w-4 h-4 text-primary-600 rounded border-neutral-300 dark:border-neutral-700 focus:ring-primary-500"
                      />
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 text-neutral-100 flex items-center justify-center font-bold text-xs shrink-0">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-neutral-400">{member.role}</div>
                      </div>
                    </div>
                    {member.department && (
                      <span className="text-[11px] text-neutral-500 font-medium">
                        {member.department}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer note & buttons (S13-03) */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
              <Icon name="shield" size={16} className="text-primary-600 shrink-0" />
              <span>Chỉ Quản lý (Manager) có quyền tạo và quản lý nhóm trao đổi dự án.</span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-whiteboard text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Icon name="user-plus" size={16} />
                <span>Tạo nhóm</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
