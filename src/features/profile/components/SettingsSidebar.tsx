import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface SettingsNavItem {
  label: string
  to: string
  badge?: string
}

export function SettingsSidebar() {
  const location = useLocation()

  const accountNav: SettingsNavItem[] = [
    { label: 'Hồ sơ cá nhân', to: '/profile' },
    { label: 'Mật khẩu & Bảo mật', to: '/profile/security' },
    { label: 'Thông báo cá nhân', to: '/profile/notifications' },
  ]

  const orgNav: SettingsNavItem[] = [
    { label: 'Dự án tham gia', to: '/profile/projects' },
    { label: 'Tích hợp', to: '/profile/integrations' },
  ]

  return (
    <aside className="w-56 shrink-0 bg-neutral-900 border-r border-neutral-800 p-4 flex flex-col gap-6 text-neutral-300">
      <div>
        <h2 className="text-body-large font-bold text-whiteboard px-2 mb-4">
          Cài đặt
        </h2>

        {/* Section 1 */}
        <div className="space-y-1 mb-6">
          <div className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase px-2 mb-2">
            TÀI KHOẢN CỦA TÔI
          </div>
          <nav className="space-y-0.5">
            {accountNav.map((item) => {
              const isActive =
                location.pathname === item.to ||
                (item.to === '/profile' &&
                  (location.pathname === '/profile' || location.pathname === '/settings/profile'))

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'block px-3 py-2 rounded-md text-body-sm transition-colors cursor-pointer',
                    isActive
                      ? 'bg-primary-500 text-whiteboard font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-whiteboard hover:bg-neutral-800/60',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Section 2 */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase px-2 mb-2">
            TỔ CHỨC & DỰ ÁN
          </div>
          <nav className="space-y-0.5">
            {orgNav.map((item) => {
              const isActive = location.pathname === item.to

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'block px-3 py-2 rounded-md text-body-sm transition-colors cursor-pointer',
                    isActive
                      ? 'bg-primary-500 text-whiteboard font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-whiteboard hover:bg-neutral-800/60',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}
