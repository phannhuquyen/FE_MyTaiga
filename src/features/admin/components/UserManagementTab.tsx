import { useState, useMemo } from 'react'
import { Icon } from '@/components/ui'
import { adminService } from '../services/adminService'
import type { AdminUser } from '../types'
import { CreateUserModal } from './CreateUserModal'
import { LockUserModal } from './LockUserModal'
import { UnlockUserModal } from './UnlockUserModal'
import { SelfLockErrorModal } from './SelfLockErrorModal'
import { cn } from '@/lib/utils'

interface UserManagementTabProps {
  onNavigateToPermissions?: () => void
}

export function UserManagementTab({ onNavigateToPermissions }: UserManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [targetLockUser, setTargetLockUser] = useState<AdminUser | null>(null)
  const [targetUnlockUser, setTargetUnlockUser] = useState<AdminUser | null>(null)
  const [isSelfLockErrorOpen, setIsSelfLockErrorOpen] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  // Load live data from service
  const users = adminService.getUsers()

  const activeCount = useMemo(() => users.filter((u) => u.status === 'active').length, [users])
  const lockedCount = useMemo(() => users.filter((u) => u.status === 'locked').length, [users])
  const adminCount = useMemo(() => users.filter((u) => u.role === 'admin').length, [users])

  // Filtered list
  const filteredUsers = useMemo(() => {
    return adminService.getUsers({
      search: searchTerm,
      role: roleFilter,
      status: statusFilter,
    })
  }, [searchTerm, roleFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const handleLockClick = (user: AdminUser) => {
    if (user.isSelf || user.email === 'quocbao.admin@scrumban.io') {
      setIsSelfLockErrorOpen(true)
      return
    }
    setTargetLockUser(user)
  }

  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === paginatedUsers.length) {
      setSelectedUserIds([])
    } else {
      setSelectedUserIds(paginatedUsers.map((u) => u.id))
    }
  }

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header (S14-01 & S14-05) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Quản lý Người dùng
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
              {users.length} tài khoản
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Cài đặt dự án & tổ chức / Tài khoản & Truy cập
          </p>
        </div>

        {/* Status Indicators Top Right */}
        <div className="flex items-center gap-3 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <strong className="text-neutral-900 dark:text-neutral-100">{activeCount}</strong> Hoạt động
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
            <strong className="text-neutral-900 dark:text-neutral-100">{lockedCount}</strong> Đã khóa
          </span>
        </div>
      </div>

      {/* KPI Overview Cards (S14-05) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">
              Tổng tài khoản
            </span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5 block">
              {users.length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
            <Icon name="users" size={22} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">
              Quản trị viên (Admin)
            </span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5 block">
              {adminCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Icon name="shield" size={22} />
          </div>
        </div>
      </div>

      {/* Filter / Action Bar (S14-01 & S14-05) */}
      <div className="p-4 rounded-2xl bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm theo họ tên, email..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="all">Vai trò: Tất cả</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="manager">Quản lý (Manager)</option>
            <option value="member">Thành viên (Member)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="all">Trạng thái: Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã khóa</option>
          </select>

          {/* Reset button */}
          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Đặt lại bộ lọc"
            >
              <Icon name="refresh" size={14} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        {/* Add User Button */}
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-whiteboard text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Icon name="plus" size={16} />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Users Table (S14-01 & S14-05) */}
      <div className="bg-whiteboard dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedUserIds.length > 0 &&
                      selectedUserIds.length === paginatedUsers.length
                    }
                    onChange={handleToggleSelectAll}
                    className="rounded text-primary-600 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Người dùng / Định danh</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 hidden md:table-cell">Lần đăng nhập cuối</th>
                <th className="py-3 px-4 hidden lg:table-cell">Dự án tham gia</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <Icon name="users" size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-xs">Không tìm thấy người dùng nào phù hợp</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isChecked = selectedUserIds.includes(u.id)
                  const isSelf = u.isSelf || u.email === 'quocbao.admin@scrumban.io'

                  return (
                    <tr
                      key={u.id}
                      className={cn(
                        'hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors',
                        isChecked && 'bg-primary-50/40 dark:bg-primary-950/20',
                      )}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectUser(u.id)}
                          className="rounded text-primary-600 cursor-pointer"
                        />
                      </td>

                      {/* User identity & avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full text-whiteboard flex items-center justify-center font-bold text-xs shrink-0',
                              u.bgColor || 'bg-neutral-700',
                            )}
                          >
                            {u.avatarCode}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                {u.name}
                              </span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  BẠN
                                </span>
                              )}
                              {u.isOwner && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                  Chính chủ
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 font-mono">
                              ID: {u.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-300 text-[11px]">
                        {u.email}
                      </td>

                      {/* Role badge */}
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold',
                            u.role === 'admin' &&
                              'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900',
                            u.role === 'manager' &&
                              'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-900',
                            u.role === 'member' &&
                              'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700',
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              u.role === 'admin' && 'bg-rose-600',
                              u.role === 'manager' && 'bg-teal-600',
                              u.role === 'member' && 'bg-neutral-400',
                            )}
                          />
                          <span>
                            {u.role === 'admin'
                              ? 'Admin'
                              : u.role === 'manager'
                              ? 'Manager'
                              : 'Member'}
                          </span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {u.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Đang hoạt động</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-neutral-400" />
                            <span>Đã khóa</span>
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 hidden md:table-cell text-[11px] text-neutral-600 dark:text-neutral-400">
                        <div>{u.lastLogin}</div>
                        {u.lastLoginIp && (
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {u.lastLoginIp}
                          </div>
                        )}
                      </td>

                      {/* Projects */}
                      <td className="py-3 px-4 hidden lg:table-cell text-[11px] text-neutral-600 dark:text-neutral-400">
                        {u.projectAccess}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {}}
                            className="px-2 py-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded text-xs font-medium cursor-pointer"
                          >
                            Sửa
                          </button>

                          {u.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => handleLockClick(u)}
                              className={cn(
                                'px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer',
                                isSelf
                                  ? 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50',
                              )}
                              title={isSelf ? 'Không thể khóa tài khoản chính mình' : 'Khóa tài khoản'}
                            >
                              Khóa
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setTargetUnlockUser(u)}
                              className="px-2 py-1 rounded text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-1 cursor-pointer"
                              title="Mở khóa tài khoản"
                            >
                              <Icon name="unlock" size={13} />
                              <span>Mở khóa</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row (S14-01 & S14-05) */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            Hiển thị <strong>{(currentPage - 1) * pageSize + 1}</strong> -{' '}
            <strong>{Math.min(currentPage * pageSize, filteredUsers.length)}</strong> của{' '}
            <strong>{filteredUsers.length}</strong> người dùng
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
            >
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={cn(
                  'w-8 h-8 rounded-lg font-semibold cursor-pointer transition-colors',
                  currentPage === p
                    ? 'bg-emerald-700 text-whiteboard'
                    : 'border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
                )}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Root Administrator Protection Rule (S14-05) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Icon name="shield" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Quy tắc bảo vệ phân quyền Root Administrator
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Hệ thống bắt buộc duy trì tối thiểu 1 Quản trị viên đang kích hoạt để kiểm soát phân quyền công ty. Mọi hành động tự hạ cấp hoặc khóa chính mình bị chặn ở tầng dữ liệu.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNavigateToPermissions}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-whiteboard dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 shrink-0 cursor-pointer shadow-xs"
        >
          Xem tài liệu phân quyền
        </button>
      </div>

      {/* Security Policies Overview (S14-01) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Icon name="shield" size={18} />
          </div>
          <div>
            <h5 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              Chính sách 2FA
            </h5>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Bắt buộc đối với vai trò Quản trị viên và Quản lý dự án.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Icon name="clock" size={18} />
          </div>
          <div>
            <h5 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              Thời hạn phiên đăng nhập
            </h5>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Hết hạn sau 8 giờ làm việc liên tục hoặc 30 phút không hoạt động.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Icon name="mail" size={18} />
          </div>
          <div>
            <h5 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              Thư mời tham gia
            </h5>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Liên kết kích hoạt tài khoản có hiệu lực trong vòng 48 giờ.
            </p>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateUser={(payload) => {
          adminService.createUser(payload)
        }}
      />

      <LockUserModal
        isOpen={!!targetLockUser}
        onClose={() => setTargetLockUser(null)}
        user={targetLockUser}
        onConfirmLock={(userId, reason, auditNote) => {
          adminService.lockUser(userId, reason, auditNote)
        }}
      />

      <UnlockUserModal
        isOpen={!!targetUnlockUser}
        onClose={() => setTargetUnlockUser(null)}
        user={targetUnlockUser}
        onConfirmUnlock={(userId) => {
          adminService.unlockUser(userId)
        }}
      />

      <SelfLockErrorModal
        isOpen={isSelfLockErrorOpen}
        onClose={() => setIsSelfLockErrorOpen(false)}
      />
    </div>
  )
}
