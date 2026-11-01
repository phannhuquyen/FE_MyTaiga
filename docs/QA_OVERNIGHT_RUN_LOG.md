# QA run log — 2026-10-27

## Stage 0 — environment discovery

- Branch `fix/quyenpn-20261027`, baseline `d63efed`. Existing untracked audit skill preserved. No existing FE source changes.
- Read AGENTS.md, audit skill, React guidance and previous survey in chat.
- FE http://localhost:5173 responds 200. BE http://localhost:5141/api/v1/users/me responds 401 anonymously. Swagger /swagger/v1/swagger.json responds 404; checked-in docs/openapi.json available.
- Actual commands: dev, build, lint, preview. No test framework at baseline.
- Node 22.20.0; registry metadata confirms Vitest 5 supports Vite 8 and RTL 16 supports React 19. jsdom 26 selected for Node compatibility.
- Authenticated live workflows blocked pending supplied test accounts and confirmed safe dev/test dataset. No backend mutations authorized or performed.
- Next: install isolated dev testing dependencies, establish tests, reproduce defects before repairs.

## Stage 1 — test foundation

- Added Vitest 5, RTL 16, jsdom 26 and Playwright 1.64 as dev dependencies. npm reports 0 vulnerabilities; existing framework versions retained.
- Added unit/component config, setup and regression tests for anonymous/loading guards, login logging, rejected settings/task mutations and empty notification/activity responses.
- Added browser config using existing FE server; API fixture interception will isolate browser tests from business data.
- Created QA plan/environment/matrix. Initial regression run started before repairs. Chromium download started.
- Authenticated live role/business checks remain BLOCKED; anonymous read-only checks and frontend mocks proceed independently.

## Stage 2 — API inventory and live anonymous checks

- Generated QA_API_INVENTORY.md and QA_API_EVIDENCE.json with exact definitions, declared DTO fields and direct consumers.
- 124 unique method/path definitions match 124 checked-in OpenAPI operations; no path/method mismatch found. This does not verify live authenticated response data.
- Executed 51 unique GET requests against live BE without credentials. All 51 returned 401. No mutation requests issued to live BE; no response bodies stored.
- Initial 17 regression tests: 8 PASS, 9 FAIL. Reproduced anonymous/loading guard leaks (4 tests), login console payload logging, empty notification/activity retaining demos, rejected task edit changing cache, settings save claiming success.
- Applied focused fixes for these reproduced defects; rerun started. No business rule changes.

## Stage 3 — authentication and permissions

- Added loading and authenticated-user gates in workspace/admin shells; retained existing admin role denial behavior.
- Removed login response logging. Synthetic regression fixtures contain no real token/password.
- Project existence/access gate and session tests next. Live role/permission checks remain BLOCKED awaiting test accounts/environment confirmation.

## Stage 4 — business feature testing and repairs

- First added project/Chat regressions: 7 new failures reproduced before repair (project authorization pending/403/404/500, malformed ID, Chat rejected send/create). Repaired; 26 tests passed.
- Added all 124 API-wrapper mock transport tests against checked-in method/path contract, plus discovery completeness test: 151 tests passed. These use an Axios adapter, never live mutations.
- Added adapters for projects, members/departments, epics, backlog, sprint, bugs, profile, metrics and rejected deletion checks. 164 passed, 2 new failures: sprint remaining item count incorrectly used story points; draft filter sent DRAFT instead of PLANNED. Fixed mappings.
- Browser download completed. Initial premature browser launch failed because headless shell was still downloading (environment setup failure, not app defect). Rerun after install: 46 browser smoke tests passed.
- Added project-access gate, delayed Chat publication until API acceptance, surfaced rejected Chat sends/uploads, removed raw centralized API response logs to avoid leaking sensitive response data.
- Live authenticated business workflows remain BLOCKED. Remaining demo/mock and incomplete feature semantics recorded for final report rather than inventing backend behavior.

### Stage 4 follow-up

- Reproduced and fixed three admin dialogs closing on rejected create/lock/unlock; callbacks now await service results, retain dialog/error, disable submission while pending. 169 tests passed after fixes.
- Reproduced description-only task edits bypassing API and credentials surviving failed post-login profile verification. Added regressions then repaired.
- First build caught optional title passed to required DTO after description-edit fix; resolved by validating cached task before request and retaining its required title.
- No live mutations/accounts/permissions changed. No commit/push/branch change.

