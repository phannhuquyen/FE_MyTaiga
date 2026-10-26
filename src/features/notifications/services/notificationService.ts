import type {
  NotificationItem,
  NotificationFilterOptions,
  ActivityItem,
} from '../types'
import { projectService } from '@/features/projects/services/projectService'

export function resolveNotificationLink(targetLink?: string): string {
  if (!targetLink) return ''
  const projectScopedPrefixes = [
    '/kanban',
    '/sprints',
    '/epics',
    '/bugs',
    '/backlog',
    '/metrics',
    '/members',
    '/dashboard',
  ]
  const matched = projectScopedPrefixes.some((p) => targetLink.startsWith(p))
  if (matched) {
    const activeId = projectService.getActiveProjectId()
    return activeId ? `/projects/${activeId}${targetLink}` : '/projects'
  }
  return targetLink
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Thu Hà đã nhắc đến bạn trong bình luận',
    message: 'Thu Hà đã nhắc đến bạn trong bình luận tại tác vụ #TASK-241: "Cần xác thực thêm thông số timeout nhé"',
    category: 'mention',
    categoryLabel: 'Nhắc tên',
    actor: {
      name: 'Thu Hà',
      avatar: 'TH',
      role: 'Frontend Engineer',
      email: 'thuha@scrumflow.io',
    },
    targetCode: '#TASK-241',
    targetType: 'task',
    targetLink: '/kanban?taskId=task-241',
    timestamp: '10 phút trước',
    createdAt: '2024-10-24T10:35:00Z',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Cảnh báo WIP: Cột "Đang làm" chạm ngưỡng',
    message: 'Cảnh báo WIP: Cột "Đang làm" tại Bảng Kanban Sprint 14 đã chạm ngưỡng tối đa (4/4)',
    category: 'wip_alert',
    categoryLabel: 'Giới hạn WIP',
    actor: {
      name: 'Hệ thống ScrumBan',
      avatar: 'SYS',
      role: 'System Bot',
    },
    targetCode: 'Sprint 14',
    targetType: 'board',
    targetLink: '/kanban',
    timestamp: '35 phút trước',
    createdAt: '2024-10-24T10:10:00Z',
    isRead: false,
    isUrgent: true,
    urgencyDetails: {
      reason: 'Cột Đang làm đã vượt giới hạn WIP (5/4) trong Sprint 14. Cần phân luồng giải tỏa tắc nghẽn.',
      currentWip: 5,
      maxWip: 4,
      sprintName: 'Sprint 14',
    },
  },
  {
    id: 'notif-3',
    title: 'Thùy Trang đã thêm tệp đính kèm mới',
    message: 'Thùy Trang đã thêm tệp đính kèm mới vào #TASK-241 (spec_v2_final.pdf)',
    category: 'attachment',
    categoryLabel: 'Tệp đính kèm',
    actor: {
      name: 'Thùy Trang',
      avatar: 'TT',
      role: 'Scrum Master',
      email: 'trang.tt@scrumflow.io',
    },
    targetCode: '#TASK-241',
    targetType: 'attachment',
    targetLink: '/kanban?taskId=task-241',
    timestamp: '1 giờ trước',
    createdAt: '2024-10-24T09:45:00Z',
    isRead: false,
  },
  {
    id: 'notif-4',
    title: 'Tuấn Kiệt đã chuyển trạng thái lỗi #BUG-104',
    message: 'Tuấn Kiệt đã chuyển lỗi #BUG-104 sang trạng thái "Đã sửa"',
    category: 'bug',
    categoryLabel: 'Lỗi (Bug)',
    actor: {
      name: 'Tuấn Kiệt',
      avatar: 'TK',
      role: 'Backend Dev',
      email: 'kiet.tuan@scrumflow.io',
    },
    targetCode: '#BUG-104',
    targetType: 'bug',
    targetLink: '/bugs?code=BUG-104',
    timestamp: 'Hôm qua 16:30',
    createdAt: '2024-10-23T16:30:00Z',
    isRead: true,
  },
  {
    id: 'notif-5',
    title: 'Tác vụ #TASK-218 đã quá hạn hoàn thành 2 ngày',
    message: 'Tác vụ #TASK-218 "Cấu hình Cluster Redis" đã quá hạn hoàn thành 2 ngày',
    category: 'deadline',
    categoryLabel: 'Quá hạn',
    actor: {
      name: 'Hệ thống Quản lý',
      avatar: 'SYS',
      role: 'Deadline Watchdog',
    },
    targetCode: '#TASK-218',
    targetType: 'task',
    targetLink: '/kanban?taskId=task-218',
    timestamp: '22/10/2024',
    createdAt: '2024-10-22T09:00:00Z',
    isRead: true,
    isUrgent: true,
    urgencyDetails: {
      reason: 'Cấu hình Cluster Redis Sentinel đã quá hạn 2 ngày. Người phụ trách: Minh Quân.',
      daysOverdue: 2,
      sprintName: 'Sprint 14',
    },
  },
  {
    id: 'notif-6',
    title: 'Sprint 14 đạt mốc cam kết tuần 1',
    message: 'Sprint 14: Đã đóng thành công 12 tác vụ tuần đầu tiên đạt 85% mục tiêu cam kết',
    category: 'sprint',
    categoryLabel: 'Sprint',
    actor: {
      name: 'Minh Quân',
      avatar: 'MQ',
      role: 'Project Manager',
    },
    targetCode: 'Sprint 14',
    targetType: 'sprint',
    targetLink: '/sprints',
    timestamp: '20/10/2024',
    createdAt: '2024-10-20T17:00:00Z',
    isRead: true,
  },
  {
    id: 'notif-7',
    title: 'Hải Nam đã cập nhật kịch bản kiểm thử k6',
    message: 'Hải Nam đã gắn thẻ #TASK-241: "Kịch bản kiểm thử tải k6 sẽ hết hạn vào 18:00 hôm nay"',
    category: 'deadline',
    categoryLabel: 'Sắp đến hạn',
    actor: {
      name: 'Hải Nam',
      avatar: 'HN',
      role: 'DevOps Engineer',
    },
    targetCode: '#TASK-241',
    targetType: 'task',
    targetLink: '/kanban?taskId=task-241',
    timestamp: '20/10/2024',
    createdAt: '2024-10-20T14:30:00Z',
    isRead: true,
    isUrgent: true,
    urgencyDetails: {
      reason: 'Kịch bản kiểm thử tải k6 cho luồng thanh toán VNPay sẽ hết hạn vào 18:00 hôm nay.',
      timeLeft: 'Còn 4 giờ làm việc',
      sprintName: 'Sprint 14',
    },
  },
  {
    id: 'notif-8',
    title: 'Minh Quân đã gán tác vụ tối ưu hóa truy vấn Postgres cho bạn',
    message: 'Phân công #TASK-245: Minh Quân đã gán tác vụ tối ưu hoá truy vấn Postgres cho bạn.',
    category: 'mention',
    categoryLabel: 'Phân công',
    actor: {
      name: 'Minh Quân',
      avatar: 'MQ',
      role: 'Manager',
    },
    targetCode: '#TASK-245',
    targetType: 'task',
    targetLink: '/kanban?taskId=task-245',
    timestamp: '19/10/2024',
    createdAt: '2024-10-19T11:00:00Z',
    isRead: true,
  },
  {
    id: 'notif-9',
    title: 'Đăng Khoa đã bình luận tại #TASK-241',
    message: 'Đăng Khoa: "Anh đã nâng pool size lên 60 ở staging cluster để test lại."',
    category: 'mention',
    categoryLabel: 'Nhắc tên',
    actor: {
      name: 'Đăng Khoa',
      avatar: 'DK',
      role: 'Tech Lead',
    },
    targetCode: '#TASK-241',
    targetType: 'task',
    targetLink: '/kanban?taskId=task-241',
    timestamp: '19/10/2024',
    createdAt: '2024-10-19T09:15:00Z',
    isRead: true,
  },
  {
    id: 'notif-10',
    title: 'Báo cáo lỗi mới #BUG-102 từ Hoàng Long',
    message: 'Hoàng Long đã báo cáo lỗi nghiêm trọng #BUG-102: "Memory leak tại connection pool"',
    category: 'bug',
    categoryLabel: 'Lỗi (Bug)',
    actor: {
      name: 'Hoàng Long',
      avatar: 'HL',
      role: 'Backend Lead',
    },
    targetCode: '#BUG-102',
    targetType: 'bug',
    targetLink: '/bugs?code=BUG-102',
    timestamp: '18/10/2024',
    createdAt: '2024-10-18T16:00:00Z',
    isRead: true,
  },
  {
    id: 'notif-11',
    title: 'Cột "Đang kiểm tra" đạt giới hạn WIP',
    message: 'Cảnh báo WIP: Cột "Đang kiểm tra" đạt 3/3 thẻ giới hạn.',
    category: 'wip_alert',
    categoryLabel: 'Giới hạn WIP',
    actor: {
      name: 'Hệ thống ScrumBan',
      avatar: 'SYS',
      role: 'System Bot',
    },
    targetCode: 'Sprint 14',
    targetType: 'board',
    targetLink: '/kanban',
    timestamp: '18/10/2024',
    createdAt: '2024-10-18T10:00:00Z',
    isRead: true,
  },
  {
    id: 'notif-12',
    title: 'Sprint 13 chính thức đóng và chuyển mục tiêu',
    message: 'Sprint 13 đã hoàn thành đạt 92% velocity dự kiến, 3 thẻ dở dang đã chuyển sang Sprint 14.',
    category: 'sprint',
    categoryLabel: 'Sprint',
    actor: {
      name: 'Minh Quân',
      avatar: 'MQ',
      role: 'Manager',
    },
    targetCode: 'Sprint 13',
    targetType: 'sprint',
    targetLink: '/sprints',
    timestamp: '17/10/2024',
    createdAt: '2024-10-17T17:30:00Z',
    isRead: true,
  },
  {
    id: 'notif-13',
    title: 'Thu Hà gửi lời nhắc review PR #122',
    message: 'Thu Hà đã nhắc đến bạn: "Nhờ anh Quân review hộ em PR #122 nhánh staging ạ."',
    category: 'mention',
    categoryLabel: 'Nhắc tên',
    actor: {
      name: 'Thu Hà',
      avatar: 'TH',
      role: 'Frontend Dev',
    },
    targetCode: '#PR-122',
    targetType: 'task',
    targetLink: '/chat',
    timestamp: '16/10/2024',
    createdAt: '2024-10-16T15:00:00Z',
    isRead: true,
  },
  {
    id: 'notif-14',
    title: 'Tải lên tài liệu thiết kế kiến trúc microservices',
    message: 'Tuấn Anh đã tải lên tệp "architecture_v2.pdf" (14.2 MB) vào thư viện dự án.',
    category: 'attachment',
    categoryLabel: 'Tệp đính kèm',
    actor: {
      name: 'Tuấn Anh',
      avatar: 'TA',
      role: 'Architect',
    },
    targetCode: 'Docs',
    targetType: 'attachment',
    targetLink: '/chat',
    timestamp: '16/10/2024',
    createdAt: '2024-10-16T11:20:00Z',
    isRead: true,
  },
  {
    id: 'notif-15',
    title: 'Hạn chót cập nhật OpenAPI specification',
    message: 'Tác vụ #TASK-252 "Cập nhật OpenAPI docs" cần hoàn tất trước ngày mai.',
    category: 'deadline',
    categoryLabel: 'Sắp đến hạn',
    actor: {
      name: 'Hệ thống Quản lý',
      avatar: 'SYS',
      role: 'Bot',
    },
    targetCode: '#TASK-252',
    targetType: 'task',
    targetLink: '/kanban?taskId=task-252',
    timestamp: '15/10/2024',
    createdAt: '2024-10-15T09:00:00Z',
    isRead: true,
  },
  {
    id: 'notif-16',
    title: 'Lỗi #BUG-098 đã được kiểm thử hồi quy thành công',
    message: 'Linh Đan đã đóng #BUG-098 "Token refresh trả về 401 trên mobile client".',
    category: 'bug',
    categoryLabel: 'Lỗi (Bug)',
    actor: {
      name: 'Linh Đan',
      avatar: 'LĐ',
      role: 'QA Engineer',
    },
    targetCode: '#BUG-098',
    targetType: 'bug',
    targetLink: '/bugs?code=BUG-098',
    timestamp: '14/10/2024',
    createdAt: '2024-10-14T16:15:00Z',
    isRead: true,
  },
  {
    id: 'notif-17',
    title: 'Khởi tạo kênh trao đổi #dev-core-sync',
    message: 'Minh Quân đã tạo kênh thảo luận nhóm mới #dev-core-sync và thêm bạn vào kênh.',
    category: 'mention',
    categoryLabel: 'Nhắc tên',
    actor: {
      name: 'Minh Quân',
      avatar: 'MQ',
      role: 'Manager',
    },
    targetCode: '#dev-core-sync',
    targetType: 'board',
    targetLink: '/chat',
    timestamp: '14/10/2024',
    createdAt: '2024-10-14T10:00:00Z',
    isRead: true,
  },
  {
    id: 'notif-18',
    title: 'Liên kết 3 PBI vào Epic Cổng xác thực OAuth2',
    message: 'Minh Quân đã liên kết các PBI #TASK-241, #TASK-242, #TASK-244 vào #EPIC-04.',
    category: 'sprint',
    categoryLabel: 'Sprint',
    actor: {
      name: 'Minh Quân',
      avatar: 'MQ',
      role: 'Manager',
    },
    targetCode: '#EPIC-04',
    targetType: 'task',
    targetLink: '/epics',
    timestamp: '13/10/2024',
    createdAt: '2024-10-13T14:00:00Z',
    isRead: true,
  },
]

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    dateGroup: 'HÔM NAY',
    dateString: '28/10/2024',
    time: '14:32',
    actor: {
      name: 'Minh Quân',
      avatar: 'MQ',
      role: 'Tech Lead',
    },
    actionType: 'task_complete',
    title: 'Đã cập nhật tiến độ Subtask "Viết script k6 load test" thành',
    badge: {
      text: 'Hoàn thành',
      variant: 'success',
    },
    targetCode: '#TASK-241',
    metaInfo: 'Subtasks: 4/4 hoàn thành  |  Đã giải phóng 3 Story Points',
  },
  {
    id: 'act-2',
    dateGroup: 'HÔM NAY',
    dateString: '28/10/2024',
    time: '14:15',
    actor: {
      name: 'Thu Hà',
      avatar: 'TH',
      role: 'Frontend Engineer',
    },
    actionType: 'mention_comment',
    title: 'Đã gửi bình luận và nhắc tên @Minh Quân trong #TASK-241',
    targetCode: '#TASK-241',
    quote:
      '"API authentication endpoint đã deploy staging, nhờ bạn chạy k6 test xác thực token load spike giúp team nhé."',
  },
  {
    id: 'act-3',
    dateGroup: 'HÔM NAY',
    dateString: '28/10/2024',
    time: '11:20',
    actor: {
      name: 'Thùy Trang',
      avatar: 'TT',
      role: 'Scrum Master',
    },
    actionType: 'wip_warning',
    title: 'Đã kéo thẻ #TASK-248 từ "Cần làm" sang "Đang làm"',
    targetCode: '#TASK-248',
    warningBanner:
      'Kích hoạt cảnh báo vượt giới hạn WIP cột "Đang làm" (Hiện tại: 5/4 thẻ tối đa).',
  },
  {
    id: 'act-4',
    dateGroup: 'HÔM QUA',
    dateString: '27/10/2024',
    time: '16:45',
    actor: {
      name: 'Tuấn Kiệt',
      avatar: 'TK',
      role: 'Backend Dev',
    },
    actionType: 'bug_report',
    title:
      'Đã tạo báo cáo lỗi mới #BUG-104: "Xung đột WebSocket khi hai thành viên cùng kéo một thẻ"',
    targetCode: '#BUG-104',
    badge: {
      text: 'Mức độ: Nghiêm trọng',
      variant: 'danger',
    },
    metaInfo: 'Gán cho: Minh Quân',
  },
  {
    id: 'act-5',
    dateGroup: 'HÔM QUA',
    dateString: '27/10/2024',
    time: '09:10',
    actor: {
      name: 'Hệ thống',
      avatar: 'SYS',
      role: 'SYSTEM BOT',
      isBot: true,
    },
    actionType: 'system_alert',
    title:
      'Hệ thống phát cảnh báo tự động: Tác vụ #TASK-218 đã quá hạn 1 ngày theo kế hoạch Sprint 14.',
    targetCode: '#TASK-218',
    metaInfo: 'Hạn chót ban đầu: 26/10/2024. Trạng thái hiện tại: Đang thực hiện.',
  },
  {
    id: 'act-6',
    dateGroup: '25/10/2024',
    dateString: '25/10/2024',
    time: '15:00',
    actor: {
      name: 'Minh Quân',
      avatar: 'MQ',
      role: 'Tech Lead',
    },
    actionType: 'epic_link',
    title: 'Đã liên kết 3 PBI vào Epic #EPIC-04: "Nâng cấp bảo mật & OAuth2"',
    targetCode: '#EPIC-04',
    linkedCodes: ['#TASK-241', '#TASK-242', '#TASK-244'],
  },
]

