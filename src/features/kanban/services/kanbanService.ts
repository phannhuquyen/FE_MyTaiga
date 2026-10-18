import type {
  KanbanTask,
  KanbanColumnConfig,
  KanbanColumnId,
  CreateTaskPayload,
  UpdateTaskPayload,
  WIPSettingsPayload,
} from '../types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const DEFAULT_COLUMNS: KanbanColumnConfig[] = [
  {
    id: 'todo',
    title: 'Cần làm',
    subtitleEn: 'To Do',
    colorDot: 'bg-neutral-400',
    wipLimit: null, // Không giới hạn
  },
  {
    id: 'in_progress',
    title: 'Đang làm',
    subtitleEn: 'In Progress',
    colorDot: 'bg-primary-500',
    wipLimit: 4, // 4 task max
  },
  {
    id: 'review',
    title: 'Đang kiểm tra',
    subtitleEn: 'Testing / Review',
    colorDot: 'bg-amber-500',
    wipLimit: 2, // 2 task max
  },
  {
    id: 'done',
    title: 'Hoàn thành',
    subtitleEn: 'Done',
    colorDot: 'bg-emerald-500',
    wipLimit: null, // Không áp dụng
  },
]

let columnsState: KanbanColumnConfig[] = [...DEFAULT_COLUMNS]