### Live test accounts supplied (after midnight, 2026-10-28)

- User supplied three existing test accounts and authorized creating additional sequential test users. Credentials used only as temporary process environment, never written to source/reports.
- Live login worked for all three. user1 has 2 MANAGER projects; user2 has no project; admin is SYSTEM ADMIN with no project membership.
- Live authenticated read-only sweep: 55 PASS, 1 FAIL, 100 BLOCKED account/endpoint cases (no available scoped records). Baseline saved as QA_LIVE_API_BASELINE.json without response bodies or credentials.
- Confirmed API INTEGRATION defect: admin system-config returns an array of configKey/configValue rows, FE expected data.values. Backend controller and entity confirm shape. Regression failed (expected 12, received default 25); updated DTO/adapter and PUT response type (null).
- Comments/attachments rejected deletes now retain UI rows and show failure, verified by failing regression before repair.

## Stage 5 — browser and live integration

- First live browser run: 3 failures at logout URL assertion; all three logins and preceding route reads succeeded. Auth guard race redirected to /login instead of /logged-out. Fixed ordering: navigate to public logout page before clearing session.
- Corrected live config contract recheck: 56 PASS, 0 FAIL, 100 BLOCKED read-only account/endpoint cases (insufficient scoped records).
- User explicitly authorized isolated QA-AUDIT project creation, adding user2 as MEMBER and CRUD only on QA records; retain project for inspection. No changes to existing projects, global roles/config or database setup.
- Next: create isolated dataset via public API, live FE workflows and response validation; keep live and mock evidence separate.

### Stage 5 populated data results

- Created retained QA project ID 3 with QA name, user1 MANAGER and user2 MEMBER. Six live groups passed: project update/departments/member assignment, Epic/PBI UI create/priority/order, Sprint planning/start/progress/burndown/close, Task/subtask/move/WIP, comments/file upload/download/delete, Bug assign/workflow/close/metrics.
- Populated read sweep exposed previously invisible DTO mismatches: Bug detail collections are {items,total}; task summary is not full TaskData; Sprint backlog-items returns progress object; Sprint throughput fields are sprintName/startDate/endDate; Notifications use content/refType/refId and omit actor userId. Fixed exact FE DTOs and consuming adapters after failing regressions/live evidence. Preserve actor placeholder because API lacks actor.
- MEMBER metrics/deadline endpoints return 403 as required by controllers; classified as expected permission denial rather than backend failure.
- Live Chat reproduction: message API returned data.items with messageId/sentAt, FE expected array and chatMessageId/createdAt, resulting in empty message history. Corrected DTO/history/send mapping; live Chat test passed, including participant removal/re-add and mark read within QA room.
- Writing checkpoints into watched docs during browser API operations triggered Vite navigation and destroyed execution context. Moved intermediate checkpoint to ignored node_modules/.tmp, copy final synthetic manifest to docs after closing browser. Bounded retries resolved the test environment issue.
- Notification page memo failed to refresh after service publication. Added revision dependency; regression asserts rendered content (page displays message content, not notification title).
- Prior live run had one test locator strictness failure (nested main landmarks); scoped locator to first main. This was a test defect, not API failure.

## Stage 6 — regression hardening

- Additional browser/live findings reproduced before fixing: stale 401 after logout redirected to login, and an older request could clear a newer session. Interceptor now invalidates only the current matching session; no-token/stale-token responses still reject without redirecting another session.
- Metrics permission failures and failed WIP save no longer return demo success. Initial metrics query no longer invents sprint 14; dropdown uses real project sprint list. Remaining illustrative history/thresholds explicitly labeled.
- Reproduced mock task ID being stripped into a real backend ID; introduced strict numeric resource parsing for Kanban/drawer. Reproduced mock candidate can-001 becoming real user 1; now rejects unsupported demo candidate with explicit message instead of mutating the wrong user.
- Unit transport defaults now reject all unmocked network, preventing accidental requests from unit tests.
- Notification read and mark-all now publish success only after API acceptance; errors preserve unread state and surface in UI. Unsupported mark-unread remains local/demo and is listed as incomplete.
- Final mock browser run before last regression additions: 47 PASS. Live groups previously 9 PASS/1 FAIL on logout race; targeted interceptor regressions now cover both races. Full final reruns pending.
- Added disposable QA-only delete/close tests while retaining main QA project 3. No existing project or global system settings/roles mutated.

