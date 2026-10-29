import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import MembersPage from '../src/features/members/MembersPage'
import { memberService } from '../src/features/members/services/memberService'

it('derives duplicate candidates from loaded project members even when directory flags are stale', async () => {
  vi.spyOn(memberService, 'getDepartments').mockResolvedValue([])
  vi.spyOn(memberService, 'getMembers').mockResolvedValue([{ id: '6', name: 'QA User', email: 'user5@gmail.com', role: 'member', roleTitle: 'Member', departmentId: 'unassigned', departmentName: 'Chưa phân phòng ban', avatarCode: 'QU', joinDate: '28/10/2026' }])
  vi.spyOn(memberService, 'getCandidates').mockResolvedValue([{ id: '6', name: 'QA User', email: 'user5@gmail.com', employeeCode: 'USER-6', roleTitle: '', avatarCode: 'QU', alreadyInProject: false }])
  render(<MemoryRouter><MembersPage /></MemoryRouter>)
  fireEvent.click(await screen.findByRole('button', { name: 'Thêm thành viên', exact: true }))
  const dialog = within(screen.getByRole('dialog'))
  fireEvent.click(dialog.getByText(/user5@gmail.com/))
  expect((dialog.getByRole('button', { name: 'Thêm thành viên', exact: true }) as HTMLButtonElement).disabled).toBe(true)
})
