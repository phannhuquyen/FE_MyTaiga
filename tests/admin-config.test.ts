import { expect, it, vi } from 'vitest'
import { api } from '../src/services/api'

it('loads system config rows using the real backend array contract', async () => {
  vi.spyOn(api.admin, 'listUsers').mockResolvedValue({ success: true, message: '', data: { items: [], total: 0, page: 1, pageSize: 100 } })
  vi.spyOn(api.admin, 'getConfig').mockResolvedValue({ success: true, message: '', data: [{ configKey: 'MAX_FILE_SIZE_MB', configValue: '12', description: null, updatedAt: null }] } as never)
  const { adminService } = await import('../src/features/admin/services/adminService')
  await adminService.loadConfig()
  expect(adminService.getSettings().maxFileSizeMb).toBe(12)
})
it('loads and persists every supported field using the backend config keys', async () => {
  vi.spyOn(api.admin, 'listUsers').mockResolvedValue({ success: true, message: '', data: { items: [], total: 0, page: 1, pageSize: 100 } })
  vi.spyOn(api.admin, 'getConfig').mockResolvedValue({ success: true, message: '', data: [
    { configKey: 'MAX_FILE_SIZE_MB', configValue: '17', updatedAt: '2026-11-09T00:00:00Z' },
    { configKey: 'DEADLINE_WARNING_HOURS', configValue: '48', updatedAt: '2026-11-09T00:00:00Z' },
    { configKey: 'MAX_FAILED_LOGIN', configValue: '7', updatedAt: '2026-11-09T00:00:00Z' },
    { configKey: 'JWT_EXPIRE_MINUTES', configValue: '95', updatedAt: '2026-11-09T00:00:00Z' },
  ] } as never)
  const update = vi.spyOn(api.admin, 'updateConfig').mockResolvedValue({ success: true, message: '', data: null } as never)
  const { adminService } = await import('../src/features/admin/services/adminService')
  expect(await adminService.loadConfig()).toBe(true)
  expect(adminService.getSettings()).toMatchObject({ maxFileSizeMb: 17, dueSoonHours: 48, maxLoginAttempts: 7, sessionTimeout: '95 phút' })
  const oldThreshold = adminService.getSettings().workAgeThresholdDays
  expect(await adminService.saveSettings({ maxFileSizeMb: 18, dueSoonHours: 72, maxLoginAttempts: 6, sessionTimeout: '2 giờ', workAgeThresholdDays: 99 })).toEqual({ success: true })
  expect(update).toHaveBeenCalledWith({ MAX_FILE_SIZE_MB: '18', DEADLINE_WARNING_HOURS: '72', MAX_FAILED_LOGIN: '6', JWT_EXPIRE_MINUTES: '120' })
  expect(adminService.getSettings().workAgeThresholdDays).toBe(oldThreshold)
  update.mockRejectedValueOnce(new Error('rejected'))
  expect((await adminService.saveSettings({ dueSoonHours: 100 })).success).toBe(false)
  expect(adminService.getSettings().dueSoonHours).toBe(72)
})

it('exposes config loading failure rather than treating defaults as a successful load', async () => {
  vi.spyOn(api.admin, 'getConfig').mockRejectedValue(new Error('unavailable'))
  const { adminService } = await import('../src/features/admin/services/adminService')
  expect(await adminService.loadConfig()).toBe(false)
})
