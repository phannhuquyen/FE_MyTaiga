import fs from 'node:fs'
import { expect, test, type Page, type BrowserContext } from '@playwright/test'

test.skip(!process.env.QA_TEST_PASSWORD, 'Supply QA_TEST_PASSWORD via ephemeral environment')
test.describe.configure({ timeout: 120000 })
let page: Page
let context: BrowserContext
let projectId: number
let memberId: number
const created: Record<string, number | string> = {}
const evidence: { operation: string; result: string; status?: number }[] = []
const manifestPath = 'docs/QA_TEST_DATASET.json'
const checkpointPath = 'node_modules/.tmp/qa-test-dataset.json'
const save = () => {
  fs.mkdirSync('node_modules/.tmp', { recursive: true })
  fs.writeFileSync(checkpointPath, JSON.stringify({ scope: 'User-approved isolated QA records; retained for inspection', projectId, created, evidence }, null, 2) + '\n')
}
async function call(group: string, method: string, ...args: unknown[]) {
  const result = await page.evaluate(async ({ group, method, args }) => {
    const modulePath = '/src/services/api.ts'
    const { api } = await import(modulePath)
    try {
      const response = await api[group][method](...args)
      return { ok: response.success === true, data: response.data }
    } catch (error) {
      return { ok: false, status: (error as { response?: { status?: number } }).response?.status }
    }
  }, { group, method, args })
  evidence.push({ operation: `${group}.${method}`, result: result.ok ? 'PASS' : 'FAIL', status: result.status })
  save()
  expect(result.ok, `${group}.${method}, HTTP ${result.status ?? 'unknown'}`).toBe(true)
  return result.data
}
test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  page = await context.newPage()
  await page.goto('/login')
  await page.locator('#email-input').fill('user1@gmail.com')
  await page.locator('#password-input').fill(process.env.QA_TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page).toHaveURL(/\/projects$/)
  await page.waitForLoadState('networkidle')
  if (fs.existsSync(manifestPath)) {
    const previous = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    projectId = previous.projectId
    Object.assign(created, previous.created)
  } else {
    const projectName = `QA-AUDIT-${Date.now()}`
    await page.getByRole('button', { name: 'Tạo dự án', exact: true }).click()
    await page.locator('#projectName').fill(projectName)
    await page.locator('#projectDesc').fill('Isolated user-approved QA dataset; retain for review')
    await page.locator('#startDate').fill('28/10/2026')
    await page.locator('#endDate').fill('11/11/2026')
    await page.getByRole('dialog').getByRole('button', { name: /Tạo dự án/ }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    evidence.push({ operation: 'projects.create', result: 'PASS', status: 201 })
    const projects = await call('projects', 'list', { keyword: projectName })
    projectId = projects.items[0].projectId
    created.projectName = projectName
    save()
  }
  const details = await call('projects', 'get', projectId)
  expect(details.projectName).toMatch(/^QA-AUDIT-/)
  const response = await page.request.post('http://localhost:5141/api/v1/auth/login', { data: { email: 'user2@gmail.com', password: process.env.QA_TEST_PASSWORD } })
  expect(response.status()).toBe(200)
  memberId = (await response.json()).data.user.userId
  await page.waitForLoadState('networkidle')
})
test.afterAll(async () => { save(); await context?.close(); fs.copyFileSync(checkpointPath, manifestPath) })

test('QA project: update and department/member lifecycle via FE API wrappers', async () => {
  await call('projects', 'update', projectId, { projectName: created.projectName, description: 'QA update verified', startDate: '2026-10-28', endDate: '2026-11-11' })
  const members = await call('projectMembers', 'list', projectId)
  if (!members.items.some((m: { userId: number }) => m.userId === memberId)) await call('projectMembers', 'add', projectId, { userId: memberId })
  const dept = await call('projectDepartments', 'create', projectId, { departmentName: `QA Department ${Date.now()}`, description: 'QA only' })
  created.departmentId = dept.departmentId; save()
  await call('projectDepartments', 'update', projectId, dept.departmentId, { departmentName: `QA Updated ${Date.now()}`, description: 'QA update' })
  await call('projectDepartments', 'assignMember', projectId, memberId, { departmentId: dept.departmentId })
  expect((await call('projectMembers', 'list', projectId)).items.find((m: { userId: number }) => m.userId === memberId).departmentId).toBe(dept.departmentId)
  await call('projectDepartments', 'assignMember', projectId, memberId, { departmentId: null })
  await call('projectDepartments', 'delete', projectId, dept.departmentId)
})