const SEED_TASKS: KanbanTask[] = [
  // Cần làm (todo)
  {
    id: 'task-101',
    code: 'CORE-201',
    title: 'Cập nhật Swagger / OpenAPI spec cho gateway',
    description: 'Bổ sung đầy đủ OpenAPI 3.1 docs cho các endpoints OAuth2 và SSO Gateway mới cập nhật.',
    columnId: 'todo',
    priority: 'high',
    storyPoints: 5,
    deadline: '26/10/2024',
    daysRemainingText: 'còn 8 ngày',
    assignee: {
      name: 'Tuấn Anh',
      avatarCode: 'TA',
      role: 'Backend Engineer',
    },
    creator: {
      name: 'Minh Quân',
      role: 'Tech Lead',
    },
    pbiCode: '#SB-146',
    pbiTitle: 'Cập nhật Swagger / OpenAPI specification cho gateway mới',
    epicName: 'Cổng xác thực & IAM',
    epicColor: '#0d9488',
    tags: ['Bảo mật', 'SSO'],
    subtasks: [
      { id: 'st-1', title: 'Export swagger json spec từ nestjs-swagger', completed: true, statusLabel: 'Xong' },
      { id: 'st-2', title: 'Cấu hình Redoc UI và verify security schemas', completed: false, statusLabel: 'Đang làm' },
    ],
    updatedAt: 'Hôm qua 16:40',
    order: 0,
  },
  {
    id: 'task-102',
    code: 'CORE-203',
    title: 'Khảo sát benchmark throughput k6',
    description: 'Chạy bài test tải 500 VUs liên tục 15 phút với công cụ k6 để đo latency p99.',
    columnId: 'todo',
    priority: 'medium',
    storyPoints: 8,
    deadline: '28/10/2024',
    daysRemainingText: 'còn 10 ngày',
    assignee: {
      name: 'Hoàng Linh',
      avatarCode: 'HL',
      role: 'Frontend Dev',
    },
    creator: {
      name: 'Minh Quân',
      role: 'Tech Lead',
    },
    pbiCode: '#SB-142',
    pbiTitle: 'Kiểm thử hiệu năng tải của Redis Cache cluster trên Staging',
    epicName: 'Core Infrastructure',
    epicColor: '#3b82f6',
    tags: ['Audit', 'Benchmark'],
    subtasks: [
      { id: 'st-3', title: 'Chuẩn bị k6 test script cho Auth endpoints', completed: false, statusLabel: 'Chờ' },
    ],
    updatedAt: 'Hôm nay 09:15',
    order: 1,
  },
  {
    id: 'task-103',
    code: 'CORE-208',
    title: 'Viết kịch bản tự động failover PostgreSQL',
    description: 'Thiết lập Patroni / pg_auto_failover cho cluster database PostgreSQL đảm bảo RTO < 30s.',
    columnId: 'todo',
    priority: 'urgent',
    storyPoints: 3,
    deadline: '27/10/2024',
    daysRemainingText: 'còn 9 ngày',
    assignee: {
      name: 'Minh Quân',
      avatarCode: 'MQ',
      role: 'Tech Lead',
      isCurrentUser: true,
    },
    creator: {
      name: 'Quốc Bảo',
      role: 'Quản trị viên',
    },
    pbiCode: '#SB-139',
    pbiTitle: 'Thiết lập cơ chế quay vòng token OAuth2 cho mobile app client',
    epicName: 'Core Infrastructure',
    epicColor: '#3b82f6',
    tags: ['DB', 'Failover'],
    subtasks: [
      { id: 'st-4', title: 'Viết Ansible playbook triển khai patroni', completed: false, statusLabel: 'Chờ' },
      { id: 'st-5', title: 'Test kill master node và đo thời gian switchover', completed: false, statusLabel: 'Chờ' },
    ],
    updatedAt: 'Hôm nay 10:20',
    order: 2,
  },

  // Đang làm (in_progress)
  {
    id: 'task-201',
    code: 'CORE-194',
    title: 'Kiểm thử hiệu năng Redis Cache cluster',
    description: 'Thiết lập kịch bản thử tải với 500 VUs liên tục trong 15 phút, theo dõi tỉ lệ lỗi và độ trễ phản hồi qua Prometheus dashboard.',
    columnId: 'in_progress',
    priority: 'urgent',
    storyPoints: 13,
    deadline: 'Hôm nay 18:00',
    daysRemainingText: 'Hôm nay',
    isOverdue: false,
    assignee: {
      name: 'Minh Hải',
      avatarCode: 'MH',
      role: 'DevOps Lead',
    },
    creator: {
      name: 'Minh Quân',
      role: 'Tech Lead',
    },
    pbiCode: '#SB-142',
    pbiTitle: 'Kiểm thử hiệu năng tải của Redis Cache cluster trên Staging',
    epicName: 'Core Infrastructure',
    epicColor: '#3b82f6',
    tags: ['Gateway', 'Redis'],
    subtasks: [
      { id: 'st-6', title: 'Chuẩn bị file dữ liệu mock người dùng (1,000 UUIDs)', completed: true, statusLabel: 'Xong' },
      { id: 'st-7', title: 'Viết script k6 JavaScript load test kịch bản Auth', completed: true, statusLabel: 'Xong' },
      { id: 'st-8', title: 'Cấu hình exporter đẩy metric thời gian thực về Prometheus', completed: false, statusLabel: 'Đang làm' },
      { id: 'st-9', title: 'Chạy thử nghiệm môi trường Staging cụm K8s EU-Central', completed: false, statusLabel: 'Chờ' },
      { id: 'st-10', title: 'Tổng hợp báo cáo so sánh tải trước & sau khi gắn Redis cache', completed: false, statusLabel: 'Chờ' },
    ],
    attachments: [
      { id: 'att-1', name: 'kanban_member_flow.png', size: '840 KB', uploadedBy: 'Huy Bảo' },
      { id: 'att-2', name: 'redis_cluster_metrics.pdf', size: '1.2 MB', uploadedBy: 'Minh Hải' },
      { id: 'att-3', name: 'k6_auth_test_plan.js', size: '48 KB', uploadedBy: 'Minh Quân' },
    ],
    comments: [
      {
        id: 'cm-1',
        authorName: 'Huy Bảo',
        authorRole: 'Quản lý',
        authorAvatar: 'HB',
        timestamp: 'Hôm qua 16:40',
        content: '@Thùy Trang nhớ chú ý giới hạn kéo thả của role Member, các thẻ không thuộc phạm vi phải có cursor not-allowed rõ ràng nhé.',
      },
      {
        id: 'cm-2',
        authorName: 'Thùy Trang',
        authorRole: 'Thành viên phát triển',
        authorAvatar: 'TT',
        timestamp: 'Sáng nay 09:15',
        content: 'Dạ em đã test đầy đủ trên Chrome & Firefox, trạng thái thẻ hiển thị rất mượt ạ!',
      },
    ],
    updatedAt: 'Cập nhật 42 phút trước',
    order: 0,
  },
  {
    id: 'task-202',
    code: 'CORE-199',
    title: 'Xây dựng Endpoint xuất báo cáo Burndown',
    description: 'Tạo API GET /reports/sprint/:id/burndown trả về chuỗi điểm lý tưởng và thực tế chuẩn JSON.',
    columnId: 'in_progress',
    priority: 'medium',
    storyPoints: 5,
    deadline: '25/10/2024',
    daysRemainingText: 'còn 7 ngày',
    assignee: {
      name: 'Tuấn Nam',
      avatarCode: 'TN',
      role: 'Backend Engineer',
    },
    creator: {
      name: 'Minh Quân',
      role: 'Tech Lead',
    },
    pbiCode: '#SB-140',
    pbiTitle: 'Tối ưu hóa pipe chuyển đổi WebP & resize avatar kích thước chuẩn',
    epicName: 'Core Infrastructure',
    epicColor: '#3b82f6',
    tags: ['Report', 'API'],
    subtasks: [
      { id: 'st-11', title: 'Thiết kế DTO BurndownResponseDto', completed: true, statusLabel: 'Xong' },
      { id: 'st-12', title: 'Tính toán remaining story points theo từng mốc ngày', completed: false, statusLabel: 'Đang làm' },
    ],
    updatedAt: 'Hôm nay 11:30',
    order: 1,
  },
  {
    id: 'task-203',
    code: 'SCRUM-142',
    title: 'Thiết kế UI Flow cho module quản lý phân quyền Thành viên',
    description: 'Thiết kế các tương tác kéo thả thẻ, phân quyền theo vai trò Scrum Master/Admin/Member.',
    columnId: 'in_progress',
    priority: 'high',
    storyPoints: 5,
    deadline: '26/10/2024',
    daysRemainingText: 'còn 8 ngày',
    assignee: {
      name: 'Thùy Trang',
      avatarCode: 'TT',
      role: 'Frontend Dev',
    },
    creator: {
      name: 'Minh Quân',
      role: 'Tech Lead',
    },
    pbiCode: '#SB-142',
    pbiTitle: 'Kiểm thử hiệu năng tải của Redis Cache cluster trên Staging',
    epicName: 'Cổng xác thực & IAM',
    epicColor: '#0d9488',
    tags: ['UI', 'Flow'],
    subtasks: [
      { id: 'st-13', title: 'Vẽ Wireframe trạng thái Thẻ kéo thả vs Thẻ bị khóa', completed: true, statusLabel: 'Xong' },
      { id: 'st-14', title: 'Kiểm thử độ tương phản màu chuẩn WCAG AAA', completed: false, statusLabel: 'Đang làm' },
    ],
    updatedAt: 'Hôm nay 14:10',
    order: 2,
  },

  // Đang kiểm tra (review)
  {
    id: 'task-301',
    code: 'CORE-188',
    title: 'Viết unit test cho service xác thực 2 lớp (2FA)',
    description: 'Độ bao phủ code coverage tối thiểu 90% cho luồng sinh TOTP secret và verify passcode.',
    columnId: 'review',
    priority: 'high',
    storyPoints: 2,
    deadline: '25/10/2024',
    daysRemainingText: 'còn 7 ngày',
    assignee: {
      name: 'Đỗ Thảo',
      avatarCode: 'ĐT',
      role: 'QA Engineer',
    },
    creator: {
      name: 'Tuấn Anh',
      role: 'Backend Engineer',
    },
    pbiCode: '#SB-143',
    pbiTitle: 'Viết unit test cho service xác thực 2 lớp (2FA TOTP)',
    epicName: 'Cổng xác thực & IAM',
    epicColor: '#0d9488',
    tags: ['QA', '2FA'],
    subtasks: [
      { id: 'st-15', title: 'Viết test case mock QR Code base64', completed: true, statusLabel: 'Xong' },
      { id: 'st-16', title: 'Test trường hợp mã token sai 5 lần liên tiếp', completed: true, statusLabel: 'Xong' },
    ],
    updatedAt: 'Hôm qua 17:00',
    order: 0,
  },
  {
    id: 'task-302',
    code: 'CORE-176',
    title: 'Cập nhật giao diện Dark Mode tương thích Tailwind tokens mới',
    description: 'Đảm bảo tất cả các thẻ Kanban và popover hiển thị chuẩn tương phản trên nền Dark.',
    columnId: 'review',
    priority: 'low',
    storyPoints: 3,
    deadline: '26/10/2024',
    daysRemainingText: 'còn 8 ngày',
    assignee: {
      name: 'Hoàng Linh',
      avatarCode: 'HL',
      role: 'Frontend Dev',
    },
    creator: {
      name: 'Thùy Trang',
      role: 'Frontend Dev',
    },
    pbiCode: '#SB-140',
    pbiTitle: 'Tối ưu hóa pipe chuyển đổi WebP & resize avatar kích thước chuẩn',
    epicName: 'Core Infrastructure',
    epicColor: '#3b82f6',
    tags: ['Theme', 'Dark Mode'],
    subtasks: [
      { id: 'st-17', title: 'Audit lại các thẻ card với background neutral-800', completed: true, statusLabel: 'Xong' },
    ],
    updatedAt: 'Hôm nay 08:30',
    order: 1,
  },

  // Hoàn thành (done)
  {
    id: 'task-401',
    code: 'CORE-180',
    title: 'Thiết lập cơ chế quay vòng token OAuth2 cho mobile client',
    description: 'Refresh token rotation tự động hủy chuỗi session cũ khi phát hiện reuse token.',
    columnId: 'done',
    priority: 'urgent',
    storyPoints: 5,
    deadline: '20/10/2024',
    daysRemainingText: 'Hoàn tất',
    assignee: {
      name: 'Nguyễn Quân',
      avatarCode: 'NQ',
      role: 'Tech Lead',
    },
    creator: {
      name: 'Minh Quân',
      role: 'Tech Lead',
    },
    pbiCode: '#SB-139',
    pbiTitle: 'Thiết lập cơ chế quay vòng token OAuth2 cho mobile app client',
    epicName: 'Cổng xác thực & IAM',
    epicColor: '#0d9488',
    tags: ['OAuth2', 'Security'],
    subtasks: [
      { id: 'st-18', title: 'Thêm Redis store lưu trữ token family ID', completed: true, statusLabel: 'Xong' },
      { id: 'st-19', title: 'Viết unit test case replay attack detection', completed: true, statusLabel: 'Xong' },
    ],
    updatedAt: '19/10/2024 15:20',
    order: 0,
  },
  {
    id: 'task-402',
    code: 'CORE-182',
    title: 'Tối ưu hóa pipe chuyển đổi WebP & resize avatar chuẩn',
    description: 'Sử dụng sharp native worker thread resize avatar về kích thước 128x128 và 64x64.',
    columnId: 'done',
    priority: 'medium',
    storyPoints: 3,
    deadline: '21/10/2024',
    daysRemainingText: 'Hoàn tất',
    assignee: {
      name: 'Hoàng Linh',
      avatarCode: 'HL',
      role: 'Frontend Dev',
    },
    creator: {
      name: 'Minh Quân',
      role: 'Tech Lead',
    },
    pbiCode: '#SB-140',
    pbiTitle: 'Tối ưu hóa pipe chuyển đổi WebP & resize avatar kích thước chuẩn',
    epicName: 'Core Infrastructure',
    epicColor: '#3b82f6',
    tags: ['Media', 'WebP'],
    subtasks: [
      { id: 'st-20', title: 'Cài đặt libvips & benchmark thời gian convert < 50ms', completed: true, statusLabel: 'Xong' },
    ],
    updatedAt: '21/10/2024 11:00',
    order: 1,
  },
  {
    id: 'task-403',
    code: 'CORE-185',
    title: 'Cấu hình bucket Cloudflare R2 backup tự động mỗi 6 giờ',
    description: 'Viết cron job worker snapshot database và tải lên R2 bucket được mã hóa AES-256.',
    columnId: 'done',
    priority: 'high',
    storyPoints: 3,
    deadline: '22/10/2024',
    daysRemainingText: 'Hoàn tất',
    assignee: {
      name: 'Nguyễn Quân',
      avatarCode: 'NQ',
      role: 'Tech Lead',
    },
    creator: {
      name: 'Minh Hải',
      role: 'DevOps Lead',
    },
    pbiCode: '#SB-145',
    pbiTitle: 'Cấu hình bucket Cloudflare R2 backup tự động mỗi 6 giờ',
    epicName: 'Core Infrastructure',
    epicColor: '#3b82f6',
    tags: ['Cloudflare', 'Backup'],
    subtasks: [
      { id: 'st-21', title: 'Thiết lập AWS SDK S3 client tương thích R2 endpoint', completed: true, statusLabel: 'Xong' },
    ],
    updatedAt: '22/10/2024 16:45',
    order: 2,
  },
]

