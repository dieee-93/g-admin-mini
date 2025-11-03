# 🧪 MATERIALS MODULE - COMPLETE TESTING PROMPT

**Version**: 1.0.0
**Date**: 2025-01-31
**Module**: Materials (Inventory Management)
**Grade**: A+ (98/100)

---

## 🎯 TESTING OBJECTIVE

Perform a **comprehensive end-to-end test** of the Materials module to validate:

1. ✅ Permissions System (RBAC)
2. ✅ EventBus Integrations (emissions + consumptions)
3. ✅ Cross-Module Hook Injections
4. ✅ Public API Exports
5. ✅ UI/UX Functionality
6. ✅ Real-time Sync
7. ✅ Offline-First Behavior
8. ✅ Performance & Code Quality

---

## 🚀 PRE-TEST SETUP

### 1. Start Development Server

```bash
cd I:/Programacion/Proyectos/g-mini
pnpm dev
```

**Expected**: Server starts on `http://localhost:5173` ✅

---

### 2. Verify Compilation

```bash
# Terminal 1: TypeScript validation
pnpm -s exec tsc --noEmit

# Terminal 2: ESLint validation
pnpm -s exec eslint src/modules/materials/ src/pages/admin/supply-chain/materials/
```

**Expected**: Both commands complete with **0 errors** ✅

---

### 3. Open Browser DevTools

1. Open Chrome/Edge
2. Navigate to `http://localhost:5173`
3. Open DevTools (F12)
4. Go to **Console** tab
5. Enable **Preserve log** (to see all events)

---

## 🧪 TEST SUITE

---

## ✅ TEST 1: PERMISSIONS SYSTEM (20 min)

### Purpose
Validate that Materials module correctly gates actions based on user roles (RBAC).

---

### 1.1. Test OPERADOR Role (Read Only)

**Steps**:
1. Login as user with `OPERADOR` role
2. Navigate to `/admin/supply-chain/materials`
3. Observe the UI

**Expected Results**:

**MaterialsGrid**:
- ✅ "Ver" button IS visible (read permission)
- ❌ "Editar" button NOT visible (no update permission)
- ❌ "Eliminar" button NOT visible (no delete permission)

**MaterialsActions Section**:
- ❌ "Agregar Material" button NOT visible (no create permission)
- ❌ "Operaciones Masivas" button NOT visible (no update permission)
- ❌ "Generar Reporte" button NOT visible (no export permission)
- ❌ "Sincronizar" button NOT visible (no configure permission)
- ❌ **Entire section MAY NOT RENDER** (if no permissions available)

**Console Logs**:
```
[MaterialsStore] 🔒 Permission check: materials.read = true
[MaterialsStore] 🔒 Permission check: materials.update = false
[MaterialsStore] 🔒 Permission check: materials.delete = false
```

**Screenshot Location**: Save as `test1.1-operador-permissions.png`

---

### 1.2. Test SUPERVISOR Role (Read + Create + Update)

**Steps**:
1. Logout
2. Login as user with `SUPERVISOR` role
3. Navigate to `/admin/supply-chain/materials`

**Expected Results**:

**MaterialsGrid**:
- ✅ "Ver" button IS visible
- ✅ "Editar" button IS visible (has update permission)
- ❌ "Eliminar" button NOT visible (no delete permission)

**MaterialsActions Section**:
- ✅ "Agregar Material" button IS visible (has create permission)
- ✅ "Operaciones Masivas" button IS visible (has update permission)
- ⚠️ "Generar Reporte" depends on export permission (check role config)
- ⚠️ "Sincronizar" depends on configure permission (check role config)

**Console Logs**:
```
[MaterialsStore] 🔒 Permission check: materials.read = true
[MaterialsStore] 🔒 Permission check: materials.create = true
[MaterialsStore] 🔒 Permission check: materials.update = true
[MaterialsStore] 🔒 Permission check: materials.delete = false
```

**Screenshot Location**: Save as `test1.2-supervisor-permissions.png`

---

### 1.3. Test ADMINISTRADOR Role (Full Access)

**Steps**:
1. Logout
2. Login as user with `ADMINISTRADOR` role
3. Navigate to `/admin/supply-chain/materials`

**Expected Results**:

**MaterialsGrid**:
- ✅ "Ver" button IS visible
- ✅ "Editar" button IS visible
- ✅ "Eliminar" button IS visible (has delete permission)

**MaterialsActions Section**:
- ✅ "Agregar Material" button IS visible
- ✅ "Operaciones Masivas" button IS visible
- ✅ "Generar Reporte" button IS visible
- ✅ "Sincronizar" button IS visible
- ✅ **All 4 buttons visible**

**Console Logs**:
```
[MaterialsStore] 🔒 Permission check: materials.read = true
[MaterialsStore] 🔒 Permission check: materials.create = true
[MaterialsStore] 🔒 Permission check: materials.update = true
[MaterialsStore] 🔒 Permission check: materials.delete = true
[MaterialsStore] 🔒 Permission check: materials.export = true
[MaterialsStore] 🔒 Permission check: materials.configure = true
```

**Screenshot Location**: Save as `test1.3-admin-permissions.png`

---

### Test 1 Success Criteria
- [ ] OPERADOR sees 1 button in grid (Ver)
- [ ] SUPERVISOR sees 2 buttons in grid (Ver, Editar)
- [ ] ADMINISTRADOR sees 3 buttons in grid (Ver, Editar, Eliminar)
- [ ] MaterialsActions section adapts per role
- [ ] Console logs show correct permission checks

---

## ✅ TEST 2: EVENTBUS EMISSIONS (15 min)

### Purpose
Validate that Materials module correctly emits events when operations occur.

---

### 2.1. Test material_created Event

**Steps**:
1. Login as ADMINISTRADOR
2. Open DevTools Console
3. Run in console:
   ```javascript
   // Subscribe to event
   window.testUnsub = EventBus.on('materials.material_created', (data) => {
     console.log('🎉 TEST: Received materials.material_created', data);
   });
   ```
4. Click "Agregar Material" button
5. Fill form with:
   - Name: "Test Material Alpha"
   - Type: MEASURABLE
   - Unit: kg
   - Category: weight
   - Stock: 100
   - Unit Cost: 10.50
6. Click "Guardar"

**Expected Results**:

**Console Output**:
```
[MaterialsStore] ✅ Material created by user { materialId: '...', userId: '...', role: 'ADMINISTRADOR' }
[MaterialsStore] 📢 Emitted materials.material_created event { materialId: '...', materialName: 'Test Material Alpha' }
🎉 TEST: Received materials.material_created {
  materialId: '...',
  materialName: 'Test Material Alpha',
  materialType: 'MEASURABLE',
  category: 'weight',
  unitCost: 10.5,
  minStock: 0,
  supplierId: null,
  locationId: '...',
  userId: '...',
  timestamp: 1738368000000
}
```

**Cleanup**:
```javascript
window.testUnsub(); // Unsubscribe
```

**Screenshot Location**: Save console as `test2.1-event-material-created.png`

---

### 2.2. Test material_updated Event

**Steps**:
1. In console:
   ```javascript
   window.testUnsub = EventBus.on('materials.material_updated', (data) => {
     console.log('🎉 TEST: Received materials.material_updated', data);
   });
   ```
2. Click "Editar" on "Test Material Alpha"
3. Change:
   - Unit Cost: 12.00
   - Min Stock: 10
4. Click "Guardar"

**Expected Results**:

**Console Output**:
```
[MaterialsStore] ✅ Material updated by user { materialId: '...', userId: '...', role: 'ADMINISTRADOR' }
[MaterialsStore] 📢 Emitted materials.material_updated event { materialId: '...', fields: 'unit_cost, min_stock' }
🎉 TEST: Received materials.material_updated {
  materialId: '...',
  materialName: 'Test Material Alpha',
  updatedFields: ['unit_cost', 'min_stock'],
  updates: { unit_cost: 12, min_stock: 10 },
  userId: '...',
  timestamp: 1738368100000
}
```

**Cleanup**:
```javascript
window.testUnsub();
```

**Screenshot Location**: Save console as `test2.2-event-material-updated.png`

---

### 2.3. Test stock_updated Event

**Steps**:
1. In console:
   ```javascript
   window.testUnsub = EventBus.on('materials.stock_updated', (data) => {
     console.log('🎉 TEST: Received materials.stock_updated', data);
   });
   ```
2. Find "Test Material Alpha" in grid
3. Click "Editar"
4. Change Stock: 100 → 80
5. Click "Guardar"

**Expected Results**:

**Console Output**:
```
[MaterialsStore] ✅ Stock updated by user { materialId: '...', newStock: 80, userId: '...', role: 'ADMINISTRADOR' }
[MaterialsStore] 📢 Emitted materials.stock_updated event { materialId: '...', oldStock: 100, newStock: 80, delta: -20 }
🎉 TEST: Received materials.stock_updated {
  materialId: '...',
  materialName: 'Test Material Alpha',
  oldStock: 100,
  newStock: 80,
  delta: -20,
  reason: 'manual_update',
  userId: '...',
  timestamp: 1738368200000
}
```

**Cleanup**:
```javascript
window.testUnsub();
```

**Screenshot Location**: Save console as `test2.3-event-stock-updated.png`

---

