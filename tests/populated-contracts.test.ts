import { expect, it, vi } from 'vitest'
import { api } from '../src/services/api'
import { bugService } from '../src/features/bugs/services/bugService'
import { notificationService } from '../src/features/notifications/services/notificationService'

it('maps paged bug detail collections from the real controller contract', async () => {
  vi.spyOn(api.bugs, 'get').mockResolvedValue({ success: true, message: '', data: {
    bug: { bugId: 81, taskId: 10, reporterId: 7, title: 'QA detail', description: 'QA', severity: 'MINOR', priority: 'HIGH', status: 'OPEN', createdAt: '2026-10-27' },
    task: { taskId: 10, title: 'QA Task', status: 'TODO', sprintId: null },
    taskComments: { total: 1, items: [{ commentId: 3, userId: 7, content: 'QA comment', createdAt: '2026-10-27', updatedAt: null }] },
    taskAttachments: { total: 0, items: [] }, history: { total: 0, items: [] },
  } } as never)
  const bug = await bugService.getBugById('81')
  expect(bug?.relatedTaskTitle).toBe('QA Task')
  expect(bug?.comments?.[0].content).toBe('QA comment')
})
it('maps notification content/ref fields and supports search without undefined crashes', async () => {
  vi.spyOn(api.notifications, 'list').mockResolvedValue({ success: true, message: '', data: { items: [{ notificationId: 91, title: 'QA notice', content: 'QA assigned task', type: 'TASK_ASSIGNED', refType: 'TASK', refId: 10, isRead: false, createdAt: '2026-10-27', readAt: null }], total: 1, page: 1, pageSize: 50 } } as never)
  const items = await notificationService.fetchFromApi()
  expect(items[0].message).toBe('QA assigned task')
  expect(notificationService.getNotifications({ search: 'assigned' })).toHaveLength(1)
  expect(items[0].targetCode).toBe('#TASK-10')
})
