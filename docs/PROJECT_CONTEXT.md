# Project Context

## Product
- Tên sản phẩm: MyTaiga (ScrumBan Flow)
- Mục tiêu chính: Hệ thống quản lý dự án Agile kết hợp Scrum & Kanban
- Người dùng/roles: Admin hệ thống, Quản lý dự án, Thành viên nhóm
- Ngôn ngữ UI: Tiếng Việt

## Frontend stack installed
- React: 19.2.8
- Vite: 8.3.x
- Language: TypeScript 6.0.x
- Routing: react-router-dom (latest)
- Tailwind CSS: v4 (via @tailwindcss/vite plugin, CSS-first config)
- Sass: sass-embedded (for component-specific SCSS when needed)
- Linter: oxlint 1.81.x
- Form/validation: none (sẽ dùng React state + custom validation)
- Icon library: chưa xác định (sẽ lấy từ Figma)
- Existing component library: none (tự build shared components)
- Commands: dev, build, lint, preview

## Scope for the current phase
- Frontend only: yes
- Backend integration: no, use local mock services
- Required interactions: forms, filters, modals, navigation and all visible controls must work locally
- Use React state: `useState` for local interactive states; reusable hooks for repeated state logic
- Persistence: none

## Confirmed decisions
- Implement existing Figma design; do not redesign.
- Reuse Figma variables and assets, do not hard-code token values in component markup.
- Reusable components and feature-based architecture.
- Tailwind CSS v4 with CSS-first @theme config; no tailwind.config.js.
- Sass only for complex component-specific styles; Tailwind for layout/spacing/responsive.
- Path alias @/ mapped to src/.
- Minimize clarifying questions; infer low-risk details consistently and document them.

## Open questions / decisions
- Figma MCP chưa được verify — cần screenshot/export thủ công hoặc kết nối MCP.
- Icon library chưa chốt — chờ xác minh từ Figma assets.