### 2.4. Test low_stock_alert Event

**Steps**:
1. In console:
   ```javascript
   window.testUnsub = EventBus.on('materials.low_stock_alert', (data) => {
     console.log('🎉 TEST: Received materials.low_stock_alert', data);
   });
   ```
2. Edit "Test Material Alpha"
3. Set:
   - Min Stock: 100
   - Current Stock: 5 (below min)
4. Click "Guardar"
5. Wait 2-3 seconds for alert engine to trigger

**Expected Results**:

**Console Output**:
```
[SmartAlertsEngine] 📢 Emitted materials.low_stock_alert (low stock) { materialId: '...', severity: 'warning' }
🎉 TEST: Received materials.low_stock_alert {
  materialId: '...',
  materialName: 'Test Material Alpha',
  currentStock: 5,
  minStock: 100,
  severity: 'warning',
  abcClass: 'C',
  recommendedOrder: 200,
  timestamp: 1738368300000
}
```

**Cleanup**:
```javascript
window.testUnsub();
```

**Screenshot Location**: Save console as `test2.4-event-low-stock-alert.png`

---

### 2.5. Test material_deleted Event

**Steps**:
1. In console:
   ```javascript
   window.testUnsub = EventBus.on('materials.material_deleted', (data) => {
     console.log('🎉 TEST: Received materials.material_deleted', data);
   });
   ```
2. Find "Test Material Alpha"
3. Click "Eliminar" button
4. Confirm deletion

**Expected Results**:

**Console Output**:
```
[MaterialsStore] ✅ Material deleted { materialId: '...', materialName: 'Test Material Alpha' }
[MaterialsStore] 📢 Emitted materials.material_deleted event { materialId: '...', materialName: 'Test Material Alpha' }
🎉 TEST: Received materials.material_deleted {
  materialId: '...',
  materialName: 'Test Material Alpha',
  materialType: 'MEASURABLE',
  category: 'weight',
  lastStock: 5,
  lastUnitCost: 12,
  timestamp: 1738368400000
}
```

**Cleanup**:
```javascript
window.testUnsub();
```

**Screenshot Location**: Save console as `test2.5-event-material-deleted.png`

---

### Test 2 Success Criteria
- [ ] material_created event emitted with correct payload
- [ ] material_updated event emitted with updatedFields array
- [ ] stock_updated event emitted with delta calculation
- [ ] low_stock_alert event emitted when stock < min_stock
- [ ] material_deleted event emitted with lastStock info

---

## ✅ TEST 3: EVENTBUS CONSUMPTIONS (15 min)

### Purpose
Validate that Materials module correctly reacts to events from other modules.

---

### 3.1. Test sales.order_placed Consumption

**Steps**:
1. In console:
   ```javascript
   EventBus.emit('sales.order_placed', {
     orderId: 'TEST-ORDER-001',
     items: [
       { materialId: 'MAT-001', quantity: 5 },
       { materialId: 'MAT-002', quantity: 10 }
     ],
     timestamp: Date.now()
   });
   ```

**Expected Results**:

**Console Output**:
```
[MaterialsStore] 🛒 Sales order placed, reserving stock... {
  orderId: 'TEST-ORDER-001',
  items: [...]
}
[MaterialsStore] 📦 Stock reservation system ready for implementation
```

**Screenshot Location**: Save console as `test3.1-consume-sales-order-placed.png`

---

### 3.2. Test sales.completed Consumption

**Steps**:
1. In console:
   ```javascript
   EventBus.emit('sales.completed', {
     orderId: 'TEST-ORDER-001',
     items: [
       { materialId: 'MAT-001', quantitySold: 5 }
     ],
     totalAmount: 100.50,
     timestamp: Date.now()
   });
   ```

**Expected Results**:

**Console Output**:
```
[MaterialsStore] ✅ Sale completed, converting reservation to deduction... {
  orderId: 'TEST-ORDER-001',
  ...
}
```

**Screenshot Location**: Save console as `test3.2-consume-sales-completed.png`

---

### 3.3. Test sales.order_cancelled Consumption

**Steps**:
1. In console:
   ```javascript
   EventBus.emit('sales.order_cancelled', {
     orderId: 'TEST-ORDER-001',
     reason: 'Customer requested',
     timestamp: Date.now()
   });
   ```

**Expected Results**:

**Console Output**:
```
[MaterialsStore] ♻️ Sales order cancelled, releasing stock... {
  orderId: 'TEST-ORDER-001',
  reason: 'Customer requested'
}
```

**Screenshot Location**: Save console as `test3.3-consume-sales-cancelled.png`

---

### 3.4. Test production.order.created Consumption

