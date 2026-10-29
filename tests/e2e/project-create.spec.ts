import { expect, test } from '@playwright/test'

for (const feature of ['backlog', 'sprints', 'epics', 'kanban', 'bugs']) {
  test(`project header create: ${feature} opens its real creation form`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('mytaiga_access_token', 'mock-only')
      localStorage.setItem('mytaiga_user_info', JSON.stringify({ userId: 2, fullName: 'QA', email: 'qa@example.test', systemRole: 'USER' }))
    })
    await page.route('**/api/**', route => {
      const path = new URL(route.request().url()).pathname
      let data: unknown = { items: [], total: 0, page: 1, pageSize: 100 }
      if (path.endsWith('/users/me')) data = { userId: 2, fullName: 'QA', email: 'qa@example.test', systemRole: 'USER', avatar: null, createdAt: '2026-10-29T00:00:00Z' }
      else if (path.endsWith('/projects/1')) data = { projectId: 1, projectName: 'QA', status: 'ACTIVE', projectRole: 'MANAGER' }
      else if (path.endsWith('/unread-count')) data = { unreadCount: 0 }
      else if (path.endsWith('/board')) data = { columns: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((columnName, i) => ({ boardColumnId: i + 1, columnName, tasks: [], taskCount: 0, wipLimit: null })) }
      return route.fulfill({ status: 200, json: { success: true, message: '', data } })
    })
    await page.goto(`/projects/1/${feature}`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Tạo', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })
}
