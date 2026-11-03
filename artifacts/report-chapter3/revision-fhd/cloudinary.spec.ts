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
  await expect(page.getByText('Đang tải hồ sơ cá nhân...', { exact: true })).toBeHidden()
  await expect.poll(() => page.locator('img').evaluateAll(images => images.some(img => img.complete && img.naturalWidth > 0 && img.src.startsWith('https://'))), { timeout: 15000 }).toBe(true)
})
