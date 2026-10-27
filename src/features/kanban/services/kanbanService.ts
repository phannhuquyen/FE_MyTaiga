import type {
  KanbanTask,
  KanbanColumnConfig,
  KanbanColumnId,
  CreateTaskPayload,
  UpdateTaskPayload,
  WIPSettingsPayload,
} from '../types'
import { api, type BoardTaskCard } from '@/services/api'

const DEFAULT_COLUMNS: KanbanColumnConfig[] = [
  {
    id: 'todo',
    title: 'Cần làm',
    subtitleEn: 'To Do',
    colorDot: 'bg-neutral-400',
    wipLimit: null,
  },
  {
    id: 'in_progress',
    title: 'Đang làm',
    subtitleEn: 'In Progress',
    colorDot: 'bg-primary-500',
    wipLimit: 4,
  },
  {
    id: 'review',
    title: 'Đang kiểm tra',
    subtitleEn: 'Testing / Review',
    colorDot: 'bg-amber-500',
    wipLimit: 2,
  },
  {
    id: 'done',
    title: 'Hoàn thành',
    subtitleEn: 'Done',
    colorDot: 'bg-emerald-500',
    wipLimit: null,
  },
]

function statusToColumnId(status: string): KanbanColumnId {
  const upper = (status || '').toUpperCase()
  if (upper === 'IN_PROGRESS' || upper === 'PROGRESS') return 'in_progress'
  if (upper === 'IN_REVIEW' || upper === 'REVIEW' || upper === 'TESTING') return 'review'
  if (upper === 'DONE' || upper === 'CLOSED') return 'done'
  return 'todo'
}

function columnIdToStatus(columnId: KanbanColumnId): string {
  switch (columnId) {
    case 'in_progress':
      return 'IN_PROGRESS'
    case 'review':
      return 'IN_REVIEW'
    case 'done':
      return 'DONE'
    case 'todo':
    default:
      return 'TODO'
  }
}

function mapPriorityFromBe(p: string): 'urgent' | 'high' | 'medium' | 'low' {
  switch ((p || '').toUpperCase()) {
    case 'CRITICAL':
      return 'urgent'
    case 'HIGH':
      return 'high'
    case 'LOW':
      return 'low'
    case 'MEDIUM':
    default:
      return 'medium'
  }
}

function mapPriorityToBe(p?: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  switch ((p || '').toLowerCase()) {
    case 'urgent':
      return 'CRITICAL'
    case 'high':
      return 'HIGH'
    case 'low':
      return 'LOW'
    case 'medium':
    default:
      return 'MEDIUM'
  }
}

function computeRemainingDays(deadlineStr?: string | null): string {
  if (!deadlineStr) return 'Không có hạn'
  try {
    const deadline = new Date(deadlineStr)
    const now = new Date()
    const diffMs = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return `Quá hạn ${Math.abs(diffDays)} ngày`
    if (diffDays === 0) return 'Hạn chót hôm nay'
    return `Còn ${diffDays} ngày`
  } catch {
    return 'Không rõ'
  }
}

let columnsState: KanbanColumnConfig[] = [...DEFAULT_COLUMNS]
let tasksState: KanbanTask[] = []

