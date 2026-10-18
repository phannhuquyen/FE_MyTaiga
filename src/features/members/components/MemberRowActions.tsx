import { useState, useRef, useEffect } from 'react'
import { Icon } from '@/components/ui'
import type { Member } from '../types'

interface MemberRowActionsProps {
  member: Member
  onViewDetails: (member: Member) => void
  onTransfer: (member: Member) => void
  onRemove: (member: Member) => void
  isReadOnly?: boolean
}

export function MemberRowActions({
  member,
  onViewDetails,
  onTransfer,
  onRemove,
  isReadOnly = false,
}: MemberRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
        aria-label="Tùy chọn thành viên"
        title="Tùy chọn"
      >
        <Icon name="more-vertical" size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-whiteboard rounded-lg shadow-xl border border-neutral-200 py-1 z-30 animate-fade-in">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              onViewDetails(member)
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Icon name="info" size={14} className="text-neutral-500" />
            Xem chi tiết & nhiệm vụ
          </button>

          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onTransfer(member)
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Icon name="refresh" size={14} className="text-neutral-500" />
                Chuyển phòng ban
              </button>

              <div className="my-1 border-t border-neutral-100" />

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onRemove(member)
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-danger-600 hover:bg-danger-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Icon name="user-minus" size={14} className="text-danger-600" />
                Loại bỏ khỏi dự án
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
