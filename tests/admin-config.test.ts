import { expect, it, vi } from 'vitest'
import { api } from '../src/services/api'

it('loads system config rows using the real backend array contract', async () => {
  vi.spyOn(api.admin, 'listUsers').mockResolvedValue({ success: true, message: '', data: { items: [], total: 0, page: 1, pageSize: 100 } })
  vi.spyOn(api.admin, 'getConfig').mockResolvedValue({ success: true, message: '', data: [{ configKey: 'MAX_FILE_SIZE_MB', configValue: '12', description: null, updatedAt: null }] } as never)
  const { adminService } = await import('../src/features/admin/services/adminService')
  await adminService.loadConfig()
  expect(adminService.getSettings().maxFileSizeMb).toBe(12)
})
