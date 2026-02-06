# G-Admin Mini - Development Rules

## Context7 (MCP)
Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.

---

## Architecture Overview (6 Core Systems)

```
Capabilities (12) --> Features (88) --> Modules (34)
     |                    |                  |
 User-facing        Developer-facing    Business logic
```

| System | Purpose | Key File |
|--------|---------|----------|
| **Capabilities** | User selects business model | `src/config/BusinessModelRegistry.ts` |
| **Features** | 88 granular feature flags | `src/config/FeatureRegistry.ts` |
| **Modules** | 34 business modules with manifests | `src/modules/*/manifest.tsx` |
| **EventBus** | Async cross-module messaging | `src/shared/events/ModuleEventBus.ts` |
| **HookPoints** | WordPress-style UI extension | `src/lib/modules/HookPoint.tsx` |
| **Module Exports** | VS Code-style API sharing | Via `manifest.exports` |

**Deep dive**: `docs/capabilities/DEVELOPER_GUIDE.md` (1477 lines)

---

## Critical Import Rules

```typescript
// ALWAYS use these:
import { Box, Button, Stack } from '@/shared/ui';
import { moduleEventBus } from '@/shared/events/ModuleEventBus';
import { ModuleRegistry } from '@/lib/modules';

// NEVER use (breaks build):
import { Box } from '@chakra-ui/react';  // Direct Chakra import
```

---

## Mathematical Precision (CRITICAL)

**NEVER** use native JS operators for financial calculations:

```typescript
// WRONG - floating point errors
const total = price * quantity;

// CORRECT - use DecimalUtils
import { DecimalUtils } from '@/lib/precision';
const total = DecimalUtils.multiply(price, quantity);
```

**Deep dive**: `CONTRIBUTING.md` (full precision guide)

---

## Module Communication Patterns

### 1. EventBus (Async, Fire-and-Forget)
```typescript
// Emit
moduleEventBus.emit('sale.completed', { saleId, total });

// Subscribe
moduleEventBus.subscribe('material.stock_low', handler);

// Namespace: {module}.{entity}.{action}
```

### 2. HookPoints (UI Extension)
```tsx
// Provider (in manifest.tsx setup):
registry.addAction('dashboard.widgets', () => <MyWidget />, 'myModule', 100);

// Consumer:
<HookPoint name="dashboard.widgets" />
```

### 3. Module Exports (Direct API)
```typescript
// Provider (manifest.tsx):
exports: { getCustomerById: async (id) => {...} }

// Consumer:
const api = registry.getExports<CustomerAPI>('customers');
await api.getCustomerById(id);
```

**Deep dive**: `src/modules/README.md`, `docs/cross-module/README.md`

---

## Validation Checkpoints

Before implementing ANY feature:

1. [ ] **Check existing code** - Search for similar patterns before creating new
2. [ ] **Verify module boundaries** - Does this belong in this module?
3. [ ] **Use correct imports** - `@/shared/ui`, not `@chakra-ui/react`
4. [ ] **Financial math** - Using DecimalUtils for any money/quantity calculations?
5. [ ] **Cross-module communication** - EventBus for async, Exports for sync

Before committing:

1. [ ] **TypeScript compiles** - `npm run build` or `tsc --noEmit`
2. [ ] **No duplicate logic** - Check if similar code exists elsewhere
3. [ ] **Follows patterns** - Consistent with existing module structure

---

## Quick Reference: When to Use What

| Need | Solution | Example |
|------|----------|---------|
| Notify other modules | EventBus | `sale.completed`, `stock.updated` |
| Extend UI from another module | HookPoint | Dashboard widgets, toolbar actions |
| Call another module's function | Module Exports | `getStaffAvailability()` |
| Share state across components | Zustand stores | `useSalesStore()` |
| Fetch server data | TanStack Query | `useQuery({ queryKey: [...] })` |

---

## Documentation Index

| Topic | File | Lines |
|-------|------|-------|
| Full architecture | `README.md` | 1029 |
| Capabilities system | `docs/capabilities/DEVELOPER_GUIDE.md` | 1477 |
| Module patterns | `src/modules/README.md` | 317 |
| Cross-module data | `docs/cross-module/` | 2 files |
| Permissions/RBAC | `docs/permissions/` | 9 files |
| Alerts system | `docs/alert/` | 12 files |
| Cash management | `docs/cash/` | 15 files |

---

## Anti-Patterns to Avoid

```typescript
// Direct Chakra imports (breaks build)
import { Box } from '@chakra-ui/react';

// Native JS math for money (precision errors)
const tax = subtotal * 0.21;

// Direct module imports (tight coupling)
import { getStaff } from '@/modules/staff/api';

// useState for cross-module data (should use stores)
const [suppliers, setSuppliers] = useState([]);
```

---

## Session Best Practices

1. **One objective per session** (max 3 hours of work)
2. **Search before creating** - Use grep/glob to find existing patterns
3. **Validate architecture** - Check module boundaries before implementing
4. **Incremental commits** - Small, focused changes
5. **Run TypeScript** - `tsc --noEmit` after significant changes
