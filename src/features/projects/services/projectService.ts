import type {
  CreateProjectPayload,
  Project,
  ProjectStatus,
  UpdateProjectPayload,
} from '../types'

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj-001',
    key: 'SC',
    code: 'SB-CORE',
    name: 'ScrumBan Core Platform',
    versionTag: 'V2.4',
    description: 'Hệ thống điều phối luồng công việc linh hoạt hỗ trợ quy chuẩn Scrum kết hợp',
    startDate: '01/10/2024',
    endDate: '31/03/2025',
    methodology: 'scrumban',
    leadName: 'Nguyễn Minh Quân (Bạn)',
    leadAvatar: 'MQ',
    members: [
      { name: 'Anh Khoa', avatarCode: 'AK', bgColor: 'bg-neutral-800' },
      { name: 'Mai Linh', avatarCode: 'ML', bgColor: 'bg-primary-800' },
      { name: 'Quốc Bảo', avatarCode: 'QB', bgColor: 'bg-amber-900' },
      { name: 'Thu Hà', avatarCode: 'TH', bgColor: 'bg-neutral-700' },
    ],
    totalMembersCount: 7,
    status: 'active',
    statusText: 'Đang thực hiện',
    colorClass: 'bg-primary-50 text-primary-700',
    createdAt: '2024-10-01',
  },
  {
    id: 'prj-002',
    key: 'MA',
    code: 'MA-APP',
    name: 'Mobile App Giao Hàng & Kho Vận',
    badgeTag: 'Ưu tiên cao',
    description: 'Ứng dụng di động Flutter dành cho tài xế và nhân viên kiểm kho thời gian thực',
    startDate: '15/11/2024',
    endDate: '15/05/2025',
    methodology: 'scrumban',
    leadName: 'Nguyễn Minh Quân (Bạn)',
    leadAvatar: 'MQ',
    members: [
      { name: 'Minh Tuấn', avatarCode: 'MT', bgColor: 'bg-primary-800' },
      { name: 'Yến Nhi', avatarCode: 'YN', bgColor: 'bg-neutral-800' },
      { name: 'Khắc Việt', avatarCode: 'KV', bgColor: 'bg-amber-900' },
    ],
    totalMembersCount: 4,
    status: 'active',
    statusText: 'Đang thực hiện',
    colorClass: 'bg-neutral-100 text-neutral-700',
    createdAt: '2024-11-15',
  },
  {
    id: 'prj-003',
    key: 'DS',
    code: 'DS-SYS',
    name: 'Hệ thống Thiết kế Thống nhất (DS)',
    description: 'Kho UI components, chuẩn hoá token Tailwind & thư viện Figma cho 5 squad',
    startDate: '01/08/2024',
    endDate: '28/02/2025',
    methodology: 'kanban',
    leadName: 'Nguyễn Minh Quân (Bạn)',
    leadAvatar: 'MQ',
    members: [
      { name: 'Thanh Mai', avatarCode: 'TM', bgColor: 'bg-neutral-800' },
      { name: 'Hoàng Long', avatarCode: 'HL', bgColor: 'bg-primary-700' },
    ],
    totalMembersCount: 2,
    status: 'active',
    statusText: 'Đang thực hiện',
    colorClass: 'bg-primary-50 text-primary-700',
    createdAt: '2024-08-01',
  },
  {
    id: 'prj-004',
    key: 'PG',
    code: 'PG-NAPAS',
    name: 'Cổng Thanh toán & Đối soát Napas',
    badgeTag: 'Bảo mật',
    description: 'Tích hợp dịch vụ thanh toán QR code động và webhook đối soát tự động hàng',
    startDate: '10/12/2024',
    endDate: '30/06/2025',
    methodology: 'scrumban',
    leadName: 'Nguyễn Minh Quân (Bạn)',
    leadAvatar: 'MQ',
    members: [
      { name: 'Minh Cường', avatarCode: 'MC', bgColor: 'bg-neutral-900' },
      { name: 'Hải Đăng', avatarCode: 'HD', bgColor: 'bg-amber-900' },
      { name: 'Phương Uyên', avatarCode: 'PU', bgColor: 'bg-primary-800' },
      { name: 'Gia Huy', avatarCode: 'GH', bgColor: 'bg-neutral-700' },
    ],
    totalMembersCount: 6,
    status: 'active',
    statusText: 'Đang thực hiện',
    colorClass: 'bg-amber-50 text-amber-800',
    createdAt: '2024-12-10',
  },
  {
    id: 'prj-005',
    key: 'ID',
    code: 'IAM-SEC',
    name: 'Cổng Xác thực Định danh IAM (Cũ)',
    badgeTag: 'Lưu trữ',
    description: 'Hệ thống Single Sign-On (SSO) và phân quyền RBAC thế hệ cũ.',
    startDate: '01/01/2024',
    endDate: '30/06/2024',
    methodology: 'kanban',
    leadName: 'Nguyễn Minh Quân (Bạn)',
    leadAvatar: 'MQ',
    members: [
      { name: 'Anh Khoa', avatarCode: 'AK', bgColor: 'bg-neutral-800' },
      { name: 'Quốc Bảo', avatarCode: 'QB', bgColor: 'bg-amber-900' },
    ],
    totalMembersCount: 2,
    status: 'closed',
    statusText: 'Đã đóng',
    colorClass: 'bg-neutral-100 text-neutral-600',
    createdAt: '2024-01-01',
  },
  {
    id: 'prj-006',
    key: 'WS',
    code: 'WEB-PORTAL',
    name: 'Website Cổng thông tin Khách hàng v1',
    badgeTag: 'Hoàn thành',
    description: 'Trang tra cứu đơn hàng và hóa đơn điện tử cho khối bán lẻ.',
    startDate: '15/02/2024',
    endDate: '15/08/2024',
    methodology: 'scrumban',
    leadName: 'Nguyễn Minh Quân (Bạn)',
    leadAvatar: 'MQ',
    members: [
      { name: 'Mai Linh', avatarCode: 'ML', bgColor: 'bg-primary-800' },
      { name: 'Thu Hà', avatarCode: 'TH', bgColor: 'bg-neutral-700' },
    ],
    totalMembersCount: 2,
    status: 'closed',
    statusText: 'Đã đóng',
    colorClass: 'bg-neutral-100 text-neutral-600',
    createdAt: '2024-02-15',
  },
]

