## Copilot instructions for g-mini (g-admin-mini)

**G-Mini v3.1 EventBus Enterprise Edition** - Restaurant Management System with enterprise-grade modular architecture.

### 🏗️ System Architecture

**Frontend Stack**: React 19.1+ + TypeScript 5.8.3+ + Vite 7.0+ + Chakra UI v3.23.0 + Zustand v5.0.7  
**Backend**: Supabase (PostgreSQL, auth, realtime) + Row Level Security (RLS)  
**Testing**: Vitest v3.2.4 with JSdom environment  
**Key Systems**: EventBus v2 Enterprise, Offline-First, Capabilities/Features System, Gamification

### 📁 Project Structure (Screaming Architecture)

**Business domains under `src/pages/admin/`**:
- `core/` - Dashboard, CRM, Settings, Intelligence
- `operations/` - Sales, Fulfillment, Kitchen/Production
- `supply-chain/` - Materials (StockLab), Products, Suppliers, Assets
- `finance-*/` - Fiscal, Billing, Corporate, Integrations (split modules)
- `resources/` - Staff, Scheduling
- `gamification/` - Achievements, OnboardingGuide
- `tools/` - Reporting utilities

**Route mapping**: `src/config/routeMap.ts` - automated domain ↔ route mapping with `domainRouteMap` and `routeToFileMap`  
**Shared systems**: `src/shared/` - UI (`ui/`), alerts (`alerts/`), layouts (`layout/`)  
**Core libraries**: `src/lib/` - events, capabilities/features, offline, error-handling, performance, logging  
**State**: `src/store/` - Zustand stores per domain (appStore, materialsStore, salesStore, etc.)  
**Business logic**: `src/business-logic/` - domain calculations using Decimal.js  
**Services**: `src/services/` - Supabase API wrappers

### 🏛️ Enterprise Core Systems

**EventBus v2 Enterprise** (`src/lib/events/EventBus.ts`):
- Distributed event system with deduplication (`DeduplicationManager`) and offline support (`EventStoreIndexedDB`)
- Module lifecycle via `ModuleRegistry` with health monitoring
- Security: `SecureEventProcessor`, `EncryptedEventStore`, `RateLimiter`, `ContentSecurityPolicy`
- Pattern: `domain.entity.action` (e.g., `sales.order.completed`)
- Test organization: `__tests__/unit/`, `integration/`, `performance/`, `stress/`, `business/`
- Usage: `eventBus.emit(pattern, payload, options)` and `eventBus.on(pattern, handler)`

**Capabilities/Features System** (`src/lib/capabilities/`, `src/config/`):
- **NEW v4.0**: `FeatureActivationEngine` (`src/lib/features/`) replaces old CapabilityEngine
- Registries: `BusinessModelRegistry`, `FeatureRegistry`, `RequirementsRegistry` (in `src/config/`)
- Store: `useCapabilityStore` (`src/store/capabilityStore.ts`) - unified Zustand store
- Hook: `useCapabilities()` returns `{ hasFeature, getActiveModules, ... }`
- **v3.0 Dynamic Module Map**: `getDynamicModuleFeatureMap()` generates module-to-feature mapping automatically from manifests (eliminates manual `MODULE_FEATURE_MAP` maintenance)
- **Migration note**: Old `CapabilityGate` component removed - use hook-based conditional rendering

**Offline-First Architecture** (`src/lib/offline/OfflineSync.ts`):
- `OfflineSyncDB` (IndexedDB) + `OfflineSync` singleton class
- Optimistic updates: UI updates immediately, sync when online
- Priority queue: orders > payments > inventory
- Anti-flapping: connection state stabilization before sync
- Integration: `offlineSync.queueOperation(syncOperation)` from modules

**Error Handling System** (`src/lib/error-handling/`):
- `ErrorHandler` singleton with batch processing
- Hook: `useErrorHandler()` provides `handleError(error, context)`
- `ErrorBoundaryWrapper` component wraps App.tsx
- Integration with alerts: errors automatically show UI notifications

