## Copilot instructions for g-mini (g-admin-mini)

**G-Mini v3.1 EventBus Enterprise Edition** - Restaurant Management System with enterprise-grade modular architecture.

### 🏗️ System Architecture

**Frontend Stack**: React 19.1+ + TypeScript 5.0+ + Vite 6.0+ + Chakra UI v3.23.0 + Zustand v5.0.7  
**Backend**: Supabase (auth, DB, realtime)  
**Testing**: Vitest with comprehensive test suites (unit, integration, performance, stress)  
**Key Systems**: EventBus v2 Enterprise, Module Federation, Offline-First Architecture

### 📁 Project Structure (Domain-Driven)

**Pages organized by business domain under `src/pages/admin/`**:
- `core/` - Dashboard, CRM, Settings, Intelligence
- `operations/` - Sales, Operations Hub
- `supply-chain/` - Materials (StockLab), Products  
- `finance/` - Fiscal management, AFIP integration
- `resources/` - Staff, Scheduling

**Route mapping**: See `src/config/routeMap.ts` for automated domain ↔ route mapping

### 🏛️ Core Systems

**EventBus v2 Enterprise** (`src/lib/events/`):
- Distributed event system with deduplication, offline-first support
- Module registry with health monitoring
- Security layer with encryption and rate limiting
- Comprehensive test coverage (unit, integration, performance, stress)

**Module System** (`src/lib/modules/`):
- Module Federation with dependency injection
- Dynamic loading with `ModuleRegistry` and `ModuleLoader`
- React hooks: `useModule`, `useModulesByCapability`, `useModuleHealth`

**State Management** (`src/store/`):
- Zustand stores per domain: `useAppStore`, `useMaterialsStore`, `useSalesStore`, etc.
- Immer for immutable updates
- Service hooks in `src/services/` for Supabase integration

### 💻 Developer Workflows

**Package manager**: pnpm (see `pnpm-lock.yaml`)  
**Key commands**:
- `pnpm install` - Install dependencies
- `pnpm dev` - Start Vite dev server
- `pnpm build` - Production build with TypeScript check
- `pnpm -s exec eslint .` - Lint with ESLint
- `pnpm -s exec tsc --noEmit` - Type check only
- `pnpm test` - Run tests (excludes performance/stress)
- `pnpm test:eventbus:full` - Full EventBus test suite

**Linting**: ESLint config in `eslint.config.js`. CI uses explicit eslint commands.

**Testing Strategy**:
- `pnpm test` - Excludes performance/stress tests
- `pnpm test:eventbus:full` - Complete EventBus test suite
- `pnpm test:coverage` - Coverage reports
- EventBus tests organized: `unit/`, `integration/`, `performance/`, `stress/`, `business/`
- Vitest config in `vitest.config.ts` with jsdom environment

### 🎯 Project-Specific Patterns

**UI Components**:
- Custom wrapper system in `src/shared/ui/` - check imports before assuming Chakra props
- Import pattern: `import { ContentLayout, PageHeader, Stack, Button } from '@/shared/ui'`
- Form patterns: See `MaterialFormModal.tsx`, `UniversalItemForm.tsx` for validation/state
- Component organization follows domain structure under `src/pages/admin/[domain]/`

**Business Logic** (`src/business-logic/`):
- Domain-specific logic separated from UI components
- Decimal.js for banking-level precision (0% float errors, 20-digit precision)
- SQL functions for complex calculations (`database/functions/`)
- Service layer in `src/services/` for Supabase operations

**Type System**:
- Domain-specific types in module-local `types.ts` files
- Update types when changing data shapes in business logic
- Strict TypeScript with comprehensive error checking
- Zod v4.1.5 for validation with `@hookform/resolvers` integration

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

**Validation workflow**:
- Install: `pnpm install`
- Dev server: `pnpm dev` and test UI changes
- Quality checks: `pnpm -s exec eslint .` and `pnpm -s exec tsc --noEmit`
