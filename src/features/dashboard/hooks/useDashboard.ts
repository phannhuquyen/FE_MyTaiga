import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { dashboardService } from '../services/dashboardService'
import type { CreateDashboardWork, TaskItem } from '../types'

type DashboardData = Awaited<ReturnType<typeof dashboardService.load>>
export function useDashboard() {
  const { projectId: rawId } = useParams()
  const projectId = Number(rawId)
  const [data, setData] = useState<DashboardData | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [detail, setDetail] = useState<TaskItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const version = useRef(0)
  const refresh = useCallback(async () => {
    const current = ++version.current
    try {
      const result = await dashboardService.load(projectId)
      if (current !== version.current) return
      setData(result)
      setSelectedTaskId(previous => result.tasks.some(task => task.id === previous) ? previous : result.tasks[0]?.id || '')
      setError(null)
    } catch {
      if (current === version.current) setError('Không thể tải dữ liệu dự án từ máy chủ. Vui lòng thử lại.')
    } finally { if (current === version.current) setIsLoading(false) }
  }, [projectId])
  useEffect(() => {
    void refresh()
    const onFocus = () => { void refresh() }
    window.addEventListener('focus', onFocus)
    return () => { version.current++; window.removeEventListener('focus', onFocus) }
  }, [refresh])
  const task = data?.tasks.find(item => item.id === selectedTaskId) || null
  useEffect(() => {
    let cancelled = false
    if (task) dashboardService.getDetail(task, projectId).then(result => {
      if (!cancelled) setDetail(result)
    }).catch(() => { if (!cancelled) { setDetail(null); setError('Không thể tải chi tiết công việc. Vui lòng thử lại.') } })
    return () => { cancelled = true }
  }, [task, projectId])
  const selectedTask = detail?.id === task?.id ? detail : task
  const handleCreateTask = async (input: CreateDashboardWork) => {
    const created = await dashboardService.createTask(projectId, input)
    await refresh()
    setSelectedTaskId(created.id)
    setIsCreateModalOpen(false)
    setToastMessage(`Đã lưu ${created.code}. Xem tại ${created.type === 'Task' ? 'Bảng Kanban' : created.type === 'Story' ? 'Backlog' : 'Bugs'} và Tổng quan.`)
  }
  const handleAddComment = async (content: string) => {
    if (!selectedTask?.commentTaskId) throw new Error('Chưa có API bình luận cho Story. Vui lòng dùng chi tiết Backlog.')
    await dashboardService.addComment(selectedTask.commentTaskId, content)
    setDetail(await dashboardService.getDetail(selectedTask, projectId))
    await refresh()
  }
  const handleToggleDoD = async () => { setError('Backend chưa cung cấp API Definition of Done.') }
  const term = searchTerm.trim().toLowerCase()
  return { project: data?.project, sprint: data?.sprint || null, tasks: (data?.tasks || []).filter(item => !term || `${item.title} ${item.code} ${item.type} ${item.status}`.toLowerCase().includes(term)), allTasksCount: data?.tasks.length || 0, activities: data?.activities || [], options: data?.options || { epics: [], tasks: [], members: [] }, selectedTask, selectedTaskId, setSelectedTaskId, searchTerm, setSearchTerm, isLoading, error, refresh, isCreateModalOpen, setIsCreateModalOpen, toastMessage, setToastMessage, handleToggleDoD, handleAddComment, handleCreateTask }
}
