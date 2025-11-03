# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**G-Mini v3.1** is an enterprise-grade restaurant management system built with React 19.1, TypeScript 5.8.3, Vite 7.0, Chakra UI v3.23.0, and Supabase. It features a modular architecture with EventBus v2 Enterprise, offline-first capabilities, and a sophisticated atomic capabilities system for progressive feature disclosure.

## Essential Commands

### Development
```bash
pnpm install           # Install dependencies (required first)
pnpm dev              # Start dev server (runs on :5173 by default)
pnpm build            # Production build with TypeScript check
pnpm build:skip-ts    # Production build without type checking
```

### Code Quality
```bash
pnpm -s exec eslint .              # Run ESLint (CI-compatible)
pnpm -s exec tsc --noEmit          # Type check only (no build)
pnpm lint                          # Run ESLint with default config
pnpm lint:fix                      # Auto-fix ESLint issues
```

### Testing
```bash
pnpm test                          # Run tests (excludes performance/stress)
pnpm test:run                      # Run tests once (CI mode)
pnpm test:with-logs                # Run with verbose logging
pnpm test:coverage                 # Generate coverage report
pnpm test:eventbus:full            # Full EventBus suite (includes perf/stress)
pnpm test:eventbus:unit            # Unit tests only
pnpm test:eventbus:integration     # Integration tests only
```

## Architecture Overview

### Module Registry System (WordPress-inspired)

The project uses a **Module Registry** pattern inspired by WordPress hooks and VS Code extensions. This enables:

- **Decoupled Modules**: Modules communicate via hooks, not direct imports
- **Feature-Based Loading**: Modules only load when user has required features
- **Progressive Enhancement**: Modules can extend other modules' UI dynamically
- **Hook Points**: UI extension points like `calendar.events`, `dashboard.widgets`

**Module Structure**:
```
src/modules/
├── [module-name]/
│   └── manifest.tsx       # Module definition with hooks, deps, exports
└── index.ts              # Central registry of all modules
```

**Key Integration Points**:
- `src/lib/modules/ModuleRegistry.ts` - Core registry implementation
- `src/lib/modules/HookPoint.tsx` - React component for hook execution
- `src/modules/` - Module manifests directory
- Module manifests declare: `id`, `version`, `depends`, `requiredFeatures`, `hooks`, `setup`, `exports`

### EventBus v2 Enterprise

Distributed event system with:
- Pattern-based subscriptions: `domain.entity.action` (e.g., `sales.order.completed`)
- Module lifecycle management with health monitoring
- Deduplication and offline-first support
- Security hardening (encryption, rate limiting)
- 70.5% test coverage (93/132 tests passing)

**Usage**:
```typescript
// In module setup
registry.addAction('calendar.events', (data) => <Component />, 'moduleId', priority);

// In pages
<HookPoint name="calendar.events" data={{...}} fallback={<NoData />} />
```

**Event Patterns (Updated Jan 2025)**:
- `sales.order.*` - Sales module events
- `production.order.*` - Production module events (was `kitchen.*`)
- `fulfillment.onsite.*` - Onsite fulfillment events (was `floor.*`)
- `fulfillment.pickup.*` - Pickup fulfillment events (Phase 1)
- `fulfillment.delivery.*` - Delivery fulfillment events (Phase 1)
- `materials.stock.*` - Materials/inventory events
- `staff.driver.*` - Driver location and assignment events (Phase 1)
- `finance.credit_check.*` - Credit validation events (Phase 3)
- `finance.invoice_created` - Invoice creation events (Phase 3)
- `finance.payment_received` - Payment tracking events (Phase 3)

### Capabilities & Features System

**Three-Layer Architecture**:
1. **Capabilities** (User-facing): What the business can do (e.g., "onsite_service", "delivery_shipping", "production_workflow", "b2b_sales")
2. **Features** (System-level): 81 granular features auto-activated by capabilities (was 84, reduced in Phase 0.5)
3. **Modules** (UI-level): 31 modules (26 main + 5 sub-modules) shown based on active features

