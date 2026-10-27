import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { cn } from '@/lib/utils'

interface AdminNavItem {
  label: string
  to: string
  iconName: IconName
  description: string
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    label: 'Quản lý Người dùng',
    to: '/admin/users',
    iconName: 'users',
    description: 'Tài khoản, khóa/mở khóa & phân vai trò',
  },
  {
    label: 'Vai trò & Quyền hạn',
    to: '/admin/roles',
    iconName: 'shield',
    description: 'Ma trận quyền SYSTEM & PROJECT',
  },
  {
    label: 'Cấu hình Hệ thống',
    to: '/admin/settings',
    iconName: 'sliders',
    description: 'Giới hạn dung lượng, comment, phiên',
  },
  {
    label: 'Nhật ký Kiểm toán',
    to: '/admin/logs',
    iconName: 'clock',
    description: 'Lịch sử thao tác quản trị toàn hệ thống',
  },
]

export function AdminPortalLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Kiểm tra vai trò Admin (chống bypass URL)
  const isSystemAdmin = user?.systemRole === 'ADMIN' || user?.role === 'Quản trị viên'

  const handleLogout = async () => {
    await logout()
    navigate('/logged-out')
  }

  // Nếu đã load xong user mà không phải Admin thì chuyển về trang dự án
  if (user && !isSystemAdmin) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-paper-100">
        <div className="max-w-md p-6 bg-whiteboard rounded-xl shadow-lg border border-danger-200 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-danger-100 flex items-center justify-center text-danger-600">
            <Icon name="shield" size={24} />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">Không có quyền truy cập</h2>
          <p className="text-body-sm text-neutral-600">
            Bạn không có đặc quyền Quản trị viên hệ thống (System Admin). Vui lòng quay lại không gian làm việc của dự án.
          </p>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-primary-600 text-whiteboard rounded-lg text-body-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Quay lại Dự án
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 font-sans text-neutral-200">
      {/* ── Mobile Overlay ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-950/80 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Admin Dedicated Sidebar ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-neutral-900 text-neutral-300 flex flex-col border-r border-neutral-800 transition-transform duration-300 lg:static lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-whiteboard font-bold text-base shadow-sm">
              <Icon name="shield" size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-whiteboard tracking-wide flex items-center gap-2">
                <span>MyTaiga</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Admin
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">System Console</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-neutral-400 hover:text-whiteboard p-1"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Admin Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
              QUẢN TRỊ HỆ THỐNG
            </div>
            <nav className="space-y-1.5">
              {ADMIN_NAV_ITEMS.map((item) => {
                const isActive =
                  location.pathname === item.to || location.pathname.startsWith(item.to + '/')
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-start gap-3 px-3 py-2.5 rounded-lg text-body-sm transition-all',
                      isActive
                        ? 'bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/60 shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 border border-transparent',
                    )}
                  >
                    <span className={cn('mt-0.5 shrink-0', isActive ? 'text-emerald-400' : 'text-neutral-500')}>
                      <Icon name={item.iconName} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{item.label}</div>
                      <div className="text-[11px] text-neutral-500 truncate font-normal">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Quick Switch to Projects */}
          <div className="pt-2 border-t border-neutral-800/80">
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
              KHÔNG GIAN LÀM VIỆC
            </div>
            <Link
              to="/projects"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors"
            >
              <Icon name="folder" size={16} className="text-neutral-500" />
              <span>Chuyển sang Dự án</span>
            </Link>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-whiteboard font-bold text-xs shrink-0">
              {user?.avatarCode || 'AD'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-whiteboard truncate">
                {user?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-neutral-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 text-neutral-400 hover:text-danger-400 hover:bg-neutral-800 rounded transition-colors"
            title="Đăng xuất"
          >
            <Icon name="log-out" size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main Viewport ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-neutral-950">
        {/* Top Header */}
        <header className="h-14 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-neutral-400 hover:text-whiteboard p-1 -ml-2"
            >
              <Icon name="menu" size={20} />
            </button>
            <h1 className="text-sm font-bold text-whiteboard tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Trung tâm Quản trị Hệ thống</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/projects"
              className="px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-whiteboard bg-neutral-800 hover:bg-neutral-750 border border-neutral-700/60 rounded-md transition-all flex items-center gap-1.5"
            >
              <Icon name="folder" size={14} />
              <span className="hidden sm:inline">Workspace Dự án</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminPortalLayout
