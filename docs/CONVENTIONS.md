# Coding Conventions — MyTaiga Frontend

## File & folder naming
- **Components**: PascalCase — `AppLayout.tsx`, `Button.tsx`, `ProjectCard.tsx`
- **Hooks**: camelCase with `use` prefix — `useProjects.ts`, `useModal.ts`
- **Services**: camelCase — `projectService.ts`, `mockProjectService.ts`
- **Types**: camelCase — `project.types.ts` or types inside the file that uses them
- **Mock data**: camelCase — `projects.mock.ts`
- **Styles**: same name as component — `ProjectCard.module.scss`
- **Constants/config**: camelCase or UPPER_SNAKE for true constants — `routes.ts`, `API_BASE_URL`
- **Barrels**: `index.ts` only for well-defined public APIs (shared UI, hooks). Avoid barrel files in feature folders.

## Folder structure per feature
```
src/features/<feature>/
  <FeatureName>Page.tsx        # Page-level component (route target)
  components/                  # Feature-specific components
  hooks/                       # Feature-specific hooks
  services/                    # Feature-specific service abstractions
  mocks/                       # Mock data for this feature
  types.ts                     # Feature-specific types
```

Only create folders/files that the feature actually needs.

## Component responsibilities
- **Page components** (`*Page.tsx`): Compose layout, wire data from hooks/services to child components. Minimal inline logic.
- **Feature components**: Encapsulate a distinct UI section of a page. Receive data via props.
- **Shared UI components** (`src/components/ui/`): Reusable, feature-agnostic. Must accept props for variants, sizes, states. No business logic.
- **Layout components** (`src/components/layout/`): App-level shells (sidebar, topbar, content area). Shared across routes.

## Import organization
Group imports in this order, separated by blank lines:
1. React / third-party packages
2. `@/` aliased project imports (components, hooks, services, lib)
3. Relative imports (siblings within the same feature)
4. Style imports
5. Type-only imports (use `import type` when possible)

## Styling & design tokens
- **Tailwind CSS v4** is primary for layout, spacing, flex/grid, responsive, and design token usage.
- Design tokens live in `src/styles/main.css` inside the `@theme` block.
- Use Tailwind utilities that reference tokens: `text-primary-500`, `bg-neutral-100`, etc.
- **Do NOT use arbitrary Tailwind values** (`bg-[#076859]`) when a token exists.
- **SCSS** (`.module.scss`) only for complex component-specific styles that Tailwind can't express cleanly.
- **Do NOT put Tailwind directives** (`@apply`, `@tailwind`) inside SCSS files.
- **Do NOT duplicate** the same style in both Tailwind and SCSS.

## State management
- `useState` for local UI state (toggle, form inputs, selected item).
- `useReducer` when a component has many interdependent state transitions.
- Custom hooks (`useXxx`) when state logic is reused across components.
- Context only for genuinely shared state (theme, auth session, project selection). No Redux/Zustand unless justified.
- Mock services handle data state; components call service functions, not inline data manipulation.

## Error / loading / empty states
- Every data-driven view should handle: loading, empty (no data), error, and populated states.
- Use skeleton loaders or spinners for loading (match Figma if available).
- Show meaningful empty state messages, not blank screens.
- Toast notifications for success/error feedback on actions.
- Confirm dialogs for destructive actions.

## Future API integration
- Service functions have typed inputs and outputs.
- Mock services implement the same interface that real API services will.
- Components never import mock data directly; they call service hooks/functions.
- When backend arrives: swap mock service implementations, keep components unchanged.

## Accessibility basics
- Semantic HTML (`button`, `nav`, `main`, `section`, `label`, `input`).
- Form inputs always have associated labels.
- Focus visible on interactive elements.
- Disabled states are visually and semantically indicated.
- `aria-*` attributes where semantic HTML is insufficient.