**Gamification System** (`src/pages/admin/gamification/achievements/`):
- Dual system: 22 foundational milestones (unlock capabilities) + mastery achievements
- `AchievementsEngine`: Auto-tracks 40+ EventBus patterns
- BusinessDNA model: Compositional capabilities vs archetypes
- `OnboardingGuide` widget: Gamified progressive disclosure

**Performance Monitoring** (`src/lib/performance/`):
- `PerformanceProvider` + `usePerformanceMonitor()` hook
- FPS monitoring with auto-optimization when < 30fps
- Bundle analysis: Framer Motion optimized from 34kb → 4.6kb
- Pattern: Use `transform`/`opacity` for GPU acceleration

### 💻 Developer Workflows

**Package manager**: `pnpm` (check `pnpm-lock.yaml`)

**Key commands**:
```powershell
pnpm install                   # Install dependencies
pnpm dev                       # Vite dev server
pnpm build                     # Production build (includes tsc check)
pnpm -s exec eslint .          # Lint (explicit exec for CI)
pnpm -s exec tsc --noEmit      # Type check only
pnpm test                      # Run tests (excludes performance/stress)
pnpm test:eventbus:full        # Full EventBus tests with performance/stress
pnpm test:coverage             # Run tests with coverage report
```

**Testing**:
- Config: `vitest.config.ts` with JSdom environment
- Setup: `src/setupTests.ts` for global test configuration
- Test files: `*.test.ts` or `*.test.tsx` alongside source
- EventBus tests: Comprehensive suite in `src/lib/events/__tests__/`
- Utilities: `EventBusTestingHarness`, `MockEventStore` for testing

**Quality workflow**:
1. Install: `pnpm install`
2. Dev: `pnpm dev` - test changes in browser
3. Lint: `pnpm -s exec eslint .`
4. Type check: `pnpm -s exec tsc --noEmit`
5. Test: `pnpm test`

**ESLint rules** (`eslint.config.js`):
- ❌ `no-console` enforced - use `logger.*` from `@/lib/logging` instead
- TypeScript strict rules via `typescript-eslint`
- React hooks rules enforced

### 🎯 Project-Specific Patterns

**UI Components** (`src/shared/ui/`):
```typescript
// ✅ CORRECT - Always import from @/shared/ui
import { ContentLayout, PageHeader, Stack, Button, Dialog, FormSection } from '@/shared/ui';

// ❌ WRONG - Never import directly from @chakra-ui/react
import { Box } from '@chakra-ui/react'; // Will fail - props differ
```

**3-Layer UI Architecture**:
- **Layer 3**: Semantic components (`Main`, `SemanticSection`, `SkipLink`) - WCAG AAA
- **Layer 2.5**: Helpers (`Form`, `DialogHelpers`) - composition patterns
- **Layer 2**: Layout components (`ContentLayout`, `PageHeader`, `Section`, `FormSection`, `StatsSection`)
- **Layer 1**: Primitives (Chakra wrappers: `Box`, `Flex`, `Stack`, `Button`, etc.)

**Page Structure Pattern**:
```tsx
// App.tsx handles: Provider, Toaster, ErrorBoundaryWrapper, ResponsiveLayout
// Individual pages ONLY use ContentLayout, never duplicate wrappers

export default function MyPage() {
  return (
    <ContentLayout spacing="normal">
      <PageHeader title="My Module" />
      <Section title="Stats">
        <StatsSection>
          <MetricCard label="Total" value={100} />
        </StatsSection>
      </Section>
    </ContentLayout>
  );
}
```

