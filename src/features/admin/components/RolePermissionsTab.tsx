import { useState, useMemo } from 'react'
import { Icon } from '@/components/ui'
import { adminService } from '../services/adminService'
import type { PermissionGroup } from '../types'

export function RolePermissionsTab() {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(() =>
    adminService.getPermissionGroups(),
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Baseline to detect unsaved changes
  const baselineGroups = useMemo(() => adminService.getPermissionGroups(), [])

  // Calculate changes count
  const dirtyCount = useMemo(() => {
    let count = 0
    permissionGroups.forEach((g, gIdx) => {
      const baseGroup = baselineGroups[gIdx]
      if (!baseGroup) return
      g.operations.forEach((op, opIdx) => {
        const baseOp = baseGroup.operations[opIdx]
        if (!baseOp) return
        if (op.admin !== baseOp.admin) count++
        if (op.manager !== baseOp.manager) count++
        if (op.member !== baseOp.member) count++
      })
    })
    return count
  }, [permissionGroups, baselineGroups])

  // Filter groups and operations based on search
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return permissionGroups
    const q = searchTerm.toLowerCase().trim()
    return permissionGroups
      .map((group) => {
        const matchedOps = group.operations.filter(
          (op) =>
            op.name.toLowerCase().includes(q) ||
            op.description.toLowerCase().includes(q) ||
            group.name.toLowerCase().includes(q),
        )
        return {
          ...group,
          operations: matchedOps,
        }
      })
      .filter((group) => group.operations.length > 0)
  }, [permissionGroups, searchTerm])

  const handleToggle = (
    groupId: string,
    opId: string,
    role: 'admin' | 'manager' | 'member',
  ) => {
    // Prevent unchecking system admin for Admin to preserve safety
    if (groupId === 'group-system' && role === 'admin') return

    setPermissionGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g
        return {
          ...g,
          operations: g.operations.map((op) => {
            if (op.id !== opId) return op
            return {
              ...op,
              [role]: !op[role],
            }
          }),
        }
      }),
    )
    setSaveSuccess(false)
  }

  const handleSave = () => {
    adminService.savePermissionGroups(permissionGroups)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleReset = () => {
    adminService.resetPermissionGroups()
    setPermissionGroups(adminService.getPermissionGroups())
    setSaveSuccess(false)
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header (S14-06) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
            <Icon name="shield" size={14} />
            <span>Hệ thống phân quyền RBAC</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Phân quyền Vai trò
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Cấu hình ma trận quyền hạn cho 3 vai trò hệ thống: Admin, Manager và Member
          </p>
        </div>

        {/* Matrix Version Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-400 font-medium shrink-0">
          <Icon name="clock" size={14} className="text-neutral-400" />
          <span>Phiên bản ma trận: <strong className="font-mono text-neutral-900 dark:text-neutral-100">v2.4-stable</strong></span>
        </div>
      </div>

      {/* Search Bar & Helper Alert (S14-06) */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm chức năng, quyền hạn hoặc hành động..."
            className="w-full pl-10 pr-4 py-2.5 bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-xs"
          />
        </div>

        <div className="p-2.5 px-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200 flex items-center gap-2 shrink-0">
          <Icon name="info" size={15} className="text-cyan-600 shrink-0" />
          <span>Thay đổi phân quyền có hiệu lực ngay trong phiên làm việc tiếp theo của người dùng.</span>
        </div>
      </div>

      {/* Permissions Matrix Table (S14-06) */}
      <div className="bg-whiteboard dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40">
                <th className="py-4 px-6 font-bold text-neutral-800 dark:text-neutral-200 w-2/5">
                  <div className="flex items-center gap-2">
                    <span>Nhóm chức năng & Thao tác</span>
                    <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                      11 Thao tác
                    </span>
                  </div>
                </th>

                {/* Role 1: Admin */}
                <th className="py-4 px-6 text-center w-1/5 bg-amber-50/30 dark:bg-amber-950/10 border-l border-neutral-200 dark:border-neutral-800">
                  <div className="flex flex-col items-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      <span>Admin</span>
                    </span>
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      Quản trị viên
                    </span>
                    <span className="text-[11px] text-neutral-400 font-normal mt-0.5">
                      Toàn quyền hệ thống
                    </span>
                  </div>
                </th>

                {/* Role 2: Manager */}
                <th className="py-4 px-6 text-center w-1/5 border-l border-neutral-200 dark:border-neutral-800">
                  <div className="flex flex-col items-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      <span>Manager</span>
                    </span>
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      Quản lý / Scrum Master
                    </span>
                    <span className="text-[11px] text-neutral-400 font-normal mt-0.5">
                      Điều phối & Phân phối
                    </span>
                  </div>
                </th>

                {/* Role 3: Member */}
                <th className="py-4 px-6 text-center w-1/5 border-l border-neutral-200 dark:border-neutral-800">
                  <div className="flex flex-col items-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      <span>Member</span>
                    </span>
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      Thành viên phát triển
                    </span>
                    <span className="text-[11px] text-neutral-400 font-normal mt-0.5">
                      Thực thi công việc
                    </span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredGroups.map((group) => (
                <tr key={group.id} className="border-b border-neutral-200 dark:border-neutral-800">
                  <td colSpan={4} className="p-0">
                    {/* Group Header Banner */}
                    <div className="py-3 px-6 bg-neutral-100/70 dark:bg-neutral-800/60 font-bold text-xs text-neutral-800 dark:text-neutral-200 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center gap-2">
                        <Icon name={group.iconName as any} size={16} className="text-emerald-700 dark:text-emerald-400" />
                        <span>{group.name}</span>
                      </div>
                      {group.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                          {group.badge}
                        </span>
                      )}
                    </div>

                    {/* Operations rows inside group */}
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                      {group.operations.map((op) => (
                        <div
                          key={op.id}
                          className="flex items-center hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                        >
                          {/* Operation Info */}
                          <div className="py-3 px-6 w-2/5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs">
                                {op.name}
                              </span>
                              {op.badge && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                  {op.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                              {op.description}
                            </p>
                          </div>

                          {/* Admin checkbox */}
                          <div className="py-3 px-6 w-1/5 flex justify-center border-l border-neutral-100 dark:border-neutral-800/80 bg-amber-50/15 dark:bg-amber-950/5">
                            <button
                              type="button"
                              onClick={() => handleToggle(group.id, op.id, 'admin')}
                              className="w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                              title="Quyền Admin"
                            >
                              {op.admin ? (
                                <div className="w-5 h-5 rounded-md bg-emerald-700 text-whiteboard flex items-center justify-center shadow-xs">
                                  <Icon name="check" size={13} />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-md border-2 border-neutral-300 dark:border-neutral-600" />
                              )}
                            </button>
                          </div>

                          {/* Manager checkbox */}
                          <div className="py-3 px-6 w-1/5 flex justify-center border-l border-neutral-100 dark:border-neutral-800/80">
                            <button
                              type="button"
                              onClick={() => handleToggle(group.id, op.id, 'manager')}
                              className="w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                              title="Quyền Manager"
                            >
                              {op.manager ? (
                                <div className="w-5 h-5 rounded-md bg-emerald-700 text-whiteboard flex items-center justify-center shadow-xs">
                                  <Icon name="check" size={13} />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-md border-2 border-neutral-300 dark:border-neutral-600" />
                              )}
                            </button>
                          </div>

                          {/* Member checkbox */}
                          <div className="py-3 px-6 w-1/5 flex justify-center border-l border-neutral-100 dark:border-neutral-800/80">
                            <button
                              type="button"
                              onClick={() => handleToggle(group.id, op.id, 'member')}
                              className="w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                              title="Quyền Member"
                            >
                              {op.member ? (
                                <div className="w-5 h-5 rounded-md bg-emerald-700 text-whiteboard flex items-center justify-center shadow-xs">
                                  <Icon name="check" size={13} />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-md border-2 border-neutral-300 dark:border-neutral-600" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Save Floating Bar (S14-06) */}
      {(dirtyCount > 0 || saveSuccess) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-4 duration-200">
          <div className="p-3.5 px-5 rounded-2xl bg-whiteboard dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-neutral-800 dark:text-neutral-200">
              {saveSuccess ? (
                <>
                  <Icon name="check-circle" size={16} className="text-emerald-600" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Đã lưu ma trận phân quyền thành công!
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-ping" />
                  <span>
                    Bạn có <strong>{dirtyCount}</strong> thay đổi chưa lưu trong ma trận phân quyền
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Đặt lại
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-whiteboard flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Icon name="check" size={14} />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
