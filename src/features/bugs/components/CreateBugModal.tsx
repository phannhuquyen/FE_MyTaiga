import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/services/api'
import { Modal, Icon } from '@/components/ui'
import type { BugSeverity, BugPriority, CreateBugPayload } from '../types'

interface CreateBugModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateBugPayload) => Promise<void>
}

export function CreateBugModal({ isOpen, onClose, onSubmit }: CreateBugModalProps) {
  const { projectId } = useParams()
  const [tasks, setTasks] = useState<{ taskId: number; title: string }[]>([])
  const [title, setTitle] = useState('')
  const [steps, setSteps] = useState('')
  const [environment, setEnvironment] = useState('')
  const [severity, setSeverity] = useState<BugSeverity>('blocker')
  const [priority, setPriority] = useState<BugPriority>('p1')
  const [relatedTaskId, setRelatedTaskId] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!isOpen || !projectId) return
    let cancelled = false
    api.tasks.list(Number(projectId), { page: 1, pageSize: 100 }).then(res => {
      if (!cancelled) setTasks(res.data.items)
    }).catch(() => { if (!cancelled) setError('Không thể tải Task của dự án.') })
    return () => { cancelled = true }
  }, [isOpen, projectId])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Tiêu đề bug là bắt buộc')
      return
    }
    if (!tasks.some(task => String(task.taskId) === relatedTaskId)) {
      setError('Vui lòng chọn Task thật trong dự án. Tạo Task ở Kanban nếu chưa có.'); return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await onSubmit({
        title: title.trim(),
        description: steps.trim() || title.trim(),
        stepsToReproduce: steps,
        environment,
        severity,
        priority,
        relatedTaskId: relatedTaskId || undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo bug')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveFile = (fileName: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.name !== fileName))
  }

  const handleSimulateAddFile = () => {
    setAttachedFiles((prev) => [
      ...prev,
      { name: `crash_dump_${Date.now().toString().slice(-4)}.log`, size: '1.2 MB' },
    ])
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <form onSubmit={handleSubmit} className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-50 dark:bg-danger-950 flex items-center justify-center text-danger-600">
              <Icon name="bug" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                Báo cáo lỗi mới (Bug)
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Ghi nhận lỗi phần mềm chi tiết để đội ngũ kỹ thuật thẩm tra và khắc phục
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 py-4">
          {/* Related task / PBI */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Task liên quan
              </label>
              <span className="text-xs text-neutral-400">Bắt buộc theo API</span>
            </div>
            <div className="relative">
              <select
                aria-label="Task liên quan"
                value={relatedTaskId}
                onChange={(e) => setRelatedTaskId(e.target.value)}
                className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Chọn Task của dự án --</option>
                {tasks.map(task => <option key={task.taskId} value={task.taskId}>TASK-{task.taskId}: {task.title}</option>)}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Tiêu đề bug <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Nút kéo thả thẻ Kanban bị giật lag khi cuộn nhanh"
              className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Description & Steps */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Mô tả & Các bước tái hiện
              </label>
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded px-1.5 py-0.5 text-xs text-neutral-600 dark:text-neutral-300">
                <span className="font-bold px-1 cursor-pointer">B</span>
                <span className="italic px-1 cursor-pointer">I</span>
                <span className="font-mono px-1 cursor-pointer">&lt;/&gt;</span>
                <span className="px-1 cursor-pointer">≡</span>
              </div>
            </div>
            <textarea
              rows={4}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="1. Mở trang...&#10;2. Thực hiện thao tác...&#10;3. Quan sát lỗi..."
              className="w-full font-mono text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
            />
          </div>

          {/* Environment */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Môi trường (Environment)
            </label>
            <input
              type="text"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              placeholder="VD: Production - Chrome 129 / macOS Sonoma 14.5"
              className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Severity & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Mức độ (Severity)
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as BugSeverity)}
                className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="blocker">🔴 Chặn (Blocker)</option>
                <option value="major">🟠 Nặng (Major)</option>
                <option value="minor">🟢 Vừa (Minor)</option>
                <option value="trivial">⚪ Nhẹ (Trivial)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Mức độ ưu tiên (Priority)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as BugPriority)}
                className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="p1">🚩 Khẩn cấp (P1)</option>
                <option value="p2">🚩 Cao (P2)</option>
                <option value="p3">🏳️ Trung bình (P3)</option>
                <option value="p4">🏳️ Thấp (P4)</option>
              </select>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Tệp đính kèm & Bản ghi log (demo, chưa tải lên máy chủ)
            </label>
            <div
              onClick={handleSimulateAddFile}
              className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-800/40"
            >
              <div className="w-9 h-9 rounded-full bg-white dark:bg-neutral-700 shadow-xs flex items-center justify-center mx-auto mb-2 text-primary-600">
                <Icon name="upload" size={18} />
              </div>
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <span className="text-primary-600 hover:underline">Nhấn để chọn tệp</span> hoặc kéo
                thả vào đây
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                PNG, JPG, MP4 hoặc LOG (Tối đa 15MB mỗi tệp)
              </p>
            </div>

            {attachedFiles.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.name}
                    className="inline-flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-300"
                  >
                    <Icon name="paperclip" size={13} className="text-neutral-400" />
                    <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                    <span className="text-neutral-400 text-[11px]">({file.size})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.name)}
                      className="text-neutral-400 hover:text-danger-500 ml-1 p-0.5"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Icon name="plus" size={16} />
            {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo Bug'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
