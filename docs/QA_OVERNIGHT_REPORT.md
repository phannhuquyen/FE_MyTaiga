# Báo cáo QA MyTaiga — 28/10/2026

**Kết luận tổng thể: BLOCKED để ký duyệt toàn bộ FE.** Các test cuối đều PASS, nhưng còn chức năng demo, luồng chưa kiểm thử đủ và quyết định nghiệp vụ chưa có contract xác nhận. Không coi build hoặc endpoint inventory là bằng chứng toàn bộ chức năng hoạt động.

## Môi trường và phạm vi

- FE `D:/personal/MyTaiga`, branch `fix/quyenpn-20261027`, HEAD `d63efed`; React 19, TypeScript 6, Vite 8; local FE 5173, API 5141.
- BE read-only `D:/personal/be_taiga/BE-MyTaiga`, HEAD `70e51d3`. Live schema `/openapi/v1.json` trả 200; `/swagger/v1/swagger.json` 404 vì không phải schema route của ứng dụng.
- Đọc AGENTS.md, skill audit, khảo sát, Git status và contract BE trước sửa. Chỉ sửa FE/test/cấu hình test/docs. Không đổi branch, commit, push, reset hoặc stash; không sửa BE/schema/migration hoặc chạy seed/reset database.
- Skill audit untracked từ trước được giữ nguyên. BE có `backend/NuGet.Config` untracked từ trước, không bị sửa.
- Dùng tài khoản người dùng cung cấp và quyền tạo project QA/data riêng đã được cấp. Credentials chỉ qua process environment tạm thời, không lưu trong source/báo cáo; trace/video/screenshot tắt.

## Kết quả cuối

| Lớp kiểm thử | Tổng | PASS | FAIL | BLOCKED |
|---|---:|---:|---:|---:|
| Vitest + RTL + transport mock | 195 | 195 | 0 | 0 |
| Playwright Chromium, intercept API | 47 | 47 | 0 | 0 |
| Playwright Chromium, BE thật | 12 nhóm | 12 | 0 | 0 |
| Sweep API có đăng nhập, gồm login | 156 | 114 | 0 | 42 |
| GET API không đăng nhập | 51 | 51 | 0 | 0 |

Automated suites: **254 test/nhóm PASS, 0 FAIL, 0 skipped**. Không cộng sweep thành unique scenario vì có chồng lặp. 42 BLOCKED là từng cặp tài khoản/endpoint thiếu membership hoặc record/avatar phù hợp, không phải 42 API lỗi.

Lệnh đã chạy sau các sửa lỗi:

- `npm test -- --reporter=json --outputFile=test-results/unit-results.json`: 195 PASS.
- `npm run test:e2e`: 47 PASS, gồm 34 smoke empty/error trên 17 feature routes và 13 public/auth/loading/permission/metrics cases.
- `npm run test:live`: 12 PASS, mỗi test một attempt trong lượt cuối, không flaky/skipped.
- `node scripts/qa-live-readonly.mjs`: 114 PASS, 0 FAIL, 42 BLOCKED.
- `npm run build`: PASS, gồm TypeScript và Vite production build.
- `npm run lint`: exit 0, còn 4 cảnh báo baseline: AuthContext, Sidebar, AuditLogsTab về set-state-in-effect; KanbanPage về hook dependency.
- `git diff --check`: PASS.

Bằng chứng: [từng test và trạng thái](QA_TEST_RESULTS.json), [live API sweep](QA_LIVE_API_EVIDENCE.json), [baseline ban đầu](QA_LIVE_API_BASELINE.json), [baseline có dữ liệu trước sửa DTO](QA_LIVE_POPULATED_BASELINE.json), [inventory](QA_API_INVENTORY.md), [coverage matrix](QA_COVERAGE_MATRIX.md).

Inventory có **124 định nghĩa endpoint**. Latest sweep/dataset logs ghi nhận **96 tên wrapper**, gồm expected denials. Hai log cuối không ghi đầy đủ các request UI và tạo record một lần ở lượt trước; `unobserved` trong JSON nghĩa là không xuất hiện trong hai log này, không khẳng định chưa từng thực thi. Không tuyên bố 124/124 endpoint runtime PASS hoặc mọi response field đã được kiểm chứng.

## Scenario theo chức năng

12 nhóm live: 3 login/read/logout/protected-route theo admin/user1/user2; 1 project/department/member; 1 Epic/PBI; 1 Sprint; 1 task/board/WIP; 1 comments/files; 1 bugs/metrics; 1 Chat; 1 disposable resource/project close-delete; 1 register/admin-create/lock-unlock QA accounts.

