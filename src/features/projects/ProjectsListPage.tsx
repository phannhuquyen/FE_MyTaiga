import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { projectService } from './services/projectService'
import type { CreateProjectPayload, Project, ProjectStatus, UpdateProjectPayload } from './types'
import { CreateProjectModal } from './components/CreateProjectModal'
import { EditProjectModal } from './components/EditProjectModal'
import { DeleteProjectModal } from './components/DeleteProjectModal'
import { ProjectActionMenu } from './components/ProjectActionMenu'
import { ProfileToast } from '@/features/profile'

export default function ProjectsListPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ProjectStatus>('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [counts, setCounts] = useState({ activeCount: 4, closedCount: 2, totalMembers: 18 })
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  // Toast feedback state
  const [toastState, setToastState] = useState<{
    isVisible: boolean
    message?: string
    description?: string
  }>({
    isVisible: false,
  })

  // Load projects
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [list, countData] = await Promise.all([
        projectService.getProjects(activeTab, searchTerm),
        projectService.getProjectCounts(),
      ])
      setProjects(list)
      setCounts(countData)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, searchTerm])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const handleQuickCreate = () => setIsCreateOpen(true)
    window.addEventListener('open-quick-create', handleQuickCreate)
    return () => window.removeEventListener('open-quick-create', handleQuickCreate)
  }, [])

  // Create Project
  const handleCreateProject = async (payload: CreateProjectPayload) => {
    const created = await projectService.createProject(payload)
    await loadData()
    setToastState({
      isVisible: true,
      message: 'Khởi tạo dự án thành công',
      description: `Dự án "${created.name}" đã được thêm vào không gian làm việc.`,
    })
  }

  // Update Project
  const handleUpdateProject = async (id: string, payload: UpdateProjectPayload) => {
    const updated = await projectService.updateProject(id, payload)
    await loadData()
    setToastState({
      isVisible: true,
      message: 'Đã cập nhật dự án thành công',
      description: `Thông tin dự án "${updated.name}" đã được lưu.`,
    })
  }

  // Toggle Project Status (Close / Reopen)
  const handleToggleStatus = async (id: string) => {
    const updated = await projectService.toggleProjectStatus(id)
    await loadData()
    setToastState({
      isVisible: true,
      message: updated.status === 'closed' ? 'Đã đóng dự án' : 'Đã mở lại dự án',
      description: `Dự án "${updated.name}" đã chuyển sang trạng thái ${updated.statusText}.`,
    })
  }

  // Delete Project
  const handleDeleteProject = async (id: string) => {
    await projectService.deleteProject(id)
    await loadData()
    setToastState({
      isVisible: true,
      message: 'Đã xóa dự án vĩnh viễn',
      description: 'Dự án đã được loại bỏ hoàn toàn khỏi hệ thống.',
    })
  }

  // Filtered display
  const activeProjectsCount = useMemo(() => counts.activeCount, [counts.activeCount])
  const closedProjectsCount = useMemo(() => counts.closedCount, [counts.closedCount])

  return (
    <div className="min-h-full bg-paper-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ── Top Header Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-body-sm text-neutral-500 mb-2"
          >
            <span className="hover:text-neutral-800 transition-colors cursor-pointer">
              Dự án
            </span>
            <span className="text-neutral-400">/</span>
            <span className="font-semibold text-neutral-900">
              Dự án của tôi
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-50 text-primary-700 border border-primary-200">
              Quản lý
            </span>
          </nav>

          <h1 className="text-headline-lg font-bold text-neutral-900 tracking-tight">
            Dự án của tôi
          </h1>
          <p className="text-body-sm text-neutral-500 mt-1">
            Giám sát tiến độ, phân bổ nhân sự và chu kỳ bàn giao các sản phẩm đang quản lý.
          </p>
        </div>

        {/* + Tạo dự án button */}
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-whiteboard rounded-lg text-body-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Icon name="plus" size={16} />
          <span>Tạo dự án</span>
        </button>
      </div>

      {/* ── Tabs & Search Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-body-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Đang thực hiện</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === 'active'
                  ? 'bg-primary-600 text-whiteboard'
                  : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              {activeProjectsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('closed')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-body-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'closed'
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Đã đóng</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === 'closed'
                  ? 'bg-primary-600 text-whiteboard'
                  : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              {closedProjectsCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên dự án..."
            className="w-full pl-9 pr-3.5 py-1.5 text-body-sm bg-whiteboard border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors placeholder:text-neutral-400 text-neutral-900 shadow-xs"
          />
        </div>
      </div>

      {/* ── Projects List Container ── */}
      <div className="bg-whiteboard rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-neutral-100 text-label-uppercase font-semibold text-neutral-400 text-[11px] tracking-wider">
          <div className="col-span-12 md:col-span-5">Tên dự án & Phạm vi</div>
          <div className="hidden md:block md:col-span-3">Thời gian thực hiện</div>
          <div className="hidden md:block md:col-span-2">Thành viên</div>
          <div className="hidden md:block md:col-span-2 text-right">Trạng thái</div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500 flex flex-col items-center gap-3">
            <Icon name="refresh" size={24} className="animate-spin text-primary-600" />
            <span className="text-body-sm">Đang tải danh sách dự án...</span>
          </div>
        ) : projects.length === 0 ? (
          /* Empty state */
          <div className="p-12 text-center text-neutral-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-paper-100 flex items-center justify-center mx-auto text-neutral-400">
              <Icon name="folder" size={24} />
            </div>
            <div className="text-body-medium font-semibold text-neutral-800">
              Không tìm thấy dự án nào
            </div>
            <p className="text-body-xs text-neutral-500 max-w-sm mx-auto">
              {searchTerm
                ? `Không có kết quả khớp với "${searchTerm}". Thử tìm từ khóa khác.`
                : activeTab === 'closed'
                ? 'Chưa có dự án nào được đóng hoặc lưu trữ.'
                : 'Bắt đầu bằng cách tạo dự án mới cho nhóm của bạn.'}
            </p>
            {activeTab === 'active' && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-500 text-whiteboard text-body-xs font-semibold rounded-lg hover:bg-primary-600 cursor-pointer"
              >
                <Icon name="plus" size={14} />
                <span>Tạo dự án mới</span>
              </button>
            )}
          </div>
        ) : (
          /* Projects rows */
          <div className="divide-y divide-neutral-100">
            {projects.map((project) => (
              <div
                key={project.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-paper-50 transition-colors group relative"
              >
                {/* Col 1: Tên dự án & Phạm vi */}
                <div className="col-span-12 md:col-span-5 flex items-start gap-3.5 min-w-0">
                  {/* Square key badge */}
                  <div
                    onClick={() => navigate('/dashboard')}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-body-sm shrink-0 shadow-xs border border-neutral-200/80 cursor-pointer hover:scale-105 transition-transform ${project.colorClass}`}
                    title="Truy cập bảng điều khiển dự án"
                  >
                    {project.key}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/dashboard"
                        className="text-body-medium font-bold text-neutral-900 hover:text-primary-600 transition-colors truncate"
                      >
                        {project.name}
                      </Link>
                      {project.versionTag && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold text-neutral-500 bg-neutral-100 border border-neutral-200">
                          {project.versionTag}
                        </span>
                      )}
                      {project.badgeTag && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          project.badgeTag === 'Ưu tiên cao'
                            ? 'bg-warning-50 text-warning-700 border border-warning-200'
                            : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                        }`}>
                          {project.badgeTag}
                        </span>
                      )}
                    </div>
                    <p className="text-body-xs text-neutral-500 mt-1 line-clamp-1 leading-snug">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Col 2: Thời gian thực hiện */}
                <div className="hidden md:flex col-span-3 items-center gap-1.5 text-body-xs text-neutral-600">
                  <Icon name="calendar" size={14} className="text-neutral-400 shrink-0" />
                  <span>
                    {project.startDate} — {project.endDate}
                  </span>
                </div>

                {/* Col 3: Thành viên */}
                <div className="hidden md:flex col-span-2 items-center">
                  <div className="flex -space-x-1.5 overflow-hidden items-center">
                    {project.members.slice(0, 4).map((member, i) => (
                      <div
                        key={i}
                        className={`inline-block h-6 w-6 rounded-full text-[10px] font-bold text-whiteboard flex items-center justify-center ring-2 ring-whiteboard ${
                          member.bgColor || 'bg-neutral-700'
                        }`}
                        title={member.name}
                      >
                        {member.avatarCode}
                      </div>
                    ))}
                    {project.totalMembersCount > project.members.length && (
                      <div className="h-6 px-1.5 rounded-full bg-paper-100 text-[10px] font-bold text-neutral-600 flex items-center justify-center ring-2 ring-whiteboard border border-neutral-200">
                        +{project.totalMembersCount - project.members.length}
                      </div>
                    )}
                  </div>
                </div>

                {/* Col 4: Trạng thái & Action Menu */}
                <div className="hidden md:flex col-span-2 items-center justify-end gap-3">
                  <div className="inline-flex items-center gap-1.5 text-body-xs font-medium text-neutral-700">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        project.status === 'active' ? 'bg-primary-500' : 'bg-neutral-400'
                      }`}
                    />
                    <span>{project.statusText}</span>
                  </div>

                  {/* Context Menu Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setMenuOpenId((prev) => (prev === project.id ? null : project.id))
                      }
                      className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                      title="Tùy chọn dự án"
                      aria-label="Tùy chọn dự án"
                    >
                      <Icon name="more-vertical" size={16} />
                    </button>

                    <ProjectActionMenu
                      project={project}
                      isOpen={menuOpenId === project.id}
                      onClose={() => setMenuOpenId(null)}
                      onEdit={() => setEditingProject(project)}
                      onToggleStatus={() => handleToggleStatus(project.id)}
                      onDelete={() => setDeletingProject(project)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer Stats Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-body-xs text-neutral-500 px-2 pt-2">
        <div>
          Tổng cộng: <strong className="text-neutral-700">{counts.activeCount} dự án kích hoạt</strong> •{' '}
          {counts.totalMembers} nhân sự tham gia
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-500" />
            <span>Đang hoạt động: {counts.activeCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neutral-400" />
            <span>Lưu trữ / Đóng: {counts.closedCount}</span>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateProject}
      />

      <EditProjectModal
        isOpen={!!editingProject}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleUpdateProject}
      />

      <DeleteProjectModal
        isOpen={!!deletingProject}
        project={deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirmDelete={handleDeleteProject}
        onSwitchToCloseProject={handleToggleStatus}
      />

      {/* ── Toast Feedback ── */}
      <ProfileToast
        isVisible={toastState.isVisible}
        message={toastState.message}
        description={toastState.description}
        onClose={() => setToastState((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}
