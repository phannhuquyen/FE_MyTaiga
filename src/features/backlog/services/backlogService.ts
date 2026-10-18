import type {
  PBI,
  EpicSummary,
  SprintSummary,
  CreatePBIPayload,
  UpdatePBIPayload,
  BacklogSummaryMetrics,
} from '../types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const INITIAL_EPICS: EpicSummary[] = [
  {
    id: 'epic-1',
    name: 'Cổng xác thực & IAM',
    color: '#0284c7', // Sky / blue
    description: 'Hạ tầng xác thực, SSO & quản lý danh tính đa kênh',
    pbiCount: 6,
  },
  {
    id: 'epic-2',
    name: 'Core Infrastructure',
    color: '#076859', // Primary teal
    description: 'Hạ tầng hệ thống, vi dịch vụ và tối ưu hiệu năng',
    pbiCount: 8,
  },
  {
    id: 'epic-3',
    name: 'Thanh toán & Thuê bao',
    color: '#7c3aed', // Purple
    description: 'Tích hợp VNPay, Momo, Stripe và cổng đối soát giao dịch',
    pbiCount: 5,
  },
  {
    id: 'epic-4',
    name: 'Dashboard & Báo cáo',
    color: '#ea580c', // Orange
    description: 'Biểu đồ dòng chảy, báo cáo Sprint và trích xuất dữ liệu',
    pbiCount: 5,
  },
]

const INITIAL_SPRINTS: SprintSummary[] = [
  {
    id: 'sprint-14',
    name: 'Sprint 14: Tối ưu luồng & Đồng bộ',
    status: 'active',
    dateRange: '14/10 - 28/10',
    daysLeft: 'Còn 4 ngày',
    capacity: 24,
    assignedSP: 18,
    pbiCount: 4,
  },
  {
    id: 'sprint-15',
    name: 'Sprint 15: Mở rộng SSO & API Gateway',
    status: 'planned',
    dateRange: '29/10 - 12/11',
    capacity: 25,
    assignedSP: 8,
    pbiCount: 2,
  },
  {
    id: 'sprint-16',
    name: 'Sprint 16: Tự động hóa Báo cáo',
    status: 'draft',
    dateRange: '13/11 - 27/11 (Dự thảo)',
    capacity: 25,
    assignedSP: 0,
    pbiCount: 0,
  },
]

