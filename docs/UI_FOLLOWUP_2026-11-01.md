# Kiểm tra Sprint, Bug và menu hồ sơ — 01/11/2026

Kết quả tổng thể: **BLOCKED một phần**. Các sửa lỗi FE đã được kiểm thử; yêu cầu đổi Bug tùy ý chưa thể xác nhận tích hợp thành công vì BE vẫn áp đặt workflow. Không coi toàn bộ yêu cầu đã PASS.

## Phạm vi và môi trường

- Branch giữ nguyên `fix/quyenpn-20261030`, baseline HEAD `177ae29`; working tree sạch khi bắt đầu. Không commit/push, không đổi branch.
- Đọc AGENTS.md, skill fe-api-integration-audit, router, toast/modal, Sprint/Bug service và controller BE ở chế độ chỉ đọc.
- React 19, TypeScript, Vite; tái sử dụng Vitest/RTL và Playwright Chromium. Không thêm dependency.
- FE localhost:5173 và BE qua proxy /api; live đăng nhập user1, Project 1. Không đổi mật khẩu thật, không sửa/xóa dữ liệu nghiệp vụ hoặc BE.

## Phát hiện và sửa lỗi

| Phát hiện | Phân loại / mức độ | Bằng chứng | Xử lý |
|---|---|---|---|
| Form tạo Sprint hiển thị lỗi Axios chung thay vì lý do xung đột | FRONTEND / P2 | Regression tái hiện trước sửa; BE trả 409 với message trùng tên hoặc chồng lịch | Đọc response.data.message; popup lỗi, giữ input. Không biến xung đột hợp lệ thành thành công |
| Thời gian/đóng thông báo cần thống nhất | FRONTEND / P2 | Unit fake timers và click X trên Chromium | Default 7000ms; X luôn bấm được; `autoClose={false}` chỉ tắt tự đóng; callback thay đổi không khởi động lại timer |
| FE chặn OPEN → CLOSED và hiển thị demo “Bị chặn” | FRONTEND / P2 | Static + regression trước sửa + browser gửi đúng một PATCH CLOSED | Bỏ kiểm tra tuần tự; chỉ cập nhật sau response thành công; popup lỗi và giữ trạng thái khi bị từ chối |
| REOPENED bị gộp thành OPEN | API INTEGRATION / P2 | Regression trước sửa gửi sai OPEN; controller hỗ trợ REOPENED | Bổ sung “Mở lại”, map hai chiều đúng; có filter/list/detail và browser regression |
| Link profile/security, notifications, projects, integrations thiếu route | FRONTEND / P2 | Router và link sidebar; browser navigate + reload | Bổ sung trang cài đặt, tái sử dụng danh sách thông báo/dự án thật; form đổi mật khẩu dùng endpoint có sẵn |
| BE còn giới hạn chuyển trạng thái Bug | BACKEND contract / P1 đối với yêu cầu mới | STATIC/API source BugsController.cs:145–147 | Chưa sửa BE. Cần chủ BE cho phép chuyển tùy ý giữa enum hợp lệ và xác định các ràng buộc liên quan |
| Chưa có API tích hợp cá nhân | API GAP / P3 | Không tìm thấy endpoint tương ứng trong controller/client | Trang Tích hợp hiển thị rõ chưa hỗ trợ; không giả lập lưu cấu hình |

BE hiện cho phép OPEN→IN_PROGRESS; IN_PROGRESS→RESOLVED; RESOLVED→CLOSED/REOPENED; CLOSED→REOPENED; REOPENED→IN_PROGRESS. FE mới cho chọn trực tiếp cả 5 trạng thái, nhưng BE hiện tại vẫn có thể trả 409. Không gọi các trạng thái trung gian để vượt ràng buộc, không báo lưu thành công giả.

## Coverage của yêu cầu này

| Scenario | API / trường chính | Mock / unit | Live |
|---|---|---|---|
| Sprint xung đột, popup, đóng ngay, giữ form | POST /api/v1/sprints; projectId,sprintName,startDate,endDate; response.message | PASS | PASS — duplicate name 409; GET trước/sau total không đổi |
| Popup tự đóng đúng 7 giây và tắt autoClose | Component timer/close | PASS | Không cần chờ timer live; đã xác minh close thủ công |
| Bug OPEN→CLOSED được FE gửi trực tiếp | PATCH /api/v1/bugs/{id}/status; body.status | PASS với BE mock chấp nhận | BLOCKED — danh sách Project 1 không có Bug QA prefix QA- phù hợp; không thử mutation trên Bug nghiệp vụ |
| Bug 409 giữ trạng thái cũ | response.message/status, không ghi cache thành công giả | PASS | BLOCKED DATA như trên; workflow BE xác minh bằng source, không tuyên bố runtime 409 đã chạy |
| Bug REOPENED đúng payload/response | status=REOPENED | PASS | NOT TESTED mutation thật |
| Bốn tab profile mở và reload | /profile/security,notifications,projects,integrations | PASS | PASS — user1, 4 tab hiển thị |
| Đổi mật khẩu: confirmation sai, BE 400, thành công xóa session | POST /api/v1/auth/change-password; currentPassword,newPassword,confirmPassword | PASS; toàn bộ password synthetic | NOT TESTED — chủ động không đổi mật khẩu thật |
| Kết nối tích hợp cá nhân | Chưa có endpoint | Chỉ PASS hiển thị giới hạn, nút disabled | BLOCKED API GAP |

