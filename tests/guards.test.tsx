import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext, type AuthContextValue } from '../src/features/auth/context/authContextDef'
import { AdminPortalLayout } from '../src/components/layout/AdminPortalLayout'
import { AppLayout } from '../src/components/layout/AppLayout'

vi.mock('../src/components/layout/Sidebar', () => ({ Sidebar: () => <div>sidebar</div> }))
vi.mock('../src/components/layout/Header', () => ({ Header: () => <div>header</div> }))

const base: AuthContextValue = {
  user: null, token: null, isAuthenticated: false, isLoading: false,
  error: null, attemptsLeft: 5, isLocked: false,
  login: vi.fn(), logout: vi.fn(), clearError: vi.fn(), updateUser: vi.fn(),
}
function mount(admin: boolean, state: Partial<AuthContextValue>) {
  render(<AuthContext.Provider value={{ ...base, ...state }}>
    <MemoryRouter initialEntries={[admin ? '/admin/users' : '/projects']}>
      <Routes>
        <Route path="/login" element={<div>login destination</div>} />
        <Route element={admin ? <AdminPortalLayout /> : <AppLayout />}>
          <Route path={admin ? '/admin/users' : '/projects'} element={<div>protected content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  </AuthContext.Provider>)
}
describe.each([false, true])('route guard admin=%s', (admin) => {
  it('redirects anonymous visitors before rendering children', () => {
    mount(admin, {})
    expect(screen.queryByText('protected content')).toBeNull()
    expect(screen.getByText('login destination')).toBeTruthy()
  })
  it('withholds protected content during session restore', () => {
    mount(admin, { isLoading: true, isAuthenticated: true })
    expect(screen.queryByText('protected content')).toBeNull()
    expect(screen.queryByText('login destination')).toBeNull()
  })
})
it('denies a restored non-admin user access to admin', () => {
  mount(true, { isAuthenticated: true, user: { id: '7', name: 'QA', email: 'qa@example.test', role: 'Thành viên', systemRole: 'USER', avatarCode: 'QA' } })
  expect(screen.queryByText('protected content')).toBeNull()
  expect(screen.getByText('Không có quyền truy cập')).toBeTruthy()
})