**Files**:
- `src/config/BusinessModelRegistry.ts` - 8 capability definitions
- `src/config/FeatureRegistry.ts` - 81 feature definitions + MODULE_FEATURE_MAP
- `src/lib/capabilities/` - Capability engine and components
- `src/lib/features/FeatureEngine.ts` - Feature activation logic

**Key Changes (Phase 0.5)**:
- Capability renamed: `requires_preparation` → `production_workflow`
- Features renamed: `production_recipe_management` → `production_bom_management`, `production_kitchen_display` → `production_display_system`
- Features deleted: `mobile_pos_offline`, `mobile_sync_management`, `customer_reservation_reminders` (now base architecture)

**Navigation Integration**: `getModulesForActiveFeatures()` in FeatureRegistry determines which modules appear in navigation based on active features.

### Screaming Architecture (Domain-Driven)

Project structure follows business domains:

```
src/pages/admin/
├── core/           # Dashboard, CRM (Customers), Settings, Intelligence
├── operations/     # Sales (includes B2B), Fulfillment (onsite/pickup/delivery), Production
├── supply-chain/   # Materials (StockLab), Products, Suppliers
├── finance/        # Finance (B2B accounts, credit), Fiscal, Billing, Integrations
├── resources/      # Staff, Scheduling
├── gamification/   # Achievements, Onboarding
└── executive/      # BI dashboards
```

**Recent Changes (Phases 0.5-3 - Jan 2025)**:
- ❌ `Floor` module → Merged into `Fulfillment/onsite`
- ❌ `Kitchen` module → Renamed to `Production`
- ❌ `Ecommerce` module → Merged into `Sales/ecommerce`
- ✅ `Finance` module → NEW in Phase 3 (B2B corporate accounts, credit management)
- ✅ `Sales/b2b` subfolder → NEW in Phase 3 (quotes, contracts, tiered pricing)
- Routes auto-redirect: `/operations/floor` → `/operations/fulfillment/onsite`, `/operations/kitchen` → `/operations/production`

**Route Mapping**: `src/config/routeMap.ts` provides automated domain ↔ route ↔ component mapping.

### State Management

- **Zustand v5.0.7**: Primary state management with Immer for immutability
- **Domain Stores**: `useAppStore`, `useMaterialsStore`, `useSalesStore`, etc.
- **EventBus**: For cross-module communication
- **Offline-First**: IndexedDB queue with optimistic updates

### UI Component System

**Critical Pattern**: NEVER import directly from `@chakra-ui/react`. Always use semantic wrappers:

```typescript
// ✅ CORRECT
import { Stack, Button, Text } from '@/shared/ui';

// ❌ WRONG - Will cause prop mismatches
import { Stack, Button } from '@chakra-ui/react';
```

**Design Patterns** (see `docs/05-development/MODULE_DESIGN_CONVENTIONS.md`):
- **Enterprise modules**: ContentLayout + business metrics + offline-first
- **Settings modules**: Vertical tabs + form sections + validation
- **Analytics modules**: StatsSection + performance monitoring

**No Duplicate Wrappers**: App.tsx handles global wrappers (ErrorBoundary, ResponsiveLayout). Individual pages only use ContentLayout.

### Business Logic Separation

- **Location**: `src/business-logic/[domain]/`
- **Decimal.js**: Banking-level precision (20 digits, 0% float errors)
- **SQL Functions**: Complex calculations in `database/functions/`
- **Service Layer**: `src/services/` for Supabase operations

### Real-time Updates

**IMPORTANT**: The project uses **Supabase Realtime** (PostgreSQL Change Data Capture) for real-time synchronization, NOT custom WebSocket.

- **WebSocket system removed** (2025-01-30): Custom WebSocket implementation eliminated to reduce complexity
- **Use Supabase Realtime**: For database change subscriptions (see `useRealtimeMaterials.ts` example)
- **Use EventBus**: For cross-module real-time communication within the app
- **Offline-first**: OfflineSync handles synchronization when network is restored

**Example Supabase Realtime:**
```typescript
const channel = supabase
  .channel('materials-all')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'items',
  }, (payload) => {
    // Handle real-time change
  })
  .subscribe();
```

## Critical Development Patterns

