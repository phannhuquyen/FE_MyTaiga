import { expect, test, type Page } from '@playwright/test'

test.skip(!process.env.QA_TEST_PASSWORD, 'Requires supplied QA credentials')
test.setTimeout(45000)
async function call(page: Page, group: string, method: string, ...args: unknown[]) {
  return page.evaluate(async ({ group, method, args }) => {
    const path = '/src/services/api.ts'
    const { api } = await import(path)
    return (await api[group][method](...args)).data
  }, { group, method, args })
}
test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.locator('#email-input').fill('user1@gmail.com')
  await page.locator('#password-input').fill(process.env.QA_TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page).toHaveURL(/\/projects$/)
  await page.waitForLoadState('networkidle')
})

test('live Sprint duplicate: backend 409 shown in immediately closable popup', async ({ page }) => {
  const sprints = await call(page, 'sprints', 'list', { projectId: 1, page: 1, pageSize: 100 })
  // The existing name guarantees rejection before INSERT in the backend contract.
  const sprint = sprints.items[0]
  test.skip(!sprint, 'No existing Sprint in project 1; do not create business data for this test')
  await page.goto('/projects/1/sprints')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Tạo Sprint mới', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox').first().fill(sprint.sprintName)
  await page.getByLabel('Ngày bắt đầu').fill(sprint.startDate.slice(0, 10))
  await page.getByLabel('Ngày kết thúc').fill(sprint.endDate.slice(0, 10))
  const response = page.waitForResponse(r => r.url().endsWith('/api/v1/sprints') && r.request().method() === 'POST')
  await page.getByRole('button', { name: 'Tạo Sprint', exact: true }).click()
  expect((await response).status()).toBe(409)
  await expect(page.getByRole('alert')).toContainText('Tên Sprint đã tồn tại trong dự án.')
  await page.getByRole('button', { name: 'Đóng thông báo' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(dialog.getByRole('textbox').first()).toHaveValue(sprint.sprintName)
  const after = await call(page, 'sprints', 'list', { projectId: 1, page: 1, pageSize: 100 })
  expect(after.total).toBe(sprints.total)
})

test('live Bug nonsequential change: backend rejection preserves database status', async ({ page }) => {
  const list = await call(page, 'bugs', 'list', 1, { page: 1, pageSize: 100 })
  const bug = list.items.find((item: { title: string; status: string }) => item.title.startsWith('QA-') && ['OPEN', 'IN_PROGRESS', 'CLOSED', 'RESOLVED'].includes(item.status))
  test.skip(!bug, 'No existing QA Bug; do not modify business bugs')
  const target = bug.status === 'OPEN' ? 'closed' : 'open'
  await page.goto(`/projects/1/bugs?id=${bug.bugId}`)
  await page.getByLabel('Trạng thái Bug', { exact: true }).selectOption(target)
  const response = page.waitForResponse(r => r.url().endsWith(`/bugs/${bug.bugId}/status`) && r.request().method() === 'PATCH')
  await page.getByRole('button', { name: 'Xác nhận chuyển bước' }).click()
  expect((await response).status()).toBe(409)
  await expect(page.getByRole('alert')).toContainText('Chuyển trạng thái không đúng workflow của Bug.')
  await expect(page.getByLabel('Trạng thái Bug', { exact: true })).toHaveValue(bug.status.toLowerCase())
  const after = await call(page, 'bugs', 'get', bug.bugId)
  expect(after.bug.status).toBe(bug.status)
})

test('live profile settings tabs render; no password changes submitted', async ({ page }) => {
  for (const [path, heading] of [['security', 'Mật khẩu & Bảo mật'], ['notifications', 'Thông báo cá nhân'], ['projects', 'Dự án tham gia'], ['integrations', 'Tích hợp']]) {
    await page.goto(`/profile/${path}`)
    await expect(page.getByRole('heading', { name: heading, exact: true }).first()).toBeVisible()
    await expect(page.getByText('Unexpected Application Error!', { exact: true })).toHaveCount(0)
    if (path === 'security') await expect(page.locator('input[type="password"]')).toHaveCount(3)
  }
})
