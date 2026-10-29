import { expect, it, vi } from 'vitest'
import { api } from '../src/services/api'
import { chatService } from '../src/features/chat/services/chatService'
import { memberService } from '../src/features/members/services/memberService'

it('returns only channels belonging to the requested project, without demo rooms', async () => {
  vi.spyOn(api.chat, 'listRooms').mockResolvedValue({ success: true, message: '', data: [
    { chatRoomId: 1, projectId: 7, roomType: 'GROUP', roomName: 'Project 7' },
    { chatRoomId: 2, projectId: 8, roomType: 'GROUP', roomName: 'Project 8' },
    { chatRoomId: 3, projectId: null, roomType: 'PRIVATE', roomName: null },
  ] })
  expect((await chatService.fetchRoomsFromApi(7)).map((room) => room.id)).toEqual(['1'])
  expect((await chatService.fetchRoomsFromApi(9))).toEqual([])
})

it('uses real user IDs from the directory and keeps missing department explicit', async () => {
  vi.spyOn(api.users, 'search').mockResolvedValue({ success: true, message: '', data: {
    items: [{ userId: 91, fullName: 'Nguyễn An', email: 'an@example.test', avatarUrl: null }], total: 1, page: 1, pageSize: 100,
  } })
  const [candidate] = await memberService.getCandidates(' An ')
  expect(candidate.id).toBe('91')
  expect(candidate.departmentName).toBe('Chưa có thông tin phòng ban')
  expect(api.users.search).toHaveBeenCalledWith({ keyword: 'An', page: 1, pageSize: 100 })
})
