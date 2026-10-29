import fs from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

test.skip(!process.env.QA_TEST_PASSWORD, 'Requires local QA credentials')
test.use({ actionTimeout: 10000, navigationTimeout: 20000 })
const imagePath = 'C:/Users/phann/OneDrive/Pictures/Screenshots/Screenshot 2026-06-23 132150.png'
const dataset = JSON.parse(fs.readFileSync('docs/QA_TEST_DATASET.json', 'utf8'))
const projectId = dataset.projectId as number
const stamp = Date.now()
const evidence: { scenario: string; result: string; detail?: string }[] = []
const retained: Record<string, number | string> = {}
test.afterEach(async ({ page: _page }, info) => {
  evidence.push({ scenario: info.title, result: info.status === 'passed' ? 'PASS' : 'FAIL', detail: info.error ? 'See test runner assertion; no raw responses retained' : undefined })
  const path = 'docs/QA_API_UPDATE_LIVE_RESULTS.json'
  const previous = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : { evidence: [], retained: {} }
  const latest = new Map([...previous.evidence, ...evidence].map((e: { scenario: string }) => [e.scenario, e]))
  fs.writeFileSync(path, JSON.stringify({ generatedAt: new Date().toISOString(), projectId, retained: { ...previous.retained, ...retained }, evidence: [...latest.values()] }, null, 2))
})
async function login(page: Page, email = 'user1@gmail.com') {
  await page.goto('/login')
  await page.locator('#email-input').fill(email)
  await page.locator('#password-input').fill(process.env.QA_TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page).toHaveURL(/\/projects$/)
}
async function call(page: Page, group: string, method: string, ...args: unknown[]) {
  const result = await page.evaluate(async ({ group, method, args }) => {
    const modulePath = '/src/services/api.ts'
    const { api } = await import(modulePath)
    try { return { ok: true, body: await api[group][method](...args) } }
    catch (e) { return { ok: false, status: (e as { response?: { status?: number } }).response?.status } }
  }, { group, method, args })
  expect(result.ok, `${group}.${method} HTTP ${result.status || 'unknown'}`).toBe(true)
  return result.body.data
}
async function upload(page: Page, target: 'task' | 'chat', id: number) {
  // The only image bytes used by this suite come from the user's exact file.
  const bytes = fs.readFileSync(imagePath).toString('base64')
  const result = await page.evaluate(async ({ bytes, target, id }) => {
    const modulePath = '/src/services/api.ts'
    const { api } = await import(modulePath)
    const file = new File([Uint8Array.from(atob(bytes), c => c.charCodeAt(0))], 'Screenshot 2026-06-23 132150.png', { type: 'image/png' })
    try {
      const res = target === 'task' ? await api.attachments.uploadForTask(id, [file]) : await api.chat.sendMessage(id, { content: 'QA delta image' }, [file])
      return { ok: true, data: res.data }
    } catch (e) { return { ok: false, status: (e as { response?: { status?: number } }).response?.status } }
  }, { bytes, target, id })
  expect(result.ok, `Image upload ${target} HTTP ${result.status || 'unknown'}`).toBe(true)
  return result.data
}
async function assertImage(page: Page, url: string) {
  // Return only booleans: signed cloud URLs must never enter test logs.
  expect(typeof url === 'string' && /^https:\/\//.test(url), 'HTTPS cloud URL').toBe(true)
  expect(await page.evaluate(async src => {
    const img = new Image(); img.src = src
    try { await img.decode(); return img.naturalWidth > 0 && img.naturalHeight > 0 } catch { return false }
  }, url), 'Image decodes in Chromium').toBe(true)
}

test('delta directory: real USER query, trim, empty, pagination, validation and admin denial', async ({ page }) => {
  await login(page)
  const result = await call(page, 'users', 'search', { keyword: ' user5@gmail.com ', page: 1, pageSize: 20 })
  expect(result.items.some((u: { email: string }) => u.email === 'user5@gmail.com')).toBe(true)
  for (const user of result.items) expect(Object.keys(user).sort()).toEqual(['avatarUrl', 'email', 'fullName', 'userId'])
  expect((await call(page, 'users', 'search', { keyword: `no-such-${stamp}` })).total).toBe(0)
  const first = await call(page, 'users', 'search', { page: 1, pageSize: 1 })
  const second = await call(page, 'users', 'search', { page: 2, pageSize: 1 })
  expect(first.items[0].userId).not.toBe(second.items[0].userId)
  const statuses = await page.evaluate(async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('mytaiga_access_token')}` }
    return Promise.all(['/users?pageSize=101', '/users?page=0', '/users?keyword=' + 'a'.repeat(201), '/admin/users?keyword=user5'].map(async path => (await fetch('/api/v1' + path, { headers })).status))
  })
  expect(statuses).toEqual([400, 400, 400, 403])
})

test('delta Members UI: search and add real user5 in authorized QA project', async ({ page }) => {
  await login(page)
  expect((await call(page, 'projects', 'get', projectId)).projectName.startsWith('QA-AUDIT-')).toBe(true)
  const users = await call(page, 'users', 'search', { keyword: 'user5@gmail.com' })
  const userId = users.items.find((u: { email: string }) => u.email === 'user5@gmail.com').userId
  retained.memberId = userId
  const members = await call(page, 'projectMembers', 'list', projectId)
  await page.goto(`/projects/${projectId}/members`)
  await page.getByRole('button', { name: 'Thêm thành viên', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByPlaceholder('Nhập họ tên, email hoặc mã nhân viên...').fill('user5@gmail.com')
  await expect(dialog.getByText('user5@gmail.com', { exact: false })).toBeVisible()
  await dialog.getByText('user5@gmail.com', { exact: false }).click()
  if (members.items.some((u: { userId: number }) => u.userId === userId)) {
    await expect(dialog.getByRole('button', { name: /Thêm thành viên/ })).toBeDisabled()
    await dialog.getByRole('button', { name: 'Đóng', exact: true }).click()
  } else {
    const response = page.waitForResponse(r => r.url().endsWith(`/projects/${projectId}/members`) && r.request().method() === 'POST')
    await dialog.getByRole('button', { name: /Thêm thành viên/ }).click()
    expect((await response).status()).toBe(201)
    await expect(dialog).toHaveCount(0)
  }
  const saved = await call(page, 'projectMembers', 'list', projectId)
  expect(saved.items.find((u: { userId: number }) => u.userId === userId)?.projectRole).toBe('MEMBER')
  await page.reload()
  await expect(page.getByText('user5@gmail.com', { exact: true })).toBeVisible()
})

test('delta data: Epic color, Task enriched fields/tags/points, comment author, board and activity', async ({ page }) => {
  await login(page)
  const epic = await call(page, 'epics', 'create', projectId, { title: `QA delta Epic ${stamp}`, priority: 2, status: 'OPEN', color: '#276749' })
  retained.epicId = epic.epicId
  expect((await call(page, 'epics', 'get', epic.epicId)).color).toBe('#276749')
  const users = await call(page, 'users', 'search', { keyword: 'user2@gmail.com' })
  const userId = users.items[0].userId
  const task = await call(page, 'tasks', 'create', projectId, { title: `QA delta Task ${stamp}`, priority: 'HIGH', assigneeId: userId, epicId: epic.epicId, tags: ['qa-delta'], storyPoints: 3 })
  retained.taskId = task.taskId
  const detail = (await call(page, 'tasks', 'get', task.taskId)).task
  expect(detail.tags).toEqual(['qa-delta']); expect(detail.storyPoints).toBe(3)
  expect(detail.assignee.userId).toBe(userId); expect(detail.assignee.fullName.length).toBeGreaterThan(0)
  expect(detail.epic.color).toBe('#276749')
  expect(typeof detail.updatedAtFormatted).toBe('string')
  const comment = await call(page, 'comments', 'createForTask', task.taskId, { content: 'QA delta author contract' })
  retained.commentId = comment.commentId
  const saved = await call(page, 'comments', 'get', comment.commentId)
  expect(saved.author.fullName.length).toBeGreaterThan(0); expect(saved.isEditable).toBe(true)
  const board = await call(page, 'board', 'get', projectId)
  expect(board.columns.flatMap((c: { tasks: unknown[] }) => c.tasks).some((t: { taskId: number }) => t.taskId === task.taskId)).toBe(true)
  const logs = await call(page, 'activityLogs', 'listByProject', projectId, { pageSize: 100 })
  expect(logs.items.length).toBeGreaterThan(0)
  expect(logs.items.some((l: { userName?: string }) => typeof l.userName === 'string')).toBe(true)
})

test('delta task image: exact PNG upload, metadata, signed preview and download', async ({ page }) => {
  await login(page)
  const task = await call(page, 'tasks', 'create', projectId, { title: `QA delta image ${stamp}`, priority: 'LOW' })
  retained.imageTaskId = task.taskId
  const data = await upload(page, 'task', task.taskId)
  const item = data.items[0]; retained.attachmentId = item.attachmentId
  const metadata = await call(page, 'attachments', 'get', item.attachmentId)
  expect(metadata.originalFileName).toBe('Screenshot 2026-06-23 132150.png')
  expect(metadata.mimeType).toBe('image/png'); expect(metadata.fileSizeBytes).toBe(fs.statSync(imagePath).size)
  await assertImage(page, metadata.previewUrl)
  await assertImage(page, metadata.downloadUrl)
})

test('delta Chat UI: create project room, send/edit message and retain after reload', async ({ page }) => {
  await login(page)
  await page.goto(`/projects/${projectId}/chat`)
  await page.getByTitle('Tạo kênh trao đổi mới', { exact: true }).click()
  const dialog = page.getByRole('dialog')
  const name = `qa-delta-${stamp}`; retained.roomName = name
  await dialog.getByPlaceholder('VD: Core Engineering & Release Squad').fill(name)
  const response = page.waitForResponse(r => r.url().endsWith('/chat/rooms') && r.request().method() === 'POST')
  await dialog.getByRole('button', { name: 'Tạo nhóm', exact: true }).click()
  const res = await response; expect(res.status()).toBe(201)
  retained.roomId = (await res.json()).data.chatRoomId
  await expect(dialog).toHaveCount(0)
  await page.getByText(`#${name}`, { exact: true }).first().click()
  await page.waitForLoadState('networkidle')
  const input = page.locator('textarea').last()
  await input.fill(`QA delta message ${stamp}`); await input.press('Enter')
  await expect(page.locator('p.whitespace-pre-wrap').filter({ hasText: `QA delta message ${stamp}` })).toBeVisible()
  await page.locator('div.group').filter({ has: page.getByText(`QA delta message ${stamp}`, { exact: true }) }).last().getByTitle('Chỉnh sửa tin nhắn', { exact: true }).click({ force: true })
  await page.locator('textarea').first().fill(`QA delta edited ${stamp}`)
  const editResponse = page.waitForResponse(r => r.url().includes(`/chat/rooms/${retained.roomId}/messages/`) && r.request().method() === 'PUT')
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click()
  expect((await editResponse).status()).toBe(200)
  await expect(page.locator('p.whitespace-pre-wrap').filter({ hasText: `QA delta edited ${stamp}` })).toBeVisible()
  await page.reload()
  await page.getByText(`#${name}`, { exact: true }).first().click()
  await expect(page.locator('p.whitespace-pre-wrap').filter({ hasText: `QA delta edited ${stamp}` })).toBeVisible()
})

test('delta Chat image and reply: backend metadata and FE history preservation', async ({ page }) => {
  await login(page)
  const room = await call(page, 'chat', 'createRoom', { roomType: 'GROUP', roomName: `qa-image-${stamp}`, projectId, participantIds: [] })
  retained.imageRoomId = room.chatRoomId
  const root = await call(page, 'chat', 'sendMessage', room.chatRoomId, { content: `QA root ${stamp}` })
  const reply = await call(page, 'chat', 'sendMessage', room.chatRoomId, { content: `QA reply ${stamp}`, replyToMessageId: root.messageId })
  expect(reply.replyToMessageId).toBe(root.messageId)
  const image = await upload(page, 'chat', room.chatRoomId)
  expect(image.attachments.length).toBe(1)
  await assertImage(page, image.attachments[0].previewUrl)
  const history = await call(page, 'chat', 'listMessages', room.chatRoomId)
  expect(history.items.some((m: { replyToMessageId: number }) => m.replyToMessageId === root.messageId)).toBe(true)
  await page.goto(`/projects/${projectId}/chat`)
  await page.getByText(`#qa-image-${stamp}`, { exact: true }).first().click()
  await expect(page.getByText('Screenshot 2026-06-23 132150.png', { exact: true })).toBeVisible()
  await expect(page.getByText(/Đang trả lời/).first()).toBeVisible()
})

test('delta Chat reply without cloud: persisted reply survives FE reload', async ({ page }) => {
  await login(page)
  const name = `qa-reply-${stamp}`
  const room = await call(page, 'chat', 'createRoom', { roomType: 'GROUP', roomName: name, projectId, participantIds: [] })
  retained.replyRoomId = room.chatRoomId
  const root = await call(page, 'chat', 'sendMessage', room.chatRoomId, { content: 'QA reply root' })
  await call(page, 'chat', 'sendMessage', room.chatRoomId, { content: 'QA persisted reply', replyToMessageId: root.messageId })
  await page.goto(`/projects/${projectId}/chat`)
  await page.getByText(`#${name}`, { exact: true }).first().click()
  await expect(page.locator('p.whitespace-pre-wrap').filter({ hasText: 'QA persisted reply' })).toBeVisible()
  await expect(page.getByText(/Đang trả lời/).first()).toBeVisible()
})

test('delta notifications: populated actor/alias response is not confused with recipient', async ({ page }) => {
  await login(page, 'user2@gmail.com')
  const response = await call(page, 'notifications', 'list', { pageSize: 100 })
  expect(response.items.length).toBeGreaterThan(0)
  for (const item of response.items) {
    expect(typeof item.actorUnknown).toBe('boolean')
    expect(item.message).toBe(item.content)
    expect(item.referenceType).toBe(item.refType)
    if (item.actor) expect(item.actor.userId).toBe(item.actorId)
    else expect(item.actorId == null || item.actorUnknown).toBe(true)
  }
  await page.goto('/notifications')
  await expect(page.getByText('Unexpected Application Error!', { exact: true })).toHaveCount(0)
})

test('delta Avatar UI: exact PNG on dedicated QA account, absolute CDN URL and reload', async ({ page }) => {
  await login(page, 'user5@gmail.com')
  await page.goto('/profile')
  await page.getByRole('button', { name: 'Thay đổi ảnh đại diện', exact: true }).first().click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('input[type=file]').setInputFiles(imagePath)
  const response = page.waitForResponse(r => r.url().endsWith('/users/me/avatar') && r.request().method() === 'PUT')
  await dialog.getByRole('button', { name: 'Lưu ảnh đại diện', exact: true }).click()
  expect((await response).status()).toBe(200)
  await expect(dialog).toHaveCount(0)
  const me = await call(page, 'users', 'getMe')
  await assertImage(page, me.avatar)
  await page.reload()
  expect(await page.locator('img').evaluateAll(images => images.some(img => img.complete && img.naturalWidth > 0 && img.src.startsWith('https://')))).toBe(true)
})
