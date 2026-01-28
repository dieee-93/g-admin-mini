# AGENTS.md - G-Admin Mini ERP

Instructions for AI coding agents operating in this repository.

## Quick Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server (port 5173) |
| `pnpm build` | TypeScript check + production build |
| `pnpm test` | Run all tests (excludes performance/stress) |
| `pnpm test:run` | Run tests once (no watch) |
| `pnpm lint` | ESLint with zero warnings allowed |
| `pnpm lint:fix` | Auto-fix linting issues |

## Running Single Tests

```bash
# Run specific test file
pnpm vitest run src/path/to/file.test.ts

# Run tests matching pattern
pnpm vitest run -t "test name pattern"

# Run with verbose output
pnpm vitest run src/path/to/file.test.ts --reporter=verbose

# Run EventBus tests only
pnpm test:eventbus

# Run precision/financial tests
pnpm test:precision
```

## Build & Type Checking

```bash
pnpm build              # Full build (tsc + vite)
pnpm build:skip-ts      # Skip TypeScript, Vite only
tsc --noEmit            # Type check without emit
```

---

## Code Style Guidelines

### Imports - CRITICAL

```typescript
// CORRECT - Always use path alias and shared UI
import { Box, Button, Stack, Dialog } from '@/shared/ui';
import { DecimalUtils } from '@/lib/decimal';
import { logger } from '@/lib/logging';
import { moduleEventBus } from '@/shared/events/ModuleEventBus';

// WRONG - Never import Chakra directly (breaks build)
import { Box } from '@chakra-ui/react';  // ❌ FORBIDDEN
```

### Mathematical Precision - CRITICAL

**NEVER use native JS operators for financial calculations:**

```typescript
// WRONG - Floating point errors
const total = price * quantity;  // ❌

// CORRECT - Use DecimalUtils
import { DecimalUtils } from '@/lib/decimal';
const total = DecimalUtils.multiply(price, quantity, 'financial').toNumber();
```

**Domains**: `'financial'` (2dp), `'recipe'` (3dp), `'inventory'` (4dp), `'tax'` (6dp)

### Logging - No Console

```typescript
// WRONG - ESLint error
console.log('debug');  // ❌

// CORRECT
import { logger } from '@/lib/logging';
logger.info('ModuleName', 'Message', { data });
logger.error('ModuleName', 'Error message', error);
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables/Functions | camelCase | `fetchProducts`, `isLoading` |
| Components | PascalCase | `ProductCard`, `SalesPage` |
| Types/Interfaces | PascalCase | `ProductType`, `SaleItem` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Files (components) | PascalCase.tsx | `ProductCard.tsx` |
| Files (utilities) | camelCase.ts | `decimalUtils.ts` |
| Test files | *.test.ts(x) | `ProductCard.test.tsx` |

### Component Structure

```tsx
// Pages use ContentLayout (App.tsx handles global wrappers)
import { ContentLayout, PageHeader, Section } from '@/shared/ui';

export default function MyPage() {
  return (
    <ContentLayout spacing="normal">
      <PageHeader title="My Module" />
      <Section title="Content">
        {/* content */}
      </Section>
    </ContentLayout>
  );
}
```

### Layout System (Updated Jan 2026)

- **Unified Shell**: Use `AppShell` for all authenticated layouts.
- **Nested Routes**: Define child routes inside the `AppShell` route using `<Outlet />`.
- **NO Wrappers**: Do NOT wrap pages in `AdminLayout` or `CustomerLayout` (these are deprecated/removed).
- **Header Actions**: Pass actions component to `AppShell` (e.g., `headerActions={<AdminHeaderActions />}`).

```tsx
// ✅ CORRECT - Nested Route Pattern
<Route path="/admin" element={<AppShell headerActions={<AdminHeaderActions />} />}>
  <Route path="dashboard" element={<DashboardPage />} />
</Route>

// ❌ WRONG - Wrapper Pattern (DEPRECATED)
<Route path="/admin/dashboard" element={
  <AdminLayout><DashboardPage /></AdminLayout>
} />
```

### State Management

- **Server state**: TanStack Query (`useQuery`, `useMutation`)
- **Client state**: Zustand stores in `src/store/`
- **Never mix** useState with Zustand for the same domain

```typescript
// Zustand store pattern
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useMyStore = create<MyState>()(
  devtools((set) => ({
    items: [],
    addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  }), { name: 'MyStore' })
);
```

### Modal State Management

**Rule**: Use **LOCAL state** for page-specific modals. Only use Zustand for app-wide modals triggered from multiple locations (navbar, shortcuts, etc.).

**Standard Pattern - useDisclosure hook:**

```typescript
import { useDisclosure } from '@/shared/hooks';

