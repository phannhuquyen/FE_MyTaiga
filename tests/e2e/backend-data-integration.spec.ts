import { expect, test, type Page } from '@playwright/test'

async function fixtures(page: Page, configWrite?: (body: unknown) => void) {
  await page.addInitScript(() => {
    localStorage.setItem('mytaiga_access_token', 'synthetic-only')
    localStorage.setItem('mytaiga_active_project_id', '1')
  })
  await page.route('**/hubs/**', route => route.abort())
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url())
    const path = url.pathname.replace('/api/v1', '')
    let data: unknown = { items: [], total: 0, page: 1, pageSize: 100 }
    const rows = (items: unknown[]) => ({ items, total: items.length, page: 1, pageSize: 100 })
    if (path === '/users/me') data = { userId: 42, fullName: 'Admin from BE', email: 'admin@example.test', systemRole: 'ADMIN' }
    else if (path === '/projects/1') data = { projectId: 1, projectName: 'Actual project name', projectRole: 'MANAGER', status: 'ACTIVE' }
    else if (path === '/projects/1/members') data = rows([{ userId: 42, fullName: 'Actual assignee', projectRole: 'MANAGER' }, { userId: 99, fullName: 'Second assignee', projectRole: 'MEMBER' }])
    else if (path === '/sprints') data = rows([{ sprintId: 75, sprintName: 'Release from BE', status: 'ACTIVE', startDate: '2026-11-01', endDate: '2026-11-14', sprintGoal: 'Goal from BE' }])
    else if (path.endsWith('/board')) data = { columns: [{ boardColumnId: 1, columnName: 'TODO', wipLimit: null, hasMore: false, tasks: [
      { taskId: 5, title: 'My API task', assigneeId: 42, assigneeName: 'Actual assignee', priority: 'HIGH', status: 'TODO', position: 0 },
      { taskId: 6, title: 'Another API task', assigneeId: 99, assigneeName: 'Second assignee', priority: 'LOW', status: 'TODO', position: 1 },
    ] }] }
    else if (path.endsWith('/flow-metrics/wip')) data = { wip: 13, inProgress: 8, inReview: 5 }
    else if (path.endsWith('/flow-metrics/throughput')) data = { totalDoneTasks: 23, from: url.searchParams.get('from'), to: url.searchParams.get('to'), points: [{ date: '2026-11-01', doneTasks: 23, historyComplete: false }], hasPartialHistoricalCoverage: true, asOfUtc: '2026-11-10T00:00:00Z' }
    else if (path.endsWith('/flow-metrics/throughput/sprints')) data = rows([{ sprintId: 75, sprintName: 'Release from BE', doneTasks: 23, status: 'ACTIVE' }])
    else if (path.endsWith('/cycle-time/average')) data = { averageCycleTimeDays: null, validTasks: 0, skippedInvalidTasks: 2 }
    else if (path === '/admin/system-config') {
      if (route.request().method() !== 'GET') configWrite?.(route.request().postDataJSON())
      data = [
        { configKey: 'DEADLINE_WARNING_HOURS', configValue: '48' },
        { configKey: 'MAX_FILE_SIZE_MB', configValue: '17' },
        { configKey: 'MAX_FAILED_LOGIN', configValue: '7' },
        { configKey: 'JWT_EXPIRE_MINUTES', configValue: '95' },
      ]
    } else if (path === '/admin/activity-logs') data = rows([{ activityLogId: 8, userId: 42, userName: 'Admin from BE', action: 'SYSTEM_CONFIG_UPDATED', description: 'API config changed', createdAt: '2026-11-10T00:00:00Z' }])
    else if (path === '/chat/rooms') data = [{ chatRoomId: 71, projectId: 1, roomName: 'api-room', roomType: 'GROUP' }]
    else if (path === '/chat/rooms/71/messages') data = { items: url.searchParams.has('keyword')
      ? [{ messageId: 500, chatRoomId: 71, senderId: 42, senderName: 'API search sender', content: 'Found literal [ bracket', sentAt: '2026-11-10T00:00:00Z' }] : [], hasMore: false, nextBefore: null }
    else if (path.endsWith('/unread-count')) data = { unreadCount: 0 }
    return route.fulfill({ json: { success: true, message: '', data } })
  })
}

