# Kiểm thử delta API/UI — 28/10/2026

## Phạm vi và baseline

FE branch `fix/quyenpn-20261027`, HEAD `d63efed`, nhiều thay đổi chưa commit có sẵn. BE HEAD `8fccccb`, so với baseline báo cáo cũ `70e51d3`. Không sửa BE, đổi branch, commit/push hoặc hoàn tác thay đổi. Kết quả cũ không tự động được kế thừa PASS cho code mới.

Nguồn: `API_UPDATE_2026-10-28.md`, báo cáo QA cũ, BE `FRONTEND_RESPONSE_CONTRACT.md`, `USER_SEARCH_REPORT_2026-10-28.md`, controller/DTO và runtime local.

## Các giai đoạn

0. Khảo sát: Git, scripts, live schema, FE/BE reachability, file ảnh và delta contract. Lưu baseline.
1. Inventory/coverage: phân biệt endpoint mới (directory, edit Chat), mở rộng DTO cũ (Task/Board, Epic, Comment, Attachment, Notification, Activity, Chat), cloud image delivery và route Chat theo project.
2. Hồi quy độc lập: Vitest/RTL, Chromium mock, build/lint; phân biệt test transport và hành vi UI. Không coi wrapper inventory là runtime coverage.
3. Tích hợp read-only: đăng nhập ADMIN/USER, directory query/pagination/validation/privacy, quyền admin 403, trường response mới trên dữ liệu QA.
4. Browser thật: USER → QA project → tìm/thêm thành viên; project Chat → tạo room → gửi/sửa/reply; upload đúng ảnh được chỉ định cho attachment/avatar/Chat, metadata và delivery. Avatar dùng tài khoản QA riêng; không thay avatar tài khoản chính. Chỉ mutation trong dữ liệu QA đã được phép.
5. Phân loại: FRONTEND/API INTEGRATION/BACKEND/TEST DATA/ENVIRONMENT, mức P0–P3, bằng chứng request/response/UI. Bất kỳ sửa FE nào phải có tái hiện và regression trước; thay đổi auth/contract/nghiệp vụ cần quyết định riêng.
6. Xác minh cuối: chạy lại test liên quan, toàn bộ suite phù hợp, build/lint; báo cáo PASS/FAIL/BLOCKED và phần chưa kiểm thử. Ghi run log sau mỗi giai đoạn.

## Dữ liệu và giới hạn

- Tài khoản test người dùng đã cấp; mật khẩu chỉ trong process environment, không đưa vào tài liệu/log.
- Dùng project QA đã cấp phép; không ghi vào Project So 1 hoặc project hiện có khác.
- Ảnh duy nhất từ file `C:/Users/phann/OneDrive/Pictures/Screenshots/Screenshot 2026-06-23 132150.png` (1,958,133 byte). Không tạo ảnh synthetic thay cho ảnh này. Không lưu URL cloud có chữ ký hoặc nội dung ảnh vào báo cáo.
- Không gọi migration media/admin global config; không reset/seed database. Email reset/expiry thực cần mailbox/token chuyên dụng; ghi BLOCKED nếu thiếu.
- Report delta cuối tại `QA_API_UPDATE_REPORT.md`, liên kết từ báo cáo tổng hợp hiện có; ma trận delta tại `QA_API_UPDATE_MATRIX.md`.
