import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { backlogService } from './services/backlogService'
import { CreatePBIModal } from './components/CreatePBIModal'
import { PBIDetailDrawer } from './components/PBIDetailDrawer'
import { DeletePBIModal } from './components/DeletePBIModal'
import { LinkEpicModal } from './components/LinkEpicModal'
import { SprintCapacitySidebar } from './components/SprintCapacitySidebar'
import type {
  PBI,
  EpicSummary,
  SprintSummary,
  BacklogSummaryMetrics,
  CreatePBIPayload,
} from './types'

const ITEMS_PER_PAGE = 7

export default function BacklogPage() {
  const [pbis, setPbis] = useState<PBI[]>([])
  const [epics, setEpics] = useState<EpicSummary[]>([])
  const [sprints, setSprints] = useState<SprintSummary[]>([])
  const [metrics, setMetrics] = useState<BacklogSummaryMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedEpicId, setSelectedEpicId] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'ready' | 'in_sprint' | 'done'>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedPbiForDrawer, setSelectedPbiForDrawer] = useState<PBI | null>(null)
  const [pbiToDelete, setPbiToDelete] = useState<PBI | null>(null)
  const [isLinkEpicOpen, setIsLinkEpicOpen] = useState(false)

  // Drag & drop simulation
  const [draggedPBI, setDraggedPBI] = useState<PBI | null>(null)

  // Mode toggles for UI verification
  const [isMemberView, setIsMemberView] = useState(false) // S5-04 Read-only mode
  const [isDemoEmpty, setIsDemoEmpty] = useState(false)

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Initial load
  useEffect(() => {
    let ignore = false
    const init = async () => {
      try {
        setIsLoading(true)
        const [pbiList, epicList, sprintList, metricsData] = await Promise.all([
          backlogService.getPBIs(),
          backlogService.getEpics(),
          backlogService.getSprints(),
          backlogService.getMetrics(),
        ])
        if (!ignore) {
          setPbis(pbiList)
          setEpics(epicList)
          setSprints(sprintList)
          setMetrics(metricsData)
        }
      } catch {
        // error handling
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [])

  const reloadData = async () => {
    const [pbiList, epicList, sprintList, metricsData] = await Promise.all([
      backlogService.getPBIs(),
      backlogService.getEpics(),
      backlogService.getSprints(),
      backlogService.getMetrics(),
    ])
    setPbis(pbiList)
    setEpics(epicList)
    setSprints(sprintList)
    setMetrics(metricsData)
  }

  // Filtered PBIs
  const filteredPBIs = useMemo(() => {
    if (isDemoEmpty) return []

    return pbis.filter((item) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matches =
          item.code.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        if (!matches) return false
      }

      // Tab
      if (activeTab === 'new' && item.status !== 'new') return false
      if (activeTab === 'ready' && item.status !== 'ready') return false
      if (activeTab === 'in_sprint' && !item.sprintId) return false
      if (activeTab === 'done' && item.status !== 'done') return false

      // Status dropdown
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false

      // Priority dropdown
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false

      // Epic dropdown
      if (selectedEpicId !== 'all' && item.epicId !== selectedEpicId) return false

      return true
    })
  }, [pbis, isDemoEmpty, searchQuery, activeTab, selectedStatus, selectedPriority, selectedEpicId])

  // Paginated PBIs
  const totalPages = Math.ceil(filteredPBIs.length / ITEMS_PER_PAGE) || 1
  const paginatedPBIs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPBIs.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredPBIs, currentPage])

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      all: pbis.length,
      new: pbis.filter((p) => p.status === 'new').length,
      ready: pbis.filter((p) => p.status === 'ready').length,
      in_sprint: pbis.filter((p) => Boolean(p.sprintId)).length,
      done: pbis.filter((p) => p.status === 'done').length,
    }
  }, [pbis])

  // Handlers
  const handleCreatePBI = async (payload: CreatePBIPayload) => {
    const created = await backlogService.createPBI(payload)
    await reloadData()
    showToast(`Đã tạo thành công PBI #${created.code}`)
  }

  const handleUpdatePBI = async (id: string, updates: Partial<PBI>) => {
    const updated = await backlogService.updatePBI(id, updates)
    await reloadData()
    if (selectedPbiForDrawer?.id === id) {
      setSelectedPbiForDrawer(updated)
    }
    showToast(`Đã cập nhật PBI #${updated.code}`)
  }

  const handleDeletePBI = async (id: string) => {
    await backlogService.deletePBI(id)
    await reloadData()
    if (selectedPbiForDrawer?.id === id) {
      setSelectedPbiForDrawer(null)
    }
    showToast('Đã xóa PBI thành công.')
  }

  const handleToggleLock = async (id: string) => {
    const updated = await backlogService.toggleLockPBI(id)
    await reloadData()
    if (selectedPbiForDrawer?.id === id) {
      setSelectedPbiForDrawer(updated)
    }
    showToast(updated.isLocked ? `Đã khóa PBI #${updated.code}` : `Đã mở khóa PBI #${updated.code}`)
  }

  const handleAssignSprint = async (sprintId: string) => {
    if (!draggedPBI) return
    const sprint = sprints.find((s) => s.id === sprintId)
    await backlogService.assignToSprint(draggedPBI.id, sprintId)
    await reloadData()
    showToast(`Đã gán #${draggedPBI.code} vào ${sprint?.name || 'Sprint'}`)
    setDraggedPBI(null)
  }

  const handleLinkBatchEpic = async (pbiIds: string[], epicId: string) => {
    await backlogService.linkBatchToEpic(pbiIds, epicId)
    await reloadData()
    const ep = epics.find((e) => e.id === epicId)
    showToast(`Đã liên kết ${pbiIds.length} PBI vào Epic ${ep?.name}`)
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-paper-100 text-neutral-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-neutral-900 text-whiteboard rounded-lg shadow-xl text-body-sm font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="text-primary-400">
            <Icon name="check-circle" size={16} />
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Backlog Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Breadcrumb & Top Bar */}
        <div className="px-6 py-2.5 border-b border-neutral-200 bg-whiteboard/60 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Link to="/projects" className="hover:text-neutral-800 transition-colors">
              Dự án
            </Link>
            <span>&gt;</span>
            <span className="text-neutral-700 font-medium">ScrumBan Core Platform</span>
            <span>&gt;</span>
            <span className="font-bold text-neutral-900">Backlog</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Switchers for Testing */}
            <button
              type="button"
              onClick={() => setIsMemberView((prev) => !prev)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer border ${
                isMemberView
                  ? 'bg-neutral-800 text-whiteboard border-neutral-900'
                  : 'bg-paper-50 text-neutral-600 border-neutral-300 hover:bg-neutral-100'
              }`}
              title="Chuyển đổi S5-04 Chế độ xem thành viên (Chỉ đọc)"
            >
              {isMemberView ? '👁 Đang ở View Thành viên' : 'Góc nhìn Thành viên (S5-04)'}
            </button>
            <button
              type="button"
              onClick={() => setIsDemoEmpty((prev) => !prev)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer border ${
                isDemoEmpty
                  ? 'bg-warning-600 text-whiteboard border-warning-700'
                  : 'bg-paper-50 text-neutral-600 border-neutral-300 hover:bg-neutral-100'
              }`}
              title="Bật/Tắt trạng thái Backlog rỗng mẫu"
            >
              {isDemoEmpty ? 'Khôi phục danh sách' : 'Mục rỗng mẫu'}
            </button>
          </div>
        </div>

        {/* Member View Banner (S5-04 reference) */}
        {isMemberView && (
          <div className="px-6 py-2.5 bg-neutral-900 text-neutral-200 text-xs flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-warning-500/20 text-warning-400 font-bold text-[10px] uppercase">
                Chế độ xem thành viên (Chỉ đọc)
              </span>
              <span>
                Quyền hạn phân định: Bạn có thể tra cứu tiêu chí nghiệm thu, cập nhật bình luận và trạng thái task con.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMemberView(false)}
              className="text-neutral-400 hover:text-whiteboard font-semibold underline text-[11px] cursor-pointer"
            >
              Trở về quyền Quản lý
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-headline-md font-bold text-neutral-900">Backlog sản phẩm</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700 text-xs font-semibold">
                  Sprint Planning Mode
                </span>
              </div>
              <p className="text-body-sm text-neutral-500 mt-1">
                Sắp xếp độ ưu tiên Product Backlog Items (PBI) và phân bổ vào các chu kỳ Sprint
              </p>
            </div>

            {/* Metrics Chips (S5-01 reference) */}
            {metrics && (
              <div className="flex flex-wrap items-center gap-2 text-xs bg-whiteboard p-2.5 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="px-3 py-1 border-r border-neutral-200">
                  <div className="text-neutral-500 text-[11px]">Tổng PBI</div>
                  <div className="font-bold text-neutral-900 text-sm">{metrics.totalPBIs} PBI</div>
                </div>
                <div className="px-3 py-1 border-r border-neutral-200">
                  <div className="text-neutral-500 text-[11px]">Tổng điểm</div>
                  <div className="font-bold text-primary-700 text-sm">{metrics.totalStoryPoints} Points</div>
                </div>
                <div className="px-3 py-1">
                  <div className="text-neutral-500 text-[11px]">Chưa gán Sprint</div>
                  <div className="font-bold text-warning-700 text-sm">
                    {metrics.unassignedPBIs} PBI ({metrics.unassignedStoryPoints} SP)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <div className="mt-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
                {/* Search */}
                <div className="relative min-w-64 max-w-xs flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Tìm kiếm theo tên hoặc mã PBI..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-neutral-300 bg-whiteboard text-body-sm focus:outline-hidden focus:border-primary-500 text-neutral-900 shadow-2xs"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Icon name="search" size={14} />
                  </div>
                </div>

                {/* Status dropdown */}
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-3 py-2 rounded-lg border border-neutral-300 bg-whiteboard text-xs font-semibold text-neutral-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="new">Cần làm (Mới)</option>
                  <option value="ready">Sẵn sàng (Ready)</option>
                  <option value="in_progress">Đang thực hiện</option>
                  <option value="review">Chờ duyệt</option>
                  <option value="done">Hoàn thành</option>
                </select>

                {/* Epic dropdown */}
                <select
                  value={selectedEpicId}
                  onChange={(e) => {
                    setSelectedEpicId(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-3 py-2 rounded-lg border border-neutral-300 bg-whiteboard text-xs font-semibold text-neutral-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Tất cả Epic</option>
                  {epics.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      {ep.name}
                    </option>
                  ))}
                </select>

                {/* Priority dropdown */}
                <select
                  value={selectedPriority}
                  onChange={(e) => {
                    setSelectedPriority(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-3 py-2 rounded-lg border border-neutral-300 bg-whiteboard text-xs font-semibold text-neutral-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Độ ưu tiên</option>
                  <option value="urgent">Khẩn cấp</option>
                  <option value="high">Cao</option>
                  <option value="medium">Trung bình</option>
                  <option value="low">Thấp</option>
                </select>

                {/* Liên kết Epic Button */}
                {!isMemberView && (
                  <button
                    type="button"
                    onClick={() => setIsLinkEpicOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-300 bg-whiteboard hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
                  >
                    <Icon name="tag" size={14} className="text-primary-600" />
                    <span>Liên kết Epic</span>
                  </button>
                )}
              </div>

              {/* + Thêm PBI Button */}
              {!isMemberView && (
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-whiteboard rounded-lg text-body-sm font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Icon name="plus" size={16} />
                  <span>+ Thêm PBI</span>
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-neutral-200 pb-2">
              {[
                { key: 'all', label: `Tất cả (${tabCounts.all})` },
                { key: 'new', label: `Mới (${tabCounts.new})` },
                { key: 'ready', label: `Sẵn sàng (${tabCounts.ready})` },
                { key: 'in_sprint', label: `Trong Sprint (${tabCounts.in_sprint})` },
                { key: 'done', label: `Hoàn thành (${tabCounts.done})` },
              ].map((tab) => {
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.key as typeof activeTab)
                      setCurrentPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-neutral-900 text-whiteboard shadow-xs'
                        : 'bg-whiteboard text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content Table / Empty State */}
        <div className="flex-1 px-6 pb-6">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-neutral-400 gap-3">
              <Icon name="refresh" size={24} className="animate-spin text-primary-600" />
              <span className="text-xs font-semibold">Đang tải Product Backlog...</span>
            </div>
          ) : filteredPBIs.length === 0 ? (
            <div className="h-72 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center p-6 text-center bg-whiteboard/60">
              <div className="w-12 h-12 rounded-full bg-paper-100 text-neutral-400 flex items-center justify-center mb-3">
                <Icon name="folder" size={24} />
              </div>
              <h3 className="text-body-lg font-bold text-neutral-800">Không có PBI nào phù hợp</h3>
              <p className="text-xs text-neutral-500 max-w-md mt-1 mb-4">
                Danh sách hiện đang trống hoặc không có mục nào thỏa mãn các tiêu chí lọc đang chọn.
              </p>
              {!isMemberView && (
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-whiteboard text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  + Tạo thẻ PBI đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="bg-whiteboard rounded-xl border border-neutral-200 shadow-2xs overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-paper-50/70 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      <th className="py-3 px-3 w-10 text-center">Kéo</th>
                      <th className="py-3 px-3 w-24">Mã PBI</th>
                      <th className="py-3 px-4">Tiêu đề PBI</th>
                      <th className="py-3 px-3 w-28">Trạng thái</th>
                      <th className="py-3 px-3 w-16 text-center">SP</th>
                      <th className="py-3 px-3 w-36">Epic</th>
                      <th className="py-3 px-3 w-32">Sprint</th>
                      <th className="py-3 px-3 w-12 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {paginatedPBIs.map((item) => {
                      const isDragging = draggedPBI?.id === item.id
                      return (
                        <tr
                          key={item.id}
                          draggable={!isMemberView && !item.isLocked}
                          onDragStart={() => setDraggedPBI(item)}
                          onDragEnd={() => setDraggedPBI(null)}
                          onClick={() => setSelectedPbiForDrawer(item)}
                          className={`hover:bg-primary-50/30 transition-colors cursor-pointer group ${
                            isDragging ? 'opacity-40 bg-paper-100' : ''
                          }`}
                        >
                          {/* Drag Handle */}
                          <td
                            className="py-3 px-3 text-center text-neutral-300 group-hover:text-neutral-500 cursor-grab"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span title="Kéo thả để đưa vào Sprint">⠿</span>
                          </td>

                          {/* Code */}
                          <td className="py-3 px-3 font-bold text-primary-800 whitespace-nowrap">
                            #{item.code}
                          </td>

                          {/* Title */}
                          <td className="py-3 px-4 min-w-[280px]">
                            <div className="flex items-center gap-2">
                              <span className="text-primary-600 shrink-0">
                                <Icon name="file-text" size={14} />
                              </span>
                              <span className="font-semibold text-neutral-900 group-hover:text-primary-800 transition-colors">
                                {item.title}
                              </span>
                              {item.isLocked && (
                                <span className="text-danger-600 shrink-0" title="PBI đã khóa">
                                  <Icon name="lock" size={12} />
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 w-fit ${
                                item.status === 'ready'
                                  ? 'bg-primary-100 text-primary-800'
                                  : item.status === 'in_progress'
                                    ? 'bg-warning-100 text-warning-800'
                                    : item.status === 'review'
                                      ? 'bg-info-100 text-info-800'
                                      : item.status === 'done'
                                        ? 'bg-success-100 text-success-800'
                                        : 'bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              <span>
                                {item.status === 'ready'
                                  ? 'Sẵn sàng'
                                  : item.status === 'in_progress'
                                    ? 'Đang làm'
                                    : item.status === 'review'
                                      ? 'Chờ duyệt'
                                      : item.status === 'done'
                                        ? 'Hoàn thành'
                                        : 'Cần làm'}
                              </span>
                            </span>
                          </td>

                          {/* SP */}
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-paper-100 text-neutral-800 font-bold text-[11px] border border-neutral-200">
                              {item.storyPoints}
                            </span>
                          </td>

                          {/* Epic */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {item.epicName ? (
                              <span
                                className="px-2 py-0.5 rounded text-[11px] font-semibold truncate max-w-32 inline-block"
                                style={{
                                  backgroundColor: `${item.epicColor || '#076859'}15`,
                                  color: item.epicColor || '#076859',
                                }}
                              >
                                ● {item.epicName}
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Sprint */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {item.sprintName ? (
                              <span className="text-[11px] font-semibold text-neutral-700">
                                {item.sprintName.split(':')[0]}
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-[11px]">Chưa gán</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td
                            className="py-3 px-3 text-center text-neutral-400 hover:text-neutral-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPbiForDrawer(item)
                            }}
                          >
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-neutral-100 cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <Icon name="more-horizontal" size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination (S5-01 reference) */}
              <div className="px-6 py-3 border-t border-neutral-100 bg-paper-50/50 flex items-center justify-between text-xs text-neutral-500">
                <div>
                  Hiển thị{' '}
                  <strong className="text-neutral-800 font-semibold">{paginatedPBIs.length}</strong>{' '}
                  trên tổng số{' '}
                  <strong className="text-neutral-800 font-semibold">{filteredPBIs.length}</strong>{' '}
                  PBI
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded border border-neutral-200 bg-whiteboard hover:bg-neutral-100 disabled:opacity-40 text-neutral-700 cursor-pointer disabled:cursor-not-allowed font-medium"
                  >
                    Trang trước
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded text-xs font-bold transition-colors cursor-pointer ${
                            currentPage === page
                              ? 'bg-neutral-900 text-whiteboard'
                              : 'hover:bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded border border-neutral-200 bg-whiteboard hover:bg-neutral-100 disabled:opacity-40 text-neutral-700 cursor-pointer disabled:cursor-not-allowed font-medium"
                  >
                    Trang kế tiếp
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Velocity Bottom Card (S5-05 & S5-08 reference) */}
          {metrics && (
            <div className="mt-4 p-4 rounded-xl bg-whiteboard border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <Icon name="sliders" size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-900">
                    Tốc độ hoàn thành ước tính (Velocity)
                  </div>
                  <div className="text-xs text-neutral-500">
                    Đạt trung bình <strong>{metrics.teamVelocity} SP</strong> mỗi Sprint 2 tuần
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                  ~{metrics.estimatedSprintsLeft} Sprints để hoàn tất Backlog hiện tại
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sprint Capacity Sidebar */}
      <SprintCapacitySidebar
        sprints={sprints}
        draggedPBI={draggedPBI}
        onDropPBI={handleAssignSprint}
        onDragEnd={() => setDraggedPBI(null)}
        isReadOnly={isMemberView}
      />

      {/* Modals & Drawers */}
      <CreatePBIModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreatePBI}
        epics={epics}
        sprints={sprints}
      />

      <PBIDetailDrawer
        pbi={selectedPbiForDrawer}
        isOpen={Boolean(selectedPbiForDrawer)}
        onClose={() => setSelectedPbiForDrawer(null)}
        onUpdate={handleUpdatePBI}
        onDeleteRequest={(p) => setPbiToDelete(p)}
        onToggleLock={handleToggleLock}
        sprints={sprints}
        isReadOnly={isMemberView}
      />

      <DeletePBIModal
        pbi={pbiToDelete}
        isOpen={Boolean(pbiToDelete)}
        onClose={() => setPbiToDelete(null)}
        onConfirm={handleDeletePBI}
      />

      <LinkEpicModal
        isOpen={isLinkEpicOpen}
        onClose={() => setIsLinkEpicOpen(false)}
        epics={epics}
        allPBIs={pbis}
        onLinkBatch={handleLinkBatchEpic}
      />
    </div>
  )
}
