import type {
  Candidate,
  CreateDepartmentPayload,
  CreateMemberPayload,
  Department,
  Member,
  TransferDepartmentPayload,
  UpdateDepartmentPayload,
} from '../types'

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-fe',
    code: 'FE-ENG',
    name: 'Frontend Engineering',
    description: 'Đội ngũ phát triển giao diện người dùng web và ứng dụng desktop client sử dụng React và Tailwind.',
    leadId: 'usr-002',
    leadName: 'Lê Hoàng Nam (Lead Frontend)',
    memberCount: 5,
    color: '#076859',
    sprintLoad: 81,
  },
  {
    id: 'dept-be',
    code: 'BE-SRV',
    name: 'Backend Services',
    description: 'Hạ tầng microservices, API Gateway, tối ưu cơ sở dữ liệu và bảo mật hệ thống.',
    leadId: 'usr-006',
    leadName: 'Trần Hoàng Long (Backend Lead)',
    memberCount: 6,
    color: '#276749',
    sprintLoad: 74,
  },
  {
    id: 'dept-ui',
    code: 'UI-DSG',
    name: 'UI/UX Design',
    description: 'Nghiên cứu trải nghiệm người dùng, thiết kế giao diện Figma và chuẩn hóa Design System.',
    leadId: 'usr-003',
    leadName: 'Trần Thu Hà (Lead UI/UX)',
    memberCount: 3,
    color: '#7c3aed',
    sprintLoad: 90,
  },
  {
    id: 'dept-qa',
    code: 'QA-AUT',
    name: 'Quality Assurance',
    description: 'Kiểm thử tự động e2e, kiểm thử hiệu năng k6 và bảo đảm tiêu chuẩn chất lượng release.',
    leadId: 'usr-004',
    leadName: 'Phạm Quốc Bảo (QA Lead)',
    memberCount: 2,
    color: '#d97706',
    sprintLoad: 65,
  },
  {
    id: 'dept-em',
    code: 'ENG-MGT',
    name: 'Engineering Management',
    description: 'Điều phối dự án, quản trị nhân sự, hoạch định lộ trình công nghệ và phân bổ tài nguyên.',
    leadId: 'usr-001',
    leadName: 'Nguyễn Minh Quân (Tech Lead)',
    memberCount: 2,
    color: '#2563eb',
    sprintLoad: 50,
  },
]

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'usr-001',
    employeeCode: 'EM-001',
    name: 'Nguyễn Minh Quân',
    avatarCode: 'MQ',
    bgColor: 'bg-primary-800',
    email: 'quan.nguyen@scrumban.vn',
    role: 'manager',
    roleTitle: 'Tech Lead',
    departmentId: 'dept-em',
    departmentName: 'Engineering Management',
    joinDate: '15/01/2023',
    isOnline: true,
    assignedTasks: [
      { id: 'SCRUM-101', title: 'Thiết kế cấu trúc kiến trúc Micro-frontend', status: 'Đang làm' },
      { id: 'SCRUM-115', title: 'Xét duyệt kế hoạch Sprint 14 Capacity', status: 'Hoàn thành' },
    ],
  },
  {
    id: 'usr-002',
    employeeCode: 'FE-109',
    name: 'Lê Hoàng Nam',
    avatarCode: 'HN',
    bgColor: 'bg-neutral-800',
    email: 'nam.le@scrumban.vn',
    role: 'member',
    roleTitle: 'Senior Developer',
    departmentId: 'dept-fe',
    departmentName: 'Frontend Engineering',
    joinDate: '02/03/2023',
    isOnline: true,
    assignedTasks: [
      { id: 'SCRUM-112', title: 'Cấu hình Tailwind CSS v4 và Design Tokens', status: 'Đang làm' },
      { id: 'SCRUM-120', title: 'Triển khai bảng điều khiển Kanban responsive', status: 'Chờ duyệt' },
    ],
  },
  {
    id: 'usr-003',
    employeeCode: 'USR-0824',
    name: 'Trần Thu Hà',
    avatarCode: 'TH',
    bgColor: 'bg-neutral-700',
    email: 'ha.tran@scrumban.vn',
    role: 'member',
    roleTitle: 'Product Designer',
    departmentId: 'dept-ui',
    departmentName: 'UI/UX Design',
    joinDate: '18/06/2023',
    isOnline: false,
    assignedTasks: [
      { id: 'SCRUM-142', title: 'Thiết kế Modal Flow Metrics', status: 'Đang làm' },
      { id: 'SCRUM-158', title: 'Tối ưu UI hệ thống thẻ kanba', status: 'Chờ duyệt' },
    ],
    sharedFiles: [
      { name: 'taiga_design_system_v2.fig', size: '14.2 MB', time: '10:30', type: 'spec' },
      { name: 'flow_metrics_mockups.pdf', size: '3.8 MB', time: 'Hôm qua', type: 'report' },
    ],
  },
  {
    id: 'usr-004',
    employeeCode: 'QA-045',
    name: 'Phạm Quốc Bảo',
    avatarCode: 'QB',
    bgColor: 'bg-amber-900',
    email: 'bao.pham@scrumban.vn',
    role: 'member',
    roleTitle: 'QA Automation Lead',
    departmentId: 'dept-qa',
    departmentName: 'Quality Assurance',
    joinDate: '20/08/2023',
    isOnline: true,
    assignedTasks: [
      { id: 'SCRUM-145', title: 'Kịch bản kiểm thử e2e luồng Tạo dự án mới', status: 'Đang làm' },
    ],
  },
  {
    id: 'usr-005',
    employeeCode: 'BE-112',
    name: 'Đỗ Tiến Dũng',
    avatarCode: 'TD',
    bgColor: 'bg-neutral-600',
    email: 'dung.do@scrumban.vn',
    role: 'member',
    roleTitle: 'DevOps & Backend',
    departmentId: 'dept-be',
    departmentName: 'Backend Services',
    joinDate: '05/11/2023',
    isOnline: false,
    assignedTasks: [
      { id: 'SCRUM-133', title: 'Xây dựng CI/CD Pipeline với Docker Runner', status: 'Đang làm' },
    ],
  },
  {
    id: 'usr-006',
    employeeCode: 'BE-010',
    name: 'Trần Hoàng Long',
    avatarCode: 'HL',
    bgColor: 'bg-primary-900',
    email: 'long.tran@scrumban.vn',
    role: 'lead',
    roleTitle: 'Backend Lead',
    departmentId: 'dept-be',
    departmentName: 'Backend Services',
    joinDate: '10/01/2023',
    isOnline: true,
    assignedTasks: [
      { id: 'SCRUM-128', title: 'Tối ưu cơ sở dữ liệu PostgreSQL cho Event Log', status: 'Đang làm' },
    ],
  },
  {
    id: 'usr-007',
    employeeCode: 'QA-012',
    name: 'Tuấn Anh',
    avatarCode: 'TA',
    bgColor: 'bg-neutral-800',
    email: 'tuan.anh@scrumban.vn',
    role: 'member',
    roleTitle: 'QA Lead',
    departmentId: 'dept-qa',
    departmentName: 'Quality Assurance',
    joinDate: '14/02/2023',
    isOnline: false,
  },
  {
    id: 'usr-008',
    employeeCode: 'FE-115',
    name: 'Thùy Trang',
    avatarCode: 'TT',
    bgColor: 'bg-amber-800',
    email: 'trang.thuy@scrumban.vn',
    role: 'member',
    roleTitle: 'Frontend Dev',
    departmentId: 'dept-fe',
    departmentName: 'Frontend Engineering',
    joinDate: '01/04/2023',
    isOnline: true,
  },
  {
    id: 'usr-009',
    employeeCode: 'FE-120',
    name: 'Mai Phương Nhi',
    avatarCode: 'MN',
    bgColor: 'bg-primary-700',
    email: 'nhi.mai@scrumban.vn',
    role: 'member',
    roleTitle: 'Frontend Dev',
    departmentId: 'dept-fe',
    departmentName: 'Frontend Engineering',
    joinDate: '12/05/2023',
    isOnline: false,
  },
  {
    id: 'usr-010',
    employeeCode: 'FE-122',
    name: 'Đặng Quốc Khánh',
    avatarCode: 'ĐK',
    bgColor: 'bg-neutral-700',
    email: 'khanh.dq@scrumban.vn',
    role: 'member',
    roleTitle: 'Frontend Dev',
    departmentId: 'dept-fe',
    departmentName: 'Frontend Engineering',
    joinDate: '19/07/2023',
    isOnline: false,
  },
  {
    id: 'usr-011',
    employeeCode: 'FE-130',
    name: 'Lê Thảo An',
    avatarCode: 'LA',
    bgColor: 'bg-neutral-600',
    email: 'an.lt@scrumban.vn',
    role: 'member',
    roleTitle: 'UI Engineer',
    departmentId: 'dept-fe',
    departmentName: 'Frontend Engineering',
    joinDate: '15/09/2023',
    isOnline: true,
  },
  {
    id: 'usr-012',
    employeeCode: 'FE-135',
    name: 'Vũ Quang Huy',
    avatarCode: 'VQ',
    bgColor: 'bg-primary-900',
    email: 'huy.vq@scrumban.vn',
    role: 'member',
    roleTitle: 'UI Engineer',
    departmentId: 'dept-fe',
    departmentName: 'Frontend Engineering',
    joinDate: '22/10/2023',
    isOnline: false,
  },
  {
    id: 'usr-013',
    employeeCode: 'BE-140',
    name: 'Hoàng Trọng Nghĩa',
    avatarCode: 'HN',
    bgColor: 'bg-neutral-800',
    email: 'nghia.ht@techcorp.vn',
    role: 'member',
    roleTitle: 'DevOps Engineer',
    departmentId: 'dept-be',
    departmentName: 'Backend Services',
    joinDate: '10/11/2023',
    isOnline: true,
  },
  {
    id: 'usr-014',
    employeeCode: 'FE-145',
    name: 'Đặng Thanh Tùng',
    avatarCode: 'TT',
    bgColor: 'bg-amber-900',
    email: 'tung.dt@techcorp.vn',
    role: 'member',
    roleTitle: 'Mobile Developer',
    departmentId: 'dept-fe',
    departmentName: 'Frontend Engineering',
    joinDate: '05/12/2023',
    isOnline: false,
  },
  {
    id: 'usr-015',
    employeeCode: 'EM-002',
    name: 'Nguyễn Văn An',
    avatarCode: 'NA',
    bgColor: 'bg-neutral-700',
    email: 'an.nguyen@scrumban.vn',
    role: 'manager',
    roleTitle: 'Project Manager',
    departmentId: 'dept-em',
    departmentName: 'Engineering Management',
    joinDate: '01/01/2023',
    isOnline: true,
  },
  {
    id: 'usr-016',
    employeeCode: 'UI-091',
    name: 'Bùi Phương Linh',
    avatarCode: 'PL',
    bgColor: 'bg-primary-800',
    email: 'linh.bp@scrumban.vn',
    role: 'member',
    roleTitle: 'Product Analyst',
    departmentId: 'dept-ui',
    departmentName: 'UI/UX Design',
    joinDate: '20/02/2024',
    isOnline: true,
  },
]

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'can-001',
    employeeCode: 'PA-201',
    name: 'Vũ Thị Mai',
    avatarCode: 'VM',
    email: 'vumai@techcorp.vn',
    roleTitle: 'PRODUCT ANALYST',
    departmentName: 'Product Management',
    isOnline: true,
  },
  {
    id: 'can-002',
    employeeCode: 'DE-302',
    name: 'Hoàng Trọng Nghĩa',
    avatarCode: 'HN',
    email: 'nghia.ht@techcorp.vn',
    roleTitle: 'DEVOPS ENGINEER',
    departmentName: 'Backend Services',
    isOnline: false,
  },
  {
    id: 'can-003',
    employeeCode: 'MD-403',
    name: 'Đặng Thanh Tùng',
    avatarCode: 'TT',
    email: 'tung.dt@techcorp.vn',
    roleTitle: 'MOBILE DEVELOPER',
    departmentName: 'Frontend Engineering',
    isOnline: false,
  },
  {
    id: 'can-004',
    employeeCode: 'FE-109',
    name: 'Lê Hoàng Nam',
    avatarCode: 'LN',
    email: 'nam.lh@techcorp.vn',
    roleTitle: 'SENIOR DEVELOPER',
    departmentName: 'Frontend Engineering',
    isOnline: true,
    alreadyInProject: true,
    existingDepartment: 'Frontend Engineering',
  },
]