### Final verification plan

- Full Vitest suite, full mocked browser suite, all live QA workflows (including MEMBER denied metrics), live response-shape sweep with populated QA data, build and lint.
- Live mutations remain confined to project 3 and explicitly disposable QA-AUDIT resources. Synthetic dataset preserved. No system role/config updates or database commands.
- Final report will keep incomplete/demo feature behavior and unexecuted scenarios visible; endpoint definition coverage is not runtime coverage.

### Logout navigation regression found during full rerun

- Full run exposed a second logout timing case: browser reached /logged-out before the request completed, then an immediate protected navigation could restore the still-stored token. Two additional unit regressions failed before repair.
- Logout now captures bearer credentials for the server request, clears local credentials immediately and awaits the captured request. This preserves server revocation while preventing immediate page reload from restoring the session. Server failure is reported without logging raw error/config objects.
- Subsequent final suite rerun required; earlier passing results are not substituted for this changed code.

### Regression results after logout investigation

- Data-router lazy navigation was the remaining cause: now await public /logged-out navigation before initiating logout. Browser test additionally verifies local credentials are absent before visiting a protected route. All 3 live account flows then passed; full live suite subsequently passed 11/11 including QA disposable close/delete and Chat file upload/download/preview.
- Reproduced 3 additional silent-success paths for subtask creation, comment creation and subtask state change. Service now rejects failures before local mutation; drawer handles failures without discarding input.
- Reproduced detail task status edit never calling board.move. Routed this existing edit action through the centralized board API with regression.
- API OpenAPI route verified live: /openapi/v1.json returned 200. No Swagger UI dependency required.

## Stage 7 — final verification and handoff, 2026-10-28

- Confirmed account-lock mismatch: BE returns 403; FE recognized only legacy 400. Added failing session regression, repaired handling and verified actual account-locked UI on new QA users.
- Final source verification: 195/195 Vitest, 47/47 mock Chromium, 12/12 live Chromium groups; no skipped/flaky cases. Live response sweep: 114 PASS, 0 FAIL, 42 BLOCKED account/endpoint cases. Build PASS; lint exit 0 with 4 baseline warnings; git diff --check PASS.
- A retained dataset exceeding first-page pagination caused PBI visibility setup failure. Test now searches the newly created title through actual UI and retains visible-row assertion. No tests/assertions deleted or disabled.
- New-account probe originally shared admin storage; locked login cleared session and cleanup unlock returned 401. Immediately recovered QA user through independent admin request after ownership check. Harness now uses isolated probe context and independent recovery login in finally. Final unlock/login passed for user3/user4.
- Retained main QA project 3 and synthetic samples; disposable QA resources/projects deleted through API round trips. No existing project changes, global role/config writes, BE source changes or database administration commands.
- Created QA_OVERNIGHT_REPORT.md; refreshed plan/environment/matrix/results. Automated total 254 PASS; sweeps separate because coverage overlaps. Latest logs record 96 wrapper names against 124 definitions; this is limited observation, not full endpoint coverage.
- Full sign-off BLOCKED: remaining demo paths, picker/Chat UI, Sprint business disposition, mailbox/token prerequisites and browser/error/role coverage are listed in final report. Safe independent work in this run completed. No commit/push/branch change.

## Manual FE follow-up — Project So 1 / user2, 2026-10-28

- User explicitly requested adding user2@gmail.com to Project So 1 through FE as user1. Logged in through actual UI; opened project 1 and Members. Initially one member: user1.
- Opened Add Member, entered exact user2 email. Runtime result: 0 candidates, while UI retained an unrelated default selection and enabled Add. Did not submit that unrelated selection; no membership mutation performed.
- STATIC root cause: memberService.getCandidates filters INITIAL_CANDIDATES only, with three demo identities. AddMemberModal defaults searchQuery to a demo email and selectedCandidateId to can-001, retaining selection when search no longer matches. No real user lookup integration in this path.
- Result: FAIL for requested real FE add-member workflow. user2 was NOT added to project 1. This is FRONTEND/API INTEGRATION gap, not evidence that BE rejects valid membership addition. Existing QA-project wrapper mutation tests do not establish this picker UI works.
- Screenshot: test-results/manual/project-so-1-user2-not-found.png (ignored local test artifact). Browser left at exact failing search for review. No FE/BE source edit, branch change, commit or push in this follow-up.

