# Rà soát hard-coded data FE và đối chiếu BE

Ngày rà soát 10/11/2026, múi giờ Asia/Bangkok.

## Phạm vi và mức kiểm chứng

FE tại `D:/personal/MyTaiga`, branch `fix/quyenpn-20261109`, commit `2cc6356`.
BE được đọc tại `D:/personal/be_taiga/BE-MyTaiga`, commit `8fccccb`.
Đã lần theo route, component, service adapter, API tập trung, controller, DTO,
entity và ResponseEnricher. Đã đối chiếu BACKEND_PROGRESS.md với mã nguồn hiện tại.

Kết quả **FAIL về tính nhất quán dữ liệu hiển thị** ở các trường hợp có dẫn chứng
bên dưới. Đây là kết luận từ mã nguồn `STATIC` và contract controller `API-source`.
Chưa chạy UI, gọi API có xác thực hoặc truy vấn database trong đợt báo cáo này.
Không suy ra database thiếu bản ghi chỉ vì FE đang hiện dữ liệu mẫu.

Các chỉnh sửa dropdown thông báo và test overlay có sẵn trong working tree được
giữ nguyên. Lượt này chỉ tạo báo cáo này. Không thêm regression test hoặc sửa code.

Trong báo cáo, hard-coded data là giá trị nghiệp vụ được gán cố định, dữ liệu
mẫu, hoặc giá trị tự suy diễn thay cho dữ liệu nguồn. Nhãn dịch, enum trạng thái,
màu giao diện, kích thước biểu đồ và lựa chọn Story Point được phân biệt riêng.

## Contract BE dùng để đối chiếu

Tất cả endpoint trong bảng có tiền tố `/api/v1`.

| Mã | API / nguồn BE | Trường hoặc khả năng đã có |
|---|---|---|
| BE1 | [ProjectsController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/ProjectsController.cs:21), [ProjectMembersController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/ProjectMembersController.cs:46) | `GET /projects`, `/projects/{id}`, `/projects/{id}/members`. Project có `projectName`, `createdBy`, lịch, trạng thái, `projectRole`. Members có `items[].userId/fullName/avatar/projectRole/departmentName` và `total` |
| BE2 | [SprintsController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/SprintsController.cs:199) | `GET /sprints?projectId`, `/sprints/{id}/progress`, `/backlog-items`, `/burndown`. Progress có `totalStoryPoints`, `completedStoryPoints`, `items[].pbiId/storyPoint/status`, số Task/PBI |
| BE3 | [TasksController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/TasksController.cs:42), [ResponseEnricher.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Services/ResponseEnricher.cs:58) | `GET /projects/{id}/tasks`, `/tasks/{id}`. Có filter `assigneeId`, `sprintId`, deadline, creator/reporter, tên và avatar, Epic, tags, Story Points |
| BE4 | [FlowMetricsController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/FlowMetricsController.cs:34) | `/projects/{id}/flow-metrics/wip`, `/throughput`, `/throughput/sprints`, `/cycle-time`, `/cycle-time/average`, `/work-item-age`. Có `asOfUtc`, `points[].doneTasks`, `items[].doneTasks`, `averageCycleTimeDays`, `workItemAgeDays`. Throughput còn trả mức đầy đủ lịch sử |
| BE5 | [ActivityLogsController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/ActivityLogsController.cs:13), [NotificationsController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/NotificationsController.cs) | Nhật ký có `createdAt/action/entityType/userId`, phân trang. Notification có danh sách, trạng thái đọc và endpoint unread count. ResponseEnricher bổ sung actor và changes |
| BE6 | [SystemAdminController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/SystemAdminController.cs:18) | `/admin/users`, `/admin/roles`, `/admin/system-config`, `/admin/activity-logs`, `/me/permissions`. Có các khóa `MAX_FAILED_LOGIN`, `JWT_EXPIRE_MINUTES`, `DEADLINE_WARNING_HOURS`, `MAX_FILE_SIZE_MB`, `MAX_COMMENT_LENGTH`, `DEFAULT_SPRINT_WEEKS` và các khóa khác trong whitelist |
| BE7 | [EpicsController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/EpicsController.cs:18), [ProductBacklogController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/ProductBacklogController.cs:19) | Epic có `color`, `createdBy`, tiến độ đếm Task/PBI và link Task. PBI có `storyPoint`, `status`, Epic và thời gian tạo/cập nhật |
| BE8 | [ChatController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/ChatController.cs), [UsersController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/UsersController.cs:30) | Phòng chat, participants, lịch sử có keyword, message/reply, upload và preview file. Directory tài khoản có tên/avatar. Presence có phạm vi participant của phòng riêng qua ResponseEnricher |
| BE9 | [BugsController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/BugsController.cs:18), [AttachmentsController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/AttachmentsController.cs) | Bug có Task liên quan, reporter, assignee, severity/priority/status, description/environment và timestamps. Tệp và bình luận có API theo Task |
| BE10 | [UsersController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/UsersController.cs:71), [ProjectDepartmentsController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/ProjectDepartmentsController.cs), [WipController.cs](D:/personal/be_taiga/BE-MyTaiga/backend/MyTaigaAPI/Controllers/WipController.cs) | Hồ sơ, phòng ban và WIP limits hiện tại. Các entity chưa thấy trường emailVerified, locale, capacity Sprint, workload phòng ban |

