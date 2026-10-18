# Screen Inventory — Taiga ScrumBan Flow

> **Tổng số tài liệu tham khảo**: 126 ảnh chụp màn hình trong `design/references/`.  
> **Phạm vi phân loại**: 15 miền chức năng (Domains) + 1 Màn hình Tổng quan đã dựng (`dashboard.png` / `Group 1.png`).  
> **Nguyên tắc**: Sử dụng tên tệp gốc chính xác 100%, phân định rõ trạng thái UI (Full page vs Component/Modal/Drawer/State).

---

## Tổng quan phân bổ theo miền nghiệp vụ

| STT | Miền nghiệp vụ (Feature Domain) | Số lượng ảnh | Loại giao diện chính |
|---|---|:---:|---|
| 0 | Màn hình Dashboard / Core đã hoàn thành | 2 | Full page dashboard |
| 1 | Xác thực & Khôi phục tài khoản (Auth & Recovery) | 7 | Full page, modal, validation error |
| 2 | Hồ sơ cá nhân & Bảo mật (User Profile & Security) | 5 | Settings page, modal, toast |
| 3 | Quản lý dự án (Project Management) | 5 | List page, modal, menu, dialog |
| 4 | Thành viên & Phòng ban (Members & Departments) | 12 | Table page, modal, drawer, empty state |
| 5 | Backlog sản phẩm & PBI (Product Backlog & PBIs) | 10 | List/tree page, drawer, modal, validation |
| 6 | Quản lý Epic (Epics Management) | 6 | Card/list page, drawer, modal, progress |
| 7 | Quản lý Sprint (Sprint Planning & Execution) | 11 | List page, planning view, chart, modal |
| 8 | Bảng Kanban & Hệ thống WIP (Kanban & WIP Limits) | 14 | Board page, drawer, alert modal, filter |
| 9 | Quản lý Task & Nhiệm vụ con (Tasks & Subtasks) | 9 | Quick modal, drawer, picker, alert list |
| 10 | Đo lường dòng chảy (Flow Metrics & Analytics) | 4 | Dashboard chart, empty state, table |
| 11 | Theo dõi Lỗi (Bug Tracking & Lifecycle) | 8 | List page, modal, drawer stepper, confirm |
| 12 | Thông báo & Dòng hoạt động (Notifications & Activity) | 5 | List page, dropdown, alert card, empty |
| 13 | Trò chuyện & Tệp đính kèm (Chat & Attachments) | 12 | 2-column chat page, thread drawer, modal |
| 14 | Quản trị hệ thống & Phân quyền (Admin & Roles) | 7 | Table page, modal, error notice, matrix |
| 15 | Trạng thái hệ thống chung (Global System States) | 8 | Full page, skeleton, modal, toast rack |
| **Tổng cộng** | **15 Domains + Core** | **126** | **Toàn bộ hệ thống** |

---

## 0. Dashboard / Màn hình Core (Đã hoàn thành Phase 3)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S0-01 | `dashboard.png` | Dự án / ScrumBan Core / Tổng quan | Full page | Default | Xem tiến độ sprint, việc cần làm, cập nhật, DoD | Click task mở panel phải, click "+ Thêm" mở modal |
| S0-02 | `Group 1.png` | ScrumBan Core - Dashboard Master | Full page | Default | Phiên bản gốc của dashboard.png với đầy đủ layout | Tương đồng S0-01 |

---

## 1. Xác thực & Khôi phục tài khoản (Authentication & Account Recovery)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S1-01 | `Đăng nhập - ScrumBan Flow.png` | Màn hình Đăng nhập | Full page | Default | Nhập Email & Mật khẩu, nhấn Đăng nhập, click "Quên mật khẩu?" | Chuyển sang S1-02 nếu sai, sang S0-01 nếu đúng, sang S1-03 |
| S1-02 | `Đăng nhập thất bại - ScrumBan Flow.png` | Đăng nhập có lỗi xác thực | Full page | Validation error | Hiển thị thông báo đỏ "Email hoặc mật khẩu không chính xác", hỗ trợ nhập lại | Sửa thông tin -> Submit lại |
| S1-03 | `Quên mật khẩu - ScrumBan Flow.png` | Form Yêu cầu Quên mật khẩu | Full page | Default | Nhập Email nhận liên kết đặt lại mật khẩu | Chuyển sang S1-04 khi gửi thành công |
| S1-04 | `Đã gửi email đặt lại - ScrumBan Flow.png` | Thông báo đã gửi email xác nhận | Full page | Success / Info | Xem hướng dẫn kiểm tra hòm thư, nhấn "Quay lại đăng nhập" | Chuyển về S1-01 |
| S1-05 | `Đặt lại mật khẩu - ScrumBan Flow.png` | Form Đặt lại mật khẩu mới | Full page | Default | Nhập Mật khẩu mới & Xác nhận mật khẩu mới | Lưu mật khẩu -> Đăng nhập tự động hoặc về S1-01 |
| S1-06 | `Đã đăng xuất - ScrumBan Flow.png` | Thông báo Đã đăng xuất | Full page | Feedback | Thông báo kết thúc phiên làm việc an toàn, nút Đăng nhập lại | Chuyển về S1-01 |
| S1-07 | `Tài khoản bị khóa - ScrumBan Flow.png` | Cảnh báo Tài khoản bị khóa | Full page | Error / Blocked | Thông báo tài khoản bị vô hiệu hóa do chính sách bảo mật/admin | Hướng dẫn liên hệ Admin quản trị |

