import { expect, test, type Page } from '@playwright/test'

const profile = { userId: 7, fullName: 'QA Synthetic', email: 'qa@example.test', systemRole: 'USER' }
const project = { projectId: 1, projectName: 'QA Fixture', status: 'ACTIVE', projectRole: 'MANAGER' }
const bug = { bugId: 1, taskId: 1, reporterId: 7, assigneeId: 7, title: 'QA direct status', description: 'Regression', environment: null, severity: 'MINOR', priority: 'LOW', status: 'OPEN', createdAt: '2026-11-01T00:00:00Z', updatedAt: null, resolvedAt: null }

async function fixtures(page: Page, rejectStatus = false) {
  const writes: string[] = []
  await page.addInitScript(() => {
    localStorage.setItem('mytaiga_access_token', 'synthetic-browser-only')
    localStorage.setItem('mytaiga_active_project_id', '1')
  })
  await page.route('**/hubs/**', route => route.abort())
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname.replace('/api/v1', '')
    let data: unknown = { items: [], total: 0, page: 1, pageSize: 20 }
    if (path === '/users/me') data = profile
    else if (path === '/projects') data = { items: [project], total: 1, page: 1, pageSize: 20 }
    else if (path === '/projects/1') data = project
    else if (path === '/projects/1/bugs') data = { items: [bug], total: 1, page: 1, pageSize: 7 }
    else if (path === '/bugs/1/status') {
      const status = route.request().postDataJSON().status as string
      writes.push(status)
      if (rejectStatus) return route.fulfill({ status: 409, json: { success: false, message: 'Chuyển trạng thái không đúng workflow của Bug.' } })
      data = { ...bug, status }
    }
    else if (path === '/bugs/1') data = { bug, task: { taskId: 1, title: 'QA task', status: 'TODO', sprintId: null }, taskComments: { total: 0, items: [] }, taskAttachments: { total: 0, items: [] }, history: { total: 0, items: [] } }
    else if (path === '/sprints' && route.request().method() === 'POST') return route.fulfill({ status: 409, json: { success: false, message: 'Thời gian chồng lấn với Sprint chưa đóng.' } })
    else if (path.endsWith('/unread-count')) data = { unreadCount: 0 }
    else if (path === '/chat/rooms') data = []
    await route.fulfill({ status: 200, json: { success: true, data } })
  })
  return writes
}

test('profile menu routes render and support direct reload', async ({ page }) => {
  await fixtures(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/profile')
  for (const [label, path] of [['Mật khẩu & Bảo mật', 'security'], ['Thông báo cá nhân', 'notifications'], ['Dự án tham gia', 'projects'], ['Tích hợp', 'integrations']]) {
    await page.getByRole('link', { name: label, exact: true }).first().click()
    await expect(page).toHaveURL(new RegExp(`/profile/${path}$`))
    await expect(page.getByRole('heading', { name: label, exact: true }).first()).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: label, exact: true }).first()).toBeVisible()
  }
  await expect(page.getByText('Backend chưa cung cấp API quản lý tích hợp cá nhân.', { exact: false })).toBeVisible()
  expect(errors).toEqual([])
})

test('Sprint conflict popup closes immediately and retains the form', async ({ page }) => {
  await fixtures(page)
  await page.goto('/projects/1/sprints')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: /Tạo Sprint mới/i }).first().click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox').first().fill('QA Conflict')
  await page.getByLabel('Ngày bắt đầu').fill('2026-11-01')
  await page.getByLabel('Ngày kết thúc').fill('2026-11-10')
  await page.getByRole('button', { name: 'Tạo Sprint', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Thời gian chồng lấn với Sprint chưa đóng.')
  await page.getByRole('button', { name: 'Đóng thông báo' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(dialog.getByRole('textbox').first()).toHaveValue('QA Conflict')
})

test('security form validates confirmation and displays backend errors without logging out', async ({ page }) => {
  await fixtures(page)
  let calls = 0
  await page.route('**/api/v1/auth/change-password', route => {
    calls++
    expect(Object.keys(route.request().postDataJSON()).sort()).toEqual(['confirmPassword', 'currentPassword', 'newPassword'])
    return route.fulfill({ status: 400, json: { success: false, message: 'Mật khẩu hiện tại không đúng.' } })
  })
  await page.goto('/profile/security')
  await page.getByLabel('Mật khẩu hiện tại', { exact: true }).fill('synthetic-current')
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill('synthetic-new')
  await page.getByLabel('Xác nhận mật khẩu mới', { exact: true }).fill('synthetic-mismatch')
  await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Hai mật khẩu mới không khớp.')
  expect(calls).toBe(0)
  await page.getByLabel('Xác nhận mật khẩu mới', { exact: true }).fill('synthetic-new')
  await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Mật khẩu hiện tại không đúng.')
  expect(calls).toBe(1)
  await expect(page).toHaveURL(/\/profile\/security$/)
})

test('security form clears the session after successful password change (mock only)', async ({ page }) => {
  await fixtures(page)
  await page.route('**/api/v1/auth/change-password', route => route.fulfill({ status: 200, json: { success: true, data: null } }))
  await page.goto('/profile/security')
  await page.getByLabel('Mật khẩu hiện tại', { exact: true }).fill('synthetic-current')
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill('synthetic-new')
  await page.getByLabel('Xác nhận mật khẩu mới', { exact: true }).fill('synthetic-new')
  await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click()
  await expect(page).toHaveURL(/\/logged-out$/)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('mytaiga_access_token'))).toBeNull()
})

for (const [target, reject] of [['closed', false], ['closed', true], ['reopened', false]] as const) test(`Bug direct OPEN to ${target.toUpperCase()}, API ${reject ? 'rejects' : 'accepts'}`, async ({ page }) => {
  const writes = await fixtures(page, reject)
  await page.goto('/projects/1/bugs?id=1')
  await page.getByLabel('Trạng thái Bug', { exact: true }).selectOption(target)
  await page.getByRole('button', { name: 'Xác nhận chuyển bước' }).click()
  await expect(page.getByLabel('Trạng thái Bug', { exact: true })).toBeEnabled()
  if (reject) {
    await expect(page.getByRole('alert')).toContainText('Chuyển trạng thái không đúng workflow của Bug.')
    await expect(page.getByLabel('Trạng thái Bug', { exact: true })).toHaveValue('open')
  } else await expect(page.getByLabel('Trạng thái Bug', { exact: true })).toHaveValue(target)
  expect(writes).toEqual([target.toUpperCase()])
})