## Requested new user in retained QA project — 2026-10-28

- User requested a new test account and membership in QA-AUDIT project. Matched exact project QA-AUDIT-1793121151062 (ID 3), confirmed user1 MANAGER before writes.
- Created previously unused sequential user5@gmail.com, ID 6, name QA Audit User 5 via admin create API. Added through POST /projects/3/members authenticated as user1, default MEMBER; no promotion/department assignment.
- API read-back verified exact ID/email/MEMBER. Then logged in as user1 through real FE and opened /projects/3/members: 3 members, including QA Audit User 5 / user5@gmail.com / Team Member. PASS for creation/membership persistence and FE list rendering.
- Transparent scope: this was API creation/addition plus FE verification, NOT successful use of the broken Add Member picker. Picker integration gap remains open; no source code repaired in this follow-up.
- Sanitized evidence docs/QA_NEW_MEMBER_RESULT.json; screenshot test-results/manual/qa-project-user5-added.png. Account/project retained; no existing roles/credentials changed, no BE source changes, no commit/push.

## FE-only user5 re-add attempt after user removal — 2026-10-28

- User requested visible FE steps, explicitly no direct-API substitute. Confirmed project 3 currently has only user1/user2. Opened Add Member via actual UI and entered user5@gmail.com; 0 candidates. No membership POST or source change performed.
- Additional STATIC blocker: ProjectMembersController POST accepts userId; GET only queries existing project members. UsersController provides only current-user operations. SystemAdminController GET /admin/users supports email keyword but controller is ADMIN-only. No Manager candidate/email lookup endpoint found in current controller/schema inventory.
- Cannot complete normal email-selection flow as user1 using supported contract. Do not embed admin credentials, elevate user1, hardcode user5, or replace visible workflow with direct membership API. Requires approved BE candidate lookup contract or an explicitly chosen alternate UX accepting known User IDs. BE remains read-only under current project rules.
- Screenshot: test-results/manual/qa-project-user5-ui-blocked.png. Browser left at failing search. user5 remains removed from project; earlier API-add PASS is historical and not a claim of current membership or functioning FE picker.

## 28/10/2026 — Delta API/UI, Giai đoạn 0 hoàn tất
- Đã đọc lại AGENTS.md/skill/báo cáo cũ và báo cáo API update. FE HEAD d63efed, branch fix/quyenpn-20261027; BE HEAD 8fccccb (baseline cũ 70e51d3), BE NuGet.Config untracked giữ nguyên.
- Working tree FE chứa thay đổi có sẵn, gồm Members/Chat/DTO/profile; không hoàn tác hoặc ghi đè. Không commit/push/đổi branch.
- 126 endpoint definitions, 127 OpenAPI operations; 0 path/method mismatch; 52 anonymous GET thực chạy đều 401. Đây là auth-boundary, không phải 126 runtime API PASS.
- Ảnh người dùng chỉ định tồn tại, 1,958,133 byte. Đọc contract Cloudinary/response enrichers/directory; không đọc giá trị secret.
- Build PASS; lint exit 0 với 5 warnings hiện có. Unit/mock browser đang chạy. Rủi ro: stale mock expectations, pagination directory, cloud signed URL, Chat project isolation/reply persistence.
- Kế hoạch và coverage delta: QA_API_UPDATE_PLAN.md, QA_API_UPDATE_MATRIX.md. Tiếp tục inventory/tracing và runtime, không chờ checkpoint xác nhận.