**Form Modal Pattern** (see `src/pages/admin/supply-chain/suppliers/components/SupplierFormModal.tsx`):
```tsx
// Pattern: Business logic in hook, UI is presentational
import { Dialog, FormSection, InputField, Button } from '@/shared/ui';

export function FormModal({ isOpen, onClose, item }) {
  const {
    formData,
    handleFieldChange,
    fieldErrors,
    isSubmitting,
    handleSubmit
  } = useFormHook({ isOpen, onClose, item });

  return (
    <Dialog.Root open={isOpen} onOpenChange={...}>
      <Dialog.Content>
        <Dialog.Header><Dialog.Title>...</Dialog.Title></Dialog.Header>
        <Dialog.Body>
          <FormSection title="Section">
            <InputField
              label="Field *"
              value={formData.field}
              onChange={(e) => handleFieldChange('field')(e.target.value)}
              style={{ borderColor: fieldErrors.field ? 'var(--colors-error)' : undefined }}
            />
          </FormSection>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={handleSubmit} disabled={isSubmitting}>Submit</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

**State Management** (`src/store/`):
```typescript
// Zustand v5 with devtools + persist middleware
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useMyStore = create<MyState>()(
  devtools(
    persist(
      (set, get) => ({
        // state
        items: [],
        // actions
        addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      }),
      { name: 'my-store' }
    ),
    { name: 'MyStore' }
  )
);
```

**Business Logic with Decimal.js** (`src/business-logic/`):
```typescript
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// Banking-level precision (20 digits, 0% float errors)
const total = items.reduce((acc, item) => {
  const itemValue = DecimalUtils.calculateStockValue(item.stock, item.unit_cost);
  return DecimalUtils.add(acc, itemValue, 'inventory');
}, DecimalUtils.fromValue(0, 'inventory'));

const formatted = DecimalUtils.formatCurrency(total); // "11,000.31"
```

**Supabase Service Pattern** (`src/services/`):
```typescript
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

export async function fetchItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('ItemsService', 'Failed to fetch items', error);
    throw error;
  }
  return data;
}
```

**Database Migrations** (`database/migrations/`):
```sql
-- Pattern: Use .sql files for schema changes via Supabase MCP
-- Naming: YYYYMMDDHHMMSS_description.sql (timestamp format)
-- Example: 20251106174442_create_assets_table.sql

-- 1. Create table with constraints
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  asset_code VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'available',
  -- CHECK constraints for data integrity
  CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS (Row Level Security)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
CREATE POLICY "Assets viewable by authenticated users"
  ON public.assets FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Assets manageable by admins"
  ON public.assets FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'manager'
  );
```

**RLS Patterns** (Row Level Security):
```sql
-- Pattern 1: User-owned data (customers, addresses)
CREATE POLICY "Users view own data"
  ON public.customers FOR SELECT
  USING (auth.uid() = id);

-- Pattern 2: Organization-scoped data (multi-tenant)
CREATE POLICY "Organization members view data"
  ON public.items FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members
      WHERE organization_id = items.organization_id
    )
  );

-- Pattern 3: Role-based access (admin/manager/staff)
CREATE POLICY "Role-based access"
  ON public.sales FOR ALL
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'manager', 'cashier')
  );

-- Pattern 4: Combined conditions (location + role)
CREATE POLICY "Location staff access"
  ON public.shifts FOR SELECT
  USING (
    location_id IN (
      SELECT home_location_id FROM employees
      WHERE id = auth.uid()
    )
    OR auth.jwt() ->> 'role' = 'admin'
  );
```

**Supabase Service Patterns** (`src/services/`):
```typescript
// Pattern 1: Basic CRUD with error handling
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

export async function fetchSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    logger.error('SuppliersService', 'Failed to fetch suppliers', error);
    throw error;
  }
  return data;
}

// Pattern 2: Joins and relations
export async function fetchOrdersWithItems() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(name, email),
      items:order_items(
        id,
        quantity,
        product:products(name, price)
      )
    `)
    .eq('status', 'pending');

  if (error) throw error;
  return data;
}

// Pattern 3: Upsert (insert or update)
export async function upsertProduct(product: Product) {
  const { data, error } = await supabase
    .from('products')
    .upsert(product, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    logger.error('ProductsService', 'Upsert failed', error);
    throw error;
  }
  return data;
}

// Pattern 4: Transactions (using RPC functions)
export async function transferInventory(transfer: Transfer) {
  const { data, error } = await supabase
    .rpc('execute_inventory_transfer', {
      from_location: transfer.fromLocationId,
      to_location: transfer.toLocationId,
      item_id: transfer.itemId,
      quantity: transfer.quantity
    });

  if (error) throw error;
  return data;
}
```

