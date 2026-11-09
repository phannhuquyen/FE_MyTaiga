import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

test('downloads a real Flow Metrics workbook for the selected Sprint', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem('mytaiga_access_token', 'mock-only')
  })
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname
    let data: unknown = { items: [], total: 0, page: 1, pageSize: 50 }
    if (path.endsWith('/users/me')) data = { userId: 2, fullName: 'QA', email: 'qa@example.test', systemRole: 'USER' }
    if (path.endsWith('/projects/1')) data = { projectId: 1, projectName: 'QA', status: 'ACTIVE', projectRole: 'MANAGER' }
    if (path.endsWith('/sprints')) data = { items: [{ sprintId: 42, sprintName: 'Sprint kiểm thử' }] }
    if (path.endsWith('/unread-count')) data = { unreadCount: 0 }
    if (path.endsWith('/flow-metrics/wip')) data = { wip: 13, inProgress: 8, inReview: 5 }
    if (path.endsWith('/flow-metrics/throughput')) data = { totalDoneTasks: 29, from: '2026-11-01', to: '2026-11-05' }
    if (path.endsWith('/flow-metrics/cycle-time/average')) data = { averageCycleTimeDays: 2.4 }
    if (path.endsWith('/flow-metrics/cycle-time')) data = {
      items: [{ taskId: 211, title: 'Kiểm tra luồng xử lý', completedAt: '2026-11-04T05:00:00Z', cycleTimeDays: 2.4 }],
    }
    return route.fulfill({ json: { success: true, message: '', data } })
  })

  await page.goto('/projects/1/metrics')
  await page.getByRole('combobox').filter({ has: page.getByRole('option', { name: 'Sprint kiểm thử' }) }).selectOption('42')
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Xuất báo cáo Excel' }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe('flow-metrics-1-42.xlsx')
  const path = testInfo.outputPath(download.suggestedFilename())
  await download.saveAs(path)
  const workbook = await readFile(path)
  expect(workbook.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]))
  expect(workbook.includes(Buffer.from('xl/workbook.xml'))).toBe(true)
  expect(workbook.includes(Buffer.from('xl/worksheets/sheet5.xml'))).toBe(true)
})
