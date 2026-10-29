# API endpoint and response DTO inventory

Generated 2026-10-28T10:29:24.288Z. 126 unique endpoint definitions; 127 checked-in OpenAPI operations. This is not runtime data coverage.

| FE method | HTTP | URL | Contract path | Response type | Consumers | Live anonymous |
|---|---|---|---|---|---|---|
| auth.login | POST | /api/v1/auth/login | MATCH | ApiResponse<LoginResultData> | src/features/auth/services/authService.ts | NOT TESTED |
| auth.logout | POST | /api/v1/auth/logout | MATCH | ApiResponse<null> | src/features/auth/services/authService.ts | NOT TESTED |
| auth.register | POST | /api/v1/auth/register | MATCH | ApiResponse<RegisterResultData> | src/features/auth/RegisterPage.tsx | NOT TESTED |
| auth.forgotPassword | POST | /api/v1/auth/forgot-password | MATCH | ApiResponse<null> | src/features/auth/services/authService.ts | NOT TESTED |
| auth.resetPassword | POST | /api/v1/auth/reset-password | MATCH | ApiResponse<null> | src/features/auth/services/authService.ts | NOT TESTED |
| auth.changePassword | POST | /api/v1/auth/change-password | MATCH | ApiResponse<null> | src/features/auth/services/authService.ts | NOT TESTED |
| users.search | GET | /api/v1/users | MATCH | ApiResponse<PaginatedData<DirectoryUserData>> | src/features/members/services/memberService.ts | 401; PASS auth boundary only |
| users.getMe | GET | /api/v1/users/me | MATCH | ApiResponse<UserProfileData> | src/features/auth/context/AuthContext.tsx, src/features/profile/services/profileService.ts | 401; PASS auth boundary only |
| users.updateMe | PUT | /api/v1/users/me | MATCH | ApiResponse<UpdateProfileResultData> | src/features/profile/services/profileService.ts | NOT TESTED |
| users.uploadAvatar | PUT | /api/v1/users/me/avatar | MATCH | ApiResponse<UpdateAvatarResultData> | src/features/profile/services/profileService.ts | NOT TESTED |
| users.getAvatarBlob | GET | /api/v1/users/me/avatar/${fileName} | MATCH | Blob | No direct consumer found | 401; PASS auth boundary only |
| adminUsers.lockUser | PATCH | /api/v1/admin/users/${userId}/lock | MATCH | ApiResponse<LockUnlockUserResultData> | src/features/admin/services/adminService.ts | NOT TESTED |
| adminUsers.unlockUser | PATCH | /api/v1/admin/users/${userId}/unlock | MATCH | ApiResponse<LockUnlockUserResultData> | src/features/admin/services/adminService.ts | NOT TESTED |
| projects.create | POST | /api/v1/projects | MATCH | ApiResponse<ProjectData> | src/features/projects/services/projectService.ts | NOT TESTED |
| projects.list | GET | /api/v1/projects | MATCH | ApiResponse<PaginatedData<ProjectData>> | src/features/projects/services/projectService.ts | 401; PASS auth boundary only |
| projects.get | GET | /api/v1/projects/${projectId} | MATCH | ApiResponse<ProjectData> | src/features/projects/ProjectLayout.tsx, src/features/projects/services/projectService.ts | 401; PASS auth boundary only |
| projects.update | PUT | /api/v1/projects/${projectId} | MATCH | ApiResponse<ProjectData> | src/features/projects/services/projectService.ts | NOT TESTED |
| projects.close | PATCH | /api/v1/projects/${projectId}/close | MATCH | ApiResponse<ProjectData> | src/features/projects/services/projectService.ts | NOT TESTED |
| projects.delete | DELETE | /api/v1/projects/${projectId} | MATCH | ApiResponse<ProjectData> | src/features/projects/services/projectService.ts | NOT TESTED |
| projectMembers.list | GET | /api/v1/projects/${projectId}/members | MATCH | ApiResponse<PaginatedData<ProjectMemberData>> | src/features/chat/ChatPage.tsx, src/features/members/services/memberService.ts | 401; PASS auth boundary only |
| projectMembers.add | POST | /api/v1/projects/${projectId}/members | MATCH | ApiResponse<ProjectMemberMutationResult> | src/features/members/services/memberService.ts | NOT TESTED |
| projectMembers.remove | DELETE | /api/v1/projects/${projectId}/members/${userId} | MATCH | ApiResponse<ProjectMemberMutationResult> | src/features/members/services/memberService.ts | NOT TESTED |
| projectMembers.promote | PATCH | /api/v1/projects/${projectId}/members/${userId}/role | MATCH | ApiResponse<ProjectMemberMutationResult> | src/features/members/services/memberService.ts | NOT TESTED |
| projectDepartments.list | GET | /api/v1/projects/${projectId}/departments | MATCH | ApiResponse<PaginatedData<DepartmentData>> | src/features/members/services/memberService.ts | 401; PASS auth boundary only |
| projectDepartments.create | POST | /api/v1/projects/${projectId}/departments | MATCH | ApiResponse<DepartmentMutationResult> | src/features/members/services/memberService.ts | NOT TESTED |
| projectDepartments.update | PUT | /api/v1/projects/${projectId}/departments/${departmentId} | MATCH | ApiResponse<DepartmentMutationResult> | src/features/members/services/memberService.ts | NOT TESTED |
| projectDepartments.delete | DELETE | /api/v1/projects/${projectId}/departments/${departmentId} | MATCH | ApiResponse<null> | src/features/members/services/memberService.ts | NOT TESTED |
| projectDepartments.assignMember | PATCH | /api/v1/projects/${projectId}/members/${userId}/department | MATCH | ApiResponse<AssignDepartmentResult> | src/features/members/services/memberService.ts | NOT TESTED |
| epics.list | GET | /api/v1/projects/${projectId}/epics | MATCH | ApiResponse<PaginatedData<EpicData>> | src/features/backlog/services/backlogService.ts, src/features/epics/services/epicService.ts | 401; PASS auth boundary only |
| epics.create | POST | /api/v1/projects/${projectId}/epics | MATCH | ApiResponse<EpicData> | src/features/epics/services/epicService.ts | NOT TESTED |
| epics.get | GET | /api/v1/epics/${epicId} | MATCH | ApiResponse<EpicData> | src/features/epics/services/epicService.ts | 401; PASS auth boundary only |
| epics.update | PUT | /api/v1/epics/${epicId} | MATCH | ApiResponse<EpicData> | src/features/epics/services/epicService.ts | NOT TESTED |
| epics.delete | DELETE | /api/v1/epics/${epicId} | MATCH | ApiResponse<EpicData> | src/features/epics/services/epicService.ts | NOT TESTED |
| epics.progress | GET | /api/v1/epics/${epicId}/progress | MATCH | ApiResponse<EpicProgressData> | src/features/epics/services/epicService.ts | 401; PASS auth boundary only |
| epics.linkPbi | PATCH | /api/v1/pbis/${pbiId}/epic | MATCH | ApiResponse<{ itemId: number; epicId: number }> | src/features/backlog/services/backlogService.ts, src/features/epics/services/epicService.ts | NOT TESTED |
| epics.linkProductBacklogItem | PATCH | /api/v1/product-backlog-items/${pbiId}/epic | MATCH | ApiResponse<{ itemId: number; epicId: number }> | No direct consumer found | NOT TESTED |
| epics.linkTask | PATCH | /api/v1/tasks/${taskId}/epic | MATCH | ApiResponse<{ itemId: number; epicId: number }> | src/features/epics/services/epicService.ts | NOT TESTED |
| productBacklog.list | GET | /api/v1/product-backlog-items | MATCH | ApiResponse<PaginatedData<ProductBacklogItemData>> | src/features/backlog/services/backlogService.ts | 401; PASS auth boundary only |
| productBacklog.create | POST | /api/v1/product-backlog-items | MATCH | ApiResponse<ProductBacklogItemData> | src/features/backlog/services/backlogService.ts | NOT TESTED |
| productBacklog.get | GET | /api/v1/product-backlog-items/${pbiId} | MATCH | ApiResponse<ProductBacklogItemData> | src/features/backlog/services/backlogService.ts | 401; PASS auth boundary only |
| productBacklog.update | PUT | /api/v1/product-backlog-items/${pbiId} | MATCH | ApiResponse<ProductBacklogItemData> | src/features/backlog/services/backlogService.ts | NOT TESTED |
| productBacklog.delete | DELETE | /api/v1/product-backlog-items/${pbiId} | MATCH | ApiResponse<ProductBacklogItemData> | src/features/backlog/services/backlogService.ts | NOT TESTED |
| productBacklog.changePriority | PATCH | /api/v1/product-backlog-items/${pbiId}/priority | MATCH | ApiResponse<ProductBacklogItemData> | No direct consumer found | NOT TESTED |
| productBacklog.reorder | PUT | /api/v1/product-backlog-items/order | MATCH | ApiResponse<{ epicId: number; pbiIds: number[] }> | src/features/backlog/services/backlogService.ts | NOT TESTED |
| sprints.list | GET | /api/v1/sprints | MATCH | ApiResponse<PaginatedData<SprintData>> | src/features/metrics/FlowMetricsPage.tsx, src/features/backlog/services/backlogService.ts, src/features/sprints/services/sprintService.ts | 401; PASS auth boundary only |
| sprints.create | POST | /api/v1/sprints | MATCH | ApiResponse<SprintData> | src/features/sprints/services/sprintService.ts | NOT TESTED |
| sprints.get | GET | /api/v1/sprints/${sprintId} | MATCH | ApiResponse<SprintData> | src/features/sprints/services/sprintService.ts | 401; PASS auth boundary only |
| sprints.update | PUT | /api/v1/sprints/${sprintId} | MATCH | ApiResponse<SprintData> | src/features/sprints/services/sprintService.ts | NOT TESTED |
| sprints.delete | DELETE | /api/v1/sprints/${sprintId} | MATCH | ApiResponse<null> | src/features/sprints/services/sprintService.ts | NOT TESTED |
| sprints.start | POST | /api/v1/sprints/${sprintId}/start | MATCH | ApiResponse<SprintData> | src/features/sprints/services/sprintService.ts | NOT TESTED |
| sprints.close | POST | /api/v1/sprints/${sprintId}/close | MATCH | ApiResponse<SprintData> | src/features/sprints/services/sprintService.ts | NOT TESTED |
| sprints.addBacklogItems | POST | /api/v1/sprints/${sprintId}/backlog-items | MATCH | ApiResponse<null> | src/features/backlog/services/backlogService.ts, src/features/sprints/services/sprintService.ts | NOT TESTED |
| sprints.getBacklogItems | GET | /api/v1/sprints/${sprintId}/backlog-items | MATCH | ApiResponse<SprintProgressData> | No direct consumer found | 401; PASS auth boundary only |
| sprints.removeBacklogItem | DELETE | /api/v1/sprints/${sprintId}/backlog-items/${pbiId} | MATCH | ApiResponse<null> | src/features/backlog/services/backlogService.ts, src/features/sprints/services/sprintService.ts | NOT TESTED |
| sprints.progress | GET | /api/v1/sprints/${sprintId}/progress | MATCH | ApiResponse<SprintProgressData> | src/features/sprints/services/sprintService.ts | 401; PASS auth boundary only |
| sprints.burndown | GET | /api/v1/sprints/${sprintId}/burndown | MATCH | ApiResponse<SprintBurndownData> | src/features/sprints/services/sprintService.ts | 401; PASS auth boundary only |
| tasks.list | GET | /api/v1/projects/${projectId}/tasks | MATCH | ApiResponse<PaginatedData<TaskData>> | No direct consumer found | 401; PASS auth boundary only |
| tasks.create | POST | /api/v1/projects/${projectId}/tasks | MATCH | ApiResponse<TaskData> | src/features/kanban/services/kanbanService.ts | NOT TESTED |
| tasks.get | GET | /api/v1/tasks/${taskId} | MATCH | ApiResponse<TaskDetailData> | src/features/kanban/services/kanbanService.ts | 401; PASS auth boundary only |
| tasks.update | PUT | /api/v1/tasks/${taskId} | MATCH | ApiResponse<TaskData> | src/features/kanban/services/kanbanService.ts | NOT TESTED |
| tasks.delete | DELETE | /api/v1/tasks/${taskId} | MATCH | ApiResponse<null> | src/features/kanban/services/kanbanService.ts | NOT TESTED |
| tasks.createSubtask | POST | /api/v1/tasks/${taskId}/subtasks | MATCH | ApiResponse<TaskData> | src/features/kanban/services/kanbanService.ts | NOT TESTED |
| tasks.assign | PATCH | /api/v1/tasks/${taskId}/assignee | MATCH | ApiResponse<TaskData> | No direct consumer found | NOT TESTED |
| tasks.changePriority | PATCH | /api/v1/tasks/${taskId}/priority | MATCH | ApiResponse<TaskData> | src/features/kanban/services/kanbanService.ts | NOT TESTED |
| tasks.setDeadline | PATCH | /api/v1/tasks/${taskId}/deadline | MATCH | ApiResponse<TaskData> | No direct consumer found | NOT TESTED |
| tasks.updateProgress | PATCH | /api/v1/tasks/${taskId}/progress | MATCH | ApiResponse<TaskData> | No direct consumer found | NOT TESTED |
| tasks.getOverdue | GET | /api/v1/projects/${projectId}/tasks/overdue | MATCH | ApiResponse<PaginatedData<TaskData>> | No direct consumer found | 401; PASS auth boundary only |
| tasks.getDeadlineAlerts | GET | /api/v1/projects/${projectId}/tasks/deadline-alerts | MATCH | ApiResponse<DeadlineAlertsData> | No direct consumer found | 401; PASS auth boundary only |
| board.get | GET | /api/v1/projects/${projectId}/board | MATCH | ApiResponse<BoardData> | src/features/kanban/services/kanbanService.ts | 401; PASS auth boundary only |
| board.move | PATCH | /api/v1/tasks/${taskId}/move | MATCH | ApiResponse<MoveTaskResult> | src/features/kanban/services/kanbanService.ts | NOT TESTED |
| wip.get | GET | /api/v1/projects/${projectId}/wip | MATCH | ApiResponse<WipStatusData> | No direct consumer found | 401; PASS auth boundary only |
| wip.getAlerts | GET | /api/v1/projects/${projectId}/wip/alerts | MATCH | ApiResponse<WipStatusData> | No direct consumer found | 401; PASS auth boundary only |
| wip.setLimit | PUT | /api/v1/projects/${projectId}/board/columns/${columnId}/wip-limit | MATCH | ApiResponse<WipLimitResult> | src/features/kanban/services/kanbanService.ts | NOT TESTED |
| wip.removeLimit | DELETE | /api/v1/projects/${projectId}/board/columns/${columnId}/wip-limit | MATCH | ApiResponse<WipLimitResult> | src/features/kanban/services/kanbanService.ts | NOT TESTED |
| flowMetrics.wip | GET | /api/v1/projects/${projectId}/flow-metrics/wip | MATCH | ApiResponse<FlowWipData> | src/features/metrics/services/metricService.ts | 401; PASS auth boundary only |
| flowMetrics.throughput | GET | /api/v1/projects/${projectId}/flow-metrics/throughput | MATCH | ApiResponse<ThroughputData> | src/features/metrics/services/metricService.ts | 401; PASS auth boundary only |
| flowMetrics.throughputSprints | GET | /api/v1/projects/${projectId}/flow-metrics/throughput/sprints | MATCH | ApiResponse<SprintsThroughputData> | No direct consumer found | 401; PASS auth boundary only |
| flowMetrics.cycleTime | GET | /api/v1/projects/${projectId}/flow-metrics/cycle-time | MATCH | ApiResponse<PaginatedData<CycleTimeItem>> | src/features/metrics/services/metricService.ts | 401; PASS auth boundary only |
| flowMetrics.cycleTimeAverage | GET | /api/v1/projects/${projectId}/flow-metrics/cycle-time/average | MATCH | ApiResponse<CycleTimeAverageData> | src/features/metrics/services/metricService.ts | 401; PASS auth boundary only |
| flowMetrics.workItemAge | GET | /api/v1/projects/${projectId}/flow-metrics/work-item-age | MATCH | ApiResponse<WorkItemAgeData> | src/features/metrics/services/metricService.ts | 401; PASS auth boundary only |
| bugs.list | GET | /api/v1/projects/${projectId}/bugs | MATCH | ApiResponse<PaginatedData<BugData>> | src/features/bugs/services/bugService.ts | 401; PASS auth boundary only |
| bugs.create | POST | /api/v1/bugs | MATCH | ApiResponse<BugData> | src/features/bugs/services/bugService.ts | NOT TESTED |
| bugs.createForTask | POST | /api/v1/tasks/${taskId}/bugs | MATCH | ApiResponse<BugData> | No direct consumer found | NOT TESTED |
| bugs.get | GET | /api/v1/bugs/${bugId} | MATCH | ApiResponse<BugDetailData> | src/features/bugs/services/bugService.ts | 401; PASS auth boundary only |
| bugs.update | PUT | /api/v1/bugs/${bugId} | MATCH | ApiResponse<BugData> | src/features/bugs/services/bugService.ts | NOT TESTED |
| bugs.delete | DELETE | /api/v1/bugs/${bugId} | MATCH | ApiResponse<null> | src/features/bugs/services/bugService.ts | NOT TESTED |
| bugs.assign | PATCH | /api/v1/bugs/${bugId}/assignee | MATCH | ApiResponse<BugData> | src/features/bugs/services/bugService.ts | NOT TESTED |
| bugs.changePriority | PATCH | /api/v1/bugs/${bugId}/priority | MATCH | ApiResponse<BugData> | No direct consumer found | NOT TESTED |
| bugs.changeStatus | PATCH | /api/v1/bugs/${bugId}/status | MATCH | ApiResponse<BugData> | src/features/bugs/services/bugService.ts | NOT TESTED |
| bugs.close | POST | /api/v1/bugs/${bugId}/close | MATCH | ApiResponse<BugData> | src/features/bugs/services/bugService.ts | NOT TESTED |
| comments.listByTask | GET | /api/v1/tasks/${taskId}/comments | MATCH | ApiResponse<PaginatedData<CommentData>> | src/features/kanban/components/TaskDetailDrawer.tsx | 401; PASS auth boundary only |
| comments.createForTask | POST | /api/v1/tasks/${taskId}/comments | MATCH | ApiResponse<CommentData> | src/features/bugs/services/bugService.ts, src/features/kanban/components/TaskDetailDrawer.tsx, src/features/kanban/services/kanbanService.ts | NOT TESTED |
| comments.get | GET | /api/v1/comments/${commentId} | MATCH | ApiResponse<CommentData> | No direct consumer found | 401; PASS auth boundary only |
| comments.update | PUT | /api/v1/comments/${commentId} | MATCH | ApiResponse<CommentData> | No direct consumer found | NOT TESTED |
| comments.delete | DELETE | /api/v1/comments/${commentId} | MATCH | ApiResponse<null> | src/features/kanban/components/TaskDetailDrawer.tsx | NOT TESTED |
| attachments.uploadForTask | POST | /api/v1/tasks/${taskId}/attachments | MATCH | ApiResponse<{ items: AttachmentData[] }> | src/features/kanban/components/TaskDetailDrawer.tsx | NOT TESTED |
| attachments.listByTask | GET | /api/v1/tasks/${taskId}/attachments | MATCH | ApiResponse<PaginatedData<AttachmentData>> | src/features/kanban/components/TaskDetailDrawer.tsx | 401; PASS auth boundary only |
| attachments.get | GET | /api/v1/attachments/${attachmentId} | MATCH | ApiResponse<AttachmentData> | No direct consumer found | 401; PASS auth boundary only |
| attachments.delete | DELETE | /api/v1/attachments/${attachmentId} | MATCH | ApiResponse<null> | src/features/kanban/components/TaskDetailDrawer.tsx | NOT TESTED |
| attachments.downloadBlob | GET | /api/v1/attachments/${attachmentId}/download | MATCH | Blob | src/features/kanban/components/TaskDetailDrawer.tsx | 401; PASS auth boundary only |
| attachments.previewBlob | GET | /api/v1/attachments/${attachmentId}/preview | MATCH | Blob | src/features/kanban/components/TaskDetailDrawer.tsx | 401; PASS auth boundary only |
| notifications.list | GET | /api/v1/notifications | MATCH | ApiResponse<PaginatedData<NotificationData>> | src/features/notifications/services/notificationService.ts | 401; PASS auth boundary only |
| notifications.getUnreadCount | GET | /api/v1/notifications/unread-count | MATCH | ApiResponse<{ unreadCount: number }> | No direct consumer found | 401; PASS auth boundary only |
| notifications.markAsRead | PATCH | /api/v1/notifications/${notificationId}/read | MATCH | ApiResponse<NotificationData> | src/features/notifications/services/notificationService.ts | NOT TESTED |
| notifications.markAllAsRead | PATCH | /api/v1/notifications/read-all | MATCH | ApiResponse<{ updated: number }> | src/features/notifications/services/notificationService.ts | NOT TESTED |
| activityLogs.listByProject | GET | /api/v1/projects/${projectId}/activity-logs | MATCH | ApiResponse<PaginatedData<ActivityLogItem>> | src/features/notifications/services/notificationService.ts | 401; PASS auth boundary only |
| chat.editMessage | PUT | /api/v1/chat/rooms/${roomId}/messages/${messageId} | MATCH | ApiResponse<ChatMessageData> | src/features/chat/services/chatService.ts | NOT TESTED |
| chat.listRooms | GET | /api/v1/chat/rooms | MATCH | ApiResponse<ChatRoomData[]> | src/features/chat/services/chatService.ts | 401; PASS auth boundary only |
| chat.createRoom | POST | /api/v1/chat/rooms | MATCH | ApiResponse<{ chatRoomId: number }> | src/features/chat/services/chatService.ts | NOT TESTED |
| chat.listParticipants | GET | /api/v1/chat/rooms/${roomId}/participants | MATCH | ApiResponse<ChatParticipantData[]> | No direct consumer found | 401; PASS auth boundary only |
| chat.addParticipants | POST | /api/v1/chat/rooms/${roomId}/participants | MATCH | ApiResponse<null> | No direct consumer found | NOT TESTED |
| chat.removeParticipant | DELETE | /api/v1/chat/rooms/${roomId}/participants/${userId} | MATCH | ApiResponse<null> | No direct consumer found | NOT TESTED |
| chat.listMessages | GET | /api/v1/chat/rooms/${roomId}/messages | MATCH | ApiResponse<ChatMessagesData> | src/features/chat/services/chatService.ts | 401; PASS auth boundary only |
| chat.sendMessage | POST | /api/v1/chat/rooms/${roomId}/messages | MATCH | ApiResponse<ChatMessageData> | src/features/chat/services/chatService.ts | NOT TESTED |
| chat.sendMessage | POST | /api/v1/chat/rooms/${roomId}/messages | MATCH | ApiResponse<ChatMessageData> | src/features/chat/services/chatService.ts | NOT TESTED |
| chat.markRead | POST | /api/v1/chat/rooms/${roomId}/read | MATCH | ApiResponse<null> | src/features/chat/services/chatService.ts | NOT TESTED |
| chat.getUnreadCount | GET | /api/v1/chat/unread-count | MATCH | ApiResponse<{ unreadCount: number }> | No direct consumer found | 401; PASS auth boundary only |
| chat.downloadAttachmentBlob | GET | /api/v1/chat/attachments/${attachmentId} | MATCH | Blob | No direct consumer found | 401; PASS auth boundary only |
| chat.previewAttachmentBlob | GET | /api/v1/chat/attachments/${attachmentId}/preview | MATCH | Blob | No direct consumer found | 401; PASS auth boundary only |
| admin.listUsers | GET | /api/v1/admin/users | MATCH | ApiResponse<PaginatedData<AdminUserData>> | src/features/admin/services/adminService.ts | 401; PASS auth boundary only |
| admin.createUser | POST | /api/v1/admin/users | MATCH | ApiResponse<{ userId: number; systemRole: string }> | src/features/admin/services/adminService.ts | NOT TESTED |
| admin.listRoles | GET | /api/v1/admin/roles | MATCH | ApiResponse<SystemRoleData[]> | No direct consumer found | 401; PASS auth boundary only |
| admin.updateUserRole | PUT | /api/v1/admin/users/${userId}/role | MATCH | ApiResponse<{ userId: number; systemRole: string }> | src/features/admin/services/adminService.ts | NOT TESTED |
| admin.getConfig | GET | /api/v1/admin/system-config | MATCH | ApiResponse<SystemConfigData> | src/features/admin/services/adminService.ts | 401; PASS auth boundary only |
| admin.updateConfig | PUT | /api/v1/admin/system-config | MATCH | ApiResponse<null> | src/features/admin/services/adminService.ts | NOT TESTED |
| admin.activityLogs | GET | /api/v1/admin/activity-logs | MATCH | ApiResponse<PaginatedData<ActivityLogItem>> | src/features/admin/components/AuditLogsTab.tsx | 401; PASS auth boundary only |
| permissions.getMePermissions | GET | /api/v1/me/permissions | MATCH | ApiResponse<PermissionsData> | No direct consumer found | 401; PASS auth boundary only |

