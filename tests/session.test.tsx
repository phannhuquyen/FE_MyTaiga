import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from '../src/features/auth/context/AuthContext'
import { useAuth } from '../src/features/auth/hooks/useAuth'
import { api } from '../src/services/api'
import { authStorage } from '../src/lib/tokenStorage'

function Harness() {
  const auth = useAuth()
  return <><div>{auth.isAuthenticated ? 'authenticated' : 'anonymous'}</div><div>{auth.isLoading ? 'restoring' : 'settled'}</div>
    {auth.isLocked && <div>account locked</div>}
    <button onClick={() => { void auth.login({ email: 'qa@example.test', password: 'synthetic-only' }).catch(() => {}) }}>login test</button>
    <button onClick={() => { void auth.logout() }}>logout test</button></>
}
it('clears newly stored credentials if post-login profile verification fails', async () => {
  vi.spyOn(api.auth, 'login').mockResolvedValue({ success: true, message: '', data: { accessToken: 'synthetic-only', tokenType: 'Bearer', expiresAtUtc: '', user: { userId: 7, fullName: 'QA', email: 'qa@example.test', systemRole: 'USER' } } })
  vi.spyOn(api.users, 'getMe').mockRejectedValue({ response: { status: 500 } })
  render(<AuthProvider><Harness /></AuthProvider>)
  fireEvent.click(screen.getByText('login test'))
  await waitFor(() => expect(screen.getByText('settled')).toBeTruthy())
  expect(authStorage.hasToken()).toBe(false)
  expect(authStorage.getUser()).toBeNull()
  expect(screen.getByText('anonymous')).toBeTruthy()
})
it('restores session from a fresh provider mount and logs out even if backend logout fails', async () => {
  authStorage.setToken('synthetic-only')
  vi.spyOn(api.users, 'getMe').mockResolvedValue({ success: true, message: '', data: { userId: 7, fullName: 'QA', email: 'qa@example.test', systemRole: 'USER', avatar: null, phoneNumber: null, createdAt: '2026-10-27' } })
  vi.spyOn(api.auth, 'logout').mockRejectedValue(new Error('offline'))
  render(<AuthProvider><Harness /></AuthProvider>)
  await waitFor(() => expect(screen.getByText('authenticated')).toBeTruthy())
  fireEvent.click(screen.getByText('logout test'))
  await waitFor(() => expect(screen.getByText('anonymous')).toBeTruthy())
  expect(authStorage.hasToken()).toBe(false)
})
it('recognizes locked-account 403 from the current backend contract', async () => {
  vi.spyOn(api.auth, 'login').mockRejectedValue({ response: { status: 403, data: { message: 'Tài khoản đã bị khóa.' } } })
  render(<AuthProvider><Harness /></AuthProvider>)
  fireEvent.click(screen.getByText('login test'))
  await waitFor(() => expect(screen.getByText('account locked')).toBeTruthy())
})
