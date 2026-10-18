import { useState, useEffect, useMemo } from 'react'
import { Modal, Button, Icon, Badge } from '@/components/ui'
import { backlogService } from '@/features/backlog/services/backlogService'
import type { PBI } from '@/features/backlog/types'
import type { Epic } from '../types'

export interface LinkPbiModalProps {
  isOpen: boolean
  epic: Epic | null
  onClose: () => void
  onConfirm: (pbiId: string) => Promise<void>
}

export function LinkPbiModal({
  isOpen,
  epic,
  onClose,
  onConfirm,
}: LinkPbiModalProps) {
  const [pbis, setPbis] = useState<PBI[]>([])
  const [search, setSearch] = useState('')
  const [selectedPbiId, setSelectedPbiId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (isOpen && epic) {
      backlogService
        .getPBIs()
        .then((items) => {
          if (active) {
            setPbis(items.filter((p) => p.epicId !== epic.id))
            setIsLoading(false)
          }
        })
        .catch(() => {
          if (active) {
            setIsLoading(false)
          }
        })
    }
    return () => {
      active = false
    }
  }, [isOpen, epic])

  const handleClose = () => {
    setSearch('')
    setSelectedPbiId(null)
    setError(null)
    onClose()
  }

  const filteredPbis = useMemo(() => {
    if (!search) return pbis
    const q = search.toLowerCase().trim()
    return pbis.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.epicName && p.epicName.toLowerCase().includes(q)),
    )
  }, [pbis, search])

  const handleConfirm = async () => {
    if (!selectedPbiId) {
      setError('Vui lòng chọn một PBI để liên kết.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await onConfirm(selectedPbiId)
      handleClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi liên kết PBI.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!epic) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Liên kết Backlog Item (PBI) vào Epic"
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
            disabled={!selectedPbiId || isSubmitting}
            leftIcon={<Icon name="check" size={16} />}
          >
            {isSubmitting ? 'Đang liên kết...' : 'Liên kết PBI'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-body-sm text-neutral-600">
          Chọn Backlog Item từ danh sách Backlog để đưa vào phạm vi Epic{' '}
          <strong className="text-neutral-900">[{epic.code}] {epic.name}</strong>.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-body-sm rounded-md">
            <Icon name="alert-circle" size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="relative">
          <Icon
            name="search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tiêu đề PBI..."
            className="w-full pl-9 pr-3 py-2 text-body-sm bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="border border-neutral-200 rounded-lg overflow-hidden max-h-72 overflow-y-auto divide-y divide-neutral-100">
          {isLoading ? (
            <div className="p-8 text-center text-body-sm text-neutral-500">
              Đang tải danh sách PBI...
            </div>
          ) : filteredPbis.length === 0 ? (
            <div className="p-8 text-center text-body-sm text-neutral-500">
              Không có PBI nào khả dụng để liên kết.
            </div>
          ) : (
            filteredPbis.map((pbi) => {
              const isSelected = selectedPbiId === pbi.id
              return (
                <div
                  key={pbi.id}
                  onClick={() => setSelectedPbiId(pbi.id)}
                  className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary-50/50' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="radio"
                      name="selectedPbi"
                      className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500 cursor-pointer"
                      checked={isSelected}
                      onChange={() => setSelectedPbiId(pbi.id)}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-caption font-semibold text-neutral-800">
                          {pbi.code}
                        </span>
                        {pbi.epicName && (
                          <span className="text-[11px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">
                            Thuộc: {pbi.epicName}
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm text-neutral-900 truncate">
                        {pbi.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-caption font-medium rounded">
                      {pbi.storyPoints} SP
                    </span>
                    <Badge
                      variant={
                        pbi.status === 'done'
                          ? 'success'
                          : pbi.status === 'in_progress'
                            ? 'primary'
                            : 'neutral'
                      }
                    >
                      {pbi.status === 'done'
                        ? 'Hoàn thành'
                        : pbi.status === 'in_progress'
                          ? 'Đang làm'
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