## Declared response/request fields

Declared FE fields below are an inventory, not proof that the server supplied them. Nullable fields, envelope shapes and UI mappings still require scenario verification.

### ApiResponse

- `success: boolean`
- `message: string`
- `data: T`

### PaginatedData

- `items: T[]`
- `total: number`
- `page: number`
- `pageSize: number`

### LoginPayload

- `email: string`
- `password: string`

### LoginResultData

- `accessToken: string`
- `tokenType: string`
- `expiresAtUtc: string`
- `user: { userId: number fullName: string email: string systemRole: 'ADMIN' | 'USER' }`

### RegisterPayload

- `fullName: string`
- `email: string`
- `password: string`
- `confirmPassword: string`

### RegisterResultData

- `userId: number`
- `systemRole: string`

### ForgotPasswordPayload

- `email: string`

### ResetPasswordPayload

- `token: string`
- `newPassword: string`
- `confirmPassword: string`

### ChangePasswordPayload

- `currentPassword: string`
- `newPassword: string`
- `confirmPassword: string`

### UserProfileData

- `userId: number`
- `fullName: string`
- `email: string`
- `phoneNumber: string | null`
- `avatar: string | null`
- `systemRole: 'ADMIN' | 'USER'`
- `createdAt: string`

### UpdateProfilePayload