## A. BE đã có dữ liệu hoặc có thể tổng hợp, FE vẫn dùng giá trị cố định

| ID | Vị trí FE | Dữ liệu đang dùng và lúc xuất hiện | BE có thiếu không / hướng cập nhật |
|---|---|---|---|
| A01 | [projectService.ts](D:/personal/MyTaiga/src/features/projects/services/projectService.ts:52) | Card dự án luôn có 1 thành viên, avatar `TV`, leader `PM` / `Bạn (Manager)` / `Quản lý dự án`. `totalMembers` lại bằng tổng số dự án | BE1 có members và `total`. Cần lấy đúng số thành viên và Manager. Phải định nghĩa tổng thành viên là số người duy nhất hay tổng membership trước khi cộng giữa dự án |
| A02 | [KanbanPage.tsx](D:/personal/MyTaiga/src/features/kanban/KanbanPage.tsx:211), [TaskDetailDrawer.tsx](D:/personal/MyTaiga/src/features/kanban/components/TaskDetailDrawer.tsx:506) | Banner `Sprint 14`, ngày `14/10/2024 — 28/10/2024`, nhãn Sprint trong drawer vẫn cố định | BE2/BE3 có lịch, Sprint thật và `task.sprintId`. FE chưa gắn đúng ngữ cảnh |
| A03 | [KanbanPage.tsx](D:/personal/MyTaiga/src/features/kanban/KanbanPage.tsx:328), [BugsPage.tsx](D:/personal/MyTaiga/src/features/bugs/BugsPage.tsx:309) | Filter người làm dùng tên mẫu. Bugs lấy `AVAILABLE_ASSIGNEES` gồm Minh Quân, Tuấn Anh, Thùy Trang… | BE1 có danh sách thành viên. Riêng popover giao Bug đã dùng members thật, không được coi cả tính năng giao Bug là mock |
| A04 | [ThroughputChart.tsx](D:/personal/MyTaiga/src/features/metrics/components/ThroughputChart.tsx:4) | Biểu đồ luôn Sprint 12/13/14, 14/15/18 thẻ. KPI là 18 thẻ, 78.2%, tăng 3 thẻ | BE4 có Throughput hiện tại, lịch sử theo ngày và so sánh Sprint. FE chưa gọi `throughputSprints`. SP và efficiency trong biểu đồ cần xử lý riêng, BE chưa trả cùng contract |
| A05 | [metricService.ts](D:/personal/MyTaiga/src/features/metrics/services/metricService.ts:109) | API thành công vẫn trộn `SPRINT_14_METRICS`. Nếu `averageCycleTimeDays=null`, giữ số mẫu 3.2. Nếu tuổi việc trả `items=[]`, KPI còn 2.1 / 4.8 / 1 | BE4 đã biểu diễn null/rỗng. Đây là sai mapping FE. Ngoài ra age được lấy một trang, trung bình/max FE tính trên trang đó chưa chắc là toàn bộ tập dữ liệu |
| A06 | [FlowMetricsPage.tsx](D:/personal/MyTaiga/src/features/metrics/FlowMetricsPage.tsx:161), [metricService.ts](D:/personal/MyTaiga/src/features/metrics/services/metricService.ts:10) | Khoảng ngày 2024, Epic `payment/core` là option cố định. `selectedRange/selectedCategory` không đi vào lệnh tải metrics. Đồng bộ hiện `Vừa xong` | BE4 hỗ trợ from/to cho Throughput và `asOfUtc`. Chưa có filter Epic tương ứng trên endpoint metrics. Cần chỉ bật filter có contract thật |
| A07 | [notificationService.ts](D:/personal/MyTaiga/src/features/notifications/services/notificationService.ts:718) | Thống kê Hoạt động luôn 148 sự kiện, 32 Task xong, 9 Bug, 3 WIP dù đổi dự án/ngày | BE5 có raw logs, có thể tổng hợp sau khi xác định mapping action. Không có endpoint thống kê 14 ngày riêng. FE hiện không tính từ dữ liệu đang lọc |
| A08 | [notificationService.ts](D:/personal/MyTaiga/src/features/notifications/services/notificationService.ts:604), [ActivityTimelinePage.tsx](D:/personal/MyTaiga/src/features/notifications/components/ActivityTimelinePage.tsx:155) | Tất cả log API bị gán `actionType='task_complete'`. Filter actor dùng danh sách tên mẫu. Mô tả lưu log 180 ngày là text cố định | BE5 có `action`, `entityType`, `userName`. FE có thể map đúng action và sinh option actor từ nguồn. Chưa thấy contract cam kết retention 180 ngày |
| A09 | [adminService.ts](D:/personal/MyTaiga/src/features/admin/services/adminService.ts:226) | Trong cấu hình thực tế, chỉ `MAX_FILE_SIZE_MB` được đọc và gửi. Các giá trị cảnh báo 24h, đăng nhập 5 lần, phiên 8 giờ vẫn từ `INITIAL_SETTINGS` hoặc state local | BE6 đã hỗ trợ `DEADLINE_WARNING_HOURS`, `MAX_FAILED_LOGIN`, `JWT_EXPIRE_MINUTES`. FE chưa map và persist các field tương ứng |
| A10 | [SystemSettingsTab.tsx](D:/personal/MyTaiga/src/features/admin/components/SystemSettingsTab.tsx:399) | Popup lịch sử cấu hình có các mốc `14/10/2024 - 15:42`, `02/10/2024 - 09:10` cố định | BE6 có `/admin/activity-logs` và action `SYSTEM_CONFIG_UPDATED`. Có thể dùng log thật. Snapshot thay đổi chi tiết chỉ có khi BE thực sự ghi được |
| A11 | [memberService.ts](D:/personal/MyTaiga/src/features/members/services/memberService.ts:66) | `assignedTasks=[]` cho mọi thành viên, nên drawer báo không có việc | BE3 có `GET tasks?assigneeId=...` và filter Sprint. FE chưa tải việc của thành viên |
| A12 | [epicService.ts](D:/personal/MyTaiga/src/features/epics/services/epicService.ts:189) | Tiến độ Epic tính SP bằng `số PBI x 3`. `totalPoints/completedPoints` trong map Epic khởi tạo 0 | BE7 có `PBI.storyPoint` và trạng thái để cộng điểm thật. Endpoint progress hiện chủ yếu trả counts, nên phải tổng hợp thêm PBI. Không được giả định mỗi PBI = 3 SP |
| A13 | [backlogService.ts](D:/personal/MyTaiga/src/features/backlog/services/backlogService.ts:189) | Màu Epic luôn `#0284c7`, count PBI trong EpicSummary luôn 0 | BE7 có `Epic.color`, progress/count và danh sách PBI. FE đang bỏ qua hoặc không tổng hợp dữ liệu này |
| A14 | [LinkTaskModal.tsx](D:/personal/MyTaiga/src/features/epics/components/LinkTaskModal.tsx:13), [epicService.ts](D:/personal/MyTaiga/src/features/epics/services/epicService.ts:314) | Danh sách 7 Task mẫu `task-301`…`task-318`, tên người làm/PBI mẫu. Modal đang được EpicDetailView dùng. Service tách chữ số và gọi API với các ID đó | BE3 có danh sách Task thật, BE7 có API link Task vào Epic. Rủi ro cao vì ID mẫu có thể trùng ID thật. Cần thay nguồn lựa chọn trước khi cho lưu |
| A15 | [AttachmentPreviewModal.tsx](D:/personal/MyTaiga/src/features/chat/components/AttachmentPreviewModal.tsx:187) | File không phải ảnh luôn hiện báo cáo K6 cố định, 8 trang, số liệu benchmark. Metadata có giờ 10:45, bản sửa đổi lần 3, danh sách người xem mẫu | BE8 có file thật và preview PDF/TXT có xác thực. FE chưa render nội dung file không phải ảnh. Số lần sửa/người xem chưa có nguồn BE tương ứng |
| A16 | [ChatSearchDrawer.tsx](D:/personal/MyTaiga/src/features/chat/components/ChatSearchDrawer.tsx:19), [chatService.ts](D:/personal/MyTaiga/src/features/chat/services/chatService.ts:842) | Từ khóa mặc định `webhook`, chọn kết quả thứ ba, tìm trong cache message đã tải | BE8 có history keyword và phân trang. FE có thể tìm trên dữ liệu thật đầy đủ hơn thay vì chỉ cache |
| A17 | [Header.tsx](D:/personal/MyTaiga/src/components/layout/Header.tsx:136), [SelfLockErrorModal.tsx](D:/personal/MyTaiga/src/features/admin/components/SelfLockErrorModal.tsx:42) | Tên Admin Quốc Bảo được viết trực tiếp | BE10/AuthContext có danh tính user thật. Header này chỉ hiện badge ở nhánh render admin của Header, còn AdminPortalLayout hiện có Header riêng |
| A18 | [NotificationsPage.tsx](D:/personal/MyTaiga/src/features/notifications/NotificationsPage.tsx:15) | Filter dự án `core/payment` và thời gian 7/14/30 ngày là state giao diện. Lệnh `getNotifications` chỉ truyền category/search | BE5 có `createdAt` để lọc ngày tại FE. Chưa có project filter đầy đủ trong response hiện FE dùng. Có thể cần BE bổ sung projectId rõ ràng thay vì đoán từ Task ID |
| A19 | [FlowMetricsPage.tsx](D:/personal/MyTaiga/src/features/metrics/FlowMetricsPage.tsx:96), [BacklogPage.tsx](D:/personal/MyTaiga/src/features/backlog/BacklogPage.tsx:234), [MembersPage.tsx](D:/personal/MyTaiga/src/features/members/MembersPage.tsx:296) | Tên dự án `ScrumBan Core Platform` cố định còn ở nhiều breadcrumb, mô tả và thông báo xác nhận của Bugs/Notifications/Activity | BE1 có tên dự án thật. Cần dùng cùng project context thay cho text mẫu |

