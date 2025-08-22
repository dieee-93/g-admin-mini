## Copilot instructions for g-mini (g-admin-mini)

Purpose: help AI coding agents be productive immediately in this repository by documenting the project's structure, conventions, build/test workflows, and integration points — focused on discoverable, actionable patterns.

- Big picture
  - Frontend: a Vite + React + TypeScript SPA in `src/` (entry: `main.tsx`, root `App.tsx`). UI components live under `src/modules/*` (e.g. `src/modules/materials/components/*`) and `src/shared/ui`.
  - Data layer: SQL and migrations under `database/` and `database-updates/` (functions, triggers, views). Many stored procedures handle business logic (recipe cost, viability, analytics).
  - Backend/integration: Supabase is wired in `src/lib/supabase.ts` — treat the Supabase client as the primary backend for auth, DB, and realtime.

- Developer workflows (how to run, build, lint, test)
  - Package manager: pnpm (see `pnpm-lock.yaml`). Use `pnpm` for installs and scripts.
  - Typical commands:
    - `pnpm install`
    - `pnpm dev` (Vite dev server)
    - `pnpm build` (production)
    - `pnpm -s exec eslint .` (lint)
    - `pnpm -s exec tsc --noEmit` (type check)
  - Linting: `eslint.config.js` is the project ESLint entry; CI uses explicit eslint invocations (examples in terminal history).

- Project-specific conventions and patterns
  - Feature modules: code is organized by feature under `src/modules/<feature>/...`. Prefer adding new UI and hooks inside the same module.
  - Local wrappers: UI primitives may be wrapped under `src/shared/ui` (variants, tokens). Inspect wrappers before assuming upstream Chakra or component props.
  - Types: many components rely on module-local `types` files (e.g., `src/modules/materials/types.ts`). Update types when changing data shapes.
  - Forms & modals: complex forms are self-contained components (see `MaterialFormModal.tsx` and `UniversalItemForm.tsx`) — observe validation and state patterns there.

- Integration points and cross-component communication
  - Supabase: `src/lib/supabase.ts` is the single source for DB/auth. Use existing service hooks in `src/services` when available.
  - Stores/hooks: local state uses hooks like `useMaterials` / `useInventory` (search `store/` or `src/store`). Prefer using these instead of ad-hoc global variables.
  - SQL functions/views: business calculations are often executed in SQL functions (`database/functions/*`) — when adjusting logic affecting cost/stock, update SQL and migrations.

- What to check before editing
  - Confirm which UI wrapper is imported (e.g., from `src/shared/ui` vs `@chakra-ui/react`) — prop names can differ (`invalid` vs `isInvalid` vs `_invalid`).
  - Run `pnpm -s exec tsc --noEmit` after edits to catch type drift early.
  - When changing DB-related behavior, create or update SQL migration files under `database/` or `database-updates/`.

- Examples / quick references
  - Item/recipe forms: `src/modules/materials/components/MaterialFormModal.tsx` and `UniversalItemForm.tsx` show patterns for selects, NumberInput, conditional blocks per item type.
  - Supabase usage: `src/lib/supabase.ts` and `src/services/*` contain canonical client usage.
  - SQL business logic: `database/functions/recipe_intelligence_functions.sql`, `database/functions/customer_analytics_functions.sql`.

- Avoid these common mistakes
  - Don't assume upstream third-party component props — inspect the actual import source in each file.
  - Avoid changing many unrelated files in one PR; prefer small, tested edits.

- How to validate a change locally
  - Install: `pnpm install`
  - Start dev server: `pnpm dev` and exercise the changed UI paths
  - Run checks: `pnpm -s exec eslint .` and `pnpm -s exec tsc --noEmit`

If you'd like, I can expand this with example import lines, a list of common hook names, or a short checklist for code review specific to this repo.