- `fullName: string`
- `email: string`
- `phoneNumber?: string | null`

### UpdateProfileResultData

- `userId: number`
- `fullName: string`
- `email: string`
- `phoneNumber: string | null`
- `updatedAt: string`

### UpdateAvatarResultData

- `avatar: string`

### LockUnlockUserResultData

- `userId: number`
- `status: 0 | 1`

### ProjectData

- `projectId: number`
- `projectName: string`
- `description: string | null`
- `startDate: string | null`
- `endDate: string | null`
- `status: 'ACTIVE' | 'CLOSED' | 'DELETED'`
- `createdBy: number`
- `projectRole: 'MANAGER' | 'MEMBER' | null`
- `createdAt: string`
- `updatedAt: string | null`

### ProjectRequest

- `projectName: string`
- `description?: string | null`
- `startDate?: string | null`
- `endDate?: string | null`

### ListProjectsQuery

- `page?: number`
- `pageSize?: number`
- `keyword?: string`
- `status?: 'ACTIVE' | 'CLOSED'`

### ProjectMemberData

- `userId: number`
- `fullName: string`
- `email: string`
- `avatar: string | null`
- `status: number`
- `projectRole: 'MANAGER' | 'MEMBER'`
- `departmentId: number | null`
- `departmentName: string | null`
- `joinedAt: string`

