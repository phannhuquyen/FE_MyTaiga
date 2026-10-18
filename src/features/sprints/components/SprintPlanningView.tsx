import { useState, useEffect } from 'react'
import type { Sprint, SprintWorkItem } from '../types'
import { sprintService } from '../services/sprintService'
import { backlogService } from '@/features/backlog/services/backlogService'
import type { PBI } from '@/features/backlog/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Icon } from '@/components/ui/Icon'

interface SprintPlanningViewProps {
  sprint: Sprint
  onBack: () => void
  onSprintUpdated: (updated: Sprint) => void
  onStartSprint: (sprint: Sprint) => void
  onEditSprint: (sprint: Sprint) => void
}

export function SprintPlanningView({
  sprint,
  onBack,
  onSprintUpdated,
  onStartSprint,
  onEditSprint,
}: SprintPlanningViewProps) {
  const [backlogItems, setBacklogItems] = useState<PBI[]>([])
  const [searchBacklog, setSearchBacklog] = useState('')
  const [selectedBacklogIds, setSelectedBacklogIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load backlog PBIs that are unassigned to any active/planned sprint
  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      try {
        const allPBIs = await backlogService.getPBIs()
        if (mounted) {
          // Filter PBIs that are not already in this sprint
          const sprintItemIds = new Set(sprint.items.map((i) => i.id))
          const available = allPBIs.filter((p) => !sprintItemIds.has(p.id) && p.sprintId !== sprint.id)
          setBacklogItems(available)
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadData()
    return () => {
      mounted = false
    }
  }, [sprint.id, sprint.items])

  const capacitySP = sprint.capacitySP || 25
  const currentSP = sprint.totalSP
  const capacityPercent = Math.min(Math.round((currentSP / capacitySP) * 100), 100)
  const remainingCapacity = Math.max(0, capacitySP - currentSP)
  const isOverCapacity = currentSP > capacitySP

  // Filtered backlog
  const filteredBacklog = backlogItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchBacklog.toLowerCase()) ||
      item.code.toLowerCase().includes(searchBacklog.toLowerCase()) ||
      (item.epicName && item.epicName.toLowerCase().includes(searchBacklog.toLowerCase())),
  )

  const toggleSelectBacklog = (id: string) => {
    setSelectedBacklogIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleSelectAllBacklog = () => {
    if (selectedBacklogIds.length === filteredBacklog.length) {
      setSelectedBacklogIds([])
    } else {
      setSelectedBacklogIds(filteredBacklog.map((item) => item.id))
    }
  }

  // Add a single item to sprint
  const handleAddItemToSprint = async (item: PBI) => {
    setIsProcessing(true)
    try {
      await sprintService.assignBacklogItemsToSprint(sprint.id, [item.id])
      const updatedSprint = await sprintService.getSprintById(sprint.id)
      if (updatedSprint) onSprintUpdated(updatedSprint)
      setBacklogItems((prev) => prev.filter((b) => b.id !== item.id))
      setSelectedBacklogIds((prev) => prev.filter((id) => id !== item.id))
    } finally {
      setIsProcessing(false)
    }
  }

  // Bulk add selected items
  const handleBulkAddToSprint = async () => {
    if (selectedBacklogIds.length === 0) return
    setIsProcessing(true)
    try {
      await sprintService.assignBacklogItemsToSprint(sprint.id, selectedBacklogIds)
      const updatedSprint = await sprintService.getSprintById(sprint.id)
      if (updatedSprint) onSprintUpdated(updatedSprint)
      const addedSet = new Set(selectedBacklogIds)
      setBacklogItems((prev) => prev.filter((b) => !addedSet.has(b.id)))
      setSelectedBacklogIds([])
    } finally {
      setIsProcessing(false)
    }
  }

  // Remove item from sprint
  const handleRemoveItem = async (itemId: string) => {
    setIsProcessing(true)
    try {
      await sprintService.removeItemFromSprint(sprint.id, itemId)
      const updatedSprint = await sprintService.getSprintById(sprint.id)
      if (updatedSprint) onSprintUpdated(updatedSprint)

      // Reload available backlog items
      const allPBIs = await backlogService.getPBIs()
      const sprintItemIds = new Set((updatedSprint?.items || []).map((i) => i.id))
      setBacklogItems(allPBIs.filter((p) => !sprintItemIds.has(p.id)))
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedSP = backlogItems
    .filter((b) => selectedBacklogIds.includes(b.id))
    .reduce((acc, curr) => acc + curr.storyPoints, 0)

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-text-secondary-light hover:text-primary-600 transition-colors dark:text-text-secondary-dark dark:hover:text-primary-400"
          >
            <Icon name="arrow-left" size={16} />
            Quay lại danh sách Sprint
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onEditSprint(sprint)}
              leftIcon={<Icon name="edit" size={14} />}
            >
              Chỉnh sửa Sprint
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => onStartSprint(sprint)}
              disabled={sprint.items.length === 0 || sprint.status === 'active'}
              leftIcon={<Icon name="sprint" size={14} />}
            >
              Bắt đầu Sprint
            </Button>
          </div>
        </div>

        {/* Sprint Planning Banner */}
        <div className="rounded-xl border border-border-light bg-white p-5 shadow-xs dark:border-border-dark dark:bg-neutral-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  Lập kế hoạch: {sprint.name}
                </h1>
                <Badge variant={sprint.status === 'active' ? 'primary' : 'neutral'}>
                  {sprint.status === 'active' ? 'Đang chạy' : 'Đã lên kế hoạch'}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Icon name="calendar" size={14} />
                  {sprint.startDate} — {sprint.endDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="users" size={14} />
                  {sprint.membersCount} thành viên
                </span>
              </p>
            </div>

            {/* Capacity Meter */}
            <div className="w-full md:w-72 rounded-lg bg-neutral-50 p-3 border border-border-light dark:bg-neutral-900/60 dark:border-border-dark">
              <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                <span className="text-text-secondary-light dark:text-text-secondary-dark">Năng lực Sprint (Capacity)</span>
                <span className={`font-bold ${isOverCapacity ? 'text-red-600' : 'text-primary-600'}`}>
                  {currentSP} / {capacitySP} SP ({capacityPercent}%)
                </span>
              </div>
              <ProgressBar
                value={capacityPercent}
                variant={isOverCapacity ? 'danger' : 'primary'}
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                <span>{isOverCapacity ? 'Vượt quá năng lực!' : `Còn ${remainingCapacity} SP khả dụng`}</span>
                <span>{sprint.items.length} thẻ đã gán</span>
              </div>
            </div>
          </div>

          {/* Sprint Goal Callout */}
          <div className="rounded-lg bg-primary-50/50 border border-primary-200/60 p-3 text-xs text-primary-900 dark:bg-primary-950/20 dark:border-primary-900/40 dark:text-primary-200 flex items-start gap-2.5">
            <Icon name="flag" size={16} className="text-primary-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Mục tiêu Sprint:</span> {sprint.goal}
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Product Backlog Pool */}
        <div className="rounded-xl border border-border-light bg-white p-4 shadow-xs dark:border-border-dark dark:bg-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                Product Backlog
              </h3>
              <Badge variant="neutral">{filteredBacklog.length} PBIs</Badge>
            </div>

            {selectedBacklogIds.length > 0 && (
              <Button
                type="button"
                variant="primary"
                onClick={handleBulkAddToSprint}
                disabled={isProcessing}
                leftIcon={<Icon name="plus" size={14} />}
              >
                Gán vào Sprint (+{selectedSP} SP)
              </Button>
            )}
          </div>

          {/* Search bar & Select All */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Icon
                name="search"
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark"
              />
              <input
                type="text"
                value={searchBacklog}
                onChange={(e) => setSearchBacklog(e.target.value)}
                placeholder="Tìm kiếm Backlog theo tên, mã thẻ, Epic..."
                className="w-full text-xs rounded-lg border border-border-light bg-neutral-50/50 pl-8 pr-3 py-2 text-text-primary-light focus:outline-hidden focus:ring-2 focus:ring-primary-500 dark:border-border-dark dark:bg-neutral-900 dark:text-text-primary-dark"
              />
            </div>

            <label className="flex items-center gap-1.5 text-xs text-text-secondary-light cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={selectedBacklogIds.length > 0 && selectedBacklogIds.length === filteredBacklog.length}
                onChange={handleSelectAllBacklog}
                className="rounded border-border-light text-primary-600 focus:ring-primary-500"
              />
              <span>Tất cả</span>
            </label>
          </div>

          {/* Backlog Item List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-text-secondary-light">Đang tải Product Backlog...</div>
            ) : filteredBacklog.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-secondary-light border-2 border-dashed border-border-light rounded-xl dark:border-border-dark">
                Không tìm thấy User Story nào phù hợp trong Backlog.
              </div>
            ) : (
              filteredBacklog.map((item) => {
                const isSelected = selectedBacklogIds.includes(item.id)
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all text-xs ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50/30 dark:border-primary-400 dark:bg-primary-950/20'
                        : 'border-border-light bg-neutral-50/40 hover:bg-white hover:border-neutral-300 dark:border-border-dark dark:bg-neutral-900/40 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 truncate pr-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectBacklog(item.id)}
                        className="mt-1 rounded border-border-light text-primary-600 focus:ring-primary-500"
                      />
                      <div className="truncate space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                            {item.code}
                          </span>
                          <span className="truncate font-medium text-text-primary-light dark:text-text-primary-dark">
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                          {item.epicName && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-neutral-200/70 text-text-primary-light font-medium dark:bg-neutral-700">
                              {item.epicName}
                            </span>
                          )}
                          <span>Ưu tiên: {item.priority === 'urgent' ? 'Khẩn cấp' : item.priority === 'high' ? 'Cao' : 'Vừa'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="neutral">{item.storyPoints} SP</Badge>
                      <button
                        type="button"
                        onClick={() => handleAddItemToSprint(item)}
                        disabled={isProcessing}
                        className="p-1.5 rounded-md text-primary-600 hover:bg-primary-50 transition-colors dark:text-primary-400 dark:hover:bg-neutral-700"
                        title="Đưa vào Sprint"
                      >
                        <Icon name="plus" size={16} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Sprint Backlog (Committed Items) */}
        <div className="rounded-xl border border-border-light bg-white p-4 shadow-xs dark:border-border-dark dark:bg-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                Sprint Backlog
              </h3>
              <Badge variant="primary">{sprint.items.length} thẻ cam kết</Badge>
            </div>
            <span className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark">
              Tổng điểm: {currentSP} SP
            </span>
          </div>

          {/* Committed Items List */}
          <div className="space-y-2.5 min-h-[300px]">
            {sprint.items.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary-light border-2 border-dashed border-border-light rounded-xl dark:border-border-dark p-6 space-y-2">
                <Icon name="folder" size={32} className="mx-auto text-neutral-300" />
                <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                  Chưa có thẻ công việc nào trong Sprint
                </p>
                <p className="text-[11px] text-text-secondary-light">
                  Chọn các PBI từ cột Backlog bên trái và nhấn &quot;Gán vào Sprint&quot; hoặc nhấn nút &quot;+&quot; để bổ sung.
                </p>
              </div>
            ) : (
              sprint.items.map((item: SprintWorkItem, idx: number) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border-light bg-white shadow-2xs dark:border-border-dark dark:bg-neutral-900/60 text-xs hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate pr-3">
                    <span className="text-neutral-400 font-mono text-[11px]">#{idx + 1}</span>
                    <div className="truncate space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                          {item.code}
                        </span>
                        <span className="truncate font-medium text-text-primary-light dark:text-text-primary-dark">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                        <span>Gán: {item.assigneeName || 'Chưa gán'}</span>
                        {item.epicName && <span>• {item.epicName}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <Badge variant="primary">{item.storyPoints} SP</Badge>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isProcessing}
                      className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      Gỡ
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Dropzone Hint */}
            <div className="rounded-xl border-2 border-dashed border-border-light p-4 text-center text-xs text-text-secondary-light dark:border-border-dark bg-neutral-50/50 dark:bg-neutral-900/20">
              <div className="flex items-center justify-center gap-2">
                <Icon name="plus" size={16} className="text-primary-500" />
                <span>Kéo thả PBI hoặc chọn từ danh sách bên trái để đưa vào Sprint</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
