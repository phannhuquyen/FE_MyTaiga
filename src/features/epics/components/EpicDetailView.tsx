import { useState, useEffect, useCallback } from 'react'
import { Button, Icon, Badge } from '@/components/ui'
import { epicService } from '../services/epicService'
import { EpicProgressTab } from './EpicProgressTab'
import { LinkTaskModal } from './LinkTaskModal'
import { LinkPbiModal } from './LinkPbiModal'
import { EditEpicModal } from './EditEpicModal'
import { DeleteEpicModal } from './DeleteEpicModal'
import type { Epic, UpdateEpicPayload } from '../types'
import type { PBI } from '@/features/backlog/types'

export interface EpicDetailViewProps {
  epicId: string
  onBack: () => void
  onEpicUpdated?: () => void
  onEpicDeleted?: () => void
}

export function EpicDetailView({
  epicId,
  onBack,
  onEpicUpdated,
  onEpicDeleted,
}: EpicDetailViewProps) {
  const [epic, setEpic] = useState<Epic | null>(null)
  const [pbis, setPbis] = useState<PBI[]>([])
  const [activeTab, setActiveTab] = useState<'pbis' | 'tasks' | 'progress'>('pbis')
  const [isLoading, setIsLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLinkTaskOpen, setIsLinkTaskOpen] = useState(false)
  const [isLinkPbiOpen, setIsLinkPbiOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const foundEpic = await epicService.getEpicById(epicId)
      if (foundEpic) {
        setEpic(foundEpic)
        const epicPbis = await epicService.getEpicPBIs(foundEpic.id)
        setPbis(epicPbis)
      }
    } finally {
      setIsLoading(false)
    }
  }, [epicId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleEdit = async (id: string, payload: UpdateEpicPayload) => {
    const updated = await epicService.updateEpic(id, payload)
    setEpic(updated)
    showToast('Đã cập nhật thông tin Epic thành công.')
    onEpicUpdated?.()
  }

  const handleDelete = async (id: string) => {
    await epicService.deleteEpic(id)
    showToast('Đã xóa Epic thành công.')
    onEpicDeleted?.()
    onBack()
  }

  const handleUnlinkPbi = async (pbiId: string, pbiCode: string) => {
    if (!epic) return
    await epicService.unlinkPBI(epic.id, pbiId)
    setPbis((prev) => prev.filter((p) => p.id !== pbiId))
    setEpic((prev) => (prev ? { ...prev, pbisCount: Math.max(0, prev.pbisCount - 1) } : null))
    showToast(`Đã gỡ [${pbiCode}] khỏi Epic.`)
    onEpicUpdated?.()
  }

  const handleLinkPbi = async (pbiId: string) => {
    if (!epic) return
    await epicService.linkPBI(epic.id, pbiId)
    await loadData()
    showToast('Đã liên kết PBI vào Epic thành công.')
    onEpicUpdated?.()
  }

  const handleLinkTasks = async (taskIds: string[]) => {
    if (!epic) return
    await epicService.linkTasks(epic.id, taskIds)
    await loadData()
    showToast(`Đã liên kết ${taskIds.length} nhiệm vụ kỹ thuật vào Epic.`)
    onEpicUpdated?.()
  }

  if (isLoading && !epic) {
    return (
      <div className="p-8 text-center text-body-sm text-neutral-500">
        Đang tải thông tin chi tiết Epic...
      </div>
    )
  }

  if (!epic) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-body-sm text-neutral-600">Không tìm thấy thông tin Epic.</p>
        <Button variant="outline" onClick={onBack}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-neutral-900 text-white rounded-lg shadow-lg text-body-sm transition-all">
          <Icon name="check-circle" size={18} className="text-primary-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-caption text-neutral-500">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
        >
          <Icon name="arrow-left" size={16} />
          <span>Danh sách Epic</span>
        </button>
        <span>/</span>
        <span className="text-neutral-800 font-semibold truncate">
          [{epic.code}] {epic.name}
        </span>
      </div>

      {/* Epic Header Card (S6-02) */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className="w-4 h-12 rounded-sm shrink-0"
              style={{ backgroundColor: epic.color }}
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-caption font-bold text-neutral-500">
                  {epic.code}
                </span>
                <h1 className="text-xl font-bold text-neutral-900">
                  {epic.name}
                </h1>
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
                      ? 'Ưu tiên cao'
                      : epic.priority === 'medium'
                        ? 'Trung bình'
                        : 'Thấp'}
                </Badge>
              </div>

              <p className="text-body-sm text-neutral-600 leading-relaxed max-w-3xl">
                {epic.description || 'Không có mô tả chi tiết cho Epic này.'}
              </p>

              {/* Metadata chips */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-caption text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <Icon name="calendar" size={14} className="text-neutral-400" />
                  <span>Mục tiêu: {epic.sprintRange || epic.targetSprint || 'Chưa gán'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="user" size={14} className="text-neutral-400" />
                  <span>Chủ sở hữu: <strong>{epic.ownerName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="clock" size={14} className="text-neutral-400" />
                  <span>Cập nhật: {epic.updatedAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon name="edit" size={14} />}
              onClick={() => setIsEditOpen(true)}
            >
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon name="tag" size={14} />}
              onClick={() => setIsLinkTaskOpen(true)}
            >
              Liên kết Task
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Icon name="trash" size={14} />}
              onClick={() => setIsDeleteOpen(true)}
            >
              Xóa Epic
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (S6-02) */}
      <div className="border-b border-neutral-200 flex items-center gap-8">
        <button
          type="button"
          onClick={() => setActiveTab('pbis')}
          className={`pb-3 text-body-sm font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'pbis'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Icon name="backlog" size={16} />
          <span>Danh sách PBI ({pbis.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 text-body-sm font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Icon name="check-circle" size={16} />
          <span>Nhiệm vụ kỹ thuật ({epic.tasks?.length || epic.tasksCount || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`pb-3 text-body-sm font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'progress'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Icon name="metrics" size={16} />
          <span>Tiến độ & Phân bổ</span>
        </button>
      </div>

      {/* Tab 1: PBI List (S6-02) */}
      {activeTab === 'pbis' && (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-body-sm font-semibold text-neutral-900">
              Các Backlog Item thuộc Epic này ({pbis.length})
            </h3>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Icon name="plus" size={14} />}
              onClick={() => setIsLinkPbiOpen(true)}
            >
              Liên kết PBI
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-caption font-semibold text-neutral-600 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Mã PBI</th>
                  <th className="px-5 py-3">Tiêu đề yêu cầu</th>
                  <th className="px-5 py-3">Độ ưu tiên</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Điểm SP</th>
                  <th className="px-5 py-3">Sprint gán</th>
                  <th className="px-5 py-3">Người phụ trách</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pbis.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral-500">
                      Chưa có Backlog Item nào liên kết với Epic này. Bấm &quot;Liên kết PBI&quot; để thêm.
                    </td>
                  </tr>
                ) : (
                  pbis.map((pbi) => (
                    <tr key={pbi.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-caption font-semibold text-neutral-800">
                        {pbi.code}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-neutral-900 max-w-xs truncate">
                        {pbi.title}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            pbi.priority === 'urgent'
                              ? 'danger'
                              : pbi.priority === 'high'
                                ? 'warning'
                                : 'neutral'
                          }
                        >
                          {pbi.priority === 'urgent'
                            ? 'Khẩn cấp'
                            : pbi.priority === 'high'
                              ? 'Cao'
                              : pbi.priority === 'medium'
                                ? 'Trung bình'
                                : 'Thấp'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            pbi.status === 'done'
                              ? 'success'
                              : pbi.status === 'in_progress'
                                ? 'primary'
                                : pbi.status === 'review'
                                  ? 'warning'
                                  : 'neutral'
                          }
                        >
                          {pbi.status === 'done'
                            ? 'Hoàn thành'
                            : pbi.status === 'in_progress'
                              ? 'Đang làm'
                              : pbi.status === 'review'
                                ? 'Kiểm tra'
                                : 'Cần làm'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-neutral-800">
                        {pbi.storyPoints} SP
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600">
                        {pbi.sprintName || <span className="text-neutral-400 italic">Chưa gán</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {pbi.assigneeName ? (
                          <div className="flex items-center gap-1.5 text-caption text-neutral-700">
                            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-800 text-[10px] font-bold flex items-center justify-center">
                              {pbi.assigneeAvatar}
                            </span>
                            <span>{pbi.assigneeName}</span>
                          </div>
                        ) : (
                          <span className="text-caption text-neutral-400 italic">Chưa gán</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleUnlinkPbi(pbi.id, pbi.code)}
                          className="text-red-600 hover:text-red-800 font-medium text-caption px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="Gỡ khỏi Epic"
                        >
                          Gỡ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Technical Tasks */}
      {activeTab === 'tasks' && (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-body-sm font-semibold text-neutral-900">
              Nhiệm vụ kỹ thuật ({epic.tasks?.length || 0})
            </h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon name="plus" size={14} />}
              onClick={() => setIsLinkTaskOpen(true)}
            >
              Liên kết thêm Task
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-caption font-semibold text-neutral-600 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Mã Task</th>
                  <th className="px-5 py-3">Tiêu đề nhiệm vụ</th>
                  <th className="px-5 py-3">PBI trực thuộc</th>
                  <th className="px-5 py-3">Người phụ trách</th>
                  <th className="px-5 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {!epic.tasks || epic.tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500">
                      Chưa có nhiệm vụ kỹ thuật nào. Bấm &quot;Liên kết thêm Task&quot; để đưa vào.
                    </td>
                  </tr>
                ) : (
                  epic.tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-caption font-semibold text-neutral-800">
                        {task.code}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-neutral-900 max-w-sm truncate">
                        {task.title}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600">
                        {task.parentPbiCode ? (
                          <span className="text-[11px] px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded font-medium">
                            {task.parentPbiCode}
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic">Nhiệm vụ độc lập</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {task.assigneeName ? (
                          <div className="flex items-center gap-1.5 text-caption text-neutral-700">
                            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-800 text-[10px] font-bold flex items-center justify-center">
                              {task.assigneeAvatar}
                            </span>
                            <span>{task.assigneeName}</span>
                          </div>
                        ) : (
                          <span className="text-caption text-neutral-400 italic">Chưa gán</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Progress & Metrics (S6-04) */}
      {activeTab === 'progress' && <EpicProgressTab epic={epic} />}

      {/* Modals */}
      <EditEpicModal
        isOpen={isEditOpen}
        epic={epic}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEdit}
      />

      <DeleteEpicModal
        isOpen={isDeleteOpen}
        epic={epic}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <LinkTaskModal
        isOpen={isLinkTaskOpen}
        epic={epic}
        onClose={() => setIsLinkTaskOpen(false)}
        onConfirm={handleLinkTasks}
      />

      <LinkPbiModal
        isOpen={isLinkPbiOpen}
        epic={epic}
        onClose={() => setIsLinkPbiOpen(false)}
        onConfirm={handleLinkPbi}
      />
    </div>
  )
}
