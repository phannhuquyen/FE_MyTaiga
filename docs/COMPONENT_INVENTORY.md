# Component Inventory — Taiga ScrumBan Frontend

> **Mục tiêu**: Liệt kê, chuẩn hóa và phân loại toàn bộ các thành phần giao diện (UI Components) tái sử dụng trong hệ thống Taiga ScrumBan Flow.  
> **Nguyên tắc**: Tối đa hóa khả năng tái sử dụng (reusability), thống nhất việc áp dụng Design Tokens (Màu sắc và Typography từ Phase 2), phân định rõ ràng giữa **Core UI Components** (không phụ thuộc nghiệp vụ) và **Domain Composites** (kết hợp nghiệp vụ).

---

## 1. Phân loại cấu trúc thành phần (Component Taxonomy)

Hệ thống UI được chia thành 6 tầng thành phần chính:
1. **Layout & Navigation**: Khung ứng dụng, thanh điều hướng, chuyển đổi bối cảnh.
2. **Data Display & Visuals**: Huy hiệu, tiến độ, avatar, đồ thị đo lường.
3. **Form & Interactive Controls**: Nút bấm, ô nhập liệu, bộ chọn ngày, switch.
4. **Feedback & Overlays**: Hộp thoại, ngăn kéo, thông báo nổi, banner cảnh báo.
5. **State & Placeholder Views**: Khung xương tải dữ liệu, màn hình rỗng, màn hình lỗi.
6. **Domain-Specific Composites**: Thẻ Kanban, dòng PBI, thẻ Epic, bong bóng chat.

---

## 2. Danh mục chi tiết các thành phần dùng chung (Core UI Components)

### 2.1. Layout & Navigation (`src/components/layout/` & `src/components/ui/`)

| Tên Component | Vị trí khuyến nghị | Props chính | Trạng thái hỗ trợ | Sử dụng tại các Luồng |
|---|---|---|---|---|
| `AppLayout` | `src/components/layout/` | `children`, `sidebarCollapsed` | Default, Mobile Drawer | Xuyên suốt toàn bộ ứng dụng |
| `Sidebar` | `src/components/layout/` | `activeItem`, `isCollapsed`, `onToggle` | Default, Collapsed, Mobile | Flow 0, 3, 4, 5, 6, 7, 8, 10, 11, 13, 14 |
| `Header / Topbar` | `src/components/layout/` | `currentProject`, `unreadCount`, `onQuickAdd` | Default, Sticky | Xuyên suốt ứng dụng |
| `ProjectPicker` | `src/components/ui/` | `projects`, `selectedId`, `onSelect` | Open, Closed, Searching | Topbar, Flow 3, 5, 8 |
| `UserMenuDropdown` | `src/components/ui/` | `user`, `onLogout`, `onNavigate` | Open, Closed | Topbar, Flow 1, 2, 14 |
| `Breadcrumb` | `src/components/ui/` | `items: { label, href }[]` | Default, Truncated | Header các trang chi tiết Flow 5, 6, 7, 11 |
| `Tabs` | `src/components/ui/` | `tabs: { id, label, count? }[]`, `activeId`, `onChange` | Default, With Badges | Flow 4, 7, 11, 12, 14 |

---

### 2.2. Data Display & Visuals (`src/components/ui/`)

