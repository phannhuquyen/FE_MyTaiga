import type {
  ActivityItem,
  ProjectInfo,
  SprintInfo,
  TaskItem,
} from '../types'

export const mockProject: ProjectInfo = {
  id: 'proj-1',
  code: 'SC',
  name: 'ScrumBan Core Platform',
  role: 'Quản lý dự án (Manager)',
  startDate: '01/10/2024',
  endDate: '31/03/2025',
  sprintCycle: 'Chu kỳ Sprint 2 tuần',
  totalTasks: 75,
  completedTasks: 48,
  progressPercentage: 64,
}

export const mockSprint: SprintInfo = {
  id: 'sprint-14',
  number: 14,
  name: 'Sprint 14: Tối ưu hóa luồng Kanban & Realtime Sync',
  status: 'Đang diễn ra',
  daysLeft: 4,
  goal: 'Đạt Cycle Time dưới 3 ngày và giải quyết dứt điểm các lỗi backlog luồng kéo việc để chuẩn bị phát hành bản v2.4.',
  committedPoints: 24,
  completedPoints: 18,
  wipCount: 5,
}

export const mockTasks: TaskItem[] = [
  {
    id: 'task-104',
    code: 'SB-104',
    title: 'Tích hợp webhook thông báo khi task chuyển cột',
    type: 'Task',
    status: 'Đang làm',
    dueDate: 'Hôm nay',
    storyPoints: 3,
    estimatedHours: 6,
    assignee: {
      name: 'Bạn (Admin)',
      avatarCode: 'AD',
      role: 'Admin',
    },
    sprint: 'Sprint 14',
    priority: 'Cao',
    dod: [
      {
        id: 'dod-1',
        content: 'Gửi payload JSON chuẩn hoá chứa CardID, Column cũ và mới',
        completed: true,
      },
      {
        id: 'dod-2',
        content: 'Cơ chế tự động Retry tối đa 3 lần với exponential backoff',
        completed: true,
      },
      {
        id: 'dod-3',
        content: 'Viết unit test cho WebhookDispatcher đạt coverage > 85%',
        completed: false,
      },
    ],
    comments: [
      {
        id: 'cmt-1',
        author: 'Tiến Dũng',
        authorAvatar: 'TD',
        content:
          'Đã test thử endpoint trên staging, payload webhook phản hồi trong khoảng 120ms, khá mượt.',
        timeAgo: '4 giờ trước',
        createdAt: '2026-10-18T11:30:00Z',
      },
      {
        id: 'cmt-2',
        author: 'Lan Anh',
        authorAvatar: 'LA',
        content:
          'Lưu ý bổ sung thêm secret signature header để bên nhận xác thực nhé Quân.',
        timeAgo: '2 giờ trước',
        createdAt: '2026-10-18T13:30:00Z',
      },
    ],
  },
  {
    id: 'task-108',
    code: 'SB-108',
    title: 'Kiểm tra giới hạn WIP trên cột Đang làm việc nhóm',
    type: 'Story',
    status: 'Sẵn sàng Test',
    dueDate: '18/11',
    storyPoints: 5,
    estimatedHours: 10,
    assignee: {
      name: 'Minh Quân',
      avatarCode: 'MQ',
      role: 'Developer',
    },
    sprint: 'Sprint 14',
    priority: 'Trung bình',
    dod: [
      {
        id: 'dod-108-1',
        content: 'Kiểm tra cảnh báo khi số thẻ vượt WIP cấu hình',
        completed: true,
      },
      {
        id: 'dod-108-2',
        content: 'Chặn kéo thả thẻ mới khi cột đã vượt ngưỡng giới hạn',
        completed: true,
      },
      {
        id: 'dod-108-3',
        content: 'Ghi nhật ký vi phạm WIP vào audit timeline',
        completed: true,
      },
    ],
    comments: [
      {
        id: 'cmt-108-1',
        author: 'Minh Quân',
        authorAvatar: 'MQ',
        content:
          'Đã hoàn thành phần logic kiểm tra WIP, sẵn sàng chuyển cho tester.',
        timeAgo: '1 giờ trước',
        createdAt: '2026-10-18T14:30:00Z',
      },
    ],
  },
  {
    id: 'task-111',
    code: 'SB-111',
    title: 'Sửa lỗi sai lệch Cycle Time trong biểu đồ Cumulative',
    type: 'Bug',
    status: 'Cần làm',
    dueDate: '20/11',
    storyPoints: 2,
    estimatedHours: 4,
    assignee: {
      name: 'Hoàng Nam',
      avatarCode: 'HN',
      role: 'Data Analyst',
    },
    sprint: 'Sprint 14',
    priority: 'Cao',
    dod: [
      {
        id: 'dod-111-1',
        content: 'Xác định nguyên nhân sai lệch mốc ngày kết thúc',
        completed: false,
      },
      {
        id: 'dod-111-2',
        content: 'Cập nhật lại công thức tính rolling average cycle time',
        completed: false,
      },
    ],
    comments: [],
  },
  {
    id: 'task-95',
    code: 'SB-95',
    title: 'Viết tài liệu API Export dữ liệu sprint định dạng CSV',
    type: 'Task',
    status: 'Cần làm',
    dueDate: '22/11',
    storyPoints: 1,
    estimatedHours: 3,
    assignee: {
      name: 'Thanh Hà',
      avatarCode: 'TH',
      role: 'Tech Lead',
    },
    sprint: 'Sprint 14',
    priority: 'Thấp',
    dod: [
      {
        id: 'dod-95-1',
        content: 'Liệt kê các trường dữ liệu cần xuất trong schema',
        completed: true,
      },
      {
        id: 'dod-95-2',
        content: 'Viết tài liệu OpenAPI/Swagger định dạng mẫu CSV',
        completed: false,
      },
    ],
    comments: [],
  },
  {
    id: 'task-119',
    code: 'SB-119',
    title: 'Review pull request: Thêm xác thực Token 2FA cho Admin',
    type: 'Task',
    status: 'Đang làm',
    dueDate: '23/11',
    storyPoints: 2,
    estimatedHours: 5,
    assignee: {
      name: 'Bạn (Admin)',
      avatarCode: 'AD',
      role: 'Admin',
    },
    sprint: 'Sprint 14',
    priority: 'Khẩn cấp',
    dod: [
      {
        id: 'dod-119-1',
        content: 'Kiểm tra luồng TOTP và mã dự phòng khẩn cấp',
        completed: true,
      },
      {
        id: 'dod-119-2',
        content: 'Kiểm thử bảo mật chống replay attack cho endpoint xác thực',
        completed: false,
      },
    ],
    comments: [
      {
        id: 'cmt-119-1',
        author: 'Lan Anh',
        authorAvatar: 'LA',
        content: 'PR đã sẵn sàng trên branch feature/2fa-admin.',
        timeAgo: '3 giờ trước',
        createdAt: '2026-10-18T12:00:00Z',
      },
    ],
  },
]

