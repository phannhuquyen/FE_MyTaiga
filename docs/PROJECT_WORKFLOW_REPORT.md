# Project So 1 — tích hợp và xác minh FE, 29/10/2026

**PASS trong phạm vi các luồng create/update/read/chia sẻ đã chạy.** Đã thao tác form FE và xác minh bằng API thật cùng phiên user2 độc lập. Đây không phải chứng nhận toàn bộ chức năng/field của ứng dụng đã hoàn tất QA.

## Phạm vi và nguồn dữ liệu

- FE branch `fix/quyenpn-20261027`, HEAD `d63efed` và working tree có sẵn. BE HEAD `8fccccb`; FE5173, API5141. Giữ branch, không commit/push/reset/stash hoặc sửa Backend, schema, migration, secrets hay môi trường.
- Trước sửa đã đọc AGENTS.md, skill audit, code/DTO/controller, báo cáo cũ và Git status. Yêu cầu hiện tại cho phép tích hợp FE và kiểm chứng ghi dữ liệu trong Project So 1.
- API thật xác minh project1 có tên **Project So 1**, ACTIVE, user1 MANAGER; user2 đã là MEMBER. Không cần thêm user2 hoặc thay role.
- Chỉ tạo/sửa record QA mới có tiền tố `QA-FE-`; không sửa/xóa công việc có sẵn. Đọc lại từ BE bằng context user2 độc lập để chứng minh persistence/chia sẻ; không tuyên bố đã chạy SQL trực tiếp.

## Nguyên nhân và thay đổi

| Phát hiện | Bằng chứng | FE đã xử lý |
|---|---|---|
| Tổng quan tạo công việc vào RAM, mọi tài khoản thấy dữ liệu mock riêng | STATIC + regression trước sửa FAIL | Bỏ nguồn mock runtime ở hook/service Dashboard; dùng project/tasks/PBI/bugs/sprints/activity/members/epics API thật |
| Nút Tạo trên header không mở form của năm feature | Chromium mock tái hiện FAIL; Header callback bản thân hoạt động, thiếu listener ở feature | Hook useQuickCreate dùng chung cho Backlog/Sprint/Epic/Kanban/Bugs; cleanup khi đổi trang |
| Sprint bị khóa bởi overlap giả với Sprint14/2024 và so sánh chuỗi ngày | STATIC + regression FAIL | Input ISO date, kiểm tra thứ tự ngày; BE quyết định overlap thật. Goal optional đúng contract; capacity chưa có field BE được ghi rõ |
| Kanban deadline demo sai định dạng; assignee/cột chọn chưa gửi đúng API | STATIC + unit + live | Date input; userId từ thành viên thật; create và board.move thật. Lỗi chuyển cột sau create ghi rõ Task đã lưu, không báo thành công giả |
| Bug gửi task-241 mẫu hoặc fallback Task1 | STATIC + regression | Chọn Task thật thuộc project; chặn ID mẫu; không tự tạo Task/Epic hoặc lấy record khác làm mặc định |
| Gán Bug dùng member mẫu và trả cache cũ, có thể báo lỗi sau khi BE đã nhận | Regression uncached Bug FAIL trước sửa; live PATCH200/user2 UI | Picker từ projectMembers; strict numeric IDs; trả và render DTO BE đã lưu, không phụ thuộc cache trang danh sách |
| Lỗi tạo Backlog bị catch bỏ qua | Regression trước sửa FAIL | Giữ form và hiển thị lỗi; Epic prerequisite rõ. Sprint chọn khi tạo được gửi bằng API liên kết |
| Backlog có Sprint ID giả sprint-active, thay Sprint chưa gọi đúng endpoint | STATIC + live planning | Resolve ID thật từ sprint progress; update liên kết qua API; user2 đọc cùng PBI/Sprint |
| Đổi tên Task có thể xóa description do Board card thiếu trường đó | Regression bảo toàn description | GET chi tiết khi cần trước PUT; mở drawer bằng detail API, giữ description cũ khi chỉ sửa title |
| Panel Tổng quan/comments/history dùng mẫu | STATIC + live POST/GET + user2 UI | Detail theo ID thật, comment Task qua API, Activity từ project log. Các field BE chưa có hiển thị placeholder, không giả DoD/giờ ước lượng/tác giả |

