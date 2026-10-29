import { expect, it, vi } from 'vitest'
import { authStorage } from '../src/lib/tokenStorage'
import { authService } from '../src/features/auth/services/authService'
import { api, httpClient } from '../src/services/api'

it('clears local session immediately while server logout is still pending', async () => {
  authStorage.setToken('synthetic-only')
  let complete!: (value: never) => void
  vi.spyOn(api.auth, 'logout').mockReturnValue(new Promise(resolve => { complete = resolve }))
  const pending = authService.logout()
  const hasTokenDuringRequest = authStorage.hasToken()
  complete({ success: true, data: null } as never)
  await pending
  expect(hasTokenDuringRequest).toBe(false)
})
it('retains the captured bearer header for logout after local session has been cleared', async () => {
  authStorage.setToken('synthetic-only')
  httpClient.defaults.adapter = async config => {
    expect(config.headers.Authorization).toBe('Bearer synthetic-only')
    return { config, status: 200, statusText: 'OK', headers: {}, data: { success: true, message: '', data: null } }
  }
  const pending = api.auth.logout()
  authStorage.clearAll()
  await pending
})