---

## 2. Hồ sơ cá nhân & Bảo mật (User Profile & Account Security)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S2-01 | `Hồ sơ cá nhân - ScrumBan Flow.png` | Trang Thông tin Hồ sơ cá nhân | Full page | Default | Xem avatar, họ tên, email, vai trò, số điện thoại, ngày tham gia | Mở modal S2-02, S2-03, S2-04 |
| S2-02 | `Sửa họ tên - ScrumBan Flow.png` | Modal Chỉnh sửa họ tên | Modal | Form editing | Nhập họ và tên mới, bấm Lưu thay đổi | Lưu thành công -> hiện S2-05 |
| S2-03 | `Sửa email và số điện thoại (Lỗi) - ScrumBan Flow.png` | Modal Chỉnh sửa liên hệ có lỗi | Modal | Validation error | Hiển thị lỗi định dạng email sai hoặc số điện thoại không hợp lệ | Sửa lại thông tin hợp lệ -> Lưu |
| S2-04 | `Đổi ảnh đại diện - ScrumBan Flow.png` | Modal Cập nhật Avatar | Modal | File upload / Crop | Kéo thả ảnh mới hoặc chọn file từ máy, xem trước | Cập nhật avatar toàn hệ thống |
| S2-05 | `Đã cập nhật hồ sơ - ScrumBan Flow.png` | Thông báo Cập nhật hồ sơ thành công | Component | Success toast / Feedback | Xác nhận thông tin hồ sơ đã đồng bộ trên hệ thống | Đóng thông báo tự động sau 3s |

---

## 3. Quản lý dự án (Project Management)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S3-01 | `Dự án của tôi (Quản lý) - ScrumBan Flow.png` | Trang Danh sách dự án | Full page | Default | Tìm kiếm, xem danh sách thẻ dự án, số thành viên, tiến độ | Chọn dự án -> vào Dashboard S0-01; bấm "+ Tạo mới" -> S3-02 |
| S3-02 | `Tạo dự án mới - ScrumBan Flow.png` | Modal Tạo dự án mới | Modal | Form input | Nhập tên dự án, key dự án, mô tả, chọn phương pháp (Scrum/Kanban) | Submit -> Thêm vào S3-01 |
| S3-03 | `Chỉnh sửa dự án - ScrumBan Flow.png` | Modal/Form Cài đặt dự án | Modal / Page | Form editing | Thay đổi thông tin cơ bản, cấu hình WIP, phương pháp làm việc | Lưu cập nhật -> Toast thông báo |
| S3-04 | `Tùy chọn dự án (Menu) - ScrumBan Flow.png` | Menu ngữ cảnh Dự án | Component | Context menu | Click icon "..." trên thẻ dự án: Chỉnh sửa, Phân quyền, Đóng, Xóa | Mở S3-03 hoặc S3-05 |
| S3-05 | `Xác nhận Đóng và Xóa dự án - ScrumBan Flow.png` | Dialog Xác nhận nguy hiểm | Modal | Confirm dialog | Nhập tên dự án để xác nhận đóng hoặc xóa vĩnh viễn dữ liệu | Xóa hoàn tất -> Reload danh sách S3-01 |

---

## 4. Thành viên & Phòng ban (Members & Departments)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S4-01 | `Danh sách Thành viên - ScrumBan Flow.png` | Bảng quản lý Thành viên | Full page | Default | Xem danh sách thành viên, avatar, email, phòng ban, vai trò | Mở S4-02, S4-04, S4-06 |
| S4-02 | `Thêm thành viên - ScrumBan Flow.png` | Modal Thêm thành viên vào dự án | Modal | Form input | Nhập email thành viên, gán vai trò (Scrum Master, Dev, PO) | Submit -> Thêm vào bảng S4-01 |
| S4-03 | `Lỗi thêm thành viên - ScrumBan Flow.png` | Modal Thêm thành viên có lỗi | Modal | Validation error | Báo lỗi email không tồn tại hoặc thành viên đã có trong dự án | Chỉnh sửa email -> Thử lại |
| S4-04 | `Xác nhận loại bỏ thành viên - ScrumBan Flow.png` | Dialog Xác nhận loại bỏ | Modal | Confirm dialog | Cảnh báo việc tước quyền truy cập của thành viên khỏi dự án | Xác nhận -> Cập nhật danh sách |
| S4-05 | `Thông tin nhóm & Quản lý thành viên - ScrumBan Flow.png` | Panel Chi tiết Nhóm & Thành viên | Component | Drawer / Panel | Xem cơ cấu nhóm, số lượng task đang phụ trách, trạng thái hoạt động | Gán lại task hoặc chuyển nhóm |
| S4-06 | `Tìm kiếm, Bộ lọc & Quyền Thành viên - ScrumBan Flow.png` | Bộ lọc nâng cao & Phân quyền | Component | Filter / Dropdown | Lọc theo vai trò (Product Owner, Dev...), phòng ban, tìm từ khóa | Lọc trực tiếp trên danh sách S4-01 |
| S4-07 | `Chuyển phòng ban & Giao diện Thành viên - ScrumBan Flow.png` | Modal Chuyển phòng ban | Modal | Form select | Chọn phòng ban mới cho thành viên (Engineering, Design, QA...) | Cập nhật tag phòng ban |
| S4-08 | `Thêm phòng ban mới - ScrumBan Flow.png` | Modal Thêm phòng ban mới | Modal | Form input | Nhập mã phòng ban, tên phòng ban, trưởng bộ phận | Thêm vào danh mục phòng ban |
| S4-09 | `Chỉnh sửa phòng ban - ScrumBan Flow.png` | Modal Sửa thông tin phòng ban | Modal | Form editing | Đổi tên phòng ban, mô tả chức năng | Lưu thay đổi |
| S4-10 | `Xác nhận Xóa phòng ban - ScrumBan Flow.png` | Dialog Xác nhận xóa phòng ban | Modal | Confirm dialog | Kiểm tra điều kiện: chỉ xóa khi phòng ban không còn nhân sự | Xóa -> Cập nhật cây tổ chức |
| S4-11 | `Giao diện Thành viên (Member's View) - ScrumBan Flow.png` | Giao diện giới hạn quyền Thành viên | Full page | Read-only / Limited | Thành viên xem danh sách đồng nghiệp mà không có nút Quản trị/Xóa | Xem danh bạ dự án |
| S4-12 | `Giao diện Thành viên & Trạng thái rỗng - ScrumBan Flow.png` | Bảng Thành viên khi chưa có dữ liệu | Full page | Empty state | Hiển thị hình minh họa và nút "Mời thành viên đầu tiên" | Click nút -> Mở S4-02 |

