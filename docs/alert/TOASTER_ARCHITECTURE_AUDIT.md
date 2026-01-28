# 🔔 Toaster Architecture Audit & Fix

**Date:** January 27, 2026  
**Auditor:** System Analysis  
**Severity:** 🔴 **CRITICAL** - System Breaking  
**Status:** ❌ **BROKEN** - Immediate Fix Required

---

## 🚨 Critical Issue Detected

### Error Message
```
Uncaught ContextError: useContext returned `undefined`. 
Seems you forgot to wrap component within <ChakraProvider />
    at @chakra-ui_react.js?v=29635004:2590:38
    at chakra(:5173/Toaster)
```

### Root Cause
**The `Toaster` component is rendered OUTSIDE the `<Provider>` (ChakraProvider) in App.tsx**, breaking Chakra UI's context requirements.

---

## 🏗️ Current Architecture (BROKEN)

### App.tsx Structure
```tsx
<QueryClientProvider>
  <PerformanceProvider>
    <Provider>  {/* ✅ ChakraProvider wrapper */}
      <AlertsProvider>
        <Router>
          <ErrorBoundaryWrapper>
            <AuthProvider>
              {/* ... All app content ... */}
            </AuthProvider>
          </ErrorBoundaryWrapper>
        </Router>
      </AlertsProvider>
    </Provider>
    
    {/* ❌ PROBLEM: Toaster is OUTSIDE Provider */}
    <Toaster />  
    
    <ReactQueryDevtools />
  </PerformanceProvider>
</QueryClientProvider>
```

### Why This Fails
1. **Chakra UI v3 Context Requirement**: All Chakra components MUST be wrapped in `<ChakraProvider>`
2. **Toaster Uses Chakra Context**: The `Toaster` component internally uses Chakra UI hooks that require the provider context
3. **Portal Limitation**: Even though `Toaster` uses `<Portal>`, it still needs the initial render context to access Chakra's theme system

---

## 📁 File Analysis

### src/shared/ui/toaster.tsx
```tsx
import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react"

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
})

export const Toaster = () => {
  return (
    <Portal>  {/* Portal doesn't solve context issue */}
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Toast.Root width={{ md: "sm" }}>
            {/* Toast components all require Chakra context */}
            {toast.type === "loading" ? (
              <Spinner size="sm" color="blue.solid" />
            ) : (
              <Toast.Indicator />
            )}
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
```

**Components requiring Chakra context:**
- ✅ `Portal` - Renders to document.body but needs context on initial render
- ✅ `ChakraToaster` - Main toaster component
- ✅ `Toast.Root` - Toast container
- ✅ `Spinner` - Loading indicator
- ✅ `Stack` - Layout component
- ✅ `Toast.*` - All toast subcomponents

---

## 📊 Documentation Review

### Existing Documentation

#### ALERTS_ARCHITECTURE_FIX_REPORT.md
- ✅ Covers alert initialization and store issues
- ❌ Does NOT mention Toaster placement requirements
- ❌ Does NOT document ChakraProvider context requirements

#### SMART_ALERTS_GUIDE.md
- ✅ Excellent guide for smart alerts Layer 2
- ✅ Covers rules, engine, and testing
- ❌ Does NOT cover Toaster component architecture
- ❌ Does NOT mention context requirements

#### ALERTS_PERFORMANCE_OPTIMIZATION_STRATEGY.md
- ✅ Performance optimization strategies
- ❌ Does NOT cover architectural requirements

### Documentation Gap
**❌ CRITICAL**: No documentation exists for:
1. Toaster component placement requirements
2. ChakraProvider context dependencies
3. Proper setup architecture for notification system
4. Troubleshooting context errors

---

## ✅ Solution - The Fix

### Option 1: Move Toaster Inside Provider (RECOMMENDED)
```tsx
<QueryClientProvider>
  <PerformanceProvider>
    <Provider>  {/* ChakraProvider */}
      <AlertsProvider>
        <Router>
          <ErrorBoundaryWrapper>
            <AuthProvider>
              {/* ... All app content ... */}
            </AuthProvider>
          </ErrorBoundaryWrapper>
        </Router>
      </AlertsProvider>
      
      {/* ✅ FIXED: Toaster inside Provider */}
      <Toaster />
    </Provider>
    
    <ReactQueryDevtools />
  </PerformanceProvider>
</QueryClientProvider>
```

**Why this works:**
- ✅ Toaster has access to ChakraProvider context
- ✅ Portal still renders to document.body (z-index stacking works)
- ✅ Theme system accessible for styling
- ✅ All Chakra hooks work correctly

### Option 2: Duplicate Provider for Toaster (NOT RECOMMENDED)
```tsx
<QueryClientProvider>
  <PerformanceProvider>
    <Provider>
      {/* Main app */}
    </Provider>
    
    {/* Separate Provider for Toaster */}
    <Provider>
      <Toaster />
    </Provider>
  </PerformanceProvider>
</QueryClientProvider>
```

**Why NOT recommended:**
- ❌ Duplicates theme system initialization
- ❌ Potential theme inconsistencies
- ❌ Extra memory overhead
- ❌ More complex mental model

---

## 🎯 Implementation Plan

### Step 1: Fix App.tsx
Move `<Toaster />` inside the `<Provider>` component.

**File:** `src/App.tsx`