test('QA Epic and PBI: real backlog UI creation, response mapping and priority', async () => {
  const epic = await call('epics', 'create', projectId, { title: `QA Epic ${Date.now()}`, description: 'QA', priority: 2, status: 'OPEN' })
  created.epicId = epic.epicId; save()
  await page.goto(`/projects/${projectId}/backlog`)
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: /Tạo PBI|Thêm PBI/ }).first().click()
  const title = `QA PBI ${Date.now()}`
  await page.locator('#pbi-title').fill(title)
  await page.locator('#pbi-epic').selectOption(String(epic.epicId))
  await page.getByRole('dialog').getByRole('button', { name: 'Tạo PBI', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  evidence.push({ operation: 'productBacklog.create', result: 'PASS', status: 201 })
  // Dataset is retained across runs; locate the new row through the real search UI rather than assuming page one.
  await page.getByPlaceholder('Tìm kiếm theo tên hoặc mã PBI...').fill(title)
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible()
  const pbi = (await call('productBacklog', 'list', { projectId, keyword: title })).items[0]
  created.pbiId = pbi.pbiId; save()
  await call('productBacklog', 'update', pbi.pbiId, { epicId: epic.epicId, title: `${title} updated`, storyPoint: 5, priority: 2, status: 'READY' })
  await call('productBacklog', 'changePriority', pbi.pbiId, { priority: 1 })
  await call('productBacklog', 'reorder', { epicId: epic.epicId, pbiIds: [pbi.pbiId] })
  expect((await call('productBacklog', 'get', pbi.pbiId)).priority).toBe(1)
})

test('QA sprint: planning, start, progress, burndown and close', async () => {
  const sprint = await call('sprints', 'create', { projectId, sprintName: `QA Sprint ${Date.now()}`, sprintGoal: 'QA only', startDate: '2026-10-28', endDate: '2026-11-10' })
  created.sprintId = sprint.sprintId; save()
  if (created.pbiId) await call('sprints', 'addBacklogItems', sprint.sprintId, { pbiIds: [created.pbiId] })
  await call('sprints', 'start', sprint.sprintId)
  const progress = await call('sprints', 'progress', sprint.sprintId)
  expect(progress.totalPbis).toBe(created.pbiId ? 1 : 0)
  expect(Array.isArray((await call('sprints', 'burndown', sprint.sprintId)).points)).toBe(true)
  await page.goto(`/projects/${projectId}/sprints`)
  await expect(page.getByText(sprint.sprintName, { exact: true }).first()).toBeVisible()
  await call('sprints', 'close', sprint.sprintId)
  expect((await call('sprints', 'get', sprint.sprintId)).status).toBe('CLOSED')
})

test('QA task: create, update, assignee, deadline, board move, subtask and WIP', async () => {
  const task = await call('tasks', 'create', projectId, { title: `QA Task ${Date.now()}`, priority: 'HIGH', assigneeId: memberId })
  created.taskId = task.taskId; save()
  await call('tasks', 'update', task.taskId, { title: 'QA Task updated', description: 'QA details' })
  await call('tasks', 'setDeadline', task.taskId, { deadline: '2026-11-10T12:00:00Z' })
  await call('tasks', 'changePriority', task.taskId, { priority: 'CRITICAL' })
  await call('board', 'move', task.taskId, { toStatus: 'IN_PROGRESS', newPosition: 0 })
  await call('tasks', 'updateProgress', task.taskId, { progressPercent: 30 })
  const subtask = await call('tasks', 'createSubtask', task.taskId, { title: 'QA Subtask', priority: 'MEDIUM' })
  created.subtaskId = subtask.taskId; save()
  const detail = await call('tasks', 'get', task.taskId)
  expect(detail.task.title).toBe('QA Task updated')
  expect(detail.subtasks.length).toBeGreaterThan(0)
  const board = await call('board', 'get', projectId)
  const column = board.columns.find((c: { columnName: string }) => c.columnName === 'IN_PROGRESS')
  await call('wip', 'setLimit', projectId, column.boardColumnId, { wipLimit: 5 })
  await call('wip', 'getAlerts', projectId)
  await call('wip', 'removeLimit', projectId, column.boardColumnId)
  await page.goto(`/projects/${projectId}/kanban`)
  await expect(page.getByText('QA Task updated', { exact: true }).first()).toBeVisible()
})