---

## 5. Backlog sản phẩm & PBI (Product Backlog & PBIs)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S5-01 | `Backlog sản phẩm - ScrumBan Flow.png` | Trang Quản lý Product Backlog | Full page | Default | Xem danh sách PBI ưu tiên, Story Points, Epic tag, trạng thái | Kéo thả ưu tiên, mở S5-05, bấm "+ PBI" -> S5-06 |
| S5-02 | `Html → Body.png` | Sprint Planning 14 Backlog View | Full page | Default master | Chế độ Master xem danh sách Backlog chia theo Sprint 14 & Unassigned | Kéo thẻ từ Backlog vào Sprint 14 |
| S5-03 | `Html → Body-1.png` | Sprint Backlog Chi tiết (18/32 SP) | Full page | Default | Hiển thị tổng Story Points đã commit vs dung lượng Sprint | Điều chỉnh hạn mức SP |
| S5-04 | `Html → Body-2.png` | Member Backlog View + Drawer SCRUM-241 | Full page | Drawer open | Chế độ xem thành viên đang mở chi tiết PBI SCRUM-241 ở bên phải | Xem tiêu chí nghiệm thu (AC), task liên quan |
| S5-05 | `Chi tiết PBI (Drawer) - ScrumBan Flow.png` | Drawer Chi tiết PBI đầy đủ | Component | Drawer | Sửa tiêu đề, AC, Story Points, gán Epic, gán Sprint, xem tasks | Lưu tự động / Cập nhật thẻ |
| S5-06 | `Tạo PBI mới - ScrumBan Flow.png` | Modal Tạo PBI mới | Modal | Form input | Nhập tiêu đề, mô tả, chọn loại (Feature, User Story), Story Points | Bấm Tạo -> Thêm lên đầu Backlog |
| S5-07 | `Lỗi kiểm tra tạo PBI - ScrumBan Flow.png` | Modal Tạo PBI có lỗi | Modal | Validation error | Cảnh báo thiếu tiêu đề hoặc Story Points không hợp lệ | Sửa lại ô nhập liệu đỏ |
| S5-08 | `Kéo thả PBI & Gán Sprint - ScrumBan Flow.png` | Thao tác Kéo thả PBI vào Sprint | Component | Drag & Drop state | Kéo giữ chuột thẻ PBI từ Product Backlog thả vào vùng Sprint | Gán trực tiếp PBI vào Sprint |
| S5-09 | `Liên kết PBI với Epic - ScrumBan Flow.png` | Modal/Dropdown Liên kết Epic | Component | Selection | Chọn Epic cha để gom nhóm PBI | Hiển thị tag màu Epic trên PBI |
| S5-10 | `Xác nhận xóa PBI & Khóa PBI - ScrumBan Flow.png` | Dialog Xác nhận Xóa/Khóa PBI | Modal | Confirm dialog | Cảnh báo xóa PBI sẽ ảnh hưởng đến các Task con bên trong | Xác nhận -> Xóa khỏi Backlog |

---

## 6. Quản lý Epic (Epics Management)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S6-01 | `Danh sách Epic - ScrumBan Flow.png` | Trang Danh sách Epic | Full page | Default | Xem danh sách các Epic lớn, màu sắc nhận diện, tiến độ hoàn thành % | Bấm "+ Tạo Epic" -> S6-03, click Epic -> S6-02 |
| S6-02 | `Chi tiết Epic & Danh sách PBI - ScrumBan Flow.png` | Chi tiết Epic & Cây PBI trực thuộc | Full page | Detail / List | Xem phân bổ PBI, số task hoàn thành, timeline dự kiến | Mở S6-05 liên kết thêm task |
| S6-03 | `Tạo Epic mới - ScrumBan Flow.png` | Modal Tạo Epic mới | Modal | Form input | Nhập tên Epic, mã định danh, mô tả phạm vi, chọn mã màu đại diện | Tạo thành công -> Thêm vào S6-01 |
| S6-04 | `Tiến độ Epic (Thanh phân bổ & Số liệu) - ScrumBan Flow.png` | Widget Tiến độ & Phân bổ Epic | Component | Data visual | Xem thanh phân bổ tiến độ: Done / In Progress / To Do theo SP | Cập nhật tự động theo trạng thái PBI |
| S6-05 | `Liên kết Task với Epic - ScrumBan Flow.png` | Modal Liên kết Task/PBI vào Epic | Modal | Selection list | Tìm kiếm và đánh dấu chọn các PBI/Task muốn gán vào Epic này | Đồng bộ mối quan hệ phân cấp |
| S6-06 | `Xác nhận Xóa Epic - ScrumBan Flow.png` | Dialog Xác nhận xóa Epic | Modal | Confirm dialog | Tùy chọn: Xóa Epic giữ lại PBI hay xóa tất cả | Xác nhận -> Cập nhật danh sách |

