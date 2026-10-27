import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { adminService } from './services/adminService'
import { UserManagementTab } from './components/UserManagementTab'
import { RolePermissionsTab } from './components/RolePermissionsTab'
import { SystemSettingsTab } from './components/SystemSettingsTab'
import { AuditLogsTab } from './components/AuditLogsTab'
import { cn } from '@/lib/utils'

export type AdminTab = 'users' | 'permissions' | 'settings' | 'logs'

export function AdminPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Determine active tab from pathname or searchParams
  const getTabFromPath = (): AdminTab => {
    if (location.pathname.includes('/admin/roles')) return 'permissions'
    if (location.pathname.includes('/admin/settings')) return 'settings'
    if (location.pathname.includes('/admin/logs')) return 'logs'
    if (location.pathname.includes('/admin/users')) return 'users'
    const qTab = searchParams.get('tab') as AdminTab
    if (qTab && ['users', 'permissions', 'settings', 'logs'].includes(qTab)) return qTab
    return 'users'
  }

  const activeTab = getTabFromPath()

  // Listen for service changes to trigger re-render
  const [, setTick] = useState(0)
  useEffect(() => {
    const unsubscribe = adminService.subscribe(() => {
      setTick((t) => t + 1)
    })
    return unsubscribe
  }, [])

  const handleTabChange = (tab: AdminTab) => {
    const routeMap: Record<AdminTab, string> = {
      users: '/admin/users',
      permissions: '/admin/roles',
      settings: '/admin/settings',
      logs: '/admin/logs',
    }
    navigate(routeMap[tab])
  }

  return (
    <div className="min-h-full bg-neutral-950 text-neutral-200">
      {/* Top Navigation Tabs Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-8">
        <div className="flex items-center gap-8 -mb-px">
          <button
            type="button"
            onClick={() => handleTabChange('users')}
            className={cn(
              'py-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2',
              activeTab === 'users'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-100',
            )}
          >
            <Icon name="users" size={16} />
            <span>Người dùng</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('permissions')}
            className={cn(
              'py-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2',
              activeTab === 'permissions'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-100',
            )}
          >
            <Icon name="shield" size={16} />
            <span>Phân quyền</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('settings')}
            className={cn(
              'py-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2',
              activeTab === 'settings'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-100',
            )}
          >
            <Icon name="sliders" size={16} />
            <span>Cấu hình</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('logs')}
            className={cn(
              'py-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2',
              activeTab === 'logs'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-100',
            )}
          >
            <Icon name="clock" size={16} />
            <span>Nhật ký Kiểm toán</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="p-4 sm:p-8 max-w-7xl mx-auto">
        {activeTab === 'users' && (
          <UserManagementTab
            onNavigateToPermissions={() => handleTabChange('permissions')}
          />
        )}
        {activeTab === 'permissions' && <RolePermissionsTab />}
        {activeTab === 'settings' && <SystemSettingsTab />}
        {activeTab === 'logs' && <AuditLogsTab />}
      </main>
    </div>
  )
}

export default AdminPage
