import { expect, test, type Page } from '@playwright/test'

test.skip(!process.env.QA_TEST_PASSWORD, 'Supply QA_TEST_PASSWORD via ephemeral environment')
const accounts = [
  { name: 'admin', email: 'admin@scrumban.local', destination: '/admin/users' },
  { name: 'user1', email: 'user1@gmail.com', destination: '/projects' },
  { name: 'user2', email: 'user2@gmail.com', destination: '/projects' },
]
async function login(page: Page, account: typeof accounts[number]) {
  await page.goto('/login')
  await page.locator('#email-input').fill(account.email)
  await page.locator('#password-input').fill(process.env.QA_TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`${account.destination}$`))
}
for (const account of accounts) {
  test(`live ${account.name}: login, read-only routes, logout and protected URL`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.name))
    await login(page, account)
    await page.waitForLoadState('networkidle')
    if (account.name === 'admin') {
      for (const route of ['/admin/users', '/admin/roles', '/admin/settings', '/admin/logs']) {
        await test.step(`read ${route}`, async () => {
          await page.goto(route)
          await expect(page.locator('main').first()).toBeVisible()
          await page.waitForLoadState('networkidle')
          await expect(page.getByText('Unexpected Application Error!', { exact: true })).toHaveCount(0)
        })
      }
    } else {
      await page.goto('/profile')
      await expect(page.locator('main').first()).toBeVisible()
      await page.waitForLoadState('networkidle')
      await page.goto('/admin/users')
      await expect(page.getByText('Không có quyền truy cập', { exact: true })).toBeVisible()
      await page.goto('/projects')
      if (account.name === 'user2') {
        const projectIds = await page.evaluate(async () => {
          const response = await fetch('/api/v1/projects', { headers: { Authorization: `Bearer ${localStorage.getItem('mytaiga_access_token')}` } })
          return (await response.json()).data.items.map((p: { projectId: number }) => p.projectId) as number[]
        })
        if (projectIds.length) {
          await page.goto(`/projects/${projectIds[0]}/metrics`)
          await expect(page.getByRole('alert')).toContainText('không có quyền xem Flow Metrics')
        }
        await page.goto('/notifications')
        await page.waitForLoadState('networkidle')
        await expect(page.getByText('Unexpected Application Error!', { exact: true })).toHaveCount(0)
      }
      if (account.name === 'user1') {
        const projectsResponse = await page.evaluate(async () => {
          const r = await fetch('/api/v1/projects', { headers: { Authorization: `Bearer ${localStorage.getItem('mytaiga_access_token')}` } })
          const body = await r.json()
          return body.data.items.map((p: { projectId: number }) => p.projectId) as number[]
        })
        expect(projectsResponse.length).toBeGreaterThan(0)
        for (const feature of ['dashboard', 'backlog', 'sprints', 'kanban', 'epics', 'bugs', 'metrics', 'members']) {
          await test.step(`read project ${feature}`, async () => {
            await page.goto(`/projects/${projectsResponse[0]}/${feature}`)
            await expect(page.locator('main').first()).toBeVisible()
            await page.waitForLoadState('networkidle')
            await expect(page.getByRole('alert').filter({ hasText: 'Không thể truy cập dự án' })).toHaveCount(0)
            await expect(page.getByText('Unexpected Application Error!', { exact: true })).toHaveCount(0)
          })
        }
      }
    }
    await page.goto(account.name === 'admin' ? '/admin/users' : '/projects')
    const logout = account.name === 'admin' ? page.getByTitle('Đăng xuất', { exact: true }) : page.getByRole('button', { name: 'Đăng xuất khỏi hệ thống' })
    await logout.click()
    await expect(page).toHaveURL(/\/logged-out$/)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('mytaiga_access_token') === null)).toBe(true)
    await page.goto('/projects')
    await expect(page).toHaveURL(/\/login$/)
    expect(errors).toEqual([])
  })
}