### ListProjectMembersQuery

- `page?: number`
- `pageSize?: number`
- `keyword?: string`
- `departmentId?: number`

### AddProjectMemberPayload

- `userId: number`

### PromoteProjectMemberPayload

- `role: 'MANAGER'`

### ProjectMemberMutationResult

- `projectId: number`
- `userId: number`
- `projectRole: 'MANAGER' | 'MEMBER' | null`

### DepartmentData

- `departmentId: number`
- `projectId: number`
- `departmentName: string`
- `description: string | null`
- `memberCount: number`

### DepartmentRequest

- `departmentName: string`
- `description?: string | null`

### AssignDepartmentPayload

- `departmentId: number | null`

### DepartmentMutationResult

- `projectId: number`
- `departmentId: number`
- `departmentName: string`
- `description: string | null`

### AssignDepartmentResult

- `projectId: number`
- `userId: number`
- `departmentId: number | null`

### EpicData

- `color?: string | null`
- `epicId: number`
- `projectId: number`
- `title: string`
- `description: string | null`
- `priority: number`
- `status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CLOSED'`
- `createdBy: number`
- `createdAt: string`
- `updatedAt: string | null`

### EpicRequest

- `color?: string | null`
- `title: string`
- `description?: string | null`
- `priority: number`
- `status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CLOSED'`

