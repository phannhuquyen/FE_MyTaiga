import { expect, test } from '@playwright/test'

for (const mode of ['populated', 'empty', 'error'] as const) {
  test(`updated project Chat ${mode}: isolation, history and response handling`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('mytaiga_access_token', 'mock-only')
      localStorage.setItem('mytaiga_user_info', JSON.stringify({ userId: 2, fullName: 'QA Author', email: 'qa@example.test', systemRole: 'USER' }))
    })
    await page.route('**/hubs/**', route => route.abort())
    await page.route('**/api/**', async route => {
      const path = new URL(route.request().url()).pathname.replace('/api/v1', '')
      let data: unknown = { items: [], total: 0, page: 1, pageSize: 20 }
      if (path === '/users/me') data = { userId: 2, fullName: 'QA Author', email: 'qa@example.test', systemRole: 'USER', avatar: null, createdAt: '2026-10-28T00:00:00Z' }
      else if (path === '/projects/3') data = { projectId: 3, projectName: 'QA mock project', status: 'ACTIVE', projectRole: 'MANAGER' }
      else if (path.endsWith('/unread-count')) data = { unreadCount: 0 }
      else if (path === '/chat/rooms') {
        if (mode === 'error') return route.fulfill({ status: 500, json: { success: false, message: 'QA error', data: null } })
        data = mode === 'empty' ? [] : [
          { chatRoomId: 71, projectId: 3, roomType: 'GROUP', roomName: 'qa-current', participantsCount: 1 },
          { chatRoomId: 72, projectId: 4, roomType: 'GROUP', roomName: 'qa-other-project' },
          { chatRoomId: 73, projectId: null, roomType: 'PRIVATE', roomName: 'qa-private' },
        ]
      } else if (path === '/chat/rooms/71/messages') {
        const root = { messageId: 501, chatRoomId: 71, senderId: 2, senderName: 'QA Author', senderRole: 'MANAGER', content: 'QA original', sentAt: '2026-10-28T00:00:00Z' }
        data = { items: [root, { ...root, messageId: 502, content: 'QA reply with image', replyToMessageId: 501,
          attachments: [{ messageAttachmentId: 81, fileName: 'Screenshot.png', fileSize: 100, mimeType: 'image/png', previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256', downloadUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256' }] }], hasMore: false, nextBefore: null }
      }
      return route.fulfill({ status: 200, json: { success: true, message: '', data } })
    })
    await page.goto('/projects/3/chat')
    if (mode === 'populated') {
      await expect(page.getByRole('heading', { name: '#qa-current', exact: true })).toBeVisible()
      await expect(page.getByText('QA reply with image', { exact: true })).toBeVisible()
      await expect(page.getByText(/Đang trả lời QA Author/)).toBeVisible()
      await expect(page.getByText(/qa-other-project|qa-private/)).toHaveCount(0)
      await page.getByText('Screenshot.png', { exact: true }).click()
      await expect(page.getByRole('dialog').getByRole('img', { name: 'Screenshot.png' })).toHaveAttribute('src', /images\.unsplash\.com/)
    } else if (mode === 'error') {
      await expect(page.getByText('Không thể tải kênh tin nhắn của dự án.')).toBeVisible()
    } else {
      await expect(page.getByRole('heading', { name: /#qa-/ })).toHaveCount(0)
    }
    await expect(page.getByText('Unexpected Application Error!', { exact: true })).toHaveCount(0)
  })
}