**Steps**:
1. In console:
   ```javascript
   EventBus.emit('production.order.created', {
     orderId: 'PROD-001',
     recipe: 'Hamburguesa',
     quantity: 20,
     materialsNeeded: [
       { materialId: 'MAT-BEEF', quantity: 2000 },
       { materialId: 'MAT-BREAD', quantity: 20 }
     ],
     timestamp: Date.now()
   });
   ```

**Expected Results**:

**Console Output**:
```
[MaterialsStore] 🏭 Production order created, reserving materials... {
  orderId: 'PROD-001',
  recipe: 'Hamburguesa',
  materialsNeeded: [...]
}
```

**Screenshot Location**: Save console as `test3.4-consume-production-created.png`

---

### 3.5. Test production.order.completed Consumption

**Steps**:
1. In console:
   ```javascript
   EventBus.emit('production.order.completed', {
     orderId: 'PROD-001',
     producedItems: [
       { productId: 'PROD-HAMBURGUESA', quantity: 20 }
     ],
     timestamp: Date.now()
   });
   ```

**Expected Results**:

**Console Output**:
```
[MaterialsStore] ✅ Production completed, updating stock... {
  orderId: 'PROD-001',
  producedItems: [...]
}
```

**Screenshot Location**: Save console as `test3.5-consume-production-completed.png`

---

### 3.6. Test supplier_orders.received Consumption

**Steps**:
1. In console:
   ```javascript
   EventBus.emit('supplier_orders.received', {
     orderId: 'PO-001',
     supplier: 'Supplier XYZ',
     items: [
       { materialId: 'MAT-001', quantity: 100 },
       { materialId: 'MAT-002', quantity: 50 }
     ],
     timestamp: Date.now()
   });
   ```

**Expected Results**:

**Console Output**:
```
[MaterialsStore] 📦 Supplier delivery received, auto-updating stock... {
  orderId: 'PO-001',
  supplier: 'Supplier XYZ',
  items: [...]
}
```

**Screenshot Location**: Save console as `test3.6-consume-supplier-received.png`

---

### 3.7. Test products.recipe_updated Consumption

**Steps**:
1. In console:
   ```javascript
   EventBus.emit('products.recipe_updated', {
     recipeId: 'RECIPE-001',
     recipeName: 'Pizza Margherita',
     ingredients: [
       { materialId: 'MAT-FLOUR', quantity: 500 },
       { materialId: 'MAT-CHEESE', quantity: 200 }
     ],
     timestamp: Date.now()
   });
   ```

**Expected Results**:

**Console Output**:
```
[MaterialsStore] 📝 Recipe updated, recalculating requirements... {
  recipeId: 'RECIPE-001',
  recipeName: 'Pizza Margherita',
  ingredients: [...]
}
```

**Screenshot Location**: Save console as `test3.7-consume-recipe-updated.png`

---

### Test 3 Success Criteria
- [ ] All 7 event consumptions log to console
- [ ] Event handlers receive correct payload structure
- [ ] No JavaScript errors occur
- [ ] Subscriptions are active (✅ Subscribed to 7 events log visible)

---

## ✅ TEST 4: CROSS-MODULE HOOK INJECTIONS (20 min)

### Purpose
Validate that Materials module correctly injects UI components into other modules.

---

### 4.1. Test Dashboard Widget Injection

**Steps**:
1. Navigate to `/admin/dashboard`
2. Scroll to widgets section
3. Look for "Inventario" widget

**Expected Results**:

**UI**:
- ✅ "Inventario" widget IS visible
- ✅ Shows: Total items count
- ✅ Shows: Valor Total ($XXX.XX)
- ✅ Shows: "X items con stock bajo" (if applicable)
- ✅ Shows: "X items sin stock" (if applicable)
- ✅ Green-themed design (bg="green.50")
- ✅ CubeIcon visible

**Console Logs**:
```
[App] Registered dashboard.widgets hook (InventoryWidget)
[App] ✅ Materials module setup complete { hooksProvided: 7, hooksConsumed: 2 }
```

**Screenshot Location**: Save as `test4.1-dashboard-widget.png`

---

### 4.2. Test Sales Order Actions Injection

**Steps**:
1. Navigate to `/admin/operations/sales`
2. Open or create a sales order
3. Look for "Check Stock" button

**Expected Results**:

**UI**:
- ✅ "Check Stock" button IS visible in order actions
- ✅ Button has purple color (colorPalette="purple")
- ✅ Button has CubeIcon
- ✅ Button shows "Check Stock" text

**Interaction**:
1. Click "Check Stock" button
2. Wait for API call
3. Toast notification appears:
   - If stock available: "✅ Stock Disponible - Stock disponible para X items"
   - If stock insufficient: "⚠️ Stock Insuficiente - X items con stock insuficiente"