const INITIAL_PBIS: PBI[] = [
  {
    id: 'pbi-142',
    code: 'SB-142',
    title: 'Tối ưu hóa pipeline xử lý ảnh đại diện & nén WebP',
    description:
      'Hệ thống cần tự động sinh 3 kích thước avatar (32px, 64px, 128px) và chuyển đổi sang định dạng WebP để giảm 70% dung lượng tải trang. Tích hợp CDN caching trong 30 ngày.',
    itemType: 'feature',
    priority: 'high',
    status: 'ready',
    storyPoints: 5,
    epicId: 'epic-2',
    epicName: 'Core Infrastructure',
    epicColor: '#076859',
    sprintId: undefined, // in unassigned Backlog
    sprintName: undefined,
    assigneeId: 'u-1',
    assigneeName: 'Nguyễn Minh Quân',
    assigneeAvatar: 'MQ',
    reporterName: 'Nguyễn Minh Quân',
    reporterAvatar: 'MQ',
    reporterRole: 'Manager',
    createdAt: '15/10/2024',
    updatedAt: '2 giờ trước',
    subtasks: [
      { id: 't-201', code: 'TASK-201', title: 'Cài đặt thư viện Sharp image processing', status: 'done', assigneeName: 'Minh Quân' },
      { id: 't-202', code: 'TASK-202', title: 'Tạo Cloudflare worker xử lý resize ảnh dynamic', status: 'done', assigneeName: 'Minh Quân' },
      { id: 't-203', code: 'TASK-203', title: 'Viết migration script chuyển ảnh cũ sang WebP', status: 'in_progress', assigneeName: 'Minh Quân' },
      { id: 't-204', code: 'TASK-204', title: 'Kiểm thử tải 500 ảnh avatar đồng thời', status: 'todo', assigneeName: 'Minh Quân' },
    ],
    acceptanceCriteria: [
      { id: 'ac-1', text: 'Đạt độ nén tối thiểu 65% dung lượng gốc không giảm chất lượng visual Retina.', isMet: true },
      { id: 'ac-2', text: 'Thời gian chuyển đổi dưới 120ms trên Cloudflare Worker.', isMet: true },
      { id: 'ac-3', text: 'Có fallback sang JPEG/PNG nếu trình duyệt client không hỗ trợ WebP.', isMet: false },
    ],
    comments: [
      {
        id: 'c-1',
        authorName: 'Quang Huy (Tech Lead)',
        authorRole: 'Tech Lead',
        authorAvatar: 'QH',
        timestamp: 'Hôm qua, 14:20',
        content: 'Lưu ý mã hóa Secret Key khi tích hợp CDN caching và kiểm tra header Cache-Control.',
      },
    ],
    tags: ['Performance', 'Media'],
  },
  {
    id: 'pbi-143',
    code: 'SB-143',
    title: 'Xây dựng luồng đăng nhập SSO SAML 2.0 cho doanh nghiệp',
    description:
      'Hỗ trợ tích hợp Single Sign-On dựa trên SAML 2.0 với các nhà cung cấp IdP phổ biến như Okta, Azure AD, và Google Workspace.',
    itemType: 'feature',
    priority: 'high',
    status: 'in_progress',
    storyPoints: 8,
    epicId: 'epic-1',
    epicName: 'Cổng xác thực & IAM',
    epicColor: '#0284c7',
    sprintId: 'sprint-14',
    sprintName: 'Sprint 14',
    assigneeId: 'u-2',
    assigneeName: 'Lê Tuấn Đức',
    assigneeAvatar: 'TĐ',
    reporterName: 'Nguyễn Minh Quân',
    reporterAvatar: 'MQ',
    reporterRole: 'Manager',
    createdAt: '12/10/2024',
    updatedAt: '1 ngày trước',
    subtasks: [
      { id: 't-205', code: 'TASK-205', title: 'Cấu hình Metadata parser cho XML SAML', status: 'done', assigneeName: 'Tuấn Đức' },
      { id: 't-206', code: 'TASK-206', title: 'Endpoint callback ACS và xác thực chữ ký số X.509', status: 'in_progress', assigneeName: 'Tuấn Đức' },
    ],
    acceptanceCriteria: [
      { id: 'ac-4', text: 'Xác thực thành công Assertion từ IdP trong vòng 500ms.', isMet: true },
      { id: 'ac-5', text: 'Tự động tạo tài khoản người dùng nội bộ nếu chưa tồn tại.', isMet: true },
    ],
    comments: [],
    tags: ['Security', 'SSO'],
  },
  {
    id: 'pbi-145',
    code: 'SB-145',
    title: 'Thiết kế giao diện Drawer xem trước task và checklist DoD',
    description:
      'Tạo ngăn kéo trượt mượt mà hiển thị đầy đủ thông tin nhiệm vụ, danh mục Definition of Done và bình luận theo thời gian thực.',
    itemType: 'user_story',
    priority: 'medium',
    status: 'ready',
    storyPoints: 5,
    epicId: 'epic-2',
    epicName: 'Core Infrastructure',
    epicColor: '#076859',
    sprintId: undefined,
    sprintName: undefined,
    assigneeId: 'u-3',
    assigneeName: 'Trần Lan Anh',
    assigneeAvatar: 'LA',
    reporterName: 'Nguyễn Minh Quân',
    reporterAvatar: 'MQ',
    reporterRole: 'Manager',
    createdAt: '14/10/2024',
    updatedAt: '3 giờ trước',
    subtasks: [
      { id: 't-207', code: 'TASK-207', title: 'Component Drawer trượt từ mép phải với backdrop', status: 'done', assigneeName: 'Lan Anh' },
      { id: 't-208', code: 'TASK-208', title: 'Kết nối toggle checklist DoD với lưu trữ state', status: 'in_progress', assigneeName: 'Lan Anh' },
    ],
    acceptanceCriteria: [
      { id: 'ac-6', text: 'Hỗ trợ phím tắt Escape để đóng drawer.', isMet: true },
      { id: 'ac-7', text: 'Responsive mượt mà trên màn hình điện thoại dưới 768px.', isMet: false },
    ],
    comments: [],
    tags: ['UI/UX', 'Component'],
  },
  {
    id: 'pbi-146',
    code: 'SB-146',
    title: 'Cơ chế debounce ô tìm kiếm thành viên và phân trang ảo',
    description:
      'Giảm thiểu số lần trigger tìm kiếm bằng debounce 300ms, đồng thời triển khai virtual scrolling để xử lý mượt danh bạ trên 5,000 nhân sự.',
    itemType: 'technical_debt',
    priority: 'medium',
    status: 'new',
    storyPoints: 2,
    epicId: 'epic-2',
    epicName: 'Core Infrastructure',
    epicColor: '#076859',
    sprintId: undefined,
    sprintName: undefined,
    assigneeId: 'u-4',
    assigneeName: 'Hoàng Nam',
    assigneeAvatar: 'HN',
    reporterName: 'Nguyễn Minh Quân',
    reporterAvatar: 'MQ',
    reporterRole: 'Manager',
    createdAt: '16/10/2024',
    updatedAt: '5 giờ trước',
    subtasks: [
      { id: 't-209', code: 'TASK-209', title: 'Viết hook useDebounce custom', status: 'done', assigneeName: 'Hoàng Nam' },
      { id: 't-210', code: 'TASK-210', title: 'Benchmark hiệu năng render bảng 1,000 hàng', status: 'todo', assigneeName: 'Hoàng Nam' },
      { id: 't-211', code: 'TASK-211', title: 'Viết unit test cho hàm debounce timer', status: 'todo', assigneeName: 'Hoàng Nam' },
    ],
    acceptanceCriteria: [
      { id: 'ac-8', text: 'Thời gian trễ gõ phím được triệt tiêu hoàn toàn.', isMet: true },
    ],
    comments: [],
    tags: ['Optimization'],
  },
  {
    id: 'pbi-148',
    code: 'SB-148',
    title: 'Thông báo qua Webhook khi thẻ công việc chuyển sang Cần duyệt',
    description:
      'Gửi payload JSON chuẩn xác thực HMAC SHA256 tới các URL webhook đã đăng ký của bên thứ ba khi trạng thái thẻ chuyển thành Chờ duyệt.',
    itemType: 'feature',
    priority: 'urgent',
    status: 'new',
    storyPoints: 5,
    epicId: 'epic-2',
    epicName: 'Core Infrastructure',
    epicColor: '#076859',
    sprintId: undefined,
    sprintName: undefined,
    assigneeId: 'u-5',
    assigneeName: 'Đặng Huy',
    assigneeAvatar: 'ĐH',
    reporterName: 'Nguyễn Minh Quân',
    reporterAvatar: 'MQ',
    reporterRole: 'Manager',
    createdAt: '16/10/2024',
    updatedAt: 'Hôm qua',
    subtasks: [],
    acceptanceCriteria: [
      { id: 'ac-9', text: 'Có cơ chế retry tối đa 3 lần với exponential backoff.', isMet: false },
    ],
    comments: [],
    tags: ['Webhook', 'Integration'],
  },
  {
    id: 'pbi-150',
    code: 'SB-150',
    title: 'Xuất báo cáo tiến độ Sprint ra định dạng CSV và JSON',
    description:
      'Cung cấp tính năng tải xuống tệp dữ liệu chứa chi tiết các đầu việc, burn-down data, story points cam kết và thực tế để kiểm toán.',
    itemType: 'user_story',
    priority: 'low',
    status: 'ready',
    storyPoints: 3,
    epicId: 'epic-4',
    epicName: 'Dashboard & Báo cáo',
    epicColor: '#ea580c',
    sprintId: undefined,
    sprintName: undefined,
    assigneeId: 'u-6',
    assigneeName: 'Quốc Bảo',
    assigneeAvatar: 'QB',
    reporterName: 'Nguyễn Minh Quân',
    reporterAvatar: 'MQ',
    reporterRole: 'Manager',
    createdAt: '17/10/2024',
    updatedAt: '1 ngày trước',
    subtasks: [],
    acceptanceCriteria: [],
    comments: [],
    tags: ['Report', 'Export'],
  },
  {
    id: 'pbi-152',
    code: 'SB-152',
    title: 'Tự động gán người kiểm thử khi di chuyển sang cột Testing',
    description:
      'Khi một thẻ chuyển vào cột Testing trên Kanban board, hệ thống tự động gán QA member phụ trách dự án và gửi thông báo nhắc việc.',
    itemType: 'feature',
    priority: 'low',
    status: 'new',
    storyPoints: 2,
    epicId: 'epic-2',
    epicName: 'Core Infrastructure',
    epicColor: '#076859',
    sprintId: undefined,
    sprintName: undefined,
    assigneeId: 'u-7',
    assigneeName: 'Thùy Trang',
    assigneeAvatar: 'TT',
    reporterName: 'Nguyễn Minh Quân',
    reporterAvatar: 'MQ',
    reporterRole: 'Manager',
    createdAt: '17/10/2024',
    updatedAt: 'Hôm nay',
    subtasks: [],
    acceptanceCriteria: [],
    comments: [],
    tags: ['Automation', 'QA'],
  },
  {
    id: 'pbi-139',
    code: 'SB-139',
    title: 'Xây dựng API gateway xác thực OAuth2 & SSO',
    description: 'Bảo mật hệ thống bằng Reverse Proxy API Gateway hỗ trợ JWT xác thực thời gian ngắn và refresh token.',
    itemType: 'feature',
    priority: 'urgent',
    status: 'in_progress',
    storyPoints: 8,
    epicId: 'epic-1',
    epicName: 'Cổng xác thực & IAM',
    epicColor: '#0284c7',
    sprintId: 'sprint-14',
    sprintName: 'Sprint 14',
    assigneeId: 'u-2',
    assigneeName: 'Lê Tuấn Đức',
    assigneeAvatar: 'TĐ',
    reporterName: 'Nguyễn Minh Quân',
    reporterAvatar: 'MQ',
    reporterRole: 'Manager',
    createdAt: '10/10/2024',
    updatedAt: '2 ngày trước',
    subtasks: [],
    acceptanceCriteria: [],
    comments: [],
  },
  {
    id: 'pbi-140',
    code: 'SB-140',
    title: 'Thiết lập cấu trúc cơ sở dữ liệu ClickHouse log event',
    description: 'Lưu trữ event log của toàn bộ hoạt động ScrumBan với tốc độ ghi 50,000 sự kiện/giây.',
    itemType: 'feature',
    priority: 'medium',
    status: 'review',
    storyPoints: 5,
    epicId: 'epic-2',
    epicName: 'Core Infrastructure',
    epicColor: '#076859',
    sprintId: 'sprint-14',
    sprintName: 'Sprint 14',
    assigneeId: 'u-8',
    assigneeName: 'Lê Trực',
    assigneeAvatar: 'LT',
    reporterName: 'Nguyễn Minh Quân',
    reporterAvatar: 'MQ',
    reporterRole: 'Manager',
    createdAt: '11/10/2024',
    updatedAt: '3 ngày trước',
    subtasks: [],
    acceptanceCriteria: [],
    comments: [],
  },
  {
    id: 'pbi-144',
    code: 'SB-144',
    title: 'Tích hợp thanh toán trực tuyến qua cổng VNPay & MoMo',
    description: 'Thương mại điện tử & gói gia hạn dịch vụ tài khoản doanh nghiệp.',
    itemType: 'feature',
    priority: 'high',
    status: 'ready',
    storyPoints: 13,
    epicId: 'epic-3',
    epicName: 'Thanh toán & Thuê bao',
    epicColor: '#7c3aed',
    sprintId: undefined,
    sprintName: undefined,
    assigneeId: 'u-4',
    assigneeName: 'Hoàng Nam',
    assigneeAvatar: 'HN',
    reporterName: 'Nguyễn Minh Quân',
    reporterAvatar: 'MQ',
    reporterRole: 'Manager',
    createdAt: '13/10/2024',
    updatedAt: '1 ngày trước',
    subtasks: [],
    acceptanceCriteria: [],
    comments: [],
  },
  {
    id: 'pbi-153',
    code: 'SB-153',
    title: 'Tích hợp xác thực vân tay WebAuthn (Passkeys)',
    description: 'Cho phép đăng nhập không mật khẩu (Passwordless) trên các thiết bị hỗ trợ Touch ID, Windows Hello và Face ID.',
    itemType: 'feature',
    priority: 'high',
    status: 'new',
    storyPoints: 5,
    epicId: 'epic-1',
    epicName: 'Cổng xác thực & IAM',
    epicColor: '#0284c7',
    sprintId: undefined,
    sprintName: undefined,
    createdAt: '18/10/2024',
    updatedAt: 'Hôm nay',
    subtasks: [],
    acceptanceCriteria: [],
    comments: [],
  },
  {
    id: 'pbi-156',
    code: 'SB-156',
    title: 'Thiết lập chính sách mật khẩu mạnh và kiểm tra rò rỉ (HaveIBeenPwned)',
    description: 'Tự động kiểm tra băm k-anonymity mật khẩu mới khi thiết lập tài khoản người dùng.',
    itemType: 'feature',
    priority: 'medium',
    status: 'new',
    storyPoints: 3,
    epicId: 'epic-1',
    epicName: 'Cổng xác thực & IAM',
    epicColor: '#0284c7',
    sprintId: 'sprint-16',
    sprintName: 'Sprint 16',
    createdAt: '18/10/2024',
    updatedAt: 'Hôm nay',
    subtasks: [],
    acceptanceCriteria: [],
    comments: [],
  },
]

