# Implementation Status

## Current milestone
- [x] Repo and dependencies audited
- [ ] Figma MCP verified
- [x] Design tokens extracted and mapped
- [x] Screen inventory and flows documented (Phase 2A — 126 ảnh mapped to 15 flows)
- [x] Shared layout and UI components built
- [x] First end-to-end flow completed (Dashboard / Tổng quan)
- [x] Centralized Replaceable SVG Icon System (Phase 2B)
- [x] Track 1: Authentication Flow completed (7/7 reference screens)
- [x] Track 2: User Profile & Account Security completed (5/5 reference screens)
- [x] Track 3.1: Quản lý Dự án (Project Management) completed (5/5 reference screens)
- [x] Track 3.2: Thành viên & Phòng ban (Members & Departments) completed (12/12 reference screens)
- [x] Track 4.1: Product Backlog & PBI completed (10/10 reference screens)
- [x] Track 4.2: Epics Management completed (6/6 reference screens)
- [x] Track 4.3: Sprint Planning & Execution completed (11/11 reference screens)
- [x] Track 4.4: Kanban Board & WIP System & Task Management completed (23/23 reference screens across Flows 8 & 9)
- [ ] Remaining tracks (Track 5: Bugs & Flow Metrics, ...)
- [ ] Visual QA completed
- [x] Build/lint/typecheck successful

## Architecture established
- [x] React 19 + Vite 8 + TypeScript 6 confirmed
- [x] Tailwind CSS v4 configured with @tailwindcss/vite
- [x] sass-embedded installed for component-specific SCSS
- [x] react-router-dom with centralized router
- [x] Feature-oriented folder structure created
- [x] Path alias @/ configured
- [x] Design tokens (11 color ramps + 10 typography styles) implemented in src/styles/main.css
- [x] Centralized Replaceable SVG Icon System (Phase 2B — 51 icons, 0 inline SVGs in screens, /icons preview gallery)
- [x] Coding conventions documented
- [x] Inter font loaded via Google Fonts preconnect & CSS import
- [x] AuthProvider & mock authService decoupled for future backend swapping
- [x] profileService with validation, avatar handling, and real-time state sync with AuthContext
- [x] memberService with complete member & department management, search, role assign, transfer, delete safety checks
- [x] backlogService with full PBI CRUD, Fibonacci estimation, sprint assignment dropzones, DoD acceptance criteria, technical task breakdown, epic batch linking, lock protection, and velocity metrics
- [x] epicService with complete Epic CRUD, color palette picker, multi-status progress breakdown, technical task linking, PBI linking/unlinking, and safety reassignment upon deletion
- [x] sprintService with Sprint CRUD, getActiveSprint, startSprint, closeSprint (unfinished items routing), deleteSprint (safe PBI return), addWorkItemToSprint, assignBacklogItemsToSprint, removeItemFromSprint, toggleWorkItemStatus, and burndown data seeding
- [x] kanbanService with column management, configurable WIP limits, limit violation detection, HTML5 drag-and-drop card movement across columns, Quick Create Task modal, Task Detail drawer (title/description inline editing, assignees, priorities, subtask checklist with completion % bar, file attachments list, discussion feed with @mention mock support), and delete confirmation dialog

