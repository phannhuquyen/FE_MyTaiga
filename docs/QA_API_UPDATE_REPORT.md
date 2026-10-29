# Báo cáo kiểm thử API/UI cập nhật — 28/10/2026

**Kết luận: BLOCKED.** Các luồng delta không phụ thuộc ảnh và regression sau sửa đã đạt, nhưng upload đúng ảnh được chỉ định trả HTTP 503 ở Task, Chat và avatar. Chưa đủ bằng chứng ký duyệt cloud delivery hoặc toàn bộ FE.

## Phạm vi thực chạy

- FE `D:/personal/MyTaiga`, branch `fix/quyenpn-20261027`, HEAD `d63efed`; BE read-only HEAD `8fccccb`, đối chiếu baseline cũ `70e51d3`. Working tree có nhiều thay đổi có sẵn; Git diff so HEAD bao gồm cả công việc trước đợt này.
- React 19 / TypeScript 6 / Vite 8; tái sử dụng Vitest, RTL, Playwright Chromium. Không thêm dependency, đổi branch, commit/push, sửa BE, migration/seed/reset DB hoặc cấu hình môi trường.
- Đăng nhập các tài khoản đã cấp; mutation chỉ QA project3 và dữ liệu QA/disposable đã được phép. User5 được thêm qua modal FE, POST trả201 và đọc lại là MEMBER. Các lần sau chỉ xác minh người đã tham gia bị disable, không xóa để thêm lại.
- Browser thật chạy bằng Playwright trên FE5173/BE5141. Một số luồng là UI đầy đủ, một số là centralized FE API wrappers trong browser. Không gọi toàn bộ wrapper lifecycle là CRUD UI end-to-end.
- Ảnh upload chỉ lấy từ `C:/Users/phann/OneDrive/Pictures/Screenshots/Screenshot 2026-06-23 132150.png`, 1,958,133 byte. Unit/component dùng URL internet làm fixture thuộc tính, không chứng minh tải ảnh thật. Không lưu ảnh, credentials, token hoặc URL cloud ký vào báo cáo.

## Kết quả cuối và cách đếm

| Lớp | Tổng | PASS | FAIL | BLOCKED |
|---|---:|---:|---:|---:|
| Vitest/RTL/transport mock | 205 | 205 | 0 | 0 |
| Chromium API interception | 50 | 50 | 0 | 0 |
| Browser/API live, kết quả mới nhất từng nhóm | 21 | 18 | 0 | 3 |
| Live read-only account/endpoint, gồm login | 159 | 117 | 0 | 42 |
| Anonymous GET auth boundary | 52 | 52 | 0 | 0 |

Ba suite đầu: **276 test/nhóm, 273 PASS, 3 BLOCKED**. Không cộng sweep/anonymous vào tổng này vì có chồng lặp. Inventory **126 định nghĩa endpoint FE**, **127 operation OpenAPI**, **0 sai lệch method/path**; đây không phải 126 endpoint đã runtime PASS. 42 BLOCKED trong sweep là cặp tài khoản/endpoint thiếu membership/record phù hợp, không phải 42 lỗi server.

**Runner và phân loại QA được tách rõ:** full live run 21 nhóm có 16 passed/5 failed, exit1. Ba failed là upload503, được phân loại BLOCKED phụ thuộc dịch vụ; hai failed còn lại là race FE và đã sửa. Focused live cuối chạy lại 6 nhóm delta đạt6/6, bao gồm Members và Chat. Bảng trên gộp kết quả mới nhất theo tên scenario, không sửa/xóa assertion hoặc skip test ảnh để làm xanh runner. Các lần phát triển harness được giữ trong log nhưng không cộng thành lỗi sản phẩm hay tăng coverage.

- `npm test -- --reporter=json --outputFile=test-results/update-unit-results.json`: 205 PASS.
- `npm run test:e2e`: 50 PASS; 3 ca mới cho project Chat populated/empty/error, scope phòng, reply và image preview.
- `npm run test:live`: 21 nhóm, raw16 PASS/5 FAIL trước hai sửa race; focused delta cuối6 PASS.
- `node scripts/qa-live-readonly.mjs`: 117 PASS/0 FAIL/42 BLOCKED.
- `npm run test:inventory`:126 definitions,52/52 anonymous401,0 mismatch.
- `npm run build`: PASS. `npm run lint`: exit0,5 baseline warnings ở AuthContext, Sidebar, AuditLogsTab, ChatPage, KanbanPage.
- `git diff --check`: PASS; Git có cảnh báo chuyển LF/CRLF, không phải whitespace failure.

