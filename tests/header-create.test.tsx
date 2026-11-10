import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import { Header } from '../src/components/layout/Header'

vi.mock('../src/features/auth/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: '42', name: 'Admin API' } }) }))
vi.mock('../src/features/notifications', () => ({ NotificationBellDropdown: () => null }))
it('wires the visible header Create action to its callback', () => {
  const create = vi.fn()
  render(<MemoryRouter><Header onQuickCreate={create} /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Tạo', exact: true }))
  expect(create).toHaveBeenCalledOnce()
})
it('renders the signed-in admin identity instead of a hardcoded name', () => {
  render(<MemoryRouter initialEntries={['/admin/users']}><Header /></MemoryRouter>)
  expect(screen.getByText('Admin: Admin API (Quản trị viên)')).toBeTruthy()
  expect(screen.queryByText(/Quốc Bảo/)).toBeNull()
})
