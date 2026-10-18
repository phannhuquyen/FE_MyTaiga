import type {
  BugItem,
  BugAssignee,
  BugFilters,
  CreateBugPayload,
  CloseBugPayload,
  StatusTransitionResult,
  BugStatus,
} from '../types'

export const AVAILABLE_ASSIGNEES: BugAssignee[] = [
  {
    id: 'user-mq',
    name: 'Minh Quân',
    email: 'quan.minh@scrumflow.io',
    role: 'Tech Lead',
    department: 'Dev',
    avatar: 'MQ',
    statusText: 'Đang phụ trách 2 bug',
    activeBugCount: 2,
    isAvailable: true,
  },
  {
    id: 'user-ta',
    name: 'Tuấn Anh',
    email: 'anh.tuan@scrumflow.io',
    role: 'QA Lead',
    department: 'QA',
    avatar: 'TA',
    statusText: 'Sẵn sàng nhận bug mới',
    activeBugCount: 1,
    isAvailable: true,
  },
  {
    id: 'user-tt',
    name: 'Thùy Trang',
    email: 'trang.thuy@scrumflow.io',
    role: 'Frontend Dev',
    department: 'Dev',
    avatar: 'TT',
    statusText: 'Đang xử lý 1 bug',
    activeBugCount: 1,
    isAvailable: true,
  },
  {
    id: 'user-hl',
    name: 'Hoàng Long',
    email: 'long.hoang@scrumflow.io',
    role: 'Backend Dev',
    department: 'Dev',
    avatar: 'HL',
    statusText: '2 bug đang xử lý',
    activeBugCount: 2,
    isAvailable: true,
  },
  {
    id: 'user-dt',
    name: 'Đỗ Thảo',
    email: 'thao.do@scrumflow.io',
    role: 'Tester',
    department: 'QA',
    avatar: 'DT',
    statusText: 'Sẵn sàng',
    activeBugCount: 0,
    isAvailable: true,
  },
  {
    id: 'user-vn',
    name: 'Văn Nam',
    email: 'nam.van@scrumflow.io',
    role: 'DevOps Engineer',
    department: 'DevOps',
    avatar: 'VN',
    statusText: 'Sẵn sàng',
    activeBugCount: 0,
    isAvailable: true,
  },
  {
    id: 'user-ld',
    name: 'Linh Đan',
    email: 'dan.linh@scrumflow.io',
    role: 'QA Engineer',
    department: 'QA',
    avatar: 'LD',
    statusText: 'Sẵn sàng',
    activeBugCount: 1,
    isAvailable: true,
  },
]

