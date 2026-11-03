import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Avatar } from '../src/components/ui/Avatar'
import { api } from '../src/services/api'
import { refreshChatAttachment } from '../src/features/chat/services/attachmentService'
import { AttachmentPreviewModal } from '../src/features/chat/components/AttachmentPreviewModal'
import { memberService } from '../src/features/members/services/memberService'
import { projectService } from '../src/features/projects/services/projectService'

const attachment = { id: '4', roomId: 3, messageId: 9, name: 'photo.png', size: '1 MB', bytes: 100, type: 'image' as const, previewUrl: 'https://res.cloudinary.com/test/expired.png' }
const freshUrl = 'https://res.cloudinary.com/test/fresh.png'

it('shows initials when absent or broken and retries a changed avatar URL', () => {
  const view = render(<Avatar name="QA" fallback="QA" />)
  expect(screen.getByText('QA')).toBeTruthy()
  view.rerender(<Avatar name="QA" fallback="QA" src={freshUrl} />)
  fireEvent.error(screen.getByRole('img'))
  expect(screen.getByText('QA')).toBeTruthy()
  view.rerender(<Avatar name="QA" fallback="QA" src={`${freshUrl}?v=2`} />)
  expect(screen.getByRole('img').getAttribute('src')).toBe(`${freshUrl}?v=2`)
})

it('refreshes private image metadata before preview instead of using a stale signed URL', async () => {
  const list = vi.spyOn(api.chat, 'listMessages').mockResolvedValue({ data: { items: [{ messageId: 9, attachments: [{ messageAttachmentId: 4, previewUrl: freshUrl, downloadUrl: freshUrl }] }] } } as never)
  render(<AttachmentPreviewModal isOpen onClose={vi.fn()} attachment={attachment} />)
  const image = await screen.findByRole('img', { name: 'photo.png' })
  expect(image.getAttribute('src')).toBe(freshUrl)
  expect(list).toHaveBeenCalledWith(3, { before: 10, limit: 1 })
  fireEvent.error(image)
  expect(screen.getByRole('status').textContent).toContain('Không tải được ảnh')
})

it('does not fall back to an expired URL after access is removed', async () => {
  vi.spyOn(api.chat, 'listMessages').mockResolvedValue({ data: { items: [] } } as never)
  await expect(refreshChatAttachment(attachment)).rejects.toThrow('không còn')
})

it('preserves Cloudinary avatars through the member adapter', async () => {
  vi.spyOn(projectService, 'getActiveProjectId').mockReturnValue(3)
  vi.spyOn(api.projectMembers, 'list').mockResolvedValue({ data: { items: [{ userId: 7, fullName: 'QA User', email: 'qa@example.test', avatar: freshUrl, projectRole: 'MEMBER' }] } } as never)
  const members = await memberService.getMembers()
  expect(members[0].avatarUrl).toBe(freshUrl)
  expect(members[0].avatarCode).toBe('QU')
})
