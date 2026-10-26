import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { notificationService, resolveNotificationLink } from './services/notificationService'
import { projectService } from '@/features/projects/services/projectService'
import type { NotificationCategory } from './types'
import { cn } from '@/lib/utils'

export function NotificationsPage() {
  const navigate = useNavigate()
  const activeProjectId = projectService.getActiveProjectId()
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all')
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>('7d')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  // Live state from service
  const [, setTick] = useState(0)

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(() => {
      setTick((t) => t + 1)
    })
    return unsubscribe
  }, [])

  const rawNotifications = notificationService.getNotifications()
  const unreadCount = notificationService.getUnreadCount()
  const mentionCount = rawNotifications.filter((n) => n.category === 'mention').length
  const deadlineWipCount = rawNotifications.filter(
    (n) => n.category === 'deadline' || n.category === 'wip_alert',
  ).length

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notificationService.getNotifications({
      category: activeTab,
      search,
    })
  }, [activeTab, search])

  // Pagination
  const totalItems = filteredNotifications.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredNotifications.slice(start, start + pageSize)
  }, [filteredNotifications, currentPage, pageSize])

  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    notificationService.toggleRead(id)
  }

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead()
  }

  const handleResetDemo = () => {
    notificationService.resetDemoNotifications()
    setCurrentPage(1)
  }

  const handleClearForEmptyDemo = () => {
    notificationService.clearAllForEmptyDemo()
    setCurrentPage(1)
  }

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'mention':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
      case 'wip_alert':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
      case 'attachment':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
      case 'bug':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
      case 'deadline':
        return 'bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-950/40 dark:text-danger-300 dark:border-danger-800'
      case 'sprint':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800'
      default:
        return 'bg-neutral-100 text-neutral-600'
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb & Header (S12-01) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>ScrumBan Core Platform</span>
            <span>/</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Thông báo</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Thông báo trung tâm
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
              Hộp thư đến
            </span>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-xs',
              unreadCount > 0
                ? 'bg-whiteboard dark:bg-neutral-800 text-primary-700 dark:text-primary-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                : 'opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-700',
            )}
          >
            <Icon name="check" size={16} />
            <span>Đánh dấu tất cả là đã đọc</span>
          </button>

          {/* Demo toggle: Reset / Empty */}
          <button
            type="button"
            onClick={rawNotifications.length === 0 ? handleResetDemo : handleClearForEmptyDemo}
            title={rawNotifications.length === 0 ? 'Khôi phục dữ liệu demo' : 'Giả lập trạng thái rỗng'}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <Icon name="sliders" size={18} />
          </button>
        </div>
      </div>

      {/* Category Tabs (S12-01) */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => {
            setActiveTab('all')
            setCurrentPage(1)
          }}
          className={cn(
            'flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'all'
              ? 'border-primary-600 text-primary-700 dark:text-primary-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300',
          )}
        >
          <span>Tất cả</span>
          <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold">
            {rawNotifications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('unread')
            setCurrentPage(1)
          }}
          className={cn(
            'flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'unread'
              ? 'border-primary-600 text-primary-700 dark:text-primary-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300',
          )}
        >
          <span>Chưa đọc</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-emerald-500 text-whiteboard font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('mention')
            setCurrentPage(1)
          }}
          className={cn(
            'flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'mention'
              ? 'border-primary-600 text-primary-700 dark:text-primary-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300',
          )}
        >
          <span>Nhắc tên (@mention)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold">
            {mentionCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('deadline_wip')
            setCurrentPage(1)
          }}
          className={cn(
            'flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'deadline_wip'
              ? 'border-primary-600 text-primary-700 dark:text-primary-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300',
          )}
        >
          <span>Hạn chót & WIP</span>
          <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold">
            {deadlineWipCount}
          </span>
        </button>
      </div>

      {/* Filter toolbar (S12-01) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-whiteboard dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Tìm kiếm nội dung thông báo, mã tác vụ (#TASK-)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-paper-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-neutral-400"
          />
        </div>

        {/* Project & Date Filters */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="text-xs appearance-none pl-7 pr-8 py-2 bg-paper-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">Dự án: Tất cả</option>
              <option value="core">ScrumBan Core Platform</option>
              <option value="payment">Payment Gateway</option>
            </select>
            <span className="absolute left-2.5 top-2.5 text-neutral-400 pointer-events-none">
              <Icon name="folder" size={14} />
            </span>
            <span className="absolute right-2.5 top-2.5 text-neutral-400 pointer-events-none">
              <Icon name="chevron-down" size={14} />
            </span>
          </div>

          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '14d' | '30d' | 'all')}
              className="text-xs appearance-none pl-7 pr-8 py-2 bg-paper-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="7d">Khoảng thời gian: 7 ngày qua</option>
              <option value="14d">Khoảng thời gian: 14 ngày qua</option>
              <option value="30d">Khoảng thời gian: 30 ngày qua</option>
              <option value="all">Tất cả thời gian</option>
            </select>
            <span className="absolute left-2.5 top-2.5 text-neutral-400 pointer-events-none">
              <Icon name="calendar" size={14} />
            </span>
            <span className="absolute right-2.5 top-2.5 text-neutral-400 pointer-events-none">
              <Icon name="chevron-down" size={14} />
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch('')
              setProjectFilter('all')
              setTimeRange('7d')
            }}
            title="Làm mới bộ lọc"
            className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
          >
            <Icon name="refresh" size={16} />
          </button>
        </div>
      </div>

      {/* Notification Table or Empty State */}
      {paginatedNotifications.length === 0 ? (
        /* Empty State (S12-04) */
        <div className="bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center max-w-2xl mx-auto my-8 space-y-5 animate-in fade-in duration-300 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mx-auto">
            <Icon name="bell" size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Không có thông báo chưa đọc
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
              Bạn đã cập nhật tất cả thông tin mới nhất từ nhóm dự án ScrumBan Core Platform. Mọi thay đổi tác vụ, bình luận và hạn chót sẽ xuất hiện tại đây khi phát sinh.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetDemo}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-whiteboard text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Icon name="archive" size={16} />
              <span>Xem tất cả thông báo đã lưu</span>
            </button>
            <Link
              to={activeProjectId ? `/projects/${activeProjectId}/kanban` : '/projects'}
              className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Quay lại Bảng Kanban</span>
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
          <div className="pt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Hệ thống đồng bộ tức thời: Hoạt động bình thường
            </span>
          </div>
        </div>
      ) : (
        /* Notification List Table (S12-01) */
        <div className="bg-whiteboard dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-7/12">Nội dung cập nhật</th>
                  <th className="py-3 px-4 w-2/12">Phân loại</th>
                  <th className="py-3 px-4 w-2/12">Thời gian</th>
                  <th className="py-3 px-4 w-1/12 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                {paginatedNotifications.map((notif) => (
                  <tr
                    key={notif.id}
                    onClick={() => {
                      if (notif.targetLink) navigate(resolveNotificationLink(notif.targetLink))
                    }}
                    className={cn(
                      'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group',
                      !notif.isRead && 'bg-primary-50/20 dark:bg-primary-950/10 font-medium',
                    )}
                  >
                    {/* Content */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* Unread dot */}
                        <div className="w-2 flex items-center justify-center">
                          {!notif.isRead ? (
                            <span className="w-2 h-2 rounded-full bg-primary-600 ring-2 ring-primary-100 dark:ring-primary-950" />
                          ) : null}
                        </div>

                        {/* Icon or Avatar */}
                        <div className="shrink-0">
                          {notif.category === 'wip_alert' ? (
                            <div className="w-8 h-8 rounded-lg bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-300 flex items-center justify-center font-bold">
                              <Icon name="alert-triangle" size={16} />
                            </div>
                          ) : notif.category === 'deadline' ? (
                            <div className="w-8 h-8 rounded-lg bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-300 flex items-center justify-center font-bold">
                              <Icon name="calendar" size={16} />
                            </div>
                          ) : notif.category === 'sprint' ? (
                            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center font-bold">
                              <Icon name="sprint" size={16} />
                            </div>
                          ) : notif.category === 'bug' ? (
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center font-bold">
                              <Icon name="bug" size={16} />
                            </div>
                          ) : notif.category === 'attachment' ? (
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 flex items-center justify-center font-bold">
                              <Icon name="paperclip" size={16} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-100 flex items-center justify-center font-bold text-xs">
                              {notif.actor.avatar}
                            </div>
                          )}
                        </div>

                        {/* Message */}
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-neutral-800 dark:text-neutral-200 line-clamp-1 leading-snug">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border',
                          getCategoryBadgeClass(notif.category),
                        )}
                      >
                        {notif.categoryLabel}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-neutral-500 text-xs">
                      {notif.timestamp}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleToggleRead(notif.id, e)}
                          title={notif.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                          className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          <Icon name="check" size={16} />
                        </button>
                        {notif.targetLink && (
                          <Link
                            to={resolveNotificationLink(notif.targetLink)}
                            onClick={(e) => e.stopPropagation()}
                            title="Đi tới mục liên quan"
                            className="p-1.5 rounded text-neutral-400 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          >
                            <Icon name="external-link" size={16} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination (S12-01) */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
            <div>
              Hiển thị{' '}
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {(currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, totalItems)}
              </span>{' '}
              trong tổng số{' '}
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {totalItems}
              </span>{' '}
              thông báo
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer font-medium"
              >
                &lt; Trước
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'w-7 h-7 rounded text-xs font-semibold cursor-pointer transition-colors',
                      currentPage === pageNum
                        ? 'bg-primary-700 text-whiteboard'
                        : 'border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer font-medium"
              >
                Sau &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deadline Emergency Card (S12-03) */}
      <div className="bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-danger-600 font-bold text-sm">
            <Icon name="alert-triangle" size={18} />
            <span>Danh sách Tác vụ Trễ hạn cần xử lý khẩn cấp</span>
          </div>
          <span className="text-xs text-neutral-400">Cập nhật lúc 09:30</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                <th className="py-2 px-3">Mã</th>
                <th className="py-2 px-3">Tên tác vụ</th>
                <th className="py-2 px-3">Người chịu trách nhiệm</th>
                <th className="py-2 px-3">Trạng thái</th>
                <th className="py-2 px-3">Thời gian trễ</th>
                <th className="py-2 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  #TASK-218
                </td>
                <td className="py-3 px-3 font-medium text-neutral-800 dark:text-neutral-200">
                  Cấu hình Cluster Redis Sentinel dự phòng nóng
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary-700 text-whiteboard text-[10px] flex items-center justify-center font-bold">
                      MQ
                    </span>
                    <span>Minh Quân</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-danger-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger-600" />
                    Đang làm
                  </span>
                </td>
                <td className="py-3 px-3 font-semibold text-danger-600">2 ngày 4 giờ</td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => navigate(activeProjectId ? `/projects/${activeProjectId}/kanban?taskId=task-218` : '/projects')}
                    className="px-2.5 py-1 text-xs border border-neutral-300 dark:border-neutral-700 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-medium"
                  >
                    Điều chỉnh hạn
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  #TASK-212
                </td>
                <td className="py-3 px-3 font-medium text-neutral-800 dark:text-neutral-200">
                  Kiểm thử hồi quy API Webhook Thanh toán
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-whiteboard text-[10px] flex items-center justify-center font-bold">
                      TH
                    </span>
                    <span>Thanh Hà</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Chờ duyệt
                  </span>
                </td>
                <td className="py-3 px-3 font-semibold text-danger-600">1 ngày</td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => navigate(activeProjectId ? `/projects/${activeProjectId}/kanban` : '/projects')}
                    className="px-2.5 py-1 text-xs border border-neutral-300 dark:border-neutral-700 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-medium"
                  >
                    Điều chỉnh hạn
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage
