import fs from 'node:fs'
import { expect, test, type Page, type BrowserContext } from '@playwright/test'

test.skip(!process.env.QA_TEST_PASSWORD, 'Requires supplied QA credentials')
test.use({ actionTimeout: 12000, navigationTimeout: 20000 })
test.setTimeout(45000)
const prefix = `QA-FE-${process.env.QA_PROJECT_RUN_ID || Date.now()}`
const projectId = 1
let page: Page
let context: BrowserContext
const created: Record<string, number | string> = {}
// Keep per-test checkpoints outside Vite's watched source tree.
const outputPath = 'node_modules/.tmp/project-workflow-live-results.json'
async function login(target: Page, email: string) {
  await target.goto('/login')
  await target.locator('#email-input').fill(email)
  await target.locator('#password-input').fill(process.env.QA_TEST_PASSWORD!)
  await target.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(target).toHaveURL(/\/projects$/)
  await target.waitForLoadState('networkidle')
}
async function call(target: Page, group: string, method: string, ...args: unknown[]) {
  const result = await target.evaluate(async ({ group, method, args }) => {
    const path = '/src/services/api.ts'
    const { api } = await import(path)
    try { const response = await api[group][method](...args); return { success: response.success, data: response.data } }
    catch (e) { return { success: false, status: (e as { response?: { status?: number } }).response?.status } }
  }, { group, method, args })
  expect(result.success, `${group}.${method}: HTTP ${result.status || 'unknown'}`).toBe(true)
  return result.data
}
test.beforeAll(async ({ browser }) => {
  if (fs.existsSync(outputPath)) {
    const saved = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
    if (saved.prefix === prefix) Object.assign(created, saved.created)
  }
  context = await browser.newContext()
  page = await context.newPage()
  page.setDefaultTimeout(12000)
  await login(page, 'user1@gmail.com')
  const project = await call(page, 'projects', 'get', projectId)
  expect(project.projectName).toBe('Project So 1'); expect(project.status).toBe('ACTIVE'); expect(project.projectRole).toBe('MANAGER')
})
test.afterEach(async ({ page: _unused }, info) => {
  fs.mkdirSync('node_modules/.tmp', { recursive: true })
  const old = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, 'utf8')) : { scenarios: [] }
  fs.writeFileSync(outputPath, JSON.stringify({ projectId, prefix, created, scenarios: [...old.scenarios, { name: info.title, status: info.status, at: new Date().toISOString() }] }, null, 2))
})
test.afterAll(async () => { await context?.close() })

test('Project So 1: create Epic from FE and read back persisted data', async () => {
  await page.goto('/projects/1/epics'); await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Tạo', exact: true }).click()
  const modal = page.getByRole('dialog')
  const name = `${prefix} Epic`
  await modal.getByPlaceholder('Ví dụ: Cổng xác thực & Quản lý danh tính (IAM)...').fill(name)
  const response = page.waitForResponse(r => r.url().endsWith('/projects/1/epics') && r.request().method() === 'POST')
  await modal.getByRole('button', { name: 'Tạo Epic', exact: true }).click()
  const saved = await response; expect(saved.status()).toBe(201)
  created.epicId = (await saved.json()).data.epicId
  await expect(modal).toHaveCount(0)
  expect((await call(page, 'epics', 'get', created.epicId)).title).toBe(name)
})

test('Project So 1: create Backlog from FE with a real Epic', async () => {
  expect(created.epicId).toBeTruthy()
  await page.goto('/projects/1/backlog'); await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Tạo', exact: true }).click()
  const modal = page.getByRole('dialog')
  const name = `${prefix} Backlog`
  await modal.locator('#pbi-title').fill(name)
  await modal.locator('#pbi-epic').selectOption(String(created.epicId))
  const response = page.waitForResponse(r => r.url().endsWith('/product-backlog-items') && r.request().method() === 'POST')
  await modal.getByRole('button', { name: 'Tạo PBI', exact: true }).click()
  const saved = await response; expect(saved.status()).toBe(201)
  created.pbiId = (await saved.json()).data.pbiId
  await expect(modal).toHaveCount(0)
  expect((await call(page, 'productBacklog', 'get', created.pbiId)).title).toBe(name)
})

test('Project So 1: create Sprint from FE with valid dates', async () => {
  const sprints = await call(page, 'sprints', 'list', { projectId, pageSize: 100 })
  const last = Math.max(Date.now(), ...sprints.items.map((item: { endDate: string }) => new Date(item.endDate).getTime()))
  const start = new Date(last + 2 * 86400000).toISOString().slice(0, 10)
  const end = new Date(last + 12 * 86400000).toISOString().slice(0, 10)
  await page.goto('/projects/1/sprints'); await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Tạo', exact: true }).click()
  const modal = page.getByRole('dialog')
  await modal.getByRole('textbox').nth(0).fill(`${prefix} Sprint`)
  await modal.getByRole('textbox').nth(1).fill('Xác minh persist từ FE')
  await modal.getByLabel('Ngày bắt đầu', { exact: true }).fill(start)
  await modal.getByLabel('Ngày kết thúc', { exact: true }).fill(end)
  const response = page.waitForResponse(r => r.url().endsWith('/sprints') && r.request().method() === 'POST')
  await modal.getByRole('button', { name: 'Tạo Sprint', exact: true }).click()
  const saved = await response; expect(saved.status()).toBe(201)
  created.sprintId = (await saved.json()).data.sprintId
  await expect(modal).toHaveCount(0)
  expect((await call(page, 'sprints', 'get', created.sprintId)).startDate).toBe(start)
})

test('Project So 1: create Kanban Task from FE and assign a real member', async () => {
  const directory = await call(page, 'users', 'search', { keyword: 'user2@gmail.com' })
  const memberId = directory.items.find((item: { email: string }) => item.email === 'user2@gmail.com').userId
  await page.goto('/projects/1/kanban'); await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Tạo', exact: true }).click()
  const modal = page.getByRole('dialog')
  await modal.getByPlaceholder('Viết kịch bản tự động kiểm thử tải k6 cho API Gateway').fill(`${prefix} Kanban`)
  await modal.getByLabel('Người thực hiện', { exact: true }).selectOption(String(memberId))
  const response = page.waitForResponse(r => r.url().endsWith('/projects/1/tasks') && r.request().method() === 'POST')
  await modal.getByRole('button', { name: '+ Tạo Task', exact: true }).click()
  const saved = await response; expect(saved.status()).toBe(201)
  created.taskId = (await saved.json()).data.taskId
  await expect(modal).toHaveCount(0)
  expect((await call(page, 'tasks', 'get', created.taskId)).task.assigneeId).toBe(memberId)
})

test('Project So 1: create Bug from FE linked to the QA Task', async () => {
  expect(created.taskId).toBeTruthy()
  await page.goto('/projects/1/bugs'); await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Tạo', exact: true }).click()
  const modal = page.getByRole('dialog')
  await modal.getByLabel('Task liên quan', { exact: true }).selectOption(String(created.taskId))
  await modal.locator('input[type=text]').first().fill(`${prefix} Bug`)
  const response = page.waitForResponse(r => r.url().endsWith('/bugs') && r.request().method() === 'POST')
  await modal.getByRole('button', { name: 'Gửi báo cáo Bug', exact: true }).click()
  const saved = await response; expect(saved.status()).toBe(201)
  created.bugId = (await saved.json()).data.bugId
  await expect(modal).toHaveCount(0)
  expect((await call(page, 'bugs', 'get', created.bugId)).bug.taskId).toBe(created.taskId)
})

test('Project So 1: Dashboard creates Task/Story/Bug and displays database activity/detail', async () => {
  expect(created.taskId).toBeTruthy(); expect(created.epicId).toBeTruthy()
  for (const type of ['Task', 'Story', 'Bug']) {
    await page.goto('/projects/1/dashboard'); await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Thêm công việc', exact: true }).click()
    const modal = page.getByRole('dialog')
    const name = `${prefix} Dashboard ${type}`
    await modal.getByLabel('Tiêu đề công việc', { exact: true }).fill(name)
    await modal.getByLabel('Phân loại', { exact: true }).selectOption(type)
    if (type === 'Story') await modal.getByLabel('Epic liên quan', { exact: true }).selectOption(String(created.epicId))
    if (type === 'Bug') await modal.getByLabel('Task liên quan', { exact: true }).selectOption(String(created.taskId))
    const endpoint = type === 'Task' ? '/projects/1/tasks' : type === 'Story' ? '/product-backlog-items' : '/bugs'
    const response = page.waitForResponse(r => r.url().endsWith(endpoint) && r.request().method() === 'POST')
    await modal.getByRole('button', { name: 'Tạo công việc', exact: true }).click()
    const saved = await response; expect(saved.status()).toBe(201)
    const data = (await saved.json()).data
    created[`dashboard${type}Id`] = type === 'Task' ? data.taskId : type === 'Story' ? data.pbiId : data.bugId
    await expect(modal).toHaveCount(0)
    await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible()
  }
})

test('Project So 1: update QA Task on FE; independent user2 sees persisted work and activity', async ({ browser }) => {
  expect(created.taskId).toBeTruthy()
  await page.goto(`/projects/1/kanban?id=${created.taskId}`); await page.waitForLoadState('networkidle')
  await page.getByTitle('Sửa tiêu đề', { exact: true }).click()
  const titleInput = page.getByLabel('Tiêu đề tác vụ', { exact: true })
  await titleInput.fill(`${prefix} Updated Task`)
  const response = page.waitForResponse(r => r.url().endsWith(`/tasks/${created.taskId}`) && r.request().method() === 'PUT')
  await titleInput.press('Enter')
  expect((await response).status()).toBe(200)
  const other = await browser.newContext()
  try {
    const user2 = await other.newPage()
    await login(user2, 'user2@gmail.com')
    expect((await call(user2, 'tasks', 'get', created.taskId)).task.title).toBe(`${prefix} Updated Task`)
    for (const [feature, id] of [['epics', created.epicId], ['backlog', created.pbiId], ['sprints', created.sprintId], ['kanban', created.taskId], ['bugs', created.bugId]]) {
      await user2.goto(`/projects/1/${feature}`)
      await expect(user2.getByText('Không thể truy cập dự án. Dự án không tồn tại, bạn không có quyền hoặc kết nối bị lỗi.', { exact: true })).toHaveCount(0)
      expect(id).toBeTruthy()
    }
    await user2.goto('/projects/1/dashboard')
    await expect(user2.getByRole('row').filter({ hasText: `${prefix} Updated Task` })).toBeVisible()
    for (const type of ['Task', 'Story', 'Bug']) await expect(user2.getByRole('row').filter({ hasText: `${prefix} Dashboard ${type}` })).toBeVisible()
    await user2.getByRole('row').filter({ hasText: `${prefix} Updated Task` }).click()
    await expect(user2.getByRole('heading', { name: `${prefix} Updated Task`, exact: true })).toBeVisible()
    await expect(user2.getByText('Lịch sử cập nhật dự án', { exact: true })).toBeVisible()
    const activity = await call(user2, 'activityLogs', 'listByProject', projectId, { pageSize: 100 })
    expect(activity.items.some((item: { entityId: number }) => item.entityId === created.taskId)).toBe(true)
  } finally { await other.close() }
})