Máy đọc: [kết quả hợp nhất](QA_API_UPDATE_RESULTS.json), [dữ liệu QA delta](QA_API_UPDATE_LIVE_RESULTS.json), [live sweep](QA_LIVE_API_EVIDENCE.json). Log chi tiết runner nằm trong `test-results/` (ignored); tái tạo summary bằng `node scripts/qa-api-update-summary.mjs` sau khi có full/focused reports tương ứng.

## Scenario theo chức năng

| Nhóm | Nhóm test live | Bằng chứng chính / giới hạn |
|---|---:|---|
| Auth/admin guards | 3 PASS | ADMIN/USER login, routes, logout, direct protected URL; không đổi role hệ thống |
| Directory | 1 PASS | USER keyword email, trim, empty, pagination;400 giới hạn;403 admin users; response chỉ4 field directory |
| Members/departments | 2 PASS | 1 delta UI user5 + duplicate/reload;1 lifecycle QA wrappers |
| Epic/PBI/Task/Board/Comment/Activity mở rộng | 1 delta PASS | color, tags, storyPoints, assignee/epic, author/isEditable, board task và activity userName; không phải mọi field optional |
| Backlog/Epic | 1 PASS | PBI tạo qua UI, search; các action còn lại qua wrapper |
| Sprint | 1 PASS | planning/start/progress/burndown/close QA; không suy diễn disposition nghiệp vụ |
| Task/WIP | 1 PASS | create/update/priority/deadline/progress/subtask/board/WIP; read UI |
| Comment/file thông thường | 1 PASS | CRUD comment, TXT upload/preview/download/delete; không dùng TXT để kết luận ảnh cloud PASS |
| Bugs/metrics | 1 PASS | QA bug lifecycle, metrics read; còn phần minh họa theo báo cáo cũ |
| Chat cũ | 1 PASS | participants/message persistence/adapter/TXT file bằng wrapper |
| Chat delta | 2 PASS | create channel qua UI → send → edit PUT200 → reload; reply persisted và render quote |
| Notifications delta | 1 PASS | actorUnknown/actor ID/reference aliases trên user2, FE page smoke; chưa kiểm mọi điều hướng |
| Disposable lifecycle | 1 PASS | Chỉ records/project QA phụ được close/delete |
| QA accounts | 1 PASS | Hồi quy lock/unlock user QA do lần trước tạo; recovery trong finally; không đổi credential/role |
| Task image / Chat image / Avatar | 3 BLOCKED | Mỗi loại upload đúng PNG nhận503; dừng trước delivery, không tuyên bố metadata/preview/download PASS |

18 nhóm PASS và3 BLOCKED; một nhóm có nhiều assertion, không dùng assertion count làm số scenario độc lập.

## Phát hiện và sửa frontend

| ID / mức | Phân loại, bằng chứng | Nguyên nhân và xử lý | Regression |
|---|---|---|---|
| UPD-01 P2 | FRONTEND, STATIC+TEST | REST history bỏ attachments/reply; realtime/send không dùng đầy đủ DTO. Dùng mapper chung, giữ metadata, quan hệ reply, tác giả thật. Không bịa nội dung parent ngoài history; hiển thị chưa tải. | chat-history-update: thất bại trước sửa → đạt |
| UPD-02 P2 | FRONTEND, TEST | Send dùng Minh Quân demo, append trùng ID khi response đã có trong store. Dùng saved sender và upsert ID. | canonical sender/dedup test |
| UPD-03 P2 | FRONTEND, STATIC+TEST+mock browser | Image preview render tài liệu benchmark demo, download href=#. Nhánh ảnh dùng URL metadata, download trỏ resource. Unit kiểm src/href; live cloud delivery còn BLOCKED. | chat-image-preview; populated project Chat browser |
| UPD-04 P2 | FRONTEND, TEST+RUNTIME | Request listRooms cũ hoàn tất sau createChannel xóa phòng mới khỏi UI. Version request để bỏ response cũ. | late-room-response test thất bại trước sửa → đạt; UI live cuối PASS |
| UPD-05 P2 | FRONTEND, RUNTIME+TEST | Promise.all tải members/directory làm alreadyInProject phụ thuộc cache và thứ tự response; nút duplicate đôi khi enabled. Derive flag từ members state hiện tại. | members-candidates; live duplicate test PASS |
| UPD-06 P2 | FRONTEND, TEST | Avatar URL mẫu resolve mà không upload rồi UI báo lưu thành công. Nay reject khi chưa có File/data URL hợp lệ, yêu cầu upload từ máy. Không thêm endpoint hoặc tự tải URL bên ngoài. | avatar-update thất bại trước sửa → đạt |
| UPD-07 P1 blocker | ENVIRONMENT/service dependency, API+RUNTIME | Cả3 image upload503. Có bằng chứng không thể hoàn tất dịch vụ ảnh, chưa đủ bằng chứng quy kết thiếu key/quota/network. Không sửa BE/cấu hình. | Raw full live failures, đúng PNG; cần chủ môi trường khắc phục |