let INITIAL_BUGS: BugItem[] = [
  {
    id: 'bug-104',
    code: '#BUG-104',
    title: 'Xung đột WebSocket khi hai thành viên cùng kéo một thẻ Kanban',
    description:
      'Khi hai người dùng đồng thời mở bảng Kanban của dự án ScrumBan Core Platform và thực hiện thao tác kéo cùng một thẻ tác vụ sang hai cột khác nhau (ví dụ: một người kéo sang In Progress, người kia kéo sang In Review), client xảy ra hiện tượng nhấp nháy liên tục (loop rerender) và socket bị ngắt kết nối với mã lỗi 4409 CONFLICT_REVISION_MISMATCH.',
    stepsToReproduce:
      'Mở hai trình duyệt độc lập (A và B) cùng đăng nhập bằng 2 tài khoản khác nhau.\nCùng truy cập vào trang Bảng Kanban > Sprint 14.\nChọn cùng một task bất kỳ trong cột Sẵn sàng (To Do).\nNgười dùng A kéo sang cột Đang làm (In Progress) đồng thời với Người dùng B kéo sang Chờ duyệt (Review) trong khoảng thời gian < 200ms.\nQuan sát Console tab và Network > WS session của cả hai bên.',
    expectedResult:
      'Hệ thống xử lý Optimistic UI khóa trạng thái tạm thời, chấp nhận thao tác đến trước và gửi broadcast thông báo xung đột mềm, giữ nguyên thẻ ở trạng thái hợp lệ mà không làm rớt kết nối.',
    actualResult:
      'Cả hai client bị drop session WebSocket, thẻ bị kẹt ở trạng thái lơ lửng (ghost card), phải F5 làm mới trang để khôi phục đồng bộ.',
    stackTrace:
      'java.lang.NullPointerException: Cannot invoke "String.trim()" because the return value of "..." is null\n  at com.scrumban.flow.payment.vnpay.VNPayService.verifyChecksum(VNPayService.java:142)\n  at com.scrumban.flow.payment.vnpay.VNPayCallbackController.handleCallback(VNPayCallback.java:88)\n  at jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)',
    environment: 'Staging - Chrome 129 / macOS Sonoma 14.5',
    infrastructure: {
      environment: 'Staging',
      cluster: 'Kubernetes v1.28',
      cache: 'Redis 7.2 Sentinel',
    },
    severity: 'blocker',
    priority: 'p1',
    status: 'in_progress',
    relatedTaskId: 'task-239',
    relatedTaskCode: '#TASK-239',
    relatedTaskTitle: 'WebSocket Sync Engine',
    sprintId: 'sprint-14',
    sprintName: 'Sprint 14: Tối ưu luồng',
    epicId: 'epic-payment',
    epicName: 'Cổng Thanh Toán v2.0',
    assignee: AVAILABLE_ASSIGNEES[0], // Minh Quân
    reporter: {
      id: 'user-ta',
      name: 'Tuấn Anh',
      role: 'QA Lead',
      avatar: 'TA',
    },
    storyPointsEstimate: 5,
    discoveredAt: '2024-10-26T09:42:00Z',
    deadline: '2024-10-27T18:00:00Z',
    createdAt: '2024-10-26T09:42:00Z',
    updatedAt: '2024-10-26T12:30:00Z',
    cycleTimeDisplay: '1 ngày 4 giờ (Nhanh hơn 35%)',
    attachments: [
      {
        id: 'att-1',
        name: 'screenshot_console_err.png',
        size: '542 KB',
        type: 'image',
        uploadedAt: 'Hôm nay, 09:45',
        uploadedBy: 'Tuấn Anh',
      },
      {
        id: 'att-2',
        name: 'websocket_trace.log',
        size: '1.2 MB',
        type: 'log',
        uploadedAt: 'Hôm nay, 10:12',
        uploadedBy: 'Minh Quân',
      },
    ],
    comments: [
      {
        id: 'comm-1',
        authorName: 'Tuấn Anh',
        authorRole: 'QA Lead',
        authorAvatar: 'TA',
        content:
          'Đã kiểm tra log trace, Redis Sentinel node 2 có độ trễ sync khoảng 180ms dẫn đến race condition trên channel PubSub `board:sync:events`.',
        createdAt: '2 giờ trước',
      },
      {
        id: 'comm-2',
        authorName: 'Minh Quân',
        authorRole: 'Tech Lead',
        authorAvatar: 'MQ',
        content:
          'Cảm ơn Tuấn Anh. Mình đã tái hiện được trên môi trường dev local. Vấn đề nằm ở logic giải quyết xung đột revision trong module `TaskSyncEngine.ts`. Đang chuẩn bị bản vá sử dụng Vector Clock thay cho timestamp đơn thuần.',
        createdAt: '1 giờ trước',
      },
      {
        id: 'comm-3',
        authorName: 'Hoàng Long',
        authorRole: 'Thành viên',
        authorAvatar: 'HL',
        content:
          'Phía frontend mình sẽ thêm debounce cho socket emit và hiển thị banner toast cảnh báo khi thẻ đang bị khóa bởi thao tác của peer user nhé.',
        createdAt: '25 phút trước',
      },
    ],
  },
  {
    id: 'bug-102',
    code: '#BUG-102',
    title: 'Lỗi rò rỉ bộ nhớ khi render bảng Kanban với hơn 200 thẻ',
    description: 'DOM nodes tăng đột biến do không dọn sạch event listener kéo thả khi cuộn nhanh.',
    stepsToReproduce: 'Tạo 250 thẻ trên bảng Kanban, cuộn lên xuống liên tục 3 phút.',
    environment: 'Chrome v128 macOS Sonoma',
    severity: 'blocker',
    priority: 'p1',
    status: 'in_progress',
    relatedTaskId: 'task-201',
    relatedTaskCode: '#TASK-201',
    relatedTaskTitle: 'Tối ưu hiệu năng Kanban Board',
    sprintId: 'sprint-14',
    sprintName: 'Sprint 14',
    assignee: AVAILABLE_ASSIGNEES[0], // Minh Quân
    reporter: { id: 'user-ta', name: 'Tuấn Anh', role: 'QA Lead' },
    discoveredAt: '2024-10-28T09:30:00Z',
    deadline: '2024-10-29T12:00:00Z',
    createdAt: 'Hôm nay, 09:30',
    updatedAt: 'Hôm nay, 10:15',
    attachments: [],
    comments: [],
  },
  {
    id: 'bug-098',
    code: '#BUG-098',
    title: 'Mất kết nối WebSocket đột ngột khiến trạng thái thẻ bị rollback',
    description: 'Real-time Gateway gặp timeout sau 45s idle, không tự động reconnect kịp.',
    stepsToReproduce: 'Để tab ứng dụng nhàn rỗi hơn 45s rồi kéo thẻ sang cột mới.',
    environment: 'Real-time Gateway • Timeout sau 45s idle',
    severity: 'major',
    priority: 'p2',
    status: 'open',
    assignee: AVAILABLE_ASSIGNEES[1], // Tuấn Anh
    reporter: { id: 'user-ld', name: 'Linh Đan', role: 'QA Engineer' },
    discoveredAt: '2024-10-27T16:45:00Z',
    deadline: '2024-10-29T18:00:00Z',
    createdAt: 'Hôm qua, 16:45',
    updatedAt: 'Hôm qua, 16:45',
    attachments: [],
    comments: [],
  },
  {
    id: 'bug-095',
    code: '#BUG-095',
    title: 'Cảnh báo vượt WIP Limit không khóa thao tác kéo thả',
    description: 'Kanban Rules đã kiểm thử trên môi trường Staging, người dùng vẫn thả được thẻ vào cột vượt hạn mức.',
    stepsToReproduce: 'Kéo thẻ vào cột đang có 4/3 thẻ, banner đỏ hiện nhưng thẻ vẫn được chuyển.',
    environment: 'Kanban Rules • Staging',
    severity: 'blocker',
    priority: 'p1',
    status: 'resolved',
    assignee: AVAILABLE_ASSIGNEES[2], // Thùy Trang
    reporter: { id: 'user-mq', name: 'Minh Quân', role: 'Tech Lead' },
    discoveredAt: '2024-10-24T14:10:00Z',
    deadline: '2024-10-25T17:00:00Z',
    createdAt: '24/10/2024',
    updatedAt: '25/10/2024',
    attachments: [],
    comments: [],
  },
  {
    id: 'bug-091',
    code: '#BUG-091',
    title: 'Tìm kiếm nhanh trong Backlog không hỗ trợ tiếng Việt có dấu Unicode NFD',
    description: 'Search Engine không chuẩn hóa chuỗi Unicode NFD vs NFC khi người dùng gõ Telex trên macOS.',
    stepsToReproduce: 'Gõ từ khóa có dấu như "kiểm thử" bằng Unikey/EVKey trên macOS.',
    environment: 'Search Engine • NFD vs NFC Unicode normalization',
    severity: 'minor',
    priority: 'p3',
    status: 'in_progress',
    assignee: AVAILABLE_ASSIGNEES[0], // Minh Quân
    reporter: { id: 'user-tt', name: 'Thùy Trang', role: 'Frontend Dev' },
    discoveredAt: '2024-10-23T10:00:00Z',
    deadline: '2024-10-28T17:00:00Z',
    createdAt: '23/10/2024',
    updatedAt: '24/10/2024',
    attachments: [],
    comments: [],
  },
  {
    id: 'bug-087',
    code: '#BUG-087',
    title: 'Biểu đồ Burndown Chart sai lệch Story Points khi thẻ bị xóa giữa Sprint',
    description: 'Flow Metrics Module chưa trừ điểm SP của thẻ đã bị xóa khỏi tổng cam kết ban đầu.',
    stepsToReproduce: 'Thêm thẻ 3 SP vào Sprint, sau đó xóa vĩnh viễn thẻ này ở mục Backlog.',
    environment: 'Flow Metrics Module • Tái hiện được ở Sprint 13',
    severity: 'major',
    priority: 'p2',
    status: 'open',
    assignee: undefined, // Chưa gán
    reporter: { id: 'user-hl', name: 'Hoàng Long', role: 'Backend Dev' },
    discoveredAt: '2024-10-22T11:20:00Z',
    deadline: '2024-10-27T17:00:00Z',
    createdAt: '22/10/2024',
    updatedAt: '22/10/2024',
    attachments: [],
    comments: [],
  },
  {
    id: 'bug-084',
    code: '#BUG-084',
    title: 'Xuất danh sách bug sang định dạng CSV bị lỗi font tiếng Việt trong Excel',
    description: 'Export Handler thiếu UTF-8 BOM Header dẫn đến lỗi hiển thị ký tự UTF-8.',
    stepsToReproduce: 'Nhấn nút Xuất dữ liệu CSV và mở file bằng Microsoft Excel trên Windows.',
    environment: 'Export Handler • Thiếu UTF-8 BOM Header',
    severity: 'trivial',
    priority: 'p4',
    status: 'closed',
    assignee: AVAILABLE_ASSIGNEES[1], // Tuấn Anh
    reporter: { id: 'user-mq', name: 'Minh Quân', role: 'Tech Lead' },
    discoveredAt: '2024-10-20T08:30:00Z',
    deadline: '2024-10-22T17:00:00Z',
    createdAt: '20/10/2024',
    updatedAt: '21/10/2024',
    closedAt: '2024-10-21T15:00:00Z',
    resolutionReason: 'resolved_verified',
    resolutionNote: 'Đã bổ sung chuỗi byte 0xEF, 0xBB, 0xBF vào đầu stream xuất CSV.',
    attachments: [],
    comments: [],
  },
  {
    id: 'bug-081',
    code: '#BUG-081',
    title: 'Phím Escape không đóng slide-out drawer chi tiết khi focus đang nằm trong input',
    description: 'Event stopPropagation trong input con cản trở listener bàn phím cấp layout.',
    stepsToReproduce: 'Mở Drawer Task, click vào ô mô tả rồi nhấn phím Esc.',
    environment: 'Accessibility / Hotkeys • Event stopPropagation',
    severity: 'trivial',
    priority: 'p4',
    status: 'in_progress',
    assignee: AVAILABLE_ASSIGNEES[2], // Thùy Trang
    reporter: { id: 'user-dt', name: 'Đỗ Thảo', role: 'Tester' },
    discoveredAt: '2024-10-19T14:00:00Z',
    deadline: '2024-10-26T17:00:00Z',
    createdAt: '19/10/2024',
    updatedAt: '20/10/2024',
    attachments: [],
    comments: [],
  },
  // Items for page 2 (total 14 items)
  {
    id: 'bug-078',
    code: '#BUG-078',
    title: 'Cập nhật avatar người dùng không tự làm mới trên thanh điều hướng topbar',
    description: 'AuthContext chưa dispatch event cập nhật profile tới các header widget.',
    stepsToReproduce: 'Vào Hồ sơ cá nhân, đổi ảnh đại diện và lưu.',
    environment: 'Frontend • React State Sync',
    severity: 'minor',
    priority: 'p3',
    status: 'resolved',
    assignee: AVAILABLE_ASSIGNEES[2],
    reporter: { id: 'user-mq', name: 'Minh Quân', role: 'Tech Lead' },
    discoveredAt: '2024-10-18T10:00:00Z',
    deadline: '2024-10-25T17:00:00Z',
    createdAt: '18/10/2024',
    updatedAt: '19/10/2024',
    attachments: [],
    comments: [],
  },
  {
    id: 'bug-075',
    code: '#BUG-075',
    title: 'Deadlock cơ sở dữ liệu khi 2 batch job tính toán Cycle Time chạy đồng thời',
    description: 'PostgreSQL deadlock trên bảng flow_metrics_daily do thứ tự lock khoá không đồng nhất.',
    stepsToReproduce: 'Kích hoạt manual recalculate metrics khi cronjob 18:00 đang chạy.',
    environment: 'Database • PostgreSQL 15 / PG Lock',
    severity: 'major',
    priority: 'p2',
    status: 'closed',
    assignee: AVAILABLE_ASSIGNEES[3],
    reporter: { id: 'user-vn', name: 'Văn Nam', role: 'DevOps Engineer' },
    discoveredAt: '2024-10-17T18:05:00Z',
    deadline: '2024-10-19T17:00:00Z',
    createdAt: '17/10/2024',
    updatedAt: '18/10/2024',
    closedAt: '2024-10-18T16:00:00Z',
    resolutionReason: 'resolved_verified',
    resolutionNote: 'Đã chuẩn hóa thứ tự sắp xếp ID trước khi acquire lock.',
    attachments: [],
    comments: [],
  },
  {
    id: 'bug-072',
    code: '#BUG-072',
    title: 'Sai lệch màu sắc nhãn ưu tiên Critical trên trình duyệt Safari iOS',
    description: 'Hỗ trợ hiển thị biến CSS color trên WebKit cũ bị fallback về màu mặc định.',
    stepsToReproduce: 'Mở ứng dụng trên iPad Safari 16.',
    environment: 'CSS Tokens • Safari iOS WebKit',
    severity: 'trivial',
    priority: 'p4',
    status: 'open',
    assignee: AVAILABLE_ASSIGNEES[2],
    reporter: { id: 'user-dt', name: 'Đỗ Thảo', role: 'Tester' },
    discoveredAt: '2024-10-16T09:00:00Z',
    deadline: '2024-10-28T17:00:00Z',
    createdAt: '16/10/2024',
    updatedAt: '16/10/2024',
    attachments: [],
    comments: [],
  },
  {
    id: 'bug-069',
    code: '#BUG-069',
    title: 'Thông báo nhắc nhở SLA quá hạn gửi lặp lại 5 lần mỗi phút',
    description: 'Cron scheduling bị duplicate instance khi container pod auto-scaled.',
    stepsToReproduce: 'Tạo bug blocker quá 2 giờ khi cụm pod có 3 replicas.',
    environment: 'Notification Service • Redis Distributed Lock',
    severity: 'major',
    priority: 'p1',
    status: 'in_progress',
    assignee: AVAILABLE_ASSIGNEES[5], // Văn Nam
    reporter: { id: 'user-ta', name: 'Tuấn Anh', role: 'QA Lead' },
    discoveredAt: '2024-10-15T13:00:00Z',
    deadline: '2024-10-16T18:00:00Z',
    createdAt: '15/10/2024',
    updatedAt: '15/10/2024',
    attachments: [],
    comments: [],
  },
  {
    id: 'bug-065',
    code: '#BUG-065',
    title: 'Nút phân trang hiển thị sai tổng số trang khi lọc theo người xử lý rỗng',
    description: 'Tính toán totalPages không làm tròn Math.ceil khi total items bằng 0.',
    stepsToReproduce: 'Chọn người xử lý không có bug nào.',
    environment: 'Frontend Pagination Component',
    severity: 'trivial',
    priority: 'p4',
    status: 'resolved',
    assignee: AVAILABLE_ASSIGNEES[0],
    reporter: { id: 'user-ld', name: 'Linh Đan', role: 'QA Engineer' },
    discoveredAt: '2024-10-14T11:00:00Z',
    deadline: '2024-10-20T17:00:00Z',
    createdAt: '14/10/2024',
    updatedAt: '15/10/2024',
    attachments: [],
    comments: [],
  },
  {
    id: 'bug-061',
    code: '#BUG-061',
    title: 'Không hiển thị hộp thoại xác nhận khi gỡ liên kết Bug khỏi Epic',
    description: 'Thiếu modal confirm khiến thao tác click nhầm gỡ ngay bug khỏi chiến dịch.',
    stepsToReproduce: 'Click nút gỡ liên kết trong tab Danh sách Bug của Epic.',
    environment: 'Epic Detail View • UI UX Safety',
    severity: 'minor',
    priority: 'p3',
    status: 'open',
    assignee: undefined,
    reporter: { id: 'user-mq', name: 'Minh Quân', role: 'Tech Lead' },
    discoveredAt: '2024-10-12T15:30:00Z',
    deadline: '2024-10-25T17:00:00Z',
    createdAt: '12/10/2024',
    updatedAt: '12/10/2024',
    attachments: [],
    comments: [],
  },
]

