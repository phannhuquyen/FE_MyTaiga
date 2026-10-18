import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Icon, Badge, ProgressBar } from '@/components/ui'
import { epicService } from './services/epicService'
import { CreateEpicModal } from './components/CreateEpicModal'
import { EditEpicModal } from './components/EditEpicModal'
import { DeleteEpicModal } from './components/DeleteEpicModal'
import { EpicDetailView } from './components/EpicDetailView'
import type { Epic, CreateEpicPayload, UpdateEpicPayload } from './types'

export default function EpicsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedEpicId = searchParams.get('id')

  const [epics, setEpics] = useState<Epic[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null)
  const [deletingEpic, setDeletingEpic] = useState<Epic | null>(null)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const loadEpics = useCallback(async () => {
    try {
      setIsLoading(true)
      const list = await epicService.getEpics({
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
      })
      setEpics(list)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, statusFilter, priorityFilter])

  useEffect(() => {
    loadEpics()
  }, [loadEpics])

  const handleSelectEpic = (id: string | null) => {
    if (id) {
      setSearchParams({ id })
    } else {
      setSearchParams({})
    }
  }

  const handleCreateEpic = async (payload: CreateEpicPayload) => {
    const created = await epicService.createEpic(payload)
    await loadEpics()
    showToast(`Đã tạo Epic [${created.code}] thành công.`)
  }

  const handleEditEpic = async (id: string, payload: UpdateEpicPayload) => {
    await epicService.updateEpic(id, payload)
    await loadEpics()
    showToast('Đã lưu thay đổi Epic thành công.')
  }

  const handleDeleteEpic = async (id: string) => {
    await epicService.deleteEpic(id)
    await loadEpics()
    if (selectedEpicId === id) {
      handleSelectEpic(null)
    }
    showToast('Đã xóa Epic thành công.')
  }

  // Summary counts
  const totalEpics = epics.length
  const inProgressCount = useMemo(
    () => epics.filter((e) => e.status === 'in_progress').length,
    [epics],
  )
  const completedCount = useMemo(
    () => epics.filter((e) => e.status === 'completed').length,
    [epics],
  )

  // If an Epic is selected, render the S6-02/S6-04 detail view
  if (selectedEpicId) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EpicDetailView
          epicId={selectedEpicId}
          onBack={() => handleSelectEpic(null)}
          onEpicUpdated={loadEpics}
          onEpicDeleted={loadEpics}
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-neutral-900 text-white rounded-lg shadow-lg text-body-sm transition-all">
          <Icon name="check-circle" size={18} className="text-primary-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header (S6-01) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">Danh sách Epic</h1>
            <span className="px-2.5 py-0.5 rounded-full text-caption font-semibold bg-primary-100 text-primary-800">
              {totalEpics} Epic
            </span>
          </div>
          <p className="text-body-sm text-neutral-500 mt-1">
            Nhóm các yêu cầu sản phẩm (PBI) theo sáng kiến chiến lược cấp cao để theo dõi mục tiêu dài hạn.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Icon name="plus" size={16} />}
        >
          Tạo Epic mới
        </Button>
      </div>

      {/* Quick Stat Pill Chips */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg shadow-xs text-caption flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
          <span className="text-neutral-600">Đang thực hiện:</span>
          <span className="font-bold text-neutral-900">{inProgressCount}</span>
        </div>
        <div className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg shadow-xs text-caption flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-neutral-600">Đã hoàn thành:</span>
          <span className="font-bold text-neutral-900">{completedCount}</span>
        </div>
      </div>

      {/* Filters & Search Toolbar (S6-01) */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Icon
            name="search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, tên hoặc mô tả Epic..."
            className="w-full pl-9 pr-3 py-2 text-body-sm bg-neutral-50/50 border border-neutral-300 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="open">Đang mở</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="closed">Đã đóng</option>
          </select>

          <select
            className="px-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">Tất cả độ ưu tiên</option>
            <option value="urgent">Khẩn cấp</option>
            <option value="high">Ưu tiên cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>

          {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setPriorityFilter('all')
              }}
              className="px-2.5 py-2 text-caption text-neutral-500 hover:text-neutral-800 font-medium cursor-pointer"
            >
              Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* Epics Table (S6-01) */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-caption font-semibold text-neutral-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Epic / Tên sáng kiến</th>
                <th className="px-5 py-3.5 w-48">Tiến độ</th>
                <th className="px-5 py-3.5">PBI & Task</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5">Độ ưu tiên</th>
                <th className="px-5 py-3.5">Sprint mục tiêu</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-500">
                    Đang tải danh sách Epic...
                  </td>
                </tr>
              ) : epics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 mx-auto flex items-center justify-center text-neutral-400">
                        <Icon name="epic" size={24} />
                      </div>
                      <p className="text-body-sm font-semibold text-neutral-800">
                        Không tìm thấy Epic nào
                      </p>
                      <p className="text-caption text-neutral-500">
                        Thử thay đổi bộ lọc tìm kiếm hoặc tạo một Epic mới để bắt đầu theo dõi.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        leftIcon={<Icon name="plus" size={14} />}
                      >
                        Tạo Epic mới
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                epics.map((epic) => (
                  <tr
                    key={epic.id}
                    className="hover:bg-neutral-50/70 transition-colors group cursor-pointer"
                    onClick={() => handleSelectEpic(epic.id)}
                  >
                    {/* Epic Name + Color tag + Description preview */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <span
                          className="w-2.5 h-10 rounded-sm shrink-0 mt-0.5"
                          style={{ backgroundColor: epic.color }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-caption font-bold text-neutral-500">
                              {epic.code}
                            </span>
                            <span className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                              {epic.name}
                            </span>
                          </div>
                          <p className="text-caption text-neutral-500 truncate max-w-md mt-0.5">
                            {epic.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1">
                        <div className="flex justify-between text-caption font-semibold text-neutral-700">
                          <span>{epic.progressPercent}%</span>
                          <span className="text-neutral-500 font-normal">
                            {epic.completedPoints}/{epic.totalPoints} SP
                          </span>
                        </div>
                        <ProgressBar
                          value={epic.progressPercent}
                        />
                      </div>
                    </td>

                    {/* PBI & Task count */}
                    <td className="px-5 py-4 text-caption text-neutral-600 font-medium">
                      <span>{epic.pbisCount} PBI</span>
                      <span className="mx-1 text-neutral-300">•</span>
                      <span>{epic.tasksCount} Task</span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          epic.status === 'completed'
                            ? 'success'
                            : epic.status === 'in_progress'
                              ? 'primary'
                              : epic.status === 'open'
                                ? 'warning'
                                : 'neutral'
                        }
                      >
                        {epic.status === 'completed'
                          ? 'Đã hoàn thành'
                          : epic.status === 'in_progress'
                            ? 'Đang thực hiện'
                            : epic.status === 'open'
                              ? 'Đang mở'
                              : 'Đã đóng'}
                      </Badge>
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          epic.priority === 'urgent'
                            ? 'danger'
                            : epic.priority === 'high'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {epic.priority === 'urgent'
                          ? 'Khẩn cấp'
                          : epic.priority === 'high'
                            ? 'Cao'
                            : epic.priority === 'medium'
                              ? 'Trung bình'
                              : 'Thấp'}
                      </Badge>
                    </td>

                    {/* Target Sprint */}
                    <td className="px-5 py-4 text-caption text-neutral-700">
                      {epic.targetSprint || (
                        <span className="text-neutral-400 italic">Chưa xếp sprint</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-5 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleSelectEpic(epic.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                          title="Xem chi tiết Epic"
                        >
                          <Icon name="eye" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingEpic(epic)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                          title="Chỉnh sửa Epic"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingEpic(epic)}
                          className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Xóa Epic"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination info */}
        <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-caption text-neutral-500">
          <span>
            Hiển thị <strong>{epics.length}</strong> trên tổng số <strong>{totalEpics}</strong> Epic
          </span>
          <span>Sắp xếp theo thứ tự ưu tiên & thời gian cập nhật</span>
        </div>
      </div>

      {/* Modals */}
      <CreateEpicModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateEpic}
      />

      <EditEpicModal
        isOpen={!!editingEpic}
        epic={editingEpic}
        onClose={() => setEditingEpic(null)}
        onSubmit={handleEditEpic}
      />

      <DeleteEpicModal
        isOpen={!!deletingEpic}
        epic={deletingEpic}
        onClose={() => setDeletingEpic(null)}
        onConfirm={handleDeleteEpic}
      />
    </div>
  )
}
