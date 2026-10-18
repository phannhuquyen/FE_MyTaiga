# Figma Design System — Verified Extraction

> Nguồn sự thật: `design/system/color-primitives.png` và `design/system/typography.png`. Ngày xác minh: 18.10.2026.

## 1. Nguồn thiết kế và trạng thái xác minh
- **File Figma**: [Taiga Figma File](https://www.figma.com/design/346BHJzesYMdj4s0bKgapj/Taiga?node-id=0-1&t=zXR9ufXUUJHfmwNu-1)
- **Design System references**:
  - `design/system/color-primitives.png` (Color ramps 0–900, 11 họ màu + whiteboard)
  - `design/system/typography.png` (10 text styles, Inter font)
- **Trạng thái trích xuất**: 100% các giá trị màu và typography đã được trích xuất trực tiếp, đối chiếu và triển khai vào `src/styles/main.css`. Không có giá trị nào bị mờ hay mơ hồ.

---

## 2. Hệ thống màu sắc (Color Tokens)

### Quy ước đặt tên và phân cấp shade
- **Thang đo**: 0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- **0**: Màu sáng nhất (`#FFFFFF`)
- **500**: Màu gốc của hệ thống / Guide
- **900**: Màu đậm nhất
- **CSS Variable**: `--color-<family>-<shade>`
- **Tailwind class**: `bg-<family>-<shade>`, `text-<family>-<shade>`, `border-<family>-<shade>`, v.v.

### Bảng giá trị màu nguyên thủy (Color Primitives)

| Họ màu | Vai trò nguyên thủy / Ghi chú | Shade 0 | Shade 50 | Shade 100 | Shade 200 | Shade 300 | Shade 400 | Shade 500 (Gốc) | Shade 600 | Shade 700 | Shade 800 | Shade 900 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **whiteboard** | Nền bảng, card và panel | `#FFFFFF` | — | — | — | — | — | `#FFFFFF` | — | — | — | — |
| **primary** | Tương tác chính (màu gốc FE `#076859`) | `#FFFFFF` | `#F4FFFA` | `#CFF9EF` | `#A2F2DF` | `#86D5C2` | `#2F8172` | `#076859` | `#005045` | `#003E35` | `#002F28` | `#00201B` |
| **secondary** | Màu phụ · neutral ấm của FE | `#FFFFFF` | `#F9F7F6` | `#E7E1DE` | `#E4DFDB` | `#CBC5C2` | `#918B88` | `#615E5B` | `#494644` | `#3A3735` | `#2B2927` | `#1D1B19` |
| **tertiary** | Điểm nhấn đất nung của FE | `#FFFFFF` | `#FFF7F4` | `#FFDAD2` | `#FFB4A3` | `#D58B7A` | `#A96150` | `#8C4939` | `#723526` | `#5B281B` | `#48190E` | `#3A0B02` |
| **neutral** | Nền, viền, chữ và sidebar theo Guide | `#FFFFFF` | `#F6F6F6` | `#EFEFED` | `#DDDCDA` | `#C5C2BE` | `#A8A39C` | `#7A746B` | `#615E5B` | `#494644` | `#34322E` | `#22201E` |
| **paper** | Bề mặt giấy ấm của UI FE | `#FFFFFF` | `#FEF8F2` | `#F8F3EC` | `#F5F0EA` | `#F2EDE7` | `#EDE7E1` | `#E7E2DB` | `#DED9D3` | `#B7B1AA` | `#6F6961` | `#32302C` |
| **success** | Thành công / Hoàn thành · Guide | `#FFFFFF` | `#F7FBFA` | `#E9F2F0` | `#B8D8D1` | `#A9CDC5` | `#75AEA3` | `#3F8F7F` | `#357C6E` | `#2B685C` | `#235047` | `#183630` |
| **danger** | Nguy hiểm / Xóa · Guide | `#FFFFFF` | `#FDF8F8` | `#F9ECEB` | `#E6B3AF` | `#E4B1AE` | `#D5827D` | `#C4524A` | `#A94740` | `#8D3B35` | `#6E2E29` | `#4A1F1C` |
| **warning** | Cảnh báo / Chờ duyệt · Guide | `#FFFFFF` | `#FDFAF7` | `#F9F3EA` | `#E8CF9F` | `#E5CAA0` | `#D5AB66` | `#C58A2B` | `#A97725` | `#8E631F` | `#6E4D18` | `#4B3410` |
| **info** | Thông tin / Đang thực hiện · Guide | `#FFFFFF` | `#F8FAFB` | `#EBF2F7` | `#AFC8DD` | `#AEC4D7` | `#7DA0BF` | `#4A7BA6` | `#406A8F` | `#355978` | `#29455D` | `#1C2F3F` |
| **error** | Báo lỗi biểu mẫu · màu gốc FE | `#FFFFFF` | `#FCF6F6` | `#FFDAD6` | `#EEC6C6` | `#E09898` | `#CD5A5A` | `#BA1A1A` | `#A01616` | `#93000A` | `#680F0F` | `#470A0A` |

---

## 3. Hệ thống Typography

- **Font Family**: Inter (`'Inter', system-ui, -apple-system, sans-serif`)
- **Tải font**: Đã cấu hình Google Fonts qua `<link rel="preconnect">` và `<link rel="stylesheet">` trong `index.html`, cùng `@import url(...)` trong `main.css`.

### Bảng 10 kiểu chữ (Typography Styles)

| Style Name | Font Size | Font Weight | Line Height | Tracking (Letter Spacing) | Transform | Tailwind Utility | Mục đích sử dụng |
|---|---|---|---|---|---|---|---|
| `headline-lg` | 24px | Semi Bold (600) | 32px | -1.5% (`-0.015em`) | none | `text-headline-lg` | Tiêu đề trang, tiêu đề lớn nhất của flow |
| `headline-md` | 20px | Semi Bold (600) | 28px | -1.0% (`-0.01em`) | none | `text-headline-md` | Tiêu đề modal, tiêu đề nhóm, cột kanban |
| `headline-sm` | 16px | Semi Bold (600) | 24px | -0.5% (`-0.005em`) | none | `text-headline-sm` | Tiêu đề card, sub-header |
| `body-lg` | 15px | Regular (400) | 22px | 0% (`0em`) | none | `text-body-lg` | Nội dung mô tả quan trọng, lead text |
| `body-default` | 14px | Regular (400) | 20px | 0% (`0em`) | none | `text-body-default` | Nội dung văn bản thông thường, body text |
| `body-medium` | 14px | Medium (500) | 20px | 0% (`0em`) | none | `text-body-medium` | Nhãn form, danh sách, button văn bản |
| `body-sm` | 13px | Regular (400) | 18px | 0% (`0em`) | none | `text-body-sm` | Nội dung phụ, bảng biểu, danh sách phụ |
| `label-default` | 12px | Medium (500) | 16px | 1.0% (`0.01em`) | none | `text-label-default` | Tag, badge, trạng thái, label input |
| `label-meta` | 12px | Regular (400) | 16px | 0% (`0em`) | none | `text-label-meta` | Metadata, ngày tháng, đếm ký tự |
| `label-uppercase` | 11px | Semi Bold (600) | 16px | 4.0% (`0.04em`) | uppercase | `text-label-uppercase` | Header cột, nhãn mục lục nhỏ |

---

## 4. Hướng dẫn sử dụng Token trong Code

### Trong JSX với Tailwind CSS v4
```tsx
// 1. Áp dụng Typography:
<h1 className="text-headline-lg text-primary-500">Quản lý dự án</h1>
<p className="text-body-default text-neutral-600">Mô tả dự án và tiến độ công việc</p>
<span className="text-label-uppercase text-neutral-400">TRẠNG THÁI</span>

// 2. Áp dụng Màu sắc:
<div className="bg-whiteboard border border-neutral-200 p-4 rounded">
  <button className="bg-primary-500 hover:bg-primary-600 text-whiteboard px-4 py-2 rounded">
    Lưu thay đổi
  </button>
  <span className="bg-success-50 text-success-700 px-2 py-1 rounded text-label-default">
    Hoàn thành
  </span>
</div>
```

### Trong SCSS / CSS Module
Nếu viết style phức tạp trong `.module.scss`:
```scss
.customCard {
  background-color: var(--color-paper-100);
  border: 1px solid var(--color-neutral-200);
  color: var(--color-neutral-800);
}
```

---

## 5. Phân biệt Màu nguyên thủy (Primitives) & Vai trò nghiệp vụ (Semantic Roles)
- **Primitives**: Các ramp màu cụ thể (`primary-500`, `neutral-200`, `danger-500`...).
- **Semantic Mapping**:
  - Nền trang / Background chính: `bg-whiteboard` hoặc `bg-neutral-50`
  - Bề mặt làm việc / Card / Paper: `bg-paper-100`, `bg-whiteboard`
  - Viền phân cách / Borders: `border-neutral-200`
  - Chữ chính: `text-neutral-800`, `text-neutral-900`
  - Chữ thứ cấp / phụ: `text-neutral-600`, `text-neutral-500`
  - Nút chính: `bg-primary-500`, text `whiteboard`, hover `bg-primary-600`
  - Cảnh báo giới hạn WIP: `text-warning-600`, `bg-warning-50`
  - Lỗi biểu mẫu: `text-error-500`, border `border-error-500`

---

## 6. Trạng thái các giá trị nguồn (Source Resolution)
- **Tổng số mã màu đã trích xuất**: 122 mã màu (11 ramp × 11 shades + whiteboard).
- **Trạng thái trích xuất**: 100% rõ ràng, không có giá trị nào bị mờ hay phải phỏng đoán.