class ProjectService {
  private projects: Project[] = [...INITIAL_PROJECTS]

  async getProjects(status?: ProjectStatus, search?: string): Promise<Project[]> {
    await new Promise((r) => setTimeout(r, 80))
    let result = [...this.projects]

    if (status) {
      result = result.filter((p) => p.status === status)
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
    }

    return result
  }

  async getProjectCounts(): Promise<{ activeCount: number; closedCount: number; totalMembers: number }> {
    const active = this.projects.filter((p) => p.status === 'active')
    const closed = this.projects.filter((p) => p.status === 'closed')
    const totalMembers = active.reduce((sum, p) => sum + p.totalMembersCount, 0)
    return {
      activeCount: active.length,
      closedCount: closed.length,
      totalMembers,
    }
  }

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    const name = payload.name.trim()
    if (!name) {
      throw new Error('Tên dự án không được để trống.')
    }

    const key = payload.key.trim().toUpperCase() || 'NEW'
    await new Promise((r) => setTimeout(r, 120))

    const newProject: Project = {
      id: `prj-${Date.now().toString(36)}`,
      key: key.slice(0, 2),
      code: key,
      name,
      description: payload.description?.trim() || 'Dự án mới khởi tạo trên ScrumBan Flow',
      startDate: payload.startDate || '15/11/2024',
      endDate: payload.endDate || '30/04/2025',
      methodology: payload.methodology,
      leadName: 'Nguyễn Minh Quân (Bạn)',
      leadAvatar: 'MQ',
      members: [{ name: 'Nguyễn Minh Quân', avatarCode: 'MQ', bgColor: 'bg-primary-700' }],
      totalMembersCount: 1,
      status: 'active',
      statusText: 'Đang thực hiện',
      colorClass: 'bg-primary-50 text-primary-700',
      createdAt: new Date().toISOString(),
    }

    this.projects = [newProject, ...this.projects]
    return newProject
  }

  async updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const name = payload.name.trim()
    if (!name) {
      throw new Error('Tên dự án không được để trống.')
    }

    await new Promise((r) => setTimeout(r, 100))

    const index = this.projects.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error('Không tìm thấy dự án yêu cầu.')
    }

    const updated: Project = {
      ...this.projects[index],
      name,
      description: payload.description?.trim() || this.projects[index].description,
      startDate: payload.startDate || this.projects[index].startDate,
      endDate: payload.endDate || this.projects[index].endDate,
      leadName: payload.leadName || this.projects[index].leadName,
      status: payload.status,
      statusText: payload.status === 'active' ? 'Đang thực hiện' : 'Đã đóng',
    }

    this.projects[index] = updated
    return updated
  }

  async toggleProjectStatus(id: string): Promise<Project> {
    const project = this.projects.find((p) => p.id === id)
    if (!project) {
      throw new Error('Không tìm thấy dự án.')
    }

    const newStatus: ProjectStatus = project.status === 'active' ? 'closed' : 'active'
    return this.updateProject(id, {
      name: project.name,
      status: newStatus,
      startDate: project.startDate,
      endDate: project.endDate,
    })
  }

  async deleteProject(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 120))
    const index = this.projects.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error('Không tìm thấy dự án cần xóa.')
    }
    this.projects.splice(index, 1)
  }
}

export const projectService = new ProjectService()
