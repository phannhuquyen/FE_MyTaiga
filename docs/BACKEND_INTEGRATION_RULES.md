# Backend Integration Rules & Protocol — MyTaiga Frontend

Tài liệu này lưu trữ toàn bộ quy tắc, tiêu chuẩn kiến trúc và quy trình làm việc giữa Frontend (`d:\personal\MyTaiga`) và Backend (`D:\personal\be_taiga\BE-MyTaiga`).

---

## 1. Nguồn và Vị trí Backend
- **Đường dẫn thư mục BE**: `D:\personal\be_taiga\BE-MyTaiga`
- **Cổng API cục bộ**: `http://localhost:5141`
- **Vite Proxy FE**: `/api` chuyển tiếp tới `http://localhost:5141`
- **Cổng môi trường kiểm thử BE**: `http://127.0.0.1:5159` (tiến trình riêng, database kiểm thử riêng `MyTaiga_*Checks_*`)
- **Tài liệu tiến độ BE**: `D:\personal\be_taiga\BE-MyTaiga\docs\BACKEND_PROGRESS.md` và `docs\testing-*.md`

---

## 2. Các quy tắc bất khả xâm phạm

### Quy tắc 1: Tuyệt đối KHÔNG thay đổi code Backend
- Mọi thao tác sửa/thêm code chỉ diễn ra trên Frontend `d:\personal\MyTaiga`.
- Không sửa file controller, model, migration, SQL script hay config nào trong `D:\personal\be_taiga\BE-MyTaiga`.

### Quy tắc 2: Tập trung tất cả API vào một file duy nhất
- Mọi endpoint, interface DTOs, axios client đều được định nghĩa tập trung tại `src/services/api.ts`.
- File `src/lib/apiClient.ts` đóng vai trò re-export duy nhất.
- Các services ở từng feature (`src/features/*/services/*`) chỉ gọi hàm thông qua `api.*` từ `src/services/api.ts`, không tự tạo axios instance riêng.

### Quy tắc 3: Xử lý khi Backend có cập nhật mới (Mở hội thoại mới)
Mỗi khi người dùng cập nhật Backend mới hoặc mở hội thoại mới để kiểm tra Backend:
1. Đọc commit log, các file trong `backend/MyTaigaAPI/Controllers/`, `DTOs/` và `docs/` của BE.
2. Kiểm tra API cũ: Nếu có bất kỳ sự thay đổi (contract/URL/params/response), lập tức báo cáo và đưa ra hướng cập nhật FE.
3. Liệt kê danh sách các API mới đã có thể tích hợp.
4. Lập bảng đối chiếu dữ liệu (FE cần vs BE trả).
5. Đưa ra kế hoạch triển khai theo từng slice.

### Quy tắc 4: API chưa có trên BE thì FE chưa động tới
- Các phân hệ mà BE chưa có API (hiện tại gồm: Kanban kéo thả công việc, Flow Metrics & cảnh báo WIP, Bugs, Bình luận/Tệp đính kèm, Thông báo thời gian thực SignalR, Chat):
  - Phía FE **giữ nguyên toàn bộ mock data và local state hiện có**.
  - Không xóa bỏ, không can thiệp làm gián đoạn luồng UI của các màn hình này.

### Quy tắc 5: Quy tắc hiển thị UI khi BE thiếu dữ liệu (Missing Data)
- **KHÔNG ĐƯỢC ẨN các phần tử UI** mà thiết kế Figma yêu cầu nhưng API Backend chưa trả về.
- Vẫn hiển thị đầy đủ các thành phần UI theo thiết kế.
- Sử dụng **giá trị mặc định (default value / placeholder)**.
- Gắn kèm **text mô tả / tooltip (title) hoặc highlight nhẹ** trên phần tử để người dùng và developer dễ dàng nhận biết trường này BE chưa hỗ trợ và sẽ bổ sung sau.
- Tổng hợp toàn bộ danh sách các trường thiếu này thành một bảng riêng. Không can thiệp sửa logic FE ở các trường này cho đến khi hoàn thành xong tất cả các API sẵn có thì mới báo cáo tổng thể.

---

## 3. Danh sách trạng thái API hiện tại (Cập nhật 2026-10-26)

### A. Đã sẵn sàng trên BE (49 Endpoints)
1. **Auth & Profile**: Login, Logout, Register, Forgot Password, Reset Password, Change Password, Get Profile, Update Profile, Upload Avatar, Get Avatar Blob.
2. **Admin**: Lock User, Unlock User.
3. **Projects (UC4)**: Create, List (phân trang + lọc), Get Detail, Update, Close, Soft Delete.
4. **Project Members (UC5)**: List (phân trang + lọc tên/phòng ban), Add Member (`userId`), Remove Member, Promote Member to Manager.
5. **Project Departments (UC6)**: List (phân trang + memberCount), Create, Update, Delete, Assign/Unassign Member Department.
6. **Epics (UC9–UC10)**: List by Project, Create, Get Detail, Update, Delete, Get Progress (% PBI, % Task), Link PBI to Epic, Link Task to Epic.
7. **Product Backlog (UC7–UC8)**: List PBIs (by projectId + filters), Create PBI (bắt buộc `epicId`), Get Detail, Update, Delete, Change Priority, Reorder all PBIs of Epic (`PUT /order`).
8. **Sprints (UC11–UC12)**: List Sprints (by projectId + status), Create Sprint (`PLANNED`), Get Detail, Update, Delete (`PLANNED` only), Start Sprint (`PLANNED` -> `ACTIVE`), Close Sprint (`ACTIVE` -> `CLOSED`), Add PBIs to Sprint, Remove PBI from Sprint, Sprint Progress, Sprint Burndown Chart data.

### B. Chưa có trên BE (FE giữ nguyên mock)
- UC13–UC17: Task, Subtask, phân công giao việc, deadline, Board di chuyển/sắp xếp công việc.
- UC18–UC23: Cấu hình/cảnh báo giới hạn WIP, Flow Metrics (Cycle Time, Throughput, Work Item Age, WIP Run Chart).
- Bugs / Issue tracking.
- Bình luận / Tệp đính kèm.
- Thông báo thời gian thực (SignalR) / Chat.
- Quản trị viên tìm kiếm người dùng toàn hệ thống (`GET /api/v1/users`).