## B. BE thiếu field/contract riêng, hoặc chỉ có một phần dữ liệu

“Chưa có” bên dưới nghĩa là chưa thấy field/endpoint đáp ứng trong mã BE đã kiểm
tra. Không kết luận một yêu cầu nghiệp vụ mới phải được bổ sung nếu chưa thống nhất
định nghĩa của nó.

| ID | Vị trí FE và hard-data | BE đang thiếu gì / có thể tái sử dụng gì | Cách giữ UI khi chưa có nguồn |
|---|---|---|---|
| B01 | [metricService.ts](D:/personal/MyTaiga/src/features/metrics/services/metricService.ts:28), [WipRunChart.tsx](D:/personal/MyTaiga/src/features/metrics/components/WipRunChart.tsx:50) — chuỗi WIP 14 ngày mẫu | BE4 trả WIP hiện tại, chưa có chuỗi WIP lịch sử. Không thể đổi tên Throughput thành WIP lịch sử | Giữ chart với nhãn minh họa, không coi điểm lịch sử là số đo thật |
| B02 | [metricService.ts](D:/personal/MyTaiga/src/features/metrics/services/metricService.ts:14), [WorkItemAgeChart.tsx](D:/personal/MyTaiga/src/features/metrics/components/WorkItemAgeChart.tsx:11) — WIP target 8, Cycle target 4, ngưỡng tuổi 5 ngày, thời gian backlog/review gán 0 | BE10 có limit từng cột WIP, không có cùng định nghĩa target Flow Metrics tổng hợp. BE4 chưa trả thời gian từng trạng thái hay flow efficiency. Chưa có cấu hình SLA/age threshold tương ứng | Phân biệt ngưỡng FE local với cấu hình BE. Giữ cột thiếu thời gian ở trạng thái chưa có dữ liệu |
| B03 | [sprintService.ts](D:/personal/MyTaiga/src/features/sprints/services/sprintService.ts:63), [backlogService.ts](D:/personal/MyTaiga/src/features/backlog/services/backlogService.ts:210), [CreateSprintModal.tsx](D:/personal/MyTaiga/src/features/sprints/components/CreateSprintModal.tsx:202) — capacity 25, velocity 24 hoặc 28.4 SP | Entity/DTO Sprint chưa có capacity. Tiến độ và điểm Sprint đã có ở BE2, có thể dùng để tính velocity sau khi xác định cửa sổ các Sprint đóng. `assignedSP=0/pbiCount=0` là thiếu tích hợp FE vì progress đã có | Capacity cần nhãn chưa hỗ trợ. Velocity chưa tính thì ghi chưa có dữ liệu, không dùng làm dự báo chính thức |
| B04 | [memberService.ts](D:/personal/MyTaiga/src/features/members/services/memberService.ts:39) — workload phòng ban 75%, mã `EMP-{id}`, chức danh `Project Manager/Team Member`, `isOnline=status===1` | BE10 không có workload/capacity hay mã nhân viên HR/chức danh tương ứng. Status=1 là tài khoản active, không chứng minh đang online. BE8 chỉ cung cấp presence trong ngữ cảnh phòng riêng, chưa có endpoint presence toàn danh sách members | Tách nhãn vai trò với chức danh. Không suy online từ trạng thái tài khoản |
| B05 | [MemberDetailDrawer.tsx](D:/personal/MyTaiga/src/features/members/components/MemberDetailDrawer.tsx:25) — team `Core Engineering & Release Squad`, ngày tạo/creator và 2 file mẫu | BE8 có chat groups nhưng không có contract ánh xạ member → squad như UI. Attachment API có theo Task, chưa có danh sách file của member trên toàn dự án. Với adapter hiện tại `sharedFiles=[]`, mảng 2 file fallback không được dùng vì `[]` là truthy | Giữ khung nhóm/file với nhãn chưa có liên kết. Không trình bày squad giả như dữ liệu thật |
| B06 | [epicService.ts](D:/personal/MyTaiga/src/features/epics/services/epicService.ts:76), [EpicProgressTab.tsx](D:/personal/MyTaiga/src/features/epics/components/EpicProgressTab.tsx:95) — targetSprint, Sprint 1–3, owner `PM`, mục tiêu Q3/2025 | BE7 có `createdBy`, không đồng nghĩa owner nghiệp vụ. Chưa có trường targetSprint/sprintRange/owner. Quan hệ PBI/Task/Sprint có thể giúp thống kê thực tế nhưng không thay được kế hoạch mục tiêu | Giữ nhãn kế hoạch chưa thiết lập. Có thể hiển thị creator bằng tên khác nếu muốn dùng `createdBy` |
| B07 | [backlogService.ts](D:/personal/MyTaiga/src/features/backlog/services/backlogService.ts:78), [PBIDetailDrawer.tsx](D:/personal/MyTaiga/src/features/backlog/components/PBIDetailDrawer.tsx:53), [dashboardService.ts](D:/personal/MyTaiga/src/features/dashboard/services/dashboardService.ts:24) — PBI luôn user_story, creator/assignee chưa có, criteria/comments rỗng | BE7 chưa có itemType, creator/assignee PBI, acceptance criteria hay bình luận riêng cho PBI. Quan hệ Sprint có thể lấy qua BE2, và backlogService đã có bước resolve links. Task DoD cũng chưa có contract riêng | Giữ UI và nêu chính xác trường chưa có. Không dùng bình luận Task làm bình luận PBI nếu chưa có quy tắc |
| B08 | [bugService.ts](D:/personal/MyTaiga/src/features/bugs/services/bugService.ts:211), [BugDetailView.tsx](D:/personal/MyTaiga/src/features/bugs/components/BugDetailView.tsx:166), [CreateBugModal.tsx](D:/personal/MyTaiga/src/features/bugs/components/CreateBugModal.tsx:221) — deadline luôn hôm nay +2 ngày, Sprint 14, attachments demo | BE9 chưa có deadline riêng của Bug hoặc endpoint attachment riêng theo Bug. Có thể lấy Sprint/deadline của Task liên quan, phải ghi rõ là của Task. Upload/bình luận Task đã có. Ghi chú resolution và cấu trúc steps riêng cần đối chiếu yêu cầu lưu nghiệp vụ | Chưa có hạn Bug thì ghi chưa có. File demo cần giữ nhãn chưa upload. Không tạo hạn mới mỗi lần tải |
| B09 | [profileService.ts](D:/personal/MyTaiga/src/features/profile/services/profileService.ts:27), [ProfileCard.tsx](D:/personal/MyTaiga/src/features/profile/components/ProfileCard.tsx:38) — emailVerified=true, timezone GMT+7, language Việt, syncSession chỉ trả giờ hiện tại | BE10 chưa có email verification flag, locale preference hoặc session synchronization history. Date joined có `createdAt`, joinDuration có thể tính FE. Trạng thái active phù hợp getMe chỉ lấy user active, không cùng loại lỗi với emailVerified=true | Chỉ tuyên bố email đã xác thực khi có bằng chứng. Locale hiện là lựa chọn local, cần xác định cơ chế persist |
| B10 | [adminService.ts](D:/personal/MyTaiga/src/features/admin/services/adminService.ts:133) — storage 148.2/500 GB, 3 aging cards, giới hạn 10 file/card, updated 14/10/2024, department Admin cố định | BE6 chưa có storage usage/quota, global aging count, giới hạn file/card và department cấp tài khoản tương ứng. Profile department dự án khác với department toàn công ty. `updatedAt` có ở SystemConfig có thể dùng cho nhãn cập nhật | Giữ thẻ số liệu với ghi chú chưa có nguồn. Không hiển thị quota như số đo hiện tại |
| B11 | [adminService.ts](D:/personal/MyTaiga/src/features/admin/services/adminService.ts:11) — permission matrix cố định và thao tác save/reset chỉ trong memory | BE6 có vai trò hệ thống và quyền của user hiện tại. Chưa có endpoint đọc/ghi ma trận permission toàn hệ thống như editor FE. Không thể lấy quyền một user rồi coi đó là toàn bộ ma trận Admin/Manager/Member | Ma trận cần nhãn tham khảo/local hoặc khóa sửa. BE vẫn kiểm tra quyền thật độc lập |
| B12 | [projectService.ts](D:/personal/MyTaiga/src/features/projects/services/projectService.ts:52), [CreateProjectModal.tsx](D:/personal/MyTaiga/src/features/projects/components/CreateProjectModal.tsx:19) — methodology=scrumban, key PAY/tự sinh, code PRJ-id | BE1 chưa có field key nghiệp vụ hoặc methodology. Mã PRJ-id là mã hiển thị FE, không phải mã nguồn BE. Ngày mặc định 2024/2025 là dữ liệu form FE và có thể được gửi lưu, BE đã hỗ trợ lịch | Giữ key/quy trình với nhãn chưa lưu. Dùng ngày do user chọn thay cho lịch mẫu cũ |
| B13 | [chatService.ts](D:/personal/MyTaiga/src/features/chat/services/chatService.ts:707), [ChatPage.tsx](D:/personal/MyTaiga/src/features/chat/ChatPage.tsx:449) — reaction gắn user Minh Quân, nhãn Sprint 14 Active và trạng thái trực tuyến của kênh | Chưa thấy API reaction và presence theo nhóm gắn với nhãn đó. BE8 có current user, participants và presence của đối tượng chat riêng. Chưa có relation chat group → Sprint | Reaction cần nhãn local. Không gán online/kế hoạch Sprint từ text cố định |