### ListEpicsQuery

- `page?: number`
- `pageSize?: number`
- `keyword?: string`
- `status?: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CLOSED'`

### EpicProgressData

- `epicId: number`
- `totalPbis: number`
- `completedPbis: number`
- `pbiProgressPercent: number`
- `totalTasks: number`
- `completedTasks: number`
- `taskProgressPercent: number`

### LinkEpicPayload

- `epicId: number`

### ProductBacklogItemData

- `pbiId: number`
- `epicId: number`
- `title: string`
- `description: string | null`
- `storyPoint: number`
- `priority: number`
- `status: 'NEW' | 'READY' | 'IN_SPRINT' | 'DONE'`
- `createdAt: string`
- `updatedAt: string | null`

### BacklogRequest

- `epicId: number`
- `title: string`
- `description?: string | null`
- `storyPoint: number`
- `priority: number`
- `status: 'NEW' | 'READY' | 'IN_SPRINT' | 'DONE'`

### ListBacklogQuery

- `projectId: number`
- `epicId?: number`
- `page?: number`
- `pageSize?: number`
- `keyword?: string`
- `status?: 'NEW' | 'READY' | 'IN_SPRINT' | 'DONE'`

### ChangePriorityPayload

- `priority: number`

### BacklogOrderPayload

- `epicId: number`
- `pbiIds: number[]`

