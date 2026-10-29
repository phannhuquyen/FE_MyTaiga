import { useState, useEffect } from 'react'
import { useQuickCreate } from '@/hooks/useQuickCreate'
import type { Sprint, CreateSprintPayload, UpdateSprintPayload } from './types'
import { sprintService } from './services/sprintService'
import { CreateSprintModal } from './components/CreateSprintModal'
import { EditSprintModal } from './components/EditSprintModal'
import { CloseSprintModal } from './components/CloseSprintModal'
import { DeleteSprintModal } from './components/DeleteSprintModal'
import { SprintDetailView } from './components/SprintDetailView'
import { SprintPlanningView } from './components/SprintPlanningView'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Icon } from '@/components/ui/Icon'

export function SprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Sub-view routing inside Sprints module
  const [selectedSprintForDetail, setSelectedSprintForDetail] = useState<Sprint | null>(null)
  const [selectedSprintForPlanning, setSelectedSprintForPlanning] = useState<Sprint | null>(null)

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  useQuickCreate(setIsCreateOpen)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [closingSprint, setClosingSprint] = useState<Sprint | null>(null)
  const [deletingSprint, setDeletingSprint] = useState<Sprint | null>(null)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Load sprints
  const loadSprints = async () => {
    try {
      const data = await sprintService.getSprints()
      setSprints(data)
      const current = await sprintService.getActiveSprint()
      setActiveSprint(current)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSprints()
  }, [])

  // CRUD Handlers
  const handleCreateSprint = async (payload: CreateSprintPayload) => {
    const created = await sprintService.createSprint(payload)
    await loadSprints()
    showToast(`Đã tạo thành công ${created.name}`)
  }

  const handleUpdateSprint = async (id: string, payload: UpdateSprintPayload) => {
    const updated = await sprintService.updateSprint(id, payload)
    await loadSprints()
    if (selectedSprintForDetail?.id === id) setSelectedSprintForDetail(updated)
    if (selectedSprintForPlanning?.id === id) setSelectedSprintForPlanning(updated)
    showToast(`Đã cập nhật ${updated.name}`)
  }

  const handleCloseSprint = async (resolution: 'backlog' | 'next_sprint', nextSprintId?: string) => {
    if (!closingSprint) return
    const closed = await sprintService.closeSprint(closingSprint.id, {
      unfinishedResolution: resolution,
      nextSprintId,
    })
    await loadSprints()
    if (selectedSprintForDetail?.id === closed.id) setSelectedSprintForDetail(closed)
    showToast(`Đã đóng ${closed.name} thành công.`)
  }

  const handleDeleteSprint = async () => {
    if (!deletingSprint) return
    const name = deletingSprint.name
    await sprintService.deleteSprint(deletingSprint.id)
    await loadSprints()
    if (selectedSprintForDetail?.id === deletingSprint.id) setSelectedSprintForDetail(null)
    if (selectedSprintForPlanning?.id === deletingSprint.id) setSelectedSprintForPlanning(null)
    showToast(`Đã xóa ${name}. Các thẻ đã được trả về Product Backlog.`)
  }

  const handleStartSprint = async (sprint: Sprint) => {
    try {
      const started = await sprintService.startSprint(sprint.id)
      await loadSprints()
      if (selectedSprintForPlanning?.id === sprint.id) {
        setSelectedSprintForPlanning(null)
        setSelectedSprintForDetail(started)
      }
      showToast(`Đã bắt đầu ${started.name}!`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể bắt đầu Sprint'
      showToast(`Lỗi: ${msg}`)
    }
  }

  // Filtered lists
  const filteredSprints = sprints.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && s.status === 'active') ||
      (statusFilter === 'planned' && (s.status === 'planned' || s.status === 'draft')) ||
      (statusFilter === 'closed' && s.status === 'closed')

    return matchesSearch && matchesStatus
  })

  const activeSprints = filteredSprints.filter((s) => s.status === 'active')
  const plannedSprints = filteredSprints.filter((s) => s.status === 'planned' || s.status === 'draft')
  const closedSprints = filteredSprints.filter((s) => s.status === 'closed')

  // Next planned sprints available for closing roll-over
  const availableNextSprints = sprints.filter((s) => s.status === 'planned')

  // Render sub-views if selected
  if (selectedSprintForPlanning) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <SprintPlanningView
          sprint={selectedSprintForPlanning}
          onBack={() => {
            setSelectedSprintForPlanning(null)
            loadSprints()
          }}
          onSprintUpdated={(updated) => {
            setSelectedSprintForPlanning(updated)
            loadSprints()
          }}
          onStartSprint={handleStartSprint}
          onEditSprint={setEditingSprint}
        />
        {editingSprint && (
          <EditSprintModal
            isOpen={true}
            onClose={() => setEditingSprint(null)}
            sprint={editingSprint}
            onSubmit={(id, payload) => handleUpdateSprint(id, payload)}
            onDeleteRequest={(target) => {
              setEditingSprint(null)
              setDeletingSprint(target)
            }}
          />
        )}
      </div>
    )
  }

  if (selectedSprintForDetail) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <SprintDetailView
          sprint={selectedSprintForDetail}
          onBack={() => {
            setSelectedSprintForDetail(null)
            loadSprints()
          }}
          onEditSprint={setEditingSprint}
          onCloseSprint={setClosingSprint}
          onPlanning={(s) => {
            setSelectedSprintForDetail(null)
            setSelectedSprintForPlanning(s)
          }}
          onSprintUpdated={(updated) => {
            setSelectedSprintForDetail(updated)
            loadSprints()
          }}
        />

        {editingSprint && (
          <EditSprintModal
            isOpen={true}
            onClose={() => setEditingSprint(null)}
            sprint={editingSprint}
            onSubmit={(id, payload) => handleUpdateSprint(id, payload)}
            onDeleteRequest={(target) => {
              setEditingSprint(null)
              setDeletingSprint(target)
            }}
          />
        )}

        {closingSprint && (
          <CloseSprintModal
            isOpen={true}
            onClose={() => setClosingSprint(null)}
            sprint={closingSprint}
            availableNextSprints={availableNextSprints.filter((s) => s.id !== closingSprint.id)}
            onConfirm={handleCloseSprint}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-neutral-900 text-white px-4 py-3 text-xs shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <Icon name="check-circle" size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header (S7-01) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Quản lý Sprint
          </h1>
          <p className="mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Lập kế hoạch, theo dõi chu kỳ phát triển Scrum và quản lý năng lực nhóm
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Icon name="plus" size={16} />}
        >
          Tạo Sprint mới
        </Button>
      </div>

      {/* KPI Overview Cards (S7-01) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border-light bg-white p-4 shadow-2xs dark:border-border-dark dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Sprint đang chạy</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              {activeSprint ? activeSprint.code : 'Chưa có'}
            </span>
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
              {activeSprint?.daysLeft || 'Hết hạn'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            {activeSprint ? `Đạt ${activeSprint.progressPercent}% (${activeSprint.completedSP}/${activeSprint.totalSP} SP)` : 'Không có Sprint nào chạy'}
          </p>
        </div>

        <div className="rounded-xl border border-border-light bg-white p-4 shadow-2xs dark:border-border-dark dark:bg-neutral-800">
          <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Vận tốc trung bình (Velocity)</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">21.5 SP</span>
            <span className="text-xs font-semibold text-emerald-600">+12%</span>
          </div>
          <p className="mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">Đo lường qua 3 Sprint gần nhất</p>
        </div>

        <div className="rounded-xl border border-border-light bg-white p-4 shadow-2xs dark:border-border-dark dark:bg-neutral-800">
          <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Cam kết Sprint hiện tại</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              {activeSprint ? `${activeSprint.totalItemsCount} thẻ` : '0 thẻ'}
            </span>
            <span className="text-xs font-semibold text-text-secondary-light">
              {activeSprint?.completedItemsCount} đã xong
            </span>
          </div>
          <p className="mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            {activeSprint ? `Còn lại ${activeSprint.remainingItemsCount} thẻ chưa hoàn tất` : 'Sẵn sàng lên kế hoạch'}
          </p>
        </div>

        <div className="rounded-xl border border-border-light bg-white p-4 shadow-2xs dark:border-border-dark dark:bg-neutral-800">
          <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Tổng chu kỳ phát triển</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{sprints.length} Sprint</span>
            <span className="text-xs font-semibold text-blue-600">{plannedSprints.length} kế hoạch</span>
          </div>
          <p className="mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">1 đang chạy • {closedSprints.length} đã đóng</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Icon
            name="search"
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm Sprint theo tên, mã hoặc mục tiêu..."
            className="w-full text-xs rounded-lg border border-border-light bg-white pl-8 pr-3 py-2 text-text-primary-light placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500 dark:border-border-dark dark:bg-neutral-800 dark:text-text-primary-dark"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-border-light bg-white px-3 py-2 text-text-primary-light dark:border-border-dark dark:bg-neutral-800 dark:text-text-primary-dark"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang chạy</option>
            <option value="planned">Đã lên kế hoạch</option>
            <option value="closed">Đã đóng</option>
          </select>
        </div>
      </div>

      {/* Grouped Sprint Sections (S7-01) */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-text-secondary-light">Đang tải danh sách Sprint...</div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Active Sprint (Đang chạy) */}
          {(statusFilter === 'all' || statusFilter === 'active') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">
                  Sprint đang chạy ({activeSprints.length})
                </h2>
              </div>

              {activeSprints.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border-light p-8 text-center text-xs text-text-secondary-light dark:border-border-dark">
                  Hiện không có Sprint nào đang chạy. Bạn có thể chọn một Sprint đã lên kế hoạch để bắt đầu.
                </div>
              ) : (
                activeSprints.map((sprint) => (
                  <div
                    key={sprint.id}
                    className="rounded-xl border border-primary-200 bg-white p-5 shadow-xs dark:border-primary-900/40 dark:bg-neutral-800 space-y-4 hover:border-primary-400 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5">
                          <h3
                            onClick={() => setSelectedSprintForDetail(sprint)}
                            className="text-base font-bold text-text-primary-light hover:text-primary-600 cursor-pointer dark:text-text-primary-dark dark:hover:text-primary-400"
                          >
                            {sprint.name}
                          </h3>
                          <Badge variant="success">Đang chạy</Badge>
                          {sprint.releaseVersion && <Badge variant="neutral">{sprint.releaseVersion}</Badge>}
                        </div>

                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark line-clamp-1">
                          <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">Mục tiêu:</span> {sprint.goal}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary-light dark:text-text-secondary-dark pt-1">
                          <span className="flex items-center gap-1.5">
                            <Icon name="calendar" size={14} />
                            {sprint.startDate} — {sprint.endDate}
                          </span>
                          <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                            <Icon name="clock" size={14} />
                            {sprint.daysLeft}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Icon name="users" size={14} />
                            {sprint.membersCount} thành viên
                          </span>
                        </div>
                      </div>

                      {/* Progress and actions */}
                      <div className="w-full lg:w-72 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary-light">Tiến độ</span>
                          <span className="font-bold text-emerald-600">
                            {sprint.progressPercent}% ({sprint.completedSP}/{sprint.totalSP} SP)
                          </span>
                        </div>
                        <ProgressBar value={sprint.progressPercent} variant="primary" />
                        <div className="flex justify-between text-[11px] text-text-secondary-light">
                          <span>{sprint.completedItemsCount}/{sprint.totalItemsCount} thẻ đã xong</span>
                          <span>Còn lại: {sprint.remainingItemsCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-border-light dark:border-border-dark text-xs">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setSelectedSprintForDetail(sprint)}
                          leftIcon={<Icon name="eye" size={14} />}
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setSelectedSprintForDetail(sprint)
                          }}
                          leftIcon={<Icon name="metrics" size={14} />}
                        >
                          Biểu đồ Burndown
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => setClosingSprint(sprint)}
                          leftIcon={<Icon name="check-circle" size={14} />}
                        >
                          Đóng Sprint
                        </Button>
                        <button
                          type="button"
                          onClick={() => setEditingSprint(sprint)}
                          className="p-1.5 text-text-secondary-light hover:text-text-primary-light rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          title="Chỉnh sửa Sprint"
                        >
                          <Icon name="edit" size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Section 2: Planned Sprints (Đã lên kế hoạch) */}
          {(statusFilter === 'all' || statusFilter === 'planned') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h2 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">
                  Sprint đã lên kế hoạch ({plannedSprints.length})
                </h2>
              </div>

              {plannedSprints.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border-light p-6 text-center text-xs text-text-secondary-light dark:border-border-dark">
                  Không có Sprint nào trong danh sách kế hoạch tiếp theo.
                </div>
              ) : (
                <div className="space-y-3">
                  {plannedSprints.map((sprint) => {
                    const capacityPercent = Math.round(
                      (sprint.totalSP / Math.max(1, sprint.capacitySP)) * 100,
                    )
                    return (
                      <div
                        key={sprint.id}
                        className="rounded-xl border border-border-light bg-white p-4 shadow-2xs dark:border-border-dark dark:bg-neutral-800 space-y-3 hover:border-neutral-300 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <h3
                                onClick={() => setSelectedSprintForPlanning(sprint)}
                                className="text-sm font-bold text-text-primary-light hover:text-primary-600 cursor-pointer dark:text-text-primary-dark"
                              >
                                {sprint.name}
                              </h3>
                              <Badge variant="neutral">Kế hoạch</Badge>
                            </div>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark line-clamp-1">
                              Mục tiêu: {sprint.goal}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-text-secondary-light dark:text-text-secondary-dark pt-0.5">
                              <span className="flex items-center gap-1.5">
                                <Icon name="calendar" size={13} />
                                {sprint.startDate} — {sprint.endDate}
                              </span>
                              <span>•</span>
                              <span>{sprint.membersCount} thành viên</span>
                              <span>•</span>
                              <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                                {sprint.items.length} thẻ ({sprint.totalSP} SP)
                              </span>
                            </div>
                          </div>

                          {/* Capacity gauge */}
                          <div className="w-full lg:w-56 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-text-secondary-light">Năng lực</span>
                              <span className="font-bold text-primary-600">
                                {sprint.totalSP} / {sprint.capacitySP} SP ({capacityPercent}%)
                              </span>
                            </div>
                            <ProgressBar value={capacityPercent} variant="primary" />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-border-light/70 dark:border-border-dark/70 text-xs">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setSelectedSprintForPlanning(sprint)}
                            leftIcon={<Icon name="kanban" size={14} />}
                          >
                            Lập kế hoạch Backlog
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="primary"
                              onClick={() => handleStartSprint(sprint)}
                              disabled={sprint.items.length === 0}
                              leftIcon={<Icon name="sprint" size={14} />}
                            >
                              Bắt đầu Sprint
                            </Button>
                            <button
                              type="button"
                              onClick={() => setEditingSprint(sprint)}
                              className="p-1.5 text-text-secondary-light hover:text-text-primary-light rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
                              title="Chỉnh sửa Sprint"
                            >
                              <Icon name="edit" size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingSprint(sprint)}
                              className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Xóa Sprint"
                            >
                              <Icon name="trash" size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Closed Sprints (Đã đóng) */}
          {(statusFilter === 'all' || statusFilter === 'closed') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                <h2 className="text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                  Sprint đã hoàn thành / Đã đóng ({closedSprints.length})
                </h2>
              </div>

              {closedSprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className="rounded-xl border border-border-light bg-neutral-50/50 p-4 shadow-2xs dark:border-border-dark dark:bg-neutral-900/30 space-y-3 opacity-90"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3
                          onClick={() => setSelectedSprintForDetail(sprint)}
                          className="text-sm font-bold text-text-primary-light hover:text-primary-600 cursor-pointer dark:text-text-primary-dark"
                        >
                          {sprint.name}
                        </h3>
                        <Badge variant="neutral">Đã đóng</Badge>
                        {sprint.releaseVersion && <Badge variant="neutral">{sprint.releaseVersion}</Badge>}
                      </div>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        Mục tiêu: {sprint.goal}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-text-secondary-light pt-0.5">
                        <span>{sprint.startDate} — {sprint.endDate}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Hoàn tất 100% ({sprint.completedSP}/{sprint.totalSP} SP)
                        </span>
                        <span>•</span>
                        <span>{sprint.items.length} thẻ</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setSelectedSprintForDetail(sprint)}
                        leftIcon={<Icon name="eye" size={14} />}
                      >
                        Xem lưu trữ
                      </Button>
                      <button
                        type="button"
                        onClick={() => setDeletingSprint(sprint)}
                        className="p-1.5 text-text-secondary-light hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Xóa Sprint"
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateSprintModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSprint}
      />

      {editingSprint && (
        <EditSprintModal
          isOpen={true}
          onClose={() => setEditingSprint(null)}
          sprint={editingSprint}
          onSubmit={(id, payload) => handleUpdateSprint(id, payload)}
          onDeleteRequest={(target) => {
            setEditingSprint(null)
            setDeletingSprint(target)
          }}
        />
      )}

      {closingSprint && (
        <CloseSprintModal
          isOpen={true}
          onClose={() => setClosingSprint(null)}
          sprint={closingSprint}
          availableNextSprints={availableNextSprints.filter((s) => s.id !== closingSprint.id)}
          onConfirm={handleCloseSprint}
        />
      )}

      {deletingSprint && (
        <DeleteSprintModal
          isOpen={true}
          onClose={() => setDeletingSprint(null)}
          sprint={deletingSprint}
          onConfirm={handleDeleteSprint}
        />
      )}
    </div>
  )
}
export default SprintsPage