let pbisState = [...INITIAL_PBIS]
let epicsState = [...INITIAL_EPICS]
let sprintsState = [...INITIAL_SPRINTS]

let nextIdCounter = 157

export const backlogService = {
  async getPBIs(filters?: {
    search?: string
    status?: string
    priority?: string
    epicId?: string
    sprintId?: string | 'unassigned'
  }): Promise<PBI[]> {
    await delay(40)
    let list = [...pbisState]

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim()
      list = list.filter(
        (item) =>
          item.code.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      )
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((item) => item.status === filters.status)
    }

    if (filters?.priority && filters.priority !== 'all') {
      list = list.filter((item) => item.priority === filters.priority)
    }

    if (filters?.epicId && filters.epicId !== 'all') {
      list = list.filter((item) => item.epicId === filters.epicId)
    }

    if (filters?.sprintId) {
      if (filters.sprintId === 'unassigned') {
        list = list.filter((item) => !item.sprintId)
      } else if (filters.sprintId !== 'all') {
        list = list.filter((item) => item.sprintId === filters.sprintId)
      }
    }

    return list
  },

  async getPBIById(id: string): Promise<PBI | undefined> {
    await delay(20)
    return pbisState.find((p) => p.id === id)
  },

  async getEpics(): Promise<EpicSummary[]> {
    await delay(20)
    return [...epicsState]
  },

  async getSprints(): Promise<SprintSummary[]> {
    await delay(20)
    return [...sprintsState]
  },

  async getMetrics(): Promise<BacklogSummaryMetrics> {
    await delay(30)
    const totalPBIs = pbisState.length
    const totalStoryPoints = pbisState.reduce((sum, p) => sum + p.storyPoints, 0)
    const unassignedList = pbisState.filter((p) => !p.sprintId)
    const unassignedPBIs = unassignedList.length
    const unassignedStoryPoints = unassignedList.reduce((sum, p) => sum + p.storyPoints, 0)
    const teamVelocity = 24 // average 24 SP per sprint

    return {
      totalPBIs,
      totalStoryPoints,
      unassignedPBIs,
      unassignedStoryPoints,
      teamVelocity,
      estimatedSprintsLeft: Number((unassignedStoryPoints / teamVelocity).toFixed(1)),
    }
  },

  async createPBI(payload: CreatePBIPayload): Promise<PBI> {
    await delay(60)
    if (!payload.title || payload.title.trim().length < 5) {
      throw new Error('Tiêu đề PBI phải chứa ít nhất 5 ký tự và không được để trống.')
    }
    if (!payload.storyPoints || payload.storyPoints <= 0) {
      throw new Error('Vui lòng ước lượng Story Points hợp lệ (từ 1 đến 20) trước khi tạo thẻ.')
    }

    const code = `SB-${nextIdCounter++}`
    const id = `pbi-${code.toLowerCase()}`

    let epic: EpicSummary | undefined
    if (payload.epicId) {
      epic = epicsState.find((e) => e.id === payload.epicId)
    }

    let sprint: SprintSummary | undefined
    if (payload.sprintId) {
      sprint = sprintsState.find((s) => s.id === payload.sprintId)
    }

    const newPBI: PBI = {
      id,
      code,
      title: payload.title.trim(),
      description: payload.description || '',
      itemType: payload.itemType || 'user_story',
      priority: payload.priority || 'medium',
      status: 'ready',
      storyPoints: payload.storyPoints,
      epicId: epic?.id,
      epicName: epic?.name,
      epicColor: epic?.color,
      sprintId: sprint?.id,
      sprintName: sprint?.name,
      reporterName: 'Nguyễn Minh Quân',
      reporterAvatar: 'MQ',
      reporterRole: 'Manager',
      createdAt: 'Hôm nay',
      updatedAt: 'Vừa xong',
      subtasks: [],
      acceptanceCriteria: [],
      comments: [],
    }

    // Add to top of list as per ScrumBan Flow
    pbisState = [newPBI, ...pbisState]
    return newPBI
  },

  async updatePBI(id: string, payload: UpdatePBIPayload): Promise<PBI> {
    await delay(50)
    const index = pbisState.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error('Không tìm thấy PBI.')
    }

    const current = pbisState[index]
    if (current.isLocked && payload.isLocked === undefined) {
      // If locked and not trying to unlock, protect core fields
      if (payload.title || payload.description || payload.storyPoints) {
        throw new Error('PBI đang bị khóa. Chỉ có thể mở khóa hoặc cập nhật trạng thái/Sprint.')
      }
    }

    let epicName = current.epicName
    let epicColor = current.epicColor
    if (payload.epicId !== undefined) {
      if (payload.epicId) {
        const ep = epicsState.find((e) => e.id === payload.epicId)
        epicName = ep?.name
        epicColor = ep?.color
      } else {
        epicName = undefined
        epicColor = undefined
      }
    }

    let sprintName = current.sprintName
    if (payload.sprintId !== undefined) {
      if (payload.sprintId) {
        const sp = sprintsState.find((s) => s.id === payload.sprintId)
        sprintName = sp?.name
      } else {
        sprintName = undefined
      }
    }

    const updated: PBI = {
      ...current,
      ...payload,
      epicName,
      epicColor,
      sprintName,
      updatedAt: 'Vừa xong',
    }

    pbisState[index] = updated
    return updated
  },

  async deletePBI(id: string): Promise<boolean> {
    await delay(60)
    const pbi = pbisState.find((p) => p.id === id)
    if (!pbi) {
      throw new Error('Không tìm thấy PBI để xóa.')
    }
    pbisState = pbisState.filter((p) => p.id !== id)
    return true
  },

  async assignToSprint(pbiId: string, sprintId?: string): Promise<PBI> {
    return this.updatePBI(pbiId, { sprintId })
  },

  async linkEpic(pbiId: string, epicId?: string): Promise<PBI> {
    return this.updatePBI(pbiId, { epicId })
  },

  async linkBatchToEpic(pbiIds: string[], epicId: string): Promise<void> {
    await delay(60)
    const ep = epicsState.find((e) => e.id === epicId)
    if (!ep) throw new Error('Không tìm thấy Epic.')

    pbisState = pbisState.map((p) => {
      if (pbiIds.includes(p.id)) {
        return {
          ...p,
          epicId: ep.id,
          epicName: ep.name,
          epicColor: ep.color,
          updatedAt: 'Vừa xong',
        }
      }
      return p
    })
  },

  async toggleLockPBI(id: string): Promise<PBI> {
    const pbi = pbisState.find((p) => p.id === id)
    if (!pbi) throw new Error('Không tìm thấy PBI.')
    return this.updatePBI(id, { isLocked: !pbi.isLocked })
  },

  async reorderPBIs(activeId: string, targetId: string): Promise<PBI[]> {
    await delay(30)
    const oldIndex = pbisState.findIndex((p) => p.id === activeId)
    const newIndex = pbisState.findIndex((p) => p.id === targetId)
    if (oldIndex === -1 || newIndex === -1) return pbisState

    const [removed] = pbisState.splice(oldIndex, 1)
    pbisState.splice(newIndex, 0, removed)
    return [...pbisState]
  },

  async resetToDefault(): Promise<void> {
    pbisState = [...INITIAL_PBIS]
    epicsState = [...INITIAL_EPICS]
    sprintsState = [...INITIAL_SPRINTS]
    nextIdCounter = 157
  },
}
