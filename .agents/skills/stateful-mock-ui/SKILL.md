---
name: stateful-mock-ui
description: Build a backend-independent but interactive React frontend using mock data, useState, reusable hooks, and replaceable service abstractions.
---

# Stateful Mock UI

## Use this skill when
- The frontend is being built before backend APIs are available.
- The user says the UI may use dummy/static data but must be interactive and ready for future API integration.

## Required architecture
- Separate sample records into mock data files.
- Put mock behavior behind service functions with typed inputs/outputs where TypeScript is used.
- Components call hooks/services; avoid embedding large mock arrays and business rules inside JSX.
- Use `useState` for local UI interactions such as open/closed dialogs, active tabs, controlled inputs, selections, and optimistic local updates.
- Use reusable custom hooks when the same logic appears in multiple screens.
- Use a Context only for genuinely shared UI/session/project selection state. Do not add Redux or another global state library unless justified by the existing app.
- Keep function signatures similar to the future service contract so replacing mocks with HTTP calls does not require rewriting visual components.

## Interactions expected
Implement relevant interactions for all visible controls: buttons, dropdowns, tabs, search, filters, sort, pagination, form validation, create/edit/delete demo data, confirmation dialogs, toasts, loading/empty/error states and navigation.

Never leave an important visible button inert. If an action is intentionally unsupported in this phase, show a disabled state or explain the reason in the handover.

## Boundaries
- Do not create actual API calls or assume backend URLs exist.
- Do not claim data survives refresh unless persistence is implemented.
- Use localStorage only for state that should intentionally survive refresh, and encapsulate it in a hook/service.
- Avoid fake success for form submissions that fail local validation.
- Do not overstate demo functionality as production authentication/security.

## Completion checklist
- [ ] Local state drives the interface
- [ ] Sample data is separated from UI
- [ ] Every primary interaction works
- [ ] State is not duplicated unnecessarily
- [ ] Mock service can be replaced later
- [ ] Demo limitations are documented
