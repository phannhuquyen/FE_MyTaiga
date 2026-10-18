import { useState } from 'react'
import {
  mockActivities,
  mockProject,
  mockSprint,
  mockTasks,
} from '../mocks/dashboard.mock'
import { dashboardService } from '../services/dashboardService'
import type {
  ActivityItem,
  ProjectInfo,
  SprintInfo,
  TaskItem,
} from '../types'

export function useDashboard() {
  const [project] = useState<ProjectInfo>(mockProject)
  const [sprint] = useState<SprintInfo>(mockSprint)
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks)
  const [activities] = useState<ActivityItem[]>(mockActivities)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('task-104')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Selected task computed from tasks state
  const selectedTask =
    tasks.find((t) => t.id === selectedTaskId) || tasks[0] || null

  // Filtered tasks based on search
  const filteredTasks = tasks.filter((t) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      t.title.toLowerCase().includes(term) ||
      t.code.toLowerCase().includes(term) ||
      t.type.toLowerCase().includes(term) ||
      t.status.toLowerCase().includes(term)
    )
  })

  // Action: Toggle DoD item
  const handleToggleDoD = async (dodId: string) => {
    if (!selectedTask) return
    const updated = await dashboardService.toggleDoD(selectedTask.id, dodId)
    if (updated) {
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      )
    }
  }

  // Action: Add quick comment
  const handleAddComment = async (content: string) => {
    if (!selectedTask || !content.trim()) return
    const newComment = await dashboardService.addComment(
      selectedTask.id,
      content,
    )
    if (newComment) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? { ...t, comments: [...t.comments, newComment] }
            : t,
        ),
      )
    }
  }

  // Action: Create quick task
  const handleCreateTask = async (
    taskData: Omit<TaskItem, 'id' | 'dod' | 'comments'>,
  ) => {
    const created = await dashboardService.createTask(taskData)
    setTasks((prev) => [created, ...prev])
    setSelectedTaskId(created.id)
    setIsCreateModalOpen(false)
    setToastMessage(`Đã tạo thành công công việc ${created.code}!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return {
    project,
    sprint,
    tasks: filteredTasks,
    allTasksCount: tasks.length,
    selectedTask,
    activities,
    selectedTaskId,
    setSelectedTaskId,
    searchTerm,
    setSearchTerm,
    isLoading,
    isCreateModalOpen,
    setIsCreateModalOpen,
    toastMessage,
    setToastMessage,
    handleToggleDoD,
    handleAddComment,
    handleCreateTask,
  }
}
