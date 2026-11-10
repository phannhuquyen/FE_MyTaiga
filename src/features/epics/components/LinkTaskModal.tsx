import { useState, useMemo, useEffect } from 'react'
import { Modal, Button, Icon, Badge } from '@/components/ui'
import { api, type TaskData } from '@/services/api'
import { allPages } from '@/lib/allPages'
import { projectService } from '@/features/projects/services/projectService'
import type { Epic, EpicTask } from '../types'

export interface LinkTaskModalProps {
  isOpen: boolean
  epic: Epic | null
  onClose: () => void
  onConfirm: (taskIds: string[]) => Promise<void>
}

export function LinkTaskModal({
  isOpen,
  epic,
  onClose,
  onConfirm,
}: LinkTaskModalProps) {
  const [candidates, setCandidates] = useState<(EpicTask & { epicId: number | null })[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [filterType, setFilterType] = useState<'all' | 'unlinked' | 'pbi'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!isOpen || !epic) return
    const projectId = projectService.getActiveProjectId()
    if (!projectId) return
    let cancelled = false
    setLoading(true)
    setSelectedTaskIds([])
    setError(null)
    allPages(page => api.tasks.list(projectId, { page, pageSize: 100 })).then(rows => {
      if (cancelled) return
      setCandidates(rows.filter(row => row.epicId !== Number(epic.id)).map(row => ({
        id: String(row.taskId), code: `TASK-${row.taskId}`, title: row.title,
        epicId: row.epicId, status: taskStatus(row),
        assigneeName: row.assignee?.fullName || row.assigneeName || 'Chưa giao',
        assigneeAvatar: row.assigneeAvatarCode || '—',
      })))
    }).catch(() => { if (!cancelled) { setCandidates([]); setError('Không thể tải danh sách Task.') } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [isOpen, epic])


  const handleClose = () => {
    setSearch('')
    setSelectedTaskIds([])
    setFilterType('all')
    setError(null)
    onClose()
  }

  const toggleTask = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const filteredTasks = useMemo(() => {
    return candidates.filter((task) => {
      if (filterType === 'unlinked' && task.epicId != null) return false
      if (filterType === 'pbi' && !task.parentPbiCode) return false
      if (search) {
        const q = search.toLowerCase().trim()
        const match =
          task.code.toLowerCase().includes(q) ||
          task.title.toLowerCase().includes(q) ||
          (task.parentPbiTitle && task.parentPbiTitle.toLowerCase().includes(q))
        if (!match) return false
      }
      return true
    })
  }, [search, candidates, filterType])

  const handleConfirm = async () => {
    if (selectedTaskIds.length === 0) {
      setError('Vui lòng chọn ít nhất một nhiệm vụ để liên kết.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await onConfirm(selectedTaskIds)
      handleClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi liên kết nhiệm vụ.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!epic) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Liên kết nhiệm vụ kỹ thuật với Epic"
      maxWidth="lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={selectedTaskIds.length === 0 || isSubmitting || loading}
            leftIcon={<Icon name="check" size={16} />}
          >
            {isSubmitting
              ? 'Đang liên kết...'
              : `Xác nhận liên kết (${selectedTaskIds.length})`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {loading && <p role="status">Đang tải Task...</p>}
        <div>
          <p className="text-body-sm text-neutral-600">
            Chọn các nhiệm vụ kỹ thuật để đưa vào phạm vi theo dõi của Epic{' '}
            <strong className="text-neutral-900">[{epic.code}] {epic.name}</strong>.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-body-sm rounded-md">
            <Icon name="alert-circle" size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Search & Tabs */}
        <div className="space-y-2">
          <div className="relative">
            <Icon
              name="search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên nhiệm vụ..."
              className="w-full pl-9 pr-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-caption font-medium rounded-full cursor-pointer transition-colors ${
                filterType === 'all'
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Tất cả nhiệm vụ ({candidates.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('unlinked')}
              className={`px-3 py-1 text-caption font-medium rounded-full cursor-pointer transition-colors ${
                filterType === 'unlinked'
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Chưa liên kết
            </button>
            <button
              type="button"
              disabled title="BE chưa cung cấp quan hệ Task–PBI"
              onClick={() => setFilterType('pbi')}
              className={`px-3 py-1 text-caption font-medium rounded-full cursor-pointer transition-colors ${
                filterType === 'pbi'
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Từ PBI thuộc Epic
            </button>
          </div>
        </div>

        {/* Selection summary */}
        {selectedTaskIds.length > 0 && (
          <div className="p-2.5 bg-primary-50/70 border border-primary-200 text-primary-800 text-body-sm rounded-md flex items-center justify-between">
            <span>Đã chọn <strong>{selectedTaskIds.length}</strong> nhiệm vụ kỹ thuật</span>
            <button
              type="button"
              onClick={() => setSelectedTaskIds([])}
              className="text-caption text-primary-700 underline hover:text-primary-900 cursor-pointer"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        )}

        {/* Task list table */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden max-h-72 overflow-y-auto divide-y divide-neutral-100">
          {filteredTasks.length === 0 ? (
            <div className="p-6 text-center text-body-sm text-neutral-500">
              Không tìm thấy nhiệm vụ nào phù hợp.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isSelected = selectedTaskIds.includes(task.id)
              return (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary-50/40' : 'hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500 cursor-pointer"
                    checked={isSelected}
                    onChange={() => {}} // Handled by container
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-caption font-semibold text-neutral-800">
                        {task.code}
                      </span>
                      {task.parentPbiCode && (
                        <span className="text-[11px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                          {task.parentPbiCode}: {task.parentPbiTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-neutral-900 truncate">
                      {task.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {task.assigneeName ? (
                      <div className="flex items-center gap-1.5 text-caption text-neutral-600">
                        <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-800 text-[10px] font-bold flex items-center justify-center">
                          {task.assigneeAvatar}
                        </span>
                        <span className="hidden sm:inline">{task.assigneeName}</span>
                      </div>
                    ) : (
                      <span className="text-caption text-neutral-400 italic">Chưa gán</span>
                    )}

                    <Badge
                      variant={
                        task.status === 'done'
                          ? 'success'
                          : task.status === 'in_progress'
                            ? 'primary'
                            : task.status === 'testing'
                              ? 'warning'
                              : 'neutral'
                      }
                    >
                      {task.status === 'done'
                        ? 'Hoàn thành'
                        : task.status === 'in_progress'
                          ? 'Đang làm'
                          : task.status === 'testing'
                            ? 'Kiểm tra'
                            : 'Cần làm'}
                    </Badge>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Modal>
  )
}

function taskStatus(row: TaskData): EpicTask['status'] {
  return row.status === 'DONE' ? 'done' : row.status === 'IN_REVIEW' ? 'testing' : row.status === 'IN_PROGRESS' ? 'in_progress' : 'todo'
}
