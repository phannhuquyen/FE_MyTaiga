import { expect, test } from '@playwright/test'

for (const viewport of [{ width: 1280, height: 800 }, { width: 375, height: 667 }]) {
  test(`notification panel overlays content at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.addInitScript(() => {
      localStorage.setItem('mytaiga_access_token', 'mock-only')
    })
    await page.route('**/api/**', route => {
      const path = new URL(route.request().url()).pathname
      let data: unknown = { items: [], total: 0, page: 1, pageSize: 50 }
      if (path.endsWith('/users/me')) data = { userId: 2, fullName: 'QA', email: 'qa@example.test', systemRole: 'USER' }
      if (path.endsWith('/unread-count')) data = { unreadCount: 0 }
      return route.fulfill({ json: { success: true, data } })
    })
    await page.goto('/projects')
    await page.evaluate(() => document.fonts.ready)
    const bell = page.getByRole('button', { name: 'Thông báo', exact: true })
    const create = page.getByRole('button', { name: 'Tạo', exact: true })
    const createBounds = await create.boundingBox()

    // Reproduce a content stacking context that the old Header child could not escape.
    await page.locator('main').evaluate(main => {
      Object.assign(main.style, { position: 'relative', zIndex: '10', transform: 'translateZ(0)' })
    })
    await bell.click()
    const panel = page.getByRole('region', { name: 'Bảng thông báo' })
    await expect(panel).toBeVisible()
    expect(await panel.evaluate(element => {
      const bounds = element.getBoundingClientRect()
      return element.contains(document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2))
    })).toBe(true)
    const bounds = await panel.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width)
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height)
    expect(await create.boundingBox()).toEqual(createBounds)
    if (viewport.width >= 640) await expect(page.getByPlaceholder('Tìm kiếm nhanh (Ctrl+K)...')).toBeVisible()

    await panel.getByRole('button', { name: /Chưa đọc/ }).click()
    await expect(panel).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('notification-overlay.png') })
    await page.setViewportSize({ width: viewport.width + 40, height: viewport.height })
    await expect(panel).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
    await expect(bell).toBeFocused()

    await bell.click()
    await create.click()
    await expect(panel).toHaveCount(0)
    await expect(page.getByRole('dialog')).toBeVisible()
  })
}
