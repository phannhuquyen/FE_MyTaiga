import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { CreateSprintModal } from '../src/features/sprints/components/CreateSprintModal'
import { ProfileToast } from '../src/features/profile/components/ProfileToast'
import { bugService } from '../src/features/bugs/services/bugService'
import { api } from '../src/services/api'

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })
it('Sprint conflict uses the backend message in a closable notification without losing input', async () => {
  render(<CreateSprintModal isOpen onClose={vi.fn()} onSubmit={vi.fn().mockRejectedValue({ response: { status: 409, data: { message: 'Thời gian chồng lấn với Sprint chưa đóng.' } } })} />)
  fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'QA Sprint conflict' } })
  fireEvent.change(screen.getByLabelText('Ngày bắt đầu'), { target: { value: '2026-11-01' } })
  fireEvent.change(screen.getByLabelText('Ngày kết thúc'), { target: { value: '2026-11-10' } })
  fireEvent.click(screen.getByRole('button', { name: 'Tạo Sprint', exact: true }))
  expect(await screen.findByText('Thời gian chồng lấn với Sprint chưa đóng.')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Đóng thông báo' }))
  expect(screen.queryByText('Thời gian chồng lấn với Sprint chưa đóng.')).toBeNull()
  expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('QA Sprint conflict')
})
it('notification defaults to seven seconds, and can be closed immediately', () => {
  vi.useFakeTimers()
  const close = vi.fn()
  const { unmount } = render(<ProfileToast isVisible onClose={close} />)
  act(() => vi.advanceTimersByTime(6999)); expect(close).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Đóng thông báo' })); expect(close).toHaveBeenCalledOnce()
  unmount()
})
it('FE permits a direct choice between all Bug statuses', () => {
  expect(bugService.validateStatusTransition('open', 'closed').allowed).toBe(true)
  expect(bugService.validateStatusTransition('closed', 'resolved').allowed).toBe(true)
})
it('notification automatically closes at seven seconds', () => {
  vi.useFakeTimers()
  const close = vi.fn()
  render(<ProfileToast isVisible onClose={close} />)
  act(() => vi.advanceTimersByTime(7000))
  expect(close).toHaveBeenCalledOnce()
})
it('autoClose can be disabled while manual close remains available', () => {
  vi.useFakeTimers()
  const close = vi.fn()
  render(<ProfileToast isVisible autoClose={false} onClose={close} />)
  act(() => vi.advanceTimersByTime(14000))
  expect(close).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Đóng thông báo' }))
  expect(close).toHaveBeenCalledOnce()
})
it('preserves REOPENED from the server and submits it without converting to OPEN', async () => {
  const saved = { bugId: 1, taskId: 1, reporterId: 7, assigneeId: null, title: 'QA', description: 'QA', severity: 'MINOR', priority: 'LOW', status: 'REOPENED', createdAt: '2026-11-01T00:00:00Z' }
  const change = vi.spyOn(api.bugs, 'changeStatus').mockResolvedValue({ success: true, data: saved } as never)
  const updated = await bugService.updateBugStatus('1', 'reopened')
  expect(change).toHaveBeenCalledWith(1, { status: 'REOPENED' })
  expect(updated.status).toBe('reopened')
})