## 28/10/2026 — Delta Giai đoạn 1–2 hoàn tất
- Đối chiếu 126 wrappers/127 operations: không mismatch method/path. Trường bổ sung và route Chat được đưa vào QA_API_UPDATE_MATRIX.md.
- Baseline thực chạy: 199/199 Vitest PASS; 47/47 mock Chromium PASS; build PASS; lint 5 warnings. Live readonly 117 PASS/0 FAIL/42 BLOCKED; không kế thừa số lượng QA cũ.
- Phát hiện qua STATIC và 2 regression tests thất bại: Chat history không map attachments/reply; send vẫn dùng tên demo và có thể append trùng ID đã nhận realtime. Đây là lỗi FE mapping, không phải lỗi API.
- Live directory USER query/trim/empty/pagination/400/403 PASS. Lượt live đầu có lỗi harness: email locator exact không khớp vì cùng span có phòng ban; Epic get truyền sai đối số; nút edit tên thực Lưu thay đổi; avatar có hai nút cùng accessible name. Đã sửa harness, không quy kết các lỗi này cho sản phẩm.
- Task/Chat upload đúng ảnh chỉ định đều HTTP 503. Chưa có cloud URL để xác minh delivery. Không sửa cấu hình BE. Tiếp tục browser UI/DTO và phân loại blocker.

## 28/10/2026 — Delta Giai đoạn 3–4
- USER directory: query/trim/empty/pagination/privacy/400 và admin403 đã PASS runtime. Browser thật thêm user5 (ID6) vào QA project3 trả201; reload thấy MEMBER. Lượt sau xác minh duplicate disabled, không remove/re-add để tăng số test.
- Epic color và Task tags/storyPoints/assignee/epic; comment author/isEditable; board và Activity fields đã PASS trên BE thật (QA records mới).
- Notification user2 actor/reference alias đã PASS runtime, trang FE render được. Đây là kiểm tra shape/aliases và smoke, không phải mọi thông báo có actor được xác minh thủ công.
- Upload đúng PNG: Task503, Chat503; avatar UI user5 cũng503. Phân loại ENVIRONMENT/service dependency; chưa kết luận cấu hình/quota cụ thể vì chưa có bằng chứng. Không sửa BE/secrets. Signed preview/download chưa thể chạy.
- Chat create/send/edit đã chạm BE thật; cần chờ PUT hoàn tất trước reload trong harness và tránh locator trùng sidebar/message. Không coi timeout/assertion harness là BE mất dữ liệu.

## 28/10/2026 — Delta Giai đoạn 5, sửa FE có regression
- 2 tests chat-history-update thất bại trước sửa: history attachments/reply mất, tác giả send demo và append trùng ID. Sửa mapper dùng chung REST/realtime/send và upsert response; thêm metadata DTO tùy chọn tập trung api.ts.
- 1 test chat-image-preview thất bại trước sửa: modal luôn render tài liệu demo và download href=#. Nhánh ảnh nay dùng previewUrl/url thật; download trỏ resource metadata. Giữ phần tài liệu demo khác trong scope hiện có, không tuyên bố PDF đã tích hợp.
- 3 regression mới đã PASS sau sửa. Mock Chromium mới có populated/empty/error cho route /projects/3/chat, kiểm tra loại bỏ phòng project khác/PRIVATE, reply và preview src. Test này không chứng minh cloud delivery thật.
- Build phát hiện TS narrowing ở nhánh fallback của thay đổi mới; đã sửa biểu thức ID fallback, đang chạy xác minh cuối.

## 28/10/2026 — Delta Giai đoạn 5 bổ sung và Giai đoạn 6
- Live đầy đủ chạy 21 nhóm: 16 PASS, 5 runner FAIL. Phân loại 3 upload503 thành BLOCKED phụ thuộc dịch vụ; 2 lỗi FE race đã tái hiện và sửa: duplicate candidate từ cache cũ, room fetch cũ ghi đè kênh vừa tạo.
- Regression room late response thất bại trước sửa → PASS sau sửa; UI Members lấy alreadyInProject từ state members đã tải, không phụ thuộc thứ tự Promise.all/cache.
- Regression avatar demo URL thất bại trước sửa vì service resolve mà không upload. Nay báo lỗi rõ yêu cầu tệp ảnh thay vì toast lưu thành công giả; không tự thêm cơ chế tải URL bên ngoài hay đổi contract BE.
- Các lần phát triển harness (strict locator trùng sidebar/body, thiếu chờ PUT) đã được tách khỏi lỗi sản phẩm. Không bỏ assertion, không skip upload để làm xanh suite. Final delta rerun giữ happy-path assertions; ba ca ảnh503 được báo BLOCKED nghiệp vụ kiểm thử dù runner FAIL.
- Tiếp tục xác minh cuối và tổng hợp QA_API_UPDATE_REPORT.md. Không cần thay đổi dependency. BE vẫn chỉ có NuGet.Config untracked ban đầu.