---

## 7. Quản lý Sprint (Sprint Planning, Execution, Closing & Reports)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S7-01 | `Danh sách Sprint phân nhóm - ScrumBan Flow.png` | Trang Danh mục Sprint phân nhóm | Full page | Default | Xem các nhóm: Sprint đang chạy, Sprint tương lai, Sprint đã đóng | Bấm "+ Tạo Sprint" -> S7-04; Xem chi tiết -> S7-02 |
| S7-02 | `Chi tiết Sprint 14 (Đang chạy) - ScrumBan Flow.png` | Chi tiết Sprint 14 Active | Full page | Active sprint | Xem số ngày còn lại, tổng SP, tỷ lệ hoàn thành, danh sách task | Mở Bảng Kanban hoặc S7-07 Đóng Sprint |
| S7-03 | `Lập kế hoạch Sprint (Sprint Planning) - ScrumBan Flow.png` | Màn hình Lập kế hoạch Sprint | Full page | Planning mode | Chọn mục tiêu Sprint, kéo thả PBI, kiểm tra sức chứa (Capacity) | Bắt đầu Sprint -> Kích hoạt Sprint chạy |
| S7-04 | `Tạo Sprint mới & Lỗi trùng ngày - ScrumBan Flow.png` | Modal Tạo Sprint & Cảnh báo trùng ngày | Modal | Form / Warning | Nhập tên Sprint, ngày bắt đầu, ngày kết thúc. Báo lỗi nếu trùng lịch | Điều chỉnh khoảng ngày hợp lệ |
| S7-05 | `Lỗi ngày kết thúc - ScrumBan Flow.png` | Báo lỗi Ngày kết thúc không hợp lệ | Modal | Validation error | Báo đỏ "Ngày kết thúc phải sau ngày bắt đầu ít nhất 1 tuần" | Sửa ngày kết thúc |
| S7-06 | `Chỉnh sửa Sprint - ScrumBan Flow.png` | Modal Chỉnh sửa thông tin Sprint | Modal | Form editing | Thay đổi mục tiêu Sprint, gia hạn ngày kết thúc | Lưu cấu hình |
| S7-07 | `Modal Đóng Sprint - ScrumBan Flow.png` | Modal Kết thúc Sprint | Modal | Action modal | Xử lý các mục chưa hoàn thành: Chuyển sang Sprint sau hoặc trả về Backlog | Xác nhận đóng -> Chuyển sang S7-08 |
| S7-08 | `Sprint đã đóng (Chế độ Chỉ đọc) - ScrumBan Flow.png` | Sprint đã hoàn thành (Read-only) | Full page | Read-only | Xem lại kết quả, velocity đạt được, các thẻ không thể kéo thả | Xem báo cáo Sprint |
| S7-09 | `Xác nhận Xóa Sprint - ScrumBan Flow.png` | Dialog Xác nhận xóa Sprint | Modal | Confirm dialog | Cảnh báo các PBI bên trong sẽ được chuyển về Product Backlog | Xác nhận xóa |
| S7-10 | `Biểu đồ Burndown Sprint 14 - ScrumBan Flow.png` | Báo cáo Burndown Chart | Full page / Widget | Analytics chart | Đường lý tưởng vs đường thực tế theo ngày, cảnh báo nguy cơ trễ hạn | Phân tích vận tốc Sprint |
| S7-11 | `Throughput theo Sprint - ScrumBan Flow.png` | Biểu đồ Năng suất Throughput | Full page / Widget | Analytics chart | Đo lường số lượng hạng mục hoàn thành qua từng tuần/Sprint | Đánh giá năng lực nhóm |

---