test('Project So 1: update Epic, Backlog, Sprint and Bug through FE forms', async ({ browser }) => {
  expect(created.epicId).toBeTruthy(); expect(created.pbiId).toBeTruthy(); expect(created.sprintId).toBeTruthy(); expect(created.bugId).toBeTruthy()
  await page.goto(`/projects/1/epics?id=${created.epicId}`); await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).click()
  let modal = page.getByRole('dialog')
  await modal.getByRole('textbox').first().fill(`${prefix} Updated Epic`)
  let response = page.waitForResponse(r => r.url().endsWith(`/epics/${created.epicId}`) && r.request().method() === 'PUT')
  await modal.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click()
  expect((await response).status()).toBe(200)
  await expect(modal).toHaveCount(0)

  await page.goto(`/projects/1/backlog?id=${created.pbiId}`); await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).click()
  await page.locator('textarea').first().fill(`${prefix} persisted description`)
  response = page.waitForResponse(r => r.url().endsWith(`/product-backlog-items/${created.pbiId}`) && r.request().method() === 'PUT')
  await page.getByRole('button', { name: 'Lưu', exact: true }).click()
  expect((await response).status()).toBe(200)

  const sprint = await call(page, 'sprints', 'get', created.sprintId)
  await page.goto('/projects/1/sprints'); await page.waitForLoadState('networkidle')
  await page.getByRole('heading', { name: sprint.sprintName, exact: true }).click()
  await page.getByRole('button', { name: 'Chỉnh sửa Sprint', exact: true }).click()
  modal = page.getByRole('dialog')
  await modal.getByRole('textbox').first().fill(`${prefix} Updated Sprint`)
  response = page.waitForResponse(r => r.url().endsWith(`/sprints/${created.sprintId}`) && r.request().method() === 'PUT')
  await modal.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click()
  expect((await response).status()).toBe(200)
  await expect(modal).toHaveCount(0)

  await page.goto(`/projects/1/bugs?id=${created.bugId}`); await page.waitForLoadState('networkidle')
  response = page.waitForResponse(r => r.url().endsWith(`/bugs/${created.bugId}/status`) && r.request().method() === 'PATCH')
  await page.getByRole('button', { name: /Đang xử lý.*Chuyển sang phân tích/ }).click()
  expect((await response).status()).toBe(200)
  const other = await browser.newContext()
  try {
    const user2 = await other.newPage(); await login(user2, 'user2@gmail.com')
    expect((await call(user2, 'epics', 'get', created.epicId)).title).toBe(`${prefix} Updated Epic`)
    expect((await call(user2, 'productBacklog', 'get', created.pbiId)).description).toBe(`${prefix} persisted description`)
    expect((await call(user2, 'sprints', 'get', created.sprintId)).sprintName).toBe(`${prefix} Updated Sprint`)
    expect((await call(user2, 'bugs', 'get', created.bugId)).bug.status).toBe('IN_PROGRESS')
  } finally { await other.close() }
})

test('Project So 1: Dashboard comment is saved and visible to user2', async ({ browser }) => {
  const task = (await call(page, 'tasks', 'get', created.taskId)).task
  await page.goto('/projects/1/dashboard'); await page.waitForLoadState('networkidle')
  await page.getByRole('row').filter({ hasText: task.title }).click()
  const input = page.getByPlaceholder('Nhập phản hồi nhanh...')
  await expect(input).toBeEnabled()
  const content = `${prefix} shared comment`
  await input.fill(content)
  const response = page.waitForResponse(r => r.url().endsWith(`/tasks/${created.taskId}/comments`) && r.request().method() === 'POST')
  await page.getByTitle('Gửi phản hồi', { exact: true }).click()
  expect((await response).status()).toBe(201)
  await expect(page.getByText(content, { exact: true })).toBeVisible()
  const other = await browser.newContext()
  try {
    const user2 = await other.newPage(); await login(user2, 'user2@gmail.com')
    await user2.goto('/projects/1/dashboard')
    await user2.getByRole('row').filter({ hasText: task.title }).click()
    await expect(user2.getByText(content, { exact: true })).toBeVisible()
  } finally { await other.close() }
})

