# Prompt 00 — Audit repo and Figma before coding

Use the `figma-to-react` skill. Do not implement screens yet.

Figma file/frame: [https://www.figma.com/design/346BHJzesYMdj4s0bKgapj/Taiga?node-id=0-1&t=zXR9ufXUUJHfmwNu-1]

Goal: build the existing Figma design as an interactive frontend-only React app. Reuse existing code, Figma variables and components. All local interactions should work through React state/mock data; no real backend integration in this phase.

Tasks:
1. Inspect the repository and `package.json`; identify framework, language, versions, routes, existing UI components, styling pipeline, commands and current build health. Do not replace project setup if one already exists.
2. Verify whether the Figma MCP can read the exact link above. Test access to layers/frame hierarchy, components, variables, styles and assets. Report exactly what data is accessible.
3. Inventory all relevant screens/frames, routes, user flows, visible components, interactions, responsive variants and loading/empty/error states. Do not assume a frame exists when you cannot see it.
4. Extract exact Figma variable names and values. Propose CSS variables and Tailwind semantic aliases. Never invent actual design token values.
5. Review Tailwind and SCSS compatibility based on the project's installed versions. Tailwind CSS v4 is not designed to run as a Sass preprocessor pipeline. Recommend a stable setup before installing or changing versions; do not silently upgrade/downgrade.
6. Propose a readable feature-based architecture. Reuse existing components; identify which shared components should exist and why.
7. Define how local React state and mock services will simulate interactions and later be replaced by actual API services.
8. Fill `docs/PROJECT_CONTEXT.md`, `docs/FIGMA_DESIGN_SYSTEM.md`, `docs/SCREEN_INVENTORY.md`, `docs/DECISIONS.md`, and `docs/IMPLEMENTATION_STATUS.md` from verified sources.
9. Give a concise milestone plan: design tokens/layout -> shared UI -> first complete user flow -> other screens -> visual QA.

Question policy: do not ask me about details already available in Figma/repo. Ask only if access or a consequential architectural decision is blocked, and batch no more than 3 truly necessary questions. Resolve minor ambiguity consistently and log it.

Do not modify application code in this task. End with what was verified, what was inaccessible, and the proposed plan.