export const mockActivities: ActivityItem[] = [
  {
    id: 'act-1',
    author: 'Minh Quân',
    avatarCode: 'MQ',
    action: 'đã chuyển',
    targetCode: 'SB-112',
    targetTitle: 'sang',
    targetState: 'Sẵn sàng Test',
    timeAgo: '15 phút trước',
  },
  {
    id: 'act-2',
    author: 'Lan Anh',
    avatarCode: 'LA',
    action: 'đã giải quyết và đóng lỗi',
    targetCode: 'SB-99: Lỗi hiển thị thẻ trên Safari',
    timeAgo: '1 giờ trước',
  },
  {
    id: 'act-3',
    author: 'Hoàng Nam',
    avatarCode: 'HN',
    action:
      'đã cập nhật phạm vi tiêu chí hoàn thành cho Sprint Goal 14',
    timeAgo: '3 giờ trước',
  },
  {
    id: 'act-4',
    author: 'Tiến Dũng',
    avatarCode: 'TD',
    action: 'đã thêm 2 tiêu chí chấp thuận (DoD) mới vào',
    targetCode: 'SB-104',
    timeAgo: '4 giờ trước',
  },
  {
    id: 'act-5',
    author: 'Thanh Hà',
    avatarCode: 'TH',
    action: 'đã gán nhãn',
    targetCode: 'backend',
    targetTitle: 'cho 4 công việc backlog',
    timeAgo: 'Hôm qua lúc 17:42',
  },
]