test('metrics use actual Sprint throughput and send a functional UTC date range', async ({ page }) => {
  await fixtures(page)
  await page.goto('/projects/1/metrics')
  await expect(page.getByText('Actual project name', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Throughput', exact: true }).click()
  await expect(page.getByText('Release from BE · ACTIVE')).toBeVisible()
  await expect(page.getByText(/Lịch sử chưa phủ đầy đủ khoảng ngày;/)).toBeVisible()
  const request = page.waitForRequest(request => request.url().includes('/flow-metrics/throughput?') && new URL(request.url()).searchParams.get('from') !== null)
  await page.getByRole('combobox').filter({ has: page.getByRole('option', { name: '30 ngày gần nhất' }) }).selectOption('last30')
  const url = new URL((await request).url())
  const duration = (Date.parse(url.searchParams.get('to')!) - Date.parse(url.searchParams.get('from')!)) / 86400000
  expect(duration).toBe(29)
  await expect(page.getByText('78.2%')).toHaveCount(0)
})

test('Kanban filters by real member ID and current user, with actual project and Sprint context', async ({ page }) => {
  await fixtures(page)
  await page.goto('/projects/1/kanban')
  await expect(page.getByRole('heading', { name: 'Actual project name' })).toBeVisible()
  await expect(page.getByText('Goal from BE')).toBeVisible()
  await expect(page.getByText('My API task', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Chỉ thẻ của tôi' }).click()
  await expect(page.getByText('Another API task', { exact: true })).toHaveCount(0)
  const select = page.getByRole('combobox').filter({ has: page.getByRole('option', { name: 'Tất cả thành viên' }) })
  await select.selectOption('99')
  await expect(page.getByText('Another API task', { exact: true })).toBeVisible()
  await expect(page.getByText('My API task', { exact: true })).toHaveCount(0)
})

test('settings load all four real values, save backend keys and display actual audit history', async ({ page }) => {
  const writes: unknown[] = []
  await fixtures(page, body => writes.push(body))
  await page.goto('/admin/settings')
  await expect(page.getByRole('spinbutton').filter({ hasNot: page.locator('[disabled]') }).first()).toHaveValue('48')
  await expect(page.getByRole('combobox')).toHaveValue('95 phút')
  await page.getByRole('button', { name: 'Lưu cấu hình hệ thống' }).click()
  await expect(page.getByText('Đã lưu thành công!')).toBeVisible()
  expect(writes).toEqual([{ values: { DEADLINE_WARNING_HOURS: '48', MAX_FILE_SIZE_MB: '17', MAX_FAILED_LOGIN: '7', JWT_EXPIRE_MINUTES: '95' } }])
  await page.getByRole('button', { name: 'Xem lịch sử thay đổi cấu hình' }).click()
  await expect(page.getByText('API config changed')).toBeVisible()
  await expect(page.getByText('14/10/2024 - 15:42')).toHaveCount(0)
})

test('Chat searches the server for literal special characters', async ({ page }) => {
  await fixtures(page)
  await page.goto('/projects/1/chat')
  await page.getByTitle('Tìm kiếm trong cuộc trò chuyện').click()
  const request = page.waitForRequest(request => new URL(request.url()).searchParams.get('keyword') === '[')
  await page.getByPlaceholder('Tìm kiếm nội dung tin nhắn trong dự án...').fill('[')
  await request
  await expect(page.getByText('API search sender', { exact: true })).toBeVisible()
  await expect(page.getByText('Unexpected Application Error!')).toHaveCount(0)
})
test('activity without a selected project requests selection instead of assuming project one', async ({ page }) => {
  await fixtures(page)
  await page.addInitScript(() => localStorage.removeItem('mytaiga_active_project_id'))
  const activityRequests: string[] = []
  page.on('request', request => { if (request.url().includes('/activity-logs')) activityRequests.push(request.url()) })
  await page.goto('/activity')
  await expect(page.getByText('Vui lòng chọn dự án để xem hoạt động.')).toBeVisible()
  expect(activityRequests).toEqual([])
})
