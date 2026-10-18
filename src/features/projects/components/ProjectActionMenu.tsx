import { useEffect, useRef } from 'react'
import { Icon } from '@/components/ui'
import type { Project } from '../types'

export interface ProjectActionMenuProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onToggleStatus: () => void
  onDelete: () => void
}

export function ProjectActionMenu({
  project,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
}: ProjectActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isClosed = project.status === 'closed'

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 z-30 w-52 bg-whiteboard rounded-xl shadow-xl border border-neutral-200 py-1.5 text-body-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* 1. Chỉnh sửa */}
      <button
        type="button"
        onClick={() => {
          onClose()
          onEdit()
        }}
        className="w-full px-3.5 py-2 text-left text-neutral-700 hover:bg-neutral-100 flex items-center gap-2.5 transition-colors cursor-pointer"
      >
        <Icon name="edit" size={15} className="text-neutral-500" />
        <span>Chỉnh sửa</span>
      </button>

      {/* 2. Đóng dự án / Mở lại */}
      <button
        type="button"
        onClick={() => {
          onClose()
          onToggleStatus()
        }}
        className="w-full px-3.5 py-2 text-left text-neutral-700 hover:bg-neutral-100 flex items-center justify-between transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Icon name="calendar" size={15} className="text-neutral-500" />
          <span>{isClosed ? 'Mở lại dự án' : 'Đóng dự án'}</span>
        </div>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 border border-neutral-200">
          Khóa
        </span>
      </button>

      {/* Divider */}
      <div className="h-px bg-neutral-200 my-1" />

      {/* 3. Xóa dự án */}
      <button
        type="button"
        onClick={() => {
          onClose()
          onDelete()
        }}
        className="w-full px-3.5 py-2 text-left text-danger-600 hover:bg-danger-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
      >
        <Icon name="trash" size={15} />
        <span>Xóa dự án</span>
      </button>
    </div>
  )
}
