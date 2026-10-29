import { expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { api } from '../src/services/api'
import { notificationService } from '../src/features/notifications/services/notificationService'
import { NotificationsPage } from '../src/features/notifications/NotificationsPage'

it('refreshes visible list when asynchronously loaded notifications publish', async () => {
  notificationService.clearAllForEmptyDemo()
  vi.spyOn(api.notifications, 'list').mockResolvedValue({ success: true, message: '', data: { items: [{ notificationId: 99, title: 'QA async notice', content: 'QA async content', refType: null, refId: null, type: 'SYSTEM', isRead: false, createdAt: new Date().toISOString(), readAt: null }], total: 1, page: 1, pageSize: 50 } })
  render(<MemoryRouter><NotificationsPage /></MemoryRouter>)
  await act(() => notificationService.fetchFromApi())
  expect(screen.getByText('QA async content')).toBeTruthy()
})