test('QA task: comments and authenticated attachment upload/download/delete', async () => {
  const comment = await call('comments', 'createForTask', Number(created.taskId), { content: 'QA regression comment' })
  created.commentId = comment.commentId; save()
  await call('comments', 'update', comment.commentId, { content: 'QA updated comment' })
  expect((await call('comments', 'get', comment.commentId)).content).toBe('QA updated comment')
  const upload = await page.evaluate(async taskId => {
    const modulePath = '/src/services/api.ts'
    const { api } = await import(modulePath)
    const response = await api.attachments.uploadForTask(taskId, [new File(['QA safe test attachment'], 'qa-audit.txt', { type: 'text/plain' }), new File(['QA retained attachment'], 'qa-retained.txt', { type: 'text/plain' })])
    return response.data
  }, Number(created.taskId))
  const attachment = Array.isArray(upload) ? upload[0] : upload.items?.[0] || upload.attachments?.[0]
  expect(attachment?.attachmentId).toBeGreaterThan(0)
  evidence.push({ operation: 'attachments.uploadForTask', result: 'PASS', status: 201 })
  created.attachmentId = attachment.attachmentId; save()
  const bytes = await page.evaluate(async id => {
    const modulePath = '/src/services/api.ts'
    const { api } = await import(modulePath)
    return (await api.attachments.downloadBlob(id)).size
  }, attachment.attachmentId)
  expect(bytes).toBeGreaterThan(0)
  evidence.push({ operation: 'attachments.downloadBlob', result: 'PASS', status: 200 })
  await call('attachments', 'delete', attachment.attachmentId)
  await call('comments', 'delete', comment.commentId)
  const retainedComment = await call('comments', 'createForTask', Number(created.taskId), { content: 'QA retained response-shape sample' })
  created.commentId = retainedComment.commentId
  created.attachmentId = upload.attachments?.[1]?.attachmentId ?? upload.items?.[1]?.attachmentId ?? upload[1]?.attachmentId
  save()
})

test('QA bugs and metrics: full status workflow plus real response reads', async () => {
  const bug = await call('bugs', 'create', { taskId: created.taskId, title: 'QA Bug lifecycle', description: 'QA only', severity: 'MINOR', priority: 'HIGH' })
  created.bugId = bug.bugId; save()
  await call('bugs', 'assign', bug.bugId, { assigneeId: memberId })
  for (const status of ['IN_PROGRESS', 'RESOLVED']) await call('bugs', 'changeStatus', bug.bugId, { status })
  await call('bugs', 'close', bug.bugId)
  expect((await call('bugs', 'get', bug.bugId)).bug.status).toBe('CLOSED')
  await page.goto(`/projects/${projectId}/bugs`)
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('QA Bug lifecycle', { exact: true }).first()).toBeVisible()
  expect((await call('flowMetrics', 'wip', projectId)).wip).toBeGreaterThanOrEqual(0)
  expect((await call('flowMetrics', 'workItemAge', projectId, { minAgeDays: 0 })).items).toBeInstanceOf(Array)
  await call('activityLogs', 'listByProject', projectId)
})

test('QA chat: project room, participants, message persistence and FE adapter', async () => {
  const room = created.roomId ? { chatRoomId: created.roomId } : await call('chat', 'createRoom', { roomType: 'GROUP', projectId, roomName: `QA Chat ${Date.now()}`, participantIds: [memberId] })
  created.roomId = room.chatRoomId; save()
  const message = await call('chat', 'sendMessage', room.chatRoomId, { content: 'QA persisted chat message' })
  expect(message.messageId).toBeGreaterThan(0)
  const participants = await call('chat', 'listParticipants', room.chatRoomId)
  expect(participants.some((p: { userId: number }) => p.userId === memberId)).toBe(true)
  const mapped = await page.evaluate(async id => {
    const modulePath = '/src/features/chat/services/chatService.ts'
    const { chatService } = await import(modulePath)
    return (await chatService.fetchMessagesFromApi(String(id))).map((m: { id: string; content: string }) => ({ id: m.id, content: m.content }))
  }, room.chatRoomId)
  expect(mapped).toContainEqual({ id: String(message.messageId), content: 'QA persisted chat message' })
  await call('chat', 'markRead', room.chatRoomId)
  await call('chat', 'removeParticipant', room.chatRoomId, memberId)
  await call('chat', 'addParticipants', room.chatRoomId, [memberId])
  const fileMessage = await page.evaluate(async roomId => {
    const modulePath = '/src/services/api.ts'
    const { api } = await import(modulePath)
    const response = await api.chat.sendMessage(roomId, { content: 'QA file message' }, [new File(['QA chat attachment'], 'qa-chat.txt', { type: 'text/plain' })])
    return response.data
  }, Number(room.chatRoomId))
  expect(fileMessage.attachments[0].messageAttachmentId).toBeGreaterThan(0)
  const sizes = await page.evaluate(async id => {
    const modulePath = '/src/services/api.ts'
    const { api } = await import(modulePath)
    return [(await api.chat.downloadAttachmentBlob(id)).size, (await api.chat.previewAttachmentBlob(id)).size]
  }, fileMessage.attachments[0].messageAttachmentId)
  expect(sizes.every(size => size > 0)).toBe(true)
  evidence.push({ operation: 'chat.sendMessage (file)', result: 'PASS', status: 201 }, { operation: 'chat.downloadAttachmentBlob', result: 'PASS', status: 200 }, { operation: 'chat.previewAttachmentBlob', result: 'PASS', status: 200 })
  save()
})