### SprintData

- `sprintId: number`
- `projectId: number`
- `sprintName: string`
- `sprintGoal: string | null`
- `startDate: string`
- `endDate: string`
- `status: 'PLANNED' | 'ACTIVE' | 'CLOSED'`

### SprintRequest

- `projectId: number`
- `sprintName: string`
- `sprintGoal?: string | null`
- `startDate: string`
- `endDate: string`

### ListSprintsQuery

- `projectId: number`
- `status?: 'PLANNED' | 'ACTIVE' | 'CLOSED'`
- `page?: number`
- `pageSize?: number`

### AddPbisToSprintPayload

- `pbiIds: number[]`

### SprintProgressItem

- `pbiId: number`
- `title: string`
- `storyPoint: number`
- `status: string`

### SprintProgressData

- `sprint: SprintData`
- `items: SprintProgressItem[]`
- `totalPbis: number`
- `completedPbis: number`
- `totalStoryPoints: number`
- `completedStoryPoints: number`
- `remainingStoryPoints: number`
- `progressPercent: number`
- `totalTasks: number`
- `completedTasks: number`

### BurndownPoint

- `date: string`
- `idealRemaining: number`
- `actualRemaining: number | null`

### SprintBurndownData

- `sprintId: number`
- `unit: string`
- `totalScope: number`
- `historyAvailableFrom: string | null`
- `points: BurndownPoint[]`
- `note: string`

### PersonSummary

- `userId: number`
- `fullName: string`
- `avatarCode: string`
- `avatarUrl: string | null`
- `role: string | null`

### TaskExtra

- `assigneeName?: string | null`
- `assigneeAvatarCode?: string | null`
- `assigneeRole?: string | null`
- `reporterName?: string | null`
- `epicTitle?: string | null`
- `epicColor?: string | null`
- `tags?: string[]`
- `storyPoints?: number | null`

### DirectoryUserData

- `userId: number`
- `fullName: string`
- `email: string`
- `avatarUrl: string | null`

### TaskData

- `taskId: number`
- `projectId: number`
- `sprintId: number | null`
- `epicId: number | null`
- `parentTaskId: number | null`
- `assigneeId: number | null`
- `reporterId: number`
- `title: string`
- `description: string | null`
- `priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`
- `status: string`
- `deadline: string | null`
- `progressPercent: number`
- `position: number`
- `startedAt: string | null`
- `completedAt: string | null`
- `createdAt: string`
- `updatedAt: string | null`

