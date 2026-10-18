# Prompt 01 — Implement a screen from Figma

Use `figma-to-react` and `stateful-mock-ui` skills.

Screen/frame to implement: [FIGMA_FRAME_URL_OR_NAME]
Route: [ROUTE]
Flow priority: [WHAT_USER_MUST_BE_ABLE_TO_DO]

Before editing, inspect the relevant docs and existing code. Then implement this screen as a complete vertical slice:

1. Read the exact Figma frame using MCP. Use the extracted variables, components, typography and assets. Do not redesign or invent colors/fonts.
2. Reuse the existing layout and shared UI components. If a shared component is missing and will be reused, create it in the shared UI layer with an API that supports variants and props.
3. Build feature/page components with clear responsibilities and keep mock records out of JSX.
4. Implement the visible interactions using React `useState` and reusable hooks where appropriate. This is a frontend demo; do not connect a real backend. Put mock business actions behind service functions so real API calls can replace them later.
5. Cover appropriate validation, disabled, loading, empty, error and success states. No important primary button should be inert.
6. Match Figma at its reference viewport. Handle responsive layout against supplied variants; if no variant exists, infer conservatively and record the decision.
7. Run the existing build/lint/typecheck commands. Start the app and compare a screenshot with Figma if tools allow. Fix the most visible mismatches.
8. Update the screen inventory and implementation status docs.

Do not pause for approval on low-risk implementation details. Ask only if a real blocker cannot be resolved from repo, docs or Figma. Do not claim completion for tests or screenshot comparisons that were not run.

At the end, report files changed, interactions implemented, commands/tests and results, visual gaps, and the next screen/flow to implement.