class BugService {
  private bugs: BugItem[] = [...INITIAL_BUGS]

  public async getBugs(filters: BugFilters = {}): Promise<{
    items: BugItem[]
    total: number
    page: number
    pageSize: number
    stats: {
      totalOpen: number
      blockerCount: number
      majorCount: number
      mediumMinorCount: number
    }
  }> {
    let filtered = [...this.bugs]

    if (filters.search?.trim()) {
      const q = filters.search.toLowerCase().trim()
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          b.environment.toLowerCase().includes(q) ||
          (b.assignee?.name && b.assignee.name.toLowerCase().includes(q)),
      )
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((b) => b.status === filters.status)
    }

    if (filters.severity && filters.severity !== 'all') {
      filtered = filtered.filter((b) => b.severity === filters.severity)
    }

    if (filters.assigneeId && filters.assigneeId !== 'all') {
      if (filters.assigneeId === 'unassigned') {
        filtered = filtered.filter((b) => !b.assignee)
      } else {
        filtered = filtered.filter((b) => b.assignee?.id === filters.assigneeId)
      }
    }

    // Stats calculation across non-deleted bugs
    const totalOpen = this.bugs.filter((b) => b.status !== 'closed').length
    const blockerCount = this.bugs.filter((b) => b.severity === 'blocker').length
    const majorCount = this.bugs.filter((b) => b.severity === 'major').length
    const mediumMinorCount = this.bugs.filter(
      (b) => b.severity === 'minor' || b.severity === 'trivial',
    ).length

