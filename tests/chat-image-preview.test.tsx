import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { AttachmentPreviewModal } from '../src/features/chat/components/AttachmentPreviewModal'

it('renders the image URL supplied by metadata and downloads the real resource', () => {
  const url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256'
  const attachment = { id: '81', name: 'QA image.png', size: '1 MB', bytes: 1000, type: 'image' as const, url, previewUrl: url }
  let downloaded = ''
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { downloaded = this.href })
  render(<AttachmentPreviewModal isOpen onClose={() => {}} attachment={attachment} />)
  expect(screen.getByRole('img', { name: 'QA image.png' }).getAttribute('src')).toBe(url)
  fireEvent.click(screen.getByRole('button', { name: /Tải xuống/ }))
  expect(downloaded).toBe(url)
})
