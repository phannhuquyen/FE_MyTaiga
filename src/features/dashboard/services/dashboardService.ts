import { api, type TaskData, type ProductBacklogItemData, type BugData, type PaginatedData } from '@/services/api'
import type { TaskItem, TaskPriority, TaskStatus, CreateDashboardWork, DashboardOptions, TaskComment } from '../types'

const priority: Record<string, TaskPriority> = { LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao', CRITICAL: 'Khẩn cấp' }
const priorityToApi: Record<TaskPriority, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = { 'Thấp': 'LOW', 'Trung bình': 'MEDIUM', 'Cao': 'HIGH', 'Khẩn cấp': 'CRITICAL' }
const status: Record<string, TaskStatus> = { TODO: 'Cần làm', NEW: 'Cần làm', READY: 'Cần làm', OPEN: 'Cần làm', REOPENED: 'Cần làm', IN_SPRINT: 'Đang làm', IN_PROGRESS: 'Đang làm', IN_REVIEW: 'Chờ duyệt', RESOLVED: 'Sẵn sàng Test', DONE: 'Hoàn thành', CLOSED: 'Hoàn thành' }
const date = (value?: string | null) => value ? new Date(value).toLocaleDateString('vi-VN') : 'Chưa có'
async function allPages<T>(fetchPage: (page: number) => Promise<{ data: PaginatedData<T> }>): Promise<T[]> {
  const rows: T[] = []
  for (let page = 1; ; page++) {
    const { data } = await fetchPage(page)
    rows.push(...data.items)
    if (!data.items.length || rows.length >= data.total) return rows
  }
}
function base(id: number, type: TaskItem['type'], title: string, state: string, importance: TaskPriority, projectId: number): TaskItem {
  const resource = type === 'Task' ? 'kanban' : type === 'Story' ? 'backlog' : 'bugs'
  return { id: `${type.toLowerCase()}:${id}`, entityId: id, href: `/projects/${projectId}/${resource}?id=${id}`, code: `${type === 'Story' ? 'PBI' : type.toUpperCase()}-${id}`, title, type, status: status[state] || 'Cần làm', priority: importance, dueDate: 'Chưa có', assignee: { name: 'Chưa giao', avatarCode: '—', role: 'Chưa có thông tin' }, sprint: 'Chưa vào Sprint', dod: [], comments: [] }
}
function taskRow(task: TaskData, projectId: number, sprintNames: Map<number, string> = new Map()): TaskItem {
  return { ...base(task.taskId, 'Task', task.title, task.status, priority[task.priority], projectId), description: task.description || '', commentTaskId: task.taskId, dueDate: date(task.deadline), storyPoints: task.storyPoints ?? undefined, assignee: { name: task.assignee?.fullName || task.assigneeName || 'Chưa giao', avatarCode: task.assignee?.avatarCode || task.assigneeAvatarCode || '—', role: task.assignee?.role || task.assigneeRole || 'Chưa có thông tin' }, sprint: task.sprintId ? sprintNames.get(task.sprintId) || `Sprint #${task.sprintId}` : 'Chưa vào Sprint' }
}
function storyRow(item: ProductBacklogItemData, projectId: number): TaskItem {
  return { ...base(item.pbiId, 'Story', item.title, item.status, item.priority <= 1 ? 'Khẩn cấp' : item.priority === 2 ? 'Cao' : 'Trung bình', projectId), description: item.description || '', storyPoints: item.storyPoint, assignee: { name: 'Chưa có dữ liệu người thực hiện', avatarCode: '—', role: 'Backend chưa cung cấp' }, sprint: 'Chưa có dữ liệu Sprint' }
}
function bugRow(item: BugData, projectId: number): TaskItem {
  return { ...base(item.bugId, 'Bug', item.title, item.status, priority[item.priority], projectId), description: item.description, commentTaskId: item.taskId, assignee: { name: item.assignee?.fullName || item.assigneeName || 'Chưa giao', avatarCode: item.assignee?.avatarCode || '—', role: item.assignee?.role || 'Chưa có thông tin' } }
}
function commentRow(item: Awaited<ReturnType<typeof api.comments.get>>['data']): TaskComment {
  return { id: String(item.commentId), author: item.authorName || `Thành viên #${item.userId}`, authorAvatar: item.authorAvatarCode, content: item.content, createdAt: item.createdAt, timeAgo: new Date(item.createdAt).toLocaleString('vi-VN') }
}
export const dashboardService = {
  async getMyTasks(projectId: number): Promise<TaskItem[]> {
    return (await allPages(page => api.tasks.list(projectId, { page, pageSize: 100 }))).map(item => taskRow(item, projectId))
  },
  async load(projectId: number) {
    const [project, tasks, stories, bugs, sprints, activities, epics, members] = await Promise.all([
      api.projects.get(projectId), allPages(page => api.tasks.list(projectId, { page, pageSize: 100 })),
      allPages(page => api.productBacklog.list({ projectId, page, pageSize: 100 })),
      allPages(page => api.bugs.list(projectId, { page, pageSize: 100 })),
      allPages(page => api.sprints.list({ projectId, page, pageSize: 100 })),
      api.activityLogs.listByProject(projectId, { page: 1, pageSize: 20 }),
      allPages(page => api.epics.list(projectId, { page, pageSize: 100 })),
      allPages(page => api.projectMembers.list(projectId, { page, pageSize: 100 })),
    ])
    const sprintNames = new Map(sprints.map(item => [item.sprintId, item.sprintName]))
    const items = [...tasks.map(item => taskRow(item, projectId, sprintNames)), ...stories.map(item => storyRow(item, projectId)), ...bugs.map(item => bugRow(item, projectId))]
    const completed = items.filter(item => item.status === 'Hoàn thành').length
    const active = sprints.find(item => item.status === 'ACTIVE')
    const progress = active ? (await api.sprints.progress(active.sprintId)).data : null
    const options: DashboardOptions = { epics: epics.map(item => ({ id: item.epicId, title: item.title })), tasks: tasks.map(item => ({ id: item.taskId, title: item.title })), members: members.map(item => ({ id: item.userId, name: item.fullName })) }
    return {
      project: { id: String(projectId), code: `PRJ-${projectId}`, name: project.data.projectName, role: project.data.projectRole || 'Thành viên', startDate: date(project.data.startDate), endDate: date(project.data.endDate), sprintCycle: 'Theo lịch Sprint thực tế', totalTasks: items.length, completedTasks: completed, progressPercentage: items.length ? Math.round(completed / items.length * 100) : 0 },
      sprint: active && progress ? { id: String(active.sprintId), name: active.sprintName, number: active.sprintId, status: 'Đang diễn ra' as const, daysLeft: Math.max(0, Math.ceil((new Date(active.endDate).getTime() - Date.now()) / 86400000)), goal: active.sprintGoal || 'Chưa có mục tiêu', committedPoints: progress.totalStoryPoints, completedPoints: progress.completedStoryPoints, wipCount: tasks.filter(item => item.sprintId === active.sprintId && ['IN_PROGRESS', 'IN_REVIEW'].includes(item.status)).length } : null,
      tasks: items, options,
      activities: activities.data.items.map(item => ({ id: String(item.activityLogId), author: item.userName || (item.isSystemAction ? 'Hệ thống' : `Thành viên #${item.userId}`), avatarCode: item.userAvatarCode || '—', action: item.description || item.action, targetCode: item.entityId ? `${item.entityType}-${item.entityId}` : undefined, targetTitle: item.entityTitle || undefined, timeAgo: new Date(item.createdAt).toLocaleString('vi-VN') })),
    }
  },
  async getDetail(item: TaskItem, projectId: number): Promise<TaskItem> {
    let result = item
    if (item.type === 'Task') result = taskRow((await api.tasks.get(item.entityId!)).data.task, projectId)
    else if (item.type === 'Story') result = storyRow((await api.productBacklog.get(item.entityId!)).data, projectId)
    else result = bugRow((await api.bugs.get(item.entityId!)).data.bug, projectId)
    if (result.commentTaskId) result.comments = (await allPages(page => api.comments.listByTask(result.commentTaskId!, page, 100))).map(commentRow)
    return result
  },
  async addComment(taskId: number, content: string): Promise<TaskComment> {
    return commentRow((await api.comments.createForTask(taskId, { content })).data)
  },
  async createTask(projectId: number, input: CreateDashboardWork): Promise<TaskItem> {
    if (input.type === 'Story') {
      if (!input.epicId) throw new Error('Vui lòng chọn Epic cho Story/Backlog.')
      const saved = await api.productBacklog.create({ epicId: input.epicId, title: input.title, storyPoint: input.storyPoints ?? 0, priority: ['Khẩn cấp', 'Cao', 'Trung bình', 'Thấp'].indexOf(input.priority) + 1, status: 'NEW' })
      return storyRow(saved.data, projectId)
    }
    if (input.type === 'Bug') {
      if (!input.taskId) throw new Error('Vui lòng chọn Task liên quan cho Bug.')
      const saved = await api.bugs.create({ taskId: input.taskId, title: input.title, description: input.title, severity: 'MINOR', priority: priorityToApi[input.priority] })
      return bugRow(saved.data, projectId)
    }
    const saved = await api.tasks.create(projectId, { title: input.title, assigneeId: input.assigneeId || null, priority: priorityToApi[input.priority], storyPoints: input.storyPoints ?? null, deadline: input.deadline ? `${input.deadline}T23:59:00+07:00` : null })
    return taskRow(saved.data, projectId)
  },
}
