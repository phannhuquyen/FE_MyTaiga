# QA coverage matrix — final checkpoint 2026-10-28

Full FE sign-off: **BLOCKED**. All executed final assertions passed; full feature scope remains PARTIAL. Inventory has 124 endpoint definitions, not 124 runtime-validated endpoints. Field-level method/URL/DTO/consumer inventory: [QA_API_INVENTORY.md](QA_API_INVENTORY.md). Individual cases: [QA_TEST_RESULTS.json](QA_TEST_RESULTS.json).

| Layer | Cases | PASS | FAIL | BLOCKED |
|---|---:|---:|---:|---:|
| Vitest unit/component/mock transport | 195 | 195 | 0 | 0 |
| Chromium intercepted-API browser | 47 | 47 | 0 | 0 |
| Chromium live workflow groups | 12 | 12 | 0 | 0 |
| Authenticated API sweep, including login | 156 attempted | 114 | 0 | 42 |
| Anonymous GET boundaries | 51 | 51 | 0 | 0 |

Counts across layers overlap; do not add them as unique business scenarios/endpoints. Latest sweep/dataset logs record 96 wrapper names, including expected denials. Earlier one-time creation/UI calls are not exhaustively recorded by these two logs.

| Function | API/data fields checked | Executed evidence | Full feature status | Remaining gap |
|---|---|---|---|---|
| Auth/public routes | accessToken, users/me identity/roles, 401, locked 403 | 3 live login/read/logout/protected URL groups; session regressions; new QA account lock screen | PARTIAL | Actual expiry, email delivery, reset/change password |
| Workspace/admin/project guards | pending/null user, safe project ID/access | Pending/anonymous/role tests; project GET denial; live protected URL | PARTIAL | Complete cross-role resource matrix |
| Projects | list/get/create/update/close/delete, nullable fields | Main QA project 3; disposable close/delete; adapter tests | PARTIAL | Full form/error UI matrix |
| Members/departments | IDs/roles, nullable department/count | Add user2; department create/update/assign/unassign/delete | PARTIAL | Real member picker incomplete; promotion not run |
| Epics/backlog | status/priority/progress, PBI fields/order | Epic create/delete; actual UI PBI create/search; API update/priority/order | PARTIAL | All link/unlink/delete and drag/sort UX |
| Sprints | PLANNED query, progress totals/completedPbis, sprintName/startDate/endDate | Planning/start/progress/burndown/close; disposable delete | PARTIAL | Incomplete-work disposition needs contract/business confirmation; UI stubs |
| Kanban/tasks | strict numeric IDs, title/description/status, deadline/priority/progress/WIP | Live task/subtask/move/WIP; rejected writes and drawer tests | PARTIAL | Mock assignee identities; drag/keyboard/mobile |
| Comments/files | taskId, comment collection, attachment bytes | Create/update/delete comment; upload/download/delete file; rejected UI deletes | PARTIAL | Invalid MIME/size/timeout UI variants |
| Bugs | nested task summary, collections items/total | Assign/status/close/disposable delete; populated DTO sweep | PARTIAL | Full edit/error/permission UI matrix |
| Flow metrics | actual sprint list, throughput fields, WIP/age, 403 | Manager reads, member denial; initial query/error tests | PARTIAL | Some history/thresholds/controls still illustrative |
| Notifications/activity | content/refType/refId, null content, missing actor | Populated reads; empty/async-refresh/rejected read tests | PARTIAL | Live mark-read/all; unsupported mark-unread; project context |
| Chat | items/messageId/sentAt, hasMore/nextBefore, participant/attachment IDs | Room/message/read/participants; file download/preview; adapters | PARTIAL | UI project/member source; DM/edit/delete/reactions demo; realtime |
| Admin users | list/create, lock/unlock, locked login | Register/admin-create new QA users; lock/unlock/login; modal errors | PARTIAL | Global role changes deliberately not run |
| Admin settings/roles | configKey/configValue rows, null PUT data | Live GET; adapter/rejected-save tests | PARTIAL | Global config write not run; partial settings; permissions demo |
| Dashboard | local fixture models | Mock browser smoke | PARTIAL — demo | No backend integration claim |
| All feature routes | empty/error/loading | 34 intercepted cases over 17 routes, 47 mock browser total | PARTIAL | Smoke assertions do not prove every form/control |

42 BLOCKED cases are account/endpoint combinations lacking scoped membership/data, not 42 unique broken APIs. Full HTTP error matrix is tested centrally with mocks, not independently live for every feature. See final report for decisions and unverified response fields.

## Coverage cho API/UI cập nhật 28/10/2026
Xem [ma trận delta](QA_API_UPDATE_MATRIX.md) và [báo cáo delta](QA_API_UPDATE_REPORT.md). Các trạng thái lịch sử trên không tự động phản ánh code hiện tại. Delta matrix14 dòng:6 PASS,4 PARTIAL,4 BLOCKED (gồm migration ngoài quyền); test scenario count được ghi riêng, không đồng nhất dòng matrix với test count.

## Project So 1 — 29/10/2026
Xem [PROJECT_WORKFLOW_REPORT.md](PROJECT_WORKFLOW_REPORT.md) và PROJECT_WORKFLOW_TEST_RESULTS.json:12 nhóm live create/update/read/comment/planning/assignment và user2 visibility PASS. Header-create regression5 route PASS. Status chỉ áp dụng các scenario đó; field không có BE, toàn bộ error/role matrix và realtime đầy đủ vẫn PARTIAL/NOT TESTED. Không kế thừa PASS từ báo cáo cũ.