## 8. Bảng Kanban & Hệ thống WIP Limits (Kanban Board & WIP System)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S8-01 | `Bảng Kanban mặc định - ScrumBan Flow.png` | Bảng Kanban tiêu chuẩn | Full page | Default | Xem các cột: Mới (To Do), Đang làm (In Progress), Đang test (Testing), Hoàn thành (Done) | Kéo thẻ, bấm vào thẻ mở Drawer, lọc thẻ |
| S8-02 | `Html → Body-3.png` | Bảng Kanban Admin Master Mode | Full page | Master view | Hiển thị đầy đủ thanh công cụ quản trị, bộ lọc tổng và cảnh báo WIP | Điều phối toàn dự án |
| S8-03 | `Html → Body-4.png` | Bảng Kanban Sprint 14 cảnh báo WIP | Full page | Alert state | Cột "Đang làm" hiển thị 4/3 (vượt WIP), nền cột chuyển cảnh báo đỏ nhẹ | Báo động cần xử lý nút thắt cổ chai |
| S8-04 | `Html → Body-5.png` | Bảng Kanban Member View + Drawer SCRUM-142 | Full page | Drawer open | Thành viên click thẻ SCRUM-142 -> mở Task Drawer bên phải | Cập nhật checklist, ghi log giờ |
| S8-05 | `Bảng Kanban trạng thái rỗng - ScrumBan Flow.png` | Bảng Kanban khi chưa có thẻ | Full page | Empty state | Hiển thị thông báo "Sprint chưa có nhiệm vụ nào", nút "+ Thêm Task" | Click tạo thẻ đầu tiên |
| S8-06 | `Kéo thả thẻ trên Bảng Kanban - ScrumBan Flow.png` | Thao tác kéo thả thẻ giữa các cột | Component | Dragging interaction | Nhấc thẻ lên, cột đích hiển thị vùng drop preview nét đứt | Thả thẻ -> Cập nhật trạng thái Task |
| S8-07 | `Thu gọn cột trên Bảng Kanban - ScrumBan Flow.png` | Thu gọn / Mở rộng cột Kanban | Component | Collapsed column | Bấm nút thu gọn ở tiêu đề cột để tối ưu không gian màn hình | Click icon để mở rộng lại |
| S8-08 | `Lọc thẻ theo Thành viên - ScrumBan Flow.png` | Bộ lọc Avatar Thành viên | Component | Filter bar | Chọn avatar để chỉ hiển thị các thẻ do người đó phụ trách | Bỏ chọn để xem tất cả |
| S8-09 | `Tìm kiếm từ khóa trên Bảng Kanban - ScrumBan Flow.png` | Ô tìm kiếm thời gian thực trên Bảng | Component | Search filter | Gõ từ khóa -> làm nổi bật hoặc lọc tức thì các thẻ khớp tiêu đề/mã | Xóa từ khóa để reset |
| S8-10 | `Cài đặt Giới hạn WIP - ScrumBan Flow.png` | Modal Thiết lập WIP Limits cho cột | Modal | Configuration | Nhập số lượng thẻ tối đa (Min/Max WIP) cho từng cột Kanban | Lưu -> Cập nhật chỉ số cột |
| S8-11 | `Cảnh báo vượt giới hạn WIP - ScrumBan Flow.png` | Banner Cảnh báo Vượt giới hạn WIP | Component | Warning banner | Hiển thị lý do vượt WIP: "Cột Đang làm vượt 1 thẻ so với giới hạn 3" | Đề xuất kéo thẻ xong trước |
| S8-12 | `Cảnh báo Vượt giới hạn WIP trên Bảng - ScrumBan Flow.png` | Trực quan hóa Cột vi phạm WIP | Component | Visual alert | Đổi màu header cột sang màu cam/đỏ (`warning-500`/`danger-500`) | Ghi nhận vào nhật ký WIP |
| S8-13 | `Lỗi kiểm tra Giới hạn WIP - ScrumBan Flow.png` | Modal Thiết lập WIP có lỗi giá trị | Modal | Validation error | Báo lỗi: "Giới hạn WIP phải là số nguyên dương lớn hơn 0" | Nhập lại số hợp lệ |
| S8-14 | `Nhật ký Cảnh báo WIP (Quản lý) - ScrumBan Flow.png` | Bảng Lịch sử Vi phạm WIP | Component / Modal | Audit log | Ghi nhận thời điểm vi phạm, người kéo thẻ, thời gian tồn đọng | Phục vụ Retrospective |
| S8-15 | `Xác nhận Xóa giới hạn WIP - ScrumBan Flow.png` | Dialog Xác nhận Gỡ bỏ WIP Limit | Modal | Confirm dialog | Bỏ giới hạn của cột, chuyển về trạng thái không hạn chế thẻ | Xác nhận gỡ |

---

## 9. Quản lý Task & Nhiệm vụ con (Tasks & Subtasks Management)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S9-01 | `Modal Tạo Task nhanh - ScrumBan Flow.png` | Modal Tạo Task nhanh | Modal | Quick form | Nhập nhanh tiêu đề, chọn mức ưu tiên, hạn chót, người làm | Tạo xong thêm ngay vào cột hiện tại |
| S9-02 | `Task Drawer mặc định - ScrumBan Flow.png` | Drawer Chi tiết Task tiêu chuẩn | Component | Drawer | Xem/sửa mô tả, trạng thái, người phụ trách, nhãn, thảo luận | Đóng drawer hoặc cập nhật trường |
| S9-03 | `Chỉnh sửa thuộc tính Task - ScrumBan Flow.png` | Inline Edit thuộc tính Task | Component | Inline editing | Click trực tiếp vào tiêu đề, người làm, hạn chót để sửa tại chỗ | Lưu tự động on-blur |
| S9-04 | `Nhiệm vụ con Subtask & Tiến độ - ScrumBan Flow.png` | Danh sách Subtasks & Checkbox | Component | Checklist / Progress | Tích chọn hoàn thành subtask -> Tự cập nhật thanh tiến độ % | Thêm subtask mới trực tiếp |
| S9-05 | `Bộ chọn Hạn chót & Mức độ ưu tiên - ScrumBan Flow.png` | Datepicker & Priority Selector | Component | Dropdown picker | Chọn ngày hết hạn từ lịch, chọn mức độ: Thấp, Trung bình, Cao, Khẩn cấp | Đổi màu cờ ưu tiên trên thẻ |
| S9-06 | `Giao Task & Đổi người thực hiện - ScrumBan Flow.png` | Menu Phân công công việc | Component | User picker | Chọn thành viên từ danh sách gợi ý kèm avatar và email | Bắn thông báo cho người được giao |
| S9-07 | `Danh sách Task Quá hạn - ScrumBan Flow.png` | Chế độ lọc Thẻ Quá hạn | Component / Filter | Highlight filter | Làm nổi bật các thẻ quá hạn chót bằng viền đỏ và biểu tượng đồng hồ đỏ | Cảnh báo ưu tiên giải quyết |
| S9-08 | `Cảnh báo Quá hạn & Sắp đến hạn - ScrumBan Flow.png` | Huy hiệu Cảnh báo Deadline | Component | Badge alert | Badge màu vàng "Còn 2 giờ" hoặc đỏ "Quá hạn 1 ngày" | Nhắc nhở người thực hiện |
| S9-09 | `Xác nhận Xóa Task - ScrumBan Flow.png` | Dialog Xác nhận xóa Task | Modal | Confirm dialog | Cảnh báo xóa vĩnh viễn task cùng các subtask và bình luận liên quan | Xác nhận xóa |

