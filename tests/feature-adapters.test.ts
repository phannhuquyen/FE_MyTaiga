import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../src/services/api'
import { projectService } from '../src/features/projects/services/projectService'
import { memberService } from '../src/features/members/services/memberService'
import { epicService } from '../src/features/epics/services/epicService'
import { backlogService } from '../src/features/backlog/services/backlogService'
import { sprintService } from '../src/features/sprints/services/sprintService'
import { bugService } from '../src/features/bugs/services/bugService'
import { profileService } from '../src/features/profile/services/profileService'
import { metricService } from '../src/features/metrics/services/metricService'

const envelope = (data: unknown) => ({ success: true, message: 'QA', data }) as never
const paged = (items: unknown[]) => envelope({ items, total: items.length, page: 1, pageSize: 100 })
beforeEach(() => projectService.setActiveProjectId(1))
it('maps nullable project dates/description and role', async () => {
  vi.spyOn(api.projects, 'list').mockResolvedValue(paged([{ projectId: 1, projectName: 'QA Project', status: 'ACTIVE', projectRole: 'MANAGER', description: null, startDate: null, endDate: null }]))
  const [p] = await projectService.getProjects()
  expect(p.id).toBe('1')
  expect(p.status).toBe('active')
  expect(p.startDate).toBe('Chưa xác định')
})
it('maps members with nullable departments', async () => {
  vi.spyOn(api.projectMembers, 'list').mockResolvedValue(paged([{ userId: 7, fullName: 'QA Member', email: 'qa@example.test', status: 1, projectRole: 'MEMBER', departmentId: null, departmentName: null, joinedAt: '2026-10-27' }]))
  const [m] = await memberService.getMembers()
  expect(m.departmentId).toBe('unassigned')
  expect(m.role).toBe('member')
})
it('maps department memberCount without inventing members', async () => {
  vi.spyOn(api.projectDepartments, 'list').mockResolvedValue(paged([{ departmentId: 3, departmentName: 'QA', description: null, memberCount: 0 }]))
  expect((await memberService.getDepartments())[0]).toMatchObject({ id: '3', name: 'QA', memberCount: 0 })
})
it('does not convert a mock candidate identifier into a real user ID', async () => {
  const add = vi.spyOn(api.projectMembers, 'add').mockResolvedValue(envelope({}))
  await expect(memberService.addMember({ candidateId: 'can-001', departmentId: 'unassigned', role: 'member' })).rejects.toThrow()
  expect(add).not.toHaveBeenCalled()
})
it('maps epic priority/status and progress', async () => {
  vi.spyOn(api.epics, 'list').mockResolvedValue(paged([{ epicId: 2, title: 'QA Epic', priority: 2, status: 'DONE', description: null }]))
  vi.spyOn(api.epics, 'progress').mockResolvedValue(envelope({ totalPbis: 4, totalTasks: 7, pbiProgressPercent: 50 }))
  expect((await epicService.getEpics())[0]).toMatchObject({ id: '2', priority: 'high', status: 'completed', progressPercent: 50, pbisCount: 4 })
})
it('maps backlog story points and epic name', async () => {
  vi.spyOn(api.epics, 'list').mockResolvedValue(paged([{ epicId: 2, title: 'QA Epic' }]))
  vi.spyOn(api.productBacklog, 'list').mockResolvedValue(paged([{ pbiId: 4, epicId: 2, title: 'QA Story', description: null, priority: 2, status: 'NEW', storyPoint: 0 }]))
  expect((await backlogService.getPBIs())[0]).toMatchObject({ id: '4', epicId: '2', storyPoints: 0, description: '' })
})
it('counts remaining sprint items rather than remaining story points', async () => {
  vi.spyOn(api.sprints, 'list').mockResolvedValue(paged([{ sprintId: 3, sprintName: 'QA Sprint', status: 'ACTIVE' }]))
  vi.spyOn(api.sprints, 'progress').mockResolvedValue(envelope({ totalPbis: 4, completedPbis: 1, totalStoryPoints: 21, completedStoryPoints: 3, remainingStoryPoints: 18, progressPercent: 14, items: [] }))
  expect((await sprintService.getSprints())[0].remainingItemsCount).toBe(3)
})
it('maps draft sprint filter to PLANNED contract', async () => {
  const list = vi.spyOn(api.sprints, 'list').mockResolvedValue(paged([]))
  await sprintService.getSprints({ status: 'draft' })
  expect(list).toHaveBeenCalledWith(expect.objectContaining({ projectId: 1, status: 'PLANNED' }))
})
it('maps bug severity/status and preserves server pagination', async () => {
  vi.spyOn(api.bugs, 'list').mockResolvedValue(envelope({ items: [{ bugId: 8, taskId: 10, title: 'QA Bug', description: '', environment: null, severity: 'MAJOR', priority: 'HIGH', status: 'IN_PROGRESS', assigneeId: null, reporterId: 7, createdAt: '2026-10-27' }], total: 14, page: 2, pageSize: 7 }))
  const res = await bugService.getBugs({ page: 2 }, 1)
  expect(res).toMatchObject({ total: 14, page: 2, pageSize: 7 })
  expect(res.items[0]).toMatchObject({ severity: 'major', status: 'in_progress', relatedTaskId: '10' })
})
it('maps null contact/avatar without crashing profile', async () => {
  vi.spyOn(api.users, 'getMe').mockResolvedValue(envelope({ userId: 7, fullName: 'QA User', email: 'qa@example.test', systemRole: 'USER', phoneNumber: null, avatar: null, createdAt: '2026-10-27' }))
  expect(await profileService.getProfile()).toMatchObject({ id: '7', phone: '', fullName: 'QA User' })
})
it('maps metrics numeric responses and task age fields', async () => {
  vi.spyOn(api.flowMetrics, 'wip').mockResolvedValue(envelope({ wip: 2, inProgress: 1, inReview: 1 }))
  vi.spyOn(api.flowMetrics, 'throughput').mockResolvedValue(envelope({ totalDoneTasks: 3, from: '2026-10-01', to: '2026-10-27' }))
  vi.spyOn(api.flowMetrics, 'cycleTimeAverage').mockResolvedValue(envelope({ averageCycleTimeDays: 1.23 }))
  vi.spyOn(api.flowMetrics, 'cycleTime').mockResolvedValue(envelope({ items: [] }))
  vi.spyOn(api.flowMetrics, 'workItemAge').mockResolvedValue(envelope({ items: [{ taskId: 5, title: 'QA Age', status: 'IN_PROGRESS', startedAt: '2026-10-25', workItemAgeDays: 2, assigneeId: null }] }))
  const res = await metricService.getMetricsData(1)
  expect(res).toMatchObject({ wipCurrent: 2, throughputCount: 3, cycleTimeAvgDays: 1.2, workItemAgeAvgDays: 2 })
  expect(res.workItemAgeTableData[0].assigneeName).toBe('Chưa giao')
})
it('rejects denied metrics instead of returning fabricated demo KPIs', async () => {
  for (const name of ['wip', 'throughput', 'cycleTimeAverage', 'cycleTime', 'workItemAge'] as const) {
    vi.spyOn(api.flowMetrics, name).mockRejectedValue({ response: { status: 403 } })
  }
  await expect(metricService.getMetricsData(1)).rejects.toBeTruthy()
})
describe('rejected business mutations propagate', () => {
  it.each([
    ['project', () => projectService.deleteProject('1'), () => vi.spyOn(api.projects, 'delete')],
    ['epic', () => epicService.deleteEpic('2'), () => vi.spyOn(api.epics, 'delete')],
    ['backlog', () => backlogService.deletePBI('4'), () => vi.spyOn(api.productBacklog, 'delete')],
    ['sprint', () => sprintService.deleteSprint('3'), () => vi.spyOn(api.sprints, 'delete')],
    ['bug', () => bugService.deleteBug('8'), () => vi.spyOn(api.bugs, 'delete')],
  ] as const)('%s deletion failure is not success', async (_name, action, spy) => {
    spy().mockRejectedValue(new Error('QA reject'))
    await expect(action()).rejects.toThrow()
  })
})