| `Icon` | `src/components/ui/Icon/` | `name: IconName`, `size?`, `color?`, `className?` | 45 icons, stroke/fill, currentColor, auto accessibility | Toàn bộ các flow (Thay thế 100% inline SVG) |
| `Badge / Pill` | `src/components/ui/Badge.tsx` | `variant`, `size`, `children`, `icon?` | `primary`, `neutral`, `success`, `danger`, `warning`, `info` | Toàn bộ các flow |
| `PriorityBadge` | `src/components/ui/PriorityBadge.tsx` | `priority: 'low' \| 'medium' \| 'high' \| 'urgent'` | Thấp (Xám), Trung bình (Xanh), Cao (Cam), Khẩn cấp (Đỏ) | Flow 0, 5, 8, 9, 11 |
| `StatusPill` | `src/components/ui/StatusPill.tsx` | `status: 'todo' \| 'in_progress' \| 'testing' \| 'done'` | 4 màu trạng thái dòng chảy | Flow 0, 5, 8, 9 |
| `Avatar` | `src/components/ui/Avatar.tsx` | `src`, `name`, `size: 'xs' \| 'sm' \| 'md' \| 'lg'`, `status?` | Default, Fallback initials, Online/Offline dot | Xuyên suốt ứng dụng |
| `AvatarGroup` | `src/components/ui/AvatarGroup.tsx` | `users: User[]`, `max: number`, `size?` | Default, `+N` overflow counter | Flow 0, 3, 4, 6, 8 |
| `ProgressBar` | `src/components/ui/ProgressBar.tsx` | `value: number`, `max: number`, `color?`, `showLabel?` | Default, Striped, Success highlight | Flow 0, 3, 5, 7, 9 |
| `MultiSegmentProgressBar` | `src/components/ui/MultiSegmentProgressBar.tsx` | `segments: { value, color, label }[]` | Phân đoạn Done/In Progress/To Do | Flow 6 (Epic), Flow 7 (Sprint) |
| `StatCard` | `src/components/ui/StatCard.tsx` | `title`, `value`, `subValue?`, `trend?`, `icon?` | Default, Alert highlight | Flow 0, 10 (Metrics) |
| `WorkflowStepper` | `src/components/ui/WorkflowStepper.tsx` | `steps: string[]`, `currentStep: number`, `onStepClick?` | Completed, Active, Upcoming, Disabled | Flow 11 (Bugs Lifecycle) |

---

### 2.3. Form & Interactive Controls (`src/components/ui/`)

| Tên Component | Vị trí khuyến nghị | Props chính | Trạng thái & Biến thể | Sử dụng tại các Luồng |
|---|---|---|---|---|
| `Button` | `src/components/ui/Button.tsx` | `variant: 'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'outline'`, `size`, `loading?`, `disabled?`, `icon?` | Normal, Hover, Active, Disabled, Loading spinner | Toàn bộ ứng dụng |
| `Input` | `src/components/ui/Input.tsx` | `label?`, `error?`, `helperText?`, `icon?`, `isClearable?` | Default, Focus ring, Error đỏ, Disabled | Form đăng nhập, tạo việc, sửa thông tin |
| `SearchInput` | `src/components/ui/SearchInput.tsx` | `value`, `onChange`, `placeholder?`, `debounceMs?` | Default, Clear icon, Loading spinner | Flow 0, 4, 5, 8, 12, 13 |
| `Select / Dropdown` | `src/components/ui/Select.tsx` | `options: { value, label, icon? }[]`, `value`, `onChange`, `error?` | Default, Opened, Selected, Searchable | Flow 3, 4, 5, 7, 9, 11 |
| `DatePicker` | `src/components/ui/DatePicker.tsx` | `value`, `onChange`, `minDate?`, `error?` | Inline popover, Quick ranges (1w, 2w) | Flow 7 (Sprint), Flow 9 (Deadline) |
| `Checkbox` | `src/components/ui/Checkbox.tsx` | `checked`, `onChange`, `label?`, `indeterminate?` | Checked, Unchecked, Indeterminate, Disabled | Flow 0, 5, 9 (DoD Checklist), 14 |
| `SwitchToggle` | `src/components/ui/SwitchToggle.tsx` | `checked`, `onChange`, `label?` | On (`primary-500`), Off (`neutral-300`) | Flow 2, 8 (WIP toggle), 14 (Roles) |
| `Textarea` | `src/components/ui/Textarea.tsx` | `rows?`, `label?`, `error?`, `maxLength?` | Auto-resize, Character counter | Flow 5, 9, 11, 13 |
| `FileUploader` | `src/components/ui/FileUploader.tsx` | `maxSizeMB`, `acceptedTypes`, `onFilesSelected` | Drag active, Uploading, Error size limit | Flow 2 (Avatar), 11 (Bug screenshot), 13 |

