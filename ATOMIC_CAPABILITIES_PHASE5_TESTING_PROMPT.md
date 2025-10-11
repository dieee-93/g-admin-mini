# 🧪 Atomic Capabilities v2.0 - Phase 5 Testing & Validation

**Date**: 2025-01-09
**Status**: Testing Phase
**Priority**: HIGH
**Estimated Time**: 45-60 minutes

---

## 📋 Executive Summary

La **Fase 5** del sistema Atomic Capabilities v2.0 ha sido completada exitosamente. Este prompt guía la **validación E2E completa** usando **Chrome DevTools MCP** para verificar:

1. **CapabilitiesDebugger + Backend Sync** (TAREA 1)
2. **Sistema de Slots Dinámicos** (TAREA 2)
3. **Integración Dashboard** (TAREA 2.4)

**Objetivo**: Verificar que la sincronización DB funciona correctamente y que los widgets dinámicos se renderizan según las features activas.

---

## 🎯 What Was Implemented (Context)

### TAREA 1: CapabilitiesDebugger + Backend Sync ✅

**Files Modified**:
- `src/pages/debug/capabilities/CapabilitiesDebugger.tsx`

**Features Added**:
1. **DB Sync State**:
   - `dbProfile`, `syncStatus`, `lastSyncTime`, `syncError`, `hasDbProfile`
2. **Sync Functions**:
   - `loadDbProfile()` - Carga profile desde Supabase
   - `syncToDb()` - Persiste cambios locales a DB
   - `forceSyncFromDb()` - Sobrescribe local con DB
3. **UI Section "Database Sync Status"**:
   - Badge de estado (✅ Synced | 🔄 Syncing | ❌ Error)
   - StatBoxes (Last Sync, DB Profile Exists, Local Changes)
   - Action Buttons (⬆️ Push to DB, ⬇️ Pull from DB, 🔄 Refresh)
   - Comparison View (Local vs DB con warnings ⚠️)
4. **Real-time Subscription**:
   - Escucha cambios en `business_profiles` table
   - Actualiza UI automáticamente

---

### TAREA 2: Sistema de Slots Dinámicos ✅

**Files Created**:
1. `src/config/SlotRegistry.ts` - 11 slot definitions
2. `src/pages/admin/core/dashboard/components/widgets/SalesWidget.tsx`
3. `src/pages/admin/core/dashboard/components/widgets/InventoryWidget.tsx`
4. `src/pages/admin/core/dashboard/components/widgets/ProductionWidget.tsx`
5. `src/pages/admin/core/dashboard/components/widgets/SchedulingWidget.tsx`

**Files Modified**:
1. `src/config/FeatureRegistry.ts` - Added `getSlotsForActiveFeatures()`, `getSlotsForTarget()`
2. `src/pages/admin/core/dashboard/page.tsx` - Integrated dynamic widgets

**Features Added**:
1. **Slot Registry System**: Mapea features → dynamic components
2. **Widget Components**: Reutilizan componentes existentes (DRY principle)
3. **Dashboard Integration**: Lazy loading + Suspense + responsive grid
4. **Feature-based Rendering**: Widgets aparecen/desaparecen según capabilities

---

## 🧪 Test Plan - Chrome DevTools Flow

### Prerequisites
- ✅ TypeScript compiles (`pnpm -s exec tsc --noEmit`)
- ✅ Dev server running on `http://localhost:5173`
- ✅ Supabase DB accessible
- ✅ Chrome DevTools MCP configured

---

## 🎬 TEST SCENARIO 1: CapabilitiesDebugger - DB Sync

**Objective**: Verify that the debugger correctly syncs with Supabase backend.

### Step 1.1: Navigate to Debugger Page

```
1. Use Chrome DevTools to navigate to the debugger:
   - Tool: navigate_page
   - URL: http://localhost:5173/debug/capabilities
   - Wait for page load (2-3 seconds)

2. Take initial snapshot:
   - Tool: take_snapshot
   - Purpose: Capture initial state of the page

3. Verify sync status section is visible:
   - Look for heading: "🔄 Database Sync Status"
   - Look for badge with text: "✅ Synced" or "🔄 Syncing..."
   - Look for StatBoxes: "Last Sync", "DB Profile Exists", "Local Changes"
```

**Expected Results**:
- ✅ Sync Status section renders
- ✅ Badge shows sync state (✅ Synced | 🔄 Syncing)
- ✅ Last Sync shows timestamp (e.g., "10:23:45 AM")
- ✅ DB Profile Exists shows "Yes" or "No"
- ✅ No console errors (check with `list_console_messages`)

---

### Step 1.2: Test "Push to DB" Button

