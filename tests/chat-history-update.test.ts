import { expect, it, vi } from 'vitest'
import { api } from '../src/services/api'
import { authStorage } from '../src/lib/tokenStorage'
import { chatService } from '../src/features/chat/services/chatService'

it('preserves cloud attachments and reply relationships when reloading REST history', async () => {
  const root = { messageId: 501, chatRoomId: 71, senderId: 2, senderName: 'QA Author', senderRole: 'MEMBER', content: 'Original', sentAt: '2026-10-28T00:00:00Z' }
  const reply = { ...root, messageId: 502, content: 'Edited reply', replyToMessageId: 501, isEdited: true, isEditable: true,
    attachments: [{ messageAttachmentId: 81, fileName: 'Screenshot.png', fileSize: 100, downloadUrl: 'https://example.test/download', previewUrl: 'https://example.test/preview', mimeType: 'image/png' }] }
  vi.spyOn(api.chat, 'listMessages').mockResolvedValue({ success: true, message: '', data: { items: [reply, root], hasMore: false, nextBefore: null } })
  const messages = await chatService.fetchMessagesFromApi('71')
  const saved = messages.find(m => m.id === '502')!
  expect(saved.attachments?.[0]).toMatchObject({ id: '81', name: 'Screenshot.png', type: 'image', bytes: 100, url: 'https://example.test/download' })
  expect(saved.replyTo).toMatchObject({ id: '501', senderName: 'QA Author', text: 'Original' })
  expect(saved.senderRole).toBe('MEMBER')
})

it('publishes the canonical saved sender rather than a demo author, without duplicate IDs', async () => {
  authStorage.setUser({ userId: 2, fullName: 'QA Author', email: 'qa@example.test', systemRole: 'USER' })
  const message = { messageId: 601, chatRoomId: 72, senderId: 2, senderName: 'QA Author', senderAvatarCode: 'QA', content: 'Saved', sentAt: '2026-10-28T00:00:00Z' }
  vi.spyOn(api.chat, 'listMessages').mockResolvedValue({ success: true, message: '', data: { items: [message], hasMore: false, nextBefore: null } })
  await chatService.fetchMessagesFromApi('72')
  vi.spyOn(api.chat, 'sendMessage').mockResolvedValue({ success: true, message: '', data: message })
  const saved = await chatService.sendMessage('72', 'Saved')
  expect(saved.senderName).toBe('QA Author')
  expect(chatService.getMessages('72').filter(m => m.id === '601')).toHaveLength(1)
})

it('keeps a newly created project channel when an older room request finishes late', async () => {
  let finish!: (value: never) => void
  vi.spyOn(api.chat, 'listRooms').mockReturnValue(new Promise(resolve => { finish = resolve }))
  const loading = chatService.fetchRoomsFromApi(3)
  vi.spyOn(api.chat, 'createRoom').mockResolvedValue({ success: true, message: '', data: { chatRoomId: 901 } })
  await chatService.createChannel({ name: 'qa-new', description: '', projectId: 3, memberIds: [] })
  finish({ success: true, message: '', data: [] } as never)
  await loading
  expect(chatService.getConversations().some(room => room.id === '901')).toBe(true)
})
