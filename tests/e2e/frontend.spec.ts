import { expect, test, type Page } from '@playwright/test'

const profile = { userId: 7, fullName: 'QA Synthetic', email: 'qa@example.test', systemRole: 'ADMIN', phoneNumber: null, avatar: null, createdAt: '2026-10-27T00:00:00Z' }
const project = { projectId: 1, projectName: 'QA Fixture Project', description: null, status: 'ACTIVE', projectRole: 'MANAGER', createdAt: '2026-10-27T00:00:00Z', startDate: null, endDate: null }
async function fixtures(page: Page, mode: 'empty' | 'error' = 'empty', role = 'ADMIN') {
  await page.addInitScript(({ role }) => {
    localStorage.setItem('mytaiga_access_token', 'synthetic-browser-only')
    localStorage.setItem('mytaiga_user_info', JSON.stringify({ userId: 7, fullName: 'QA Synthetic', email: 'qa@example.test', systemRole: role }))
    localStorage.setItem('mytaiga_active_project_id', '1')
  }, { role })
  await page.route('**/hubs/**', route => route.abort())
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url())
    const p = url.pathname.replace('/api/v1', '')
    if (p !== '/users/me' && p !== '/projects/1' && mode === 'error') return route.fulfill({ status: 500, json: { success: false, message: 'QA simulated server error', data: null } })
    let data: unknown = { items: [], total: 0, page: 1, pageSize: 20 }
    if (p === '/users/me') data = { ...profile, systemRole: role }
    else if (p === '/projects') data = { items: [project], total: 1, page: 1, pageSize: 20 }
    else if (p === '/projects/1') data = project
    else if (p.endsWith('/board')) data = { projectId: 1, columns: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((columnName, i) => ({ boardColumnId: i + 1, columnName, position: i, wipLimit: null, tasks: [], taskCount: 0 })), page: 1, pageSize: 20 }
    else if (p === '/chat/rooms') data = []
    else if (p.endsWith('/messages')) data = { items: [], hasMore: false, nextBefore: null }
    else if (p.endsWith('/unread-count')) data = { unreadCount: 0 }
    else if (p === '/admin/system-config') data = [{ configKey: 'MAX_FILE_SIZE_MB', configValue: '25', description: null, updatedAt: null }]
    else if (p.endsWith('/flow-metrics/wip')) data = { wip: 0, inProgress: 0, inReview: 0 }
    else if (p.endsWith('/throughput')) data = { totalDoneTasks: 0, points: [], from: '2026-10-01', to: '2026-10-27' }
    else if (p.endsWith('/average')) data = { averageCycleTimeDays: null, validTasks: 0 }
    return route.fulfill({ status: 200, json: { success: true, message: 'QA fixture', data } })
  })
}

for (const route of ['/projects', '/profile', '/chat', '/notifications', '/activity', '/admin/users', '/admin/roles', '/admin/settings', '/admin/logs', ...['dashboard', 'kanban', 'backlog', 'sprints', 'epics', 'bugs', 'metrics', 'members'].map(p => `/projects/1/${p}`)]) {
  for (const mode of ['empty', 'error'] as const) {
    test(`mock ${mode}: ${route} renders without uncaught errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', e => errors.push(e.message))
      await fixtures(page, mode)
      await page.goto(route)
      await expect(page.locator('main').first()).toBeVisible()
      await expect(page.getByText('Đang khôi phục phiên đăng nhập...')).toHaveCount(0)
      await expect(page.locator('main').first()).not.toBeEmpty()
      await page.waitForLoadState('networkidle')
      expect(errors).toEqual([])
      await expect(page.getByText('Unexpected Application Error!', { exact: true })).toHaveCount(0)
    })
  }
}
for (const route of ['/projects/1/dashboard', '/admin/roles', '/profile']) {
  test(`anonymous direct URL ${route} redirects to login`, async ({ page }) => {
    await page.route('**/api/**', r => r.fulfill({ status: 401, body: '' }))
    await page.goto(route)
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })
}
for (const route of ['/login', '/register', '/forgot-password', '/reset-password', '/reset-sent', '/logged-out', '/account-locked']) {
  test(`public page ${route}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.route('**/api/**', r => r.fulfill({ status: 401, body: '' }))
    await page.goto(route)
    await expect(page.locator('#root')).not.toBeEmpty()
    expect(errors).toEqual([])
  })
}
test('restored member is denied admin content', async ({ page }) => {
  await fixtures(page, 'empty', 'USER')
  await page.goto('/admin/users')
  await expect(page.getByText('Không có quyền truy cập', { exact: true })).toBeVisible()
  await expect(page.getByText('Nhật ký Kiểm toán', { exact: true })).toHaveCount(0)
})
test('session restore loading does not render protected dashboard', async ({ page }) => {
  await fixtures(page)
  await page.route('**/api/v1/users/me', async route => {
    await new Promise(resolve => setTimeout(resolve, 800))
    await route.fulfill({ status: 200, json: { success: true, data: profile } })
  })
  await page.goto('/projects/1/dashboard')
  await expect(page.getByRole('status')).toContainText('Đang khôi phục phiên')
  await expect(page.locator('main')).toHaveCount(0)
  await expect(page.locator('main').first()).toBeVisible()
})
test('metrics initial query does not invent a sprint ID', async ({ page }) => {
  await fixtures(page)
  const sprintIds: string[] = []
  page.on('request', request => {
    const url = new URL(request.url())
    if (url.pathname.includes('/flow-metrics/')) sprintIds.push(url.searchParams.get('sprintId') || '')
  })
  await page.goto('/projects/1/metrics')
  await page.waitForLoadState('networkidle')
  expect(sprintIds.length).toBeGreaterThan(0)
  expect(sprintIds.every(id => id === '')).toBe(true)
})
