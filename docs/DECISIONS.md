# Technical and UI Decisions Log

| Date | Decision | Reason/source | Alternatives considered | Impact |
|---|---|---|---|---|
| 2026-10-18 | Tailwind CSS v4 với @tailwindcss/vite plugin | Dự án mới, TW v4 dùng CSS-first config đơn giản hơn, không cần tailwind.config.js | Tailwind v3 (cần config JS) | Dùng @theme trong CSS thay vì theme object trong JS |
| 2026-10-18 | sass-embedded cho component-specific SCSS | Frontend rules yêu cầu SCSS cho styles phức tạp | CSS modules, styled-components | SCSS chỉ dùng khi Tailwind không đủ |
| 2026-10-18 | react-router-dom với createBrowserRouter | Routing centralized, lazy loading support | Cấu hình routing tự viết | Tất cả routes trong src/app/router/ |
| 2026-10-18 | Path alias @/ → src/ | Tránh relative import sâu nhiều cấp | Không dùng alias | Cấu hình ở tsconfig.app.json + vite.config.ts |
| 2026-10-18 | import.meta.dirname thay vì __dirname | Vite 8 native config loader cảnh báo __dirname deprecated | Dùng __dirname + suppress warning | Tương thích Vite 8+ |
| 2026-10-18 | Font Inter (từ Figma typography) | Design system Figma dùng Inter | System fonts | Tải qua Google Fonts preconnect trong index.html + CSS @import |
| 2026-10-18 | 11 color ramps (0-900) + whiteboard trong @theme | Trích xuất chính xác 100% từ color-primitives.png | Tạo màu nội suy tự do | Đầy đủ 122 mã màu nguyên thủy, truy cập qua class bg/text/border-<family>-<shade> |
| 2026-10-18 | 10 typography styles qua @utility Tailwind v4 | Định nghĩa trực tiếp font-size, line-height, weight, tracking trong CSS utility | Tách rời fontSize và tracking vào theme | Cú pháp gọn: className="text-headline-lg", hỗ trợ variants |
| 2026-10-18 | Phân loại 126 ảnh tham khảo thành 15 miền nghiệp vụ (Phase 2A) | Phân tích toàn diện kho thiết kế design/references/, lập Flow Map và Lộ trình triển khai | Chia nhỏ theo từng ảnh riêng lẻ | Tổ chức code theo Vertical Slice & Feature-oriented architecture |
| 2026-10-18 | Centralized Replaceable SVG Icon System (Phase 2B) | Không cài thêm thư viện ngoài (lucide, react-icons); dùng Registry tập trung ánh xạ 45 stable icon names với currentColor | Dùng thẻ <img> với file svg ngoài (mất khả năng đổi màu Tailwind) hoặc cài lucide-react | 100% components không nhúng <svg> trực tiếp; thay thế bằng asset Figma chỉ tại 1 file duy nhất |
| 2026-10-18 | Triển khai Track 1: Authentication Flow (7/7 màn hình) | Bao phủ 100% 7 ảnh auth trong `design/references/`, tạo layout `AuthLayout` + `AuthCard` tái sử dụng | Gộp form vào modal hoặc nhúng trực tiếp trong AppLayout | 6 route độc lập ở root router không bị vướng sidebar/header; chuẩn Figma 460px card |
| 2026-10-18 | Tách AuthContextDef cho React Fast Refresh | oxlint cảnh báo `react(only-export-components)` khi export cả createContext lẫn Provider | Vô hiệu hóa linter rule | Tách `authContextDef.ts` chứa Context definition, `AuthContext.tsx` chỉ export `AuthProvider` |
| 2026-10-18 | Stateful mock authService với đếm lần thử & khóa tự động | Hỗ trợ đăng nhập thật (`Password123`), đếm số lần sai còn lại (5 lần), tự khóa chuyển sang `/account-locked` | Mock tĩnh không phản hồi trạng thái | Demo tương tác trung thực với ảnh thiết kế `Đăng nhập thất bại` & `Tài khoản bị khóa` |
| 2026-10-18 | Triển khai Track 2: User Profile (5/5 màn hình) | Hỗ trợ inline edit Họ tên (`Sửa họ tên.png`), inline edit & validation lỗi Email/SĐT (`Sửa email.png`), modal đổi avatar kèm crop zoom (`Đổi ảnh đại diện.png`), toast (`Đã cập nhật hồ sơ.png`), và SettingsSidebar | Dùng modal popup cho tất cả hoặc form nguyên khối | Khớp 100% ảnh tham khảo, tương tác mượt mà, đồng bộ state với `useAuth` toàn cục |
| 2026-10-18 | Triển khai Track 3.1: Quản lý Dự án (5/5 màn hình) | Tách biệt route `/projects` (Danh sách dự án của tôi) và `/dashboard` (Tổng quan dự án chi tiết). Xây dựng `CreateProjectModal`, `EditProjectModal`, `DeleteProjectModal` (xác thực gõ tên khớp) và `ProjectActionMenu` | Nhúng trực tiếp toàn bộ form trên 1 trang | Khớp 100% 5 ảnh Figma, quản lý danh sách động với mock projectService, hỗ trợ tab lọc và tìm kiếm thời gian thực |

Rules:
- Record assumptions that affect implementation.
- Distinguish verified Figma requirement from inference.
- Do not ask the user to reconfirm a decision already recorded here unless newer evidence conflicts.