    const page = filters.page || 1
    const pageSize = filters.pageSize || 7
    const startIndex = (page - 1) * pageSize
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize)

    return {
      items: paginatedItems,
      total: filtered.length,
      page,
      pageSize,
      stats: {
        totalOpen,
        blockerCount,
        majorCount,
        mediumMinorCount,
      },
    }
  }

  public async getBugById(id: string): Promise<BugItem | null> {
    const found = this.bugs.find((b) => b.id === id || b.code === id || b.code.replace('#', '') === id)
    return found ? { ...found } : null
  }

  public validateStatusTransition(
    currentStatus: BugStatus,
    targetStatus: BugStatus,
  ): StatusTransitionResult {
    if (currentStatus === targetStatus) {
      return { allowed: true }
    }

    // Rule: Cannot jump directly from 'open' to 'closed'
    if (currentStatus === 'open' && targetStatus === 'closed') {
      return {
        allowed: false,
        suggestedStatus: 'in_progress',
        errorMessage: 'Chuyển trạng thái không hợp lệ (Invalid Status Transition)',
        explanation:
          'Không thể chuyển trực tiếp từ "Mở (Open)" sang "Đóng (Closed)". Theo quy định kiểm soát chất lượng ScrumBan Flow, mọi lỗi phải được kỹ sư phụ trách phân tích tại bước Đang xử lý và xác nhận kiểm thử tại bước Đã sửa & Test trước khi được phép đóng vĩnh viễn.',
      }
    }

    // Rule: Cannot jump from 'in_progress' to 'closed' without 'resolved'
    if (currentStatus === 'in_progress' && targetStatus === 'closed') {
      return {
        allowed: false,
        suggestedStatus: 'resolved',
        errorMessage: 'Chuyển trạng thái không hợp lệ',
        explanation:
          'Theo quy trình ScrumBan Flow, từ "Đang xử lý" chỉ có thể chuyển sang "Đã sửa" trước khi đóng.',
      }
    }

    return { allowed: true }
  }

  public async updateBugStatus(id: string, newStatus: BugStatus): Promise<BugItem> {
    const bug = this.bugs.find((b) => b.id === id)
    if (!bug) throw new Error('Không tìm thấy lỗi')

    const validation = this.validateStatusTransition(bug.status, newStatus)
    if (!validation.allowed) {
      throw new Error(validation.explanation || 'Chuyển trạng thái không hợp lệ')
    }

    bug.status = newStatus
    bug.updatedAt = new Date().toISOString()
    return { ...bug }
  }

  public async closeBug(id: string, payload: CloseBugPayload): Promise<BugItem> {
    const bug = this.bugs.find((b) => b.id === id)
    if (!bug) throw new Error('Không tìm thấy lỗi')

    bug.status = 'closed'
    bug.closedAt = new Date().toISOString()
    bug.resolutionReason = payload.resolutionReason
    bug.resolutionNote = payload.resolutionNote
    bug.updatedAt = new Date().toISOString()
    return { ...bug }
  }

  public async assignBug(id: string, assigneeId?: string): Promise<BugItem> {
    const bug = this.bugs.find((b) => b.id === id)
    if (!bug) throw new Error('Không tìm thấy lỗi')

    if (!assigneeId) {
      bug.assignee = undefined
    } else {
      const found = AVAILABLE_ASSIGNEES.find((a) => a.id === assigneeId)
      if (found) {
        bug.assignee = found
      }
    }
    bug.updatedAt = new Date().toISOString()
    return { ...bug }
  }

  public async createBug(payload: CreateBugPayload): Promise<BugItem> {
    const newNumber = this.bugs.length + 105
    const code = `#BUG-${String(newNumber).padStart(3, '0')}`

    let assignee: BugAssignee | undefined
    if (payload.assigneeId) {
      assignee = AVAILABLE_ASSIGNEES.find((a) => a.id === payload.assigneeId)
    }

    const newBug: BugItem = {
      id: `bug-${newNumber}`,
      code,
      title: payload.title,
      description: payload.description,
      stepsToReproduce: payload.stepsToReproduce || '',
      expectedResult: payload.expectedResult,
      actualResult: payload.actualResult,
      environment: payload.environment,
      severity: payload.severity,
      priority: payload.priority,
      status: 'open',
      relatedTaskId: payload.relatedTaskId,
      relatedTaskCode: payload.relatedTaskId ? '#TASK-241' : undefined,
      relatedTaskTitle: payload.relatedTaskId
        ? 'Tối ưu luồng truy vấn SQL (Sprint 14)'
        : undefined,
      sprintId: payload.sprintId || 'sprint-14',
      sprintName: 'Sprint 14',
      assignee,
      reporter: {
        id: 'user-current',
        name: 'Minh Quân',
        role: 'Quản lý (Manager)',
      },
      discoveredAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
      createdAt: 'Vừa xong',
      updatedAt: 'Vừa xong',
      attachments: payload.attachments
        ? payload.attachments.map((file, idx) => ({
            id: `att-new-${idx}`,
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type.includes('image') ? 'image' : 'log',
            uploadedAt: 'Vừa xong',
            uploadedBy: 'Minh Quân',
          }))
        : [],
      comments: [],
    }

    this.bugs.unshift(newBug)
    return { ...newBug }
  }

  public async updateBug(id: string, updates: Partial<BugItem>): Promise<BugItem> {
    const index = this.bugs.findIndex((b) => b.id === id)
    if (index === -1) throw new Error('Không tìm thấy lỗi')

    this.bugs[index] = {
      ...this.bugs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return { ...this.bugs[index] }
  }

  public async deleteBug(id: string): Promise<boolean> {
    const initialLen = this.bugs.length
    this.bugs = this.bugs.filter((b) => b.id !== id)
    return this.bugs.length < initialLen
  }

  public async addComment(
    bugId: string,
    content: string,
    authorName = 'Minh Quân',
    authorRole = 'Quản lý (Manager)',
    authorAvatar = 'MQ',
  ): Promise<BugItem> {
    const bug = this.bugs.find((b) => b.id === bugId)
    if (!bug) throw new Error('Không tìm thấy lỗi')

    const newComment = {
      id: `comm-${Date.now()}`,
      authorName,
      authorRole,
      authorAvatar,
      content,
      createdAt: 'Vừa xong',
    }

    bug.comments.push(newComment)
    bug.updatedAt = new Date().toISOString()
    return { ...bug }
  }
}

export const bugService = new BugService()