## 28/10/2026 — Delta Giai đoạn 6 hoàn tất, báo cáo cuối
- Kết quả mới nhất:205/205 Vitest,50/50 Chromium mock,18 live nhóm PASS và3 BLOCKED (upload Task/Chat/avatar HTTP503). Raw full live runner16PASS/5FAIL; focused6/6PASS sau sửa và harness chính xác. Không gọi raw suite toàn bộ PASS.
- Read-only sweep117PASS/0FAIL/42BLOCKED cặp account/endpoint; anonymous52/52 denialPASS. Không cộng những lượt này với suite thành unique endpoint coverage.
- Build cuối PASS, lint exit0 với5 baseline warnings; git diff --check exit0. Branch giữ fix/quyenpn-20261027, không commit/push; BE chỉ còn NuGet.Config untracked vốn có.
- Tổng hợp: QA_API_UPDATE_REPORT.md, QA_API_UPDATE_RESULTS.json, QA_API_UPDATE_MATRIX.md. Report/plan/environment/coverage cũ đã append liên kết mới, giữ lịch sử.6 source files được sửa hẹp;6 test files mới và summary script; không thêm dependencies.
-6 vấn đề FE đã có bằng chứng và sửa:history metadata/reply,canonical sender/dedup,image preview/download resource,late room response race,duplicate member flags race,avatar demo false success. Regression cuối đều PASS; live cloud delivery vẫn chưa chạy được.
- Dừng an toàn tại blocker dịch vụ ảnh503. Cần chủ môi trường kiểm tra readiness/log Cloudinary đã che secret rồi chạy lại3 test ảnh. Không cần cung cấp lại tài khoản. Các thiếu hụt realtime/role-error/malformed/full UI coverage giữ PARTIAL/NOT TESTED trong báo cáo; không tuyên bố hoàn tất toàn bộ FE.

## 29/10/2026 — Project So 1, khảo sát và tích hợp
- Yêu cầu mới đã cho phép triển khai FE và kiểm chứng dữ liệu thật trong Project So 1; không sửa BE/đổi branch/commit/push.
- Live read xác minh project1 ACTIVE, user1 MANAGER, user2 MEMBER. BE HEAD8fccccb không đổi.
- STATIC: Dashboard mock/RAM; Sprint overlap demo2024; Bug Task ID demo; Kanban date/assignee/column chưa persist đúng.3 regression đầu đều FAIL trước sửa và PASS sau sửa.
- Kế hoạch/contract: PROJECT_WORKFLOW_INTEGRATION.md. Tổng quan nay gọi API project/tasks/PBI/bugs/sprints/activity/members/epics; phân biệt Task→Kanban, Story→Backlog+Epic, Bug→Bugs+Task. Read detail/comment từ BE, không tự tạo record liên kết.
- Form Sprint ngày ISO, kiểm tra thứ tự ngày; overlap do BE xác minh. Bug/Task picker nguồn DB. Await mutation và giữ lỗi. Deep link quản lý Task/PBI từ summary. Task assign/deadline/column gọi API thật.
- Lượt browser phát triển đã tạo được Epic/Sprint/Kanban/Bug và API read-back; Backlog lượt đầu lỗi matcher test dùng sai URL product-backlog thay product-backlog-items, không phải BE defect. Một lượt khác bị Vite HMR reload khi đang sửa source; giữ bằng chứng và chạy lại sau khi freeze code. Không coi lỗi harness/HMR là lỗi sản phẩm.
- Focused regression20/20 PASS (persistence+services+drawer), TypeScript đang xác minh. Test live mới sẽ kiểm tra context user2 độc lập. Chỉ tạo/sửa record prefix QA-FE; không xóa hoặc sửa dữ liệu project có sẵn.