Epic create đã có API từ trước; browser hiện tại xác minh create/update thành công. Không quy kết Epic API bị lỗi chỉ từ triệu chứng người dùng báo. Việc thiếu handler nút header áp dụng cả trang Epic.

## API được nối vào UI

Mọi URL/DTO/client tiếp tục tập trung trong `src/services/api.ts`, không thêm axios instance hoặc endpoint BE mới.

| Chức năng | API chính | Điều kiện / dữ liệu |
|---|---|---|
| Epic | POST projects/{id}/epics; GET/PUT epics/{id} | Title/description/color/priority/status; project thật |
| Story / Backlog | GET/POST product-backlog-items; GET/PUT product-backlog-items/{id} | epicId thật bắt buộc; title, storyPoint, priority, status |
| Sprint | GET/POST sprints; GET/PUT sprints/{id}; GET progress | projectId, sprintName, optional goal, ISO start/end |
| Planning | POST sprints/{id}/backlog-items | pbiIds thật; đọc progress để xác minh liên kết |
| Kanban | GET projects/{id}/board; POST projects/{id}/tasks; GET/PUT tasks/{id}; task assignee/deadline và board move | Thành viên thật, deadline chuẩn, status/cột persist |
| Bug | GET projects/{id}/bugs; POST bugs; GET bugs/{id}; PATCH status/assignee | taskId thật; nội dung/severity/priority; role theo BE |
| Tổng quan | Các list trên + projects.get, members, epics | Danh sách toàn dự án gồm Task/PBI/Bug, không chỉ công việc giao user hiện tại |
| Comment / lịch sử | GET/POST tasks/{id}/comments; GET projects/{id}/activity-logs | Bug dùng comment của Task liên quan; PBI chưa có comment API riêng |

BE có một Board theo dự án, chưa có contract tạo thêm Board độc lập. “Tạo” ở tab Kanban tạo **thẻ Task**. Chỉ số trên header là tỷ lệ hoàn tất Task/PBI/Bug đang thống kê, không tự coi là KPI tiến độ nghiệp vụ do BE cấp.

## Kết quả thực chạy

| Lớp | Tổng | PASS | FAIL |
|---|---:|---:|---:|
| Vitest / RTL / transport | 214 | 214 | 0 |
| Chromium mock | 55 | 55 | 0 |
| Live UI/BE, kết quả mới nhất mỗi scenario | 12 nhóm | 12 | 0 |

12 nhóm live:

1. Header → tạo Epic → GET read-back.
2. Header → tạo Backlog với Epic thật → GET read-back.
3. Header → tạo Sprint với ngày hợp lệ → GET read-back.
4. Header → tạo Task Kanban, giao user2 → GET assigneeId.
5. Header → tạo Bug với Task QA thật → GET read-back.
6. Tổng quan → tạo Task, Story, Bug → row tương ứng còn sau reload.
7. Đổi title Task trên FE → user2 API/UI thấy title mới, summary/detail/history.
8. Sửa Epic, description Backlog, tên Sprint, trạng thái Bug bằng UI → user2 đọc giá trị mới qua API.
9. Bình luận Task ở Tổng quan → user2 mở Tổng quan thấy nội dung.
10. Planning thêm PBI → Backlog có đúng Sprint ID → user2 đọc sprint progress.
11. Tạo Task chọn cột IN_PROGRESS và hạn cụ thể → GET/reload Board giữ cột và deadline.
12. Gán Bug cho user2 bằng picker thật → API và UI user2 hiển thị người xử lý mới.

Lượt live đầy đủ cuối có9 PASS/1 lỗi locator vì Planning dùng card div, test ban đầu tìm table row. Đã sửa locator theo PBI ID, giữ nguyên assertion POST200/GET liên kết; focused planning PASS. Hai ca column/deadline và Bug assignment chạy riêng đều PASS. Gộp **latest theo tên scenario**, không cộng failed attempts để tăng coverage và không gọi một raw run10/10 nếu chưa có.