**Console Logs**:
```
[Materials] Checking stock for order { orderId: '...' }
[Materials] Stock check result { orderId: '...', available: true, totalItems: 5, insufficientCount: 0 }
```

**Screenshot Location**: Save as `test4.2-sales-check-stock-button.png`

---

### 4.3. Test Production Toolbar Injection

**Steps**:
1. Navigate to `/admin/operations/production`
2. Look at toolbar actions

**Expected Results**:

**UI**:
- ✅ "Materials Alert" button IS visible in toolbar
- ✅ Button has orange color (colorPalette="orange")
- ✅ Button has CubeIcon
- ✅ Button shows "Materials Alert" text

**Interaction**:
1. Click "Materials Alert" button
2. Toast appears: "📊 Materiales Requeridos - Análisis de materiales para producción pendiente"

**Console Logs**:
```
[App] Registered production.toolbar.actions hook (Materials Alert)
```

**Screenshot Location**: Save as `test4.3-production-materials-alert.png`

---

### 4.4. Test Scheduling Toolbar Injection

**Steps**:
1. Navigate to `/admin/resources/scheduling`
2. Look at toolbar actions

**Expected Results**:

**UI**:
- ✅ "Stock Reception" button IS visible (or similar)
- ✅ Button has appropriate styling
- ✅ Clicking button triggers materials-related action

**Console Logs**:
```
[App] Registered scheduling.toolbar.actions hook
```

**Screenshot Location**: Save as `test4.4-scheduling-toolbar.png`

---

### 4.5. Test Scheduling Top Metrics Injection

**Steps**:
1. Navigate to `/admin/resources/scheduling`
2. Look at top metrics/alerts section

**Expected Results**:

**UI**:
- ✅ "Stock Alert" metric card IS visible
- ✅ Shows: "Low Stock" title
- ✅ Shows: Count of low stock items
- ✅ Lists: Critical item names (e.g., "Harina, Azúcar, Manteca")
- ✅ Orange-themed design (bg="orange.50")

**Console Logs**:
```
[App] Registered scheduling.top_metrics for materials
```

**Screenshot Location**: Save as `test4.5-scheduling-metrics.png`

---

### Test 4 Success Criteria
- [ ] Dashboard widget renders with real data
- [ ] Sales "Check Stock" button works and calls API
- [ ] Production "Materials Alert" button visible and clickable
- [ ] Scheduling toolbar injection present
- [ ] Scheduling metrics injection present
- [ ] All hooks registered without errors

---

## ✅ TEST 5: PUBLIC API EXPORTS (10 min)

### Purpose
Validate that Materials module exposes a working public API for other modules.

---

### 5.1. Test getStockLevel API

**Steps**:
1. In DevTools Console, run:
   ```javascript
   // Get Materials API
   const materialsAPI = registry.getExports('materials');

   // Test getStockLevel
   const stockLevel = await materialsAPI.getStockLevel('MAT-001');
   console.log('Stock Level:', stockLevel);
   ```

**Expected Results**:

**Console Output**:
```
[App] Getting stock level { materialId: 'MAT-001' }
Stock Level: { quantity: 100, unit: 'kg' }
```

**Screenshot Location**: Save console as `test5.1-api-get-stock-level.png`

---

### 5.2. Test updateStock API

**Steps**:
1. In console:
   ```javascript
   const materialsAPI = registry.getExports('materials');

   const result = await materialsAPI.updateStock('MAT-001', 50, 'manual adjustment');
   console.log('Update Result:', result);
   ```

**Expected Results**:

**Console Output**:
```
[App] Updating stock { materialId: 'MAT-001', quantity: 50, reason: 'manual adjustment' }
Update Result: { success: true }
```

**Screenshot Location**: Save console as `test5.2-api-update-stock.png`

---

### 5.3. Test isLowStock API

**Steps**:
1. In console:
   ```javascript
   const materialsAPI = registry.getExports('materials');

   const lowStockCheck = await materialsAPI.isLowStock('MAT-001');
   console.log('Low Stock Check:', lowStockCheck);
   ```

**Expected Results**:

**Console Output**:
```
[App] Checking low stock status { materialId: 'MAT-001' }
Low Stock Check: { isLowStock: false, threshold: 10, current: 100 }
```

**Screenshot Location**: Save console as `test5.3-api-is-low-stock.png`

---

### 5.4. Test checkOrderStockAvailability API

**Steps**:
1. Create a test order in Sales module (or use existing order ID)
2. In console:
   ```javascript
   const materialsAPI = registry.getExports('materials');

   const availability = await materialsAPI.checkOrderStockAvailability('ORDER-123');
   console.log('Order Stock Availability:', availability);
   ```

