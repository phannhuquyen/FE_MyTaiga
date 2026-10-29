---
name: fe-api-integration-audit
description: "Audit a frontend end to end as a QA Lead and Senior Frontend Engineer: inventory routes and API data usage, build coverage, reproduce and classify failures, safely repair confirmed frontend defects, add regression tests, and report verified evidence. Use for frontend API-integration audits, broad regression checks, or evidence-based FE debugging; do not use for ordinary feature implementation with no audit scope."
---

# FE API Integration Audit

Audit before editing. Base every conclusion on repository evidence, runtime output, network behavior, or an executed test. Preserve the user's code and authorization boundaries throughout.

## Operating boundaries

- Read and obey every applicable `AGENTS.md`, starting at the workspace root and continuing into directories in scope.
- Do not modify backend code, databases, fixtures owned by the backend, or external environments unless the user explicitly authorizes that exact change.
- Do not infer missing business rules. Record the ambiguity as `BLOCKED` and ask the user when the answer changes behavior, data semantics, permissions, or architecture.
- Do not delete, reset, overwrite, reformat, or silently absorb pre-existing changes. Inspect Git state first and keep unrelated work intact.
- Do not claim `PASS`, browser verification, API verification, or regression coverage unless the stated command or interaction actually ran successfully.
- Do not begin repairs until discovery and coverage analysis identify a reproducible or strongly evidenced frontend defect.
- If the request is review or diagnosis only, stop before code changes and provide the proposed repair plan. Otherwise, confirmed low-risk FE repairs and their regression tests are in scope.
- Ask before a high-risk change: public contract changes, auth/security behavior, destructive migrations, broad dependency upgrades, major architectural rewrites, or changes whose correct business behavior is unresolved.

## Evidence model

Label important findings with the strongest evidence available:

- `STATIC`: traced from source, configuration, types, or generated clients.
- `TEST`: reproduced by an automated test with command and result.
- `RUNTIME`: observed in a running app, browser console, or network trace.
- `API`: observed from an actual backend response or authoritative API schema/controller.
- `INFERRED`: plausible but unverified; never use this alone to mark a defect fixed or a test passed.

Keep secrets, tokens, credentials, and sensitive response data out of logs and reports.

## Phase 1 — Discover the project

1. Locate the workspace root and read applicable instructions and maintained project documentation.
2. Run `git status --short`, identify the current branch, and distinguish pre-existing changes from audit changes.
3. Inspect package manifests, lockfiles, framework/build configuration, environment examples, API proxy/base URL configuration, and existing test configuration.
4. Derive the real commands for install, typecheck, lint, unit/integration tests, build, application startup, and end-to-end tests. Do not invent commands from framework convention when scripts or docs say otherwise.
5. Determine whether the backend, credentials, seed data, browser, or external services are available. Use read-only backend inspection when permitted, but do not edit it.

Checkpoint: report discovered stack, commands, Git risks, environment prerequisites, blockers, and the next inventory step.

## Phase 2 — Build the integration inventory

Trace code instead of relying only on filenames. Inventory:

- All user-reachable routes, nested routes, guards, layouts, major screens, and role-specific paths.
- Important functions per route: initial load, search, filter, sort, pagination, forms, mutations, dialogs, error/empty/loading states, and navigation.
- Every API call: method, resolved URL, caller/service, request inputs, authentication, response type, and consuming route/function.
- Every accessed response field, including nested `response.data` paths, aliases, optional fields, transformations, defaults, pagination metadata, and error payload fields.
- Mock-only paths, fallbacks, feature flags, and UI fields that the backend does not supply.

Prefer automated search (`rg`) plus targeted reading. Include direct HTTP calls, centralized clients, generated clients, hooks, loaders/actions, state stores, and component-level calls. Note duplicate or bypassed clients without refactoring them yet.

Represent response usage at field-path level, for example `data.items[].assignee.displayName`, not merely `GET /tasks`.

Checkpoint: present the route/function/API/data-field inventory, uncertainties, and the next coverage step.

## Phase 3 — Construct the coverage matrix

Maintain one row per meaningful route/function/API scenario. At minimum include:

| Route / function | API and method | Fields consumed | Scenario | Evidence | Status | Gap / next action |
|---|---|---|---|---|---|---|

Use these statuses consistently:

- `PASS`: expected behavior was actually executed and verified.
- `FAIL`: executed behavior violated an evidenced expectation.
- `BLOCKED`: execution requires unavailable access, data, service, decision, or environment.
- `NOT TESTED`: known scenario has not been run.
- `PARTIAL`: only part of the scenario or contract was verified.