Các lượt phát triển khác có matcher API sai `/product-backlog` thay vì `/product-backlog-items`, mất state giữa worker sau failure, navigation interruption khi ghi checkpoint vào watched tree và click header trước feature mount. Đã chuyển checkpoint sang node_modules/.tmp, đồng bộ page readiness, sửa harness; không quy kết các lỗi này thành BE defect. Không bỏ assertion/skip test để làm xanh suite.

- `npm test -- --reporter=json --outputFile=test-results/project-workflow-unit.json`:214 PASS.
- `npm run test:e2e`:55 PASS; gồm5 regression header-create theo feature.
- `npx playwright test -c playwright.live.config.ts tests/live/project-workflows.spec.ts` và các focused scenarios:12 nhóm latest PASS như trên.
- `npm run build`:PASS, TypeScript + Vite.
- `npm run lint`:exit0; còn cảnh báo hooks và script lint đã liệt kê trong log, không tuyên bố zero-warning.
- `git diff --check`:exit0 sau chuẩn hóa EOF ở các file sửa.

Machine results: [PROJECT_WORKFLOW_TEST_RESULTS.json](PROJECT_WORKFLOW_TEST_RESULTS.json). Dataset: [PROJECT_WORKFLOW_LIVE_RESULTS.json](PROJECT_WORKFLOW_LIVE_RESULTS.json). Raw runner output nằm trong test-results/ (ignored); script `scripts/qa-project-workflow-summary.mjs` gộp các report mới nhất, không lưu credentials/token.

## Cách kiểm tra lại trên FE

Với user1 hoặc user2, mở `/projects/1/dashboard`, bấm **Làm mới dữ liệu dự án** hoặc tải lại trang; có thể tìm theo `QA-FE-1793291834145`. Task ở Kanban, Story ở Backlog, Bug ở Bugs; panel có link mở màn hình quản lý theo ID thật.

Dataset mới nhất: Epic29, PBI15, Sprint23, Task38, Bug23; từ Tổng quan tạo Task39/PBI16/Bug24; Task40 xác minh cột/hạn. Epic/Sprint/Task QA đã có tên chứa Updated; PBI15 đã liên kết Sprint23; Bug23 đã gán user2. Các lần phát triển trước để lại thêm record QA-FE để đối chiếu, chưa xóa.

User2 thấy các thay đổi sau reload/Làm mới; Dashboard cũng refresh khi cửa sổ nhận focus. **Chưa xác minh realtime push mọi thay đổi** vào trang đang đứng yên.

## File và giới hạn

FE: nhóm dashboard (service/hook/types/page và các widget); Backlog page/form/drawer/service; Sprint page/create/edit/service; Kanban page/create/drawer/types/service; Bug page/create/picker/service; optional assignee DTO trong api.ts; thêm hooks/useQuickCreate.ts. Giữ nguyên các thay đổi khác đã có trước nhiệm vụ, không dùng Git diff so HEAD làm danh sách riêng của đợt này.

Tests: project-persistence.test.tsx, header-create.test.tsx, e2e/project-create.spec.ts, live/project-workflows.spec.ts; cập nhật fixture GET trong services.test.ts để kiểm thử rejected PUT khi cần đọc description trước. Không hạ assertion rejected mutation. Thêm summary script và các tài liệu PROJECT_WORKFLOW_*.

Giới hạn còn lại: PBI chưa có API comment/DoD/loại nghiệp vụ/giờ ước lượng/reporter đầy đủ; Sprint capacity chưa được BE lưu; một số bộ lọc/metadata phụ và trạng thái lỗi chưa có full matrix runtime. Những chỗ này giữ placeholder/nhãn giới hạn, không giả đã ghi DB. Không chạy start/close Sprint hiện hữu hoặc đổi quyền/cấu hình hệ thống. Chưa kiểm thử mọi thao tác kéo thả, mọi role/status, mọi tổ hợp phân trang >100 và tất cả HTTP errors.

Image upload503 từ báo cáo trước **không được kiểm thử lại trong nhiệm vụ này** và không được coi đã sửa. Không sử dụng ảnh khác/file ảnh ngoài yêu cầu người dùng. Báo cáo này chỉ xác nhận các luồng persistence/collaboration nêu trên.
