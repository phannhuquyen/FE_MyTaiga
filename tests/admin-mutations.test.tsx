import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CreateUserModal } from '../src/features/admin/components/CreateUserModal'
import { LockUserModal } from '../src/features/admin/components/LockUserModal'
import { UnlockUserModal } from '../src/features/admin/components/UnlockUserModal'

const user = { id: 'USR-0008', name: 'QA', email: 'qa@example.test', roleLabel: 'Member', avatarCode: 'QA' } as never
it.each(['create', 'lock', 'unlock'])('admin %s failure stays open and shows error', async kind => {
  const close = vi.fn()
  const fail = vi.fn(async () => ({ success: false, error: 'QA mutation rejected' }))
  if (kind === 'create') render(<CreateUserModal isOpen onClose={close} onCreateUser={fail} />)
  if (kind === 'lock') render(<LockUserModal isOpen onClose={close} user={user} onConfirmLock={fail} />)
  if (kind === 'unlock') render(<UnlockUserModal isOpen onClose={close} user={user} onConfirmUnlock={fail} />)
  fireEvent.click(screen.getByRole('button', { name: kind === 'create' ? 'Lưu thông tin' : kind === 'lock' ? 'Xác nhận khóa' : 'Xác nhận mở khóa' }))
  await waitFor(() => expect(screen.getByText('QA mutation rejected')).toBeTruthy())
  expect(close).not.toHaveBeenCalled()
})