**Before (Lines 907-920):**
```tsx
        </AlertsProvider>
      </Provider>
      
      {/* 🍞 CHAKRA UI TOASTER - Global toast notifications */}
      <Toaster />
      
      {/* 🔍 TANSTACK QUERY DEVTOOLS - Development only */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </PerformanceProvider>
  </QueryClientProvider>
```

**After:**
```tsx
        </AlertsProvider>
        
        {/* 🍞 CHAKRA UI TOASTER - Global toast notifications */}
        {/* ✅ CRITICAL: Must be inside Provider for Chakra context */}
        <Toaster />
      </Provider>
      
      {/* 🔍 TANSTACK QUERY DEVTOOLS - Development only */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </PerformanceProvider>
  </QueryClientProvider>
```

### Step 2: Verify Portal Behavior
Test that Portal still works correctly:
1. Open dev tools
2. Trigger a toast notification
3. Inspect DOM - verify toast renders in Portal container at document.body

### Step 3: Test Toast Functionality
```tsx
// Test in any component
import { toaster } from '@/shared/ui';

toaster.create({
  title: "Test Toast",
  description: "Verifying Toaster works after fix",
  type: "success",
  duration: 3000
});
```

---

## 📝 Documentation Updates Required

### 1. Create TOASTER_SETUP_GUIDE.md
**Location:** `docs/alert/TOASTER_SETUP_GUIDE.md`

**Contents:**
- Chakra UI context requirements
- Correct Provider hierarchy
- Common pitfalls and errors
- Testing checklist

### 2. Update SMART_ALERTS_GUIDE.md
Add section: **"Toast System Architecture"**

**Contents:**
- Link to TOASTER_SETUP_GUIDE.md
- Quick reference for `toaster.create()`
- Difference between alerts (persistent) vs toasts (temporary)

### 3. Update AGENTS.md
Add to Anti-Patterns section:

```markdown
**❌ DON'T**:
- Place Toaster outside ChakraProvider (breaks context)
```

### 4. Create Quick Reference Card
**File:** `docs/alert/TOAST_QUICK_REFERENCE.md`

**Contents:**
- Import: `import { toaster } from '@/shared/ui'`
- Usage examples
- Type options (success, error, warning, info, loading)
- Best practices

---

## 🧪 Testing Checklist

After applying the fix, verify:

- [ ] App loads without context errors
- [ ] Toasts appear in correct position (bottom-end)
- [ ] Toast styling matches theme
- [ ] Portal renders to document.body
- [ ] Z-index stacking works (toasts on top)
- [ ] Multiple toasts stack correctly
- [ ] Toast actions (dismiss, custom action) work
- [ ] Loading state displays spinner
- [ ] Auto-dismiss works after duration
- [ ] Pause on page idle works
- [ ] Theme switching updates toast colors

---

## 🔍 Related Files to Review

### Critical Files
- `src/App.tsx` - Main app structure ⚠️ FIX HERE
- `src/shared/ui/toaster.tsx` - Toaster component ✅ OK
- `src/shared/ui/provider.tsx` - ChakraProvider wrapper ✅ OK
- `src/shared/ui/index.ts` - Exports ✅ OK

### Usage Files (Verify after fix)
- `src/pages/admin/supply-chain/shared/brands/components/BrandFormModal.tsx`
- `src/modules/suppliers/manifest.tsx`
- `src/modules/sales/manifest.tsx`
- `src/modules/sales/hooks/usePOSCart.ts`
- `src/modules/sales/components/TakeAwayToggle.tsx`
- `src/modules/scheduling/hooks/useShiftForm.tsx`

---

## 📊 Architecture Compliance

### Chakra UI v3 Requirements
✅ **All Chakra components MUST be inside ChakraProvider**

### Project Standards (AGENTS.md)
✅ **Always import from `@/shared/ui` (not `@chakra-ui/react`)**

### Pattern Compliance
```typescript
// ✅ CORRECT - Import from shared UI
import { toaster, Toaster } from '@/shared/ui';

// ❌ WRONG - Never import directly
import { createToaster } from '@chakra-ui/react';
```

---

## 🎓 Lessons Learned

### Why This Happened
1. **Portal Misconception**: Portal was assumed to bypass context requirements
2. **Late Addition**: Toaster may have been added after initial Provider setup
3. **No Documentation**: Context requirements not documented in alerts guide

### Prevention Measures
1. ✅ Add architectural diagram to alerts documentation
2. ✅ Create setup checklist for new UI components
3. ✅ Add lint rule to detect Chakra imports outside Provider (future)
4. ✅ Update onboarding docs with context patterns

---

## 🚀 Status After Fix

### Expected State
```
✅ Toaster renders without context errors
✅ All toast notifications display correctly
✅ Theme integration works
✅ Portal functionality preserved
✅ Documentation complete
```

---

## 📚 References

- [Chakra UI v3 Provider Docs](https://chakra-ui.com/docs/get-started/installation)
- [React Portal Patterns](https://react.dev/reference/react-dom/createPortal)
- Project: `AGENTS.md` - Import patterns
- Project: `ALERTS_ARCHITECTURE_FIX_REPORT.md` - Alert system overview
- Project: `SMART_ALERTS_GUIDE.md` - Smart alerts Layer 2

---

## ✅ Sign-off

**Issue Identified:** January 27, 2026  
**Fix Applied:** [Pending]  
**Documentation Created:** January 27, 2026  
**Testing Complete:** [Pending]  
**Approved By:** [Pending]