let tasksState: KanbanTask[] = [...SEED_TASKS]

export const kanbanService = {
  async getColumns(): Promise<KanbanColumnConfig[]> {
    await delay(20)
    return [...columnsState]
  },

  async updateWIPLimits(payload: WIPSettingsPayload): Promise<KanbanColumnConfig[]> {
    await delay(40)
    columnsState = columnsState.map((col) => ({
      ...col,
      wipLimit: payload.limits[col.id] ?? null,
    }))
    return [...columnsState]
  },

  async toggleColumnCollapse(columnId: KanbanColumnId): Promise<KanbanColumnConfig[]> {
    await delay(10)
    columnsState = columnsState.map((col) =>
      col.id === columnId ? { ...col, isCollapsed: !col.isCollapsed } : col,
    )
    return [...columnsState]
  },

  async getTasks(filters?: {
    search?: string
    assigneeName?: string
    priority?: string
    onlyMyTasks?: boolean
    columnId?: string
  }): Promise<KanbanTask[]> {
    await delay(30)
    let result = [...tasksState]

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          (t.pbiCode && t.pbiCode.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)),
      )
    }

    if (filters?.onlyMyTasks) {
      result = result.filter((t) => t.assignee.isCurrentUser || t.assignee.name.includes('Quân'))
    } else if (filters?.assigneeName && filters.assigneeName !== 'all') {
      result = result.filter((t) => t.assignee.name === filters.assigneeName)
    }

    if (filters?.priority && filters.priority !== 'all') {
      result = result.filter((t) => t.priority === filters.priority)
    }

    if (filters?.columnId) {
      result = result.filter((t) => t.columnId === filters.columnId)
    }

    return result.sort((a, b) => a.order - b.order)
  },

  async getTaskById(id: string): Promise<KanbanTask | null> {
    await delay(20)
    return tasksState.find((t) => t.id === id) || null
  },

  async createTask(payload: CreateTaskPayload): Promise<KanbanTask> {
    await delay(40)
    if (!payload.title || payload.title.trim().length === 0) {
      throw new Error('Tiêu đề tác vụ không được để trống.')
    }

    const nextNum = tasksState.length + 242
    const targetColumnId = payload.columnId || 'todo'
    const columnTasks = tasksState.filter((t) => t.columnId === targetColumnId)

    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      code: `TASK-${nextNum}`,
      title: payload.title.trim(),
      description: payload.description || '',
      columnId: targetColumnId,
      priority: payload.priority || 'medium',
      storyPoints: payload.storyPoints || 3,
      deadline: payload.deadline || '28/10/2024',
      daysRemainingText: 'mới tạo',
      assignee: {
        name: payload.assigneeName || 'Minh Quân',
        avatarCode: payload.assigneeName ? payload.assigneeName.slice(0, 2).toUpperCase() : 'MQ',
        role: 'Tech Lead',
        isCurrentUser: !payload.assigneeName || payload.assigneeName.includes('Quân'),
      },
      creator: {
        name: 'Minh Quân',
        role: 'Tech Lead',
      },
      pbiCode: payload.pbiId ? '#SB-142' : undefined,
      pbiTitle: payload.pbiId ? 'Tối ưu luồng OAuth2 & API Gateway' : undefined,
      epicName: 'Core Infrastructure',
      epicColor: '#3b82f6',
      tags: payload.tags || ['Nhiệm vụ mới'],
      subtasks: [],
      updatedAt: 'Vừa xong',
      order: columnTasks.length,
    }

    tasksState = [newTask, ...tasksState]
    return newTask
  },

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<KanbanTask> {
    await delay(30)
    const index = tasksState.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Không tìm thấy tác vụ.')

    const current = tasksState[index]
    const updated: KanbanTask = {
      ...current,
      title: payload.title !== undefined ? payload.title.trim() : current.title,
      description: payload.description !== undefined ? payload.description : current.description,
      priority: payload.priority || current.priority,
      deadline: payload.deadline || current.deadline,
      columnId: payload.columnId || current.columnId,
      storyPoints: payload.storyPoints !== undefined ? payload.storyPoints : current.storyPoints,
      tags: payload.tags || current.tags,
      subtasks: payload.subtasks || current.subtasks,
      updatedAt: 'Vừa cập nhật',
    }

    if (payload.assigneeName && payload.assigneeName !== current.assignee.name) {
      updated.assignee = {
        name: payload.assigneeName,
        avatarCode: payload.assigneeName.slice(0, 2).toUpperCase(),
        role: 'Thành viên dự án',
        isCurrentUser: payload.assigneeName.includes('Quân'),
      }
    }

    tasksState[index] = updated
    return updated
  },

  async moveTask(
    taskId: string,
    targetColumnId: KanbanColumnId,
    newOrder?: number,
  ): Promise<{ task: KanbanTask; isWIPExceeded: boolean }> {
    await delay(20)
    const index = tasksState.findIndex((t) => t.id === taskId)
    if (index === -1) throw new Error('Không tìm thấy tác vụ để chuyển.')

    const current = tasksState[index]
    current.columnId = targetColumnId
    current.updatedAt = 'Vừa chuyển cột'
    if (newOrder !== undefined) {
      current.order = newOrder
    }

    // Check if target column WIP limit is exceeded
    const targetConfig = columnsState.find((c) => c.id === targetColumnId)
    const columnCount = tasksState.filter((t) => t.columnId === targetColumnId).length
    const isWIPExceeded = targetConfig?.wipLimit !== null && targetConfig?.wipLimit !== undefined
      ? columnCount > targetConfig.wipLimit
      : false

    return { task: current, isWIPExceeded }
  },

  async toggleSubtask(taskId: string, subtaskId: string): Promise<KanbanTask> {
    await delay(20)
    const task = tasksState.find((t) => t.id === taskId)
    if (!task) throw new Error('Không tìm thấy tác vụ.')

    const sub = task.subtasks.find((s) => s.id === subtaskId)
    if (sub) {
      sub.completed = !sub.completed
      sub.statusLabel = sub.completed ? 'Xong' : 'Đang làm'
    }
    task.updatedAt = 'Vừa cập nhật tiến độ'
    return task
  },

  async addSubtask(taskId: string, title: string): Promise<KanbanTask> {
    await delay(20)
    const task = tasksState.find((t) => t.id === taskId)
    if (!task) throw new Error('Không tìm thấy tác vụ.')

    task.subtasks.push({
      id: `st-${Date.now()}`,
      title: title.trim(),
      completed: false,
      statusLabel: 'Chờ',
    })
    task.updatedAt = 'Vừa thêm nhiệm vụ con'
    return task
  },

  async addComment(taskId: string, content: string): Promise<KanbanTask> {
    await delay(20)
    const task = tasksState.find((t) => t.id === taskId)
    if (!task) throw new Error('Không tìm thấy tác vụ.')

    task.comments = task.comments || []
    task.comments.push({
      id: `cm-${Date.now()}`,
      authorName: 'Minh Quân',
      authorRole: 'Tech Lead',
      authorAvatar: 'MQ',
      timestamp: 'Vừa xong',
      content: content.trim(),
    })
    return task
  },

  async deleteTask(id: string): Promise<boolean> {
    await delay(30)
    const task = tasksState.find((t) => t.id === id)
    if (!task) throw new Error('Không tìm thấy tác vụ.')

    tasksState = tasksState.filter((t) => t.id !== id)
    return true
  },
}