### TaskDetailData

- `task: TaskData`
- `subtasks: TaskData[]`

### TaskCreatePayload

- `tags?: string[]`
- `storyPoints?: number | null`
- `title: string`
- `description?: string | null`
- `sprintId?: number | null`
- `epicId?: number | null`
- `parentTaskId?: number | null`
- `assigneeId?: number | null`
- `priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`
- `deadline?: string | null`

### TaskUpdatePayload

- `tags?: string[]`
- `storyPoints?: number | null`
- `title: string`
- `description?: string | null`

### AssignTaskPayload

- `assigneeId: number | null`

### TaskPriorityPayload

- `priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`

### TaskDeadlinePayload

- `deadline: string | null`

### TaskProgressPayload

- `progressPercent: number`

### ListTasksQuery

- `page?: number`
- `pageSize?: number`
- `sprintId?: number`
- `assigneeId?: number`
- `keyword?: string`
- `status?: string`

### DeadlineAlertItem

- `task: TaskData`
- `alert: 'OVERDUE' | 'DUE_SOON'`

### DeadlineAlertsData

- `items: DeadlineAlertItem[]`
- `total: number`
- `page: number`
- `pageSize: number`
- `warningHours: number`
- `asOfUtc: string`

### BoardTaskCard

- `taskId: number`
- `title: string`
- `status: string`
- `position: number`
- `priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`
- `progressPercent: number`
- `assigneeId: number | null`
- `sprintId: number | null`
- `epicId: number | null`
- `parentTaskId: number | null`
- `deadline: string | null`

### BoardColumnData

- `boardColumnId: number`
- `columnName: string`
- `position: number`
- `wipLimit: number | null`
- `totalCount: number`
- `matchingCount: number`
- `isOverloaded: boolean`
- `hasMore: boolean`
- `tasks: BoardTaskCard[]`

### BoardData

- `projectId: number`
- `columns: BoardColumnData[]`
- `page: number`
- `pageSize: number`

### MoveTaskPayload

- `toStatus: string`
- `newPosition: number`

### MoveTaskResult

- `taskId: number`
- `fromStatus: string`
- `toStatus: string`
- `position: number`
- `progressPercent: number`
- `startedAt: string | null`
- `completedAt: string | null`

### BoardFilterQuery

- `sprintId?: number`
- `assigneeId?: number`
- `keyword?: string`
- `page?: number`
- `pageSize?: number`

### WipColumnData

- `boardColumnId: number`
- `columnName: string`
- `position: number`
- `wipLimit: number | null`
- `taskCount: number`
- `isOverloaded: boolean`
- `atCapacity: boolean`
- `excess: number`

### WipStatusData

- `projectId: number`
- `columns: WipColumnData[]`
- `asOfUtc: string`

### WipLimitPayload

- `wipLimit: number`

### WipLimitResult

- `boardColumnId: number`
- `columnName: string`
- `wipLimit: number | null`
- `taskCount: number`
- `isOverloaded: boolean`
- `changed: boolean`

### FlowWipData

- `projectId: number`
- `sprintId: number | null`
- `wip: number`
- `inProgress: number`
- `inReview: number`
- `asOfUtc: string`

### ThroughputPoint

- `date: string`
- `doneTasks: number`
- `historyComplete: boolean`

### ThroughputData

- `projectId: number`
- `sprintId: number | null`
- `from: string`
- `to: string`
- `totalDoneTasks: number`
- `points: ThroughputPoint[]`
- `importedBaselineCount: number`
- `historyTrackingStartedAtUtc: string | null`
- `hasPartialHistoricalCoverage: boolean`
- `definition: string`
- `asOfUtc: string`

### SprintThroughputItem

- `sprintId: number`
- `sprintName: string`
- `status: string`
- `startDate: string`
- `endDate: string`
- `doneTasks: number`

### SprintsThroughputData

- `items: SprintThroughputItem[]`
- `total: number`
- `page: number`
- `pageSize: number`
- `historyTrackingStartedAtUtc: string | null`
- `hasPartialHistoricalCoverage: boolean`
- `asOfUtc: string`

### CycleTimeItem

- `taskId: number`
- `title: string`
- `sprintId: number | null`
- `startedAt: string`
- `completedAt: string`
- `cycleTimeDays: number`

### CycleTimeAverageData

- `projectId: number`
- `sprintId: number | null`
- `validTasks: number`
- `skippedInvalidTasks: number`
- `averageCycleTimeDays: number | null`
- `asOfUtc: string`

### WorkItemAgeItem

- `taskId: number`
- `title: string`
- `sprintId: number | null`
- `status: string`
- `assigneeId: number | null`
- `startedAt: string`
- `workItemAgeDays: number`

### WorkItemAgeData

- `items: WorkItemAgeItem[]`
- `total: number`
- `page: number`
- `pageSize: number`
- `minAgeDays: number`
- `asOfUtc: string`
- `definition: string`

### BugData

- `taskTitle?: string | null`
- `taskCode?: string | null`
- `bugId: number`
- `taskId: number`
- `reporterId: number`
- `assigneeId: number | null`
- `title: string`
- `description: string`
- `environment: string | null`
- `severity: 'TRIVIAL' | 'MINOR' | 'MAJOR' | 'BLOCKER'`
- `priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`
- `status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED'`
- `createdAt: string`
- `updatedAt: string | null`
- `resolvedAt: string | null`

### BugCreatePayload

