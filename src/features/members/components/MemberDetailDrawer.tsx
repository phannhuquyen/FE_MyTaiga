import { Icon } from '@/components/ui'
import type { Member } from '../types'

interface MemberDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  member: Member | null
  onOpenTransfer: (member: Member) => void
  onOpenRemove: (member: Member) => void
  isReadOnly?: boolean
}

export function MemberDetailDrawer({
  isOpen,
  onClose,
  member,
  onOpenTransfer,
  onOpenRemove,
  isReadOnly = false,
}: MemberDetailDrawerProps) {
  if (!isOpen || !member) return null

  const tasks = member.assignedTasks || []
  const files = member.sharedFiles || [
    { name: 'swagger_spec.yaml', size: '142 KB', time: '10:18', type: 'spec' as const },
    { name: 'k6_test_report.pdf', size: '2.4 MB', time: '10:42', type: 'report' as const },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-whiteboard shadow-2xl border-l border-neutral-200 flex flex-col animate-slide-left overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-2 text-neutral-800 font-semibold text-body-medium">
            <Icon name="info" size={18} className="text-primary-600" />
            <span id="member-drawer-title">Thông tin thành viên & Nhóm</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 transition-colors cursor-pointer"
            aria-label="Đóng bảng chi tiết"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Member Card */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-whiteboard shadow-xs text-center">
            <div className="relative inline-block mx-auto mb-3">
              <div className="w-16 h-16 rounded-full bg-primary-800 text-whiteboard text-title-small font-bold flex items-center justify-center shadow-sm">
                {member.avatarCode}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-whiteboard ${
                  member.isOnline ? 'bg-success-500' : 'bg-neutral-400'
                }`}
                title={member.isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
              />
            </div>

            <h3 className="text-title-small font-bold text-neutral-900">{member.name}</h3>
            <div className="text-body-sm text-neutral-500 font-medium mt-0.5">{member.email}</div>

            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  member.role === 'manager'
                    ? 'bg-primary-100 text-primary-800 border border-primary-200'
                    : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                }`}
              >
                {member.role === 'manager' ? 'Quản lý dự án' : member.role === 'lead' ? 'Trưởng nhóm' : 'Thành viên'}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                {member.roleTitle}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-left text-xs">
              <div>
                <span className="text-neutral-400 block">Phòng ban:</span>
                <span className="font-semibold text-neutral-800 truncate block">
                  {member.departmentName}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block">Ngày tham gia:</span>
                <span className="font-semibold text-neutral-800">{member.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Squad / Team Info */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary-700 text-whiteboard flex items-center justify-center font-bold text-xs">
                <Icon name="users" size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-body-sm text-neutral-900 truncate">
                  Core Engineering & Release Squad
                </div>
                <div className="text-[11px] text-neutral-500 truncate">
                  Kênh trao đổi kỹ thuật & release Sprint 14
                </div>
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-2 pt-2 border-t border-neutral-200/60">
              <Icon name="calendar" size={13} className="text-neutral-400" />
              <span>Tạo ngày 12/10/2024 bởi Minh Quân</span>
            </div>
          </div>

          {/* Assigned Tasks Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                CÔNG VIỆC PHỤ TRÁCH ({tasks.length})
              </div>
              <span className="text-xs text-primary-600 font-medium">Sprint 14</span>
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg border border-neutral-200 bg-whiteboard shadow-2xs hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-primary-700">{task.id}</span>
                      <span className="px-1.5 py-0.2 rounded font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        {task.status}
                      </span>
                    </div>
                    <div className="text-body-sm font-medium text-neutral-800">{task.title}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50 text-center text-xs text-neutral-500">
                Chưa có thẻ công việc nào được gán cho thành viên này trong Sprint hiện tại.
              </div>
            )}
          </div>

          {/* Shared Files Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                TỆP ĐÃ CHIA SẺ ({files.length})
              </div>
              <button type="button" className="text-xs text-primary-600 hover:underline">
                Xem tất cả
              </button>
            </div>

            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 bg-whiteboard hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                      <Icon name="file-text" size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-neutral-900 truncate">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {file.size} • {file.time}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                    title="Tải về"
                  >
                    <Icon name="download" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Administration Actions (Hidden in Read-only view) */}
          {!isReadOnly && (
            <div className="pt-4 border-t border-neutral-200 space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                KHU VỰC QUẢN TRỊ (MANAGER)
              </div>
              <button
                type="button"
                onClick={() => onOpenTransfer(member)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-body-sm font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
              >
                <Icon name="refresh" size={15} />
                Chuyển phòng ban công tác
              </button>
              <button
                type="button"
                onClick={() => onOpenRemove(member)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-body-sm font-medium text-danger-700 bg-danger-50 hover:bg-danger-100 border border-danger-200 rounded-lg transition-colors cursor-pointer"
              >
                <Icon name="user-minus" size={15} />
                Loại bỏ khỏi dự án
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