### Before Making Changes

1. **Read Architecture Docs**: Check `src/modules/ARCHITECTURE.md` and `docs/05-development/`
2. **Check Feature Dependencies**: Use FeatureRegistry to understand feature relationships
3. **Verify Module Hooks**: If adding UI extension points, check existing HookPoints
4. **TypeScript First**: Run `pnpm -s exec tsc --noEmit` after changes

### Adding New Modules

1. Create module manifest in `src/modules/[module]/manifest.tsx`
2. Define dependencies, required features, and hooks
3. Register in `src/modules/index.ts`
4. Add feature mapping in `FeatureRegistry.ts` → `MODULE_FEATURE_MAP`
5. Module auto-loads when user activates required features

### Working with EventBus

```typescript
// Module emits event
emit('sales.order.completed', { orderId: 123 }, { priority: EventPriority.HIGH });

// Module subscribes to event
eventBus.subscribe('sales.order.*', (event) => {
  // Handle event
}, { moduleId: 'inventory', priority: 100 });
```

**Pattern**: `domain.entity.action` (wildcards supported: `sales.order.*`, `*.*.completed`)

**Fulfillment Event Patterns (Phase 1)**:
```typescript
// Pickup Events
'fulfillment.pickup.queued'              // Order queued for pickup
'fulfillment.pickup.ready'               // Order ready for customer pickup
'fulfillment.pickup.picked_up'           // Customer picked up order
'fulfillment.pickup.time_slot_reserved'  // Time slot booked

// Delivery Events
'fulfillment.delivery.queued'            // Order queued for delivery
'fulfillment.delivery.validation_failed' // Zone/address validation failed
'fulfillment.delivery.driver_assigned'   // Driver assigned to order
'fulfillment.delivery.needs_manual_assignment' // Auto-assign failed
'fulfillment.delivery.picked_up'         // Driver picked up order
'fulfillment.delivery.in_transit'        // Driver en route
'fulfillment.delivery.delivered'         // Order delivered successfully

// Driver Events
'staff.driver_location_update'           // GPS location updated
'staff.driver_location_error'            // GPS tracking error
'staff.driver_available'                 // Driver became available
'staff.driver_busy'                      // Driver started delivery
```

### Form Patterns

Reference implementations:
- `src/pages/admin/supply-chain/materials/components/MaterialFormModal.tsx`
- Uses `react-hook-form` + Zod v4.1.5 + `@hookform/resolvers`
- Validation schemas in module-local `types.ts` files

### Database Changes

- **Migrations**: `database/migrations/` or `database-updates/`
- **RLS Policies**: Always required for new tables
- **Functions**: SQL functions for complex business logic

**Phase 0.5 Database Updates (Jan 2025)**:
- ✅ New tables: `fulfillment_queue`, `mobile_routes`, `corporate_accounts`
- ✅ 9 indexes added for performance
- ✅ 9 RLS policies configured for security
- Use Supabase MCP for migrations: `mcp__supabase__apply_migration`

**Phase 1 Database Updates (Jan 2025)**:
- ✅ `pickup_time_slots` - Time slot management for pickup orders (11 columns, 4 indexes, 2 RLS policies)
- ✅ `delivery_assignments` - Driver assignment tracking (26 columns, 6 indexes, 2 RLS policies)
- ✅ `delivery_zones` - Delivery zone definitions with polygons (15 columns - existing)
- ✅ `driver_locations` - Real-time GPS tracking (11 columns - existing)
- All tables have Row Level Security (RLS) enabled

## Testing Strategy

### Test Organization
- **Unit tests**: `src/lib/events/__tests__/unit/`
- **Integration tests**: `src/lib/events/__tests__/integration/`
- **Performance tests**: Excluded by default (use `pnpm test:all`)
- **E2E workflows**: `src/__tests__/e2e/`

### Custom Test Utilities
- `EventBusTestingHarness` - EventBus test utilities
- `src/__tests__/utils/testUtils.tsx` - React testing utilities
- Mock implementations in `src/__tests__/mocks/`

