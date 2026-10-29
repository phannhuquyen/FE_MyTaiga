# QA environment

- Run dates: 2026-10-27–28, Asia/Bangkok.
- FE: React 19.2, TypeScript 6, Vite 8; http://localhost:5173.
- API: Axios central client /api/v1; Vite proxies /api and /hubs to http://localhost:5141.
- BE source: D:/personal/be_taiga/BE-MyTaiga, commit 70e51d3. Read-only contract source docs/openapi.json.
- Initially database provenance/accounts were unknown. Later user supplied accounts and authorized isolated QA project/data mutations. No database administration commands were run; localhost alone is not treated as proof of database provenance.
- Browser tests intercept API and hubs before page navigation; fixtures use synthetic identity and records. These are not backend integration tests.
- Credentials and tokens must remain out of reports, traces and console. Browser tracing/screenshots disabled by default.

## Runtime access established

- Backend live Development endpoint `/openapi/v1.json` is the application OpenAPI route (Swagger UI is not configured).
- Three supplied test accounts used via temporary QA_TEST_PASSWORD process environment. No secrets are written in repository files.
- User authorized isolated QA project creation/member association/CRUD after initial read-only phase. Main retained project ID 3; all QA mutation tests confined to owned records or explicitly disposable QA-AUDIT projects.
- Separate Playwright output folders: test-results/mock and test-results/live. Synthetic dataset checkpoints go under node_modules/.tmp during browser execution to avoid watched-document reloads; final manifest copied to docs/QA_TEST_DATASET.json.
- Registration/admin creation retained user3 (ID 4) and user4 (ID 5). Lock/unlock affected only these new QA users; final unlock/login checks passed. Existing supplied accounts and global roles/config were unchanged.

## Môi trường delta 28/10/2026
BE HEAD8fccccb, FE branch fix/quyenpn-20261027 HEADd63efed + working tree hiện có. Không nâng dependency hoặc sửa BE. Live directory hoạt động; Task/Chat/avatar image upload đúng PNG người dùng chỉ định trả503. Signed delivery chưa được xác minh. Report delta: QA_API_UPDATE_REPORT.md.