---

### 2.4. Feedback & Overlays (`src/components/ui/`)

| Tên Component | Vị trí khuyến nghị | Props chính | Mô tả chức năng & Visual | Sử dụng tại các Luồng |
|---|---|---|---|---|
| `Modal` | `src/components/ui/Modal.tsx` | `isOpen`, `onClose`, `title`, `size?`, `children` | Backdrop mờ, bẫy focus bàn phím, nút X đóng, animation scale | 34 modals trong toàn hệ thống |
| `Drawer` | `src/components/ui/Drawer.tsx` | `isOpen`, `onClose`, `title`, `width?`, `children` | Trượt từ cạnh phải (450px-650px), hỗ trợ resize hoặc full | Flow 0, 5, 8, 9, 11, 13 |
| `ConfirmDialog` | `src/components/ui/ConfirmDialog.tsx` | `isOpen`, `title`, `message`, `confirmText`, `danger?`, `requireMatchText?` | Dialog cảnh báo nguy hiểm, nút đỏ, yêu cầu gõ lại tên để xác nhận | Flow 3, 4, 5, 6, 7, 8, 9, 11, 14 |
| `ToastContainer & Toast` | `src/components/ui/Toast.tsx` | `toasts: ToastItem[]`, `onDismiss` | Góc trên phải, 4 biến thể màu, tự trôi sau 3-5 giây | Flow 2, 3, 5, 8, 15 |
| `AlertBanner` | `src/components/ui/AlertBanner.tsx` | `type: 'warning' \| 'danger' \| 'info'`, `message`, `actionText?` | Banner nổi trên đầu cột hoặc trang cảnh báo vi phạm WIP | Flow 1, 7, 8 (WIP Alert), 15 |
| `Tooltip` | `src/components/ui/Tooltip.tsx` | `content`, `position: 'top' \| 'bottom' \| 'left' \| 'right'` | Hover popover giải thích nút icon hoặc thông số rút gọn | Toàn bộ ứng dụng |
| `Lightbox` | `src/components/ui/Lightbox.tsx` | `isOpen`, `mediaUrl`, `fileName`, `onClose`, `onDownload` | Xem trước ảnh full-screen trên nền đen mờ 90% | Flow 11, Flow 13 (Tệp đính kèm) |

---

### 2.5. States & Placeholders (`src/components/ui/`)

| Tên Component | Vị trí khuyến nghị | Props chính | Mô tả trực quan | Sử dụng tại các Luồng |
|---|---|---|---|---|
| `SkeletonLoader` | `src/components/ui/Skeleton.tsx` | `variant: 'text' \| 'circular' \| 'rectangular'`, `width`, `height` | Hiệu ứng shimmer xám nhẹ (`neutral-100` / `neutral-200`) | Toàn bộ các trang khi tải dữ liệu |
| `SkeletonTable` | `src/components/ui/SkeletonTable.tsx` | `rows: number`, `columns: number` | Khung xương mô phỏng bảng danh sách | Flow 4, 5, 11, 14 |
| `EmptyStateView` | `src/components/ui/EmptyStateView.tsx` | `icon?`, `title`, `description`, `action?: { label, onClick }` | Hình minh họa/icon mềm, thông điệp hướng dẫn, nút bấm CTA | Flow 4, 8, 10, 12, 13, 15 |
| `SessionTimeoutModal` | `src/components/ui/SessionTimeoutModal.tsx` | `isOpen`, `onReLogin` | Modal chặn người dùng, bảo vệ dữ liệu khi hết hạn phiên | Flow 15 |
| `ErrorPageLayout` | `src/components/ui/ErrorPageLayout.tsx` | `code: '403' \| '404' \| 'offline'`, `title`, `description`, `action` | Màn hình lỗi chuyên dụng toàn trang | Flow 15 |

