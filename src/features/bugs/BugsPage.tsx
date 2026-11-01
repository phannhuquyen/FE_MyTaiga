import { useState, useEffect, useCallback } from 'react'
import { useQuickCreate } from '@/hooks/useQuickCreate'
import { useParams, useSearchParams } from 'react-router-dom'
import { Icon } from '@/components/ui'
import type { BugItem, BugSeverity, BugStatus, CreateBugPayload } from './types'
import { bugService, AVAILABLE_ASSIGNEES } from './services/bugService'
import { BugDetailView } from './components/BugDetailView'
import { CreateBugModal } from './components/CreateBugModal'

export default function BugsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const numericProjectId = projectId ? parseInt(projectId, 10) : undefined

  const [searchParams, setSearchParams] = useSearchParams()
  const bugIdParam = searchParams.get('id')

  // List state
  const [bugs, setBugs] = useState<BugItem[]>([])
  const [totalCount, setTotalCount] = useState(14)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 7
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')

  const [stats, setStats] = useState({
    totalOpen: 14,
    blockerCount: 3,
    majorCount: 5,
    mediumMinorCount: 6,
  })

  // Selected bug for detail view
  const [selectedBug, setSelectedBug] = useState<BugItem | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  useQuickCreate(setIsCreateModalOpen)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch bugs
  const loadBugs = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await bugService.getBugs({
        search: searchTerm,
        status: statusFilter,
        severity: severityFilter,
        assigneeId: assigneeFilter,
        page: currentPage,
        pageSize,
      }, numericProjectId)
      setBugs(res.items)
      setTotalCount(res.total)
      setStats(res.stats)

      // If id param present, load detail
      if (bugIdParam) {
        const found = await bugService.getBugById(bugIdParam)
        if (found) {
          setSelectedBug(found)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter, severityFilter, assigneeFilter, currentPage, bugIdParam, pageSize, numericProjectId])

  useEffect(() => {
    loadBugs()
  }, [loadBugs])

  const handleOpenDetail = (bug: BugItem) => {
    setSelectedBug(bug)
    setSearchParams({ id: bug.id })
  }

  const handleBackToList = () => {
    setSelectedBug(null)
    setSearchParams({})
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setSeverityFilter('all')
    setAssigneeFilter('all')
    setCurrentPage(1)
  }

  const handleCreateBug = async (payload: CreateBugPayload) => {
    await bugService.createBug(payload)
    await loadBugs()
  }

  const handleBugUpdated = (updated: BugItem) => {
    setSelectedBug(updated)
    setBugs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
  }

  const handleBugDeleted = (id: string) => {
    setBugs((prev) => prev.filter((b) => b.id !== id))
    setSelectedBug(null)
    setSearchParams({})
  }

  // Export CSV simulation
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      'Mã Lỗi,Tiêu Đề,Mức Độ,Trạng Thái,Người Xử Lý,Ngày Tạo\n' +
      bugs
        .map(
          (b) =>
            `"${b.code}","${b.title}","${b.severity}","${b.status}","${b.assignee?.name || 'Chưa gán'}","${b.createdAt}"`,
        )
        .join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `scrumflow_bugs_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  const getSeverityDot = (severity: BugSeverity) => {
    switch (severity) {
      case 'blocker':
        return <span className="w-2 h-2 rounded-full bg-danger-500 inline-block mr-1.5" />
      case 'major':
        return <span className="w-2 h-2 rounded-full bg-amber-600 inline-block mr-1.5" />
      case 'minor':
        return <span className="w-2 h-2 rounded-full bg-teal-600 inline-block mr-1.5" />
      default:
        return <span className="w-2 h-2 rounded-full bg-neutral-400 inline-block mr-1.5" />
    }
  }

  const getSeverityLabel = (severity: BugSeverity) => {
    switch (severity) {
      case 'blocker':
        return 'Chặn'
      case 'major':
        return 'Nặng'
      case 'minor':
        return 'Vừa'
      default:
        return 'Nhẹ'
    }
  }

  const getStatusDot = (status: BugStatus) => {
    switch (status) {
      case 'open':
      case 'reopened':
        return <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
      case 'in_progress':
        return <span className="w-2 h-2 rounded-full bg-amber-700 inline-block mr-1.5" />
      case 'resolved':
        return <span className="w-2 h-2 rounded-full bg-teal-500 inline-block mr-1.5" />
      case 'closed':
        return <span className="w-2 h-2 rounded-full bg-neutral-400 inline-block mr-1.5" />
    }
  }

  const getStatusLabel = (status: BugStatus) => {
    switch (status) {
      case 'reopened':
        return 'Mở lại'
      case 'open':
        return 'Mở'
      case 'in_progress':
        return 'Đang xử lý'
      case 'resolved':
        return 'Đã sửa'
      case 'closed':
        return 'Đóng'
    }
  }

  // If a bug is selected for detailed view (S11-03, S11-04, S11-06)
  if (selectedBug) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <BugDetailView
          bug={selectedBug}
          onBack={handleBackToList}
          onBugUpdated={handleBugUpdated}
          onBugDeleted={handleBugDeleted}
        />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Header (S11-01) */}
      <div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1.5">
          <span>Dự án</span>
          <span>&gt;</span>
          <span>ScrumBan Core Platform</span>
          <span>&gt;</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            Danh sách Lỗi (Bugs)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Quản lý Lỗi (Bugs)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger-50 text-danger-700 border border-danger-200 dark:bg-danger-950/60 dark:text-danger-300">
              {stats.totalOpen} lỗi đang mở
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Icon name="download" size={14} />
              <span>Xuất dữ liệu</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Icon name="plus" size={15} />
              <span>+ Báo cáo Bug</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar (S11-01) */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative min-w-[260px] flex-1 sm:flex-initial">
              <Icon
                name="search"
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Tìm theo mã lỗi, tiêu đề..."
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="open">Mở</option>
              <option value="reopened">Mở lại</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="resolved">Đã sửa</option>
              <option value="closed">Đóng</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">Mức độ: Tất cả</option>
              <option value="blocker">Chặn (Blocker)</option>
              <option value="major">Nặng (Major)</option>
              <option value="minor">Vừa (Minor)</option>
              <option value="trivial">Nhẹ (Trivial)</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => {
                setAssigneeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">Người xử lý: Tất cả</option>
              {AVAILABLE_ASSIGNEES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
              <option value="unassigned">Chưa gán</option>
            </select>

            {/* Reset */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-neutral-500 hover:text-primary-600 underline decoration-dotted px-1"
            >
              Đặt lại bộ lọc
            </button>
          </div>

          {/* Severity Counts Dots (S11-01) */}
          <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 shrink-0 self-end lg:self-center">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-danger-500" />
              <strong className="text-neutral-900 dark:text-neutral-100">{stats.blockerCount}</strong> Chặn
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <strong className="text-neutral-900 dark:text-neutral-100">{stats.majorCount}</strong> Nặng
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <strong className="text-neutral-900 dark:text-neutral-100">{stats.mediumMinorCount}</strong> Vừa & Nhẹ
            </span>
          </div>
        </div>
      </div>

      {/* Table (S11-01) */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/80 text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="py-3 px-4 min-w-[320px]">Tiêu đề & Định danh</th>
                <th className="py-3 px-4 w-32">Mức độ</th>
                <th className="py-3 px-4 w-36">Trạng thái</th>
                <th className="py-3 px-4 w-44">Người xử lý</th>
                <th className="py-3 px-4 w-32 text-right">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    Đang tải danh sách lỗi...
                  </td>
                </tr>
              ) : bugs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <Icon name="bug" size={32} className="mx-auto text-neutral-300 mb-2" />
                    Không tìm thấy lỗi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                bugs.map((bug) => (
                  <tr
                    key={bug.id}
                    onClick={() => handleOpenDetail(bug)}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-700/40 cursor-pointer transition-colors group"
                  >
                    {/* Code & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono font-bold text-neutral-500 group-hover:text-primary-600 transition-colors shrink-0">
                          {bug.code}
                        </span>
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 transition-colors line-clamp-1">
                            {bug.title}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                            {bug.environment}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center text-neutral-800 dark:text-neutral-200">
                        {getSeverityDot(bug.severity)}
                        {getSeverityLabel(bug.severity)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center text-neutral-800 dark:text-neutral-200">
                        {getStatusDot(bug.status)}
                        {getStatusLabel(bug.status)}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {bug.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-800 font-bold flex items-center justify-center text-[10px]">
                            {bug.assignee.avatar || 'MQ'}
                          </div>
                          <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                            {bug.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Chưa gán</span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-right text-neutral-500 whitespace-nowrap">
                      {bug.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (S11-01) */}
        <div className="p-3.5 border-t border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            Hiển thị{' '}
            <strong className="text-neutral-800 dark:text-neutral-200">
              {bugs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(currentPage * pageSize, totalCount)}
            </strong>{' '}
            trong tổng số <strong className="text-neutral-800 dark:text-neutral-200">{totalCount}</strong> lỗi
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            >
              &lt; Trước
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1
              const isActive = pageNum === currentPage
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-md font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            >
              Sau &gt;
            </button>
          </div>
        </div>
      </div>

      {/* SLA Policy Banner (S11-01) */}
      <div className="p-4 bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5 text-neutral-700 dark:text-neutral-300">
          <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Icon name="info" size={13} />
          </div>
          <div>
            <strong className="font-bold text-neutral-900 dark:text-neutral-100 mr-1.5">
              Quy chuẩn xử lý lỗi Sprint
            </strong>
            <span>
              Các lỗi có mức độ &ldquo;Chặn&rdquo; phải được gán và bắt đầu giải quyết trong vòng 2
              giờ kể từ khi báo cáo.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => alert('Chính sách SLA: Thời gian phản hồi tối đa cho Blocker là 2h.')}
          className="text-primary-700 dark:text-primary-300 font-semibold hover:underline flex items-center gap-1 shrink-0 self-end sm:self-center"
        >
          <span>Xem SLA chính sách</span>
          <Icon name="arrow-right" size={13} />
        </button>
      </div>

      {/* Create Modal */}
      <CreateBugModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBug}
      />
    </div>
  )
}
