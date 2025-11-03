# 🐛 DEBUG MODULE - Production Ready

**Module**: Debug (Development & Debugging Tools)
**Phase**: Phase 3 P0 - Special Module
**Estimated Time**: 2-3 hours
**Priority**: P0 (Simple - dev tools only, no production impact)

---

## 📋 OBJECTIVE

Make the **Debug module** production-ready following the 10-criteria checklist.

**Why this module**: Dev-only module for debugging, testing, and system diagnostics. Only visible to SUPER_ADMIN.

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules
2. ✅ **Scaffolding ordered**: components/ organized
3. ✅ **Zero errors**: 0 ESLint + 0 TypeScript errors in module
4. ✅ **UI complete**: Debug tools working
5. ✅ **Cross-module mapped**: README documents purpose
6. ✅ **Zero duplication**: No repeated logic
7. ✅ **DB connected**: N/A (dev tools only)
8. ✅ **Features mapped**: Clear activation from FeatureRegistry
9. ✅ **Permissions designed**: minimumRole: SUPER_ADMIN
10. ✅ **README**: Debug tools documented

---

## 📂 MODULE FILES

### Core Files
- **Manifest**: `src/modules/debug/manifest.tsx`
- **Page**: `src/pages/admin/debug/` (or create if not exists)

### Expected Structure
```
src/pages/admin/debug/
├── page.tsx                          # Main debug page
└── components/
    ├── EventBusMonitor.tsx           # EventBus activity
    ├── ModuleRegistryInspector.tsx   # Module registry state
    ├── PerformanceMonitor.tsx        # Performance metrics
    ├── StoreInspector.tsx            # Zustand stores inspector
    └── DatabaseDebugger.tsx          # Supabase query debugger
```

---

## 🔍 MODULE DETAILS

### Current Status (From Manifest)

**Metadata**:
- ✅ ID: `debug`
- ✅ minimumRole: `SUPER_ADMIN` (already set)
- ✅ autoInstall: `false` (dev only)
- ✅ No dependencies

**Hooks**:
- **PROVIDES**:
  - `debug.tools` - Debug tool panels
  - `debug.diagnostics` - System diagnostics

- **CONSUMES**:
  - None (observer only)

### Key Features

**Debug Tools**:
- EventBus activity monitor
- Module Registry inspector
- Performance metrics (FPS, bundle size)
- Zustand store state viewer
- Supabase query debugger
- Console helper integration
- Feature/Capability inspector

**Security**:
- ⚠️ **CRITICAL**: Only accessible to SUPER_ADMIN
- ⚠️ Never show sensitive data (passwords, tokens)
- ⚠️ Dev mode only (hidden in production builds)

---

## 🎯 WORKFLOW (2-3 HOURS)

### 1. Audit (20 min)
- [ ] Read `src/modules/debug/manifest.tsx`
- [ ] Check if debug page exists
- [ ] Check ESLint errors: `pnpm -s exec eslint src/modules/debug`
- [ ] Check TypeScript errors
- [ ] Verify minimumRole: 'SUPER_ADMIN'

### 2. Fix Structure (30 min)
- [ ] Fix manifest if needed
- [ ] Fix ESLint errors
- [ ] Fix TypeScript errors
- [ ] Organize components
- [ ] Remove unused components

### 3. Debug Tools (1 hour)
- [ ] Create/verify EventBus monitor
- [ ] Create/verify Module Registry inspector
- [ ] Create/verify Performance monitor
- [ ] Integrate with `window.__CONSOLE_HELPER__`
- [ ] Test all debug tools
- [ ] Verify SUPER_ADMIN only access

### 4. Cross-Module Integration (20 min)
- [ ] Create/update `debug/README.md`
- [ ] Document debug tools
- [ ] Document security considerations
- [ ] Test access control (SUPER_ADMIN only)

### 5. Validation (20 min)
- [ ] Run production-ready checklist (10 items)
- [ ] Verify 0 ESLint errors
- [ ] Verify 0 TypeScript errors
- [ ] Test debug tools functionality
- [ ] Verify hidden from non-SUPER_ADMIN users
- [ ] Mark module as production-ready

---

## 🔧 DEBUG TOOLS EXAMPLES

### EventBus Monitor
```typescript
import { EventBus } from '@/lib/events';

const EventBusMonitor = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = EventBus.subscribe('*.*.*', (event) => {
      setEvents(prev => [...prev, event].slice(-100)); // Last 100 events
    });
    return unsubscribe;
  }, []);

  return (
    <Section title="EventBus Activity">
      {events.map(event => (
        <Text key={event.id}>{event.pattern}: {JSON.stringify(event.data)}</Text>
      ))}
    </Section>
  );
};
```

### ConsoleHelper Integration
```typescript
const ConsoleHelperPanel = () => {
  const getSummary = () => {
    if (typeof window !== 'undefined' && window.__CONSOLE_HELPER__) {
      return window.__CONSOLE_HELPER__.getSummary();
    }
    return null;
  };

  return (
    <Section title="Console Helper">
      <pre>{JSON.stringify(getSummary(), null, 2)}</pre>
    </Section>
  );
};
```

---

## ⚠️ CRITICAL SECURITY

### Access Control
```typescript
// In page component
const { user } = useAuth();

if (user?.role !== 'SUPER_ADMIN') {
  return <Navigate to="/admin/dashboard" />;
}
```

### Production Build
```typescript
// Conditionally render debug module only in dev
if (import.meta.env.PROD) {
  // Hide debug module in production
  return null;
}
```

---

## 📚 REFERENCE IMPLEMENTATIONS

**Existing Debug Tools**:
- `src/lib/performance/PerformanceMonitor.tsx` - Performance monitoring
- `src/lib/logging/Logger.ts` - Console helper
- `window.__CONSOLE_HELPER__` - Runtime debugging (dev only)

---

## 🎯 SUCCESS CRITERIA

- [ ] 0 ESLint errors in debug module
- [ ] 0 TypeScript errors
- [ ] Debug tools functional
- [ ] EventBus monitor working
- [ ] Module Registry inspector working
- [ ] Performance monitor working
- [ ] Only accessible to SUPER_ADMIN
- [ ] Hidden in production builds
- [ ] README with tool documentation
- [ ] All 10 production-ready criteria met

---

**Estimated Time**: 2-3 hours
**Dependencies**: None (observer module)
**Security Level**: 🔴 SUPER_ADMIN ONLY
**Next Module**: Settings (P0 Special Module)
