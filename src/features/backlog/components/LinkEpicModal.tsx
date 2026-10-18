import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { PBI, EpicSummary } from '../types'

interface LinkEpicModalProps {
  isOpen: boolean
  onClose: () => void
  epics: EpicSummary[]
  allPBIs: PBI[]
  onLinkBatch: (pbiIds: string[], epicId: string) => Promise<void>
}

export function LinkEpicModal({
  isOpen,
  onClose,
  epics,
  allPBIs,
  onLinkBatch,
}: LinkEpicModalProps) {
  const [selectedEpicId, setSelectedEpicId] = useState<string>(epics[0]?.id || '')
  const [search, setSearch] = useState('')
  const [selectedPbiIds, setSelectedPbiIds] = useState<string[]>([
    'pbi-153',
    'pbi-156',
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const selectedEpic = epics.find((e) => e.id === selectedEpicId) || epics[0]

  const filteredPBIs = allPBIs.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
  })

  const toggleSelect = (id: string) => {
    setSelectedPbiIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleSubmit = async () => {
    if (!selectedEpicId || selectedPbiIds.length === 0) return
    setIsSubmitting(true)
    try {
      await onLinkBatch(selectedPbiIds, selectedEpicId)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-whiteboard rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-epic-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="text-primary-600">
              <Icon name="tag" size={18} />
            </span>
            <h2 id="link-epic-title" className="text-body-lg font-bold text-neutral-900">
              Liên kết PBI vào Epic:{' '}
              <span className="text-primary-700">{selectedEpic?.name}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors cursor-pointer"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Epic selector */}
          <div>
            <label className="text-xs font-semibold text-neutral-600 block mb-1">
              Chọn Epic mục tiêu
            </label>
            <select
              value={selectedEpicId}
              onChange={(e) => setSelectedEpicId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-neutral-300 text-sm font-semibold bg-paper-50 cursor-pointer"
            >
              {epics.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  {ep.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm PBI theo tên hoặc mã #SB-..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-neutral-300 text-xs bg-paper-50 focus:bg-whiteboard focus:border-primary-500"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <Icon name="search" size={14} />
            </div>
          </div>

          {/* Info Notice */}
          <div className="p-3 bg-paper-100 rounded-lg text-[12px] text-neutral-600 flex items-start gap-2">
            <span className="text-primary-600 mt-0.5">
              <Icon name="info" size={14} />
            </span>
            <span>
              Chọn các thẻ Product Backlog Items cần gán vào Epic này. Các PBI đang thuộc Epic khác
              sẽ được chuyển sang Epic này.
            </span>
          </div>

          {/* List header */}
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-1">
            <span>Danh sách mục tồn đọng</span>
            <span>Ước lượng & Trạng thái</span>
          </div>

          {/* Items checklist */}
          <div className="space-y-1.5 border border-neutral-200 rounded-lg p-2 max-h-60 overflow-y-auto divide-y divide-neutral-100">
            {filteredPBIs.map((pbi) => {
              const isChecked = selectedPbiIds.includes(pbi.id)
              return (
                <label
                  key={pbi.id}
                  className={`flex items-center justify-between p-2 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer text-xs ${
                    isChecked ? 'bg-primary-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(pbi.id)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                    <span className="font-bold text-primary-700 shrink-0">#{pbi.code}</span>
                    <span className="text-neutral-800 truncate">{pbi.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-neutral-100 font-semibold text-neutral-700 text-[11px]">
                      {pbi.storyPoints} SP
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {pbi.sprintName || 'Backlog'}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-paper-50 border-t border-neutral-200">
          <span className="text-xs font-semibold text-primary-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-600" />
            <span>Đã chọn {selectedPbiIds.length} PBI</span>
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs rounded-lg font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedPbiIds.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-whiteboard text-xs rounded-lg font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Icon name="check" size={14} />
              <span>{isSubmitting ? 'Đang liên kết...' : '+ Liên kết vào Epic'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