export const kanbanService = {
  /**
   * Lấy danh sách cột bảng Kanban (kết nối API Board / WIP limits)
   */
  async getColumns(projectId?: number): Promise<KanbanColumnConfig[]> {
    if (projectId) {
      try {
        const res = await api.board.get(projectId)
        const cols = res.data.columns || []
        if (cols.length > 0) {
          columnsState = cols.map((col) => {
            const colId = statusToColumnId(col.columnName)
            return {
              id: colId,
              title: col.columnName === 'TODO' ? 'Cần làm' : col.columnName === 'IN_PROGRESS' ? 'Đang làm' : col.columnName === 'IN_REVIEW' ? 'Đang kiểm tra' : col.columnName === 'DONE' ? 'Hoàn thành' : col.columnName,
              subtitleEn: col.columnName,
              colorDot: colId === 'todo' ? 'bg-neutral-400' : colId === 'in_progress' ? 'bg-primary-500' : colId === 'review' ? 'bg-amber-500' : 'bg-emerald-500',
              wipLimit: col.wipLimit,
            }
          })
          return [...columnsState]
        }
      } catch (err) {
        console.warn('⚠️ [KanbanService] Lỗi tải columns từ API, dùng cấu hình mặc định:', err)
      }
    }
    return [...columnsState]
  },

  /**
   * Cập nhật giới hạn WIP cho cột
   */
  async updateWIPLimits(payload: WIPSettingsPayload, projectId?: number): Promise<KanbanColumnConfig[]> {
    if (projectId) {
      try {
        const boardRes = await api.board.get(projectId)
        const beCols = boardRes.data.columns || []

        for (const [colId, limit] of Object.entries(payload.limits)) {
          const matched = beCols.find((c) => statusToColumnId(c.columnName) === colId)
          if (matched) {
            if (limit !== null && limit !== undefined && limit > 0) {
              await api.wip.setLimit(projectId, matched.boardColumnId, { wipLimit: limit })
            } else {
              await api.wip.removeLimit(projectId, matched.boardColumnId)
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ [KanbanService] Lỗi lưu WIP limit lên BE:', err)
      }
    }

    columnsState = columnsState.map((col) => ({
      ...col,
      wipLimit: payload.limits[col.id] ?? null,
    }))
    return [...columnsState]
  },

  async toggleColumnCollapse(columnId: KanbanColumnId): Promise<KanbanColumnConfig[]> {
    columnsState = columnsState.map((col) =>
      col.id === columnId ? { ...col, isCollapsed: !col.isCollapsed } : col,
    )
    return [...columnsState]
  },

  /**
   * Lấy danh sách Task của bảng Kanban
   */
  async getTasks(
    projectId?: number,
    filters?: {
      search?: string
      assigneeName?: string
      priority?: string
      onlyMyTasks?: boolean
      columnId?: string
    },
  ): Promise<KanbanTask[]> {
    if (projectId) {
      try {
        const res = await api.board.get(projectId, { keyword: filters?.search })
        const beCols = res.data.columns || []
        const fetchedTasks: KanbanTask[] = []

        beCols.forEach((col) => {
          const colId = statusToColumnId(col.columnName)
          ;(col.tasks || []).forEach((t: BoardTaskCard, idx: number) => {
            const isOverdue = t.deadline ? new Date(t.deadline).getTime() < Date.now() : false
            fetchedTasks.push({
              id: String(t.taskId),
              code: `TASK-${t.taskId}`,
              title: t.title,
              columnId: colId,
              priority: mapPriorityFromBe(t.priority),
              deadline: t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : undefined,
              daysRemainingText: computeRemainingDays(t.deadline),
              isOverdue,
              assignee: {
                name: t.assigneeId ? `Thành viên #${t.assigneeId}` : 'Chưa giao',
                avatarCode: t.assigneeId ? `U${t.assigneeId}` : 'NA',
                role: 'Thực hiện',
              },
              pbiCode: t.parentTaskId ? `#TASK-${t.parentTaskId}` : undefined,
              subtasks: [],
              order: t.position ?? idx,
            })
          })
        })

        tasksState = fetchedTasks
        return fetchedTasks
      } catch (err) {
        console.warn('⚠️ [KanbanService] Lỗi tải tasks từ Board API:', err)
      }
    }

    return tasksState
  },

  async getTaskById(id: string): Promise<KanbanTask | null> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (numericId > 0) {
      try {
        const res = await api.tasks.get(numericId)
        const t = res.data.task
        const subtasks = res.data.subtasks || []
        return {
          id: String(t.taskId),
          code: `TASK-${t.taskId}`,
          title: t.title,
          description: t.description || undefined,
          columnId: statusToColumnId(t.status),
          priority: mapPriorityFromBe(t.priority),
          deadline: t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : undefined,
          daysRemainingText: computeRemainingDays(t.deadline),
          assignee: {
            name: t.assigneeId ? `Thành viên #${t.assigneeId}` : 'Chưa giao',
            avatarCode: t.assigneeId ? `U${t.assigneeId}` : 'NA',
          },
          subtasks: subtasks.map((s) => ({
            id: String(s.taskId),
            title: s.title,
            completed: s.status === 'DONE',
            statusLabel: s.status === 'DONE' ? 'Xong' : 'Đang làm',
          })),
          order: t.position,
        }
      } catch (err) {
        console.warn('⚠️ [KanbanService] Lỗi lấy chi tiết task từ API:', err)
      }
    }
    return tasksState.find((t) => t.id === id) || null
  },

  /**
   * Tạo công việc mới (Task)
   */
  async createTask(payload: CreateTaskPayload, projectId?: number): Promise<KanbanTask> {
    if (!payload.title || payload.title.trim().length === 0) {
      throw new Error('Tiêu đề tác vụ không được để trống.')
    }

    if (projectId) {
      try {
        const res = await api.tasks.create(projectId, {
          title: payload.title.trim(),
          description: payload.description,
          priority: mapPriorityToBe(payload.priority),
          deadline: payload.deadline ? new Date(payload.deadline).toISOString() : null,
        })

        const t = res.data
        const newTask: KanbanTask = {
          id: String(t.taskId),
          code: `TASK-${t.taskId}`,
          title: t.title,
          description: t.description || undefined,
          columnId: statusToColumnId(t.status),
          priority: mapPriorityFromBe(t.priority),
          deadline: t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : undefined,
          daysRemainingText: computeRemainingDays(t.deadline),
          assignee: {
            name: 'Chưa giao',
            avatarCode: 'NA',
          },
          subtasks: [],
          order: t.position,
        }
        tasksState = [newTask, ...tasksState]
        return newTask
      } catch (err: unknown) {
        const errorObj = err as { response?: { status?: number; data?: { message?: string } } }
        if (errorObj.response?.status === 409) {
          throw new Error(errorObj.response?.data?.message || 'Không thể tạo task: Cột Cần làm (TODO) đã đầy giới hạn WIP.')
        }
        throw new Error(errorObj.response?.data?.message || 'Lỗi khi tạo công việc mới.')
      }
    }

    const nextNum = tasksState.length + 242
    const targetColumnId = payload.columnId || 'todo'
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      code: `TASK-${nextNum}`,
      title: payload.title.trim(),
      description: payload.description || '',
      columnId: targetColumnId,
      priority: payload.priority || 'medium',
      deadline: payload.deadline,
      assignee: {
        name: payload.assigneeName || 'Minh Quân',
        avatarCode: 'MQ',
      },
      subtasks: [],
      order: 0,
    }
    tasksState = [newTask, ...tasksState]
    return newTask
  },

  /**
   * Cập nhật công việc
   */
  async updateTask(id: string, payload: UpdateTaskPayload): Promise<KanbanTask> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (numericId > 0) {
      try {
        if (payload.title !== undefined) {
          await api.tasks.update(numericId, {
            title: payload.title,
            description: payload.description,
          })
        }
        if (payload.priority) {
          await api.tasks.changePriority(numericId, {
            priority: mapPriorityToBe(payload.priority),
          })
        }
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } }
        console.warn('⚠️ Lỗi cập nhật task lên API:', errorObj.response?.data?.message)
      }
    }

    const index = tasksState.findIndex((t) => t.id === id)
    if (index !== -1) {
      const current = tasksState[index]
      tasksState[index] = {
        ...current,
        ...payload,
      }
      return tasksState[index]
    }
    throw new Error('Không tìm thấy tác vụ.')
  },

  /**
   * Di chuyển công việc (Transactional Board Move + WIP check)
   */
  async moveTask(
    taskId: string,
    targetColumnId: KanbanColumnId,
    newPosition: number = 0,
  ): Promise<{ task: KanbanTask; isWIPExceeded: boolean }> {
    const numericId = parseInt(taskId.replace(/\D/g, ''), 10)
    if (numericId > 0) {
      try {
        const res = await api.board.move(numericId, {
          toStatus: columnIdToStatus(targetColumnId),
          newPosition,
        })
        const taskIndex = tasksState.findIndex((t) => t.id === taskId)
        if (taskIndex !== -1) {
          tasksState[taskIndex].columnId = targetColumnId
          tasksState[taskIndex].order = res.data.position
        }
        return { task: tasksState[taskIndex] || ({} as KanbanTask), isWIPExceeded: false }
      } catch (err: unknown) {
        const errorObj = err as { response?: { status?: number; data?: { message?: string } } }
        const status = errorObj.response?.status
        const msg = errorObj.response?.data?.message
        if (status === 409) {
          throw new Error(msg || 'Không thể chuyển: Cột đích đã đạt giới hạn WIP tối đa.')
        }
        throw new Error(msg || 'Lỗi khi di chuyển công việc.')
      }
    }

    const index = tasksState.findIndex((t) => t.id === taskId)
    if (index === -1) throw new Error('Không tìm thấy tác vụ để chuyển.')
    tasksState[index].columnId = targetColumnId
    tasksState[index].order = newPosition
    return { task: tasksState[index], isWIPExceeded: false }
  },

  /**
   * Xóa công việc
   */
  async deleteTask(id: string): Promise<boolean> {
    const numericId = parseInt(id.replace(/\D/g, ''), 10)
    if (numericId > 0) {
      try {
        await api.tasks.delete(numericId)
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } }
        throw new Error(errorObj.response?.data?.message || 'Không thể xóa công việc (có thể còn Subtask hoặc Bug liên kết).')
      }
    }
    tasksState = tasksState.filter((t) => t.id !== id)
    return true
  },

  async toggleSubtask(taskId: string, subtaskId: string): Promise<KanbanTask> {
    const task = tasksState.find((t) => t.id === taskId)
    if (!task) throw new Error('Không tìm thấy tác vụ.')
    const sub = task.subtasks.find((s) => s.id === subtaskId)
    if (sub) {
      sub.completed = !sub.completed
      sub.statusLabel = sub.completed ? 'Xong' : 'Đang làm'
      const numSubId = parseInt(subtaskId.replace(/\D/g, ''), 10)
      if (numSubId > 0) {
        try {
          await api.board.move(numSubId, {
            toStatus: sub.completed ? 'DONE' : 'IN_PROGRESS',
            newPosition: 0,
          })
        } catch (err) {
          console.warn('⚠️ Lỗi chuyển trạng thái subtask trên BE:', err)
        }
      }
    }
    return task
  },

  async addSubtask(taskId: string, title: string): Promise<KanbanTask> {
    const task = tasksState.find((t) => t.id === taskId)
    if (!task) throw new Error('Không tìm thấy tác vụ.')
    const numericParentId = parseInt(taskId.replace(/\D/g, ''), 10)

    let createdId = `st-${Date.now()}`
    if (numericParentId > 0) {
      try {
        const res = await api.tasks.createSubtask(numericParentId, { title })
        createdId = String(res.data.taskId)
      } catch (err) {
        console.warn('⚠️ Lỗi tạo subtask trên BE:', err)
      }
    }

    task.subtasks.push({
      id: createdId,
      title: title.trim(),
      completed: false,
      statusLabel: 'Chờ',
    })
    return task
  },

  async addComment(taskId: string, content: string): Promise<KanbanTask> {
    const task = tasksState.find((t) => t.id === taskId)
    if (!task) throw new Error('Không tìm thấy tác vụ.')
    const numericId = parseInt(taskId.replace(/\D/g, ''), 10)

    let commentId = `cm-${Date.now()}`
    if (numericId > 0) {
      try {
        const res = await api.comments.createForTask(numericId, { content })
        commentId = String(res.data.commentId)
      } catch (err) {
        console.warn('⚠️ Lỗi gửi comment lên BE:', err)
      }
    }

    task.comments = task.comments || []
    task.comments.push({
      id: commentId,
      authorName: 'Tôi',
      authorRole: 'Thành viên',
      authorAvatar: 'ME',
      timestamp: 'Vừa xong',
      content: content.trim(),
    })
    return task
  },
}