test('Project So 1: Sprint planning persists the real Backlog link and user2 can read it', async ({ browser }) => {
  const _pbi = await call(page, 'productBacklog', 'get', created.pbiId)
  const sprint = await call(page, 'sprints', 'get', created.sprintId)
  await page.goto('/projects/1/sprints'); await page.waitForLoadState('networkidle')
  await page.getByRole('heading', { name: sprint.sprintName, exact: true }).click()
  const row = page.locator('div.flex.items-center.justify-between').filter({ has: page.getByText(`SB-${created.pbiId}`, { exact: true }) }).filter({ has: page.getByTitle('Đưa vào Sprint', { exact: true }) }).last()
  const response = page.waitForResponse(r => r.url().endsWith(`/sprints/${created.sprintId}/backlog-items`) && r.request().method() === 'POST')
  await row.getByTitle('Đưa vào Sprint', { exact: true }).click()
  expect((await response).status()).toBe(200)
  await page.goto(`/projects/1/backlog?id=${created.pbiId}`); await page.waitForLoadState('networkidle')
  await expect(page.getByLabel('Sprint của Backlog', { exact: true })).toHaveValue(String(created.sprintId))
  const other = await browser.newContext()
  try {
    const user2 = await other.newPage(); await login(user2, 'user2@gmail.com')
    const progress = await call(user2, 'sprints', 'progress', created.sprintId)
    expect(progress.items.some((item: { pbiId: number }) => item.pbiId === created.pbiId)).toBe(true)
  } finally { await other.close() }
})

test('Project So 1: Kanban initial column and selected deadline survive a reload', async () => {
  await page.goto('/projects/1/kanban'); await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Tạo', exact: true }).click()
  const modal = page.getByRole('dialog')
  const name = `${prefix} Kanban date and column`
  await modal.getByPlaceholder('Viết kịch bản tự động kiểm thử tải k6 cho API Gateway').fill(name)
  await modal.getByLabel('Hạn chót', { exact: true }).fill('2027-01-01')
  await modal.locator('select').last().selectOption('in_progress')
  const response = page.waitForResponse(r => r.url().endsWith('/projects/1/tasks') && r.request().method() === 'POST')
  await modal.getByRole('button', { name: '+ Tạo Task', exact: true }).click()
  const saved = await response; expect(saved.status()).toBe(201)
  created.columnTaskId = (await saved.json()).data.taskId
  await expect(modal).toHaveCount(0)
  const persisted = (await call(page, 'tasks', 'get', created.columnTaskId)).task
  expect(persisted.status).toBe('IN_PROGRESS')
  expect(new Date(persisted.deadline).getTime()).toBe(new Date('2027-01-01T23:59:00+07:00').getTime())
  await page.reload()
  const board = await call(page, 'board', 'get', 1)
  expect(board.columns.find((column: { columnName: string }) => column.columnName === 'IN_PROGRESS').tasks.some((task: { taskId: number }) => task.taskId === created.columnTaskId)).toBe(true)
})

test('Project So 1: assign a Bug to real user2 from FE and show the saved assignee', async ({ browser }) => {
  await page.goto(`/projects/1/bugs?id=${created.bugId}`); await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: /Giao lại|Thay đổi/ }).first().click()
  const directory = await call(page, 'users', 'search', { keyword: 'user2@gmail.com' })
  const user = directory.items.find((item: { email: string }) => item.email === 'user2@gmail.com')
  await page.getByPlaceholder('Tìm thành viên...').fill(user.fullName)
  const response = page.waitForResponse(r => r.url().endsWith(`/bugs/${created.bugId}/assignee`) && r.request().method() === 'PATCH')
  await page.getByRole('button', { name: new RegExp(user.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).last().click()
  expect((await response).status()).toBe(200)
  const other = await browser.newContext()
  try {
    const user2 = await other.newPage(); await login(user2, 'user2@gmail.com')
    expect((await call(user2, 'bugs', 'get', created.bugId)).bug.assigneeId).toBe(user.userId)
    await user2.goto(`/projects/1/bugs?id=${created.bugId}`); await user2.waitForLoadState('networkidle')
    await expect(user2.getByText(user.fullName, { exact: true }).first()).toBeVisible()
  } finally { await other.close() }
})

