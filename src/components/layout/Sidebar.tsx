import { Link, useLocation, useMatch, useNavigate, useParams } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { projectService } from '@/features/projects/services/projectService'
import type { Project } from '@/features/projects/types'

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

  // Detect if we're inside a project route (Tier 2)
  const projectMatch = useMatch('/projects/:projectId/*')
  const { projectId } = useParams<{ projectId: string }>()
  const activeProjectId = projectMatch ? (projectId ?? null) : null

  // Fetch project name for Tier-2 header
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  useEffect(() => {
    if (!activeProjectId) {
      setActiveProject(null)
      return
    }
    projectService.getProjects('active').then((list) => {
      const found = list.find((p) => String(p.id) === activeProjectId) ?? null
      setActiveProject(found)
    }).catch(() => setActiveProject(null))
  }, [activeProjectId])

  const handleLogout = async () => {
    await logout()
    navigate('/logged-out')
  }

  // ── Tier-1 nav items (account level) ──
  const tier1Items: NavItem[] = [
    { label: 'Dự án của tôi', to: '/projects', iconName: 'folder' },
    { label: 'Thông báo', to: '/notifications', iconName: 'bell' },
    { label: 'Trao đổi', to: '/chat', iconName: 'chat' },
    { label: 'Hoạt động', to: '/activity', iconName: 'clock' },
  ]

  // ── Tier-2 nav items (project level) ──
  const tier2Items: NavItem[] = [
    { label: 'Tổng quan', to: `/projects/${activeProjectId}/dashboard`, iconName: 'dashboard' },
    { label: 'Backlog', to: `/projects/${activeProjectId}/backlog`, iconName: 'backlog' },
    { label: 'Sprint', to: `/projects/${activeProjectId}/sprints`, iconName: 'sprint' },
    { label: 'Epic', to: `/projects/${activeProjectId}/epics`, iconName: 'epic' },
    { label: 'Bảng Kanban', to: `/projects/${activeProjectId}/kanban`, iconName: 'kanban' },
    { label: 'Lỗi (Bug)', to: `/projects/${activeProjectId}/bugs`, iconName: 'bug' },
    { label: 'Flow Metrics', to: `/projects/${activeProjectId}/metrics`, iconName: 'metrics' },
    { label: 'Thành viên', to: `/projects/${activeProjectId}/members`, iconName: 'members' },
  ]

  const isNavItemActive = (item: NavItem) => {
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/')
  }

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
        {/* ── Header ── */}
        {activeProjectId ? (
          /* Tier-2 header: project name + back button */
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded bg-primary-500 flex items-center justify-center text-whiteboard shrink-0 font-bold text-sm tracking-wider shadow-sm">
                <span className="flex items-center gap-0.5">
                  <span className="w-1.5 h-4 bg-whiteboard rounded-xs" />
                  <span className="w-1.5 h-2.5 bg-whiteboard/70 rounded-xs" />
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-body-medium font-semibold text-whiteboard truncate" title={activeProject?.name ?? 'Dự án'}>
                  {activeProject?.name ?? `Dự án #${activeProjectId}`}
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-500 shrink-0" />
                  <span>{activeProject?.statusText ?? 'Đang hoạt động'}</span>
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
              title="Quay lại danh sách dự án"
            >
              <Icon name="chevrons-up-down" size={16} />
            </button>
          </div>
        ) : (
          /* Tier-1 header: app brand */
          <div className="flex items-center gap-3 p-4 border-b border-neutral-800">
            <div className="w-8 h-8 rounded bg-primary-500 flex items-center justify-center text-whiteboard shrink-0 font-bold text-sm tracking-wider shadow-sm">
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-4 bg-whiteboard rounded-xs" />
                <span className="w-1.5 h-2.5 bg-whiteboard/70 rounded-xs" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-body-medium font-semibold text-whiteboard truncate">
                MyTaiga
              </div>
              <div className="text-[11px] text-neutral-400">Không gian làm việc</div>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {activeProjectId ? (
            /* ── Tier-2: Project-level navigation ── */
            <>
              {/* Back to projects link */}
              <div>
                <button
                  type="button"
                  onClick={() => { navigate('/projects'); onClose?.() }}
                  className="flex items-center gap-2 px-3 py-1.5 w-full text-neutral-400 hover:text-neutral-200 text-body-sm transition-colors cursor-pointer rounded hover:bg-neutral-800/50"
                >
                  <Icon name="chevron-left" size={14} />
                  <span>Dự án của tôi</span>
                </button>
              </div>

              <div>
                <div className="px-3 mb-2 text-label-uppercase font-semibold tracking-wider text-neutral-400">
                  DỰ ÁN
                </div>
                <nav className="space-y-1">
                  {tier2Items.map((item) => {
                    const isActive = isNavItemActive(item)
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
                        <span className={cn('shrink-0', isActive ? 'text-primary-400' : 'text-neutral-400')}>
                          <Icon name={item.iconName} size={16} />
                        </span>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>

            </>
          ) : (
            /* ── Tier-1: Account-level navigation ── */
            <>
              <div>
                <div className="px-3 mb-2 text-label-uppercase font-semibold tracking-wider text-neutral-400">
                  KHÔNG GIAN LÀM VIỆC
                </div>
                <nav className="space-y-1">
                  {tier1Items.map((item) => {
                    const isActive =
                      location.pathname === item.to ||
                      (item.to === '/projects' &&
                        (location.pathname === '/' || location.pathname.startsWith('/projects')))
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
                        <span className={cn('shrink-0', isActive ? 'text-primary-400' : 'text-neutral-400')}>
                          <Icon name={item.iconName} size={16} />
                        </span>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Admin section - chỉ hiển thị nếu là Quản trị viên hệ thống */}
              {(user?.role === 'Quản trị viên' || user?.systemRole === 'ADMIN') && (
                <div className="pt-2">
                  <div className="px-3 mb-2 text-label-uppercase font-semibold tracking-wider text-neutral-400">
                    QUẢN TRỊ HỆ THỐNG
                  </div>
                  <nav className="space-y-1">
                    <Link
                      to="/admin/users"
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded text-body-medium transition-colors cursor-pointer',
                        location.pathname.startsWith('/admin')
                          ? 'bg-neutral-800 text-emerald-400 font-semibold'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50',
                      )}
                    >
                      <span className={cn('shrink-0', location.pathname.startsWith('/admin') ? 'text-emerald-400' : 'text-neutral-400')}>
                        <Icon name="shield" size={16} />
                      </span>
                      <span className="truncate">Quản trị Hệ thống (Admin)</span>
                    </Link>
                  </nav>
                </div>
              )}

              {/* Dev tools */}
              <div className="pt-2">
                <div className="px-3 mb-2 text-label-uppercase font-semibold tracking-wider text-neutral-400">
                  CÔNG CỤ
                </div>
                <nav className="space-y-1">
                  <Link
                    to="/icons"
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded text-body-medium transition-colors cursor-pointer',
                      location.pathname === '/icons'
                        ? 'bg-neutral-800 text-whiteboard font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50',
                    )}
                  >
                    <span className={cn('shrink-0', location.pathname === '/icons' ? 'text-primary-400' : 'text-neutral-400')}>
                      <Icon name="sliders" size={16} />
                    </span>
                    <span className="truncate">Thư viện Icon (Dev)</span>
                  </Link>
                </nav>
              </div>
            </>
          )}
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
