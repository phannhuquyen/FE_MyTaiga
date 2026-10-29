import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/services/api'
import { Icon } from '@/components/ui'
import type { BugAssignee } from '../types'

interface AssigneePickerPopoverProps {
  currentAssignee?: BugAssignee
  onSelect: (assigneeId?: string) => Promise<void>
  onClose: () => void
  onDeleteRequest?: () => void
}

export function AssigneePickerPopover({
  currentAssignee,
  onSelect,
  onClose,
  onDeleteRequest,
}: AssigneePickerPopoverProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<'All' | 'Dev' | 'QA' | 'DevOps'>('All')
  const [isUpdating, setIsUpdating] = useState(false)
  const { projectId } = useParams()
  const [members, setMembers] = useState<BugAssignee[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    if (projectId) api.projectMembers.list(Number(projectId), { pageSize: 100 }).then(res => {
      if (!cancelled) setMembers(res.data.items.map(member => ({ id: String(member.userId), name: member.fullName, email: member.email, role: member.projectRole, avatar: member.fullName.slice(0, 2), statusText: 'Chưa có dữ liệu khả dụng' })))
    }).catch(() => { if (!cancelled) setError('Không thể tải thành viên dự án.') })
    return () => { cancelled = true }
  }, [projectId])

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept =
      departmentFilter === 'All' || member.department === departmentFilter
    return matchesSearch && matchesDept
  })

  const handlePick = async (id?: string) => {
    try {
      setIsUpdating(true)
      await onSelect(id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu người xử lý.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-30 overflow-hidden text-xs">
      {error && <p role="alert" className="p-2 text-error-700">{error}</p>}
      {/* Search Bar */}
      <div className="p-2.5 border-b border-neutral-100 dark:border-neutral-700">
        <div className="relative">
          <Icon
            name="search"
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm thành viên..."
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
            autoFocus
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-2">
          {(['All', 'Dev', 'QA', 'DevOps'] as const).map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setDepartmentFilter(dept)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                departmentFilter === dept
                  ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {dept === 'All' ? 'Tất cả' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Members list */}
      <div className="max-h-52 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-700/50">
        {filteredMembers.map((member) => {
          const isSelected = currentAssignee?.id === member.id
          return (
            <button
              key={member.id}
              type="button"
              disabled={isUpdating}
              onClick={() => handlePick(member.id)}
              className={`w-full text-left p-2.5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/40 transition-colors ${
                isSelected ? 'bg-primary-50/50 dark:bg-primary-950/30' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 font-bold flex items-center justify-center text-[11px] shrink-0">
                  {member.avatar || member.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-100">
                    <span>{member.name}</span>
                    <span className="text-[10px] px-1 py-0.2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded">
                      {member.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        member.activeBugCount && member.activeBugCount > 1
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span>{member.statusText || 'Sẵn sàng'}</span>
                  </div>
                </div>
              </div>
              {isSelected && <Icon name="check" size={15} className="text-primary-600 shrink-0" />}
            </button>
          )
        })}
      </div>

      {/* Unassign button */}
      {currentAssignee && (
        <button
          type="button"
          onClick={() => handlePick(undefined)}
          className="w-full p-2 text-center text-[11px] font-medium text-neutral-500 hover:text-danger-600 border-t border-neutral-100 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors flex items-center justify-center gap-1"
        >
          <Icon name="user-minus" size={13} />
          Hủy gán người xử lý
        </button>
      )}

      {/* Fast actions section */}
      <div className="p-2 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-1">
        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1 mb-1">
          Hành động nhanh
        </div>
        <button
          type="button"
          onClick={() => alert('Đã chuyển thành User Story trên Backlog')}
          className="w-full text-left px-2 py-1 rounded text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between"
        >
          <span>Chuyển thành User Story</span>
          <Icon name="chevron-right" size={12} className="text-neutral-400" />
        </button>
        <button
          type="button"
          onClick={() => alert('Liên kết tới GitHub PR #382')}
          className="w-full text-left px-2 py-1 rounded text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between"
        >
          <span>Liên kết PR GitHub</span>
          <span className="text-[11px] text-neutral-400">#382</span>
        </button>
        {onDeleteRequest && (
          <button
            type="button"
            onClick={() => {
              onClose()
              onDeleteRequest()
            }}
            className="w-full text-left px-2 py-1 rounded text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/40 flex items-center gap-1.5"
          >
            <Icon name="trash" size={12} />
            <span>Xóa báo cáo lỗi này</span>
          </button>
        )}
      </div>

      {/* Permission note */}
      <div className="p-2 bg-neutral-100/70 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
        <Icon name="lock" size={12} className="shrink-0" />
        <span>Quyền hạn: Chỉ Quản lý và Người báo cáo có quyền chỉ định người xử lý.</span>
      </div>
    </div>
  )
}