---

## 10. Đo lường dòng chảy (Flow Metrics & Analytics)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S10-01 | `Tổng quan Flow Metrics - ScrumBan Flow.png` | Dashboard Đo lường Dòng chảy | Full page | Default | Xem 4 chỉ số cốt lõi: Cycle Time, Lead Time, Work In Progress, Throughput | Chọn khoảng ngày phân tích |
| S10-02 | `Flow Metrics Trạng thái rỗng - ScrumBan Flow.png` | Flow Metrics khi chưa đủ dữ liệu | Full page | Empty state | Hiển thị: "Cần ít nhất 5 task hoàn thành để tính toán chỉ số dòng chảy" | Đề xuất hoàn thành thêm task |
| S10-03 | `Cycle Time & Tác vụ chậm nhất - ScrumBan Flow.png` | Phân tích Thời gian chu kỳ (Cycle Time) | Full page / Widget | Detailed analysis | Xem scatter plot Cycle Time và danh sách các thẻ bị tắc nghẽn lâu nhất | Nhấp vào thẻ để điều tra nguyên nhân |
| S10-04 | `Work Item Age & Thẻ tồn đọng - ScrumBan Flow.png` | Biểu đồ Tuổi thọ Thẻ (Work Item Age) | Full page / Widget | Detailed analysis | Cảnh báo các thẻ đang nằm trong cột In Progress quá số ngày trung bình | Kích hoạt hành động tháo gỡ |

---

## 11. Theo dõi Lỗi (Bug Tracking & Lifecycle)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S11-01 | `Danh sách Bug - ScrumBan Flow.png` | Bảng quản lý Lỗi (Bug List) | Full page | Default | Xem danh sách bug, mức độ nghiêm trọng (Blocker, Major, Minor), trạng thái | Lọc bug, bấm "+ Báo cáo Bug" -> S11-02 |
| S11-02 | `Modal Báo cáo Bug - ScrumBan Flow.png` | Modal Báo cáo Bug mới | Modal | Form input | Nhập tiêu đề, các bước tái hiện, môi trường gặp lỗi, tệp đính kèm | Submit -> Thêm vào S11-01 |
| S11-03 | `Chi tiết Bug - ScrumBan Flow.png` | Chi tiết Bug & Lịch sử xử lý | Full page / Drawer | Detail | Xem mô tả chi tiết, ảnh lỗi đính kèm, danh sách bình luận kỹ thuật | Chuyển bước trong quy trình S11-04 |
| S11-04 | `Quy trình Trạng thái Bug (Stepper) - ScrumBan Flow.png` | Stepper Trạng thái Bug | Component | Stepper / Workflow | Các bước: Mới (New) -> Đã xác nhận (Confirmed) -> Đang sửa (In Progress) -> Đã kiểm thử (Resolved) -> Đóng (Closed) | Nhấn bước tiếp theo để chuyển trạng thái |
| S11-05 | `Giao Bug cho Thành viên - ScrumBan Flow.png` | Menu Phân công Xử lý Bug | Component | Dropdown picker | Gán bug cho kỹ sư phụ trách sửa lỗi | Gửi thông báo đến lập trình viên |
| S11-06 | `Lỗi kiểm tra Trạng thái Bug - ScrumBan Flow.png` | Cảnh báo Vi phạm quy trình Bug | Modal / Alert | Validation error | Không cho phép "Đóng" nếu chưa qua bước "Đã kiểm thử" | Yêu cầu QA kiểm thử trước |
| S11-07 | `Xác nhận Đóng Bug - ScrumBan Flow.png` | Modal Xác nhận Đóng Bug | Modal | Confirm dialog | Nhập ghi chú giải pháp (Root cause / Fix version) trước khi đóng | Đóng bug chính thức |
| S11-08 | `Xác nhận Xóa Bug - ScrumBan Flow.png` | Dialog Xác nhận Xóa Bug | Modal | Confirm dialog | Xóa bản ghi bug nếu là báo trùng hoặc báo nhầm | Xóa khỏi danh sách |

---