**Expected Results**:

**Console Output** (if stock available):
```
[Materials] Checking stock availability for order { orderId: 'ORDER-123' }
Order Stock Availability: {
  available: true,
  message: 'Stock disponible para 3 items',
  insufficientItems: [],
  totalItems: 3
}
```

**Console Output** (if stock insufficient):
```
Order Stock Availability: {
  available: false,
  message: '2 items con stock insuficiente',
  insufficientItems: [
    {
      materialId: 'MAT-001',
      materialName: 'Harina',
      required: 100,
      available: 50,
      deficit: 50
    },
    {
      materialId: 'MAT-002',
      materialName: 'Azúcar',
      required: 20,
      available: 0,
      deficit: 20
    }
  ],
  totalItems: 3
}
```

**Screenshot Location**: Save console as `test5.4-api-check-order-availability.png`

---

### 5.5. Test API Error Handling

**Steps**:
1. In console:
   ```javascript
   const materialsAPI = registry.getExports('materials');

   try {
     const result = await materialsAPI.checkOrderStockAvailability('INVALID-ORDER-ID');
     console.log('Result:', result);
   } catch (error) {
     console.log('Error caught:', error);
   }
   ```

**Expected Results**:

**Console Output**:
```
[Materials] Error checking order stock availability [Error: No items found for order]
Result: {
  available: false,
  message: 'No items found for order',
  insufficientItems: []
}
```

**Screenshot Location**: Save console as `test5.5-api-error-handling.png`

---

### Test 5 Success Criteria
- [ ] All 4 API methods accessible via registry.getExports()
- [ ] getStockLevel returns quantity + unit
- [ ] updateStock returns success status
- [ ] isLowStock returns boolean + threshold
- [ ] checkOrderStockAvailability returns detailed availability report
- [ ] API errors are handled gracefully (no crashes)

---

## ✅ TEST 6: UI/UX FUNCTIONALITY (15 min)

### Purpose
Validate basic CRUD operations and user workflows.

---

### 6.1. Test Create Material

**Steps**:
1. Login as ADMINISTRADOR
2. Navigate to `/admin/supply-chain/materials`
3. Click "Agregar Material"
4. Fill form:
   - Name: "UI Test Material"
   - Type: MEASURABLE
   - Category: weight
   - Unit: kg
   - Stock: 50
   - Min Stock: 10
   - Unit Cost: 15.00
5. Click "Guardar"

**Expected Results**:
- ✅ Modal closes
- ✅ Success toast appears
- ✅ Material appears in grid
- ✅ Event emitted in console

**Screenshot Location**: Save as `test6.1-create-material.png`

---

### 6.2. Test View Material

**Steps**:
1. Find "UI Test Material" in grid
2. Click "Ver" button

**Expected Results**:
- ✅ Modal/drawer opens
- ✅ Shows all material details (readonly)
- ✅ All fields visible: name, type, stock, cost, etc.

**Screenshot Location**: Save as `test6.2-view-material.png`

---

### 6.3. Test Edit Material

**Steps**:
1. Find "UI Test Material"
2. Click "Editar" button
3. Change:
   - Stock: 50 → 75
   - Min Stock: 10 → 20
4. Click "Guardar"

**Expected Results**:
- ✅ Modal closes
- ✅ Success toast appears
- ✅ Grid updates with new values
- ✅ material_updated event in console

**Screenshot Location**: Save as `test6.3-edit-material.png`

---

### 6.4. Test Delete Material

**Steps**:
1. Find "UI Test Material"
2. Click "Eliminar" button
3. Confirm deletion

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ After confirm: Material removed from grid
- ✅ Success toast appears
- ✅ material_deleted event in console

**Screenshot Location**: Save as `test6.4-delete-material.png`

---

### 6.5. Test Bulk Operations

**Steps**:
1. Select 3-5 materials (checkboxes)
2. Click "Operaciones Masivas"
3. Choose "Exportar CSV"
4. Click "Ejecutar"

**Expected Results**:
- ✅ CSV file downloads
- ✅ Contains selected materials
- ✅ Headers: Nombre, Tipo, Stock, Costo, Categoría

**Screenshot Location**: Save as `test6.5-bulk-export.png`

---

### 6.6. Test Filters

**Steps**:
1. Use filter drawer/inputs to filter by:
   - Type: MEASURABLE
   - Category: weight
2. Observe grid updates

**Expected Results**:
- ✅ Grid shows only matching materials
- ✅ Count updates (e.g., "Showing 5 of 20")

**Screenshot Location**: Save as `test6.6-filters.png`

---