## C. Dữ liệu mẫu còn trong source nhưng cần phân biệt đường chạy

| Dữ liệu | Nơi khai báo / caller | Có xuất hiện trong luồng hiện tại không |
|---|---|---|
| `mockProject`, `mockSprint`, `mockTasks`, `mockActivities` | [dashboard.mock.ts](D:/personal/MyTaiga/src/features/dashboard/mocks/dashboard.mock.ts:8) | Không tìm thấy import sử dụng ngoài file mock. Dashboard hiện gọi dashboardService và API. Không nên tính toàn bộ Dashboard là đang dùng mock |
| `INITIAL_CONVERSATIONS`, `INITIAL_MESSAGES` | [chatService.ts](D:/personal/MyTaiga/src/features/chat/services/chatService.ts:116), `fetchRoomsFromApi` dòng 548 | Nhánh không có projectId còn trộn room thật với mock. Route Chat hiện bắt buộc projectId và lọc theo project. ChatPage khởi tạo list rỗng, nên không thể kết luận mọi room mẫu đang được hiển thị. Message cache vẫn có fallback khi load lỗi |
| `AVAILABLE_CHAT_MEMBERS` và Direct Message modal | [chatService.ts](D:/personal/MyTaiga/src/features/chat/services/chatService.ts:41), [CreateDirectMessageModal.tsx](D:/personal/MyTaiga/src/features/chat/components/CreateDirectMessageModal.tsx:4) | Modal được export nhưng không tìm thấy mount tại ChatPage/router hiện tại. Project channel dùng members API. Nếu bật lại DM modal sẽ gặp danh sách người mẫu |
| `INITIAL_NOTIFICATIONS` | [notificationService.ts](D:/personal/MyTaiga/src/features/notifications/services/notificationService.ts:30), [NotificationsPage.tsx](D:/personal/MyTaiga/src/features/notifications/NotificationsPage.tsx:63) | Có dùng làm state ban đầu, giữ lại nếu fetch lỗi và khôi phục qua nút demo. Fetch API thành công kể cả trả rỗng sẽ thay bằng dữ liệu API. Có thể thoáng hiện mẫu hoặc hiện mẫu khi lỗi |
| `INITIAL_ACTIVITIES` | [notificationService.ts](D:/personal/MyTaiga/src/features/notifications/services/notificationService.ts:379), [ActivityTimelinePage.tsx](D:/personal/MyTaiga/src/features/notifications/components/ActivityTimelinePage.tsx) | Service còn seed, nhưng trang Hoạt động hiện dùng result của fetch có loading/error. Không còn lấy seed làm list khởi tạo hiển thị. KPI thống kê vẫn cố định như A07 |
| `DEFAULT_COLUMNS` Kanban với limit 4/2 | [kanbanService.ts](D:/personal/MyTaiga/src/features/kanban/services/kanbanService.ts:12) | Là fallback/state khởi tạo. Khi board API trả cột thì lấy cấu hình BE. Không nên báo limit trên board luôn hard-code |
| Mảng 2 file ở MemberDetailDrawer | [MemberDetailDrawer.tsx](D:/personal/MyTaiga/src/features/members/components/MemberDetailDrawer.tsx:25) | Chỉ chạy khi `sharedFiles` undefined. Adapter member hiện trả `[]`, nên thông thường hiển thị rỗng thay vì 2 file mẫu |
| Fallback Bugs | [bugService.ts](D:/personal/MyTaiga/src/features/bugs/services/bugService.ts:220) | `this.bugs` khởi tạo rỗng, không có danh sách Bug mẫu mặc định. Khi API lỗi có thể trả cache cũ. Câu log “dùng mock” không chứng minh dữ liệu được trả là mock |

