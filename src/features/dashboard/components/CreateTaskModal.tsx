import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { TaskItem, TaskPriority, TaskType } from '../types'

export interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask: (task: Omit<TaskItem, 'id' | 'dod' | 'comments'>) => void
  currentTaskCount: number
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onCreateTask,
  currentTaskCount,
}: CreateTaskModalProps) {
  const nextCodeNumber = 120 + currentTaskCount
  const [code, setCode] = useState(`SB-${nextCodeNumber}`)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<TaskType>('Task')
  const [priority, setPriority] = useState<TaskPriority>('Cao')
  const [storyPoints, setStoryPoints] = useState(3)
  const [dueDate, setDueDate] = useState('Hôm nay')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Vui lòng nhập tên công việc.')
      return
    }

    onCreateTask({
      code: code.trim() || `SB-${nextCodeNumber}`,
      title: title.trim(),
      type,
      status: 'Cần làm',
      dueDate: dueDate.trim() || 'Hôm nay',
      storyPoints,
      estimatedHours: storyPoints * 2,
      assignee: {
        name: 'Bạn (Admin)',
        avatarCode: 'AD',
        role: 'Admin',
      },
      sprint: 'Sprint 14',
      priority,
    })

    // Reset form
    setTitle('')
    setError('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm công việc mới vào Sprint 14"
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            type="button"
          >
            Tạo công việc
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded bg-error-50 border border-error-200 text-error-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Mã công việc
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-1.5 text-body-sm bg-paper-50 border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-whiteboard"
            placeholder="SB-120"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Tiêu đề công việc <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (error) setError('')
            }}
            placeholder="Ví dụ: Thiết kế giao diện chi tiết công việc..."
            className="w-full px-3 py-1.5 text-body-sm bg-paper-50 border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-whiteboard"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Phân loại
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
              className="w-full px-3 py-1.5 text-body-sm bg-paper-50 border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="Task">Task (Tác vụ)</option>
              <option value="Story">Story (Câu chuyện)</option>
              <option value="Bug">Bug (Lỗi)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Độ ưu tiên
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-1.5 text-body-sm bg-paper-50 border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="Thấp">Thấp</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Cao">Cao</option>
              <option value="Khẩn cấp">Khẩn cấp</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Điểm Story Points (SP)
            </label>
            <input
              type="number"
              min={1}
              max={21}
              value={storyPoints}
              onChange={(e) => setStoryPoints(Number(e.target.value) || 1)}
              className="w-full px-3 py-1.5 text-body-sm bg-paper-50 border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Hạn hoàn thành
            </label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Hôm nay hoặc ngày kết thúc"
              className="w-full px-3 py-1.5 text-body-sm bg-paper-50 border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}