Các lỗi harness đã loại riêng: locator email kèm phòng ban, dấu# trong room label, trùng sidebar/body, nút avatar trùng tên, tham số Epic get và chờ PUT trước reload. Không coi đó là defect BE.

## File của đợt này

- FE sửa hẹp trên nội dung có sẵn: `src/services/api.ts` (optional Chat image DTO fields), `src/features/chat/types.ts`, `src/features/chat/services/chatService.ts`, `src/features/chat/components/AttachmentPreviewModal.tsx`, `src/features/members/MembersPage.tsx`, `src/features/profile/services/profileService.ts`.
- Thêm test: `tests/chat-history-update.test.ts`, `tests/chat-image-preview.test.tsx`, `tests/avatar-update.test.ts`, `tests/members-candidates.test.tsx`, `tests/e2e/api-update.spec.ts`, `tests/live/api-update.spec.ts`.
- Thêm summary script và các tài liệu `QA_API_UPDATE_PLAN/MATRIX/REPORT/RESULTS/LIVE_RESULTS`; cập nhật inventory/evidence, live readonly evidence và append các mốc vào plan/environment/coverage/run log/report tổng hợp cũ. Không ghi đè báo cáo lịch sử để thay kết quả cũ bằng số mới.
- Dữ liệu giữ để review: QA project3 có user5 ID6, các Epic/Task/comment/channel QA delta có ID trong manifest delta; các lần thử trước có thể để thêm records QA. Không xóa dữ liệu QA đã giữ hoặc dữ liệu project khác. Upload ảnh503 chưa chứng minh tạo asset thành công.

## Phần chưa xác minh và bước tiếp

1. Cần khắc phục dịch vụ ảnh trên BE đang chạy: kiểm tra Cloudinary readiness/log đã che secret. Sau đó chạy lại3 scenario ảnh bằng đúng file đã chỉ định; xác minh signed URL, expiry10 phút, preview/download bytes và reload UI. Không dùng ảnh mạng để che việc API upload503.
2. Realtime dual-context, reconnect history, presence và expiry signed URL chưa có live coverage đầy đủ. Upsert đã có deterministic regression, không được coi là SignalR toàn luồng PASS.
3. Directory chưa test runtime hơn100 tài khoản; pagination API đã test pageSize1 và mapper vẫn tải các trang100. UI giữ nhãn TechCorp/demo, department online từ dữ liệu cũ không chứng minh tenant/presence.
4. Chat non-image/PDF preview, reactions/thread/pin/delete còn demo hoặc thiếu chứng minh API theo phạm vi hiện tại. Không coi image preview fix là tích hợp hết attachment UI.
5. Optional/malformed fields, mọi lỗi400/401/403/404/409/500 theo từng feature, authority cross-user edit, Task image UI toàn luồng, notification navigation và mọi role matrix vẫn PARTIAL/NOT TESTED theo ma trận. Một số trường chỉ được shape-check.
6. Media migration/global config/role mutation không chạy; mailbox reset/password expiry, Firefox/WebKit/mobile/visual Figma còn ngoài phạm vi hoặc thiếu prerequisite như báo cáo cũ.

Không cần cung cấp lại tài khoản. Blocker chính cần chủ môi trường xử lý là image service503; mọi claim PASS còn lại giới hạn đúng scenario đã thực chạy.