### 🔌 Integration Points

**EventBus Communication**:
```typescript
// Module A emits
await eventBus.emit('sales.order.completed', { orderId: '123', total: 100 }, {
  priority: 'high',
  correlationId: 'tx-456'
});

// Module B subscribes
const unsubscribe = eventBus.on('sales.order.*', async (event) => {
  logger.info('OrderHandler', 'Order event received', event);
  // handle event
});
```

**Module Registry** (`src/lib/modules/ModuleRegistry.ts`):
```typescript
import { ModuleRegistry, HookPoint } from '@/lib/modules';

// Register hook
ModuleRegistry.registerHook({
  hookPoint: HookPoint.SALES_ORDER_CREATED,
  moduleId: 'inventory-tracker',
  handler: async (data) => { /* update inventory */ }
});

// Execute hooks
await ModuleRegistry.executeHooks(HookPoint.SALES_ORDER_CREATED, orderData);
```

**Offline Sync**:
```typescript
import offlineSync from '@/lib/offline/OfflineSync';

// Queue operation for offline support
await offlineSync.queueOperation({
  id: uuid(),
  type: 'create',
  entity: 'orders',
  payload: orderData,
  priority: 'high',
  timestamp: Date.now()
});
```

### ⚠️ Critical Patterns & Anti-Patterns

**✅ DO**:
- Import from `@/shared/ui` (never `@chakra-ui/react`)
- Use `logger.*` from `@/lib/logging` (never `console.log`)
- Type check: `pnpm -s exec tsc --noEmit` after edits
- Use Decimal.js for financial calculations
- Use `ContentLayout` in pages (App.tsx has global wrappers)
- Store domain state in Zustand stores (`src/store/`)
- SQL migrations for DB changes (`database/migrations/`)
- Use `useCapabilities().hasFeature()` for progressive disclosure
- **NEW**: Define module features ONLY in manifest - `getDynamicModuleFeatureMap()` auto-generates mapping

**❌ DON'T**:
- Import `@chakra-ui/react` directly (use `@/shared/ui` wrappers)
- Use `console.log` (ESLint error - use `logger.*`)
- Duplicate `ErrorBoundaryWrapper`/`ResponsiveLayout` in pages
- Mix useState + Zustand for same domain data
- Use `secureApiCall()` (deprecated - modern modules use Supabase RLS)
- Hardcode colors (use dynamic theming system)
- Use `CapabilityGate` component (removed - use hooks instead)
- **NEW**: Edit `MODULE_FEATURE_MAP` manually (deprecated - use manifest only)

**Examples to reference**:
- Module creation: See `DYNAMIC_MODULE_FEATURE_MAP_MIGRATION.md` for auto-generation pattern
- Form pattern: `src/pages/admin/supply-chain/suppliers/components/SupplierFormModal.tsx`
- Store: `src/store/appStore.ts`, `src/store/materialsStore.ts`
- EventBus tests: `src/lib/events/__tests__/unit/EventBus.test.ts`
- Business logic: `src/business-logic/__test__/integration.test.ts`

### 📚 Additional Resources

- **NEW**: Dynamic module mapping: `DYNAMIC_MODULE_FEATURE_MAP_MIGRATION.md`
- Architecture V2 redesign: `docs/architecture-v2/deliverables/MIGRATION_PLAN.md`
- Route mapping: `src/config/routeMap.ts` - domain/route/file relationships
- Module manifests: `src/modules/` (check `ALL_MODULE_MANIFESTS`)
- Zustand v5 patterns: `docs/05-development/ZUSTAND_V5_STORE_AUDIT_REPORT.md`
