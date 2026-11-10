# Tích hợp dữ liệu BE và danh sách field/props cần bổ sung

Ngày: 10/11/2026, Asia/Bangkok.

## Phạm vi và kết luận

**PASS trong phạm vi FE đã kiểm thử**: sửa nguồn dữ liệu và mapping ở các mục A01–A19
của [báo cáo hard-data trước](D:/personal/MyTaiga/docs/HARDCODED_DATA_AUDIT_2026-11-10.md),
đồng thời nối Burndown và so sánh SP của Sprint. Kiểm chứng bằng source BE, unit/component test,
Chromium với API giả lập và các lượt đọc BE có xác thực. Phạm vi chưa kiểm thử ghi riêng bên dưới;
PASS này không có nghĩa tất cả tính năng sản phẩm đã có dữ liệu BE.

FE: `D:/personal/MyTaiga`, branch bàn giao `fix/quyenpn-20261110-v2`, tách từ `fix/quyenpn-20261110` tại commit `a07a3aa`.
BE: `D:/personal/be_taiga/BE-MyTaiga`, commit `8fccccb`.
Không sửa code/file BE. Không tạo tài khoản hay dữ liệu nghiệp vụ trong lượt kiểm tra này.
Các tài khoản cũ Admin, user1, user2 đăng nhập được; mật khẩu/token không ghi vào file hoặc báo cáo.
BE có sẵn file untracked `backend/NuGet.Config`; giữ nguyên.

Không phát hiện commit BE mới so với báo cáo hard-data trước. Không đổi endpoint hay contract server.
DTO FE `CycleTimeItem.startedAt/completedAt/cycleTimeDays` được sửa thành nullable để khớp dữ liệu BE.
Endpoint, DTO và HTTP client tiếp tục tập trung trong `src/services/api.ts`.
Không thêm dependency. Giữ bố cục chính; bổ sung bảng Throughput theo ngày trong vùng biểu đồ hiện có.

## Dữ liệu đã nối và cách kiểm chứng

`TEST`: đã chạy test giả lập; `API/RUNTIME`: đã dùng tài khoản thật để đọc BE/chạy trình duyệt.
`STATIC`: đã kiểm tra source; không coi riêng mức này là xác nhận tương tác runtime đầy đủ.
Các URL dưới đây có tiền tố `/api/v1`.

