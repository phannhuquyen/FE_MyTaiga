---
name: visual-qa
description: Audit implemented React screens against their Figma frames and check interactions, responsive layout, accessibility and build health.
---

# Visual QA

## Workflow
1. Identify the route and exact Figma frame/node being checked.
2. Run the app using the existing dev command. Do not invent commands; inspect package.json.
3. Capture screenshots at the same viewport size as the Figma frame if browser/screenshot tools are available.
4. Compare major structure first: page frame, navigation, columns, content width, alignments, table/card density and hierarchy.
5. Compare design tokens: font family/weights, text sizes, colors, borders, radii, shadows and icon choices.
6. Test interactions: navigation, modals, dropdowns, form errors/success, filters, search, tables and empty/loading states.
7. Test responsive behavior at provided Figma breakpoints or conventional viewports only where design details are missing.
8. Check focus visibility, labels, keyboard operation, semantic HTML and touch target usability.
9. Fix high-impact mismatches before minor details; repeat screenshot and interaction test.
10. Report what was actually tested, what failed and anything that could not be tested.

## Never
- Claim visual comparison without comparing screenshots.
- Change Figma design intent to make code easier.
- Use fabricated data or tokens to fill missing design content without recording the assumption.