```
1. Find and click the "Push to DB" button:
   - Tool: take_snapshot (find button uid)
   - Tool: click (use button uid)
   - Button text: "⬆️ Push to DB"

2. Wait for sync to complete:
   - Tool: wait_for
   - Wait for text: "✅ Synced"
   - Timeout: 3000ms

3. Verify sync status updated:
   - Tool: take_snapshot
   - Check: Last Sync timestamp updated
   - Check: Badge shows "✅ Synced"
```

**Expected Results**:
- ✅ Button changes to "Syncing..." during operation
- ✅ Badge changes: 🔄 Syncing → ✅ Synced
- ✅ Last Sync timestamp updates
- ✅ No error alerts visible

---

### Step 1.3: Test "Pull from DB" Button

```
1. Click the "Pull from DB" button:
   - Tool: take_snapshot (find button uid)
   - Tool: click (use button uid)
   - Button text: "⬇️ Pull from DB"

2. Handle confirmation dialog:
   - Tool: handle_dialog
   - Action: accept
   - (Confirms: "¿Sobrescribir estado local con datos de la DB?")

3. Wait for sync to complete:
   - Tool: wait_for
   - Wait for text: "✅ Synced"
   - Timeout: 3000ms

4. Verify local state updated:
   - Tool: take_snapshot
   - Check: Activities/Infrastructure counts may change
   - Check: Comparison view shows matching values
```

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Local state overwrites with DB data
- ✅ Comparison view shows Local = DB (no ⚠️ warnings)
- ✅ Badge shows "✅ Synced"

---

### Step 1.4: Test Local vs DB Comparison

```
1. Toggle an activity to create local change:
   - Tool: take_snapshot (find activity toggle uid)
   - Tool: click (toggle switch)
   - Example: Toggle "sells_products" activity

2. Verify comparison view shows difference:
   - Tool: take_snapshot
   - Look for: "Selected Activities" row
   - Check: Orange badge on DB value
   - Check: ⚠️ warning icon visible

3. Push change to DB:
   - Tool: click (⬆️ Push to DB button)
   - Wait for sync

4. Verify comparison matches again:
   - Tool: take_snapshot
   - Check: No ⚠️ warnings
   - Check: Green badges on both Local and DB
```

**Expected Results**:
- ✅ Comparison shows differences immediately
- ✅ Warning icons (⚠️) appear on mismatches
- ✅ After sync, comparison shows matching values
- ✅ Badge colors change: orange → green

---

### Step 1.5: Verify Real-time Subscription (Advanced)

```
1. Open second browser tab (simulate multi-device):
   - Tool: new_page
   - URL: http://localhost:5173/debug/capabilities

2. Make change in Tab 1:
   - Tool: select_page (tab 1)
   - Tool: click (toggle activity)
   - Tool: click (⬆️ Push to DB)

3. Check Tab 2 auto-updates:
   - Tool: select_page (tab 2)
   - Tool: wait_for (wait for Last Sync timestamp change)
   - Timeout: 5000ms

4. Verify real-time sync worked:
   - Tool: take_snapshot (tab 2)
   - Check: Activity count updated without manual refresh
```

**Expected Results**:
- ✅ Tab 2 shows "Last Sync" timestamp updates automatically
- ✅ Activity counts sync between tabs
- ✅ No manual refresh needed

---

## 🎬 TEST SCENARIO 2: Dynamic Widgets System

**Objective**: Verify that widgets render dynamically based on active features.

### Step 2.1: Navigate to Dashboard

```
1. Navigate to dashboard:
   - Tool: navigate_page
   - URL: http://localhost:5173/admin/dashboard
   - Wait for page load

2. Take initial snapshot:
   - Tool: take_snapshot
   - Look for section: "📊 Tus Widgets Personalizados"

3. Count visible widgets:
   - Tool: evaluate_script
   - Script: () => document.querySelectorAll('[data-widget]').length
   - (Note: Widgets may not have data-widget, count cards instead)
```

**Expected Results**:
- ✅ Dashboard loads successfully
- ✅ "Tus Widgets Personalizados" section visible (if features active)
- ✅ Widgets render based on active features

---

### Step 2.2: Verify Widget Rendering Logic

```
1. Check which features are active:
   - Tool: navigate_page
   - URL: http://localhost:5173/debug/capabilities
   - Tool: take_snapshot
   - Note: Count features in "Active Conditional Features"

2. Return to dashboard:
   - Tool: navigate_page
   - URL: http://localhost:5173/admin/dashboard

3. Verify widget count matches features:
   - sales_order_management → SalesWidget should show
   - inventory_stock_tracking → InventoryWidget should show
   - production_kitchen_display → ProductionWidget should show
   - scheduling_shift_management → SchedulingWidget should show

4. Take screenshot for visual confirmation:
   - Tool: take_screenshot
   - Save as: dashboard_widgets_initial.png
```

