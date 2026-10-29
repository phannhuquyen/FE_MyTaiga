# Tích hợp API ngày 28/10/2026

BE tham chiếu: be/user-search, 8fccccb. Không sửa Backend.

- Danh bạ GET /users thay candidate mẫu; ID thật dùng cho thêm thành viên.
- DTO mở rộng Task/Board, Comment, Attachment, Notification, Activity, Bug, Chat; map tên/role/avatarCode, Epic color, tags và storyPoints.
- PUT chat message và replyToMessageId qua JSON/multipart. Realtime upsert theo messageId.
- Avatar chấp nhận URL cloud tuyệt đối.
- Chat chỉ trong project theo yêu cầu người dùng: /projects/:projectId/chat, chỉ GROUP có projectId khớp. /chat cũ chuyển về danh sách project. Không hiển thị phòng riêng hoặc phòng demo trong project.
- Tạo kênh gửi projectId và participantIds thật; người tạo được BE tự thêm. Mô tả nhóm chưa được BE lưu, giữ như thông tin UI.

126 wrapper ứng dụng; endpoint admin/media/migrate-images là công cụ vận hành không đưa vào UI.
Các chức năng chưa có API (reactions, thread, pin, resolution metadata, DoD) vẫn giữ local state/placeholder hiện có.

Kiểm thử: build PASS; Vitest 199/199 PASS trước bước dọn UI cuối; chạy lại trong lượt bàn giao. Chưa chạy browser/live mutation cho thay đổi này.
