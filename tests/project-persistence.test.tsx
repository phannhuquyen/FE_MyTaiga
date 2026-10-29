import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { api } from '../src/services/api'
import { dashboardService } from '../src/features/dashboard/services/dashboardService'
import { CreateSprintModal } from '../src/features/sprints/components/CreateSprintModal'
import { CreatePBIModal } from '../src/features/backlog/components/CreatePBIModal'
import { kanbanService } from '../src/features/kanban/services/kanbanService'
import { bugService } from '../src/features/bugs/services/bugService'

it('dashboard reads persisted project tasks instead of a local demo list', async () => {
  vi.spyOn(api.tasks, 'list').mockResolvedValue({ success: true, message: '', data: { items: [], total: 0, page: 1, pageSize: 100 } })
  expect(await dashboardService.getMyTasks(1)).toEqual([])
  expect(api.tasks.list).toHaveBeenCalledWith(1, expect.anything())
})

it('Sprint form accepts chronological ISO dates without a fictitious Sprint 14 overlap', () => {
  render(<CreateSprintModal isOpen onClose={() => {}} onSubmit={vi.fn()} />)
  const inputs = screen.getAllByRole('textbox')
  fireEvent.change(inputs[0], { target: { value: 'QA sprint' } })
  fireEvent.change(inputs[1], { target: { value: 'QA goal' } })
  const dates = document.querySelectorAll('input[type=date]')
  if (dates.length) {
    fireEvent.change(dates[0], { target: { value: '2026-11-01' } })
    fireEvent.change(dates[1], { target: { value: '2026-11-10' } })
  } else {
    fireEvent.change(inputs[2], { target: { value: '2026-11-01' } })
    fireEvent.change(inputs[3], { target: { value: '2026-11-10' } })
  }
  expect((screen.getByRole('button', { name: 'Tạo Sprint', exact: true }) as HTMLButtonElement).disabled).toBe(false)
})

it('Backlog form shows a rejected mutation rather than silently ignoring it', async () => {
  render(<CreatePBIModal isOpen onClose={() => {}} onSubmit={vi.fn().mockRejectedValue(new Error('QA API rejected'))} epics={[]} sprints={[]} />)
  fireEvent.change(document.querySelector('#pbi-title')!, { target: { value: 'QA rejected PBI' } })
  fireEvent.click(screen.getByRole('button', { name: 'Tạo PBI', exact: true }))
  expect(await screen.findByText('QA API rejected')).toBeTruthy()
})

it('dashboard persists Story and Bug through their own endpoints and rejects missing links', async () => {
  const pbi = vi.spyOn(api.productBacklog, 'create').mockResolvedValue({ success: true, message: '', data: { pbiId: 10, epicId: 5, title: 'QA Story', description: null, status: 'NEW', storyPoint: 3, priority: 2, createdAt: '', updatedAt: null } })
  await dashboardService.createTask(1, { title: 'QA Story', type: 'Story', priority: 'Cao', epicId: 5, storyPoints: 3 })
  expect(pbi).toHaveBeenCalledWith(expect.objectContaining({ epicId: 5, title: 'QA Story' }))
  await expect(dashboardService.createTask(1, { title: 'QA Bug', type: 'Bug', priority: 'Cao' })).rejects.toThrow('Task')
})

it('never converts demo Task IDs into another database record for Bug creation', async () => {
  const create = vi.spyOn(api.bugs, 'create')
  await expect(bugService.createBug({ title: 'QA', description: 'QA', relatedTaskId: 'task-241', severity: 'minor', priority: 'p3' })).rejects.toThrow('Task thật')
  expect(create).not.toHaveBeenCalled()
})

it('Kanban creation persists assignee, ISO deadline and the requested initial column', async () => {
  vi.spyOn(api.tasks, 'create').mockResolvedValue({ success: true, message: '', data: { taskId: 123, title: 'QA', status: 'TODO', priority: 'HIGH', position: 0 } } as never)
  const move = vi.spyOn(api.board, 'move').mockResolvedValue({ success: true, message: '', data: null } as never)
  const task = await kanbanService.createTask({ title: 'QA', assigneeId: 3, deadline: '2026-11-01', columnId: 'in_progress' }, 1)
  expect(api.tasks.create).toHaveBeenCalledWith(1, expect.objectContaining({ assigneeId: 3, deadline: '2026-11-01T23:59:00+07:00' }))
  expect(move).toHaveBeenCalledWith(123, { toStatus: 'IN_PROGRESS', newPosition: 0 })
  expect(task.columnId).toBe('in_progress')
})

it('editing a Task title preserves its stored description when the board card omits it', async () => {
  vi.spyOn(api.board, 'get').mockResolvedValue({ success: true, message: '', data: { columns: [{ columnName: 'TODO', tasks: [{ taskId: 321, title: 'Before', status: 'TODO', priority: 'HIGH' }] }] } } as never)
  await kanbanService.getTasks(1)
  vi.spyOn(api.tasks, 'get').mockResolvedValue({ success: true, message: '', data: { task: { taskId: 321, title: 'Before', description: 'Persisted details' }, subtasks: [] } } as never)
  const update = vi.spyOn(api.tasks, 'update').mockResolvedValue({ success: true, message: '', data: {} } as never)
  await kanbanService.updateTask('321', { title: 'After' })
  expect(update).toHaveBeenCalledWith(321, expect.objectContaining({ title: 'After', description: 'Persisted details' }))
})

it('Bug assignment returns the accepted database assignee even when details were opened outside the cached page', async () => {
  vi.spyOn(api.bugs, 'assign').mockResolvedValue({ success: true, message: '', data: { bugId: 987, taskId: 321, title: 'QA Bug', description: 'QA', severity: 'MINOR', priority: 'HIGH', status: 'OPEN', assigneeId: 3, assigneeName: 'QA User 2', createdAt: '2026-10-29T00:00:00Z' } } as never)
  const saved = await bugService.assignBug('987', '3')
  expect(saved.assignee).toMatchObject({ id: '3', name: 'QA User 2' })
})
