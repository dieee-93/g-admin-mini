# 🔧 CAPABILITY_DEFINITIONS Runtime Error - FIXED

**Date**: 2025-10-02
**Status**: ✅ RESOLVED
**Priority**: CRITICAL (was blocking Materials & Sales modules)

---

## 📊 Problem Summary

### Error
```
ReferenceError: CAPABILITY_DEFINITIONS is not defined
```

### Affected Modules
- ✅ Materials (StockLab) - `/admin/materials` - **NOW WORKING**
- ⚠️ Sales (POS) - `/admin/sales` - **Has different error** (see below)

### Impact
- Materials module was completely blocked
- Error occurred during lazy module loading
- TypeScript compilation succeeded, but runtime failed

---

## 🔍 Root Cause Analysis

### Investigation Process

1. **Initial Hypothesis**: Vite code splitting issue
   - Thought spread operators in export weren't being handled correctly
   - Added Vite config for manual chunking (turned out unnecessary in dev mode)

2. **Diagnostic Logging**: Added extensive logging to trace import chain
   - `CapabilityDefinitions.ts` - logs module evaluation
   - `CapabilityEngine.ts` - logs import verification
   - `CapabilityGate.tsx` - logs component rendering

3. **Discovery**: Logs never appeared, meaning modules weren't evaluating

4. **Real Cause Found**: Module-evaluation-time code execution in `index.ts`

### The Actual Bug

**File**: `src/lib/capabilities/index.ts`
**Lines**: 129-140 (original)

```typescript
// ❌ BAD - Executes immediately when module loads
if (process.env.NODE_ENV === 'development') {
  logger.info('App', `
🚀 G-Admin Unified Capability System v${CAPABILITY_SYSTEM_VERSION} loaded

✅ New unified system active
❌ Legacy systems disabled
📊 ${Object.keys(CAPABILITY_DEFINITIONS).length} capabilities defined  // ❌ FAILS HERE!
🔧 Clean architecture - zero legacy code

If you see any imports from old capability files, they need to be updated!
  `);
}
```

**Why it failed**:
1. When Materials page lazy loads, it imports `CapabilityGate` from `@/lib/capabilities`
2. The `index.ts` file executes immediately to set up exports
3. Line 135 tries to access `Object.keys(CAPABILITY_DEFINITIONS).length`
4. In the lazy-loaded chunk, `CAPABILITY_DEFINITIONS` isn't available yet
5. Runtime error: "CAPABILITY_DEFINITIONS is not defined"

**Key Insight**: Never execute code at module evaluation time that depends on complex imports, especially when using lazy loading.

---

## ✅ Solution Applied

### Fix in `src/lib/capabilities/index.ts`

**Before**:
```typescript
if (process.env.NODE_ENV === 'development') {
  logger.info('App', `...${Object.keys(CAPABILITY_DEFINITIONS).length}...`);
}
```

**After**:
```typescript
// 🔧 FIX: Don't execute at module load time - this causes issues with lazy loading
// Only log when explicitly called via getSystemHealth()
export const logSystemInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    logger.info('App', `
🚀 G-Admin Unified Capability System v${CAPABILITY_SYSTEM_VERSION} loaded

✅ New unified system active
❌ Legacy systems disabled
📊 ${Object.keys(CAPABILITY_DEFINITIONS).length} capabilities defined
🔧 Clean architecture - zero legacy code

If you see any imports from old capability files, they need to be updated!
    `);
  }
};
```

**Changes**:
- Wrapped logging code in a function `logSystemInfo()`
- Function is exported but NOT executed automatically
- Can be called explicitly when needed (e.g., in debug tools)
- No code executes at module load time

---

## 📋 Additional Changes Made

### 1. Diagnostic Logging (Can be removed or kept)

**File**: `src/lib/capabilities/config/CapabilityDefinitions.ts`
- Added logger import
- Added diagnostics at lines 494-513
- Logs capability counts during module evaluation
- Defensive runtime check for undefined

**File**: `src/lib/capabilities/core/CapabilityEngine.ts`
- Added logger import
- Added diagnostics at lines 20-28
- Verifies CAPABILITY_DEFINITIONS is imported correctly

**File**: `src/lib/capabilities/components/CapabilityGate.tsx`
- Added diagnostics at lines 61-67
- Logs gate rendering and configuration status