// In-memory state for local demo persistence during session
let departmentsState = [...INITIAL_DEPARTMENTS]
let membersState = [...INITIAL_MEMBERS]
let candidatesState = [...INITIAL_CANDIDATES]

export const memberService = {
  getDepartments: async (): Promise<Department[]> => {
    await new Promise((resolve) => setTimeout(resolve, 30))
    // Recalculate member count
    return departmentsState.map((dept) => {
      const count = membersState.filter((m) => m.departmentId === dept.id).length
      return { ...dept, memberCount: count }
    })
  },

  getMembers: async (filter?: {
    departmentId?: string
    searchQuery?: string
    role?: string
  }): Promise<Member[]> => {
    await new Promise((resolve) => setTimeout(resolve, 40))
    let result = [...membersState]

    if (filter?.departmentId && filter.departmentId !== 'all') {
      result = result.filter((m) => m.departmentId === filter.departmentId)
    }

    if (filter?.role && filter.role !== 'all') {
      result = result.filter((m) => m.role === filter.role)
    }

    if (filter?.searchQuery?.trim()) {
      const q = filter.searchQuery.toLowerCase().trim()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.departmentName.toLowerCase().includes(q) ||
          m.roleTitle.toLowerCase().includes(q),
      )
    }

    return result
  },

  getCandidates: async (query?: string): Promise<Candidate[]> => {
    await new Promise((resolve) => setTimeout(resolve, 30))
    if (!query?.trim()) return candidatesState
    const q = query.toLowerCase().trim()
    return candidatesState.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.roleTitle.toLowerCase().includes(q),
    )
  },

  addMember: async (payload: CreateMemberPayload): Promise<Member> => {
    await new Promise((resolve) => setTimeout(resolve, 60))
    const candidate = candidatesState.find((c) => c.id === payload.candidateId)
    if (!candidate) {
      throw new Error('Ứng viên không tồn tại trong hệ thống.')
    }

    if (candidate.alreadyInProject || membersState.some((m) => m.email === candidate.email)) {
      throw new Error(`Thành viên ${candidate.name} đã là thành viên chính thức thuộc dự án.`)
    }

    const dept = departmentsState.find((d) => d.id === payload.departmentId)
    const newMember: Member = {
      id: `usr-${Date.now()}`,
      employeeCode: candidate.employeeCode,
      name: candidate.name,
      avatarCode: candidate.avatarCode,
      bgColor: 'bg-primary-800',
      email: candidate.email,
      role: payload.role,
      roleTitle: candidate.roleTitle,
      departmentId: dept ? dept.id : 'dept-fe',
      departmentName: dept ? dept.name : 'Frontend Engineering',
      joinDate: new Date().toLocaleDateString('vi-VN'),
      isOnline: candidate.isOnline,
      assignedTasks: [],
    }

    membersState = [newMember, ...membersState]
    return newMember
  },

  removeMember: async (
    memberId: string,
    reassignToLead = true,
  ): Promise<{ success: boolean; removedName: string; reallocatedCount: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 60))
    const member = membersState.find((m) => m.id === memberId)
    if (!member) {
      throw new Error('Không tìm thấy thành viên cần loại bỏ.')
    }

    const taskCount = member.assignedTasks?.length ?? 0
    membersState = membersState.filter((m) => m.id !== memberId)

    return {
      success: true,
      removedName: member.name,
      reallocatedCount: reassignToLead ? taskCount : 0,
    }
  },

  transferDepartment: async (payload: TransferDepartmentPayload): Promise<Member> => {
    await new Promise((resolve) => setTimeout(resolve, 60))
    const memberIndex = membersState.findIndex((m) => m.id === payload.memberId)
    if (memberIndex === -1) {
      throw new Error('Không tìm thấy thành viên để chuyển phòng ban.')
    }

    const newDept = departmentsState.find((d) => d.id === payload.newDepartmentId)
    if (!newDept) {
      throw new Error('Phòng ban đích không tồn tại.')
    }

    const updated = {
      ...membersState[memberIndex],
      departmentId: newDept.id,
      departmentName: newDept.name,
    }

    membersState[memberIndex] = updated
    return updated
  },

  addDepartment: async (payload: CreateDepartmentPayload): Promise<Department> => {
    await new Promise((resolve) => setTimeout(resolve, 60))
    if (!payload.name.trim()) {
      throw new Error('Tên phòng ban không được để trống.')
    }

    const code = `DEPT-${payload.name
      .split(' ')
      .map((w) => w[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 4)}`

    const lead = membersState.find((m) => m.id === payload.leadId)

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      code,
      name: payload.name.trim(),
      description: payload.description?.trim(),
      leadId: payload.leadId,
      leadName: lead ? `${lead.name} (${lead.roleTitle})` : undefined,
      memberCount: 0,
      color: payload.color || '#076859',
      sprintLoad: 0,
    }

    departmentsState = [...departmentsState, newDept]
    return newDept
  },

  updateDepartment: async (id: string, payload: UpdateDepartmentPayload): Promise<Department> => {
    await new Promise((resolve) => setTimeout(resolve, 60))
    const index = departmentsState.findIndex((d) => d.id === id)
    if (index === -1) {
      throw new Error('Không tìm thấy phòng ban cần sửa.')
    }

    const lead = membersState.find((m) => m.id === payload.leadId)
    const updated: Department = {
      ...departmentsState[index],
      name: payload.name.trim() || departmentsState[index].name,
      description: payload.description?.trim(),
      leadId: payload.leadId,
      leadName: lead ? `${lead.name} (${lead.roleTitle})` : departmentsState[index].leadName,
      color: payload.color || departmentsState[index].color,
    }

    departmentsState[index] = updated

    // Also update department name on associated members
    membersState = membersState.map((m) =>
      m.departmentId === id ? { ...m, departmentName: updated.name } : m,
    )

    return updated
  },

  deleteDepartment: async (
    id: string,
  ): Promise<{ success: boolean; affectedCount: number; deptName: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 60))
    const dept = departmentsState.find((d) => d.id === id)
    if (!dept) {
      throw new Error('Không tìm thấy phòng ban cần xóa.')
    }

    const affectedMembers = membersState.filter((m) => m.departmentId === id)

    // Move affected members to "Chưa phân phòng ban"
    membersState = membersState.map((m) =>
      m.departmentId === id
        ? {
            ...m,
            departmentId: 'unassigned',
            departmentName: 'Chưa phân phòng ban',
          }
        : m,
    )

    departmentsState = departmentsState.filter((d) => d.id !== id)

    return {
      success: true,
      affectedCount: affectedMembers.length,
      deptName: dept.name,
    }
  },

  resetToDefault: () => {
    departmentsState = [...INITIAL_DEPARTMENTS]
    membersState = [...INITIAL_MEMBERS]
    candidatesState = [...INITIAL_CANDIDATES]
  },
}