Nhóm live kết hợp thao tác UI và gọi centralized FE API trong browser. PBI create/search, login/logout, route guard và account-locked có assertion UI; phần lớn lifecycle mutation còn lại qua wrapper/service và BE response. Không gọi các nhóm này là toàn bộ CRUD UI end-to-end.

195 unit/component: 125 contract transport/discovery, 11 API transport, 17 feature adapters, 12 services, 7 project access, 5 guards, 3 session, 3 admin modal, 2 logout, 2 populated contracts, 2 drawer, 2 Chat; 4 test riêng config/settings/channel/notification page. Mock chứng minh FE xử lý response/request, không chứng minh BE chấp nhận.

## Lỗi đã xác minh và sửa

Các nhóm được tái hiện bằng regression thất bại hoặc response runtime/contract rồi sửa tối thiểu và chạy lại. Chi tiết mốc trước/sau trong [run log](QA_OVERNIGHT_RUN_LOG.md).

| Mức / phân loại | Nguyên nhân và thay đổi | Regression / bằng chứng |
|---|---|---|
| P1 FRONTEND | Workspace/admin render khi user null hoặc restore chưa xong; project chưa xác minh access. Chờ session, kiểm tra numeric ID, project GET trước render con. | guards, project-access; live protected URL |
| P1 FRONTEND | Raw response console có thể lộ token; bỏ logging trung tâm. Failed users/me sau login còn giữ credential; nay clear session. | api/session; source inspection |
| P1 FRONTEND / API INTEGRATION | Logout lazy-navigation/token-clear race; stale 401 làm mất session mới. Await public navigation, capture bearer rồi clear local ngay; chỉ invalidate session phù hợp. | api/logout; 3 live accounts |
| P1 API INTEGRATION | Account lock trả 403 nhưng FE chỉ nhận 400. Xử lý thông báo khóa theo contract và chuyển account-locked. | session; new QA account lock UI |
| P1 FRONTEND | Admin modal/settings đóng hoặc báo thành công khi API fail. Await service, giữ input, hiển thị lỗi, disable pending. | admin-mutations/settings/admin-config |
| P1 FRONTEND | Task/WIP/subtask/comment publish thành công giả; description-only không persist; status edit không gọi board.move. Chỉ đổi state sau API success, giữ input/row khi fail. | services/drawer |
| P1 FRONTEND | Mock task/candidate ID bị bóc chữ số thành record thật. Strict safe numeric ID, reject mutation thiếu backend identity. | services/feature-adapters |
| P1 API INTEGRATION | Bug collections là items/total; Chat history là items/messageId/sentAt; participant/attachment DTO không khớp. Sửa DTO/adapter đúng response. | populated-contracts/chat/live sweep |
| P2 API INTEGRATION | Config trả mảng key/value; Sprint draft query PLANNED; remaining item nhầm story points; throughput/backlog DTO sai. Sửa mapping. | admin-config/feature-adapters/live |
| P2 FRONTEND / API INTEGRATION | Notification content/ref fields sai; empty giữ demo; page không refresh; read publish trước API. Sửa mapping/refresh/await; actor thiếu giữ placeholder. | notification-page/services/adapters |
| P2 FRONTEND | Chat send/create/upload báo thành công sớm hoặc thiếu File[]. Await API, surface error, giữ input. | chat/chat-channel/live file |
| P2 FRONTEND | Metrics fail trả KPI demo và mặc định sprint 14. Surface error, dùng sprint list thật, label chart minh họa. | adapters/mock browser/member 403 |

Không xác minh P0 trong phạm vi đã chạy; không phải chứng nhận không còn lỗ hổng. Bỏ payload logging trung tâm không đồng nghĩa đã kiểm toán mọi feature log. Không quy kết BE lỗi từ expected 403.

## Dữ liệu QA và cleanup

- Giữ **project 3 — QA-AUDIT-1793121151062**, user1 MANAGER, user2 MEMBER. [Manifest](QA_TEST_DATASET.json) lưu ID synthetic mới nhất; các lượt trước có thể để thêm QA record.
- Retain Epic/PBI/Sprint/task/bug, comment/file mẫu và Chat room 2/message/file để xem. Department/disposable records và project phụ được tạo rồi xóa qua API; project chính được giữ.
- Tạo user3 ID 4 qua registration, user4 ID 5 qua admin create theo phép đã cấp. Chỉ lock/unlock hai user mới; cuối cùng unlock và login PASS. Không đổi mật khẩu/role của tài khoản được cấp, không ghi config hệ thống.
- Sự cố harness lúc phát triển: probe login user bị khóa dùng chung context làm mất admin session; cleanup unlock nhận 401. Đã phục hồi ngay qua admin request độc lập sau xác minh user thuộc QA, rồi sửa isolated context/recovery trong finally. Full live cuối xác minh unlock/login cả hai; không để QA account bị khóa.

