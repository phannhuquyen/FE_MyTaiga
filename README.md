# Antigravity React + Figma Vibe Coding Starter Pack

Bộ khởi tạo ngữ cảnh cho agent code frontend React theo Figma, có tương tác local bằng React state, tái sử dụng component và kiểm tra UI trước khi hoàn thành.

## Cách sử dụng

1. Sao lưu repo hiện tại hoặc tạo Git branch mới trước khi để agent chỉnh sửa.
2. Giải nén/copy toàn bộ thư mục trong gói này vào **root của repo frontend**. Nếu repo đã có `AGENTS.md` thì hãy merge nội dung, đừng ghi đè mù quáng.
3. Mở đúng repo đó bằng Antigravity.
4. Kết nối Figma MCP theo hướng dẫn trong `docs/FIGMA_MCP_SETUP.md`.
5. Mở `prompts/00_AUDIT_AND_SETUP.md`, thay `[FIGMA_FILE_OR_FRAME_URL]` bằng link Figma của bạn, rồi gửi cho agent.
6. Xem kết quả audit. Yêu cầu agent điền `docs/FIGMA_DESIGN_SYSTEM.md`, `docs/SCREEN_INVENTORY.md`, `docs/PROJECT_CONTEXT.md` từ dữ liệu thực tế. Không cho code toàn bộ app trước khi xác nhận agent đọc đúng Figma.
7. Khi bắt đầu từng màn hình, dùng `prompts/01_IMPLEMENT_SCREEN.md`; trước khi kết thúc một nhóm màn hình, dùng `prompts/02_VISUAL_QA.md`.

## Nội dung chính

- `AGENTS.md`: quy tắc chung luôn áp dụng cho repo.
- `.agents/rules/frontend.md`: ràng buộc kiến trúc, token, state, responsive và quy trình.
- `.agents/skills/*/SKILL.md`: workflow chuyên biệt mà agent có thể áp dụng.
- `docs/*.md`: tài liệu dự án được điền sau khi kiểm tra Figma và codebase.
- `prompts/*.md`: prompt thực thi cho các giai đoạn.

## Stack mặc định đề xuất

- React + Vite + TypeScript.
- React Router nếu có nhiều route.
- Tailwind CSS cho phần lớn layout/spacing/responsive utilities.
- SCSS cho component styles phức tạp, mixins hoặc styles cần tổ chức theo module; tách pipeline SCSS khỏi file entry Tailwind.
- Dữ liệu demo tập trung trong mock files/services; component dùng `useState` hoặc custom hooks để tương tác.

**Lưu ý Tailwind/SCSS:** Tailwind CSS v4 không được thiết kế để dùng như một preprocessor cùng Sass. Nếu repo chưa khởi tạo và bạn bắt buộc dùng Sass nhiều, agent cần nêu trade-off Tailwind v3 vs v4 trước khi cài. Nếu repo đã có version, không tự upgrade/downgrade. Không dùng `@apply` Tailwind trong SCSS; giữ Tailwind CSS và SCSS ở các file/đường xử lý riêng.
