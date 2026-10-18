import type {
  ActivityItem,
  ProjectInfo,
  SprintInfo,
  TaskComment,
  TaskItem,
} from '../types'
import {
  mockActivities,
  mockProject,
  mockSprint,
  mockTasks,
} from '../mocks/dashboard.mock'

/**
 * In-memory local state simulation for demo interactions.
 * Later, these functions will be replaced by API calls (e.g. fetch / axios).
 */
let tasksState: TaskItem[] = [...mockTasks]

export const dashboardService = {
  async getProject(): Promise<ProjectInfo> {
    // Simulate lightweight async delay for realistic loading state
    return Promise.resolve({ ...mockProject })
  },

  async getSprint(): Promise<SprintInfo> {
    return Promise.resolve({ ...mockSprint })
  },

  async getMyTasks(): Promise<TaskItem[]> {
    return Promise.resolve([...tasksState])
  },

  async getActivities(): Promise<ActivityItem[]> {
    return Promise.resolve([...mockActivities])
  },

  async toggleDoD(taskId: string, dodId: string): Promise<TaskItem | null> {
    const taskIndex = tasksState.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) return null

    const task = tasksState[taskIndex]
    const updatedDoD = task.dod.map((item) =>
      item.id === dodId ? { ...item, completed: !item.completed } : item,
    )

    const updatedTask = { ...task, dod: updatedDoD }
    tasksState[taskIndex] = updatedTask
    return Promise.resolve(updatedTask)
  },

  async addComment(
    taskId: string,
    content: string,
  ): Promise<TaskComment | null> {
    const taskIndex = tasksState.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) return null

    const newComment: TaskComment = {
      id: `cmt-${Date.now()}`,
      author: 'Bạn (Admin)',
      authorAvatar: 'AD',
      content,
      timeAgo: 'Vừa xong',
      createdAt: new Date().toISOString(),
    }

    const task = tasksState[taskIndex]
    const updatedTask = {
      ...task,
      comments: [...task.comments, newComment],
    }
    tasksState[taskIndex] = updatedTask
    return Promise.resolve(newComment)
  },

  async createTask(
    newTaskData: Omit<TaskItem, 'id' | 'dod' | 'comments'>,
  ): Promise<TaskItem> {
    const newTask: TaskItem = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      dod: [
        {
          id: `dod-${Date.now()}-1`,
          content: 'Kiểm tra nghiệp vụ cơ bản',
          completed: false,
        },
      ],
      comments: [],
    }

    tasksState = [newTask, ...tasksState]
    return Promise.resolve(newTask)
  },
}
