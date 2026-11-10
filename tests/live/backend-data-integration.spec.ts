import { expect, test, type Page } from '@playwright/test'

test.skip(!process.env.QA_TEST_PASSWORD, 'Requires supplied QA credentials via ephemeral environment')

async function login(page: Page, email: string) {
  await page.goto('/login')
  await page.locator('#email-input').fill(email)
  await page.locator('#password-input').fill(process.env.QA_TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page).not.toHaveURL(/\/login$/)
}

async function read(page: Page, path: string) {
  return page.evaluate(async path => {
    const response = await fetch('/api/v1' + path, { headers: { Authorization: `Bearer ${localStorage.getItem('mytaiga_access_token')}` } })
    if (!response.ok) throw new Error(`Read API failed with HTTP ${response.status}`)
    return (await response.json()).data
  }, path)
}

test('live manager: rendered Flow Metrics values equal the current backend response', async ({ page }) => {
  await login(page, 'user1@gmail.com')
  const projects = await read(page, '/projects?pageSize=100')
  const project = projects.items.find((item: { projectRole: string }) => item.projectRole === 'MANAGER')
  test.skip(!project, 'No manager project available')
  const prefix = `/projects/${project.projectId}/flow-metrics`
  const wipResponse = page.waitForResponse(response => new URL(response.url()).pathname.endsWith(prefix + '/wip'))
  const throughputResponse = page.waitForResponse(response => new URL(response.url()).pathname.endsWith(prefix + '/throughput'))
  const cycleResponse = page.waitForResponse(response => new URL(response.url()).pathname.endsWith(prefix + '/cycle-time/average'))
  await page.goto(`/projects/${project.projectId}/metrics`)
  const [wip, throughput, cycle] = await Promise.all([wipResponse, throughputResponse, cycleResponse].map(async response => (await (await response).json()).data))
  const kpi = (label: string) => page.getByText(label, { exact: true }).locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]').locator('span.text-3xl')
  await expect(kpi('WIP HIỆN TẠI')).toHaveText(String(wip.wip))
  await expect(kpi('THROUGHPUT')).toHaveText(String(throughput.totalDoneTasks))
  await expect(kpi('CYCLE TIME TRUNG BÌNH')).toHaveText(cycle.averageCycleTimeDays == null ? '--' : String(Number(cycle.averageCycleTimeDays.toFixed(1))))
  await page.getByRole('button', { name: 'Throughput', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Sản lượng theo ngày (UTC)' })).toBeVisible()
  const table = page.locator('table').filter({ has: page.getByRole('columnheader', { name: 'Ngày', exact: true }) })
  await expect(table.locator('tbody tr')).toHaveCount(throughput.points.length)
  await expect(page.getByText('78.2%')).toHaveCount(0)
})

test('live manager: Epic totals, selected member tasks and Sprint burndown match raw API values', async ({ page }) => {
  await login(page, 'user1@gmail.com')
  const projects = await read(page, '/projects?pageSize=100')
  const project = projects.items.find((item: { projectRole: string }) => item.projectRole === 'MANAGER')
  test.skip(!project, 'No manager project available')
  await page.goto(`/projects/${project.projectId}/epics`)
  await expect(page.getByText('Không thể truy cập dự án').first()).toHaveCount(0)
  const result = await page.evaluate(async projectId => {
    const { api } = await import('/src/services/api.ts')
    const { allPages } = await import('/src/lib/allPages.ts')
    const { projectService } = await import('/src/features/projects/services/projectService.ts')
    const { epicService } = await import('/src/features/epics/services/epicService.ts')
    const { memberService } = await import('/src/features/members/services/memberService.ts')
    const { sprintService } = await import('/src/features/sprints/services/sprintService.ts')
    projectService.setActiveProjectId(projectId)
    const [epics, pbis, members, sprints] = await Promise.all([
      epicService.getEpics(),
      allPages((page: number) => api.productBacklog.list({ projectId, page, pageSize: 100 })),
      allPages((page: number) => api.projectMembers.list(projectId, { page, pageSize: 100 })),
      allPages((page: number) => api.sprints.list({ projectId, page, pageSize: 100 })),
    ])
    const epicMatches = epics.every((epic: { id: string; totalPoints: number; completedPoints: number }) => {
      const linked = pbis.filter((item: { epicId: number }) => String(item.epicId) === epic.id)
      return epic.totalPoints === linked.reduce((sum: number, item: { storyPoint: number }) => sum + item.storyPoint, 0)
        && epic.completedPoints === linked.filter((item: { status: string }) => item.status === 'DONE').reduce((sum: number, item: { storyPoint: number }) => sum + item.storyPoint, 0)
    })
    let memberMatches = true
    if (members.length) {
      const userId = members[0].userId
      const [mapped, raw] = await Promise.all([
        memberService.getMemberTasks(String(userId)),
        allPages((page: number) => api.tasks.list(projectId, { assigneeId: userId, page, pageSize: 100 })),
      ])
      memberMatches = mapped.length === raw.length && mapped.every((task: { id: string }) => raw.some((item: { taskId: number }) => task.id === `TASK-${item.taskId}`))
    }
    let burndownMatches = true
    if (sprints.length) {
      const id = sprints[0].sprintId
      const [mapped, raw] = await Promise.all([sprintService.getSprintById(String(id)), api.sprints.burndown(id)])
      burndownMatches = mapped?.burndownPoints?.length === raw.data.points.length
        && raw.data.points.every((point: { actualRemaining: number | null }, index: number) => mapped?.burndownPoints?.[index].actualRemaining === (point.actualRemaining ?? undefined))
    }
    return { epicMatches, memberMatches, burndownMatches, epics: epics.length, members: members.length, sprints: sprints.length }
  }, project.projectId)
  expect(result.epicMatches).toBe(true)
  expect(result.memberMatches).toBe(true)
  expect(result.burndownMatches).toBe(true)
  expect(result.epics).toBeGreaterThan(0)
  expect(result.members).toBeGreaterThan(0)
  expect(result.sprints).toBeGreaterThan(0)
})

test('live admin: supported config inputs reflect persisted server values without saving', async ({ page }) => {
  await login(page, 'admin@scrumban.local')
  const rows = await read(page, '/admin/system-config')
  const values = Object.fromEntries(rows.map((row: { configKey: string; configValue: string }) => [row.configKey, row.configValue]))
  await page.goto('/admin/settings')
  const inputs = page.getByRole('spinbutton')
  await expect(inputs.nth(0)).toHaveValue(values.DEADLINE_WARNING_HOURS)
  await expect(inputs.nth(2)).toHaveValue(values.MAX_FILE_SIZE_MB)
  await expect(inputs.nth(4)).toHaveValue(values.MAX_FAILED_LOGIN)
  await expect(page.getByRole('combobox')).toHaveValue(`${Number(values.JWT_EXPIRE_MINUTES)} phút`)
})
