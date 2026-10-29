import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { CreateDashboardWork, DashboardOptions, TaskPriority, TaskType } from '../types'

export interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask: (task: CreateDashboardWork) => Promise<void>
  currentTaskCount: number
  options: DashboardOptions
}
export function CreateTaskModal({ isOpen, onClose, onCreateTask, options }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<TaskType>('Task')
  const [priority, setPriority] = useState<TaskPriority>('Cao')
  const [storyPoints, setStoryPoints] = useState(3)
  const [deadline, setDeadline] = useState('')
  const [epicId, setEpicId] = useState('')
  const [taskId, setTaskId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Vui lòng nhập tên công việc.'); return }
    if (type === 'Story' && !epicId) { setError('Vui lòng chọn Epic cho Story.'); return }
    if (type === 'Bug' && !taskId) { setError('Vui lòng chọn Task liên quan cho Bug.'); return }
    setPending(true); setError('')
    try {
      await onCreateTask({ title: title.trim(), type, priority, storyPoints, deadline, epicId: Number(epicId) || undefined, taskId: Number(taskId) || undefined, assigneeId: Number(assigneeId) || undefined })
      setTitle('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể lưu công việc. Vui lòng thử lại.') }
    finally { setPending(false) }
  }
  const inputClass = 'w-full px-3 py-2 text-body-sm bg-paper-50 border border-neutral-200 rounded'
  return <Modal isOpen={isOpen} onClose={onClose} title="Thêm công việc vào dự án" maxWidth="md" footer={<><Button variant="ghost" onClick={onClose} disabled={pending}>Hủy</Button><Button onClick={handleSubmit} disabled={pending}>{pending ? 'Đang lưu...' : 'Tạo công việc'}</Button></>}>
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p role="alert" className="text-error-700">{error}</p>}
      <p className="text-xs text-neutral-500">Task hiển thị ở Kanban; Story ở Backlog; Bug ở Bugs. Tất cả có trong Tổng quan. Mã do máy chủ cấp.</p>
      <label className="block text-xs">Tiêu đề công việc<input aria-label="Tiêu đề công việc" className={inputClass} value={title} onChange={e => setTitle(e.target.value)} /></label>
      <label className="block text-xs">Phân loại<select aria-label="Phân loại" className={inputClass} value={type} onChange={e => setType(e.target.value as TaskType)}><option value="Task">Task (Tác vụ)</option><option value="Story">Story (Backlog)</option><option value="Bug">Bug (Lỗi)</option></select></label>
      <label className="block text-xs">Độ ưu tiên<select aria-label="Độ ưu tiên" className={inputClass} value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}>{['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'].map(value => <option key={value}>{value}</option>)}</select></label>
      {type === 'Story' && <label className="block text-xs">Epic liên quan<select aria-label="Epic liên quan" className={inputClass} value={epicId} onChange={e => setEpicId(e.target.value)}><option value="">Chọn Epic (bắt buộc)</option>{options.epics.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select><span>Tạo Epic ở tab Epics nếu danh sách trống.</span></label>}
      {type === 'Bug' && <label className="block text-xs">Task liên quan<select aria-label="Task liên quan" className={inputClass} value={taskId} onChange={e => setTaskId(e.target.value)}><option value="">Chọn Task (bắt buộc)</option>{options.tasks.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select><span>Chọn độ nghiêm trọng tại form Bugs; tạo nhanh dùng mức Minor.</span></label>}
      {type !== 'Bug' && <label className="block text-xs">Story Points<input aria-label="Story Points" className={inputClass} type="number" min={0} max={10000} value={storyPoints} onChange={e => setStoryPoints(Number(e.target.value))} /></label>}
      {type === 'Task' && <><label className="block text-xs">Người thực hiện<select aria-label="Người thực hiện" className={inputClass} value={assigneeId} onChange={e => setAssigneeId(e.target.value)}><option value="">Chưa giao</option>{options.members.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="block text-xs">Hạn hoàn thành<input aria-label="Hạn hoàn thành" className={inputClass} type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></label></>}
    </form>
  </Modal>
}
