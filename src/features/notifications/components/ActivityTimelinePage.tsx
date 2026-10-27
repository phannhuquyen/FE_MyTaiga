import { useState, useMemo, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { notificationService } from '../services/notificationService'
import { projectService } from '@/features/projects/services/projectService'
import type { ActivityItem } from '../types'
import { cn } from '@/lib/utils'

export function ActivityTimelinePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [actorFilter, setActorFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>(notificationService.getActivities())

  const numericProjectId = projectId ? parseInt(projectId, 10) : (projectService.getActiveProjectId() || 1)

  useEffect(() => {
    if (numericProjectId > 0) {
      notificationService.fetchActivitiesFromApi(numericProjectId).then((acts) => {
        setActivities(acts)
      })
    }
    const unsubscribe = notificationService.subscribe(() => {
      setActivities(notificationService.getActivities())
    })
    return unsubscribe
  }, [numericProjectId])

  const stats = notificationService.getActivityStats()

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (actorFilter !== 'all' && act.actor.name !== actorFilter) return false
      if (actionFilter !== 'all' && act.actionType !== actionFilter) return false
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchTitle = act.title.toLowerCase().includes(q)
        const matchActor = act.actor.name.toLowerCase().includes(q)
        const matchCode = act.targetCode?.toLowerCase().includes(q)
        if (!matchTitle && !matchActor && !matchCode) return false
      }
      return true
    })
  }, [activities, actorFilter, actionFilter, searchTerm])

  // Group by dateGroup
  const grouped = useMemo(() => {
    const map = new Map<string, { dateString: string; items: ActivityItem[] }>()
    filteredActivities.forEach((act) => {
      const group = map.get(act.dateGroup)
      if (!group) {
        map.set(act.dateGroup, { dateString: act.dateString, items: [act] })
      } else {
        group.items.push(act)
      }
    })
    return Array.from(map.entries())
  }, [filteredActivities])

  const handleExportCsv = () => {
    setIsExporting(true)
    setTimeout(() => {
      const csvContent =
        'data:text/csv;charset=utf-8,Mã,Thời gian,Người thực hiện,Hành động,Chi tiết\n' +
        activities
          .map(
            (a) =>
              `"${a.targetCode || ''}","${a.dateString} ${a.time}","${a.actor.name}","${a.title}","${a.metaInfo || ''}"`,
          )
          .join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `activity_log_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setIsExporting(false)
    }, 600)
  }

  const getActionDotColor = (type: ActivityItem['actionType']) => {
    switch (type) {
      case 'task_complete':
      case 'epic_link':
        return 'bg-emerald-500'
      case 'mention_comment':
        return 'bg-sky-500'
      case 'wip_warning':
        return 'bg-amber-500'
      case 'bug_report':
        return 'bg-neutral-600'
      case 'system_alert':
        return 'bg-rose-500'
      default:
        return 'bg-primary-500'
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header (S12-05) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>ScrumBan Core Platform</span>
            <span>/</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Nhật ký hoạt động
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Lịch sử hoạt động dự án
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Ghi nhận đầy đủ và minh bạch mọi thay đổi trên bảng Kanban, Backlog, Sprint và Lỗi.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-whiteboard dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Icon name="download" size={16} />
            <span>{isExporting ? 'Đang xuất CSV...' : 'Xuất nhật ký CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar (S12-05) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-whiteboard dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs text-xs">
        {/* User filter */}
        <div className="relative">
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="w-full pl-8 pr-7 py-2 bg-paper-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
          >
            <option value="all">Người thực hiện: Tất cả thành viên</option>
            <option value="Minh Quân">Minh Quân</option>
            <option value="Thu Hà">Thu Hà</option>
            <option value="Thùy Trang">Thùy Trang</option>
            <option value="Tuấn Kiệt">Tuấn Kiệt</option>
            <option value="Hệ thống">Hệ thống</option>
          </select>
          <span className="absolute left-2.5 top-2.5 text-neutral-400 pointer-events-none">
            <Icon name="user" size={14} />
          </span>
          <span className="absolute right-2.5 top-2.5 text-neutral-400 pointer-events-none">
            <Icon name="chevron-down" size={14} />
          </span>
        </div>

        {/* Action filter */}
        <div className="relative">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full pl-8 pr-7 py-2 bg-paper-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
          >
            <option value="all">Loại hoạt động: Tất cả</option>
            <option value="task_complete">Hoàn thành tác vụ</option>
            <option value="mention_comment">Bình luận & Thảo luận</option>
            <option value="wip_warning">Giới hạn WIP</option>
            <option value="bug_report">Báo cáo lỗi</option>
            <option value="epic_link">Liên kết Epic</option>
          </select>
          <span className="absolute left-2.5 top-2.5 text-neutral-400 pointer-events-none">
            <Icon name="filter" size={14} />
          </span>
          <span className="absolute right-2.5 top-2.5 text-neutral-400 pointer-events-none">
            <Icon name="chevron-down" size={14} />
          </span>
        </div>

        {/* Date display */}
        <div className="flex items-center gap-2 px-3 py-2 bg-paper-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300">
          <Icon name="calendar" size={14} className="text-neutral-400 shrink-0" />
          <span className="truncate font-medium">14/10/2024 - 28/10/2024</span>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Icon name="search" size={14} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã #TASK, hành động"
            className="w-full pl-8 pr-3 py-2 bg-paper-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Main 2-column layout (S12-05) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Activity Feed (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {grouped.length === 0 ? (
            <div className="bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center text-neutral-400 text-xs">
              <Icon name="clock" size={28} className="mx-auto mb-2 opacity-50" />
              <p>Không có hoạt động nào khớp với bộ lọc</p>
            </div>
          ) : (
            grouped.map(([groupTitle, { dateString, items }]) => (
              <div key={groupTitle} className="space-y-3">
                {/* Date Group Header */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                    {groupTitle}
                  </span>
                  <span className="text-xs text-neutral-400">{dateString}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {items.length} cập nhật
                  </span>
                </div>

                {/* Event Cards */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="relative bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs transition-shadow hover:shadow-sm"
                    >
                      {/* Timeline dot */}
                      <span
                        className={cn(
                          'absolute -left-2 top-5 w-4 h-4 rounded-full border-2 border-whiteboard dark:border-neutral-900 shadow-xs flex items-center justify-center',
                          getActionDotColor(item.actionType),
                        )}
                      />

                      {/* Top row: Actor & Time */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-neutral-900 text-neutral-100 flex items-center justify-center font-bold text-xs">
                            {item.actor.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                {item.actor.name}
                              </span>
                              <span className="px-1.5 py-0.2 text-[10px] font-medium rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                {item.actor.role}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-neutral-400 font-mono">{item.time}</span>
                      </div>

                      {/* Content line */}
                      <div className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                        <span>{item.title}</span>{' '}
                        {item.badge && (
                          <span
                            className={cn(
                              'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ml-1 mr-1',
                              item.badge.variant === 'success' && 'bg-emerald-50 text-emerald-700',
                              item.badge.variant === 'danger' && 'bg-danger-50 text-danger-700',
                              item.badge.variant === 'warning' && 'bg-amber-50 text-amber-700',
                            )}
                          >
                            ● {item.badge.text}
                          </span>
                        )}
                        {item.targetCode && (
                          <Link
                            to={item.targetCode.startsWith('#BUG') ? '/bugs' : '/kanban'}
                            className="font-mono text-primary-600 dark:text-primary-400 font-semibold hover:underline ml-1"
                          >
                            {item.targetCode}
                          </Link>
                        )}
                      </div>

                      {/* Quote block */}
                      {item.quote && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-paper-50 dark:bg-neutral-800/60 border-l-2 border-primary-500 text-xs italic text-neutral-600 dark:text-neutral-300">
                          {item.quote}
                        </div>
                      )}

                      {/* Warning banner */}
                      {item.warningBanner && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                          <Icon name="alert-triangle" size={16} className="shrink-0" />
                          <span>{item.warningBanner}</span>
                        </div>
                      )}

                      {/* Linked codes or Meta info */}
                      {item.linkedCodes && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                          <Icon name="external-link" size={14} />
                          <span>Đã gắn:</span>
                          <div className="flex gap-1.5 font-mono">
                            {item.linkedCodes.map((code) => (
                              <span
                                key={code}
                                className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                              >
                                {code}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.metaInfo && (
                        <div className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                          {item.metaInfo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Load more button */}
          <div className="text-center pt-2">
            <button
              type="button"
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-whiteboard dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Icon name="refresh" size={14} />
              <span>Tải thêm hoạt động cũ hơn</span>
            </button>
          </div>
        </div>

        {/* Right Column: Statistics & Legend (1 col) (S12-05) */}
        <div className="space-y-5">
          {/* 14 Days Stats Card */}
          <div className="bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
              Thống kê 14 ngày qua
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Tổng sự kiện ghi nhận</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                  {stats.totalEvents}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Tác vụ hoàn tất</span>
                <span className="font-bold text-emerald-600 font-mono">{stats.tasksCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Lỗi phát hiện mới</span>
                <span className="font-bold text-rose-600 font-mono">{stats.newBugs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Lần chạm ngưỡng WIP</span>
                <span className="font-bold text-amber-600 font-mono">{stats.wipViolations}</span>
              </div>
            </div>
          </div>

          {/* Color Legend Card */}
          <div className="bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
              Quy ước màu Timeline
            </h3>
            <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Cập nhật tác vụ, Epic, hoàn thành</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                <span>Bình luận, trao đổi, phản hồi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span>Di chuyển trạng thái, cảnh báo WIP</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-600 shrink-0" />
                <span>Báo cáo lỗi, thay đổi tài liệu</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span>Cảnh báo quá hạn, sự cố khẩn cấp</span>
              </div>
            </div>
          </div>

          {/* Retention notice */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed flex items-start gap-2.5">
            <Icon name="info" size={16} className="text-neutral-400 shrink-0 mt-0.5" />
            <p>
              Nhật ký được lưu trữ bảo toàn 180 ngày phục vụ công tác Retrospective và đối soát tiến độ của đội ngũ.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityTimelinePage
