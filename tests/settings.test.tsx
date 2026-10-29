import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SystemSettingsTab } from '../src/features/admin/components/SystemSettingsTab'

vi.mock('../src/features/admin/services/adminService', () => ({ adminService: {
  getSettings: () => ({ dueSoonHours: 24, workAgeThresholdDays: 5, maxFileSizeMb: 25, maxAttachmentsPerCard: 10, sessionTimeout: '8 giờ', maxLoginAttempts: 5, storageUsedGb: 0, storageTotalGb: 500 }),
  saveSettings: vi.fn(async () => ({ success: false, error: 'QA save rejected' })),
} }))
it('shows rejected settings save and never claims success', async () => {
  render(<SystemSettingsTab />)
  fireEvent.click(screen.getByRole('button', { name: /Lưu cấu hình hệ thống/ }))
  await waitFor(() => expect(screen.getByText('QA save rejected')).toBeTruthy())
  expect(screen.queryByText(/Đã lưu thành công/)).toBeNull()
})
