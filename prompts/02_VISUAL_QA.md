# Prompt 02 — Visual, interaction and code QA

Use the `visual-qa` skill and relevant project docs.

Audit the following screen(s): [SCREEN_NAMES_OR_ROUTES]
Figma references: [FIGMA_FRAME_URLS]

1. Run the app using its actual package scripts.
2. Capture implementation screenshots at the same viewport dimensions as Figma when tooling allows.
3. Compare layout hierarchy, spacing, typography, colors, assets, density, component states and responsive behavior.
4. Test all visible controls: navigation, dialogs, tabs, dropdowns, search, filter, sorting, pagination and forms.
5. Check that design tokens are used and there are no accidental hard-coded colors/fonts when matching tokens exist.
6. Check React structure, duplicate components, oversized components, state duplication and separation of mock data/services.
7. Check accessibility basics and browser console/build errors where available.
8. Fix high and medium impact problems, then rerun relevant checks.
9. Update `docs/IMPLEMENTATION_STATUS.md` and record any unresolved inference in `docs/DECISIONS.md`.

Return a short severity-ranked audit with file/line, issue, fix and verification result. Never claim a screenshot, interaction or build was tested if it was not.