### Running Specific Tests
```bash
vitest run path/to/test.test.ts              # Single file
vitest run src/lib/events/__tests__/unit     # Directory
```

## Common Anti-Patterns to Avoid

1. ❌ **Direct Chakra imports** - Use `@/shared/ui` wrappers
2. ❌ **Duplicate ErrorBoundary/ResponsiveLayout** - Already in App.tsx
3. ❌ **Mixed state management** - Don't use useState + Zustand for same data
4. ❌ **Bypassing CapabilityGate** - Always check capabilities for protected features
5. ❌ **Hardcoded theme colors** - Use dynamic theming system (25+ themes)
6. ❌ **Float arithmetic for money** - Use Decimal.js
7. ❌ **Direct module imports** - Use Module Registry and exports API
8. ❌ **Skipping TypeScript checks** - Always run `pnpm -s exec tsc --noEmit`
9. ❌ **Zustand selectors without useShallow** - Causes re-renders when returning arrays/objects (see Performance section)
10. ❌ **DecimalUtils without fallbacks** - Always use `value ?? 0` to prevent DecimalError on undefined
11. ❌ **Creating new arrays in Zustand actions** - Use `getUpdatedArrayIfChanged()` to preserve references

## Performance Optimization

### Bundle Splitting
Vite config includes manual chunks for:
- Capabilities system (`capabilities` chunk)
- UI libraries (`vendor-ui` chunk)
- Forms (`vendor-forms` chunk)
- Supabase (`vendor-supabase` chunk)
- Per-module chunks (`module-materials`, `module-sales`, etc.)

### Lazy Loading
- Module code loaded on-demand via Module Registry
- Routes use React.lazy() via `src/lib/routing/createLazyComponents.ts`
- Adaptive animations via `usePerformanceMonitor()` when FPS < 30

### Monitoring
- Real-time FPS monitoring in `src/lib/performance/PerformanceMonitor.tsx`
- Bundle analysis: `pnpm build` generates visualizer output
- ConsoleHelper: `window.__CONSOLE_HELPER__` for debugging re-renders (dev only)

### Zustand Performance Best Practices (v5)

**CRITICAL**: Prevent unnecessary re-renders with proper selector patterns:

```typescript
// ❌ WRONG - Creates new array reference every render
const items = useStore(state => state.items || []);

// ✅ CORRECT - Use useShallow for arrays/objects
import { useShallow } from 'zustand/react/shallow';
const items = useStore(useShallow(state => state.items || EMPTY_ARRAY));

// ✅ CORRECT - Preserve array references in actions
const EMPTY_ARRAY: string[] = []; // Stable reference

set((state) => {
  const newArray = [...state.items, newItem];
  return {
    items: getUpdatedArrayIfChanged(state.items, newArray) // Preserves reference if equal
  };
});
```

**Array Reference Stability Helper**:
```typescript
// Use this helper in Zustand actions to prevent re-renders
function getUpdatedArrayIfChanged<T>(oldArray: T[], newArray: T[]): T[] {
  if (oldArray.length !== newArray.length) return newArray;
  const isEqual = oldArray.every((val, idx) => val === newArray[idx]);
  return isEqual ? oldArray : newArray; // PRESERVE OLD REFERENCE if equal
}
```

**When to use `useShallow`**:
- ✅ Selectors returning arrays: `state => state.someArray`
- ✅ Selectors returning objects: `state => ({ a: state.a, b: state.b })`
- ✅ Selectors with `|| []` or `|| {}` fallbacks
- ✅ Arrays from persist middleware (rehidration creates new references)

**React Strict Mode Note**: In development, React 19 Strict Mode runs effects twice:
- Mount → Unmount (cleanup test) → Mount again
- EventBus subscriptions will show: subscribe → unsubscribe → subscribe
- This is **expected behavior** and disappears in production

### DecimalUtils Safe Usage

```typescript
// ❌ WRONG - Throws DecimalError if value is undefined
DecimalUtils.fromValue(material.stock, 'inventory');

// ✅ CORRECT - Always provide fallback with nullish coalescing
DecimalUtils.fromValue(material.stock ?? 0, 'inventory');

// ✅ CORRECT - Use safeFromValue for validation
DecimalUtils.safeFromValue(material.stock, 'inventory', 'material stock');

// ✅ CORRECT - Use assertFinite for critical operations
DecimalUtils.assertFinite(total, 'total calculation');
```