### Test 6 Success Criteria
- [ ] Create material flow works end-to-end
- [ ] View material shows all details
- [ ] Edit material updates successfully
- [ ] Delete material removes from grid
- [ ] Bulk export generates CSV file
- [ ] Filters update grid correctly
- [ ] No UI errors or broken layouts

---

## ✅ TEST 7: REAL-TIME SYNC (10 min)

### Purpose
Validate that Materials module syncs across browser tabs via Supabase Realtime.

---

### 7.1. Test Multi-Tab Sync

**Steps**:
1. Open browser Tab 1: `/admin/supply-chain/materials`
2. Open browser Tab 2: `/admin/supply-chain/materials`
3. In Tab 1: Create new material "Sync Test"
4. Switch to Tab 2: Observe grid

**Expected Results**:

**Tab 2**:
- ✅ Grid auto-refreshes
- ✅ "Sync Test" material appears WITHOUT manual refresh
- ✅ Console shows: `[MaterialsStore] 🔄 Real-time change detected...`

**Console Logs (Tab 2)**:
```
[useRealtimeMaterials] 📡 Subscribed to materials-changes channel
[MaterialsStore] 🔄 Real-time change detected { event: 'INSERT', table: 'items', ... }
[MaterialsStore] Refreshing materials after real-time update...
```

**Screenshot Location**: Save both tabs as `test7.1-realtime-sync.png`

---

### 7.2. Test Update Sync

**Steps**:
1. Tab 1: Edit material "Sync Test" (change stock to 999)
2. Tab 2: Observe

**Expected Results**:
- ✅ Tab 2 updates automatically
- ✅ Shows new stock: 999

**Screenshot Location**: Save as `test7.2-realtime-update.png`

---

### 7.3. Test Delete Sync

**Steps**:
1. Tab 1: Delete material "Sync Test"
2. Tab 2: Observe

**Expected Results**:
- ✅ Tab 2 removes material from grid automatically

**Screenshot Location**: Save as `test7.3-realtime-delete.png`

---

### Test 7 Success Criteria
- [ ] Real-time subscriptions active (console logs visible)
- [ ] Tab 2 receives updates from Tab 1 automatically
- [ ] No manual refresh required
- [ ] CREATE, UPDATE, DELETE all sync in real-time

---

## ✅ TEST 8: OFFLINE-FIRST BEHAVIOR (10 min)

### Purpose
Validate that Materials module handles offline mode gracefully.

---

### 8.1. Test Offline Detection

**Steps**:
1. Navigate to `/admin/supply-chain/materials`
2. Open DevTools → Network tab
3. Enable "Offline" mode (throttling dropdown)
4. Observe UI

**Expected Results**:
- ✅ "Modo Offline" alert appears at top
- ✅ Alert message: "Los cambios se sincronizarán cuando recuperes la conexión"
- ✅ Real-time sync disabled (console logs: "Disabled when offline")

**Console Logs**:
```
[useOfflineStatus] 🔴 Connection lost, switching to offline mode
[useRealtimeMaterials] Realtime sync disabled (offline mode)
```

**Screenshot Location**: Save as `test8.1-offline-alert.png`

---

### 8.2. Test Offline Operations

**Steps**:
1. While still offline, try to:
   - View materials (should work)
   - Edit material (may show error or queue)
2. Observe behavior

**Expected Results**:
- ✅ Read operations work (cached data)
- ⚠️ Write operations may show: "No connection - changes will sync later"

**Screenshot Location**: Save as `test8.2-offline-operations.png`

---

### 8.3. Test Online Recovery

**Steps**:
1. Disable "Offline" mode in DevTools
2. Observe UI

**Expected Results**:
- ✅ "Modo Offline" alert disappears
- ✅ Real-time sync re-enables
- ✅ Console logs: "Connection restored"

**Console Logs**:
```
[useOfflineStatus] 🟢 Connection restored, switching to online mode
[useRealtimeMaterials] Realtime sync enabled
```

**Screenshot Location**: Save as `test8.3-online-recovery.png`

---

### Test 8 Success Criteria
- [ ] Offline mode detected and alert shown
- [ ] Real-time sync disabled when offline
- [ ] Read operations work offline (cached data)
- [ ] Online recovery restores full functionality

---

## ✅ TEST 9: PERFORMANCE & CODE QUALITY (10 min)

### Purpose
Validate performance metrics and code quality.

---

### 9.1. Test Bundle Size

**Steps**:
1. Run build:
   ```bash
   pnpm build
   ```
2. Check output for materials chunk size

**Expected Results**:
- ✅ Build completes successfully
- ✅ `module-materials.js` chunk < 100 KB (gzipped)
- ✅ Lazy loading confirmed (separate chunk)

**Screenshot Location**: Save terminal output as `test9.1-bundle-size.txt`

---

### 9.2. Test Performance Monitor

