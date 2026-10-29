import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityTimelineCard } from './components/ActivityTimelineCard'
import { CreateTaskModal } from './components/CreateTaskModal'
import { MyTasksCard } from './components/MyTasksCard'
import { ProjectHeader } from './components/ProjectHeader'
import { SprintBanner } from './components/SprintBanner'
import { TaskDetailPanel } from './components/TaskDetailPanel'
import { useDashboard } from './hooks/useDashboard'

export default function DashboardPage() {
  const navigate = useNavigate()
  const {
    project,
    sprint,
    tasks,
    allTasksCount,
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
    error,
    refresh,
    options,
  } = useDashboard()

  // Listen to header quick-create button
  useEffect(() => {
    const handleQuickCreateEvent = () => setIsCreateModalOpen(true)
    window.addEventListener('open-quick-create', handleQuickCreateEvent)
    return () =>
      window.removeEventListener('open-quick-create', handleQuickCreateEvent)
  }, [setIsCreateModalOpen])

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-28 bg-whiteboard rounded-lg border border-neutral-200" />
        <div className="h-24 bg-whiteboard rounded-lg border border-neutral-200" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="h-64 bg-whiteboard rounded-lg border border-neutral-200" />
            <div className="h-48 bg-whiteboard rounded-lg border border-neutral-200" />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="h-96 bg-whiteboard rounded-lg border border-neutral-200" />
          </div>
        </div>
      </div>
    )
  }

  if (!project) return <div role="alert" className="p-6">{error}<button onClick={() => { void refresh() }}>Thử lại</button></div>

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {error && <p role="alert" className="text-error-700">{error}</p>}
      <button type="button" onClick={() => { void refresh() }} className="text-primary-700">Làm mới dữ liệu dự án</button>
      <input aria-label="Tìm công việc dự án" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tìm Task, Story, Bug trong dự án..." className="border border-neutral-200 rounded px-3 py-2 ml-3" />
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-whiteboard px-4 py-2.5 rounded shadow-lg flex items-center gap-2 text-body-sm transition-all animate-bounce">
          <span className="text-success-400">✓</span>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-neutral-400 hover:text-whiteboard cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Project Header & Progress */}
      <ProjectHeader
        project={project}
        onConfigureWorkflow={() => {
          navigate(`/projects/${project.id}/kanban`)
        }}
        onAddTask={() => setIsCreateModalOpen(true)}
      />

      {/* 2. Active Sprint Banner */}
      <SprintBanner sprint={sprint} />

      {/* 3. Main Dashboard Grid (Tasks + Timeline + Task Detail Drawer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: My Tasks + Activity Timeline */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          <MyTasksCard
            tasks={tasks}
            allTasksCount={allTasksCount}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            searchTerm={searchTerm}
          />

          <ActivityTimelineCard activities={activities} />
        </div>

        {/* Right Column: Task Detail Panel */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
          <TaskDetailPanel
            task={selectedTask}
            onToggleDoD={handleToggleDoD}
            onAddComment={handleAddComment}
          />
        </div>
      </div>

      {/* Quick Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
        currentTaskCount={allTasksCount}
        options={options}
      />
    </div>
  )
}
