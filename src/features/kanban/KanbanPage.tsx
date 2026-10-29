import { useState, useEffect, useMemo } from 'react'
import { useQuickCreate } from '@/hooks/useQuickCreate'
import { useParams, useSearchParams } from 'react-router-dom'
import type { KanbanTask, KanbanColumnConfig, KanbanColumnId, CreateTaskPayload, WIPSettingsPayload } from './types'
import { kanbanService } from './services/kanbanService'
import { KanbanColumn } from './components/KanbanColumn'
import { TaskDetailDrawer } from './components/TaskDetailDrawer'
import { QuickCreateTaskModal } from './components/QuickCreateTaskModal'
import { WIPConfigModal } from './components/WIPConfigModal'
import { DeleteTaskModal } from './components/DeleteTaskModal'
import { Button, Icon } from '@/components/ui'

export function KanbanPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const numericProjectId = projectId ? parseInt(projectId, 10) : undefined
  const [searchParams] = useSearchParams()
  const requestedTask = searchParams.get('id')

  const [columns, setColumns] = useState<KanbanColumnConfig[]>([])
  const [tasks, setTasks] = useState<KanbanTask[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('all')
  const [onlyMyTasks, setOnlyMyTasks] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState('all')

  // Modals & Drawers
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<KanbanTask | null>(null)
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  useQuickCreate(setIsQuickCreateOpen)
  const [quickCreateColumnId, setQuickCreateColumnId] = useState<KanbanColumnId>('todo')
  const [isWIPModalOpen, setIsWIPModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<KanbanTask | null>(null)
  useEffect(() => {
    if (!requestedTask) return
    let cancelled = false
    kanbanService.getTaskById(requestedTask).then(task => { if (!cancelled) setSelectedTaskForDrawer(task) })
    return () => { cancelled = true }
  }, [requestedTask])

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadData = async () => {
    try {
      const [cols, allTasks] = await Promise.all([
        kanbanService.getColumns(numericProjectId),
        kanbanService.getTasks(numericProjectId),
      ])
      setColumns(cols)
      setTasks(allTasks)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [numericProjectId])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          (t.pbiCode && t.pbiCode.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q))),
      )
    }

    if (onlyMyTasks) {
      result = result.filter((t) => t.assignee.isCurrentUser || t.assignee.name.includes('Quân'))
    } else if (selectedAssignee !== 'all') {
      result = result.filter((t) => t.assignee.name === selectedAssignee)
    }

    if (selectedPriority !== 'all') {
      result = result.filter((t) => t.priority === selectedPriority)
    }

    return result
  }, [tasks, searchQuery, onlyMyTasks, selectedAssignee, selectedPriority])

  // Count per column
  const currentCounts = useMemo(() => {
    const counts: Record<string, number> = { todo: 0, in_progress: 0, review: 0, done: 0 }
    tasks.forEach((t) => {
      counts[t.columnId] = (counts[t.columnId] || 0) + 1
    })
    return counts
  }, [tasks])

  // Check if any column is over WIP
  const hasWIPWarning = useMemo(() => {
    return columns.some((c) => c.wipLimit !== null && (currentCounts[c.id] || 0) > c.wipLimit)
  }, [columns, currentCounts])

  // Handlers
  const handleCreateTask = async (payload: CreateTaskPayload) => {
    try {
      const created = await kanbanService.createTask(payload, numericProjectId)
      await loadData()
      setIsQuickCreateOpen(false)
      showToast(`Đã tạo thành công thẻ #${created.code}`)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi tạo thẻ')
      throw err
    }
  }

  const handleUpdateTask = async (id: string, payload: Partial<KanbanTask>) => {
    const updated = await kanbanService.updateTask(id, payload)
    await loadData()
    if (selectedTaskForDrawer?.id === id) {
      setSelectedTaskForDrawer(updated)
    }
    showToast(`Đã lưu thay đổi cho #${updated.code}`)
  }

  const handleDropTask = async (taskId: string, targetColId: KanbanColumnId) => {
    try {
      const res = await kanbanService.moveTask(taskId, targetColId)
      await loadData()
      if (res.isWIPExceeded) {
        showToast(`Cảnh báo: Cột đã vượt giới hạn WIP (${res.task.columnId})!`)
      } else {
        showToast(`Đã chuyển #${res.task.code} sang trạng thái mới`)
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể chuyển thẻ')
    }
  }

  const handleToggleColumnCollapse = async (colId: KanbanColumnId) => {
    const updatedCols = await kanbanService.toggleColumnCollapse(colId)
    setColumns(updatedCols)
  }

  const handleDeleteTask = async (id: string) => {
    await kanbanService.deleteTask(id)
    await loadData()
    if (selectedTaskForDrawer?.id === id) {
      setSelectedTaskForDrawer(null)
    }
    showToast('Đã xóa tác vụ thành công.')
  }

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const updated = await kanbanService.toggleSubtask(taskId, subtaskId)
    await loadData()
    if (selectedTaskForDrawer?.id === taskId) {
      setSelectedTaskForDrawer(updated)
    }
  }

  const handleAddSubtask = async (taskId: string, stTitle: string) => {
    const updated = await kanbanService.addSubtask(taskId, stTitle)
    await loadData()
    if (selectedTaskForDrawer?.id === taskId) {
      setSelectedTaskForDrawer(updated)
    }
  }

  const handleAddComment = async (taskId: string, content: string) => {
    const updated = await kanbanService.addComment(taskId, content)
    await loadData()
    if (selectedTaskForDrawer?.id === taskId) {
      setSelectedTaskForDrawer(updated)
    }
    showToast('Đã gửi bình luận')
  }

  const handleSaveWIP = async (payload: WIPSettingsPayload) => {
    try {
      const updatedCols = await kanbanService.updateWIPLimits(payload, numericProjectId)
      setColumns(updatedCols)
      showToast('Đã cập nhật giới hạn WIP cho các cột Kanban')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi cập nhật giới hạn WIP')
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-neutral-50/50">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-neutral-900 text-white px-4 py-3 text-xs shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <Icon name="check-circle" size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Context (Sprint 14 Active Context - S8-01, S8-03) */}
      <div className="px-6 py-4 bg-whiteboard border-b border-neutral-200 shrink-0 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                Sprint 14: Tối ưu luồng & Đồng bộ dữ liệu
              </h1>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                Đang chạy
              </span>
            </div>
            <p className="text-xs text-neutral-500 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Icon name="calendar" size={13} />
                14/10/2024 — 28/10/2024
              </span>
              <span>•</span>
              <span className="font-semibold text-primary-700">Còn 4 ngày</span>
              <span>•</span>
              <span>Mục tiêu: Đạt chuẩn PCI-DSS & API Gateway latency &lt; 15ms</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsWIPModalOpen(true)}
              leftIcon={<Icon name="sliders" size={14} />}
            >
              Cấu hình WIP
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setQuickCreateColumnId('todo')
                setIsQuickCreateOpen(true)
              }}
              leftIcon={<Icon name="plus" size={14} />}
            >
              + Tạo Task
            </Button>
          </div>
        </div>

        {/* Global WIP Warning Banner (S8-11 & S8-12) */}
        {hasWIPWarning && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-danger-50 border border-danger-200 text-xs text-danger-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Icon name="alert-triangle" size={16} className="text-danger-600 shrink-0" />
              <span>
                <strong className="font-bold">Cảnh báo WIP:</strong> Cột &quot;Đang làm&quot; hiện có{' '}
                {currentCounts.in_progress} thẻ (vượt quá giới hạn 4 thẻ cho phép). Đề nghị nhóm tập trung kéo các thẻ hoàn tất sang kiểm tra trước khi nhận thêm việc mới.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsWIPModalOpen(true)}
              className="font-bold underline text-danger-700 hover:text-danger-900 shrink-0 cursor-pointer ml-3"
            >
              Xem chi tiết WIP
            </button>
          </div>
        )}

        {/* Filter & Search Bar (S8-08 & S8-09) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-xl">
            {/* Realtime Search Input */}
            <div className="relative flex-1">
              <Icon
                name="search"
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm task, mã # hoặc nội dung..."
                className="w-full text-xs py-1.5 pl-8 pr-3 border border-neutral-300 rounded-lg bg-neutral-50 focus:bg-whiteboard focus:outline-none focus:ring-1 focus:ring-primary-500 text-neutral-800 placeholder:text-neutral-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <Icon name="close" size={12} />
                </button>
              )}
            </div>

            {/* My tasks toggle button */}
            <button
              type="button"
              onClick={() => setOnlyMyTasks((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer shrink-0 ${
                onlyMyTasks
                  ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                  : 'border-neutral-300 bg-whiteboard text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Icon name="user" size={13} />
              <span>Chỉ thẻ của tôi</span>
            </button>
          </div>

          {/* Member & Priority Dropdowns */}
          <div className="flex items-center gap-2 text-xs">
            {/* Assignee Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedAssignee}
                onChange={(e) => {
                  setSelectedAssignee(e.target.value)
                  if (onlyMyTasks) setOnlyMyTasks(false)
                }}
                className="py-1.5 pl-3 pr-7 bg-whiteboard border border-neutral-300 rounded-lg text-neutral-700 font-medium focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer"
              >
                <option value="all">Tất cả thành viên</option>
                <option value="Minh Quân">Minh Quân (Tech Lead)</option>
                <option value="Tuấn Anh">Tuấn Anh (Backend)</option>
                <option value="Hoàng Linh">Hoàng Linh (Frontend)</option>
                <option value="Minh Hải">Minh Hải (DevOps)</option>
                <option value="Đỗ Thảo">Đỗ Thảo (QA)</option>
                <option value="Thùy Trang">Thùy Trang (Frontend)</option>
              </select>
              <Icon
                name="chevron-down"
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="py-1.5 pl-3 pr-7 bg-whiteboard border border-neutral-300 rounded-lg text-neutral-700 font-medium focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer"
              >
                <option value="all">Tất cả ưu tiên</option>
                <option value="urgent">Khẩn cấp</option>
                <option value="high">Cao</option>
                <option value="medium">Vừa</option>
                <option value="low">Thấp</option>
              </select>
              <Icon
                name="chevron-down"
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>

            {/* Reset Filters */}
            {(searchQuery || selectedAssignee !== 'all' || onlyMyTasks || selectedPriority !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedAssignee('all')
                  setOnlyMyTasks(false)
                  setSelectedPriority('all')
                }}
                className="text-primary-600 hover:text-primary-800 font-semibold px-2 py-1 text-xs cursor-pointer"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Kanban Columns Scroll Area (S8-01, S8-06) */}
      <div className="flex-1 overflow-x-auto p-6">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-xs text-neutral-400">
            Đang tải dữ liệu Bảng Kanban...
          </div>
        ) : (
          <div className="flex gap-4 items-start min-w-max pb-4">
            {columns.map((column) => {
              const columnTasks = filteredTasks.filter((t) => t.columnId === column.id)
              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onTaskClick={async task => {
                    const detail = await kanbanService.getTaskById(task.id)
                    if (detail) setSelectedTaskForDrawer(detail)
                    else showToast('Không tải được chi tiết Task từ máy chủ.')
                  }}
                  onTaskDelete={setTaskToDelete}
                  onQuickAddTask={(colId) => {
                    setQuickCreateColumnId(colId)
                    setIsQuickCreateOpen(true)
                  }}
                  onToggleCollapse={handleToggleColumnCollapse}
                  onDropTask={handleDropTask}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <QuickCreateTaskModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        defaultColumnId={quickCreateColumnId}
        onCreate={handleCreateTask}
      />

      <WIPConfigModal
        isOpen={isWIPModalOpen}
        onClose={() => setIsWIPModalOpen(false)}
        columns={columns}
        currentCounts={currentCounts}
        onSave={handleSaveWIP}
      />

      <DeleteTaskModal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        task={taskToDelete}
        onConfirm={handleDeleteTask}
      />

      <TaskDetailDrawer
        isOpen={Boolean(selectedTaskForDrawer)}
        onClose={() => setSelectedTaskForDrawer(null)}
        task={selectedTaskForDrawer}
        onUpdate={handleUpdateTask}
        onDeleteRequest={(t) => {
          setSelectedTaskForDrawer(null)
          setTaskToDelete(t)
        }}
        onToggleSubtask={handleToggleSubtask}
        onAddSubtask={handleAddSubtask}
        onAddComment={handleAddComment}
      />
    </div>
  )
}
export default KanbanPage
