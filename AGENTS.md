# Project Agent Instructions — React Figma Frontend & Backend Integration

## Mục tiêu
Xây dựng frontend React đúng thiết kế Figma hiện có, có tương tác demo bằng state và mock data, kiến trúc dễ đọc, dễ thay mock service bằng API thật từ Backend `D:\personal\be_taiga\BE-MyTaiga`.

## Nguồn sự thật
1. Codebase và package versions đang có trong repo `d:\personal\MyTaiga`.
2. Mã nguồn Backend tại `D:\personal\be_taiga\BE-MyTaiga` (cổng API mặc định `http://localhost:5141`, vite proxy `/api`).
3. Figma frames, components, variables, typography, assets được đọc bằng Figma MCP hoặc do người dùng cung cấp.
4. `docs/PROJECT_CONTEXT.md`, `docs/FIGMA_DESIGN_SYSTEM.md`, `docs/SCREEN_INVENTORY.md`, `docs/BACKEND_INTEGRATION_RULES.md` sau khi đã được kiểm chứng.
5. Prompt hiện tại.

Không tự suy diễn rằng agent đã đọc Figma. Nếu MCP chưa hoạt động, báo rõ giới hạn và dùng screenshot/export do người dùng cung cấp; không bịa ra design tokens hoặc nội dung màn hình.

## Quy tắc không thể tự ý vi phạm

### 1. Quy tắc Backend & Tích hợp API
- **Tuyệt đối không thay đổi code Backend**: Mọi công việc chỉ diễn ra trên Frontend `d:\personal\MyTaiga`. Không sửa bất kỳ file nào trong `D:\personal\be_taiga\BE-MyTaiga`.
- **Tập trung API vào một file duy nhất**: Mọi endpoint, URL, request/response DTOs, axios client đều được định nghĩa và export tập trung tại `src/services/api.ts` (re-export qua `src/lib/apiClient.ts`). Không tạo axios instance riêng lẻ rải rác trong các thư mục feature.
- **Quy tắc khi có BE mới**:
  1. Đọc và phân tích các controller, routes, DTOs và commit log mới nhất trong `D:\personal\be_taiga\BE-MyTaiga`.
  2. So sánh với các API cũ: Nếu có thay đổi hoặc breaking change thì phải báo cáo ngay và đề xuất hướng cập nhật cho FE.
  3. Liệt kê các API mới đã có thể tích hợp.
  4. Đưa ra kế hoạch triển khai cụ thể theo từng slice.
- **API chưa có trên BE thì FE chưa động tới**: Các tính năng mà BE chưa phát triển API (ví dụ: Kanban kéo thả công việc, Flow Metrics, Bugs, Comments, Chat, Notifications/SignalR) thì FE giữ nguyên mock state/dữ liệu mẫu hiện có, tuyệt đối không động tới hay xóa bỏ.
- **Quy tắc xử lý UI khi BE trả thiếu dữ liệu (Missing Data)**:
  - **Không ẩn các phần tử UI** mà thiết kế Figma yêu cầu nhưng BE chưa trả data.
  - Vẫn hiển thị đầy đủ UI theo Figma, gán giá trị mặc định (default value/placeholder) và hiển thị text mô tả kèm theo (có thể gắn title/tooltip hoặc highlight nhẹ) để sau này nhận diện và hoàn thiện khi BE bổ sung.
  - Tổng hợp danh sách tất cả các trường dữ liệu thiếu vào báo cáo; chưa can thiệp sửa logic FE ở các trường này; khi nào triển khai xong tất cả các API BE sẵn có thì báo cáo tổng thể.

### 2. Quy tắc Frontend & Giao diện
- Giữ React là frontend framework với TypeScript.
- Tái sử dụng component có API rõ ràng. Không tạo bản sao component chỉ khác màu/kích thước nếu có thể xử lý bằng props/variants.
- Dữ liệu nghiệp vụ demo nằm trong mock data/service, không nhúng đầy đủ mảng dữ liệu trực tiếp trong JSX.
- Các tương tác cần hoạt động mượt mà: mở/đóng modal/drawer, tab, dropdown, filter, search, sort, phân trang, chọn dòng, form, thêm/sửa/xóa, toast, confirm và trạng thái loading/empty/error khi phù hợp.
- Dùng CSS variables/token lấy từ Figma cho màu, font, radius, spacing, shadow và các design decisions có sẵn. Không dùng hex/rgb literal trong JSX/Tailwind nếu token thích hợp tồn tại.
- Không tự đổi phong cách thiết kế của Figma.
- Responsive theo frames Figma. Nếu thiếu breakpoint/screen variant, suy luận bảo thủ, ghi nhận vào `docs/DECISIONS.md`.
- Không tự cài thư viện lớn hoặc thay version framework/build tools nếu không cần thiết. Kiểm tra `package.json` trước.
- Không sửa/xóa file ngoài phạm vi; không xóa dữ liệu người dùng; không push Git hoặc deploy nếu chưa được yêu cầu.

## Quy trình mặc định mỗi khi kiểm tra / cập nhật Backend mới
1. Đọc thư mục BE `D:\personal\be_taiga\BE-MyTaiga` (đặc biệt `backend/MyTaigaAPI/Controllers`, `DTOs`, `docs/BACKEND_PROGRESS.md`).
2. So sánh với `src/services/api.ts` và các feature services hiện có của FE.
3. Lập báo cáo gồm:
   - Các API cũ có thay đổi gì không.
   - Các API mới sẵn sàng tích hợp.
   - Bảng tổng hợp các trường data FE cần mà BE đang thiếu kèm phương án fallback/highlight.
   - Các tính năng BE chưa có (FE giữ nguyên).
   - Kế hoạch triển khai theo từng slice.
4. Chờ xác nhận từ người dùng trước khi tiến hành viết code tích hợp.

## Hạn chế câu hỏi
Không hỏi lại những gì đã có trong repo, Figma, docs hoặc prompt. Chỉ hỏi nếu thiếu quyền truy cập, thiếu thông tin có thể làm thay đổi kiến trúc, hoặc có mâu thuẫn không thể giải quyết an toàn. Gom các câu hỏi thực sự cần thiết thành một lần, tối đa 3 câu. Với chi tiết nhỏ, chọn phương án đơn giản nhất, nhất quán và ghi vào `docs/DECISIONS.md`.

## Kết thúc mỗi nhiệm vụ
Nêu các file đã tạo/sửa, chức năng demo/tích hợp đã hoạt động, lệnh kiểm thử đã chạy và kết quả, vấn đề còn lại, bước tiếp theo. Không khẳng định đã kiểm tra bằng trình duyệt nếu chưa thực sự chạy.
