import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { cn } from '@/lib/utils'

export interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface NavItem {
  label: string
  to: string
  iconName: IconName
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/logged-out')
  }

  const navItems: NavItem[] = [
    {
      label: 'Dự án của tôi',
      to: '/projects',
      iconName: 'folder',
    },
    {
      label: 'Tổng quan',
      to: '/dashboard',
      iconName: 'dashboard',
    },
    {
      label: 'Bảng Kanban',
      to: '/kanban',
      iconName: 'kanban',
    },
    {
      label: 'Backlog',
      to: '/backlog',
      iconName: 'backlog',
    },
    {
      label: 'Sprint',
      to: '/sprints',
      iconName: 'sprint',
    },
    {
      label: 'Epic',
      to: '/epics',
      iconName: 'epic',
    },
    {
      label: 'Lỗi (Bug)',
      to: '/bugs',
      iconName: 'bug',
    },
    {
      label: 'Flow Metrics',
      to: '/metrics',
      iconName: 'metrics',
    },
    {
      label: 'Trao đổi',
      to: '/chat',
      iconName: 'chat',
    },
    {
      label: 'Hoạt động',
      to: '/activity',
      iconName: 'clock',
    },
    {
      label: 'Thành viên',
      to: '/members',
      iconName: 'members',
    },
    {
      label: 'Hồ sơ cá nhân',
      to: '/profile',
      iconName: 'settings',
    },
    {
      label: 'Thư viện Icon (Dev)',
      to: '/icons',
      iconName: 'sliders',
    },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/60 lg:hidden backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 text-neutral-300 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-neutral-800',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Project Selector Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-3 min-w-0">
            {/* Green icon emblem */}
            <div className="w-8 h-8 rounded bg-primary-500 flex items-center justify-center text-whiteboard shrink-0 font-bold text-sm tracking-wider shadow-sm">
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-4 bg-whiteboard rounded-xs" />
                <span className="w-1.5 h-2.5 bg-whiteboard/70 rounded-xs" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-body-medium font-semibold text-whiteboard truncate">
                ScrumBan Core
              </div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500 shrink-0" />
                <span>Quản lý</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              navigate('/projects')
              onClose?.()
            }}
            className="text-neutral-400 hover:text-neutral-200 p-1 rounded transition-colors cursor-pointer"
            title="Đổi dự án"
          >
            <Icon name="chevrons-up-down" size={16} />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-label-uppercase font-semibold tracking-wider text-neutral-400">
              KHÔNG GIAN LÀM VIỆC
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.to ||
                  (item.to === '/projects' &&
                    (location.pathname === '/' ||
                      location.pathname.startsWith('/projects')))

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded text-body-medium transition-colors cursor-pointer',
                      isActive
                        ? 'bg-neutral-800 text-whiteboard font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50',
                    )}
                  >
                    <span
                      className={cn(
                        'shrink-0',
                        isActive ? 'text-primary-400' : 'text-neutral-400',
                      )}
                    >
                      <Icon name={item.iconName} size={16} />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Section: Quản trị dự án (S14-01, S14-05, S14-06, S14-07) */}
          <div className="pt-2">
            <div className="px-3 mb-2 text-label-uppercase font-semibold tracking-wider text-neutral-400">
              QUẢN TRỊ DỰ ÁN
            </div>
            <nav className="space-y-1">
              <Link
                to="/projects"
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded text-body-medium transition-colors cursor-pointer',
                  location.pathname === '/projects'
                    ? 'bg-neutral-800 text-whiteboard font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50',
                )}
              >
                <span className={cn('shrink-0', location.pathname === '/projects' ? 'text-primary-400' : 'text-neutral-400')}>
                  <Icon name="settings" size={16} />
                </span>
                <span className="truncate">Cài đặt dự án</span>
              </Link>

              <Link
                to="/admin"
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded text-body-medium transition-colors cursor-pointer',
                  location.pathname.startsWith('/admin')
                    ? 'bg-neutral-800 text-whiteboard font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50',
                )}
              >
                <span className={cn('shrink-0', location.pathname.startsWith('/admin') ? 'text-primary-400' : 'text-neutral-400')}>
                  <Icon name="shield" size={16} />
                </span>
                <span className="truncate">Cài đặt hệ thống (Admin)</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-neutral-800 flex items-center justify-between">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity cursor-pointer group"
            title="Xem hồ sơ cá nhân"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-neutral-700 text-whiteboard flex items-center justify-center text-xs font-semibold group-hover:ring-2 group-hover:ring-primary-500 transition-all">
                {user?.avatarCode || 'MQ'}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-success-500 ring-2 ring-neutral-900" />
            </div>
            <div className="min-w-0">
              <div className="text-body-sm font-semibold text-whiteboard truncate group-hover:text-primary-400 transition-colors">
                {user?.name || 'Nguyễn Minh Quân'}
              </div>
              <div className="text-[11px] text-neutral-400 truncate">
                {user?.role || 'Quản lý dự án'}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleLogout}
              className="text-neutral-400 hover:text-danger-400 p-1.5 rounded transition-colors cursor-pointer"
              title="Đăng xuất"
              aria-label="Đăng xuất khỏi hệ thống"
            >
              <Icon name="log-out" size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
