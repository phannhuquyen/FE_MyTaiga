import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { notificationService, resolveNotificationLink } from '../services/notificationService'
import type { NotificationItem } from '../types'
import { cn } from '@/lib/utils'

interface NotificationBellDropdownProps {
  className?: string
}

export function NotificationBellDropdown({ className }: NotificationBellDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [unreadCount, setUnreadCount] = useState(notificationService.getUnreadCount())
  const [notifications, setNotifications] = useState(notificationService.getNotifications())
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    notificationService.fetchFromApi()
    const unsubscribe = notificationService.subscribe(() => {
      setUnreadCount(notificationService.getUnreadCount())
      setNotifications(notificationService.getNotifications())
    })
    return unsubscribe
  }, [])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const displayedNotifications =
    tab === 'unread'
      ? notifications.filter((n) => !n.isRead).slice(0, 6)
      : notifications.slice(0, 6)

  const handleItemClick = (item: NotificationItem) => {
    notificationService.markAsRead(item.id)
    setIsOpen(false)
    if (item.targetLink) {
      navigate(resolveNotificationLink(item.targetLink))
    }
  }

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    notificationService.markAllAsRead()
  }

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'relative p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer',
          isOpen && 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100',
        )}
        aria-label="Thông báo"
        aria-expanded={isOpen}
      >
        <Icon name="bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-danger-500 text-whiteboard text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-whiteboard dark:border-neutral-900 shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu (S12-02) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-whiteboard dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                Thông báo
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold rounded-md bg-primary-600 text-whiteboard">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 cursor-pointer"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-3 pt-2 gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTab('all')}
              className={cn(
                'pb-2 transition-colors cursor-pointer border-b-2',
                tab === 'all'
                  ? 'border-primary-600 text-primary-700 dark:text-primary-400 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800',
              )}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setTab('unread')}
              className={cn(
                'pb-2 transition-colors cursor-pointer border-b-2',
                tab === 'unread'
                  ? 'border-primary-600 text-primary-700 dark:text-primary-400 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800',
              )}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
            {displayedNotifications.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-xs">
                <Icon name="bell" size={28} className="mx-auto mb-2 opacity-40" />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={cn(
                    'p-3.5 flex items-start gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors relative',
                    !notif.isRead && 'bg-primary-50/20 dark:bg-primary-950/10',
                  )}
                >
                  {/* Unread dot */}
                  {!notif.isRead && (
                    <span className="absolute left-1.5 top-5 w-2 h-2 rounded-full bg-primary-600" />
                  )}

                  {/* Avatar / Icon badge */}
                  <div className="shrink-0 mt-0.5">
                    {notif.category === 'wip_alert' ? (
                      <div className="w-8 h-8 rounded-lg bg-warning-50 dark:bg-warning-950 text-warning-600 flex items-center justify-center font-bold text-xs">
                        <Icon name="alert-triangle" size={16} />
                      </div>
                    ) : notif.category === 'deadline' ? (
                      <div className="w-8 h-8 rounded-lg bg-danger-50 dark:bg-danger-950 text-danger-600 flex items-center justify-center font-bold text-xs">
                        <Icon name="alert-circle" size={16} />
                      </div>
                    ) : notif.category === 'sprint' ? (
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-whiteboard flex items-center justify-center font-bold text-xs">
                        <Icon name="sprint" size={16} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-100 flex items-center justify-center font-bold text-xs">
                        {notif.actor.avatar}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-800 dark:text-neutral-200 line-clamp-2 leading-relaxed">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 mr-1">
                        {notif.actor.name}
                      </span>
                      {notif.message.replace(`${notif.actor.name} `, '')}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                      <span>{notif.timestamp}</span>
                      {notif.targetCode && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-primary-600 dark:text-primary-400 font-medium">
                            {notif.targetCode}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer (S12-02) */}
          <div className="p-2.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 inline-flex items-center gap-1.5"
            >
              <span>Xem tất cả thông báo</span>
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
