---
name: figma-to-react
description: Implement React screens from an existing Figma design with high fidelity, reusing Figma variables, components, assets, and existing codebase patterns.
---

# Figma to React

## Use this skill when
- The user provides a Figma file/frame link or asks to implement a screen based on Figma.
- Building a new route or reconciling an existing page with Figma.

## Workflow
1. Inspect the existing repo, package versions, routes, shared components and design tokens before editing.
2. Confirm access to the exact Figma file/frame using Figma MCP. If unavailable, explicitly state this and use only supplied screenshots/exports.
3. Read frame dimensions, layout hierarchy, auto-layout, constraints, typography, variables, component variants, assets and visible interactions.
4. Update `docs/FIGMA_DESIGN_SYSTEM.md` and `docs/SCREEN_INVENTORY.md` with verified details. Distinguish verified data from inferred behavior.
5. Map Figma tokens into CSS custom properties and semantic Tailwind utilities. Do not use raw color literals in JSX if tokens exist.
6. Find existing shared components before creating new ones. Reuse components and add variants/props where appropriate.
7. Implement one vertical slice at a time. Keep view code, data/state, and service abstractions separated.
8. Make visible controls functional with local React state and mock services when backend is out of scope.
9. Check desktop/mobile frames where available. Run the app and compare screenshots when browser tools exist.
10. Record deviations and uncertainties in `docs/DECISIONS.md`; update `docs/IMPLEMENTATION_STATUS.md`.

## Fidelity rules
- Follow Figma; do not redesign or invent a visual direction.
- Preserve typography, spacing, colors, borders, radii, shadows, icons and content hierarchy from the source.
- Do not use arbitrary Tailwind values to imitate tokens when the actual Figma variable is known.
- If an exact value is missing, use the closest existing token only if reasonable and mark it as an inference.
- Never report pixel-perfect validation without a screenshot or visual comparison.

## Completion checklist
- [ ] Uses verified design tokens
- [ ] Reuses existing components
- [ ] Interactions work
- [ ] Responsive behavior handled
- [ ] Accessibility basics handled
- [ ] Build passes
- [ ] Docs/status updated
