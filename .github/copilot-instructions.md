## Copilot instructions for g-mini (g-admin-mini)

**G-Mini v3.1 EventBus Enterprise Edition** - Restaurant Management System with enterprise-grade modular architecture.

### 🏗️ System Architecture

**Frontend Stack**: React 19.1+ + TypeScript 5.8.3+ + Vite 7.0+ + Chakra UI v3.23.0 + Zustand v5.0.7  
**Backend**: Supabase (PostgreSQL, auth, realtime) + Row Level Security (RLS)  
**Testing**: Vitest v3.2.4 with JSdom environment and comprehensive test suites  
**Key Systems**: EventBus v2 Enterprise, Offline-First, Capabilities System, Gamification

### 📁 Project Structure (Screaming Architecture)

**Business domains under `src/pages/admin/`**:
- `core/` - Dashboard, CRM, Settings, Intelligence
- `operations/` - Sales, Operations Hub
- `supply-chain/` - Materials (StockLab), Products  
- `finance/` - Fiscal management, AFIP integration
- `resources/` - Staff, Scheduling
- `gamification/` - Achievements, OnboardingGuide

**Route mapping**: `src/config/routeMap.ts` provides automated domain ↔ route mapping  
**Shared systems**: `src/shared/` contains UI components, alerts, business logic  
**Core libraries**: `src/lib/` contains events, capabilities, offline, error-handling, performance

### 🏛️ Enterprise Core Systems

**EventBus v2 Enterprise** (`src/lib/events/`):
- Distributed event system with deduplication and offline-first support
- Module lifecycle management with health monitoring  
- Security hardening with encryption and rate limiting
- Pattern: `domain.entity.action` (e.g., `sales.order.completed`)
- Testing: 70.5% passing (93/132 tests) organized in unit/integration/performance/stress categories

**Capabilities System** (`src/lib/capabilities/`):
- Business capabilities for progressive disclosure vs role-based permissions
- React patterns: `<CapabilityGate capability="advanced_analytics">` and `useCapabilities()` hook
- BusinessDNA compositional model replacing archetypal approaches
- 22 foundational milestones unlock capabilities through gamification

**Offline-First Architecture** (`src/lib/offline/`):
- OfflineSync engine with IndexedDB queue and conflict resolution
- Optimistic updates pattern: UI updates immediately, sync later if offline
- Priority system: orders > payments > inventory for sync order
- Anti-flapping protection for unstable connections

**Error Handling System** (`src/lib/error-handling/`):
- ErrorHandler singleton with batch processing and audit trail
- `useErrorHandler()` hook with operation context
- ErrorBoundary components with custom fallback UI
- Integration with notifications: `notify.success()`, `handleApiError()`

**Gamification System** (`src/pages/admin/gamification/achievements/`):
- **Dual system**: 22 foundational milestones (activate capabilities) + mastery achievements (reward usage)
- **AchievementsEngine**: Listens to 40+ EventBus patterns for automatic progress tracking
- **BusinessDNA compositional model**: Replaces archetypal approaches with independent capabilities
- **OnboardingGuide widget**: Interactive gamified activation system
- **Achievement types**: Sales (First Seller → Sales Master), Materials (Organizer → Inventory Master), Staff (Emerging Leader → HR Master)

**Performance Monitoring** (`src/lib/performance/`):
- Real-time FPS monitoring with auto-optimization when FPS < 30
- Bundle optimization: Framer Motion reduced from 34kb to 4.6kb (-86%)
- `usePerformanceMonitor()` for adaptive animations
- GPU acceleration with transform/opacity for hardware rendering

### 💻 Developer Workflows

**Package manager**: pnpm (see `pnpm-lock.yaml`)  
**Key commands**:
- `pnpm install` - Install dependencies
- `pnpm dev` - Start Vite dev server
- `pnpm build` - Production build with TypeScript check
- `pnpm -s exec eslint .` - Lint with ESLint (CI uses explicit commands)
- `pnpm -s exec tsc --noEmit` - Type check only
- `pnpm test` - Run tests (excludes performance/stress)
- `pnpm test:eventbus:full` - Full EventBus test suite including performance/stress

**Testing Strategy**:
- Vitest v3.2.4 with JSdom environment (`vitest.config.ts`)
- Coverage reporting: text, JSON, HTML outputs
- EventBus tests organized: `unit/`, `integration/`, `performance/`, `stress/`, `business/`
- Custom testing utilities: `EventBusTestingHarness`, `MockEventStore`
- E2E workflows for Staff, Materials, Customer modules

