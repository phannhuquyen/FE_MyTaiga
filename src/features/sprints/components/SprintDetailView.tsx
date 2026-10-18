import { useState } from 'react'
import type { Sprint, SprintWorkItem } from '../types'
import { sprintService } from '../services/sprintService'
import { SprintBurndownTab } from './SprintBurndownTab'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Icon } from '@/components/ui/Icon'

interface SprintDetailViewProps {
  sprint: Sprint
  onBack: () => void
  onEditSprint: (sprint: Sprint) => void
  onCloseSprint: (sprint: Sprint) => void
  onPlanning: (sprint: Sprint) => void
  onSprintUpdated: (updated: Sprint) => void
}

export function SprintDetailView({
  sprint,
  onBack,
  onEditSprint,
  onCloseSprint,
  onPlanning,
  onSprintUpdated,
}: SprintDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'burndown'>('items')
  const [quickTitle, setQuickTitle] = useState('')
  const [quickSP, setQuickSP] = useState(3)
  const [isAdding, setIsAdding] = useState(false)
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null)

  const isClosed = sprint.status === 'closed'
  const isActive = sprint.status === 'active'

  // Quick add item to sprint
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTitle.trim() || isClosed) return
    setIsAdding(true)
    try {
      await sprintService.addWorkItemToSprint(sprint.id, {
        title: quickTitle.trim(),
        storyPoints: Number(quickSP) || 1,
        priority: 'medium',
      })
      const updated = await sprintService.getSprintById(sprint.id)
      if (updated) onSprintUpdated(updated)
      setQuickTitle('')
    } finally {
      setIsAdding(false)
    }
  }

  // Toggle item done status
  const handleToggleStatus = async (item: SprintWorkItem) => {
    if (isClosed) return
    setIsTogglingId(item.id)
    try {
      await sprintService.toggleWorkItemStatus(sprint.id, item.id)
      const updated = await sprintService.getSprintById(sprint.id)
      if (updated) onSprintUpdated(updated)
    } finally {
      setIsTogglingId(null)
    }
  }

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="danger">Khẩn cấp</Badge>
      case 'high':
        return <Badge variant="warning">Cao</Badge>
      case 'medium':
        return <Badge variant="neutral">Vừa</Badge>
      default:
        return <Badge variant="neutral">Thấp</Badge>
    }
  }

  const getStatusBadge = (status: SprintWorkItem['status']) => {
    switch (status) {
      case 'done':
        return <Badge variant="success">Hoàn thành</Badge>
      case 'in_progress':
        return <Badge variant="warning">Đang làm</Badge>
      case 'review':
        return <Badge variant="primary">Đang review</Badge>
      default:
        return <Badge variant="neutral">Sẵn sàng</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-text-secondary-light hover:text-primary-600 transition-colors dark:text-text-secondary-dark dark:hover:text-primary-400"
        >
          <Icon name="arrow-left" size={16} />
          Quay lại danh sách Sprint
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {!isClosed && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onPlanning(sprint)}
                leftIcon={<Icon name="kanban" size={14} />}
              >
                Lập kế hoạch
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onEditSprint(sprint)}
                leftIcon={<Icon name="edit" size={14} />}
              >
                Chỉnh sửa
              </Button>
              {isActive && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => onCloseSprint(sprint)}
                  leftIcon={<Icon name="check-circle" size={14} />}
                >
                  Đóng Sprint
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Closed Sprint Read-Only Alert Banner (S7-08) */}
      {isClosed && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200 shadow-2xs">
          <Icon name="info" size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm">Sprint này đã đóng (Chế độ Chỉ đọc)</span>
            <p className="text-blue-800 dark:text-blue-300">
              Sprint đã kết thúc và được lưu trữ vào ngày {sprint.endDate}. Chế độ chỉ đọc được kích hoạt, các thẻ công việc không thể sửa đổi hoặc di chuyển.
            </p>
          </div>
        </div>
      )}

      {/* Sprint Header & Summary Card (S7-02) */}
      <div className="rounded-xl border border-border-light bg-white p-5 shadow-xs dark:border-border-dark dark:bg-neutral-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                {sprint.name}
              </h1>
              <Badge variant={isActive ? 'success' : isClosed ? 'neutral' : 'primary'}>
                {isActive ? 'Đang chạy' : isClosed ? 'Đã đóng' : 'Đã lên kế hoạch'}
              </Badge>
              {sprint.releaseVersion && (
                <Badge variant="neutral">{sprint.releaseVersion}</Badge>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-text-secondary-light dark:text-text-secondary-dark">
              <span className="flex items-center gap-1.5 font-medium">
                <Icon name="calendar" size={14} />
                {sprint.startDate} — {sprint.endDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="users" size={14} />
                {sprint.membersCount} thành viên tham gia
              </span>
              {sprint.daysLeft && !isClosed && (
                <span className="flex items-center gap-1.5 font-semibold text-primary-600 dark:text-primary-400">
                  <Icon name="clock" size={14} />
                  {sprint.daysLeft}
                </span>
              )}
            </div>
          </div>

          {/* Progress Overview Card */}
          <div className="w-full lg:w-80 rounded-xl bg-neutral-50 p-3.5 border border-border-light dark:bg-neutral-900/60 dark:border-border-dark">
            <div className="flex justify-between items-center text-xs font-medium mb-1.5">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">Tiến độ Sprint</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {sprint.progressPercent}% ({sprint.completedSP}/{sprint.totalSP} SP)
              </span>
            </div>
            <ProgressBar value={sprint.progressPercent} variant="primary" />
            <div className="mt-2 flex justify-between text-[11px] text-text-secondary-light dark:text-text-secondary-dark font-medium">
              <span>{sprint.completedItemsCount}/{sprint.totalItemsCount} thẻ đã xong</span>
              <span>Còn lại: {sprint.remainingItemsCount} thẻ</span>
            </div>
          </div>
        </div>

        {/* Sprint Goal Callout */}
        <div className="rounded-lg bg-teal-50/60 border border-teal-200/80 p-3.5 text-xs text-teal-950 dark:bg-teal-950/20 dark:border-teal-900/40 dark:text-teal-200 flex items-start gap-2.5">
          <Icon name="flag" size={16} className="text-teal-600 shrink-0 mt-0.5 dark:text-teal-400" />
          <div>
            <span className="font-bold">Mục tiêu Sprint:</span> {sprint.goal}
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Items vs Burndown */}
      <div className="flex items-center gap-2 border-b border-border-light dark:border-border-dark">
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'items'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark'
          }`}
        >
          <Icon name="check" size={15} />
          Danh sách hạng mục công việc ({sprint.items.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('burndown')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'burndown'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark'
          }`}
        >
          <Icon name="metrics" size={15} />
          Biểu đồ Burndown & Năng lực
        </button>
      </div>

      {/* Tab 1: Work Items Checklist Table */}
      {activeTab === 'items' ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-border-light bg-white shadow-xs overflow-hidden dark:border-border-dark dark:bg-neutral-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-light bg-neutral-50/70 text-text-secondary-light dark:border-border-dark dark:bg-neutral-900/50 dark:text-text-secondary-dark font-medium">
                    <th className="py-3 px-4 w-10 text-center">#</th>
                    <th className="py-3 px-4 w-28 font-semibold">Mã PBI</th>
                    <th className="py-3 px-4 font-semibold">Tiêu đề User Story / Nhiệm vụ</th>
                    <th className="py-3 px-4 w-40 font-semibold">Phụ trách</th>
                    <th className="py-3 px-4 w-36 font-semibold">Epic</th>
                    <th className="py-3 px-4 w-28 font-semibold">Ưu tiên</th>
                    <th className="py-3 px-4 w-20 text-center font-semibold">Điểm SP</th>
                    <th className="py-3 px-4 w-28 text-center font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/60 dark:divide-border-dark/60">
                  {sprint.items.map((item) => {
                    const isDone = item.status === 'done'
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors ${
                          isDone ? 'bg-neutral-50/30 dark:bg-neutral-900/20 opacity-80' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isDone}
                            disabled={isClosed || isTogglingId === item.id}
                            onChange={() => handleToggleStatus(item)}
                            className="rounded border-border-light text-primary-600 focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                          {item.code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className={`font-medium ${isDone ? 'line-through text-text-secondary-light' : 'text-text-primary-light dark:text-text-primary-dark'}`}>
                              {item.title}
                            </span>
                            {item.criteriaCount && (
                              <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1">
                                <Icon name="check" size={12} className="text-emerald-500" />
                                {item.criteriaCount}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {item.assigneeName ? (
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 font-bold flex items-center justify-center text-[10px]">
                                {item.assigneeAvatar || item.assigneeName.slice(0, 2).toUpperCase()}
                              </span>
                              <div className="truncate">
                                <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                                  {item.assigneeName}
                                </span>
                                {item.assigneeRole && (
                                  <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                                    {item.assigneeRole}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-text-secondary-light dark:text-text-secondary-dark italic text-[11px]">
                              Chưa gán
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {item.epicName ? (
                            <Badge variant="neutral">{item.epicName}</Badge>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getPriorityBadge(item.priority)}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-text-primary-light dark:text-text-primary-dark">
                          {item.storyPoints} SP
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(item.status)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Add Row at bottom of table (S7-02) */}
            {!isClosed && (
              <form
                onSubmit={handleQuickAdd}
                className="flex items-center gap-3 p-3 bg-neutral-50/60 border-t border-border-light dark:bg-neutral-900/60 dark:border-border-dark"
              >
                <div className="w-8 flex items-center justify-center text-neutral-400">
                  <Icon name="plus" size={16} />
                </div>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="+ Thêm nhanh User Story hoặc Nhiệm vụ mới vào Sprint này..."
                  className="flex-1 text-xs rounded-lg border border-border-light bg-white px-3 py-1.5 text-text-primary-light placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500 dark:border-border-dark dark:bg-neutral-900 dark:text-text-primary-dark"
                />
                <select
                  value={quickSP}
                  onChange={(e) => setQuickSP(Number(e.target.value))}
                  className="w-20 text-xs rounded-lg border border-border-light bg-white px-2 py-1.5 text-text-primary-light dark:border-border-dark dark:bg-neutral-900 dark:text-text-primary-dark"
                >
                  <option value={1}>1 SP</option>
                  <option value={2}>2 SP</option>
                  <option value={3}>3 SP</option>
                  <option value={5}>5 SP</option>
                  <option value={8}>8 SP</option>
                </select>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!quickTitle.trim() || isAdding}
                >
                  {isAdding ? 'Đang thêm...' : 'Thêm thẻ'}
                </Button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: Burndown and Throughput */
        <SprintBurndownTab sprint={sprint} />
      )}
    </div>
  )
}
