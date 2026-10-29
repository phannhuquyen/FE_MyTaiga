# Project workflow integration — 29/10/2026

Người dùng yêu cầu tích hợp và sửa trực tiếp FE: user1 / Project So 1; user2 thấy dữ liệu sau create/update. Giữ branch/working tree hiện có, không sửa BE.

BE HEAD8fccccb không đổi. API cần thiết đã ở src/services/api.ts: projects.get, tasks.list/create/get/update, productBacklog.list/create/get/update, epics, sprints/progress, bugs, comments Task, activityLogs. Không đổi public contract.

STATIC trước sửa: Tổng quan hook/service hoàn toàn mock, create chỉ ghi RAM; Sprint dùng overlap Sprint14 năm2024 và so sánh chuỗi dd/MM/yyyy; Bug chọn task-241/239/201 mẫu và fallback ID1; Kanban parse deadline dd/MM/yyyy bằng new Date, assignee không gửi ID, cột tạo không persist. Epic service có API, cần browser kiểm chứng để không quy kết từ triệu chứng.

Story trên UI tương ứng PBI, BE yêu cầu Epic; Bug BE yêu cầu Task. Phải cho chọn liên kết thật, không tự tạo Epic/Task hoặc mặc định ID. Comments chỉ có API Task; DoD/giờ ước lượng chưa có contract phải có placeholder rõ.

Kế hoạch: regression trước sửa → dữ liệu Tổng quan/details/history từ API → form thật/await/error → browser tạo và cập nhật prefix QA-FE trong Project So 1, không sửa/xóa record cũ → user2 context độc lập kiểm tra sau reload → test/build/lint/report. Xác minh persistence bằng GET từ BE/account độc lập, không tuyên bố đã truy vấn SQL trực tiếp.

## Kết quả triển khai 29/10/2026
Đã hoàn thành các luồng kiểm chứng trong [PROJECT_WORKFLOW_REPORT.md](PROJECT_WORKFLOW_REPORT.md):214 unit,55 mock browser,12 live scenario latest PASS. Phát hiện thêm khi thực thi: header Create thiếu feature listeners; Bug assignment picker/cache chưa phản ánh response. Đã sửa cùng regression trước/sau. Chỉ ký duyệt scope create/update/read/comment/planning/sharing đã chạy; chưa ký duyệt mọi feature/error/optional field.