## D. Default form và hằng số giao diện

- CreateProject có key PAY, lịch 15/11/2024–30/04/2025. Đây là default có thể được gửi lên BE, đáng thay bằng rỗng hoặc lựa chọn có chủ đích. Xem B12.
- [CreatePBIModal.tsx](D:/personal/MyTaiga/src/features/backlog/components/CreatePBIModal.tsx:25) điền sẵn tên tính năng 2FA và mô tả. Đây là nội dung form thật có thể được submit, không chỉ placeholder.
- [CreateUserModal.tsx](D:/personal/MyTaiga/src/features/admin/components/CreateUserModal.tsx:11) có danh sách phòng ban mẫu, tên/email mẫu và role mặc định Manager. [adminService.ts](D:/personal/MyTaiga/src/features/admin/services/adminService.ts:267) còn có mật khẩu mặc định dùng chung, request tạo user chỉ gửi thông tin đăng ký. Role/department/activateImmediately trong form chưa được persist theo cùng luồng đó. BE tạo tài khoản USER, đổi role và lock là operation riêng. Không đưa giá trị mật khẩu vào báo cáo.
- AccountLocked, ResetEmailSent và LoggedOut dùng email mẫu khi thiếu tham số. [AccountLockedPage.tsx](D:/personal/MyTaiga/src/features/auth/AccountLockedPage.tsx:9). Danh tính thật có thể truyền từ auth flow. Không nên coi email mẫu là tài khoản đang thao tác.
- AvatarUploadModal có ảnh preset demo nhưng service đã từ chối lưu nếu không có file thật. Khác với upload avatar thật đã nối API.
- Story Point Fibonacci, enum priority/status, map nhãn tiếng Việt, palette mặc định khi chưa có màu, kích thước SVG, tên sản phẩm và copyright là hằng số UI hoặc lựa chọn thiết kế. Không phải tất cả đều cần API. Riêng màu Epic mà BE đã trả thì FE nên ưu tiên dữ liệu nguồn như A13.
- Vài state ban đầu có số mẫu như `ProjectsListPage.counts=4/2/18`, `BugsPage.totalCount=14`. Chúng được fetch ghi đè. Cần kiểm tra loading/error trước khi kết luận user nhìn thấy chúng ở mọi thời điểm.