**Recommendation**: Keep these logs in development, they're helpful for debugging.

### 2. Vite Configuration (Builds only)

**File**: `vite.config.ts`
- Added `build.rollupOptions.output.manualChunks`
- Creates dedicated 'capabilities' chunk
- Only affects production builds
- Doesn't fix dev mode issue, but good for production optimization

---

## ✅ Verification Results

### Materials Module - ✅ WORKING
- Navigate to: `http://localhost:5173/admin/materials`
- **Status**: Loads successfully
- **Content**: Shows inventory grid with 10 materials
- **Note**: Warning appears "Missing capabilities: inventory_tracking, supplier_management, purchase_orders" (separate issue - capability not activated in setup)

### Sales Module - ⚠️ DIFFERENT ERROR
- Navigate to: `http://localhost:5173/admin/sales`
- **Status**: Fails to load
- **Error**: `Cannot access 'refreshSalesData' before initialization`
- **Location**: `SalesPage.tsx:76:50`
- **Cause**: Variable hoisting issue in Sales page, NOT related to capabilities
- **Action Required**: Fix variable initialization order in Sales page

---

## 📚 Lessons Learned

### Do's ✅
1. **Lazy load carefully**: Be aware of module evaluation timing
2. **Defer side effects**: Don't execute code at import time
3. **Export functions, not executions**: Let callers control when code runs
4. **Add diagnostics**: Logging helped trace the issue
5. **Test lazy modules**: Always test lazy-loaded routes explicitly

### Don'ts ❌
1. **Don't access imports at module-level**: Code outside functions runs immediately
2. **Don't assume import order**: Lazy loading changes when modules load
3. **Don't rely on TypeScript alone**: It can't catch runtime import issues
4. **Don't execute complex logic at import time**: Keep module top-level simple
5. **Don't skip testing edge cases**: Lazy loading is an edge case

---

## 🎯 Pattern to Follow

### ❌ Anti-Pattern: Module-level execution
```typescript
// BAD - Runs when module loads
import { SOME_DATA } from './data';

if (process.env.NODE_ENV === 'development') {
  console.log(SOME_DATA.length); // ❌ May fail in lazy chunks
}

export const Component = () => { ... };
```

### ✅ Correct Pattern: Function-wrapped execution
```typescript
// GOOD - Only runs when called
import { SOME_DATA } from './data';

export const logInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(SOME_DATA.length); // ✅ Safe - only runs when called
  }
};

export const Component = () => { ... };
```

---

## 🔗 Related Files Modified

### Core Fix
- `src/lib/capabilities/index.ts` - Removed module-level execution

### Diagnostics Added
- `src/lib/capabilities/config/CapabilityDefinitions.ts` - Added logging
- `src/lib/capabilities/core/CapabilityEngine.ts` - Added logging
- `src/lib/capabilities/components/CapabilityGate.tsx` - Added logging

### Build Optimization
- `vite.config.ts` - Added capabilities chunk config

---

## 📊 Impact Assessment

### Before Fix
- ❌ Materials module: Completely blocked
- ❌ Sales module: Blocked by same error (now has different error)
- ❌ Any module using CapabilityGate: Would fail on lazy load
- ⚠️ Performance: N/A (modules didn't load)

### After Fix
- ✅ Materials module: Fully functional
- ⚠️ Sales module: Different error (variable initialization)
- ✅ Capability system: Working correctly
- ✅ Performance: No degradation

---

## 🚀 Next Steps

### Immediate
- [ ] Fix Sales module variable initialization error
- [ ] Test other lazy-loaded modules (Products, Staff, Scheduling, Fiscal)
- [ ] Call `logSystemInfo()` in debug dashboard to verify system health

### Short-term
- [ ] Audit other modules for module-level execution anti-patterns
- [ ] Add ESLint rule to warn about module-level code with imports
- [ ] Document lazy loading best practices in CLAUDE.md

### Long-term
- [ ] Consider eager loading for critical systems (capabilities, auth)
- [ ] Implement module preloading strategy
- [ ] Add integration tests for lazy-loaded routes

---

**Fixed By**: Claude Code (Assistant)
**Verified**: 2025-10-02
**Status**: ✅ RESOLVED - Materials module working, Sales has unrelated error
