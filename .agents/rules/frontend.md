# Frontend implementation rules

- Component UI thuần trình bày nên nhận dữ liệu/callback qua props; không tự quản lý nghiệp vụ từ nhiều nơi.
- Dùng `useState` cho UI state cục bộ. Dùng custom hooks cho state logic có khả năng tái sử dụng; nếu một flow có nhiều transition phụ thuộc nhau, cân nhắc `useReducer` nhưng không thêm global state library khi chưa cần.
- Trạng thái được chia sẻ giữa routes phải có chủ sở hữu rõ ràng: route/layout context hoặc service/hook phù hợp. Không nhân bản state không đồng bộ giữa các component.
- Dữ liệu ban đầu lưu trong `features/<feature>/mocks/` hoặc `src/mocks/`. Logic giả lập lưu trong `services/mock*.ts`. Components gọi service abstraction thay vì tự chứa mock data.
- Chuẩn bị service để sau này thay bằng API: input/output có type, tránh để UI phụ thuộc vào cấu trúc mock nội bộ.
- Không dùng `window.alert` cho UI chính; tái sử dụng Toast, ConfirmDialog, Modal.
- Dùng semantic HTML, label đúng cho form, keyboard focus visible và trạng thái disabled/loading rõ ràng.
- Không tạo class name hoặc CSS token mới tùy tiện nếu hệ thống token đã có.
- Ưu tiên Tailwind cho layout/spacing/flex/grid/responsive. SCSS chỉ cho style phức tạp/component-specific; không lặp lại toàn bộ hệ style trong cả Tailwind lẫn SCSS.
- Không đưa Tailwind directives vào SCSS. Không dùng Tailwind `@apply` trong SCSS. Đọc version Tailwind hiện có trước khi chọn cách cấu hình.
- Tạo component dùng chung khi có ít nhất hai use case hợp lý hoặc có vai trò nền tảng (Button, Input, Modal, Table, Badge, Avatar, Toast...). Tránh abstraction quá sớm.
- Không viết một component/page khổng lồ. Chia page shell, feature component, reusable UI và mock service khi chúng có trách nhiệm riêng.
- Không dùng emoji thay cho icon sản phẩm nếu Figma hoặc icon library đã xác định.
- Không thêm hiệu ứng, gradient, shadow hoặc animation không có căn cứ từ Figma.