test('QA disposable records: delete and project close/delete round trip', async () => {
  const epic = await call('epics', 'create', projectId, { title: `QA Disposable Epic ${Date.now()}`, priority: 3, status: 'OPEN' })
  await call('epics', 'delete', epic.epicId)
  const sprint = await call('sprints', 'create', { projectId, sprintName: `QA Disposable Sprint ${Date.now()}`, startDate: '2026-11-15', endDate: '2026-11-20' })
  await call('sprints', 'delete', sprint.sprintId)
  const task = await call('tasks', 'create', projectId, { title: `QA Disposable Task ${Date.now()}`, priority: 'LOW' })
  const bug = await call('bugs', 'create', { taskId: task.taskId, title: 'QA disposable bug', description: 'QA only', severity: 'TRIVIAL', priority: 'LOW' })
  await call('bugs', 'delete', bug.bugId)
  await call('tasks', 'delete', task.taskId)
  const disposable = await call('projects', 'create', { projectName: `QA-AUDIT-DISPOSABLE-${Date.now()}` })
  await call('projects', 'close', disposable.projectId)
  expect((await call('projects', 'get', disposable.projectId)).status).toBe('CLOSED')
  await call('projects', 'delete', disposable.projectId)
  expect((await call('projects', 'get', projectId)).status).toBe('ACTIVE')
})

test('QA new accounts: registration/admin create, lock/unlock only owned test user', async ({ browser }) => {
  await page.goto('/login')
  await page.locator('#email-input').fill('admin@scrumban.local')
  await page.locator('#password-input').fill(process.env.QA_TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page).toHaveURL(/\/admin\/users$/)
  await page.waitForLoadState('networkidle')
  for (const kind of ['register', 'admin'] as const) {
    let email: string | undefined
    let userId: number | undefined
    const savedEmail = created[`${kind}TestEmail`]
    const savedId = created[`${kind}TestUserId`]
    if (savedEmail && savedId) {
      email = String(savedEmail); userId = Number(savedId)
    } else {
      for (let n = 3; n <= 30; n++) {
        const candidate = `user${n}@gmail.com`
        const users = await call('admin', 'listUsers', { keyword: candidate, pageSize: 100 })
        if (!users.items.some((u: { email: string }) => u.email === candidate)) { email = candidate; break }
      }
      expect(email, 'available sequential QA account').toBeTruthy()
      const payload = { fullName: `QA Audit ${kind}`, email, password: process.env.QA_TEST_PASSWORD!, confirmPassword: process.env.QA_TEST_PASSWORD! }
      // Credential-bearing operations are not passed through the evidence helper.
      const body = await page.evaluate(async ({ kind, payload }) => {
        const modulePath = '/src/services/api.ts'
        const { api } = await import(modulePath)
        const response = kind === 'register' ? await api.auth.register(payload) : await api.admin.createUser(payload)
        return { success: response.success, userId: response.data.userId }
      }, { kind, payload })
      expect(body.success).toBe(true)
      userId = body.userId
      created[`${kind}TestEmail`] = email!
      created[`${kind}TestUserId`] = userId!
      evidence.push({ operation: kind === 'register' ? 'auth.register' : 'admin.createUser', result: 'PASS', status: 201 })
      save()
    }
    await call('adminUsers', 'lockUser', userId)
    try {
      const denied = await page.request.post('http://localhost:5141/api/v1/auth/login', { data: { email, password: process.env.QA_TEST_PASSWORD } })
      expect(denied.status()).toBe(403)
      const probeContext = await browser.newContext()
      const probe = await probeContext.newPage()
      try {
        await probe.goto('/login')
        await probe.locator('#email-input').fill(email!)
        await probe.locator('#password-input').fill(process.env.QA_TEST_PASSWORD!)
        await probe.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
        await expect(probe).toHaveURL(/\/account-locked\?email=/)
      } finally {
        await probeContext.close()
      }
    } finally {
      const recovery = await page.request.post('http://localhost:5141/api/v1/auth/login', { data: { email: 'admin@scrumban.local', password: process.env.QA_TEST_PASSWORD } })
      expect(recovery.status()).toBe(200)
      const recoveryToken = (await recovery.json()).data.accessToken
      const unlock = await page.request.patch(`http://localhost:5141/api/v1/admin/users/${userId}/unlock`, { headers: { Authorization: `Bearer ${recoveryToken}` } })
      evidence.push({ operation: 'adminUsers.unlockUser', result: unlock.status() === 200 ? 'PASS' : 'FAIL', status: unlock.status() })
      save()
      expect(unlock.status()).toBe(200)
    }
    const unlocked = await page.request.post('http://localhost:5141/api/v1/auth/login', { data: { email, password: process.env.QA_TEST_PASSWORD } })
    expect(unlocked.status()).toBe(200)
  }
})
