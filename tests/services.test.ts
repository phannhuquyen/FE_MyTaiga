import { describe, expect, it, vi } from 'vitest'
import { api } from '../src/services/api'
import { notificationService } from '../src/features/notifications/services/notificationService'
import { kanbanService } from '../src/features/kanban/services/kanbanService'

describe('API response adapters and mutation consistency', () => {
  it('clears demo notifications when backend returns an empty list', async () => {
    vi.spyOn(api.notifications, 'list').mockResolvedValue({ success: true, message: '', data: { items: [], total: 0, page: 1, pageSize: 50 } })
    notificationService.resetDemoNotifications()
    expect((await notificationService.fetchFromApi())).toEqual([])
    expect(notificationService.getUnreadCount()).toBe(0)
  })
  it('clears demo activity when backend returns an empty list', async () => {
    vi.spyOn(api.activityLogs, 'listByProject').mockResolvedValue({ success: true, message: '', data: { items: [], total: 0, page: 1, pageSize: 50 } })
    expect(await notificationService.fetchActivitiesFromApi(1)).toEqual([])
  })
  it('rejects failed task edits without changing cached task', async () => {
    vi.spyOn(api.tasks, 'get').mockResolvedValue({ success: true, message: '', data: { task: { taskId: 10, title: 'Original', description: 'Stored description' }, subtasks: [] } } as never)
    vi.spyOn(api.board, 'get').mockResolvedValue({ success: true, message: '', data: { projectId: 1, page: 1, pageSize: 20, columns: [{ boardColumnId: 1, columnName: 'TODO', tasks: [{ taskId: 10, title: 'Original', priority: 'HIGH', status: 'TODO', position: 0 }] }] } } as never)
    await kanbanService.getTasks(1)
    vi.spyOn(api.tasks, 'update').mockRejectedValue({ response: { status: 500, data: { message: 'QA rejected' } } })
    await expect(kanbanService.updateTask('10', { title: 'Not saved' })).rejects.toThrow('QA rejected')
    expect((await kanbanService.getTasks()).find(t => t.id === '10')?.title).toBe('Original')
  })
  it('persists description-only edits rather than only changing cache', async () => {
    vi.spyOn(api.board, 'get').mockResolvedValue({ success: true, message: '', data: { projectId: 1, columns: [{ columnName: 'TODO', tasks: [{ taskId: 10, title: 'Original', priority: 'HIGH', position: 0 }] }] } } as never)
    await kanbanService.getTasks(1)
    const update = vi.spyOn(api.tasks, 'update').mockResolvedValue({ success: true, message: '', data: {} } as never)
    await kanbanService.updateTask('10', { description: 'QA description' })
    expect(update).toHaveBeenCalledWith(10, { title: 'Original', description: 'QA description' })
  })
  it('does not claim WIP limits saved when API rejects', async () => {
    vi.spyOn(api.board, 'get').mockResolvedValue({ success: true, message: '', data: { columns: [{ boardColumnId: 1, columnName: 'TODO', tasks: [] }] } } as never)
    vi.spyOn(api.wip, 'setLimit').mockRejectedValue({ response: { status: 403 } })
    await expect(kanbanService.updateWIPLimits({ limits: { todo: 5 } } as never, 1)).rejects.toThrow()
  })
  it('never sends demo task IDs to live delete endpoint', async () => {
    const task = await kanbanService.createTask({ title: 'QA local demo' })
    const remove = vi.spyOn(api.tasks, 'delete').mockResolvedValue({ success: true, message: '', data: null })
    await kanbanService.deleteTask(task.id)
    expect(remove).not.toHaveBeenCalled()
  })
  it('retains unread status when marking a real notification fails', async () => {
    vi.spyOn(api.notifications, 'list').mockResolvedValue({ success: true, message: '', data: { items: [{ notificationId: 71, title: 'QA', content: null, refType: null, refId: null, type: 'SYSTEM', isRead: false, createdAt: '2026-10-27', readAt: null }], total: 1, page: 1, pageSize: 50 } })
    await notificationService.fetchFromApi()
    vi.spyOn(api.notifications, 'markAsRead').mockRejectedValue(new Error('QA denied'))
    await notificationService.markAsRead('71')
    expect(notificationService.getNotifications()[0].isRead).toBe(false)
  })
  it('retains unread status when mark-all API fails', async () => {
    vi.spyOn(api.notifications, 'list').mockResolvedValue({ success: true, message: '', data: { items: [{ notificationId: 72, title: 'QA', content: null, refType: null, refId: null, type: 'SYSTEM', isRead: false, createdAt: '2026-10-27', readAt: null }], total: 1, page: 1, pageSize: 50 } })
    await notificationService.fetchFromApi()
    vi.spyOn(api.notifications, 'markAllAsRead').mockRejectedValue(new Error('QA denied'))
    await notificationService.markAllAsRead()
    expect(notificationService.getNotifications()[0].isRead).toBe(false)
  })
  it.each(['subtask', 'comment'])('rejects failed %s creation without a fake local item', async kind => {
    vi.spyOn(api.board, 'get').mockResolvedValue({ success: true, message: '', data: { columns: [{ columnName: 'TODO', tasks: [{ taskId: 10, title: 'QA parent', priority: 'MEDIUM', position: 0 }] }] } } as never)
    await kanbanService.getTasks(1)
    vi.spyOn(api.tasks, 'createSubtask').mockRejectedValue(new Error('QA rejected'))
    vi.spyOn(api.comments, 'createForTask').mockRejectedValue(new Error('QA rejected'))
    await expect(kind === 'subtask' ? kanbanService.addSubtask('10', 'QA child') : kanbanService.addComment('10', 'QA comment')).rejects.toThrow()
  })
  it('retains subtask state if backend status change fails', async () => {
    vi.spyOn(api.board, 'get').mockResolvedValue({ success: true, message: '', data: { columns: [{ columnName: 'TODO', tasks: [{ taskId: 10, title: 'QA parent', priority: 'MEDIUM', position: 0 }] }] } } as never)
    await kanbanService.getTasks(1)
    vi.spyOn(api.tasks, 'createSubtask').mockResolvedValue({ success: true, message: '', data: { taskId: 11 } } as never)
    await kanbanService.addSubtask('10', 'QA child')
    vi.spyOn(api.board, 'move').mockRejectedValue(new Error('QA rejected'))
    await expect(kanbanService.toggleSubtask('10', '11')).rejects.toThrow()
    expect((await kanbanService.getTasks())[0].subtasks[0].completed).toBe(false)
  })
  it('persists status changed from task details through board API', async () => {
    vi.spyOn(api.board, 'get').mockResolvedValue({ success: true, message: '', data: { columns: [{ columnName: 'TODO', tasks: [{ taskId: 10, title: 'QA task', priority: 'MEDIUM', position: 0 }] }] } } as never)
    await kanbanService.getTasks(1)
    const move = vi.spyOn(api.board, 'move').mockResolvedValue({ success: true, message: '', data: {} } as never)
    await kanbanService.updateTask('10', { columnId: 'in_progress' })
    expect(move).toHaveBeenCalledWith(10, expect.objectContaining({ toStatus: 'IN_PROGRESS' }))
  })
})
