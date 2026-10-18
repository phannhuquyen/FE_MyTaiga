# Project Agent Instructions — React Figma Frontend

## Mục tiêu
Xây dựng frontend React đúng thiết kế Figma hiện có, có tương tác demo bằng state và mock data, kiến trúc dễ đọc, dễ thay mock service bằng API thật sau này.

## Nguồn sự thật
1. Codebase và package versions đang có trong repo.
2. Figma frames, components, variables, typography, assets được đọc bằng Figma MCP hoặc do người dùng cung cấp.
3. `docs/PROJECT_CONTEXT.md`, `docs/FIGMA_DESIGN_SYSTEM.md`, `docs/SCREEN_INVENTORY.md` sau khi đã được kiểm chứng.
4. Prompt hiện tại.

Không tự suy diễn rằng agent đã đọc Figma. Nếu MCP chưa hoạt động, báo rõ giới hạn và dùng screenshot/export do người dùng cung cấp; không bịa ra design tokens hoặc nội dung màn hình.

## Quy tắc không thể tự ý vi phạm
- Giữ React là frontend framework. Ưu tiên TypeScript nếu dự án mới; nếu repo đã dùng JavaScript thì giữ ngôn ngữ hiện tại, không chuyển đổi hàng loạt khi chưa được yêu cầu.
- Tái sử dụng component có API rõ ràng. Không tạo bản sao component chỉ khác màu/kích thước nếu có thể xử lý bằng props/variants.
- Dữ liệu nghiệp vụ demo nằm trong mock data/service, không nhúng đầy đủ mảng dữ liệu trực tiếp trong JSX.
- Không gọi backend/API thật nếu người dùng chưa yêu cầu. Không tạo URL endpoint giả rồi giả định backend tồn tại.
- Các tương tác cần hoạt động bằng React state: mở/đóng modal/drawer, tab, dropdown, filter, search, sort, phân trang, chọn dòng, form, thêm/sửa/xóa demo, toast, confirm và trạng thái loading/empty/error khi phù hợp.
- Dùng CSS variables/token lấy từ Figma cho màu, font, radius, spacing, shadow và các design decisions có sẵn. Không dùng hex/rgb literal trong JSX/Tailwind (ví dụ `bg-[#...]`) nếu token thích hợp tồn tại.
- Không tự đổi phong cách thiết kế của Figma. Mục tiêu là implement độ trung thực cao với Figma; skill design không được phép redesign nếu không có yêu cầu.
- Responsive theo frames Figma. Nếu thiếu breakpoint/screen variant, suy luận bảo thủ, ghi nhận vào `docs/DECISIONS.md`, không hỏi lặp đi lặp lại.
- Không tự cài thư viện lớn hoặc thay version framework/build tools nếu không cần thiết. Kiểm tra `package.json` trước.
- Không sửa/xóa file ngoài phạm vi; không xóa dữ liệu người dùng; không push Git hoặc deploy nếu chưa được yêu cầu.

## Quy trình mặc định
1. Khảo sát repo và kiểm tra lệnh build hiện có.
2. Đọc Figma design context; lập inventory màn hình, tokens, component và interactions.
3. Đưa ra kế hoạch gọn, cập nhật docs.
4. Triển khai theo vertical slice: tokens/layout -> shared UI -> một flow hoàn chỉnh -> màn hình tiếp theo.
5. Chạy lint/typecheck/build và kiểm tra responsive/interaction nếu môi trường hỗ trợ.
6. So sánh screenshot với Figma và sửa sai lệch lớn trước khi làm đẹp chi tiết.
7. Cập nhật `docs/IMPLEMENTATION_STATUS.md` và báo rõ những gì đã/không thể kiểm chứng.

## Hạn chế câu hỏi
Không hỏi lại những gì đã có trong repo, Figma, docs hoặc prompt. Chỉ hỏi nếu thiếu quyền truy cập Figma, thiếu thông tin có thể làm thay đổi kiến trúc, hoặc có mâu thuẫn không thể giải quyết an toàn. Gom các câu hỏi thực sự cần thiết thành một lần, tối đa 3 câu. Với chi tiết nhỏ, chọn phương án đơn giản nhất, nhất quán và ghi vào `docs/DECISIONS.md`.

## Kết thúc mỗi nhiệm vụ
Nêu các file đã tạo/sửa, chức năng demo đã hoạt động, lệnh kiểm thử đã chạy và kết quả, vấn đề còn lại, bước tiếp theo. Không khẳng định đã kiểm tra bằng trình duyệt nếu chưa thực sự chạy.