## Ma trận phạm vi và kiểm chứng

`PARTIAL` nghĩa là đã truy vết source/contract, chưa chạy lại kịch bản trên môi trường thật.

| Route / nhóm | API / field đã đối chiếu | Tình huống | Evidence | Status | Phần còn thiếu |
|---|---|---|---|---|---|
| `/projects` | BE1, members.total, projectName | Counts, danh tính, default form | STATIC + API-source | PARTIAL | Kiểm tra dữ liệu dự án thật và định nghĩa totalMembers |
| `/projects/:id/dashboard` | BE2/BE3/BE7, taskRow/storyRow | Nguồn dữ liệu Dashboard, DoD | STATIC + API-source | PARTIAL | UI/live và contract PBI/DoD còn thiếu |
| `/projects/:id/kanban` | BE2/BE3/BE10 | Banner Sprint, filters, fallback columns | STATIC + API-source | PARTIAL | UI sau khi reload/fetch lỗi |
| `/projects/:id/metrics` và Excel | BE4, averageCycleTimeDays, items, asOfUtc | Null/rỗng, demo mix, báo cáo xuất | STATIC + API-source | PARTIAL | API/live data completeness, giá trị Excel thật |
| `/activity` | BE5, action, userName, createdAt | KPI/filter/log type | STATIC + API-source | PARTIAL | Mapping nghiệp vụ và thống kê theo ngày |
| `/notifications`, chuông | BE5, notification actor/read | Khởi tạo/reset/error | STATIC + API-source | PARTIAL | Runtime trước và sau fetch |
| `/projects/:id/members` | BE1/BE3/BE10 | Online, workload, task/file/team | STATIC + API-source | PARTIAL | Presence và hợp đồng squad/member files |
| `/projects/:id/sprints` | BE2, progress/backlog-items | Capacity/velocity/counts | STATIC + API-source | PARTIAL | Định nghĩa capacity/velocity, runtime |
| `/projects/:id/epics` | BE3/BE7 | SP x3, link Task mẫu | STATIC + API-source | PARTIAL | Kiểm tra UI với dữ liệu thật, chưa gửi thao tác link |
| `/projects/:id/backlog` | BE2/BE7 | Capacity, criteria, màu/creator | STATIC + API-source | PARTIAL | Contract PBI bổ sung |
| `/projects/:id/bugs` | BE1/BE9 | Assignee filter, deadline/Sprint mẫu | STATIC + API-source | PARTIAL | Quy tắc deadline Bug và attachment |
| `/projects/:id/chat` | BE8, room/message/attachment | Mock reachability, file preview | STATIC + API-source | PARTIAL | Runtime stream PDF và nhóm/typing/reactions |
| `/admin/*` | BE6, config keys/permission | Lưu config, matrix và telemetry | STATIC + API-source | PARTIAL | Kiểm tra persist thật, không thực hiện mutation |
| `/profile`, auth standalone | BE10, user profile | Verified/locale/default identity | STATIC + API-source | PARTIAL | Contract user preferences/email verification |
| Browser/API runtime | Toàn bộ nhóm trên | Happy/empty/error/permission/mutation | Chưa chạy | NOT TESTED | Cần môi trường và kịch bản riêng nếu chuyển sang audit runtime |

