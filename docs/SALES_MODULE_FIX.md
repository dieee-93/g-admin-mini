# 🔧 Sales Module - Variable Initialization Error

**Date**: 2025-10-02
**Status**: ⚠️ FIXED (awaiting Vite cache clear)
**Priority**: HIGH

---

## 📊 Problem Summary

### Error
```
Cannot access 'refreshSalesData' before initialization
at SalesPage (http://localhost:5173/src/pages/admin/operations/sales/page.tsx:76:50)
```

### Root Cause
In `src/pages/admin/operations/sales/hooks/useSalesPage.ts`, the `useEffect` hook that sets up quick actions was declared **BEFORE** the functions it references were defined.

---

## 🔍 Problematic Code

### Before Fix (Lines 220-269)

```typescript
// ❌ BAD - useEffect declared BEFORE functions it uses
export const useSalesPage = (): UseSalesPageReturn => {
  // ... state declarations ...

  // Setup quick actions with sales-specific actions
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-sale',
        label: 'Nueva Venta',
        icon: CreditCardIcon,
        action: () => handleNewSale(),  // ❌ handleNewSale not defined yet
        color: 'teal'
      },
      {
        id: 'refresh-data',
        label: 'Actualizar',
        icon: ArrowPathIcon,
        action: () => refreshSalesData(),  // ❌ refreshSalesData not defined yet
        color: 'gray'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);  // ❌ Missing function dependencies!

  // ... 500+ lines later ...

  const handleNewSale = useCallback(async () => { ... }, []);
  const refreshSalesData = useCallback(async () => { ... }, [loadSalesData]);
}
```

**Why it fails:**
1. JavaScript hoisting doesn't work with `const` declarations
2. Functions are used in `useEffect` before they're declared
3. Missing dependencies in `useEffect` deps array causes stale closures

---

## ✅ Solution Applied

### Fix Location
- `src/pages/admin/operations/sales/hooks/useSalesPage.ts`
- Lines 220, 713-771

### Changes Made

**1. Removed premature useEffect (line 220)**
```typescript
// 🔧 FIX: Quick actions setup moved to after all functions are declared (see line ~760)
```

**2. Added useEffect at end of hook (after line 713)**
```typescript
// 🔧 FIX: Setup quick actions AFTER all functions are declared
// This prevents "Cannot access 'refreshSalesData' before initialization" error
useEffect(() => {
  const quickActions = [
    {
      id: 'new-sale',
      label: 'Nueva Venta',
      icon: CreditCardIcon,
      action: () => handleNewSale(),
      color: 'teal'
    },
    {
      id: 'view-analytics',
      label: 'Analytics',
      icon: ChartBarIcon,
      action: () => handleShowAnalytics(),
      color: 'blue'
    },
    {
      id: 'table-management',
      label: 'Gestión Mesas',
      icon: TableCellsIcon,
      action: () => setActiveSection('tables'),
      color: 'green'
    },
    {
      id: 'qr-codes',
      label: 'Códigos QR',
      icon: QrCodeIcon,
      action: () => handleQRGeneration(),
      color: 'purple'
    },
    {
      id: 'kitchen-display',
      label: 'Cocina',
      icon: ComputerDesktopIcon,
      action: () => handleKitchenDisplay(),
      color: 'orange'
    },
    {
      id: 'refresh-data',
      label: 'Actualizar',
      icon: ArrowPathIcon,
      action: () => refreshSalesData(),
      color: 'gray'
    }
  ];

  setQuickActions(quickActions);
  return () => setQuickActions([]);
}, [
  // ✅ NOW includes all function dependencies
  setQuickActions,
  handleNewSale,
  handleShowAnalytics,
  setActiveSection,
  handleQRGeneration,
  handleKitchenDisplay,
  refreshSalesData
]);
```

---

## 🚨 Known Issue: Vite Cache

### Problem
After fixing the code, Vite's HMR (Hot Module Replacement) may serve cached versions of the file.

### Evidence
Error stack trace shows old timestamp:
```
at SalesPage (http://localhost:5173/src/pages/admin/operations/sales/page.tsx?t=1759379459251:76:50)
```

Even after file changes, the error persists because Vite hasn't reloaded the updated module.

### Solution: Clear Vite Cache

**Option 1: Restart dev server**
```bash
# In terminal where dev server is running:
Ctrl+C  # Stop server

pnpm dev  # Restart
```

**Option 2: Clear Vite cache manually**
```bash
# Stop server first
Ctrl+C

# Remove Vite cache
rm -rf node_modules/.vite

# Restart server
pnpm dev
```

**Option 3: Hard refresh browser**
```bash
# In browser (while on Sales page):
Ctrl+Shift+R  # Windows/Linux
Cmd+Shift+R   # Mac
```

---

## 📋 Verification Steps

Once Vite cache is cleared:

1. Navigate to: `http://localhost:5173/admin/sales`
2. **Expected**: Page loads successfully
3. **Expected**: No "Cannot access 'refreshSalesData'" error
4. **Expected**: Sales metrics, POS interface visible

---

## 🎓 Lessons Learned

### JavaScript Variable Hoisting

**`var` declarations are hoisted:**
```javascript
console.log(myVar); // undefined (hoisted)
var myVar = 10;
```

**`const` and `let` are NOT hoisted (Temporal Dead Zone):**
```javascript
console.log(myConst); // ❌ ReferenceError: Cannot access 'myConst' before initialization
const myConst = 10;
```

**`useCallback` creates `const` variables:**
```javascript
const myFunction = useCallback(() => { ... }, []); // Same as const
```

### React Hook Rules

**❌ BAD: Using function before declaration**
```typescript
useEffect(() => {
  doSomething(); // ❌ ReferenceError
}, []);

const doSomething = useCallback(() => { ... }, []);
```

**✅ GOOD: Declare functions first**
```typescript
const doSomething = useCallback(() => { ... }, []);

useEffect(() => {
  doSomething(); // ✅ Works
}, [doSomething]); // ✅ Include in deps
```

### useEffect Dependencies

**❌ BAD: Missing function dependencies**
```typescript
useEffect(() => {
  someFunction();
}, []); // ❌ Missing someFunction in deps
```

**✅ GOOD: Complete dependencies**
```typescript
useEffect(() => {
  someFunction();
}, [someFunction]); // ✅ Complete
```

---

## 🔗 Related Fixes

This session also fixed:

1. **CAPABILITY_DEFINITIONS error** (Materials module)
   - See: `docs/CAPABILITY_DEFINITIONS_FIX.md`
   - Fix: Removed module-level code execution in `index.ts`

2. **NavigationContext re-renders** (Previous session)
   - Reduced from 4x to 1x re-renders

3. **Logger infinite recursion** (Previous session)
   - Removed circular import

---

## 📊 Status

- ✅ **Code Fixed**: Variable initialization order corrected
- ⚠️ **Vite Cache**: Needs manual server restart
- ⏳ **Testing**: Pending cache clear
- 📝 **Documentation**: Complete

---

**Next Steps:**
1. User needs to restart dev server: `Ctrl+C`, then `pnpm dev`
2. Navigate to `/admin/sales` to verify fix
3. If error persists, clear Vite cache: `rm -rf node_modules/.vite`

---

**Fixed By**: Claude Code (Assistant)
**Date**: 2025-10-02
**Status**: ⚠️ Awaiting Vite cache clear for verification
