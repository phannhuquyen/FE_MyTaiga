import { expect, it, vi } from 'vitest'
import { api } from '../src/services/api'
import { profileService } from '../src/features/profile/services/profileService'

it('does not claim a saved avatar when a remote demo URL performs no upload', async () => {
  vi.spyOn(api.users, 'getMe').mockResolvedValue({ success: true, message: '', data: { userId: 6, fullName: 'QA User', email: 'qa@example.test', systemRole: 'USER', avatar: null, phoneNumber: null, createdAt: '2026-10-28T00:00:00Z' } })
  await expect(profileService.updateAvatar({ avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256' })).rejects.toThrow()
})