**Quality Gates**:
1. `pnpm install` - Install dependencies
2. `pnpm dev` - Test UI changes in development
3. `pnpm -s exec eslint .` - ESLint validation
4. `pnpm -s exec tsc --noEmit` - TypeScript strict checking
5. `pnpm test` - Run core test suite

### 🎯 Project-Specific Patterns

**UI Components**:
- Custom wrapper system in `src/shared/ui/` - check imports before assuming Chakra props
- **Mixed component system**: Use `@/shared/ui` components when available, otherwise use `@chakra-ui/react` directly
- Import pattern: `import { ContentLayout, PageHeader, Stack, Button } from '@/shared/ui'` for shared components
- For missing components: `import { Skeleton, SimpleGrid } from '@chakra-ui/react'` is acceptable
- Form patterns: See `MaterialFormModal.tsx`, `UniversalItemForm.tsx` for validation/state
- Component organization follows domain structure under `src/pages/admin/[domain]/`

**Module Construction Templates** (`docs/05-development/UI_MODULE_CONSTRUCTION_MASTER_GUIDE.md`):
- **Enterprise modules**: ContentLayout + business metrics + offline-first patterns
- **Settings modules**: Vertical tabs + form sections + validation
- **Analytics modules**: StatsSection + performance monitoring integration
- Architecture: App.tsx handles global wrappers, modules only use ContentLayout

**Design System Conventions** (`docs/05-development/MODULE_DESIGN_CONVENTIONS.md`):
- **"One Pattern per Purpose"** - Single official pattern for each UI need
- **Mandatory templates**: Enterprise (Sales/Staff/Materials), Settings (Config/Admin), Analytics (Dashboard/Reports)
- **Form patterns**: Standardized ModuleForm component structure with Modal + FormSection
- **Import enforcement**: Only `@/shared/ui` imports allowed, never direct Chakra imports

**Business Logic** (`src/business-logic/`):
- Domain-specific logic separated from UI components
- Decimal.js for banking-level precision (0% float errors, 20-digit precision)
- SQL functions for complex calculations (`database/functions/`)
- Service layer in `src/services/` for Supabase operations

**Type System**:
- Domain-specific types in module-local `types.ts` files
- Update types when changing data shapes in business logic
- Strict TypeScript with comprehensive error checking
- Zod v4.1.5 for validation with `@hookform/resolvers` integration (already configured)

### 🔌 Integration Points

**Supabase** (`src/lib/supabase/client.ts`):
- Singleton client pattern with persistent auth
- Service hooks in `src/services/` for database operations
- Real-time subscriptions for live data updates

**State Management**:
- Zustand stores: `useAppStore`, `useMaterialsStore`, `useSalesStore`, etc.
- Immer for immutable state updates
- Domain-specific stores aligned with page organization

**EventBus Communication**:
- Module-to-module communication via EventBus v2
- Distributed events with offline support
- Use `ModuleRegistry` for dynamic module loading
- Event patterns: `domain.entity.action` (e.g., `sales.order.completed`)
- Health monitoring with automatic module lifecycle management

### ⚠️ Common Patterns & Gotchas

**Before editing**:
- Check if importing from `src/shared/ui` vs `@chakra-ui/react` - props may differ
- Run `pnpm -s exec tsc --noEmit` after edits to catch type errors
- DB changes require SQL migrations in `database/` or `database-updates/`

**Key examples**:
- Form patterns: `src/pages/admin/supply-chain/materials/components/MaterialFormModal.tsx`
- Store usage: Check `src/store/` for existing domain stores before creating new state
- SQL business logic: `database/functions/recipe_intelligence_functions.sql`

**Critical Anti-Patterns to Avoid**:
- ❌ Don't duplicate ErrorBoundary/ResponsiveLayout in individual pages
- ❌ Avoid mixed state management (useState + Zustand for same data)
- ❌ Don't bypass security patterns (always use `secureApiCall()` for critical operations)
- ❌ Never hardcode theme colors (use dynamic theming system with 25+ themes)

**Validation workflow**:
- Install: `pnpm install`
- Dev server: `pnpm dev` and test UI changes
- Quality checks: `pnpm -s exec eslint .` and `pnpm -s exec tsc --noEmit`
