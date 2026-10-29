import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, httpClient } from '../src/services/api'
import { authStorage } from '../src/lib/tokenStorage'
afterEach(() => vi.unstubAllGlobals())

describe('central API transport (mock adapter)', () => {
  it('does not log login response or credentials', async () => {
    const log = vi.spyOn(console, 'log')
    httpClient.defaults.adapter = async (config) => ({ config, data: { success: true, data: { accessToken: 'synthetic-test-only' } }, status: 200, statusText: 'OK', headers: {} })
    await api.auth.login({ email: 'qa@example.test', password: 'synthetic-test-only' })
    expect(log).not.toHaveBeenCalled()
  })
  it('sends bearer token and unwraps the API envelope once', async () => {
    authStorage.setToken('synthetic-test-only')
    httpClient.defaults.adapter = async (config) => {
      expect(config.baseURL).toBe('/api/v1')
      expect(config.headers.Authorization).toBe('Bearer synthetic-test-only')
      expect(config.params).toEqual({ page: 2, pageSize: 5, keyword: 'qa' })
      return { config, data: { success: true, message: 'OK', data: { items: [], total: 0, page: 2, pageSize: 5 } }, status: 200, statusText: 'OK', headers: {} }
    }
    const res = await api.projects.list({ page: 2, pageSize: 5, keyword: 'qa' })
    expect(res.data.items).toEqual([])
    expect(res.data.page).toBe(2)
  })
  it.each([400, 403, 404, 409, 500])('preserves HTTP %i failure for consumers', async (status) => {
    httpClient.defaults.adapter = async () => { throw { response: { status, data: { message: 'QA rejected' } } } }
    await expect(api.projects.get(1)).rejects.toMatchObject({ response: { status } })
  })
  it('propagates timeouts', async () => {
    httpClient.defaults.adapter = async () => { throw { code: 'ECONNABORTED' } }
    await expect(api.projects.list()).rejects.toMatchObject({ code: 'ECONNABORTED' })
  })
  it('clears full cached identity after HTTP 401', async () => {
    window.history.replaceState({}, '', '/login')
    authStorage.setToken('synthetic-test-only')
    authStorage.setUser({ userId: 7, fullName: 'QA', email: 'qa@example.test', systemRole: 'ADMIN' })
    httpClient.defaults.adapter = async () => { throw { response: { status: 401 } } }
    await expect(api.users.getMe()).rejects.toMatchObject({ response: { status: 401 } })
    expect(authStorage.hasToken()).toBe(false)
    expect(authStorage.getUser()).toBeNull()
    expect(authStorage.getUserRole()).toBeNull()
  })
  it('does not redirect a completed logout for an in-flight stale 401', async () => {
    const location = { pathname: '/logged-out', href: '/logged-out' }
    vi.stubGlobal('window', { location })
    httpClient.defaults.adapter = async () => { throw { response: { status: 401 } } }
    await expect(api.users.getMe()).rejects.toBeTruthy()
    expect(location.href).toBe('/logged-out')
  })
  it('does not clear a new session because an older request returns 401', async () => {
    vi.stubGlobal('window', { location: { pathname: '/projects', href: '/projects' } })
    authStorage.setToken('old-synthetic')
    httpClient.defaults.adapter = async config => {
      authStorage.setToken('new-synthetic')
      throw { config, response: { status: 401 } }
    }
    await expect(api.users.getMe()).rejects.toBeTruthy()
    expect(authStorage.getToken()).toBe('new-synthetic')
  })
})