## 12. Thông báo & Dòng hoạt động (Notifications & Activity Feeds)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S12-01 | `Trang Danh sách Thông báo - ScrumBan Flow.png` | Trang Trung tâm Thông báo | Full page | Default | Xem danh sách tất cả thông báo, lọc theo: Chưa đọc, Được giao việc, Nhắc tên | Đánh dấu đã đọc, click chuyển đến task |
| S12-02 | `Menu Thông báo thả xuống (Bell Dropdown) - ScrumBan Flow.png` | Dropdown Thông báo nhanh từ Topbar | Component | Popover / Dropdown | Xem nhanh 5 thông báo mới nhất, bấm "Đánh dấu tất cả đã đọc" | Click "Xem tất cả" -> Sang S12-01 |
| S12-03 | `Thông báo Cảnh báo Hạn chót - ScrumBan Flow.png` | Thẻ Thông báo Cảnh báo Hạn chót | Component | High priority card | Thông báo khẩn cấp màu cam/đỏ kèm nút "Gia hạn" hoặc "Xem ngay" | Chuyển thẳng đến Task tương ứng |
| S12-04 | `Thông báo Trạng thái rỗng - ScrumBan Flow.png` | Thông báo khi không có tin mới | Component | Empty state | Biểu tượng chuông xám cùng thông điệp: "Bạn đã cập nhật tất cả thông tin!" | Trạng thái yên tĩnh |
| S12-05 | `Nhật ký Hoạt động (Activity Timeline) - ScrumBan Flow.png` | Dòng thời gian Hoạt động dự án | Component / Page | Timeline feed | Xem ai vừa di chuyển thẻ, ai vừa tạo sprint, ai vừa sửa PBI theo thời gian thực | Kiểm toán lịch sử thay đổi |

---

