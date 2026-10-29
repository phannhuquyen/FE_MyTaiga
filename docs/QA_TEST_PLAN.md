# FE QA test plan

Run deterministic intercepted API fixtures, then live workflows using supplied accounts and explicitly authorized isolated QA records. Initial read-only restrictions were superseded by account/project-data authorization. Existing-account password changes, global role/config writes, seeding and database commands remain outside executed scope.

1. Environment and contract inventory: all endpoint method/path definitions, query/body and consumed DTO fields.
2. Vitest + RTL: guards, loading, denied access, API adapters, rejected mutations, session restore, response edge cases.
3. Playwright Chromium: public routes, anonymous redirects, mocked session restore, every feature route with empty/happy/error API fixtures; no external writes.
4. Reproduce FE defects, retain failing tests, apply focused fixes, rerun affected suites.
5. Final unit/component/browser suites, production build, lint and review Git diff.

Mock tests prove client request/response handling only. Anonymous live checks prove reachability and denial only. Live workflows cover authorized QA records; remaining gaps stay visible in the final matrix.

Final commands: `npm test -- --reporter=json --outputFile=test-results/unit-results.json`, `npm run test:e2e`, `npm run test:live` (temporary local QA_TEST_PASSWORD required), `node scripts/qa-live-readonly.mjs`, `node scripts/qa-results-summary.mjs`, `npm run build`, `npm run lint`, `git diff --check`. Never persist credential values.

## Đợt kiểm thử API/UI cập nhật 28/10/2026
Kế hoạch delta và trình tự thực thi: [QA_API_UPDATE_PLAN.md](QA_API_UPDATE_PLAN.md). Đã chạy các giai đoạn; kết quả mới tại [QA_API_UPDATE_REPORT.md](QA_API_UPDATE_REPORT.md), không dùng số PASS của đợt cũ để ký duyệt code mới.
