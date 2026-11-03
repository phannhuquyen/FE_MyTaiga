import { api } from '@/services/api'
import type { ChatAttachment } from '../types'

/** Read message metadata again rather than persisting short-lived signed URLs. */
export async function refreshChatAttachment(attachment: ChatAttachment): Promise<ChatAttachment> {
  if (!attachment.roomId || !attachment.messageId) return attachment
  const response = await api.chat.listMessages(attachment.roomId, { before: attachment.messageId + 1, limit: 1 })
  const message = response.data.items.find(item => item.messageId === attachment.messageId)
  const fresh = message?.attachments?.find(item => String(item.messageAttachmentId) === attachment.id)
  if (!fresh) throw new Error('Ảnh không còn khả dụng hoặc bạn không còn quyền truy cập.')
  return { ...attachment, previewUrl: fresh.previewUrl || fresh.url || undefined, url: fresh.downloadUrl }
}
