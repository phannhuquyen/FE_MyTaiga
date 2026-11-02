import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CreateChannelModal } from '../src/features/chat/components/CreateChannelModal'

it('closes a creation popup only when clicking outside the form', () => {
  const onClose = vi.fn()
  render(<CreateChannelModal isOpen onClose={onClose} onCreateChannel={vi.fn()} />)
  const dialog = screen.getByRole('dialog')
  fireEvent.click(screen.getByPlaceholderText(/VD: Core Engineering/))
  fireEvent.click(dialog)
  expect(onClose).not.toHaveBeenCalled()
  fireEvent.click(dialog.parentElement!)
  expect(onClose).toHaveBeenCalledTimes(1)
})