class NotificationService {
  private notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS]
  private activities: ActivityItem[] = [...INITIAL_ACTIVITIES]
  private listeners: Array<() => void> = []

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((l) => l())
  }

  getNotifications(options: NotificationFilterOptions = {}) {
    let result = [...this.notifications]

    if (options.category) {
      if (options.category === 'unread') {
        result = result.filter((n) => !n.isRead)
      } else if (options.category === 'mention') {
        result = result.filter((n) => n.category === 'mention')
      } else if (options.category === 'deadline_wip') {
        result = result.filter((n) => n.category === 'deadline' || n.category === 'wip_alert')
      }
    }

    if (options.search?.trim()) {
      const q = options.search.trim().toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          (n.targetCode && n.targetCode.toLowerCase().includes(q)),
      )
    }

    return result
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length
  }

  getRecentNotifications(limit = 6): NotificationItem[] {
    return this.notifications.slice(0, limit)
  }

  getUrgentNotifications(): NotificationItem[] {
    return this.notifications.filter((n) => n.isUrgent)
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    )
    this.notify()
  }

  toggleRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, isRead: !n.isRead } : n,
    )
    this.notify()
  }

  markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }))
    this.notify()
  }

  resetDemoNotifications() {
    this.notifications = [...INITIAL_NOTIFICATIONS]
    this.notify()
  }

  clearAllForEmptyDemo() {
    this.notifications = []
    this.notify()
  }

  getActivities(): ActivityItem[] {
    return [...this.activities]
  }

  getActivityStats() {
    return {
      totalEvents: 148,
      tasksCompleted: 32,
      newBugs: 9,
      wipViolations: 3,
    }
  }
}

export const notificationService = new NotificationService()