Cover happy path plus relevant loading, empty, error, auth/permission, malformed or missing optional data, and mutation refresh/cache behavior. Do not inflate coverage by treating build or typecheck success as functional API validation.

Checkpoint: summarize coverage counts, highest-risk gaps, blockers, and proposed test tooling.

## Phase 4 — Select and establish test tooling

Reuse the repository's existing test stack when it can verify the required behavior. Propose the smallest compatible additions based on the actual framework and package versions.

- Use typecheck, lint, and build for static/build health.
- Use unit tests for transforms, validation, adapters, and isolated state logic.
- Use component/integration tests for rendering, interaction, and mocked service boundaries.
- Consider Playwright when browser routing, authentication, real network behavior, responsive interactions, or multi-step workflows need verification.
- Before adding Playwright or another dependency, check whether it already exists, estimate installation/configuration impact, and ask if the addition is large or changes project policy.
- Prefer deterministic API interception for frontend regression tests; use a live backend only when contract/integration verification requires it and the environment is safe.

Document what each layer proves and what it cannot prove.

Checkpoint: report selected tools, configuration impact, executable test plan, and any approval needed.

## Phase 5 — Execute and classify failures

Run tests in risk-prioritized slices. Capture the exact command, relevant inputs or setup, observed result, and reproducible evidence. For each failure, trace the boundary and classify it as:

- `FE`: rendering, state, routing, transformation, validation, request construction, or client-side error handling is wrong.
- `API integration`: FE and API disagree on endpoint, method, headers, parameters, DTO shape, status handling, or lifecycle.
- `BE`: the backend violates its authoritative contract or fails independently of the FE.
- `DATA`: required seed/account/record is absent, invalid, inconsistent, or insufficient for the scenario.
- `ENVIRONMENT`: service, proxy, variable, certificate, browser/runtime, dependency, or access setup prevents reliable execution.
- `UNRESOLVED`: evidence is insufficient or multiple causes remain plausible.

Do not assign blame from a UI symptom alone. Compare the request, raw response/schema, transformation, state update, and render path. Record confidence and contradictory evidence.

Checkpoint: report reproduced failures, classifications, impact, confidence, blockers, and the prioritized repair plan.

## Phase 6 — Plan and repair in safe slices

Prioritize by user impact, security/data integrity, breadth, reproducibility, and repair risk. Group work into small slices with a clear verification target.

For each authorized FE slice:

1. State the defect, evidence, intended invariant, affected files, and rollback-friendly change.
2. Preserve centralized API/client conventions and existing architecture.
3. Add or update a regression test that fails for the defect when practical.
4. Make the smallest code change that fixes the evidenced cause, including explicit safe handling for optional/missing data when the product requirement is known.
5. Do not disguise backend or data failures with fabricated successful data. Preserve required UI placeholders/fallbacks when project instructions require them.
6. Run the focused test, then relevant broader tests, typecheck/lint, and build according to risk.
7. Update the coverage matrix and evidence immediately.

Stop and ask the user when a repair requires a business decision or crosses a high-risk boundary. Continue independent, low-risk slices when they are unaffected by that blocker.

Checkpoint after every slice or cohesive stage: list changes, verification, remaining risk, and next action.

## Phase 7 — Re-verify and report

Re-run all affected scenarios and suitable regression suites. Check Git status and separate files changed by this audit from untouched pre-existing changes.

The final report must contain:

1. Overall result: `PASS`, `FAIL`, or `BLOCKED`, with a one-sentence evidence-based reason.
2. Scope and environment actually tested, including relevant commit/branch and backend mode.
3. Commands and browser/API checks run, with results; explicitly say when browser verification was not performed.
4. Coverage summary and the updated matrix, retaining `PARTIAL`, `NOT TESTED`, and `BLOCKED` rows.
5. Findings grouped by classification, severity, evidence type, reproduction, root cause, and disposition.
6. Files created or modified and why.
7. Regression tests added or changed and what defect each protects.
8. Remaining issues, missing backend fields/contracts, environment blockers, residual risks, and recommended next steps.

Only mark the overall result `PASS` when all in-scope critical scenarios passed with executed evidence and no unresolved high-impact defect remains. Otherwise use `FAIL` for verified defects or `BLOCKED` when missing prerequisites prevent a reliable conclusion.