## 29/10/2026 — Project So 1, kết quả cuối
- Live read ban đầu: Project1 ACTIVE/user1 MANAGER/user2 MEMBER. Core create/update được thao tác bằng UI, không dùng API wrapper để thay thao tác form. API chỉ read-back/đối chiếu và các request do FE gửi.
-12 nhóm live latest PASS: Epic/Backlog/Sprint/Kanban/Bug create; Dashboard tạo Task/Story/Bug và reload; Task update+user2; update Epic/PBI/Sprint/Bug+user2; Dashboard comment+user2 UI; Sprint planning/link ID+user2; Kanban cột/hạn; Bug assignee user2+user2 UI.
- Full live run cuối9PASS/1 harness locator fail ở Planning (card div, không phải table row). Focused Planning PASS sau sửa locator theo PBI ID; column/hạn và Bug assignee mỗi1PASS. Summary gộp12 unique scenario latest, không cộng lượt lặp và không bỏ assertion.
- Nút Tạo header có callback từ trước, nhưng thiếu listener ở5 feature. Chromium mock tái hiện Backlog FAIL trước sửa; useQuickCreate nối đúng các form,5 route regression đều PASS. Live create dùng chính nút Tạo header sau khi feature sẵn sàng.
- Bug assignee có regression trước sửa FAIL vì cache không chứa detail record; picker/service nay dùng thành viên thật và response BE. Live Bug23 đã giao user2, UI user2 xác minh.
- Unit cuối214/214 PASS; Chromium mock55/55 PASS. Build exit0; lint exit0, còn cảnh báo hooks/script (không coi zero-warning). git diff --check exit0 sau sửa EOF. BE giữ nguyên, chỉ NuGet.Config untracked ban đầu; không đổi branch/commit/push.
- Báo cáo: PROJECT_WORKFLOW_REPORT.md; JSON kết quả PROJECT_WORKFLOW_TEST_RESULTS.json; manifest PROJECT_WORKFLOW_LIVE_RESULTS.json. Prefix QA-FE-1793291834145; Epic29/PBI15/Sprint23/Task38/Bug23; Dashboard Task39/PBI16/Bug24; Task40 cho test cột/hạn. Giữ dữ liệu QA để xem, không xóa record cũ.
- Summary/details/comments/history Dashboard đã lấy BE. PBI comments/DoD/capacity và field thiếu giữ placeholder/disabled/nhãn giới hạn. User2 nhìn thấy sau reload/Làm mới/focus; không claim realtime push đầy đủ. Image503 cũ không được test lại hoặc coi đã sửa ở nhiệm vụ này.

## 01/11/2026 — Sprint popup, Bug status, avatar settings
- Khảo sát: branch fix/quyenpn-20261030, HEAD177ae29, working tree sạch. Đọc AGENTS/skill và source FE/BE; không sửa BE hoặc đổi branch/commit/push.
- Sửa FE: Sprint đọc response.message thay lỗi Axios, popup mặc định7s, close ngay; autoClose có thể tắt. Bug bỏ ràng buộc tuần tự FE, thêm REOPENED đúng contract, chỉ đổi UI sau lưu thành công và giữ dữ liệu chi tiết. Profile thêm route bảo mật/thông báo/dự án/tích hợp; integrations ghi rõ thiếu API.
- Regression: lỗi Sprint/transition và REOPENED được tái hiện FAIL trước sửa. Kết quả cuối npm test220/220; Chromium mock62/62; build PASS; lint exit0 với9 cảnh báo cũ.
- Live: user1 đăng nhập, test Sprint duplicate qua form FE nhận409 message trùng tên, X đóng ngay, form giữ input, GET total không đổi.4 tab profile mở được. Tổng2PASS/1BLOCKED DATA (Playwright skipped: không có Bug QA phù hợp). Không đổi mật khẩu thật. Lượt đầu không có Sprint QA nên skipped; lượt cuối dùng duplicate name của Sprint hiện hữu an toàn, không INSERT.
- BE BugsController.cs145–147 vẫn chặn chuyển trạng thái ngoài workflow. FE tự do lựa chọn không đồng nghĩa database đã cho phép; không báo toàn bộ PASS. Tích hợp cá nhân chưa có API. Báo cáo chi tiết: UI_FOLLOWUP_2026-11-01.md; tiếp tục cần BE cập nhật workflow và Bug QA phù hợp.
