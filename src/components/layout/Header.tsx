import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { NotificationBellDropdown } from '@/features/notifications'
import { cn } from '@/lib/utils'

export interface HeaderProps {
  onMenuToggle?: () => void
  onQuickCreate?: () => void
  searchTerm?: string
  onSearchChange?: (val: string) => void
  className?: string
}

export function Header({
  onMenuToggle,
  onQuickCreate,
  searchTerm = '',
  onSearchChange,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'h-14 bg-whiteboard border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between shrink-0 gap-4',
        className,
      )}
    >
      {/* Left: Mobile menu toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 -ml-1 text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100 cursor-pointer"
          aria-label="Mở menu"
        >
          <Icon name="menu" size={20} />
        </button>

        {/* Breadcrumb matching Group 1.png: Dự án / ScrumBan Core / Tổng quan */}
        <nav
          className="flex items-center gap-1.5 text-body-sm text-neutral-500 overflow-hidden whitespace-nowrap"
          aria-label="Breadcrumb"
        >
          <Link to="/projects" className="hover:text-neutral-800 transition-colors cursor-pointer">
            Dự án
          </Link>
          <span className="text-neutral-400">/</span>
          <span className="hover:text-neutral-800 transition-colors cursor-pointer">
            ScrumBan Core
          </span>
          <span className="text-neutral-400">/</span>
          <span className="font-semibold text-neutral-900">Tổng quan</span>
        </nav>
      </div>

      {/* Right: Quick Search, Notification Bell & Create Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search input with Ctrl+K shortcut badge */}
        <div className="relative hidden sm:block w-64 md:w-72">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Tìm kiếm nhanh (Ctrl+K)..."
            className="w-full pl-8 pr-3 py-1.5 text-body-sm bg-paper-50 hover:bg-whiteboard focus:bg-whiteboard border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-neutral-400 text-neutral-800"
          />
        </div>

        {/* Notification Bell Dropdown (S12-02) */}
        <NotificationBellDropdown />

        {/* + Tạo button matching design */}
        <button
          type="button"
          onClick={onQuickCreate}
          className="inline-flex items-center gap-1 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-whiteboard text-body-sm font-medium px-3 py-1.5 rounded transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Icon name="plus" size={16} />
          <span>Tạo</span>
        </button>
      </div>
    </header>
  )
}
