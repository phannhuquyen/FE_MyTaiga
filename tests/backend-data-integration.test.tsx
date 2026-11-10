import { beforeEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { api } from '../src/services/api'
import { allPages } from '../src/lib/allPages'
import { projectService } from '../src/features/projects/services/projectService'
import { epicService } from '../src/features/epics/services/epicService'
import { backlogService } from '../src/features/backlog/services/backlogService'
import { bugService } from '../src/features/bugs/services/bugService'
import { memberService } from '../src/features/members/services/memberService'
import { kanbanService } from '../src/features/kanban/services/kanbanService'
import { sprintService } from '../src/features/sprints/services/sprintService'
import { SprintBurndownTab } from '../src/features/sprints/components/SprintBurndownTab'
import { metricService } from '../src/features/metrics/services/metricService'
import { notificationService } from '../src/features/notifications/services/notificationService'
import { chatService } from '../src/features/chat/services/chatService'
import { AttachmentPreviewModal } from '../src/features/chat/components/AttachmentPreviewModal'
import { LinkTaskModal } from '../src/features/epics/components/LinkTaskModal'
import { ThroughputChart } from '../src/features/metrics/components/ThroughputChart'

const envelope = (data: unknown) => ({ success: true, message: '', data }) as never
const paged = (items: unknown[], total = items.length) => envelope({ items, total, page: 1, pageSize: 100 })
beforeEach(() => projectService.setActiveProjectId(1))

it('reads until total including a short page; an empty page terminates inconsistent totals', async () => {
  const fetch = vi.fn().mockResolvedValueOnce(paged([1], 3)).mockResolvedValueOnce(paged([2, 3], 3))
  expect(await allPages(fetch)).toEqual([1, 2, 3])
  expect(fetch.mock.calls).toEqual([[1], [2]])
  const empty = vi.fn().mockResolvedValue(paged([], 99))
  expect(await allPages(empty)).toEqual([])
  expect(empty).toHaveBeenCalledOnce()
})

it('project cards use all real managers, members and avatars instead of one fake member', async () => {
  vi.spyOn(api.projects, 'list').mockResolvedValue(paged([{ projectId: 1, projectName: 'Actual', status: 'ACTIVE' }]))
  vi.spyOn(api.projectMembers, 'list')
    .mockResolvedValueOnce(paged([{ userId: 5, fullName: 'API Manager', projectRole: 'MANAGER', avatar: '/manager.png' }], 2))
    .mockResolvedValueOnce(paged([{ userId: 6, fullName: 'API Member', projectRole: 'MEMBER', avatar: '/member.png' }], 2))
  const [project] = await projectService.getProjects()
  expect(project).toMatchObject({ leadName: 'API Manager', totalMembersCount: 2 })
  expect(project.members.map(member => member.name)).toEqual(['API Manager', 'API Member'])
  expect(project.members[0].avatarUrl).toBe('/manager.png')
})

it('counts unique people across projects rather than counting memberships as people', async () => {
  vi.spyOn(api.projects, 'list').mockImplementation(async query => query?.pageSize === 1
    ? paged([], query.status === 'ACTIVE' ? 2 : 0) : paged([{ projectId: 1 }, { projectId: 2 }]))
  vi.spyOn(api.projectMembers, 'list').mockImplementation(async projectId =>
    paged(projectId === 1 ? [{ userId: 1 }, { userId: 2 }] : [{ userId: 2 }, { userId: 3 }]))
  expect(await projectService.getProjectCounts()).toEqual({ activeCount: 2, closedCount: 0, totalMembers: 3 })
})

it('Epic points sum real PBI estimates, including zero, instead of multiplying counts by three', async () => {
  vi.spyOn(api.epics, 'list').mockResolvedValue(paged([{ epicId: 4, title: 'Epic', status: 'IN_PROGRESS', priority: 2 }]))
  vi.spyOn(api.epics, 'progress').mockResolvedValue(envelope({ totalPbis: 3, totalTasks: 2, pbiProgressPercent: 67 }))
  vi.spyOn(api.productBacklog, 'list').mockResolvedValue(paged([
    { pbiId: 1, epicId: 4, status: 'DONE', storyPoint: 8 },
    { pbiId: 2, epicId: 4, status: 'DONE', storyPoint: 0 },
    { pbiId: 3, epicId: 4, status: 'NEW', storyPoint: 2 },
  ]))
  vi.spyOn(api.tasks, 'list').mockResolvedValue(paged([{ taskId: 1, epicId: 4, status: 'DONE' }, { taskId: 2, epicId: 4, status: 'TODO' }]))
  expect((await epicService.getEpics())[0]).toMatchObject({ totalPoints: 10, completedPoints: 8 })
  expect(await epicService.getProgressBreakdown('4')).toMatchObject([
    { pbiCount: 2, taskCount: 1, storyPoints: 8 },
    { pbiCount: 1, taskCount: 1, storyPoints: 2 },
  ])
})

it('backlog Epic summaries use persisted color and PBI counts', async () => {
  vi.spyOn(api.epics, 'list').mockResolvedValue(paged([{ epicId: 4, title: 'Epic', color: '#123456' }]))
  vi.spyOn(api.productBacklog, 'list').mockResolvedValue(paged([{ epicId: 4 }, { epicId: 4 }, { epicId: 5 }]))
  expect((await backlogService.getEpics())[0]).toMatchObject({ color: '#123456', pbiCount: 2 })
})

it('backlog Sprint summaries use server progress counts and points', async () => {
  vi.spyOn(api.sprints, 'list').mockResolvedValue(paged([{ sprintId: 8, sprintName: 'Real sprint', status: 'ACTIVE' }]))
  vi.spyOn(api.sprints, 'progress').mockResolvedValue(envelope({ totalPbis: 3, totalStoryPoints: 13 }))
  expect((await backlogService.getSprints())[0]).toMatchObject({ assignedSP: 13, pbiCount: 3 })
})

it('loads assigned tasks beyond page one using the selected member ID', async () => {
  const list = vi.spyOn(api.tasks, 'list').mockResolvedValueOnce(paged([{ taskId: 12, title: 'First', status: 'TODO' }], 2))
    .mockResolvedValueOnce(paged([{ taskId: 19, title: 'Second', status: 'DONE' }], 2))
  expect(await memberService.getMemberTasks('55')).toMatchObject([{ id: 'TASK-12' }, { id: 'TASK-19' }])
  expect(list).toHaveBeenLastCalledWith(1, { assigneeId: 55, page: 2, pageSize: 100 })
})

function metricsFixtures() {
  vi.spyOn(api.flowMetrics, 'wip').mockResolvedValue(envelope({ wip: 0, inProgress: 0, inReview: 0 }))
  vi.spyOn(api.flowMetrics, 'throughput').mockResolvedValue(envelope({ totalDoneTasks: 0, from: '2026-11-01', to: '2026-11-02', points: [], asOfUtc: '2026-11-02T09:31:00Z' }))
  vi.spyOn(api.flowMetrics, 'throughputSprints').mockResolvedValue(paged([]))
  vi.spyOn(api.flowMetrics, 'cycleTimeAverage').mockResolvedValue(envelope({ averageCycleTimeDays: null }))
  vi.spyOn(api.flowMetrics, 'cycleTime').mockResolvedValue(paged([{ taskId: 1, completedAt: null, cycleTimeDays: null }]))
  vi.spyOn(api.flowMetrics, 'workItemAge').mockResolvedValue(paged([]))
  vi.spyOn(api.projectMembers, 'list').mockResolvedValue(paged([]))
  vi.spyOn(api.tasks, 'list').mockResolvedValue(paged([]))
}

it('null averages, empty age data and invalid cycles never fall back to demo metrics', async () => {
  metricsFixtures()
  const data = await metricService.getMetricsData(1, 'all', 9, { from: '2026-11-01', to: '2026-11-02' })
  expect(data).toMatchObject({ source: 'api', wipCurrent: 0, throughputCount: 0, cycleTimeAvgDays: null, workItemAgeAvgDays: null, workItemAgeMaxDays: 0, workItemAgeWarningCount: 0 })
  expect(data.cycleTimeScatterData).toEqual([])
  expect(data.workItemAgeChartData).toEqual([])
  expect(data.wipRunData).toEqual([])
  expect(data.lastSyncTime).not.toBe('Vừa xong')
  expect(api.flowMetrics.throughput).toHaveBeenCalledWith(1, { sprintId: undefined, from: '2026-11-01', to: '2026-11-02' })
})

it('age averages and warnings include every page and real assignee/priority data', async () => {
  metricsFixtures()
  vi.mocked(api.flowMetrics.workItemAge).mockResolvedValueOnce(paged([{ taskId: 1, title: 'First', assigneeId: 55, status: 'IN_PROGRESS', startedAt: '2026-11-01', workItemAgeDays: 2 }], 2))
    .mockResolvedValueOnce(paged([{ taskId: 2, title: 'Second', status: 'IN_REVIEW', startedAt: '2026-11-01', workItemAgeDays: 8 }], 2))
  vi.mocked(api.projectMembers.list).mockResolvedValue(paged([{ userId: 55, fullName: 'Real assignee', projectRole: 'MEMBER' }]))
  vi.mocked(api.tasks.list).mockResolvedValue(paged([{ taskId: 1, priority: 'CRITICAL' }, { taskId: 2, priority: 'LOW' }]))
  const data = await metricService.getMetricsData(1)
  expect(data).toMatchObject({ workItemAgeAvgDays: 5, workItemAgeMaxDays: 8, workItemAgeWarningCount: 1 })
  expect(data.workItemAgeTableData[0]).toMatchObject({ assigneeName: 'Real assignee', priority: 'Critical' })
})

it('Throughput renders the actual Sprint comparison without demo efficiency or story points', async () => {
  metricsFixtures()
  vi.mocked(api.flowMetrics.throughputSprints).mockResolvedValue(paged([{ sprintId: 75, sprintName: 'Release API', status: 'CLOSED', doneTasks: 23 }]))
  const data = await metricService.getMetricsData(1)
  render(<ThroughputChart data={data} />)
  expect(screen.getByText('Release API · CLOSED')).toBeTruthy()
  expect(screen.getByText('23 thẻ')).toBeTruthy()
  expect(screen.queryByText(/78.2%|Sprint 12|36 Story Points/)).toBeNull()
})

it('activity actions and counters derive from all returned logs, with unknown actions preserved', async () => {
  const base = { userId: 55, userName: 'Actor API', entityType: 'TASK', createdAt: '2026-11-02T09:00:00Z' }
  const list = vi.spyOn(api.activityLogs, 'listByProject')
    .mockResolvedValueOnce(paged([{ ...base, activityLogId: 1, action: 'TASK_MOVED', description: 'IN_REVIEW -> DONE; position=0' }], 4))
    .mockResolvedValueOnce(paged([
      { ...base, activityLogId: 2, action: 'BUG_CREATED' },
      { ...base, activityLogId: 3, action: 'WIP_LIMIT_SET' },
      { ...base, activityLogId: 4, action: 'TASK_RENAMED' },
    ], 4))
  const rows = await notificationService.fetchActivitiesFromApi(1)
  expect(list).toHaveBeenCalledTimes(2)
  expect(rows.map(row => row.actionType)).toEqual(['task_complete', 'bug_report', 'wip_warning', 'other'])
  expect(notificationService.getActivityStats(rows)).toEqual({ totalEvents: 4, tasksCompleted: 1, newBugs: 1, wipViolations: null })
})

it('notification time filter uses createdAt and unread count includes later pages', async () => {
  const base = { title: 'Notification', type: 'MENTION', isRead: false }
  vi.spyOn(api.notifications, 'list').mockResolvedValueOnce(paged([{ ...base, notificationId: 1, createdAt: new Date().toISOString() }], 2))
    .mockResolvedValueOnce(paged([{ ...base, notificationId: 2, createdAt: '2020-01-01' }], 2))
  await notificationService.fetchFromApi()
  expect(notificationService.getUnreadCount()).toBe(2)
  expect(notificationService.getNotifications({ timeRange: '7d' }).map(row => row.id)).toEqual(['1'])
})

it('searches the room API with keyword and follows its history cursor', async () => {
  const base = { chatRoomId: 71, senderId: 55, senderName: 'Sender', content: 'needle', sentAt: '2026-11-02T00:00:00Z' }
  const list = vi.spyOn(api.chat, 'listMessages')
    .mockResolvedValueOnce(envelope({ items: [{ ...base, messageId: 90 }], hasMore: true, nextBefore: 90 }))
    .mockResolvedValueOnce(envelope({ items: [{ ...base, messageId: 35 }], hasMore: false, nextBefore: null }))
  const results = await chatService.searchMessagesFromApi('needle', '71')
  expect(results.map(row => row.message.id)).toEqual(['90', '35'])
  expect(list).toHaveBeenLastCalledWith(71, { keyword: 'needle', before: 90, limit: 100 })
})

it('shows the actual text attachment, without a fabricated benchmark report', async () => {
  vi.spyOn(api.chat, 'previewAttachmentBlob').mockResolvedValue({ text: async () => 'Actual file: test passed' } as Blob)
  render(<AttachmentPreviewModal isOpen onClose={() => {}} attachment={{ id: '5', name: 'result.txt', type: 'log', bytes: 23, size: '23 B' }} />)
  expect(await screen.findByText('Actual file: test passed')).toBeTruthy()
  expect(screen.queryByText(/K6 Load Test Benchmark/)).toBeNull()
})

it('selects real Task IDs in the link modal and blocks fabricated prefixed IDs at the service boundary', async () => {
  const link = vi.spyOn(api.epics, 'linkTask').mockResolvedValue(envelope(null))
  await expect(epicService.linkTasks('4', ['task-301'])).rejects.toThrow(/ID/)
  expect(link).not.toHaveBeenCalled()
  vi.spyOn(api.tasks, 'list').mockResolvedValue(paged([{ taskId: 94, title: 'Real candidate', status: 'TODO', epicId: null }]))
  const confirm = vi.fn(async () => {})
  render(<LinkTaskModal isOpen epic={{ id: '4', name: 'Epic', code: 'EPIC-4' } as never} onClose={() => {}} onConfirm={confirm} />)
  fireEvent.click(await screen.findByText('Real candidate'))
  fireEvent.click(screen.getByRole('button', { name: /Xác nhận liên kết/ }))
  await waitFor(() => expect(confirm).toHaveBeenCalledWith(['94']))
})
it('PDF previews use an authenticated blob and revoke their object URL on close', async () => {
  vi.spyOn(api.chat, 'previewAttachmentBlob').mockResolvedValue(new Blob(['%PDF-fixture'], { type: 'application/pdf' }))
  const create = vi.fn(() => 'blob:actual-pdf')
  const revoke = vi.fn()
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: create })
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revoke })
  const { unmount } = render(<AttachmentPreviewModal isOpen onClose={() => {}} attachment={{ id: '6', name: 'actual.pdf', type: 'pdf', bytes: 20, size: '20 B' }} />)
  await waitFor(() => expect(screen.getByTitle('actual.pdf').getAttribute('src')).toBe('blob:actual-pdf'))
  expect(api.chat.previewAttachmentBlob).toHaveBeenCalledWith(6)
  unmount()
  expect(revoke).toHaveBeenCalledWith('blob:actual-pdf')
})
it('reads all board pages according to per-column hasMore flags', async () => {
  const column = { boardColumnId: 1, columnName: 'TODO', wipLimit: null }
  const board = vi.spyOn(api.board, 'get')
    .mockResolvedValueOnce(envelope({ columns: [{ ...column, hasMore: true, tasks: [{ taskId: 10, title: 'First', priority: 'HIGH', position: 0 }] }] }))
    .mockResolvedValueOnce(envelope({ columns: [{ ...column, hasMore: false, tasks: [{ taskId: 20, title: 'Second', priority: 'LOW', position: 100 }] }] }))
  expect((await kanbanService.getTasks(1)).map(task => task.id)).toEqual(['10', '20'])
  expect(board).toHaveBeenLastCalledWith(1, { page: 2, pageSize: 100, keyword: undefined })
})
it('Bug filters pass real assignee IDs and filter unassigned across all rows', async () => {
  const base = { taskId: 5, title: 'Bug', severity: 'MAJOR', priority: 'HIGH', status: 'OPEN', reporterId: 42, createdAt: '2026-11-01' }
  const list = vi.spyOn(api.bugs, 'list').mockResolvedValue(paged([{ ...base, bugId: 1, assigneeId: 99 }]))
  expect((await bugService.getBugs({ assigneeId: '99' }, 1)).items[0].assignee?.id).toBe('99')
  expect(list).toHaveBeenLastCalledWith(1, expect.objectContaining({ assigneeId: 99 }))
  list.mockResolvedValue(paged([{ ...base, bugId: 1, assigneeId: 99 }, { ...base, bugId: 2, assigneeId: null }]))
  const result = await bugService.getBugs({ assigneeId: 'unassigned' }, 1)
  expect(result.total).toBe(1)
  expect(result.items.map(item => item.id)).toEqual(['2'])
})
it('Sprint details map complete progress and real burndown points while retaining unknown history as undefined', async () => {
  vi.spyOn(api.sprints, 'get').mockResolvedValue(envelope({ sprintId: 8, sprintName: 'Release', status: 'ACTIVE' }))
  vi.spyOn(api.sprints, 'progress').mockResolvedValue(envelope({ totalPbis: 4, completedPbis: 2, totalStoryPoints: 13, completedStoryPoints: 8, progressPercent: 62, items: [] }))
  vi.spyOn(api.sprints, 'burndown').mockResolvedValue(envelope({ note: 'History note from BE', points: [
    { date: '2026-11-01', idealRemaining: 13, actualRemaining: null },
    { date: '2026-11-02', idealRemaining: 8, actualRemaining: 5 },
  ] }))
  const sprint = await sprintService.getSprintById('8')
  expect(sprint).toMatchObject({ totalItemsCount: 4, completedItemsCount: 2, remainingItemsCount: 2, completedSP: 8, burndownNote: 'History note from BE' })
  expect(sprint?.burndownPoints?.map(point => point.actualRemaining)).toEqual([undefined, 5])
})

it('Sprint chart loads the burndown endpoint and compares real completed Story Points', async () => {
  vi.spyOn(api.sprints, 'burndown').mockResolvedValue(envelope({ note: 'Burndown from API', points: [{ date: '2026-11-01', idealRemaining: 10, actualRemaining: 5 }] }))
  vi.spyOn(api.sprints, 'list').mockResolvedValue(paged([{ sprintId: 8, sprintName: 'Compared sprint' }]))
  vi.spyOn(api.sprints, 'progress').mockResolvedValue(envelope({ completedStoryPoints: 8, totalStoryPoints: 13 }))
  render(<SprintBurndownTab sprint={{ id: '8', name: 'Release', items: [], completedSP: 8, totalSP: 13, completedItemsCount: 2, totalItemsCount: 4 } as never} />)
  expect(await screen.findByText('Burndown from API')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Throughput & Vận tốc' }))
  expect(await screen.findByText('Compared sprint')).toBeTruthy()
  expect(screen.getByText('8 / 13 SP')).toBeTruthy()
  expect(screen.queryByText('78%')).toBeNull()
})