### Debugging Re-renders with ConsoleHelper

Available in development at `window.__CONSOLE_HELPER__`:

```javascript
// Get errors only
__CONSOLE_HELPER__.getErrors(10)

// Find module with most activity
__CONSOLE_HELPER__.getTopModules(5)

// Search specific module logs
__CONSOLE_HELPER__.getByModule("Materials", 20)

// Get AI-optimized export (reduces 123K → <1K tokens)
__CONSOLE_HELPER__.exportForAI({ level: "error" })

// Statistics
__CONSOLE_HELPER__.getSummary()
```

## Security Patterns

### Content Security Policy
- HTTP headers in `vite.config.ts` (dev) + production server config
- No inline scripts (except theme script in index.html)
- Supabase domains whitelisted for connect-src

### Authentication
- Supabase Auth with RLS (Row Level Security)
- JWT tokens with custom claims in `access_token_hook`
- Role-based access via `RoleGuard` component
- Protected routes via `ProtectedRoute` component

### Data Security
- Event payload encryption in EventBus
- Rate limiting per module/pattern
- SQL injection prevention via Supabase client parameterized queries

## Offline-First System

### Architecture
- **OfflineSync** engine with IndexedDB queue
- **Optimistic updates**: UI updates immediately, sync later
- **Priority system**: orders > payments > inventory
- **Conflict resolution**: Last-write-wins with merge strategies
- **Anti-flapping**: Debounced network state changes

### Integration Points
- `src/lib/offline/OfflineSync.ts` - Core sync engine
- `src/lib/offline/OfflineMonitor.tsx` - Network status component
- EventBus integration for offline event queueing

## Development Workflow

### Standard Workflow
1. `pnpm install` - Install dependencies
2. `pnpm dev` - Start dev server (DO NOT run if already running on :5173)
3. Make changes
4. `pnpm -s exec eslint .` - Lint check
5. `pnpm -s exec tsc --noEmit` - Type check
6. `pnpm test:run` - Run tests
7. `pnpm build` - Production build test

### Git Workflow
- Development on feature branches
- Current branch: `refactor/eliminate-hub`
- Conventional commits encouraged
- Pre-commit hooks with husky + lint-staged

## Key Files Reference

### Configuration
- `package.json` - Scripts and dependencies
- `vite.config.ts` - Build config + CSP headers + manual chunks
- `vitest.config.ts` - Test configuration
- `tsconfig.json` - TypeScript configuration (composite project)

### Core Systems
- `src/App.tsx` - Root component with global wrappers
- `src/lib/events/EventBus.ts` - EventBus v2 implementation
- `src/lib/events/ModuleRegistry.ts` - Module lifecycle management (EventBus-specific)
- `src/lib/modules/ModuleRegistry.ts` - Module registry for UI hooks
- `src/lib/capabilities/index.ts` - Capability system
- `src/config/BusinessModelRegistry.ts` - Capability definitions
- `src/config/FeatureRegistry.ts` - Feature definitions + MODULE_FEATURE_MAP

### Documentation
- `docs/05-development/` - Development guides
- `src/modules/README.md` - Module Registry guide
- `src/modules/ARCHITECTURE.md` - Module system architecture
- `.github/copilot-instructions.md` - Additional context for AI assistants

## Notes

- **Package Manager**: pnpm only (see pnpm-lock.yaml)
- **Node Version**: Ensure compatible Node.js version for React 19.1
- **Dev Server**: Always runs on port 5173 by default
- **Two Module Registries**: One for EventBus module lifecycle (`src/lib/events/ModuleRegistry.ts`), one for UI hooks (`src/lib/modules/ModuleRegistry.ts`)
- **ChakraUI v3**: Major version with breaking changes from v2 - always check Chakra v3 docs
- **Test Coverage**: EventBus at 70.5%, other modules vary
- **Database**: Supabase PostgreSQL with RLS policies required for all tables
