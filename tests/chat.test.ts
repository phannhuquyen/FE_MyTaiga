import { expect, it, vi } from 'vitest'
import { api } from '../src/services/api'
import { chatService } from '../src/features/chat/services/chatService'

it('does not retain a locally successful message when real room send fails', async () => {
  vi.spyOn(api.chat, 'listMessages').mockResolvedValue({ success: true, message: '', data: { items: [], hasMore: false, nextBefore: null } })
  await chatService.fetchMessagesFromApi('42')
  vi.spyOn(api.chat, 'sendMessage').mockRejectedValue(new Error('QA send rejected'))
  await expect(chatService.sendMessage('42', 'Must not be delivered')).rejects.toThrow()
  expect(chatService.getMessages('42')).toEqual([])
})
it('does not create a fake room on rejected backend creation', async () => {
  vi.spyOn(api.chat, 'createRoom').mockRejectedValue(new Error('QA room rejected'))
  const before = chatService.getConversations().length
  await expect(chatService.createChannel({ name: 'qa', description: 'qa', memberIds: [] })).rejects.toThrow()
  expect(chatService.getConversations().length).toBe(before)
})