## Những phần chưa đủ để ký duyệt

| Ưu tiên / trạng thái | Việc còn lại / thông tin cần cung cấp |
|---|---|
| P1 PARTIAL FRONTEND | Member/assignee picker còn mock identity; đã chặn gửi sai ID nhưng cần hoàn thiện nguồn user thật theo contract. |
| P1 PARTIAL FRONTEND | Chat create-group UI thiếu project/member source; DM/edit/delete/reactions còn demo. Cần xác nhận các luồng thực sự được hỗ trợ. Direct API room PASS không chứng minh create-group UI hoàn chỉnh. |
| P1 BLOCKED nghiệp vụ | Disposition PBI/task chưa xong khi đóng Sprint và các action stub: cần xác nhận contract/hành vi; không tự đặt quy tắc. |
| P2 PARTIAL contract/data | Notification thiếu actor/project context; link có thể dùng active project. Mark-unread chưa có contract. Cần field hoặc quy tắc điều hướng rõ ràng; giữ placeholder. |
| P2 PARTIAL demo | Dashboard, role matrix, settings ngoài size, metrics historical/threshold/date/category/export còn minh họa hoặc chưa chứng minh tích hợp. |
| P2 NOT TESTED phạm vi | Global config/role mutation và live mark-all notification hiện hữu không được chạy ngoài QA. |
| P2 BLOCKED môi trường | Email reset delivery/password reset-change/actual expiry cần mailbox/test token và account chuyên dụng; không đổi credential đang dùng. |
| P2 NOT TESTED coverage | Mọi tổ hợp form/pagination/filter/sort và HTTP error cho từng feature, cache isolation theo project/account. HTTP error matrix chỉ được mock ở central client và một số component. |
| P2 NOT TESTED browser | Firefox/WebKit/mobile, đầy đủ drag geometry/keyboard/accessibility và visual Figma. Chỉ Chromium desktop đã chạy. |

Chưa xác minh runtime mọi optional/malformed response field. Trường thiếu giữ UI/placeholder theo AGENTS.md; không dùng fallback để kết luận BE thành công. Không sửa BE để bổ sung contract.

## File và bước tiếp theo

- Cấu hình: package.json/lock, .gitignore, vitest.config.ts, playwright.config.ts, playwright.live.config.ts; thêm dev dependencies, giữ framework/build versions.
- Scripts: qa-inventory.mjs, qa-live-readonly.mjs, qa-results-summary.mjs.
- Tests: setup, 16 unit/component files, e2e/frontend.spec.ts, live/authenticated.spec.ts, live/qa-dataset.spec.ts.
- FE: layouts AppLayout/AdminPortalLayout/Sidebar; AuthContext/authService; ProjectLayout; admin dialogs/settings/tab/service; kanban drawer/service; memberService; sprintService; bugService; Chat page/modal/service; notification page/bell/service; metrics page/service; lib/utils.ts; services/api.ts.
- Docs: plan/environment, inventory/evidence/baselines, dataset/results, coverage matrix, run log và báo cáo này. Toàn bộ vẫn chưa commit, có thể review bằng Git diff.

Ưu tiên tiếp: picker identity và Chat UI contract, xác nhận Sprint disposition/notification context, rồi mở rộng real UI CRUD/error/role matrix. Những phần chưa đủ được giữ PARTIAL/BLOCKED/NOT TESTED, không gọi toàn bộ FE hoàn thành.

## Báo cáo mới sau cập nhật API/UI 28/10/2026
**Kết quả mới nhất: BLOCKED vì3 luồng upload ảnh503.** Xem [QA_API_UPDATE_REPORT.md](QA_API_UPDATE_REPORT.md) và [QA_API_UPDATE_RESULTS.json](QA_API_UPDATE_RESULTS.json). Số liệu và vấn đề trong các mục trước là lịch sử của code/BE baseline cũ; không dùng chúng để kết luận trạng thái hiện tại.

## Project So 1 — tích hợp dữ liệu thật 29/10/2026
[Báo cáo mới](PROJECT_WORKFLOW_REPORT.md): Tổng quan/workflows core đã được tích hợp và kiểm chứng với user1/user2,12 nhóm live latest PASS;214 unit/55 browser mock PASS. Phạm vi này không bao gồm xác minh lại dịch vụ ảnh503 hoặc ký duyệt toàn bộ FE. Giữ các kết quả lịch sử ở trên.