| Mục | Nguồn và field thật | FE sau cập nhật | Bằng chứng / giới hạn |
|---|---|---|---|
| A01 — Card/tổng thành viên dự án | `projects`; `projects/{id}/members: userId, fullName, avatar, projectRole, total` | Đọc đủ trang; hiện Manager, thành viên, ảnh và số lượng thật. Tổng nhân sự là số userId duy nhất qua các dự án được phép đọc; nếu thiếu một danh sách thì tổng là chưa xác định | TEST: nhiều trang, Manager/avatar và đếm người không trùng |
| A02 — Ngữ cảnh Kanban/Task | `projects/{id}.projectName`; `sprints: sprintName/startDate/endDate/sprintGoal/status`; `task.sprintId` | Banner tên dự án, Sprint active và mục tiêu/lịch thật; board ghi rõ tất cả Task. Drawer lấy tên đúng Sprint của Task | TEST trình duyệt cho banner; drawer được đối chiếu STATIC, chưa có ca live riêng cho từng Sprint |
| A03 — Filter người làm | `members.userId/fullName`; user hiện tại từ AuthContext; `bugs?assigneeId` | Kanban lọc theo ID, “Chỉ thẻ của tôi” theo user đăng nhập. Bugs gửi ID thật; “Chưa gán” được lọc sau khi đọc đủ trang | TEST component/service và Chromium |
| A04 — Throughput | `throughput.totalDoneTasks/points/historyTrackingStartedAtUtc/importedBaselineCount/hasPartialHistoricalCoverage`; `throughput/sprints.items[]` | KPI, bảng ngày, so sánh Sprint và cảnh báo lịch sử chưa đủ dùng dữ liệu thật; không hiện efficiency/SP mẫu trong chart này | TEST; đối chiếu API/RUNTIME ở lượt live |
| A05 — Null/rỗng và phân trang metrics | WIP; Cycle Time average/list; Work Item Age list; Task và members | Giữ null thành “--”, list rỗng thành rỗng; tính trung bình/max/đếm cảnh báo trên đủ trang tuổi việc. Người làm/priority lấy từ dữ liệu dự án và Task. Không thay null bằng 3.2 hoặc tuổi việc mẫu | TEST null, empty, invalid timestamps, nhiều trang, assignee và priority |
| A06 — Bộ lọc/thời điểm metrics | `throughput?from&to&sprintId`, `throughput/sprints?from&to`, `asOfUtc` | Khoảng 7/14/30 ngày UTC thực sự gửi lên BE; hiện thời điểm server trả. Khoảng ngày chỉ áp dụng Throughput vì các endpoint khác chưa nhận from/to. Lọc Epic chưa hỗ trợ được đánh dấu không khả dụng | TEST request và Chromium |
| A07 — Thống kê Hoạt động | Các log sau lọc ngày/người/hành động/tìm kiếm | Tổng sự kiện, số lần chuyển DONE, số Bug tạo được tính từ list đang lọc. Số vi phạm WIP là “—” khi không có nguồn xác nhận; không coi sửa limit là vi phạm | TEST mapping và tổng hợp; không có endpoint thống kê WIP violations |
| A08 — Action/actor Hoạt động | `action, entityType, userId, userName, createdAt, description, changes` | Phân biệt TASK_MOVED→DONE, BUG_CREATED, COMMENT_*, WIP_* và hoạt động khác; actor options sinh từ log thật; đọc đủ trang cả khi chưa lọc ngày | TEST adapter và Chromium lọc ngày gồm hai mốc địa phương |
| A09 — Cấu hình Admin | `MAX_FILE_SIZE_MB, DEADLINE_WARNING_HOURS, MAX_FAILED_LOGIN, JWT_EXPIRE_MINUTES, updatedAt` | Load và lưu đúng bốn khóa. Phút JWT tùy chỉnh được giữ nguyên; mô tả đúng tuổi thọ JWT. Load lỗi không cho lưu mặc định. Field không có API không được báo là đã persist | TEST mapping/request/failure; API/RUNTIME đối chiếu input với cấu hình đã lưu; không ghi cấu hình toàn hệ thống trong live |
| A10 — Lịch sử cấu hình | `admin/activity-logs`, action SYSTEM_CONFIG_UPDATED, actor/time/description/changes | Popup đọc log thật đủ trang, có loading/empty/error; chỉ hiển thị delta nếu response có | TEST Chromium với fixture; route Admin đã chạy live, chưa có assertion từng bản ghi live |
| A11 — Công việc thành viên | `projects/{id}/tasks?assigneeId` | Drawer tải đủ việc được gán trong dự án, có loading/error; không gắn nhãn cố định Sprint 14 | TEST; API/RUNTIME đối chiếu ID và số việc. Tương tác mở drawer cụ thể chưa có test live riêng |
| A12 — SP Epic | PBI `epicId/storyPoint/status`, Epic progress và Task `epicId/status` | Tổng SP và SP hoàn thành cộng đúng estimate từng PBI, kể cả 0; breakdown dùng PBI/Task thật; bỏ công thức “số PBI × 3” | TEST và API/RUNTIME |
| A13 — Epic/Sprint trong Backlog | `Epic.color`, PBI theo Epic, Sprint progress `totalStoryPoints/totalPbis` | Màu Epic và số PBI đúng; SP/số PBI của Sprint lấy từ progress; detail PBI cũng resolve tên/màu Epic | TEST service; detail PBI màu được kiểm tra STATIC |
| A14 — Liên kết Task vào Epic | Task list của dự án và API link Task hiện có | Modal chọn Task thật, bỏ Task đã thuộc Epic đang mở; từ chối ID mẫu dạng task-301 trước API. Filter quan hệ Task–PBI được đánh dấu chưa có contract | TEST render/chọn/submit ID thật và chặn ID mẫu; không chạy mutation link live |
| A15 — Preview tệp Chat | Metadata attachment; authenticated preview/download endpoint | Ảnh dùng URL thật; PDF dùng blob/iframe, TXT dùng nội dung thật; thu hồi object URL. Bỏ báo cáo K6 cố định, giờ/revision/người xem mẫu trong preview. Download URL tương đối đi qua API có xác thực | TEST ảnh, TXT, PDF và object URL; chưa xác minh preview PDF/TXT Cloudinary trên một tệp live cụ thể |
| A16 — Tìm chat | `chat/rooms/{id}/messages?keyword&before&limit` | Tìm trên server và theo cursor thay vì chỉ cache; debounce, bỏ kết quả cũ, loading/error. Từ khóa có ký tự regex vẫn an toàn | TEST paging và Chromium với ký tự “[”; chưa có assertion tìm tin nhắn live cụ thể |
| A17 — Danh tính Admin | AuthContext/user từ BE | Header và popup tự khóa dùng tên đăng nhập thật | TEST Header; các route Admin đăng nhập live thành công |
| A18 — Filter thông báo | `notifications.createdAt/isRead` và toàn bộ trang | Khoảng 7/14/30 ngày lọc thật; unread count trên đủ list. Không seed thông báo mẫu lúc tải. Project filter giữ khung nhưng khóa vì response chưa có projectId | TEST lọc thời gian/phân trang; route live smoke |
| A19 — Tên dự án | Project context, `projects/{id}.projectName` | Backlog, Bugs, Members, Metrics, Activity/Notifications và modal xác nhận dùng ngữ cảnh thật. Hoạt động chưa chọn dự án yêu cầu chọn, không mặc định ID 1 | TEST Chromium context và không phát request khi chưa chọn; một số modal mới đối chiếu STATIC |
| Bổ sung — Chi tiết Sprint | Sprint progress, `sprints/{id}/burndown` và progress các Sprint | Nối chart đang bỏ trống vào endpoint Burndown; giữ actualRemaining=null thành chưa có điểm đo, mốc hôm nay theo ngày UTC. Tab so sánh dùng SP hoàn thành/tổng SP thật; các KPI không có nguồn hiển thị “—” | TEST service/component; API/RUNTIME so sánh Burndown. Chưa có test live thao tác từng điểm trên SVG |
| Bổ sung — Phân trang board | `board.columns[].hasMore/tasks` | Đọc tiếp từng trang đến hết cột, tránh lọc/đếm trên riêng trang đầu | TEST hai trang; live kiểm tra hiển thị board, chưa stress test hàng nghìn thẻ |

Excel vẫn xuất `.xlsx` và bổ sung hai sheet Throughput ngày / Throughput Sprint.
WIP lịch sử chưa có nguồn nên sheet lịch sử API không được điền chuỗi mẫu.
Sheet tổng quan ghi chú nguồn/ngưỡng; null không được đổi thành số mẫu.
Test trình duyệt đã tải được workbook thật; chưa có ca live xuất Excel đối chiếu từng cell.

## Data/props còn cần bổ sung

Các tên field dưới đây là **đề xuất để trao đổi contract**, chưa phải endpoint/DTO đã được BE cam kết.
Theo yêu cầu hiện tại, chưa triển khai thêm tính năng phụ thuộc các dữ liệu này.
UI của phần chưa có dữ liệu được giữ; một số mock/local cũ nêu ở cột cuối vẫn được bỏ qua trong đợt tích hợp.

| Phần cần dữ liệu | BE hiện thiếu contract gì | Field/props gợi ý và kiểu dữ liệu | Vị trí FE cần nhận / trạng thái hiện tại |
|---|---|---|---|
| Lịch sử WIP | Endpoint hiện chỉ trả WIP tại thời điểm đọc | `history: {date: string, wip: number}[]`, phạm vi thời gian, timezone, coverage | `FlowMetricsData.wipRunData` → WipRunChart; API mode hiện để rỗng, có mô tả thiếu dữ liệu |
| Thời gian theo trạng thái, efficiency | Chưa có thời gian thực hiện/chờ/review cho từng Task và công thức efficiency | `durationsByStatus: Record<string, number|null>`, `activeTimeDays/waitTimeDays/flowEfficiencyPercent: number|null` | WorkItemAgeChart/ThroughputChart/SprintBurndownTab; hiện chỉ biểu diễn tổng tuổi việc; các đoạn riêng chưa có |
| Mục tiêu/SLA/ngưỡng chung | WIP từng cột đã có; chưa có cùng định nghĩa ngưỡng tổng Flow Metrics, tuổi việc và Cycle Time | `wipTargetMax/cycleTimeTargetDays/ageWarningDays` cùng source/scope | ConfigAlertModal, MetricService, SystemSettings; ngưỡng FE vẫn local, không coi là cấu hình BE |
| Số vi phạm WIP | Sửa WIP limit có log, nhưng chưa có contract đầy đủ cho các lần vi phạm/bị từ chối | Event vi phạm có thời điểm/cột/currentCount/limit; hoặc `wipViolationCount: number|null` theo khoảng ngày | `getActivityStats().wipViolations`; chưa có nguồn thì “—” |
| Năng lực Sprint | Sprint không có capacity kế hoạch | `capacityStoryPoints: number|null` | `Sprint.capacitySP`, `SprintSummary.capacity`, form tạo/sửa, capacity sidebar; capacity 25 cũ chưa được coi là dữ liệu BE |
| Dự báo/velocity | Có SP hoàn thành của Sprint, nhưng chưa chốt cửa sổ/công thức forecast và ngày làm việc | Nếu cần BE tổng hợp: `velocitySp/windowSprintIds/workingDays/forecastEndDate`; hoặc FE tính sau khi thống nhất công thức | Backlog metrics và form Sprint còn giá trị demo như 24/28.4 ở phần chưa có định nghĩa; không dùng làm dự báo chính thức. So sánh SP thực tế đã nối riêng |
| Hồ sơ nhân sự, presence, workload phòng ban | Account status active không phải online; chưa có mã HR/chức danh và capacity/workload | `employeeCode/jobTitle`, `presence: online|offline|unknown`, `lastSeenAt`, workload/capacity có đơn vị | Member/Department/MemberDetailDrawer. Mã EMP-id, roleTitle, online theo status và workload mẫu của phần cũ chưa được hoàn thiện trong đợt này |
| Squad và file theo thành viên | Chưa có mapping member→squad, cũng chưa có danh sách tệp của member trong dự án | `squads[]: {id,name,createdAt,createdBy}`; file index theo projectId/userId | MemberDetailDrawer squad/sharedFiles; không dùng Task attachments để giả làm toàn bộ file của member |
| Kế hoạch/owner Epic | createdBy không đồng nghĩa owner; chưa có targetSprint/sprintRange kế hoạch | `ownerId/owner: PersonSummary|null`, `targetSprintId/plannedStartSprintId/plannedEndSprintId` | Epic/EpicProgressTab; các field kế hoạch được ghi chưa có dữ liệu |
| Loại/người tạo/tiêu chí PBI và Task DoD | PBI chưa có itemType, creator/assignee, criteria, comments riêng; Task chưa có contract DoD | `itemType`, `createdBy/assigneeId`, `acceptanceCriteria[]`, `definitionOfDone[]`, API bình luận đúng entity | PBI detail, dashboard và Task detail; hiện giữ default/placeholder, không đổi bình luận Task thành PBI comment |
| Deadline/attachment/comment riêng của Bug | Bug có Task liên quan và detail trả tài nguyên Task; không có deadline/file/comment độc lập như UI kỳ vọng | `Bug.deadline: string|null`; tài nguyên có `entityType/entityId` hoặc endpoint Bug riêng | BugItem/BugDetailView/CreateBugModal. Sprint lấy theo Task thật; deadline Bug mẫu còn thuộc phần bỏ qua, không phải hạn được BE xác nhận. Tệp/bình luận đang có là của Task |
| Định danh/quy trình dự án | BE không có key nghiệp vụ/methodology | `projectKey: string|null`, `methodology: enum|null` | Project/CreateProjectModal; PRJ-id và key suy ra là mã hiển thị FE, không phải field đã lưu BE |
| Profile: xác minh email, locale | Chưa có emailVerified, locale/timezone cùng cập nhật tương ứng | `emailVerified:boolean|null`, `locale/timeZone:string|null` | Profile/ProfileSettings; giữ phần hiện có, chưa tích hợp giả |
| Telemetry và policy Admin còn lại | Không có storage used/quota, aging tổng, max files/card theo cùng model UI | `storageUsedBytes/quotaBytes/agingCount`, `maxAttachmentsPerCard/workAgeThresholdDays` kèm scope | SystemSettings; chỉ bốn khóa đã nêu được persist. Các thống kê chưa có nguồn và control chưa hỗ trợ được ghi chú/khóa |
| Ma trận quyền toàn hệ thống | `me/permissions` chỉ mô tả user hiện tại; chưa có API đọc/ghi editor ma trận | `permissionGroups/roleAssignments/version` và contract cập nhật/kiểm soát đồng thời | Admin permission editor vẫn là phần local/tham khảo; không dùng quyền của một user làm toàn bộ ma trận |
| Filter dự án cho thông báo | Response Notification chưa có projectId đủ rõ để lọc | `projectId:number|null`, tùy nhu cầu `projectName` và query tương ứng | NotificationItem/NotificationFilterOptions; project filter đang khóa. Không suy dự án từ mã Task |
| Nhật ký: retention và snapshot | Chưa có policy giữ 180 ngày; changes chỉ có nếu log thực sự ghi được delta | `retentionDays:number|null`; delta có kiểu/field chuẩn và actor/entity metadata | Activity và Admin audit; không hiện retention 180 ngày như cam kết. `changes` thiếu thì chỉ hiện description thật |
| Chat: reaction/presence nhóm, lịch Sprint | Chưa có reaction API và quan hệ group→Sprint/presence nhóm như nhãn UI | `reactions[]/reactedBy`, `participants[].presence`, `sprintId:number|null` | ChatMessage/Conversation/ChatPage; các reaction/nhãn nhóm demo còn lại ngoài phần tích hợp này |
| Lịch sử/lượt xem tệp | Attachment chưa có revision history/viewers | `revision:number|null`, `versions[]`, `viewers[]/viewCount` theo policy | ChatAttachment/AttachmentPreviewModal; metadata không có nguồn được bỏ giá trị mẫu trong preview |
| Filter Epic trong metrics | Endpoint hiện không nhận Epic trong cùng bộ lọc | `epicId?:number` cho các endpoint được thống nhất, cùng quy tắc kết hợp sprint/date | FlowMetricsPage; chưa bật các Epic option mẫu |

Không phải mọi giá trị rỗng đều là BE thiếu schema:
- Cycle Time null khi Task thiếu mốc thời gian hợp lệ là trạng thái BE đã hỗ trợ; FE cần hiện chưa có dữ liệu.
- Throughput có `hasPartialHistoricalCoverage/historyComplete`; trường hợp này cần bổ sung lịch sử hoặc baseline dữ liệu, không giả lập thêm điểm đo.
- Velocity có thể tổng hợp từ tiến độ Sprint đã có. Điểm còn thiếu là định nghĩa kỳ tính/dự báo; không bắt buộc phải tạo field BE mới.
- `MAX_COMMENT_LENGTH`, `DEFAULT_SPRINT_WEEKS` và các khóa whitelist khác đã có BE nhưng chưa có input tương ứng trong layout hiện tại; đây là mở rộng UI sau này, không báo là BE thiếu.
- Tên, màu, SP, số lượng thành viên, danh sách Task không nằm trong bảng “BE thiếu” nữa khi endpoint tương ứng đọc thành công.

## Kiểm thử và mức bao phủ

Các kiểm thử giả lập chặn mạng ngoài và dùng fixture theo contract source.
Chromium mock không chứng minh dữ liệu database thật.
Các kiểm tra live dùng tài khoản cũ, chỉ login/logout và GET; không chạy các suite live có CRUD hoặc ghi cấu hình.

| Lệnh / kịch bản | Kết quả |
|---|---|
| `npm test -- --reporter=dot` | PASS — 248/248 test, 27 file |
| `npm run test:e2e` | PASS — 72/72 test Chromium, API giả lập |
| `npm run build` | PASS — TypeScript và Vite production build |
| `npm run lint` | Exit 0; còn warning về lifecycle/hooks và vài warning sẵn có trong repo; không tuyên bố lint sạch cảnh báo |
| `git -c core.safecrlf=false diff --check` | PASS |
| Live đăng nhập Admin/user1/user2 và route đọc theo vai trò | PASS — cả ba tài khoản đăng nhập, đọc route và kiểm tra quyền |
| Live đối chiếu Flow Metrics/Epic/Member/Sprint/config | PASS — cả ba ca đối chiếu dữ liệu thật |
| `npx playwright test -c playwright.live.config.ts tests/live/authenticated.spec.ts tests/live/backend-data-integration.spec.ts` (password qua biến môi trường tạm) | PASS — 6/6 ca, 34.7 giây |

Regression mới: 23 ca unit/component so với nền 225, 5 ca Chromium mock,
và 3 ca live đối chiếu dữ liệu. Cập nhật fixture của các test cũ cho những request mới.
Bộ lọc ngày cũ được bổ sung active project rõ ràng; thêm test không mặc định project ID 1.

Những phần còn PARTIAL/NOT TESTED:
- Live save system config, link Task/Epic: không chạy để tránh đổi dữ liệu đang dùng; request, lỗi và lựa chọn ID đã có test giả lập.
- Live preview PDF/TXT và tải file Cloudinary cụ thể: chưa có ca file thực tế cho đợt này; unit đã xác nhận render blob/TXT và thu hồi URL.
- Tương tác sâu drawer Task/Member, từng bản ghi audit live, export Excel từng cell live: chưa có test live riêng.
- Chưa kiểm thử khối lượng dữ liệu lớn, thay đổi đồng thời trong lúc đọc nhiều trang, hoặc pixel comparison Figma.

## Vấn đề còn lại và bước tiếp theo

Các mục thiếu dữ liệu ở bảng trên được bỏ qua theo yêu cầu, không dùng lần kiểm tra này
để tuyên bố toàn bộ mock trong ứng dụng đã được thay thế. Các form có nội dung demo,
ma trận quyền local, capacity/velocity chưa có định nghĩa, squad/presence và telemetry
cũ vẫn cần một slice riêng khi có contract hoặc quyết định nghiệp vụ.

Các danh sách tổng hợp hiện đọc đủ trang tại FE. Với nhiều dự án/thành viên/Task, BE có thể
bổ sung endpoint summary/batch để giảm số request; không thay số tổng đúng bằng trang đầu để tối ưu.
Cần xác định thứ tự ưu tiên field ở bảng thiếu, chốt semantics owner/velocity/SLA,
sau đó cập nhật DTO tập trung và props tương ứng. Không cần thay layout chính.

## File tạo/sửa

Danh sách dưới đây chỉ thuộc FE và kiểm thử/tài liệu của đợt tích hợp.

- [docs/DECISIONS.md](D:/personal/MyTaiga/docs/DECISIONS.md)
- [src/components/layout/Header.tsx](D:/personal/MyTaiga/src/components/layout/Header.tsx)
- [src/features/admin/components/SelfLockErrorModal.tsx](D:/personal/MyTaiga/src/features/admin/components/SelfLockErrorModal.tsx)
- [src/features/admin/components/SystemSettingsTab.tsx](D:/personal/MyTaiga/src/features/admin/components/SystemSettingsTab.tsx)
- [src/features/admin/services/adminService.ts](D:/personal/MyTaiga/src/features/admin/services/adminService.ts)
- [src/features/backlog/BacklogPage.tsx](D:/personal/MyTaiga/src/features/backlog/BacklogPage.tsx)
- [src/features/backlog/services/backlogService.ts](D:/personal/MyTaiga/src/features/backlog/services/backlogService.ts)
- [src/features/bugs/BugsPage.tsx](D:/personal/MyTaiga/src/features/bugs/BugsPage.tsx)
- [src/features/bugs/components/BugDetailView.tsx](D:/personal/MyTaiga/src/features/bugs/components/BugDetailView.tsx)
- [src/features/bugs/components/DeleteBugModal.tsx](D:/personal/MyTaiga/src/features/bugs/components/DeleteBugModal.tsx)
- [src/features/bugs/services/bugService.ts](D:/personal/MyTaiga/src/features/bugs/services/bugService.ts)
- [src/features/chat/components/AttachmentPreviewModal.tsx](D:/personal/MyTaiga/src/features/chat/components/AttachmentPreviewModal.tsx)
- [src/features/chat/components/ChatSearchDrawer.tsx](D:/personal/MyTaiga/src/features/chat/components/ChatSearchDrawer.tsx)
- [src/features/chat/services/chatService.ts](D:/personal/MyTaiga/src/features/chat/services/chatService.ts)
- [src/features/epics/components/EpicProgressTab.tsx](D:/personal/MyTaiga/src/features/epics/components/EpicProgressTab.tsx)
- [src/features/epics/components/LinkTaskModal.tsx](D:/personal/MyTaiga/src/features/epics/components/LinkTaskModal.tsx)
- [src/features/epics/services/epicService.ts](D:/personal/MyTaiga/src/features/epics/services/epicService.ts)
- [src/features/kanban/KanbanPage.tsx](D:/personal/MyTaiga/src/features/kanban/KanbanPage.tsx)
- [src/features/kanban/components/TaskDetailDrawer.tsx](D:/personal/MyTaiga/src/features/kanban/components/TaskDetailDrawer.tsx)
- [src/features/kanban/services/kanbanService.ts](D:/personal/MyTaiga/src/features/kanban/services/kanbanService.ts)
- [src/features/kanban/types.ts](D:/personal/MyTaiga/src/features/kanban/types.ts)
- [src/features/members/MembersPage.tsx](D:/personal/MyTaiga/src/features/members/MembersPage.tsx)
- [src/features/members/components/MemberDetailDrawer.tsx](D:/personal/MyTaiga/src/features/members/components/MemberDetailDrawer.tsx)
- [src/features/members/components/RemoveMemberModal.tsx](D:/personal/MyTaiga/src/features/members/components/RemoveMemberModal.tsx)
- [src/features/members/services/memberService.ts](D:/personal/MyTaiga/src/features/members/services/memberService.ts)
- [src/features/metrics/FlowMetricsPage.tsx](D:/personal/MyTaiga/src/features/metrics/FlowMetricsPage.tsx)
- [src/features/metrics/components/CycleTimeScatterplot.tsx](D:/personal/MyTaiga/src/features/metrics/components/CycleTimeScatterplot.tsx)
- [src/features/metrics/components/ThroughputChart.tsx](D:/personal/MyTaiga/src/features/metrics/components/ThroughputChart.tsx)
- [src/features/metrics/components/WipRunChart.tsx](D:/personal/MyTaiga/src/features/metrics/components/WipRunChart.tsx)
- [src/features/metrics/components/WorkItemAgeChart.tsx](D:/personal/MyTaiga/src/features/metrics/components/WorkItemAgeChart.tsx)
- [src/features/metrics/services/exportFlowMetrics.ts](D:/personal/MyTaiga/src/features/metrics/services/exportFlowMetrics.ts)
- [src/features/metrics/services/metricService.ts](D:/personal/MyTaiga/src/features/metrics/services/metricService.ts)
- [src/features/metrics/types.ts](D:/personal/MyTaiga/src/features/metrics/types.ts)
- [src/features/notifications/NotificationsPage.tsx](D:/personal/MyTaiga/src/features/notifications/NotificationsPage.tsx)
- [src/features/notifications/components/ActivityTimelinePage.tsx](D:/personal/MyTaiga/src/features/notifications/components/ActivityTimelinePage.tsx)
- [src/features/notifications/services/notificationService.ts](D:/personal/MyTaiga/src/features/notifications/services/notificationService.ts)
- [src/features/notifications/types.ts](D:/personal/MyTaiga/src/features/notifications/types.ts)
- [src/features/projects/ProjectLayout.tsx](D:/personal/MyTaiga/src/features/projects/ProjectLayout.tsx)
- [src/features/projects/ProjectsListPage.tsx](D:/personal/MyTaiga/src/features/projects/ProjectsListPage.tsx)
- [src/features/projects/services/projectService.ts](D:/personal/MyTaiga/src/features/projects/services/projectService.ts)
- [src/features/projects/types.ts](D:/personal/MyTaiga/src/features/projects/types.ts)
- [src/features/sprints/components/SprintBurndownTab.tsx](D:/personal/MyTaiga/src/features/sprints/components/SprintBurndownTab.tsx)
- [src/features/sprints/services/sprintService.ts](D:/personal/MyTaiga/src/features/sprints/services/sprintService.ts)
- [src/features/sprints/types.ts](D:/personal/MyTaiga/src/features/sprints/types.ts)
- [src/services/api.ts](D:/personal/MyTaiga/src/services/api.ts)
- [tests/admin-config.test.ts](D:/personal/MyTaiga/tests/admin-config.test.ts)
- [tests/e2e/date-filters.spec.ts](D:/personal/MyTaiga/tests/e2e/date-filters.spec.ts)
- [tests/feature-adapters.test.ts](D:/personal/MyTaiga/tests/feature-adapters.test.ts)
- [tests/header-create.test.tsx](D:/personal/MyTaiga/tests/header-create.test.tsx)
- [tests/settings.test.tsx](D:/personal/MyTaiga/tests/settings.test.tsx)
- [src/features/projects/projectContext.ts](D:/personal/MyTaiga/src/features/projects/projectContext.ts)
- [src/features/projects/useProjectMembers.ts](D:/personal/MyTaiga/src/features/projects/useProjectMembers.ts)
- [src/features/projects/useProjectName.ts](D:/personal/MyTaiga/src/features/projects/useProjectName.ts)
- [src/lib/allPages.ts](D:/personal/MyTaiga/src/lib/allPages.ts)
- [tests/backend-data-integration.test.tsx](D:/personal/MyTaiga/tests/backend-data-integration.test.tsx)
- [tests/e2e/backend-data-integration.spec.ts](D:/personal/MyTaiga/tests/e2e/backend-data-integration.spec.ts)
- [tests/live/backend-data-integration.spec.ts](D:/personal/MyTaiga/tests/live/backend-data-integration.spec.ts)
- [docs/BACKEND_DATA_INTEGRATION_2026-11-10.md](D:/personal/MyTaiga/docs/BACKEND_DATA_INTEGRATION_2026-11-10.md)
