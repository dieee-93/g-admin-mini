# 🧪 NAVIGATION VALIDATION CHECKLIST
**Date**: November 12, 2025  
**Migration**: 43/45 files migrated to NavigationContext  
**Dev Server**: http://localhost:5174/

---

## ✅ CRITICAL PATHS TO TEST

### **1. Dashboard Widgets Navigation** (8 widgets)
- [ ] **StaffWidget** → Click "Ver Staff" → Should navigate to `/admin/resources/staff`
- [ ] **SchedulingWidget** → Click "Ver Turnos" → Should navigate to `/admin/resources/scheduling`
- [ ] **RentalsWidget** → Click "Ver Alquileres" → Should navigate to `/admin/operations/rentals`
- [ ] **ProductsWidget** → Click "Ver Catálogo" → Should navigate to `/admin/supply-chain/products`
- [ ] **MembershipsWidget** → Click "Ver Membresías" → Should navigate to `/admin/operations/memberships`
- [ ] **FiscalWidget** → Click "Ver Fiscal" → Should navigate to `/admin/finance/fiscal`
- [ ] **BillingWidget** → Click "Ver Facturación" → Should navigate to `/admin/finance/billing`
- [ ] **AssetsWidget** → Click "Ver Activos" → Should navigate to `/admin/supply-chain/assets`

### **2. Gamification Navigation** (5 components)
- [ ] **AchievementsWidget** → Click "Ver Todos los Pasos" → Should navigate to `/admin/gamification/achievements`
- [ ] **AchievementsWidgetPlaceholder** → Click "Ver Logros y Configuración" → Should navigate to `/admin/gamification/achievements`
- [ ] **SetupRequiredModal** → Click "Ver Todos los Pasos" → Should navigate to `/admin/gamification/achievements`
- [ ] **CapabilityProgressCard** → Click "Completar Configuración" → Should navigate to `/admin/gamification/achievements`

### **3. Setup Wizard Flow** (2 steps)
- [ ] **FinishStep** → Click "Comenzar a usar G-Mini" → Should navigate to `/admin/dashboard`
- [ ] **BusinessModelStep** → Click "Continuar" → Should navigate to `/admin/dashboard`

### **4. Products Module** (4 navigation points)
- [ ] **ProductFormPage** → Save product → Should navigate to `/admin/supply-chain/products/${id}/view`
- [ ] **ProductFormPage** → Cancel → Should navigate to `/admin/supply-chain/products`
- [ ] **ProductFormPage** → Error fallback → Should navigate to `/admin/supply-chain/products`
- [ ] **useProductsPage** → Click "Nuevo Producto" → Should navigate to `/admin/supply-chain/products/new`

### **5. Other Core Components** (3 components)
- [ ] **InventoryWidget** → Click "Ver Stock" → Should navigate to `/admin/supply-chain/materials`
- [ ] **AlertsView** → Click "📦 Inventario" → Should navigate to `/admin/supply-chain/materials`
- [ ] **AlertsView** → Click "💰 Ventas" → Should navigate to `/admin/operations/sales`
- [ ] **AlertsView** → Click "👥 Staff" → Should navigate to `/admin/resources/staff`
- [ ] **DeliveryOrdersTab** → Click "Crear Nueva Venta" → Should navigate to `/admin/operations/sales`
- [ ] **DeliveryOrdersTab** → Click "Ir a Delivery Management" → Should navigate to `/admin/operations/fulfillment/delivery`

### **6. Debug Page** (2 navigation points)
- [ ] **Debug page** → Unauthorized access → Should navigate to `/admin/dashboard`
- [ ] **Debug page** → Production mode → Should navigate to `/admin/dashboard`

---

## 🐛 COMMON ERRORS TO WATCH FOR

### **Console Errors** (Open Browser DevTools - F12)
```
❌ Cannot read property 'navigate' of undefined
❌ navigate is not a function
❌ Module 'X' not found in navigationState.modules
❌ Invalid route: /admin/...
❌ TypeError: Cannot read properties of null
```

### **Visual Bugs**
```
⚠️ Button clicks don't navigate
⚠️ Page goes to 404
⚠️ Navigation bar doesn't highlight active route
⚠️ Breadcrumbs show wrong path
⚠️ Back button doesn't work
```

### **Network Tab** (Check if routes are correct)
```
✅ Should see: /admin/supply-chain/materials
❌ Should NOT see: undefined, null, /admin/admin/...
```

---

## 📋 TESTING PROCEDURE

### **Step 1: Login**
```
1. Open http://localhost:5174/admin/login
2. Login with admin credentials
3. Should land on /admin/dashboard
```

### **Step 2: Test Each Widget**
```
1. Scroll through dashboard
2. Click each widget's "Ver X" button
3. Verify URL changes correctly
4. Check console for errors
5. Use browser back button to return
```

### **Step 3: Test Gamification**
```
1. If setup incomplete: SetupRequiredModal should appear
2. Click "Ver Todos los Pasos"
3. Should navigate to /admin/gamification/achievements
4. Check that page loads without errors
```

### **Step 4: Test Products Flow**
```
1. Navigate to /admin/supply-chain/products
2. Click "Nuevo Producto"
3. Should navigate to /admin/supply-chain/products/new
4. Cancel → Should return to products list
5. Create product → Should navigate to /admin/supply-chain/products/${id}/view
```

### **Step 5: Check NavigationContext State**
```javascript
// Open browser console and run:
window.__GADMIN_LOGGER__.configure({ 
  modules: new Set(['NavigationContext']), 
  level: 'debug' 
});

// Then click widgets and watch for:
// ✅ "🧭 [NavigationContext] Navigating to..."
// ✅ "🧭 [NavigationContext] Module found: X"
// ❌ "🧭 [NavigationContext] Module not found: X"
```

---

## 🔍 AUTOMATED ERROR DETECTION

### **Run in Browser Console**
```javascript
// Check for navigation-related errors
const navErrors = window.__CONSOLE_HELPER__.getByModule('NavigationContext');
console.table(navErrors);

// Check for undefined navigate errors
const allErrors = window.__CONSOLE_HELPER__.getErrors();
const navigateErrors = allErrors.filter(e => 
  e.message.includes('navigate') || 
  e.message.includes('navigation') ||
  e.message.includes('useNavigationActions')
);
console.table(navigateErrors);
```

---

## 📊 VALIDATION RESULTS

### **Bugs Found**: ___

| Component | Issue | Expected | Actual | Severity |
|-----------|-------|----------|--------|----------|
| | | | | |
| | | | | |
| | | | | |

### **Navigation Working**: ___/43 components

### **Critical Issues**: ___
### **Minor Issues**: ___

---

## 🎯 NEXT STEPS

After validation:
1. [ ] Fix any critical bugs found
2. [ ] Create GitHub issues for minor bugs
3. [ ] Update documentation with findings
4. [ ] Commit fixes if needed
5. [ ] Move to next audit task

---

**Tester Notes**:
_Add any observations here..._