**Expected Results**:
- ✅ If `sales_order_management` active → SalesWidget renders
- ✅ If `inventory_stock_tracking` active → InventoryWidget renders
- ✅ Widget section hidden if NO features active
- ✅ Lazy loading works (Suspense fallback may briefly show)

---

### Step 2.3: Test Dynamic Widget Addition

```
1. Go to debugger and activate a feature:
   - Tool: navigate_page
   - URL: http://localhost:5173/debug/capabilities
   - Tool: take_snapshot (find activity toggle)
   - Tool: click (toggle "sells_products" activity)
   - Tool: click (⬆️ Push to DB)

2. Return to dashboard:
   - Tool: navigate_page
   - URL: http://localhost:5173/admin/dashboard

3. Verify new widget appeared:
   - Tool: take_snapshot
   - Look for: SalesWidget (Revenue + Transactions metrics)

4. Take screenshot:
   - Tool: take_screenshot
   - Save as: dashboard_widgets_after_activation.png
```

**Expected Results**:
- ✅ New widget appears after feature activation
- ✅ Widget displays correct data (Revenue, Transactions, etc.)
- ✅ Grid layout adjusts (1 col mobile, 2 tablet, 3 desktop)

---

### Step 2.4: Test Dynamic Widget Removal

```
1. Deactivate a feature in debugger:
   - Tool: navigate_page
   - URL: http://localhost:5173/debug/capabilities
   - Tool: click (toggle activity OFF)
   - Tool: click (⬆️ Push to DB)

2. Return to dashboard:
   - Tool: navigate_page
   - URL: http://localhost:5173/admin/dashboard

3. Verify widget removed:
   - Tool: take_snapshot
   - Confirm: Widget no longer visible

4. If NO features active, verify section hides:
   - Check: "Tus Widgets Personalizados" section not in DOM
```

**Expected Results**:
- ✅ Widget disappears after feature deactivation
- ✅ Grid re-flows correctly
- ✅ Section hides if no widgets to show

---

## 🎬 TEST SCENARIO 3: Error Handling & Edge Cases

### Step 3.1: Test Network Error Handling

```
1. Simulate offline mode:
   - Tool: emulate_network
   - Throttling: "No emulation" → Disable network (if possible)
   - Alternative: Use evaluate_script to mock fetch errors

2. Try to sync in debugger:
   - Tool: navigate_page
   - URL: http://localhost:5173/debug/capabilities
   - Tool: click (⬆️ Push to DB)

3. Verify error handling:
   - Tool: wait_for
   - Wait for: "❌ Error" badge or error alert
   - Tool: take_snapshot
   - Check: Error message displayed
   - Check: Sync status shows "error"

4. Re-enable network and retry:
   - Tool: emulate_network
   - Throttling: "No emulation"
   - Tool: click (🔄 Refresh)
   - Verify: Sync recovers
```

**Expected Results**:
- ✅ Error badge appears (❌ Error)
- ✅ Error message shows in alert
- ✅ Sync status = 'error'
- ✅ Can recover after network restored

---

### Step 3.2: Test Empty State (No Widgets)

```
1. Deactivate ALL features:
   - Tool: navigate_page
   - URL: http://localhost:5173/debug/capabilities
   - For each active activity/infrastructure:
     - Tool: click (toggle OFF)
   - Tool: click (⬆️ Push to DB)

2. Go to dashboard:
   - Tool: navigate_page
   - URL: http://localhost:5173/admin/dashboard

3. Verify widgets section hidden:
   - Tool: take_snapshot
   - Confirm: "Tus Widgets Personalizados" section NOT visible
   - Confirm: ExecutiveOverview still shows (always visible)
```

**Expected Results**:
- ✅ Widget section completely hidden (not just empty)
- ✅ Other dashboard sections still render
- ✅ No console errors

---

### Step 3.3: Test Console for Errors

```
1. Navigate through all test pages:
   - /debug/capabilities
   - /admin/dashboard

2. Check console messages:
   - Tool: list_console_messages
   - Filter: Look for errors (level: 'error')

3. Verify no critical errors:
   - Allowed: INFO logs from logger.info()
   - Not allowed: TypeErrors, ReferenceErrors, Network errors
```

**Expected Results**:
- ✅ No TypeErrors or ReferenceErrors
- ✅ INFO logs present (from logger.info())
- ✅ WARN logs acceptable for non-critical issues