## Mức ưu tiên và slice đề xuất

1. **Cao** — A14 Task mẫu được chuyển thành ID API, A09 cấu hình hiển thị đã lưu nhưng chỉ persist một khóa, B11 ma trận quyền local, A05 số KPI mẫu thay cho null/rỗng. Tập trung tính đúng dữ liệu và thông báo trạng thái lưu.
2. **Cao** — A15 preview tài liệu giả, A07 thống kê Hoạt động cố định, A12 Story Point nhân 3, A01 số thành viên không đúng nghĩa. Đây là dữ liệu dễ bị dùng cho báo cáo/quyết định.
3. **Trung bình** — Nối banner Sprint/tên dự án/filter actor/assignee, màu Epic và danh sách việc thành viên vào API đã có. Không cần thiết kế thêm schema cho các trường đã có nguồn.
4. **Trung bình** — Xác định contract thật sự thiếu ở B01–B13, đặc biệt capacity, WIP lịch sử, DoD/acceptance criteria, locale, global presence và telemetry. Trong lúc chờ, giữ UI với giá trị rỗng và mô tả thiếu nguồn theo quy tắc dự án.
5. **Thấp** — Dọn mock đã không còn caller, tách nút demo khỏi luồng sử dụng thật, thay default lịch/tên/email mẫu sau khi được yêu cầu triển khai.

## Lưu ý về báo cáo Excel hiện tại

[exportFlowMetrics.ts](D:/personal/MyTaiga/src/features/metrics/services/exportFlowMetrics.ts:22)
đã xuất file `.xlsx` thật và có ghi chú dữ liệu minh họa. Tuy nhiên, nó đọc
`metricsData` từ adapter. Vì A04–A06/B01–B02 còn tồn tại, file tải được không đồng
nghĩa mọi số trong file đều là dữ liệu BE thật hoặc thống kê đầy đủ toàn bộ dự án.
Thông tin này cần được giải quyết ở nguồn dữ liệu trước khi coi Excel là báo cáo
nghiệp vụ chính thức.

## Thao tác đã thực hiện

Đã dùng `git status`, `git log`, `git rev-parse`, `rg` và `Get-Content` để kiểm kê,
lần theo import/caller và đối chiếu source BE. Không chạy build/unit/E2E vì đây là
lượt rà soát source và báo cáo. Các kết quả test ở những nhiệm vụ trước không
được dùng để tuyên bố các mục trong báo cáo này đã qua kiểm thử runtime.