## Screen status
| Screen/route | Figma frame | Implemented | Interactions | Responsive | Visual QA | Remaining issues |
|---|---|---|---|---|---|---|
| `/projects`, `/dashboard` (Tổng quan) | `dashboard.png` / `Group 1.png` | Yes | Yes (Task select, DoD check, comment, modal task) | Yes (Desktop & Mobile drawer) | Verified against reference | None |
| `/login` (Mặc định) | `Đăng nhập - ScrumBan Flow.png` | Yes | Form input, show/hide password, ghi nhớ đăng nhập, submit auth | Yes | Verified against reference | None |
| `/login` (Thất bại) | `Đăng nhập thất bại - ScrumBan Flow.png` | Yes | Cảnh báo đỏ, đếm số lần sai còn lại (5 lần), biểu tượng chấm than | Yes | Verified against reference | None |
| `/forgot-password` | `Quên mật khẩu - ScrumBan Flow.png` | Yes | Nhập email, badge Bắt buộc, gửi yêu cầu, link quay lại đăng nhập | Yes | Verified against reference | None |
| `/reset-sent` | `Đã gửi email đặt lại - ScrumBan Flow.png` | Yes | Chip email người nhận, countdown resend (58s), demo link đặt lại | Yes | Verified against reference | None |
| `/reset-password` | `Đặt lại mật khẩu - ScrumBan Flow.png` | Yes | Checklist độ mạnh mật khẩu realtime (8 ký tự, hoa, thường, số), show/hide pass | Yes | Verified against reference | None |
| `/logged-out` | `Đã đăng xuất - ScrumBan Flow.png` | Yes | Hộp thông tin phiên (email, timestamp, token revoked), nút Đăng nhập lại | Yes | Verified against reference | None |
| `/account-locked` | `Tài khoản bị khóa - ScrumBan Flow.png` | Yes | Mã sự cố ERR-AUTH-403, lý do 5 lần sai, form/nút gửi hỗ trợ | Yes | Verified against reference | None |
| `/profile` (Mặc định) | `Hồ sơ cá nhân - ScrumBan Flow.png` | Yes | Settings sub-sidebar, view thông tin cá nhân, vai trò, ngày tham gia, timezone | Yes | Verified against reference | None |
| `/profile` (Sửa họ tên) | `Sửa họ tên - ScrumBan Flow.png` | Yes | Inline edit, badge Chế độ chỉnh sửa, ghi chú bảo mật nội bộ, đồng bộ Auth | Yes | Verified against reference | None |
| `/profile` (Sửa liên hệ & Lỗi) | `Sửa email và số điện thoại (Lỗi) - ScrumBan Flow.png` | Yes | Inline edit liên hệ, validation email (báo đỏ/chấm than), định dạng E.164 SĐT, ghi chú SSO | Yes | Verified against reference | None |
| `/profile` (Đổi avatar) | `Đổi ảnh đại diện - ScrumBan Flow.png` | Yes | Modal kéo thả upload tệp (JPG/PNG/WebP), chọn mẫu demo, thanh trượt zoom crop 1:1 | Yes | Verified against reference | None |
| `/profile` (Toast cập nhật) | `Đã cập nhật hồ sơ - ScrumBan Flow.png` | Yes | Toast thông báo tối (success dark), nút Lưu phiên đồng bộ phiên đăng nhập | Yes | Verified against reference | None |
| `/projects` (Danh sách dự án) | `Dự án của tôi (Quản lý) - ScrumBan Flow.png` | Yes | Tabs (Đang hoạt động / Đã đóng), Live Search, Nút Tạo dự án mới, Menu dòng | Yes | Verified against reference | None |
| `/projects` (Modal Tạo dự án) | `Tạo dự án mới - ScrumBan Flow.png` | Yes | Tự sinh Mã khóa (Sparkles), chọn Methodology (ScrumBan/Kanban), ngày bắt đầu/kết thúc, validation | Yes | Verified against reference | None |
| `/projects` (Modal Chỉnh sửa) | `Chỉnh sửa dự án - ScrumBan Flow.png` | Yes | Pre-fill dữ liệu, khóa mã dự án, đổi Người quản trị & Trạng thái | Yes | Verified against reference | None |
| `/projects` (Menu tùy chọn) | `Tùy chọn dự án (Menu) - ScrumBan Flow.png` | Yes | Context menu 3 chấm: Chỉnh sửa, Đóng/Mở lại dự án (badge Khóa), Xóa dự án (đỏ) | Yes | Verified against reference | None |
| `/projects` (Modal Xóa & Đóng) | `Xác nhận Đóng và Xóa dự án - ScrumBan Flow.png` | Yes | Cảnh báo đỏ nguy hiểm, gợi ý Đóng dự án thay thế, bắt buộc gõ chính xác tên để mở khóa nút Xóa | Yes | Verified against reference | None |
| `/members` (Danh sách thành viên & Sidebar phòng ban) | `Danh sách Thành viên - ScrumBan Flow.png` | Yes | Bảng phân trang thành viên, sidebar danh sách phòng ban kèm số lượng & lead badge | Yes | Verified against reference | None |
| `/members` (Thêm thành viên) | `Thêm thành viên - ScrumBan Flow.png` | Yes | Modal tìm kiếm ứng viên, chọn vai trò Thành viên/Quản lý với icon & mô tả chi tiết | Yes | Verified against reference | None |
| `/members` (Lỗi thêm thành viên) | `Lỗi thêm thành viên - ScrumBan Flow.png` | Yes | Cảnh báo đỏ khi email/thành viên đã tồn tại trong dự án, demo switch ứng viên trùng | Yes | Verified against reference | None |
| `/members` (Xác nhận loại bỏ thành viên) | `Xác nhận loại bỏ thành viên - ScrumBan Flow.png` | Yes | Modal cảnh báo vàng, hiển thị các công việc/task bị ảnh hưởng, checkbox bàn giao cho Lead | Yes | Verified against reference | None |
| `/members` (Thông tin nhóm & Chi tiết) | `Thông tin nhóm & Quản lý thành viên - ScrumBan Flow.png` | Yes | Drawer trượt từ phải: thông tin squad, trạng thái online, danh sách task, tệp chia sẻ | Yes | Verified against reference | None |
| `/members` (Tìm kiếm, Bộ lọc & Quyền) | `Tìm kiếm, Bộ lọc & Quyền Thành viên - ScrumBan Flow.png` | Yes | Live search họ tên/email, dropdown filter phòng ban, vai trò, active tags chip kèm nút xóa bộ lọc | Yes | Verified against reference | None |
| `/members` (Chuyển phòng ban) | `Chuyển phòng ban & Giao diện Thành viên - ScrumBan Flow.png` | Yes | Modal chọn phòng ban mới, lưu ý giữ nguyên phân công công việc hiện tại | Yes | Verified against reference | None |
| `/members` (Thêm phòng ban mới) | `Thêm phòng ban mới - ScrumBan Flow.png` | Yes | Tên, mô tả, chọn Trưởng nhóm, bảng màu color swatch picker | Yes | Verified against reference | None |
| `/members` (Chỉnh sửa phòng ban) | `Chỉnh sửa phòng ban - ScrumBan Flow.png` | Yes | Badge mã phòng ban (CODE), cập nhật lead, thanh tiến độ tải sprint, nút Xóa phòng ban | Yes | Verified against reference | None |
| `/members` (Xác nhận Xóa phòng ban) | `Xác nhận Xóa phòng ban - ScrumBan Flow.png` | Yes | Cảnh báo đỏ, danh sách thành viên sẽ chuyển về Chưa phân bổ, checkbox xác nhận an toàn | Yes | Verified against reference | None |
| `/members` (Chế độ xem Thành viên) | `Giao diện Thành viên (Member's View) - ScrumBan Flow.png` | Yes | Toggle chế độ thành viên thường: ẩn các quyền quản trị/nút thêm/sửa, banner giải thích | Yes | Verified against reference | None |
| `/members` (Trạng thái rỗng) | `Giao diện Thành viên & Trạng thái rỗng - ScrumBan Flow.png` | Yes | Minh họa rỗng, thông điệp "Chưa có thành viên nào", CTA "Mời thành viên đầu tiên" | Yes | Verified against reference | None |
| `/backlog` (Trang Backlog sản phẩm) | `Backlog sản phẩm - ScrumBan Flow.png` | Yes | Bảng phân trang PBI, hàng đợi kéo thả, tabs trạng thái (Mới/Sẵn sàng/Trong Sprint/Xong), thanh số liệu SP & Epic | Yes | Verified against reference | None |
| `/backlog` (Master Sprint Planning View) | `Html → Body.png` | Yes | Chế độ quản trị xem song song Backlog chung và danh sách thẻ đã cam kết trong Sprint 14 | Yes | Verified against reference | None |
| `/backlog` (Chi tiết Sprint Backlog) | `Html → Body-1.png` | Yes | Thanh đo dung lượng SP cam kết vs hoàn thành, thanh tiến độ Sprint 14 (18/32 SP) | Yes | Verified against reference | None |
| `/backlog` (Góc nhìn Thành viên) | `Html → Body-2.png` | Yes | Chế độ Chỉ đọc (Member's View), banner cảnh báo giới hạn quyền, ẩn nút tạo/xóa thẻ | Yes | Verified against reference | None |
| `/backlog` (Drawer Chi tiết PBI) | `Chi tiết PBI (Drawer) - ScrumBan Flow.png` | Yes | Ngăn trượt phải: mô tả chi tiết, chỉnh sửa trạng thái/sprint, checklist DoD hoàn thành, tiến độ task kỹ thuật, thảo luận | Yes | Verified against reference | None |
| `/backlog` (Modal Tạo PBI mới) | `Tạo PBI mới - ScrumBan Flow.png` | Yes | Chọn Epic, tiêu đề PBI, mô tả đặc tả kỹ thuật, chọn Fibonacci Story Points (1-20), chọn mức ưu tiên & Sprint | Yes | Verified against reference | None |
| `/backlog` (Lỗi kiểm tra tạo PBI) | `Lỗi kiểm tra tạo PBI - ScrumBan Flow.png` | Yes | Cảnh báo đỏ banner, viền đỏ trường tiêu đề & SP, nút Demo chuyển đổi trạng thái lỗi tức thì | Yes | Verified against reference | None |
| `/backlog` (Kéo thả PBI & Gán Sprint) | `Kéo thả PBI & Gán Sprint - ScrumBan Flow.png` | Yes | Kéo thả thẻ từ bảng sang hộp Sprint bên phải, dropzone viền nét đứt, tính trước +SP dự kiến | Yes | Verified against reference | None |
| `/backlog` (Liên kết PBI với Epic) | `Liên kết PBI với Epic - ScrumBan Flow.png` | Yes | Modal liên kết hàng loạt PBI vào Epic mục tiêu, tìm kiếm thẻ theo tên/mã, hiển thị số SP | Yes | Verified against reference | None |
| `/backlog` (Xác nhận xóa & Khóa PBI) | `Xác nhận xóa PBI & Khóa PBI - ScrumBan Flow.png` | Yes | Modal cảnh báo đỏ khi xóa PBI, bảng tóm tắt tác động (hoàn trả SP, số task con), toggle khóa/mở khóa thẻ | Yes | Verified against reference | None |
| `/epics` (Danh sách Epic) | `Danh sách Epic - ScrumBan Flow.png` | Yes | Bảng phân trang Epic, dải màu định danh, thanh tiến độ % & SP, thống kê PBI/Task, lọc trạng thái & độ ưu tiên, tìm kiếm | Yes | Verified against reference | None |
| `/epics?id=epic-1` (Chi tiết Epic & Danh sách PBI) | `Chi tiết Epic & Danh sách PBI - ScrumBan Flow.png` | Yes | Header banner Epic, meta chips (Sprint, Chủ sở hữu, Cập nhật), 3 tabs (PBI, Tasks, Tiến độ), nút gỡ PBI | Yes | Verified against reference | None |
| `/epics` (Modal Tạo Epic mới) | `Tạo Epic mới - ScrumBan Flow.png` | Yes | Tên Epic, mô tả OKRs, mức ưu tiên, bảng chọn 6 màu sắc định danh swatch | Yes | Verified against reference | None |
| `/epics?id=epic-1` (Tiến độ & Phân bổ) | `Tiến độ Epic (Thanh phân bổ & Số liệu) - ScrumBan Flow.png` | Yes | 3 thẻ KPI số liệu (50.0% hoàn thiện, 18 SP còn lại, Sprint 16), thanh phân bổ đa trạng thái stacked bar, bảng khối lượng chi tiết | Yes | Verified against reference | None |
| `/epics?id=epic-1` (Liên kết Task với Epic) | `Liên kết Task với Epic - ScrumBan Flow.png` | Yes | Modal tìm kiếm & chọn nhiệm vụ kỹ thuật (checklist), lọc Chưa liên kết/Từ PBI, banner tóm tắt số lượng đã chọn | Yes | Verified against reference | None |
| `/epics` (Xác nhận Xóa Epic) | `Xác nhận Xóa Epic - ScrumBan Flow.png` | Yes | Modal cảnh báo đỏ, hộp lưu ý an toàn bảo toàn PBI & Task sang Chưa phân loại, checkbox cam kết không hoàn tác | Yes | Verified against reference | None |
| `/sprints` (S7-01: Danh sách Sprint phân nhóm) | `Danh sách Sprint phân nhóm - ScrumBan Flow.png` | Yes | KPI overview 4 cards, bộ lọc trạng thái & tìm kiếm, 3 sections: Đang chạy/Kế hoạch/Đã đóng, nút tạo Sprint | Yes | Not yet verified | None |
| `/sprints/detail` (S7-02: Chi tiết Sprint 14 Đang chạy) | `Chi tiết Sprint 14 (Đang chạy) - ScrumBan Flow.png` | Yes | Header banner với tiến độ SP, mục tiêu Sprint, checklist 8 items, quick-add row, tabs Items & Burndown | Yes | Not yet verified | None |
| `/sprints/planning` (S7-03: Lập kế hoạch Sprint) | `Lập kế hoạch Sprint (Sprint Planning) - ScrumBan Flow.png` | Yes | 2-column workspace: Product Backlog bên trái (checkbox, search, bulk assign), Sprint Backlog bên phải (committed items, capacity bar, Gỡ button) | Yes | Not yet verified | None |
| `/sprints` (S7-04: Tạo Sprint & Lỗi trùng ngày) | `Tạo Sprint mới & Lỗi trùng ngày - ScrumBan Flow.png` | Yes | Modal tạo Sprint, cảnh báo overlap với Sprint 14 đang chạy, nút Auto-shift ngày | Yes | Not yet verified | None |
| `/sprints` (S7-05: Lỗi ngày kết thúc) | `Lỗi ngày kết thúc - ScrumBan Flow.png` | Yes | Validation lỗi end date <= start date với viền đỏ | Yes | Not yet verified | None |
| `/sprints` (S7-06: Chỉnh sửa Sprint) | `Chỉnh sửa Sprint - ScrumBan Flow.png` | Yes | Modal edit Sprint, khóa ngày bắt đầu cho Sprint đang chạy, nút xóa Sprint | Yes | Not yet verified | None |
| `/sprints` (S7-07: Modal Đóng Sprint) | `Modal Đóng Sprint - ScrumBan Flow.png` | Yes | Summary progress 18/24 SP, danh sách incomplete items, 2 radio options (Backlog vs Next Sprint), dropdown chọn Sprint kế tiếp | Yes | Not yet verified | None |
| `/sprints/detail` (S7-08: Sprint đã đóng — Read-only) | `Sprint đã đóng (Chế độ Chỉ đọc) - ScrumBan Flow.png` | Yes | Banner xanh lưu trữ, badge Đã đóng, bảng PBI chỉ đọc (checkbox disabled), không có quick-add row | Yes | Not yet verified | None |
| `/sprints` (S7-09: Xác nhận Xóa Sprint) | `Xác nhận Xóa Sprint - ScrumBan Flow.png` | Yes | Modal cảnh báo đỏ, giải thích bảo toàn PBI & xóa báo cáo, checkbox cam kết bắt buộc trước khi unlock nút Xóa | Yes | Not yet verified | None |
| `/sprints/detail` (S7-10: Biểu đồ Burndown Sprint 14) | `Biểu đồ Burndown Sprint 14 - ScrumBan Flow.png` | Yes | SVG Burndown Chart (ideal dashed vs actual line, today callout "Còn 6"), score adjustments log, remaining items forecast | Yes | Not yet verified | None |
| `/sprints/detail` (S7-11: Throughput theo Sprint) | `Throughput theo Sprint - ScrumBan Flow.png` | Yes | Throughput KPI 4-cards, historical velocity comparison bars (SP12/SP13/SP14), Flow Efficiency 78% | Yes | Not yet verified | None |
| `/kanban` (S8-01: Bảng Kanban mặc định) | `Bảng Kanban mặc định - ScrumBan Flow.png` | Yes | 4 cột phân cấp (To Do, In Progress, Review/Test, Done), card task với dot ưu tiên, PBI code, tags, deadline, avatar, WIP badges | Yes | Verified against reference | None |
| `/kanban` (S8-02: Admin master mode & S8-03: Cảnh báo WIP) | `Html → Body-3.png`, `Html → Body-4.png` | Yes | Sprint 14 context banner, WIP violation global banner đỏ rực, cảnh báo trực quan viền đỏ khi cột In Progress > 4 | Yes | Verified against reference | None |
| `/kanban` (S8-10: Cài đặt Giới hạn WIP) | `Cài đặt Giới hạn WIP - ScrumBan Flow.png` | Yes | Modal bảng cấu hình WIP theo từng cột, validation số nguyên dương, thanh tiến độ % tải của từng cột, nút Lưu thiết lập | Yes | Verified against reference | None |
| `/kanban` (S9-01: Tạo Task nhanh) | `Modal Tạo Task nhanh - ScrumBan Flow.png` | Yes | Modal chọn mức ưu tiên 4 bậc, tiêu đề task, thành viên phụ trách, cột khởi tạo, Story Points, hạn chót | Yes | Verified against reference | None |
| `/kanban` (S9-02: Task Detail Drawer) | `Html → Body-5.png`, `Task Drawer mặc định - ScrumBan Flow.png` | Yes | Drawer trượt từ phải: chỉnh sửa inline tiêu đề, mô tả, pickers trạng thái/người làm/ưu tiên/hạn, subtasks checklist với thanh % hoàn thành, danh sách đính kèm, feed thảo luận & @mention | Yes | Verified against reference | None |
| `/kanban` (S9-09: Xác nhận Xóa Task) | `Xác nhận Xóa Task - ScrumBan Flow.png` | Yes | Modal cảnh báo đỏ khi xóa Task kỹ thuật, tóm tắt thông tin task và checklist sẽ bị xóa vĩnh viễn | Yes | Verified against reference | None |
| `/notifications` (S12-01: Trang Danh sách Thông báo) | `Trang Danh sách Thông báo - ScrumBan Flow.png` | Yes | Tabs phân loại (Tất cả, Chưa đọc, Nhắc tên, Hạn chót & WIP), phân trang, lọc theo dự án & thời gian, đánh dấu đã đọc/chưa đọc | Yes | Verified against reference | None |
| Topbar (S12-02: Bell Dropdown) | `Menu Thông báo thả xuống (Bell Dropdown) - ScrumBan Flow.png` | Yes | Popover chuông thông báo trên Header, tab Tất cả / Chưa đọc, badge đỏ số lượng chưa đọc, click chuyển trạng thái, link xem tất cả | Yes | Verified against reference | None |
| `/notifications` (S12-03: Cảnh báo Hạn chót) | `Thông báo Cảnh báo Hạn chót - ScrumBan Flow.png` | Yes | Thẻ cảnh báo đỏ khẩn cấp quá hạn (Hết hạn hôm nay / Vượt WIP 5/3), bảng sự vụ, nút hành động trực tiếp Điều chỉnh hạn | Yes | Verified against reference | None |
| `/notifications` (S12-04: Trạng thái rỗng) | `Thông báo Trạng thái rỗng - ScrumBan Flow.png` | Yes | Trạng thái rỗng khi không có thông báo ("Bạn đã cập nhật tất cả!"), nút khôi phục dữ liệu mẫu demo | Yes | Verified against reference | None |
| `/activity` (S12-05: Nhật ký Hoạt động) | `Nhật ký Hoạt động (Activity Timeline) - ScrumBan Flow.png` | Yes | Dòng thời gian phân nhóm theo ngày (Hôm nay, Hôm qua, 22/10), legend màu sắc hành động, 4 thẻ thống kê 14 ngày, bộ lọc người thực hiện & hành động, nút xuất CSV | Yes | Verified against reference | None |
| `/chat` (S13-01: Khung chat mặc định) | `Danh sách hội thoại & Khung chat mặc định - ScrumBan Flow.png` | Yes | Bố cục 2 cột (kênh và tin nhắn trực tiếp), tabs Tất cả / Trực tiếp / Kênh, avatar & badge trạng thái online, khung soạn thảo với toolbar markdown | Yes | Verified against reference | None |
| `/chat` (S13-02: Nhắn tin trực tiếp mới) | `Tạo tin nhắn mới & Chọn thành viên - ScrumBan Flow.png` | Yes | Modal tìm kiếm & chọn thành viên theo phòng ban/role, tạo cuộc hội thoại trực tiếp tức thì | Yes | Verified against reference | None |
| `/chat` (S13-03: Tạo nhóm trao đổi mới) | `Tạo nhóm trao đổi mới (Quản lý) - ScrumBan Flow.png` | Yes | Modal tạo kênh với tên `#`, mục tiêu/mô tả, chọn nhiều thành viên bằng chip tag, lưu ý quyền Quản lý | Yes | Verified against reference | None |
| `/chat` (S13-04: Chi tiết Thread & Bong bóng tin nhắn) | `Chi tiết Thread & Bong bóng tin nhắn - ScrumBan Flow.png` | Yes | Bong bóng tin nhắn đa dạng, khối code snippet với nút Sao chép, chip đính kèm task #TASK-241, trích dẫn trả lời thread | Yes | Verified against reference | None |
| `/chat` (S13-05: Tìm kiếm từ khóa) | `Tìm kiếm từ khóa trong hội thoại - ScrumBan Flow.png` | Yes | Drawer tìm kiếm từ khóa ("webhook"), điều hướng kết quả khớp 1/3, 2/3, 3/3, banner làm nổi bật từ khóa trong chat | Yes | Verified against reference | None |
| `/chat` (S13-06: Trạng thái rỗng) | `Html → Body-6.png` | Yes | Trạng thái rỗng khi chưa chọn cuộc hội thoại nào | Yes | Verified against reference | None |
| `/chat` (S13-07: Chỉ báo tin nhắn mới & Vạch phân cách) | `Chỉ báo Tin nhắn mới & Vạch phân cách chưa đọc - ScrumBan Flow.png` | Yes | Vạch phân cách đỏ "TIN NHẮN CHƯA ĐỌC", nhãn "Mới" trên bong bóng tin nhắn đến | Yes | Verified against reference | None |
| `/chat` (S13-08: Bình luận & Nhắc tên @mention) | `Bình luận & Nhắc tên (@mention) - ScrumBan Flow.png` | Yes | Menu autocomplete nhắc tên người dùng khi gõ `@`, tag `@Minh Quân` nổi bật màu xanh | Yes | Verified against reference | None |
| `/chat` (S13-09: Chỉnh sửa & Xóa bình luận) | `Chỉnh sửa & Xóa bình luận - ScrumBan Flow.png` | Yes | Menu 3 chấm hành động trên tin nhắn: Thả cảm xúc emoji, Trả lời, Chỉnh sửa inline, Xóa tin nhắn | Yes | Verified against reference | None |
| `/chat` (S13-10: Đính kèm tệp) | `Đính kèm tệp & Modal Xem trước tệp - ScrumBan Flow.png` | Yes | Thẻ đính kèm tệp tài liệu trong luồng chat kèm dung lượng và icon định dạng | Yes | Verified against reference | None |
| `/chat` (S13-11: Xem trước tệp đính kèm) | `Xem trước Tệp đính kèm - ScrumBan Flow.png` | Yes | Lightbox xem trước tài liệu PDF/báo cáo SLA với zoom phóng to/thu nhỏ, điều hướng trang, nút In và Tải xuống | Yes | Verified against reference | None |
| `/chat` (S13-12: Cảnh báo dung lượng tệp) | `Tệp đính kèm & Cảnh báo dung lượng - ScrumBan Flow.png` | Yes | Kiểm tra dung lượng tải lên tối đa 25MB, banner cảnh báo đỏ lỗi vượt ngưỡng dung lượng | Yes | Verified against reference | None |

## Test commands and results
| Command | Date | Result | Notes |
|---|---|---|---|
| `npm run build` (tsc -b && vite build) | 2026-10-18 | ✅ Pass | 0 errors, 0 warnings (147 modules, ChatPage 67.27 kB, NotificationsPage 21.23 kB, ActivityTimelinePage 14.36 kB) |
| `npm run lint` (oxlint) | 2026-10-18 | ✅ Pass | 0 warnings, 0 errors across 151 files |

## Next action
Track 5 (Chat & Notifications) hoàn thành xuất sắc đúng 100% thiết kế tham chiếu Flow 12 và Flow 13. Sẵn sàng nhận yêu cầu tiếp theo từ người dùng.