---

## 3. Danh mục các thành phần tổng hợp theo nghiệp vụ (Domain Composites)

Các component này được đặt tại thư mục tương ứng `src/features/<feature>/components/`:

### 3.1. Dự án & Nhóm (`src/features/projects/components/` & `members/`)
- `ProjectCard`: Thẻ dự án hiển thị tên, key, avatar các thành viên, thanh tiến độ hoàn thành, menu ngữ cảnh 3 chấm.
- `MemberTableRow`: Dòng trong bảng thành viên hiển thị avatar, họ tên, email, tag phòng ban, dropdown đổi vai trò và nút xóa.
- `DepartmentBadge`: Nhãn hiển thị phòng ban với màu pastel dịu.

### 3.2. Backlog, Sprint & Epic (`src/features/backlog/components/`, `sprints/`, `epics/`)
- `PBIRow`: Dòng User Story/PBI có tay cầm kéo thả (drag handle), mã định danh (ví dụ: `SCRUM-241`), tag Epic, Story Points badge, và nút mở drawer.
- `EpicCard`: Thẻ Epic hiển thị tiêu đề, dải màu nhận diện, thanh tiến độ chia đoạn (Done/In Progress/To Do) và số PBI liên kết.
- `SprintHeaderWidget`: Thanh công cụ thông tin Sprint active: ngày còn lại, tổng điểm Story Points, nút "Hoàn thành Sprint".
- `BurndownChartWidget`: Biểu đồ SVG thể hiện đường tiến độ thực tế vs kế hoạch.

### 3.3. Kanban Board & Thao tác Task (`src/features/kanban/components/` & `tasks/`)
- `KanbanColumn`: Khung cột Kanban (To Do, In Progress, In Testing, Done) có chỉ số WIP đếm thẻ (ví dụ `4/3`), nút thu gọn cột, nút "+ Thêm việc".
- `KanbanCard`: Thẻ công việc trên bảng có viền màu ưu tiên, mã task, tiêu đề, checklist mini (ví dụ: `✓ 3/5`), avatar người làm và deadline badge.
- `WIPAlertBanner`: Banner cảnh báo xuất hiện trong cột khi số lượng thẻ vượt mức WIP tối đa quy định.
- `TaskDrawer`: Ngăn kéo trượt chi tiết công việc tích hợp tiêu đề inline editable, bộ chọn trạng thái, danh sách subtask tương tác, thảo luận và lịch sử.

### 3.4. Bug Tracking & Luồng lỗi (`src/features/bugs/components/`)
- `BugTableRow`: Dòng hiển thị mã lỗi (ví dụ: `BUG-089`), mức độ nghiêm trọng (Blocker đỏ, Major cam, Minor vàng), trạng thái theo quy trình.
- `BugWorkflowStepper`: Thanh tiến trình chuyển trạng thái 5 bước (New -> Confirmed -> In Progress -> Resolved -> Closed).

### 3.5. Trò chuyện & Tệp đính kèm (`src/features/chat/components/`)
- `ChannelListItem`: Dòng hiển thị kênh hoặc tên thành viên chat, chỉ báo tin nhắn chưa đọc (Unread badge tròn xanh).
- `MessageBubble`: Bong bóng chat tin nhắn đến/đi, hiển thị avatar người gửi, thời gian, menu hành động hover (Reaction, Reply thread, Delete).
- `UnreadDivider`: Vạch phân cách màu thông báo tin nhắn mới nhận.
- `FileAttachmentCard`: Thẻ hiển thị file đính kèm kèm icon định dạng (PDF, PNG, DOCX), kích thước và nút xem trước/tải về.
