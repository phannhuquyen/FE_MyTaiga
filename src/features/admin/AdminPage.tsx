import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { adminService } from './services/adminService'
import { UserManagementTab } from './components/UserManagementTab'
import { RolePermissionsTab } from './components/RolePermissionsTab'
import { SystemSettingsTab } from './components/SystemSettingsTab'
import { cn } from '@/lib/utils'

export type AdminTab = 'users' | 'permissions' | 'settings'

export function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as AdminTab) || 'users'

  // Listen for service changes to trigger re-render
  const [, setTick] = useState(0)
  useEffect(() => {
    const unsubscribe = adminService.subscribe(() => {
      setTick((t) => t + 1)
    })
    return unsubscribe
  }, [])

  const handleTabChange = (tab: AdminTab) => {
    setSearchParams({ tab })
  }

  return (
    <div className="min-h-full bg-neutral-100/50 dark:bg-neutral-950">
      {/* Top Navigation Tabs Header (S14-01, S14-05, S14-06, S14-07) */}
      <div className="bg-whiteboard dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8">
        <div className="flex items-center gap-8 -mb-px">
          <button
            type="button"
            onClick={() => handleTabChange('users')}
            className={cn(
              'py-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2',
              activeTab === 'users'
                ? 'border-emerald-700 text-emerald-800 dark:border-emerald-500 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200',
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
                ? 'border-emerald-700 text-emerald-800 dark:border-emerald-500 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200',
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
                ? 'border-emerald-700 text-emerald-800 dark:border-emerald-500 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200',
            )}
          >
            <Icon name="sliders" size={16} />
            <span>Cấu hình</span>
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
      </main>
    </div>
  )
}

export default AdminPage
