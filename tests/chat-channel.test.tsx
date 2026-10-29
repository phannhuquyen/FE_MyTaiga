import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CreateChannelModal } from '../src/features/chat/components/CreateChannelModal'

it('keeps channel dialog open until rejected async creation is handled', async () => {
  const close = vi.fn()
  render(<CreateChannelModal isOpen onClose={close} onCreateChannel={async () => { throw new Error('QA creation rejected') }} />)
  fireEvent.change(screen.getByPlaceholderText('VD: Core Engineering & Release Squad'), { target: { value: 'Kênh kiểm thử' } })
  fireEvent.click(screen.getByRole('button', { name: 'Tạo nhóm' }))
  await waitFor(() => expect(screen.getByText('Không thể tạo nhóm. Vui lòng thử lại.')).toBeTruthy())
  expect(close).not.toHaveBeenCalled()
})