- `taskId: number`
- `title: string`
- `description: string`
- `environment?: string | null`
- `severity: 'TRIVIAL' | 'MINOR' | 'MAJOR' | 'BLOCKER'`
- `priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`

### BugUpdatePayload

- `title: string`
- `description: string`
- `environment?: string | null`
- `severity: 'TRIVIAL' | 'MINOR' | 'MAJOR' | 'BLOCKER'`
- `priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`

### BugAssigneePayload

- `assigneeId: number | null`

### BugPriorityPayload

- `priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`

### BugStatusPayload

- `status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED'`

### BugDetailData

- `bug: BugData`
- `task: { taskId: number; title: string; status: string; sprintId: number | null }`
- `taskComments: { total: number; items: { commentId: number; userId: number; content: string; createdAt: string; updatedAt: string | null }[] }`
- `taskAttachments: { total: number; items: { attachmentId: number; fileName: string; fileSize: number; uploadedBy: number; uploadedAt: string }[] }`
- `history: { total: number; items: { activityLogId: number; userId: number; action: string; description: string; createdAt: string }[] }`

### ListBugsQuery

- `status?: string`
- `severity?: string`
- `priority?: string`
- `assigneeId?: number`
- `taskId?: number`
- `keyword?: string`
- `page?: number`
- `pageSize?: number`

### CommentData

- `authorName?: string`
- `authorAvatarCode?: string`
- `authorRole?: string | null`
- `isEditable?: boolean`
- `commentId: number`
- `taskId: number`
- `userId: number`
- `content: string`
- `mentionedUserIds: number[]`
- `createdAt: string`
- `updatedAt: string | null`

### CommentPayload

- `content: string`

### AttachmentData

- `originalFileName?: string`
- `uploadedByName?: string`
- `mimeType?: string`
- `fileSizeBytes?: number`
- `url?: string | null`
- `attachmentId: number`
- `taskId: number`
- `fileName: string`
- `fileSize: number`
- `uploadedBy: number`
- `uploadedAt: string`
- `previewUrl: string`
- `downloadUrl: string`

### NotificationData

- `actorName?: string | null`
- `actorAvatarCode?: string | null`
- `actorRole?: string | null`
- `actorUnknown?: boolean`
- `targetTitle?: string | null`
- `isUrgent?: boolean`
- `notificationId: number`
- `title: string`
- `content: string | null`
- `type: string`
- `refType: string | null`
- `refId: number | null`
- `isRead: boolean`
- `createdAt: string`
- `readAt: string | null`

### ListNotificationsQuery

- `unreadOnly?: boolean`
- `page?: number`
- `pageSize?: number`

### ActivityLogItem

- `userName?: string | null`
- `userAvatarCode?: string | null`
- `userRole?: string | null`
- `entityTitle?: string | null`
- `isSystemAction?: boolean`
- `changes?: Record<string, { from: unknown; to: unknown }> | null`
- `activityLogId: number`
- `userId: number`
- `action: string`
- `entityType: string`
- `entityId: number | null`
- `description: string`
- `createdAt: string`

### ListActivityLogsQuery

- `entityType?: string`
- `action?: string`
- `page?: number`
- `pageSize?: number`

### ChatParticipantData

- `userId: number`
- `fullName: string`

### ChatAttachmentData

- `messageAttachmentId: number`
- `fileName: string`
- `fileSize: number`
- `downloadUrl: string`

### ChatMessageData

- `senderName?: string | null`
- `senderAvatarCode?: string | null`
- `senderRole?: string | null`
- `isEdited?: boolean`
- `editedAt?: string | null`
- `replyToMessageId?: number | null`
- `isEditable?: boolean`
- `messageId: number`
- `chatRoomId: number`
- `senderId: number`
- `content: string | null`
- `sentAt: string`
- `attachments?: ChatAttachmentData[]`

### ChatMessagesData

- `items: ChatMessageData[]`
- `hasMore: boolean`
- `nextBefore: number | null`

### ChatRoomData

- `otherParticipantName?: string | null`
- `otherParticipantAvatarCode?: string | null`
- `otherParticipantStatus?: 'ONLINE' | 'OFFLINE'`
- `participantsCount?: number`
- `lastMessageSenderName?: string | null`
- `chatRoomId: number`
- `roomType: 'PRIVATE' | 'GROUP'`
- `roomName: string | null`
- `projectId: number | null`
- `lastMessage?: ChatMessageData | null`
- `unreadCount?: number`

### CreateRoomPayload

- `roomType: 'PRIVATE' | 'GROUP'`
- `recipientId?: number | null`
- `projectId?: number | null`
- `roomName?: string | null`
- `participantIds?: number[]`

### SendMessagePayload

- `replyToMessageId?: number`
- `content?: string`

### ReadChatPayload

- `messageId?: number | null`

### ListMessagesQuery

- `before?: number`
- `limit?: number`
- `keyword?: string`

### AdminUserData

- `userId: number`
- `fullName: string`
- `email: string`
- `status: 0 | 1`
- `systemRole: 'ADMIN' | 'USER'`
- `createdAt: string`

### ListAdminUsersQuery

- `keyword?: string`
- `status?: 0 | 1`
- `page?: number`
- `pageSize?: number`

### SystemRoleData

- `roleId: number`
- `roleName: string`
- `scope: string`
- `description: string | null`

### SystemConfigEntry

- `configKey: string`
- `configValue: string`
- `description: string | null`
- `updatedAt: string | null`

### PermissionsData

- `systemRole: string`
- `systemPermissions: string[]`
- `projectId: number | null`
- `projectRole: string | null`
- `projectPermissions: string[]`
