import { expect, test } from '@playwright/test'

test.use({ timezoneId: 'Asia/Bangkok' })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('mytaiga_access_token', 'mock-only')
    localStorage.setItem('mytaiga_user_info', JSON.stringify({ userId: 2, fullName: 'QA', email: 'qa@example.test', systemRole: 'USER' }))
  })
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname
    let data: unknown = { items: [], total: 0, page: 1, pageSize: 50 }
    if (path.endsWith('/users/me')) data = { userId: 2, fullName: 'QA', email: 'qa@example.test', systemRole: 'USER' }
    if (path.endsWith('/unread-count')) data = { unreadCount: 0 }
    return route.fulfill({ json: { success: true, message: '', data } })
  })
})

test('activity date filter finds older records and includes both local calendar days', async ({ page }) => {
  await page.route('**/activity-logs?*', route => {
    const pageNumber = Number(new URL(route.request().url()).searchParams.get('page'))
    const log = (activityLogId: number, createdAt: string, description: string) => ({ activityLogId, createdAt, description, userId: 2, action: 'UPDATED', entityType: 'Task' })
    const items = pageNumber === 1
      ? Array.from({ length: 50 }, (_, index) => log(100 - index, '2026-11-05T00:00:00Z', 'Hoạt động mới hơn'))
      : [log(4, '2026-10-27T17:00:00Z', 'Sau khoảng lọc'), log(3, '2026-10-27T16:59:59Z', 'Cuối ngày kết thúc'), log(2, '2026-10-25T17:00:00Z', 'Đầu ngày bắt đầu'), log(1, '2026-10-25T16:59:59Z', 'Trước khoảng lọc')]
    return route.fulfill({ json: { success: true, data: { items, total: 54, page: pageNumber, pageSize: 50 } } })
  })

  await page.goto('/activity')
  await expect(page.getByText('Hoạt động mới hơn').first()).toBeVisible()
  await page.getByLabel('Ngày bắt đầu').fill('2026-10-26')
  await page.getByLabel('Ngày kết thúc').fill('2026-10-25')
  await expect(page.getByRole('alert')).toHaveText('Ngày kết thúc không được trước ngày bắt đầu.')
  await expect(page.getByRole('button', { name: 'Áp dụng' })).toBeDisabled()

  await page.getByLabel('Ngày kết thúc').fill('2026-10-27')
  await page.getByRole('button', { name: 'Áp dụng' }).click()
  await expect(page.getByText('Đầu ngày bắt đầu')).toBeVisible()
  await expect(page.getByText('Cuối ngày kết thúc')).toBeVisible()
  await expect(page.getByText(/Hoạt động mới hơn|Sau khoảng lọc|Trước khoảng lọc/)).toHaveCount(0)

  await page.getByRole('button', { name: 'Áp dụng' }).click()
  await expect(page.getByText('Đầu ngày bắt đầu')).toBeVisible()
  await page.getByRole('button', { name: 'Xóa lọc ngày' }).click()
  await expect(page.getByText('Hoạt động mới hơn').first()).toBeVisible()
})

test('project creation rejects a reversed date range and accepts the same day', async ({ page }) => {
  await page.goto('/projects')
  await page.getByRole('button', { name: 'Tạo dự án mới' }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByLabel('Ngày bắt đầu')).toHaveAttribute('type', 'date')
  await dialog.getByLabel('Tên dự án').fill('QA lịch dự án')
  await dialog.getByLabel('Ngày bắt đầu').fill('2026-11-10')
  await dialog.getByLabel('Ngày dự kiến kết thúc').fill('2026-11-09')
  await expect(dialog.getByRole('alert')).toHaveText('Ngày kết thúc không được trước ngày bắt đầu.')
  await expect(dialog.getByRole('button', { name: 'Tạo dự án', exact: true })).toBeDisabled()
  await dialog.getByLabel('Ngày dự kiến kết thúc').fill('2026-11-10')
  await expect(dialog.getByRole('alert')).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: 'Tạo dự án', exact: true })).toBeEnabled()
})
