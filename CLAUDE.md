# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package manager**: pnpm (recommended)

### Essential Commands
- `pnpm install` - Install dependencies
- `pnpm dev` - Start Vite dev server (usually running on :5173)
- `pnpm build` - Production build with TypeScript check (`tsc -b && vite build`)
- `pnpm preview` - Preview production build

### Quality & Linting
- `pnpm lint` - Run ESLint with max 0 warnings
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm -s exec tsc --noEmit` - TypeScript type checking only

### Testing
- `pnpm test` - Run tests (excludes performance/stress)
- `pnpm test:run` - Single test run without watch
- `pnpm test:coverage` - Test coverage report
- `pnpm test:eventbus` - EventBus v2 full test suite
- `pnpm test:eventbus:unit` - EventBus unit tests only
- `pnpm test:eventbus:integration` - EventBus integration tests
- `pnpm test:eventbus:performance` - EventBus performance benchmarks
- `pnpm test:eventbus:business` - EventBus business logic tests

## Architecture Overview

### Stack
- **Frontend**: React 19.1+, TypeScript 5.8.3+, Vite 7.0+
- **UI Framework**: Chakra UI v3.23.0 (strict v3 only - v2 props don't work)
- **State**: Zustand v5.0.7 with Immer middleware
- **Backend**: Supabase (PostgreSQL + real-time)
- **Testing**: Vitest v3.2.4 with JSdom

### Project Structure - "Screaming Architecture"

Business domains organized under `src/pages/admin/`:
- `core/` - Dashboard, Settings, Intelligence, CRM
- `operations/` - Sales POS, Operations Hub
- `supply-chain/` - Materials (StockLab), Products
- `finance/` - Fiscal management, AFIP integration
- `resources/` - Staff, Scheduling
- `gamification/` - Achievements, OnboardingGuide

Key directories:
- `src/shared/ui/` - Design system components (ONLY import from here, never `@chakra-ui/react`)
- `src/store/` - Zustand stores by domain (materialsStore, salesStore, staffStore, etc.)
- `src/lib/` - Core systems (events, offline, error-handling, performance)
- `src/business-logic/` - Domain logic separated from UI

### Critical Design System Rules

**NEVER import directly from `@chakra-ui/react`** - Always use `@/shared/ui` wrappers:
```tsx
// ✅ CORRECT
import { ContentLayout, Section, Button, Stack } from '@/shared/ui'

// ❌ WRONG - will cause compile errors
import { Box, Button } from '@chakra-ui/react'
```

**Semantic layout components** (v2.1 patterns):
- `ContentLayout` - Page wrapper with proper spacing
- `Section` - Content sections with variants (flat/elevated/default)
- `FormSection` - Specialized for forms with title/description
- `StatsSection` - For metrics/KPIs layouts
- `CardGrid` - Semantic alias for dashboard grids

**Import pattern**:
```tsx
import {
  ContentLayout, Section, FormSection, StatsSection,
  Stack, Button, Modal, Alert, Badge,
  MetricCard, CardGrid, Icon
} from '@/shared/ui'
```

## Core Systems

### EventBus v2 Enterprise
- **Location**: `src/lib/events/`
- **Pattern**: `domain.entity.action` (e.g., `sales.order.completed`)
- **Features**: Module registry, deduplication, offline-first, encryption, rate limiting
- **Testing**: 70%+ coverage with unit/integration/performance/stress suites
- **Module communication**: Use EventBus for cross-module events, NOT direct imports

### Offline-First Architecture
- **Location**: `src/lib/offline/`
- **Components**: OfflineSync, OfflineMonitor, ConflictResolution
- **Pattern**: Optimistic updates (UI updates immediately, sync when online)
- **Priority**: orders > payments > inventory
- **Storage**: IndexedDB with automatic sync queue

### State Management - Zustand Stores
Domain-specific stores with Immer + persist middleware:
- `appStore.ts` - Global UI state, auth, notifications
- `materialsStore.ts` - Inventory/materials management
- `salesStore.ts` - POS, cart, orders
- `customersStore.ts` - CRM, RFM analysis
- `staffStore.ts` - HR, performance, training
- `schedulingStore.ts` - Shifts, time-off
- `operationsStore.ts` - Kitchen, tables, operations
- `productsStore.ts` - Menu, recipes, costs
- `fiscalStore.ts` - Invoicing, AFIP, taxes

### Error Handling
- **Location**: `src/lib/error-handling/`
- **Components**: ErrorHandler singleton, ErrorBoundary, useErrorHandler hook
- **Integration**: Works with `notify.success()`, `notify.error()` from notifications system
- **Pattern**: Wrap critical operations with ErrorBoundary, use `handleApiError()` for API calls

### Performance System
- **Location**: `src/lib/performance/`
- **Features**: FPS monitoring, bundle optimization, lazy loading with retry
- **Virtualization**: Lists >50 items use virtual scrolling (MaterialsGrid, ProductList)
- **Lazy Loading**: All major routes lazy-loaded via `src/lib/lazy/`
- **Bundle**: Optimized from 34kb to 4.6kb (-86%) for Framer Motion

## Development Patterns

### Form Validation
- **Zod v4.1.5**: Schema validation with `@hookform/resolvers`
- **React Hook Form v7.62.0**: Form state management
- **Example**: `src/pages/admin/supply-chain/materials/components/MaterialFormModal.tsx`

### Business Logic
- **Decimal.js**: ALL financial calculations (0% float errors, 20-digit precision)
- **Separation**: Domain logic in `src/business-logic/`, NOT in components
- **SQL Functions**: Complex calculations in `database/functions/`

### Type System
- **Strict TypeScript**: All code must pass `tsc --noEmit`
- **Domain types**: Module-local `types.ts` files
- **Update types**: When changing data shapes in business logic

### Database Operations
- **Client**: `src/lib/supabase/client.ts` - Singleton pattern
- **Services**: `src/services/` - Database operation wrappers
- **Real-time**: Supabase subscriptions for live updates
- **Migrations**: SQL files in `database/` or `database-updates/`

## Module Construction Templates

**Reference documentation**:
- `docs/05-development/UI_MODULE_CONSTRUCTION_MASTER_GUIDE.md` - Page construction patterns
- `docs/05-development/MODULE_DESIGN_CONVENTIONS.md` - Design conventions

**Page structure**:
```tsx
// ✅ Standard module page structure
import { ContentLayout, Section } from '@/shared/ui'

