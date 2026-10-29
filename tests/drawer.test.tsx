import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { api } from '../src/services/api'
import { TaskDetailDrawer } from '../src/features/kanban/components/TaskDetailDrawer'

const task = { id: '10', code: 'TASK-10', title: 'QA Task', columnId: 'todo', priority: 'medium', assignee: { name: 'QA', avatarCode: 'QA' }, subtasks: [], comments: [], attachments: [] } as never
it.each(['comment', 'attachment'])('keeps %s visible if backend delete fails', async kind => {
  vi.spyOn(api.comments, 'listByTask').mockResolvedValue({ success: true, message: '', data: { items: [{ commentId: 2, userId: 7, content: 'QA comment', createdAt: '2026-10-27' }], total: 1 } } as never)
  vi.spyOn(api.attachments, 'listByTask').mockResolvedValue({ success: true, message: '', data: { items: [{ attachmentId: 3, fileName: 'qa.txt', fileSize: 12, uploadedBy: 7 }], total: 1 } } as never)
  vi.spyOn(api.comments, 'delete').mockRejectedValue(new Error('rejected'))
  vi.spyOn(api.attachments, 'delete').mockRejectedValue(new Error('rejected'))
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  render(<TaskDetailDrawer isOpen onClose={vi.fn()} task={task} onUpdate={vi.fn()} onDeleteRequest={vi.fn()} onToggleSubtask={vi.fn()} onAddSubtask={vi.fn()} onAddComment={vi.fn()} />)
  const label = kind === 'comment' ? 'QA comment' : 'qa.txt'
  await waitFor(() => expect(screen.getByText(label)).toBeTruthy())
  fireEvent.click(screen.getByTitle(kind === 'comment' ? 'Xóa bình luận' : 'Xóa tệp đính kèm'))
  await waitFor(() => expect(window.alert).toHaveBeenCalled())
  expect(screen.getByText(label)).toBeTruthy()
})