**Steps**:
1. Navigate to `/admin/supply-chain/materials`
2. Open DevTools → Performance tab
3. Record performance for 10 seconds
4. Scroll grid, open/close modals
5. Stop recording
6. Check FPS

**Expected Results**:
- ✅ FPS stays above 30 during interactions
- ✅ No long tasks (>50ms)
- ✅ No memory leaks (heap size stable)

**Screenshot Location**: Save performance profile as `test9.2-performance.png`

---

### 9.3. Test Lighthouse Score

**Steps**:
1. Navigate to `/admin/supply-chain/materials`
2. Open DevTools → Lighthouse tab
3. Run audit (Desktop, Performance + Accessibility)

**Expected Results**:
- ✅ Performance: > 85
- ✅ Accessibility: > 90
- ✅ Best Practices: > 85

**Screenshot Location**: Save Lighthouse report as `test9.3-lighthouse.png`

---

### 9.4. Test Console Errors

**Steps**:
1. Navigate through all Materials pages
2. Perform CRUD operations
3. Check console for errors

**Expected Results**:
- ✅ 0 errors (red)
- ⚠️ Warnings (yellow) are acceptable if minor
- ✅ No 404s or failed network requests

**Screenshot Location**: Save clean console as `test9.4-console-clean.png`

---

### Test 9 Success Criteria
- [ ] Build succeeds with reasonable bundle sizes
- [ ] FPS > 30 during normal usage
- [ ] Lighthouse scores > 85 (Performance, Accessibility)
- [ ] Console has 0 errors

---

## 📊 FINAL TEST REPORT

After completing all 9 test suites, compile a report:

### Test Results Summary

| Test Suite | Status | Pass Rate | Issues |
|------------|--------|-----------|--------|
| 1. Permissions | ✅ PASS | 3/3 | None |
| 2. EventBus Emissions | ✅ PASS | 5/5 | None |
| 3. EventBus Consumptions | ✅ PASS | 7/7 | None |
| 4. Cross-Module Hooks | ✅ PASS | 5/5 | None |
| 5. Public API | ✅ PASS | 5/5 | None |
| 6. UI/UX | ✅ PASS | 6/6 | None |
| 7. Real-Time Sync | ✅ PASS | 3/3 | None |
| 8. Offline-First | ✅ PASS | 3/3 | None |
| 9. Performance | ✅ PASS | 4/4 | None |
| **TOTAL** | **✅ PASS** | **41/41** | **0** |

### Grade Calculation
- **Pass Rate**: 41/41 = 100%
- **Final Grade**: **A+ (100/100)** 🏆

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: Events not appearing in console
**Fix**: Ensure EventBus is available globally:
```javascript
window.EventBus = EventBus; // Add to main.tsx
```

### Issue 2: Permission checks always return true
**Fix**: Check user role in database. OPERADOR should NOT have update/delete permissions.

### Issue 3: Real-time sync not working
**Fix**: Verify Supabase realtime is enabled for `items` table in Supabase dashboard.

### Issue 4: Cross-module hooks not showing
**Fix**: Ensure target module (Sales, Production) has HookPoint registered for the hook name.

### Issue 5: API methods return undefined
**Fix**: Check that manifest exports are correctly defined and module is registered.

---

## 📝 TESTING CHECKLIST

**Pre-Test**:
- [ ] Dev server running
- [ ] TypeScript compiles (0 errors)
- [ ] ESLint passes (0 errors)
- [ ] DevTools open with Console visible

**Test Execution**:
- [ ] Test 1: Permissions (20 min)
- [ ] Test 2: EventBus Emissions (15 min)
- [ ] Test 3: EventBus Consumptions (15 min)
- [ ] Test 4: Cross-Module Hooks (20 min)
- [ ] Test 5: Public API (10 min)
- [ ] Test 6: UI/UX (15 min)
- [ ] Test 7: Real-Time Sync (10 min)
- [ ] Test 8: Offline-First (10 min)
- [ ] Test 9: Performance (10 min)

**Post-Test**:
- [ ] All screenshots saved
- [ ] Test report compiled
- [ ] Issues logged (if any)
- [ ] Grade calculated

**Total Estimated Time**: ~2 hours

---

## 🎯 SUCCESS CRITERIA

Materials module passes testing if:
1. ✅ All 9 test suites PASS
2. ✅ 0 critical bugs found
3. ✅ TypeScript + ESLint clean
4. ✅ Pass rate > 95%
5. ✅ Performance scores > 85

**PASS**: Module is production-ready ✅
**FAIL**: Module needs fixes before deployment ❌

---

**END OF TESTING PROMPT**

🧪 Use this prompt to validate Materials module or any module following the same patterns!