export default function ModulePage() {
  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="Module Title">
        {/* Header content */}
      </Section>

      <Section variant="elevated" title="Main Content">
        {/* Module body */}
      </Section>
    </ContentLayout>
  )
}
```

**AVOID**:
- ❌ Don't duplicate ErrorBoundary/ResponsiveLayout in pages (App.tsx handles this)
- ❌ Don't mix useState + Zustand for same data
- ❌ Don't use PageHeader (excessive vertical space)
- ❌ Don't bypass security patterns (use `secureApiCall()` for critical ops)

## Gamification & Capabilities

### Achievement System
- **Location**: `src/pages/admin/gamification/achievements/`
- **Engine**: AchievementsEngine listens to 40+ EventBus patterns
- **Types**: Foundational milestones (unlock capabilities) + mastery achievements (reward usage)
- **Integration**: EventBus-driven automatic progress tracking

### Capabilities System
- **Location**: `src/lib/capabilities/`
- **Pattern**: Progressive disclosure vs role-based permissions
- **Usage**: `<CapabilityGate capability="advanced_analytics">` and `useCapabilities()` hook
- **Model**: BusinessDNA compositional model (22 foundational milestones)

## Testing Strategy

### Framework: Vitest v3.2.4
- **Environment**: JSdom for DOM testing
- **Coverage**: Text, JSON, HTML outputs
- **Utilities**: EventBusTestingHarness, MockEventStore in `src/lib/events/testing/`

### Test Categories
- `unit/` - Component/function isolation
- `integration/` - Module-to-module workflows
- `performance/` - Throughput/latency benchmarks
- `stress/` - High-load edge cases
- `business/` - Domain logic validation

## Quality Workflow

**Before committing**:
1. `pnpm install` - Ensure dependencies synced
2. `pnpm dev` - Test UI changes locally
3. `pnpm lint` - ESLint validation (0 warnings required)
4. `pnpm -s exec tsc --noEmit` - Type checking
5. `pnpm test` - Run core test suite

## Routing System

All routes defined in `src/App.tsx`:
- Public: `/`, `/admin`, `/login`, `/admin/login`
- Setup: `/setup` (wizard)
- Admin: `/admin/dashboard`, `/admin/sales`, `/admin/materials`, etc.
- Customer App: `/app/portal`, `/app/menu`, `/app/orders`
- Debug: `/debug/*` (SUPER_ADMIN only, dev environment)

**Lazy loading**: Most routes lazy-loaded via `src/lib/lazy/` for performance

## Critical Anti-Patterns

1. **Never import from `@chakra-ui/react`** - Use `@/shared/ui` wrappers
2. **Don't create test components** unless explicitly authorized
3. **Avoid running dev servers** - One already running on :5173
4. **Don't hardcode colors** - Use dynamic theming (25+ themes with `gray.*` tokens)
5. **Never bypass security** - Use `secureApiCall()`, ErrorBoundary patterns
6. **Don't skip type checking** - All code must pass strict TypeScript

## Additional Context

- **Supabase**: PostgreSQL backend with Row Level Security (RLS) policies
- **Real-time**: WebSocket subscriptions via `src/lib/websocket/`
- **Offline storage**: IndexedDB for offline-first operations
- **Icons**: Heroicons v2.2.0 (SVG)
- **Responsive**: Mobile-first design with breakpoint tokens
- **Theming**: 25+ themes (dracula, synthwave, corporate, etc.) with dynamic switching