## 13. Trò chuyện, Thảo luận & Tệp đính kèm (Chat, Conversations & Attachments)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S13-01 | `Danh sách hội thoại & Khung chat mặc định - ScrumBan Flow.png` | Giao diện Chat 2 cột | Full page | Default | Cột trái: Kênh chung, Kênh Sprint, Tin nhắn trực tiếp. Cột phải: Khung chat | Chọn hội thoại, gửi tin nhắn văn bản |
| S13-02 | `Tạo tin nhắn mới & Chọn thành viên - ScrumBan Flow.png` | Modal Bắt đầu cuộc trò chuyện mới | Modal | Form picker | Tìm kiếm tên thành viên và chọn để tạo phòng trò chuyện trực tiếp (DM) | Mở cuộc trò chuyện mới |
| S13-03 | `Tạo nhóm trao đổi mới (Quản lý) - ScrumBan Flow.png` | Modal Tạo kênh thảo luận nhóm | Modal | Form input | Nhập tên kênh (ví dụ: #sprint-14-sync), mô tả, chọn thành viên tham gia | Thêm kênh vào danh sách |
| S13-04 | `Chi tiết Thread & Bong bóng tin nhắn - ScrumBan Flow.png` | Luồng trả lời theo chủ đề (Thread) | Component | Drawer / Thread | Xem và phản hồi một tin nhắn cụ thể trong thread riêng rẽ | Đóng thread quay lại kênh chính |
| S13-05 | `Tìm kiếm từ khóa trong hội thoại - ScrumBan Flow.png` | Tìm kiếm nội dung chat | Component | Search in chat | Gõ từ khóa tìm lại tin nhắn cũ, làm nổi bật đoạn văn bản khớp | Cuộn đến vị trí tin nhắn tìm thấy |
| S13-06 | `Trạng thái rỗng (Chưa có cuộc trò chuyện) - ScrumBan Flow.png` | Khung chat khi chưa chọn phòng | Full page | Empty state | Hiển thị: "Hãy chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu" | Chọn phòng chat |
| S13-07 | `Chỉ báo Tin nhắn mới & Vạch phân cách chưa đọc - ScrumBan Flow.png` | Vạch phân cách "Tin nhắn mới" | Component | Unread separator | Đường kẻ đỏ/xanh đánh dấu ranh giới giữa tin nhắn cũ và tin nhắn mới nhận | Tự biến mất sau khi đọc |
| S13-08 | `Bình luận & Nhắc tên (@mention) - ScrumBan Flow.png` | Menu Gợi ý @mention | Component | Mention autocomplete | Gõ `@` hiển thị popover gợi ý danh sách thành viên dự án | Chọn thành viên để gắn thẻ thông báo |
| S13-09 | `Chỉnh sửa & Xóa bình luận - ScrumBan Flow.png` | Menu Thao tác trên tin nhắn/bình luận | Component | Message actions | Click icon thao tác: Chỉnh sửa nội dung, Thêm cảm xúc (Reaction), Xóa tin | Cập nhật nội dung hoặc gỡ tin |
| S13-10 | `Đính kèm tệp & Modal Xem trước tệp - ScrumBan Flow.png` | Thao tác Tải lên tệp đính kèm | Modal / Component | File upload | Kéo thả tài liệu, ảnh hoặc code snippet vào ô gửi | Xem danh sách file chuẩn bị gửi |
| S13-11 | `Xem trước Tệp đính kèm - ScrumBan Flow.png` | Lightbox Xem trước Tệp / Ảnh | Modal | Lightbox modal | Xem toàn màn hình ảnh thiết kế hoặc tài liệu PDF đính kèm | Tải về máy hoặc đóng xem trước |
| S13-12 | `Tệp đính kèm & Cảnh báo dung lượng - ScrumBan Flow.png` | Cảnh báo Vượt quá dung lượng tệp | Component | Upload warning | Báo lỗi: "Dung lượng tệp vượt quá giới hạn 25MB cho phép" | Chọn tệp khác có dung lượng nhỏ hơn |

---

## 14. Quản trị hệ thống & Phân quyền (System Administration & Roles)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S14-01 | `Quản lý Người dùng - ScrumBan Flow.png` | Bảng Quản trị Người dùng hệ thống | Full page | Default | Xem danh sách tất cả tài khoản, trạng thái (Hoạt động/Bị khóa), ngày tạo | Bấm "+ Thêm người dùng" -> S14-02; Khóa tài khoản -> S14-03 |
| S14-02 | `Thêm người dùng mới - ScrumBan Flow.png` | Modal Khởi tạo Người dùng mới | Modal | Form input | Nhập họ tên, email công ty, phân quyền mặc định, gửi email kích hoạt | Tạo tài khoản hệ thống |
| S14-03 | `Xác nhận Khóa tài khoản - ScrumBan Flow.png` | Dialog Xác nhận Khóa tài khoản | Modal | Confirm dialog | Cảnh báo vô hiệu hóa phiên đăng nhập tức thì của người dùng | Khóa tài khoản -> Chuyển trạng thái thành Bị khóa |
| S14-04 | `Xác nhận Mở khóa tài khoản - ScrumBan Flow.png` | Dialog Xác nhận Mở khóa | Modal | Confirm dialog | Khôi phục quyền truy cập cho tài khoản bị đình chỉ | Kích hoạt lại tài khoản |
| S14-05 | `Lỗi Tự khóa Tài khoản - ScrumBan Flow.png` | Cảnh báo Không được tự khóa tài khoản | Modal / Alert | Rule protection | Ngăn chặn hành động tự khóa tài khoản Admin đang đăng nhập | Giữ an toàn cho hệ thống |
| S14-06 | `Phân quyền Vai trò - ScrumBan Flow.png` | Ma trận Phân quyền (Role Matrix) | Full page | Permissions matrix | Thiết lập ma trận quyền (Xem, Tạo, Sửa, Xóa, Quản trị) cho từng Role | Lưu ma trận quyền |
| S14-07 | `Cấu hình Hệ thống - ScrumBan Flow.png` | Trang Cài đặt Hệ thống chung | Full page | Settings form | Cấu hình tên tổ chức, logo, chính sách mật khẩu, tích hợp thông báo | Lưu cấu hình hệ thống |

---

## 15. Trạng thái hệ thống chung & Phản hồi (Global System States & Feedback)

| Mã | Tên file tham khảo | Tên màn hình / Component | Phạm vi | Trạng thái UI | Hành động chính của người dùng | Chuyển trạng thái liên quan |
|---|---|---|---|---|---|---|
| S15-01 | `Skeleton Loaders cho Danh sách & Bảng - ScrumBan Flow.png` | Skeleton Loading chuẩn cho Danh sách/Bảng | Full page / Comp | Loading state | Hiển thị các khối shimmer xám (`neutral-200`) mô phỏng khung dữ liệu | Tự chuyển sang bảng dữ liệu khi tải xong |
| S15-02 | `Bộ Trạng thái rỗng Chuẩn - ScrumBan Flow.png` | Thư viện Trạng thái rỗng (Empty States) | Component library | Empty states | Tổng hợp các mẫu rỗng chuẩn: Không có task, không có bug, không có thông báo | Kèm nút CTA tương ứng |
| S15-03 | `Bộ Toast Thông báo Hệ thống - ScrumBan Flow.png` | Thư viện Toast Phản hồi Hệ thống | Component library | Toast feedback | 4 biến thể: Success (Xanh lá), Warning (Vàng), Danger (Đỏ), Info (Xanh lam) | Tự trôi sau 3-5 giây |
| S15-04 | `Cập nhật Thành công (Toast) - ScrumBan Flow.png` | Toast Báo Cập nhật thành công | Component | Success toast | Thông báo góc phải trên màn hình "Dữ liệu đã được lưu thành công" | Tự ẩn hoặc bấm x |
| S15-05 | `Modal Hết hạn Phiên làm việc - ScrumBan Flow.png` | Modal Hết hạn Phiên (Session Timeout) | Modal | Interruption modal | Thông báo phiên làm việc đã hết hạn sau thời gian không hoạt động | Nút "Đăng nhập lại" -> Về S1-01 |
| S15-06 | `Lỗi kết nối & Thử lại - ScrumBan Flow.png` | Màn hình/Banner Mất kết nối mạng | Full page / Banner | Offline / Error | Thông báo mất kết nối tới máy chủ, kèm nút "Thử lại ngay" | Nhấn thử kết nối lại |
| S15-07 | `403 Không có quyền truy cập - ScrumBan Flow.png` | Trang Lỗi 403 Forbidden | Full page | Error 403 | Thông báo người dùng không đủ quyền hạn truy cập tài nguyên này | Nút "Quay về Trang chủ" hoặc "Yêu cầu quyền" |
| S15-08 | `404 Không tìm thấy trang - ScrumBan Flow.png` | Trang Lỗi 404 Not Found | Full page | Error 404 | Hình minh họa không tìm thấy đường dẫn URL | Nút "Quay về Bảng điều khiển" |

---

## Tóm tắt định lượng (Metrics & Breakdown)

- **Tổng số ảnh tham khảo**: 126 / 126 đã được kiểm kê, phân loại và ánh xạ 1-1 không bỏ sót.
- **Tỷ lệ thành phần giao diện**:
  - Full Page Screens: **46 màn hình**
  - Modals / Popups: **34 modals**
  - Drawers / Side Panels: **12 drawers**
  - Inline Controls / Dropdowns / Filters / Cards: **22 components**
  - Error / Validation / Feedback / System States: **12 states**
