## Copilot instructions for g-mini (g-admin-mini)

**PRIMARY MISSION: System Installation & User Onboarding Flow Design**

Focus exclusively on designing and implementing the complete user journey from "fresh installation" to "productive daily use" of the g-admin system. This includes database setup, initial configuration, first-time user experience, and connecting existing modules into a cohesive workflow.

- **Current Challenge**: The system has 40+ database tables, extensive UI modules, and business logic, but lacks a unified installation/onboarding experience
- **Goal**: Create a step-by-step installation wizard and initial user flow that guides new users through system setup and introduces them to core functionality
- **Approach**: Start from user perspective, identify gaps in user journey, then connect existing pieces

- System Architecture Context (for reference only)
  - Frontend: Vite + React + TypeScript SPA. UI components in `src/modules/*` and `src/shared/ui`
  - Backend: Supabase (auth, DB, realtime) via `src/lib/supabase.ts`
  - Database: 40+ tables with business logic in SQL functions (`database/functions/*`)
  - Existing modules: materials, inventory, recipes, sales, customers, suppliers, analytics

- **Installation & Onboarding Priorities**
  - **Phase 1**: System Requirements Check & Database Setup
    - Verify Supabase connection and project configuration
    - Run database migrations and seed initial data
    - Test core authentication flows
  
  - **Phase 2**: Administrative Setup Wizard
    - Company/business information setup
    - Initial user account creation (admin user)
    - Basic system configuration (currency, units, etc.)
    - Security settings and user roles definition
  
  - **Phase 3**: Core Data Setup
    - Import/create initial materials catalog
    - Set up supplier information
    - Configure basic recipes/products
    - Initialize inventory locations and stock
  
  - **Phase 4**: User Onboarding Flow
    - Interactive tutorial for key features
    - Sample data creation for training
    - Dashboard customization
    - Notification and alert preferences

- **User Journey Mapping Focus**
  - **Day 0**: Fresh installation experience
  - **Day 1**: First productive tasks (create material, recipe, sale)
  - **Week 1**: Understanding reports and analytics
  - **Month 1**: Advanced features and customization

- **Key Research Areas** (investigate existing codebase for)
  - Auth flow: How users currently log in and access features
  - Database initialization: What tables need initial data vs can be empty
  - Permission system: How roles and access control work
  - Data dependencies: Which entities must exist before others can be created
  - UI/UX patterns: Existing wizard or multi-step form components
  - Error handling: How the system behaves with incomplete setup

- **Investigation Approach for Installation Design**
  - **Audit Existing Features**: Map what's already built vs what's missing for complete workflows
  - **Database Schema Analysis**: Understand required vs optional data for system operation
  - **User Role Dependencies**: Identify what permissions/roles are needed for each feature
  - **Integration Points**: Find where modules need to communicate for seamless experience
  - **Error States**: Document what happens when required data is missing
  - **Performance Considerations**: Identify heavy operations that need optimization for first-time setup

- **Task Breakdown Strategy**
  - **Start Small**: Design one complete micro-flow (e.g., "create first material")
  - **Map Dependencies**: Document what needs to exist before each action
  - **Identify Gaps**: Find missing connections between existing components
  - **Design Transitions**: Create smooth handoffs between setup phases
  - **Test Edge Cases**: Handle scenarios where setup is incomplete

- **Research Questions to Answer**
  - What's the current "blank slate" experience? (new user, empty database)
  - Which features can work independently vs require setup dependencies?
  - How do existing users currently set up the system for the first time?
  - What are the most common user tasks in the first week of usage?
  - Where do users get stuck or confused in the current experience?

- Developer workflows (for reference only)
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