---

## 📊 Success Criteria Checklist

### TAREA 1: CapabilitiesDebugger + Backend
- [ ] Sync Status section renders correctly
- [ ] Badge shows correct state (✅/🔄/❌)
- [ ] "Push to DB" button persists changes
- [ ] "Pull from DB" button overwrites local
- [ ] Comparison view highlights differences
- [ ] Real-time subscription works
- [ ] Error handling displays messages
- [ ] No console errors

### TAREA 2: Dynamic Slots System
- [ ] SlotRegistry loads 11+ definitions
- [ ] getSlotsForActiveFeatures() returns correct slots
- [ ] getSlotsForTarget() filters by target
- [ ] Widgets render only if features active
- [ ] Priority ordering works (high priority first)
- [ ] Lazy loading shows skeleton loader
- [ ] Dashboard updates on feature changes
- [ ] Grid responsive (1/2/3 columns)

### Overall System Health
- [ ] TypeScript compiles (0 errors)
- [ ] No memory leaks (check DevTools Memory)
- [ ] Network requests successful (check Network tab)
- [ ] Real-time sync works across tabs
- [ ] Error recovery works

---

## 🔧 Testing Tools Reference

### Chrome DevTools MCP Tools Available:
1. `navigate_page` - Navigate to URL
2. `take_snapshot` - Capture page text content with UIDs
3. `take_screenshot` - Visual screenshot (PNG)
4. `click` - Click element by UID
5. `fill` - Fill form inputs
6. `wait_for` - Wait for text to appear
7. `evaluate_script` - Run JavaScript in page
8. `handle_dialog` - Accept/dismiss browser dialogs
9. `list_console_messages` - Get console logs
10. `list_network_requests` - Get network activity
11. `emulate_network` - Throttle network
12. `list_pages` - List all open tabs
13. `select_page` - Switch to tab by index
14. `new_page` - Open new tab

---

## 📝 Test Execution Workflow

### Phase 1: Setup (5 min)
1. Verify dev server running (`http://localhost:5173`)
2. List pages with `list_pages`
3. Navigate to debugger `/debug/capabilities`
4. Take initial snapshot

### Phase 2: DB Sync Testing (15 min)
1. Test "Push to DB" (Step 1.2)
2. Test "Pull from DB" (Step 1.3)
3. Test Comparison View (Step 1.4)
4. Test Real-time Sync (Step 1.5) - Optional

### Phase 3: Dynamic Widgets Testing (15 min)
1. Navigate to dashboard (Step 2.1)
2. Verify widget rendering (Step 2.2)
3. Test widget addition (Step 2.3)
4. Test widget removal (Step 2.4)

### Phase 4: Error Handling (10 min)
1. Test network errors (Step 3.1)
2. Test empty state (Step 3.2)
3. Check console logs (Step 3.3)

### Phase 5: Reporting (5 min)
1. Collect screenshots
2. Review console messages
3. Verify all checkboxes ✅
4. Generate test summary

---

## 🎯 Expected Final State

After completing all tests:

1. **CapabilitiesDebugger**:
   - Sync Status shows ✅ Synced
   - Last Sync timestamp updated
   - DB Profile Exists = Yes
   - Local vs DB comparison shows matching values
   - No ⚠️ warnings

2. **Dashboard**:
   - Widgets render based on active features
   - Grid layout responsive
   - Lazy loading works (brief skeleton)
   - Section hides if no features active

3. **System Health**:
   - No console errors
   - Network requests succeed
   - Real-time sync functional
   - TypeScript compiles

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ Mark Phase 5 as COMPLETE
2. ✅ Update `ATOMIC_CAPABILITIES_VALIDATION_REPORT.md`
3. ✅ Create git commit: `feat: complete Atomic Capabilities v2.0 Phase 5 - DB Sync + Dynamic Slots`
4. ✅ Proceed to User Acceptance Testing (UAT)

If tests fail:
1. ❌ Document failing scenarios
2. ❌ Check console for error messages
3. ❌ Review network requests for failed calls
4. ❌ Fix issues and re-run tests

---

**END OF TESTING PROMPT**

---

## 📚 Additional Resources

- **Implementation Report**: `ATOMIC_CAPABILITIES_PHASE5_PROMPT.md`
- **Design Spec**: `docs/ATOMIC_CAPABILITIES_TECHNICAL_SPEC.md`
- **E2E Test Results**: `ATOMIC_CAPABILITIES_E2E_TEST_RESULTS.md`
- **Validation Report**: `ATOMIC_CAPABILITIES_VALIDATION_REPORT.md`

**Ready to test?** 🧪🚀