## Lệnh và kết quả cuối

- `npm test`: **220/220 PASS**, 24 test files. Trong đó 6 test mới cho popup/Sprint/status mapping. Các test tái hiện được chạy FAIL trước sửa; không xóa/hạ assertion.
- `npx playwright test`: **62/62 PASS**, toàn bộ dùng API interception/mock; 7 scenario mới cho yêu cầu này. JSON: `test-results/browser-results.json`.
- `npx playwright test -c playwright.live.config.ts tests/live/ui-followup.spec.ts`: **2 PASS / 1 skipped = BLOCKED DATA**. JSON: `test-results/live-browser-results.json`. Hai nhóm PASS là Sprint duplicate popup và profile tabs; login/GET chạy BE thật. Không cộng các lượt lặp thành coverage mới.
- Lượt live đầu 1 PASS/2 skipped vì test chỉ chọn Sprint QA. Sau khi đối chiếu controller bảo đảm duplicate name bị từ chối trước INSERT, mở rộng test dùng tên Sprint hiện hữu: lượt cuối xác minh 409 và count không đổi. Không tạo Sprint mới để ép test chạy.
- `npm run build`: PASS (TypeScript + production Vite build).
- `npm run lint`: exit 0, **9 cảnh báo hiện hữu** ở auth/dashboard/kanban/sidebar/admin/script; không coi là zero-warning.
- `git diff --check`: PASS. Không sửa backend, tài khoản, quyền hệ thống, schema hoặc cấu hình môi trường.

## File thay đổi

- `D:\personal\MyTaiga\src\app\router\index.tsx`: route profile sections.
- `D:\personal\MyTaiga\src\features\profile\ProfileSettingsPage.tsx`: trang bảo mật/thông báo/dự án/tích hợp.
- `D:\personal\MyTaiga\src\features\profile\components\ProfileToast.tsx`: 7 giây, error variant, autoClose tùy chọn, close ngay.
- `D:\personal\MyTaiga\src\lib\apiErrors.ts`: lấy message nghiệp vụ, tránh lỗi Axios chung.
- `D:\personal\MyTaiga\src\features\sprints\components\CreateSprintModal.tsx`: popup lỗi giữ form.
- `D:\personal\MyTaiga\src\features\bugs\components\BugDetailView.tsx`: chọn trực tiếp, pending/error, chỉ cập nhật khi lưu thành công; giữ comments/attachments/detail khi đổi status.
- `D:\personal\MyTaiga\src\features\bugs\services\bugService.ts`: bỏ ràng buộc tuần tự FE, dùng trạng thái BE trả về, map REOPENED.
- `D:\personal\MyTaiga\src\features\bugs\types.ts` và `D:\personal\MyTaiga\src\features\bugs\BugsPage.tsx`: enum, nhãn và filter Mở lại.
- `D:\personal\MyTaiga\tests\ui-followup.test.tsx`: 6 regression unit/component.
- `D:\personal\MyTaiga\tests\e2e\ui-followup.spec.ts`: 7 browser scenario mock.
- `D:\personal\MyTaiga\tests\live\ui-followup.spec.ts`: live Sprint duplicate, Bug QA, profile tabs; credentials chỉ qua biến môi trường, trace/video tắt.
- Báo cáo này và cập nhật `D:\personal\MyTaiga\docs\QA_OVERNIGHT_RUN_LOG.md`, `D:\personal\MyTaiga\docs\QA_COVERAGE_MATRIX.md`.

## Việc còn lại

1. BE cần thay đổi giới hạn workflow nếu muốn lưu trực tiếp mọi trạng thái. Không thuộc quyền sửa FE hiện tại theo AGENTS.md.
2. Cần Bug test QA trong Project 1 để chạy lại live status regression. Script không tự tạo hoặc dùng Bug nghiệp vụ.
3. Tích hợp cá nhân cần contract/API trước khi triển khai kết nối thật. Đổi mật khẩu thật không nằm trong kiểm thử lần này.