// Single modal
const myModal = useDisclosure();
// API: { isOpen: boolean, onOpen: () => void, onClose: () => void, onToggle: () => void }

// Multiple modals
const addModal = useDisclosure();
const editModal = useDisclosure();
const deleteModal = useDisclosure();

return (
  <>
    <Button onClick={addModal.onOpen}>Add Item</Button>
    <FormModal 
      isOpen={addModal.isOpen} 
      onClose={addModal.onClose}
    />
  </>
);
```

**When to use Zustand for modals:**

- ✅ Modal triggered from navbar, sidebar, keyboard shortcuts (app-wide)
- ✅ Modal shares global data needed across modules
- ❌ Simple page-local modal (use `useDisclosure` instead)

**Examples:**
- ✅ Checkout modal (salesStore) - Triggered from navbar + page + shortcuts
- ✅ Setup modal (setupUIStore) - App-wide configuration
- ❌ Edit material modal - Only used in Materials page (use local state)

**Performance:** Local state prevents unnecessary re-renders. See `docs/optimization/MODAL_STATE_BEST_PRACTICES.md` for research.

### Error Handling

```typescript
// Service layer
import { logger } from '@/lib/logging';

export async function fetchData() {
  const { data, error } = await supabase.from('table').select('*');
  if (error) {
    logger.error('ServiceName', 'Fetch failed', error);
    throw error;
  }
  return data;
}
```

### Cross-Module Communication

```typescript
// EventBus for async communication
import { moduleEventBus } from '@/shared/events/ModuleEventBus';

// Emit event
moduleEventBus.emit('sale.completed', { saleId, total });

// Subscribe to event
moduleEventBus.subscribe('material.stock_low', handler);
```

---

## Project Structure

```
src/
├── pages/admin/          # Business domains (Screaming Architecture)
│   ├── core/             # Dashboard, CRM, Settings
│   ├── operations/       # Sales, Fulfillment, Kitchen
│   ├── supply-chain/     # Materials, Products, Suppliers
│   └── resources/        # Staff, Scheduling
├── modules/              # Module manifests with hooks
├── shared/ui/            # UI components (use these, not Chakra)
├── lib/                  # Core libraries (events, decimal, logging)
├── store/                # Zustand stores
├── services/             # Supabase API wrappers
└── business-logic/       # Domain calculations with DecimalUtils
```

---

## Anti-Patterns to Avoid

1. **Direct Chakra imports** - Use `@/shared/ui` wrappers
2. **Native math for money** - Use `DecimalUtils`
3. **console.log** - Use `logger.*`
4. **Direct module imports** - Use EventBus or Module Exports
5. **useState for cross-module data** - Use Zustand stores
6. **Running dev server** - User already has one on :5173
7. **Creating test components** - Only if explicitly authorized
8. **Toaster outside Provider** - Must be inside `<Provider>` (see `docs/alert/TOASTER_ARCHITECTURE_AUDIT.md`)

---

## TypeScript Configuration

- **Strict mode** enabled (`strict: true`)
- **Path alias**: `@/*` maps to `./src/*`
- **Target**: ES2022
- **No implicit any**: Enforced

---

## Testing

- **Framework**: Vitest with JSdom
- **Setup file**: `src/setupTests.ts`
- **Test location**: `*.test.ts(x)` alongside source files
- **Mocking**: Use `vi.mock()` for modules, `vi.fn()` for functions

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // test implementation
  });
});
```

---

## Key Files Reference

| Purpose | Location |
|---------|----------|
| UI Components | `src/shared/ui/` |
| DecimalUtils | `src/lib/decimal/decimalUtils.ts` |
| EventBus | `src/shared/events/ModuleEventBus.ts` |
| Module Registry | `src/lib/modules/ModuleRegistry.ts` |
| Permissions | `src/config/PermissionsRegistry.ts` |
| Feature Flags | `src/config/FeatureRegistry.ts` |
| Supabase Client | `src/lib/supabase/client.ts` |
