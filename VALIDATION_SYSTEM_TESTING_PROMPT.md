# VALIDATION SYSTEM - TESTING SESSION PROMPT

**Fecha de implementación:** 2025-01-27
**Sesión anterior:** Limpieza y consolidación del sistema de validación
**Objetivo:** Testing end-to-end del sistema de validación usando Chrome DevTools

---

## 📋 CONTEXTO DE LA SESIÓN ANTERIOR

### **Cambios Implementados (Fase 1 y 2):**

#### **FASE 1: Store Architecture**

1. **appStore.settings expandido** (`src/store/appStore.ts`):
   ```typescript
   settings: {
     // Basic config
     businessName: string;
     currency: string;
     timezone: string;
     language: 'es' | 'en';

     // NEW: Shared business config
     address?: string;        // Used by: Takeaway, Ecommerce, Delivery
     logoUrl?: string;        // Used by: Branding, Ecommerce
     contactEmail?: string;   // Used by: Ecommerce, Support
     contactPhone?: string;   // Used by: Ecommerce, Takeaway
   }
   ```

2. **operationsStore expandido** (`src/store/operationsStore.ts`):
   ```typescript
   interface OperationsState {
     // NEW: Operations-specific config
     operatingHours?: Hours;  // Used by: Dine-in
     pickupHours?: Hours;     // Used by: Takeaway
     tables: Table[];         // Used by: Dine-in

     // NEW: Actions
     setOperatingHours(hours): void;
     setPickupHours(hours): void;
     addTable(table): void;
     updateTable(id, updates): void;
     removeTable(id): void;
   }
   ```

3. **fiscalStore expandido** (`src/store/fiscalStore.ts`):
   ```typescript
   interface FiscalState {
     // NEW: Fiscal-specific config
     taxId?: string;
     afipCuit?: string;
     invoicingEnabled: boolean;

     // NEW: Actions
     setTaxId(taxId): void;
     setAfipCuit(cuit): void;
     updateFiscalConfig(config): void;
   }
   ```

4. **useValidationContext actualizado** (`src/hooks/useValidationContext.ts`):
   - Ahora lee de appStore, operationsStore, fiscalStore
   - Todos los campos TODO completados con datos reales
   - Profile completo con todos los campos necesarios para validators

#### **FASE 2: Cleanup**

**Archivos ELIMINADOS:**
- ❌ `src/config/RequirementsRegistry.ts` (1,030 líneas - DEPRECATED)
- ❌ `src/lib/capabilities/components/CapabilityGate.tsx` (156 líneas - UNUSED)

**Archivos DESHABILITADOS (.deprecated):**
- ⚠️ `src/pages/admin/core/dashboard/components/WelcomeWidget.tsx.deprecated`
- ⚠️ `src/pages/admin/core/dashboard/components/BusinessSetupProgressWidget.tsx.deprecated`
- ⚠️ `src/pages/admin/gamification/achievements/services/AchievementsEngine.ts.deprecated`
- ⚠️ `src/pages/debug/capabilities/CapabilitiesDebugger.tsx.deprecated`

**Imports LIMPIADOS:**
- ✅ `src/lib/features/FeatureEngine.ts`
- ✅ `src/lib/capabilities/index.ts`

**Verificaciones:**
- ✅ TypeScript compila sin errores (`pnpm -s exec tsc --noEmit`)
- ✅ Arquitectura híbrida (shared + domain stores)
- ✅ Separación de concerns correcta

---

## 🎯 SISTEMA DE VALIDACIÓN ACTUAL

### **Fuente de Verdad:**
`src/modules/achievements/constants.ts` - Define TODOS los requirements:
- `TAKEAWAY_MANDATORY` (5 requirements)
- `DINEIN_MANDATORY` (6 requirements)
- `ECOMMERCE_MANDATORY` (7 requirements)
- `DELIVERY_MANDATORY` (4 requirements)

### **Flujo de Validación:**

```
Usuario intenta activar TakeAway
  ↓
TakeAwayToggle.tsx (src/modules/sales/components/TakeAwayToggle.tsx)
  ↓
registry.doAction('achievements.validate_commercial_operation', {
  capability: 'pickup_counter',
  action: 'takeaway:toggle_public',
  context: useValidationContext()
})
  ↓
achievements/manifest.tsx (Hook 2 - líneas 193-250)
  ↓
Filtra TAKEAWAY_MANDATORY requirements con blocksAction === 'takeaway:toggle_public'
  ↓
Ejecuta validators contra ValidationContext:
  - businessName (appStore.settings.businessName)
  - address (appStore.settings.address)
  - pickupHours (operationsStore.pickupHours)
  - min 5 products published (productsStore.products)
  - payment method configured (paymentMethods)
  ↓
Si falla alguno:
  - setValidationResult({ allowed: false, missingRequirements })
  - setShowSetupModal(true)
  - Muestra SetupRequiredModal con pasos faltantes
  ↓
Si pasan todos:
  - setIsTakeAwayActive(true)
  - Toast: "✅ TakeAway Activado"
```

### **Validators Específicos (achievements/constants.ts):**

```typescript
// TAKEAWAY_MANDATORY requirements:
{
  id: 'takeaway_business_name',
  validator: (ctx) => !!ctx.profile?.businessName?.trim(),
  blocksAction: 'takeaway:toggle_public'
}
{
  id: 'takeaway_address',
  validator: (ctx) => !!ctx.profile?.address,
  blocksAction: 'takeaway:toggle_public'
}
{
  id: 'takeaway_pickup_hours',
  validator: (ctx) => (
    ctx.profile?.pickupHours &&
    Object.keys(ctx.profile.pickupHours).length > 0
  ),
  blocksAction: 'takeaway:toggle_public'
}
{
  id: 'takeaway_min_products',
  validator: (ctx) => {
    const published = ctx.products?.filter((p) => p.is_published) || [];
    return published.length >= 5;
  },
  blocksAction: 'takeaway:toggle_public'
}
{
  id: 'takeaway_payment_method',
  validator: (ctx) => (ctx.paymentMethods?.length || 0) > 0,
  blocksAction: 'takeaway:toggle_public'
}
```

---

## 🧪 PLAN DE TESTING

### **Objetivo:**
Verificar que el sistema de validación funciona correctamente:
1. Bloquea operaciones cuando faltan configuraciones
2. Muestra modal con requirements faltantes
3. Permite operaciones cuando todo está configurado
4. Lee correctamente de los stores (appStore, operationsStore, fiscalStore)

### **Componentes a Testear:**

#### **1. TakeAwayToggle (Pickup Counter)**
**Ubicación:** Inyectado en Sales page vía Hook System
**Ruta:** `/admin/operations/sales`
**Archivo:** `src/modules/sales/components/TakeAwayToggle.tsx`

**Escenarios:**
- ❌ **Sin configuración:** Toggle intenta activar → Modal bloquea → Lista requirements
- ✅ **Con configuración:** Toggle activa → Toast success → TakeAway activo

#### **2. OpenShiftButton (Dine-in)**
**Ubicación:** Inyectado en Fulfillment/Onsite page vía Hook System
**Ruta:** `/admin/operations/fulfillment/onsite`
**Archivo:** `src/modules/fulfillment/onsite/components/OpenShiftButton.tsx`

**Escenarios:**
- ❌ **Sin configuración:** Botón intenta abrir turno → Modal bloquea → Lista requirements
- ✅ **Con configuración:** Botón abre turno → Toast success → Turno abierto

---

## 🛠️ TESTING CON CHROME DEVTOOLS MCP

### **Herramientas Disponibles:**

```typescript
// 1. Navegación
mcp__chrome-devtools__navigate_page({ url: "http://localhost:5173/admin/operations/sales" })
mcp__chrome-devtools__list_pages()
mcp__chrome-devtools__select_page({ pageIdx: 0 })

// 2. Inspección
mcp__chrome-devtools__take_screenshot()
mcp__chrome-devtools__take_snapshot()  // Text snapshot con UIDs
mcp__chrome-devtools__list_console_messages()

// 3. Interacción
mcp__chrome-devtools__click({ uid: "..." })
mcp__chrome-devtools__fill({ uid: "...", value: "..." })
mcp__chrome-devtools__wait_for({ text: "...", timeout: 5000 })

// 4. Debugging
mcp__chrome-devtools__evaluate_script({ function: "() => { ... }" })
mcp__chrome-devtools__list_network_requests()
```

### **Pasos de Testing Automatizado:**

#### **TEST 1: TakeAway Sin Configuración (debe BLOQUEAR)**

```typescript
// 1. Navegar a Sales
navigate_page({ url: "http://localhost:5173/admin/operations/sales" })

// 2. Tomar snapshot para identificar Toggle
take_snapshot()

// 3. Buscar TakeAway Toggle por texto "TakeAway Público"
// Identificar UID del Switch component

// 4. Intentar activar Toggle
click({ uid: "switch_uid_here" })

// 5. Esperar modal
wait_for({ text: "Configuración TakeAway Requerida", timeout: 3000 })

// 6. Verificar modal muestra requirements
take_screenshot() // Capturar modal para inspección

// 7. Verificar en consola
list_console_messages()

// 8. Verificar estado en Zustand (via evaluate_script)
evaluate_script({
  function: `() => {
    const stores = window.__ZUSTAND_STORES__ || {};
    return {
      operationsStore: stores.operationsStore?.getState(),
      appStore: stores.appStore?.getState()
    };
  }`
})
```

#### **TEST 2: Configurar Stores Manualmente**

```typescript
// 1. Inyectar datos de configuración via evaluate_script
evaluate_script({
  function: `() => {
    // Import stores
    const { useAppStore } = require('@/store/appStore');
    const { useOperationsStore } = require('@/store/operationsStore');
    const { useProductsStore } = require('@/store/productsStore');

    // Configure appStore
    useAppStore.getState().updateSettings({
      businessName: 'Test Restaurant',
      address: 'Av. Test 123, Buenos Aires'
    });

    // Configure operationsStore
    useOperationsStore.getState().setPickupHours({
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '20:00' }
    });

    // Add 5 published products
    const products = [];
    for (let i = 1; i <= 5; i++) {
      products.push({
        id: 'prod_' + i,
        name: 'Product ' + i,
        is_published: true
      });
    }
    useProductsStore.getState().setProducts(products);

    return 'Configuration injected';
  }`
})

// 2. Reload o re-render componente
navigate_page({ url: "http://localhost:5173/admin/operations/sales" })

// 3. Tomar snapshot
take_snapshot()

// 4. Intentar activar Toggle AHORA (debería PERMITIR)
click({ uid: "switch_uid_here" })

// 5. Verificar Toast success
wait_for({ text: "TakeAway Activado", timeout: 3000 })

// 6. Capturar screenshot
take_screenshot()

// 7. Verificar estado actualizado
evaluate_script({
  function: `() => {
    const context = require('@/hooks/useValidationContext').default();
    return {
      profile: context.profile,
      products: context.products,
      validationPassed: true
    };
  }`
})
```

#### **TEST 3: OpenShiftButton (Dine-in) - Similar flow**

```typescript
// 1. Navegar a Fulfillment/Onsite
navigate_page({ url: "http://localhost:5173/admin/operations/fulfillment/onsite" })

// 2. Configurar requirements para Dine-in
evaluate_script({
  function: `() => {
    const { useAppStore } = require('@/store/appStore');
    const { useOperationsStore } = require('@/store/operationsStore');
    const { useStaffStore } = require('@/store/staffStore');
    const { useProductsStore } = require('@/store/productsStore');

    // Configure operating hours
    useOperationsStore.getState().setOperatingHours({
      monday: { open: '08:00', close: '22:00' },
      // ... otros días
    });

    // Add table
    useOperationsStore.getState().addTable({
      id: 'table_1',
      name: 'Mesa 1',
      capacity: 4
    });

    // Add staff member
    useStaffStore.getState().addStaff({
      id: 'staff_1',
      name: 'Juan Pérez',
      is_active: true
    });

    // Add 3 products
    // ...

    return 'Dine-in configured';
  }`
})

// 3. Click "Abrir Turno" button
click({ uid: "open_shift_button_uid" })

// 4. Verificar success
wait_for({ text: "Turno Abierto", timeout: 3000 })
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

### **Stores:**
- [ ] `appStore.settings.address` se lee correctamente en validators
- [ ] `appStore.settings.businessName` se lee correctamente
- [ ] `operationsStore.pickupHours` se lee correctamente
- [ ] `operationsStore.operatingHours` se lee correctamente
- [ ] `operationsStore.tables` se lee correctamente
- [ ] `fiscalStore.taxId` se lee correctamente (cuando se implemente validator)
- [ ] `productsStore.products` filtra `is_published` correctamente
- [ ] `staffStore.staff` filtra `is_active` correctamente

### **Validators:**
- [ ] `takeaway_business_name` valida correctamente
- [ ] `takeaway_address` valida correctamente
- [ ] `takeaway_pickup_hours` valida Object.keys().length > 0
- [ ] `takeaway_min_products` cuenta published products >= 5
- [ ] `takeaway_payment_method` valida paymentMethods.length > 0
- [ ] `dinein_operating_hours` valida correctamente
- [ ] `dinein_tables_configured` valida tables.length >= 1
- [ ] `dinein_active_staff` valida staff.filter(is_active).length >= 1

### **UI Components:**
- [ ] TakeAwayToggle renderiza correctamente
- [ ] TakeAwayToggle muestra badge "Activo" cuando está activado
- [ ] SetupRequiredModal se abre cuando validación falla
- [ ] SetupRequiredModal lista requirements correctos
- [ ] SetupRequiredModal tiene links a redirectUrl correctos
- [ ] Toast success aparece cuando validación pasa
- [ ] OpenShiftButton funciona igual que TakeAwayToggle

### **Hook System:**
- [ ] `achievements.validate_commercial_operation` hook ejecuta
- [ ] Hook filtra requirements por `blocksAction` correctamente
- [ ] Hook retorna ValidationResult con estructura correcta
- [ ] missingRequirements contiene objetos completos

### **Module Registry:**
- [ ] Achievements module está registrado
- [ ] Sales module está registrado
- [ ] Fulfillment/Onsite module está registrado
- [ ] Hooks están inyectados correctamente

---

## 🐛 DEBUGGING COMÚN

### **Problema: Modal no aparece**
```typescript
// Verificar en console
evaluate_script({
  function: `() => {
    const ModuleRegistry = require('@/lib/modules').ModuleRegistry.getInstance();
    const hasHook = ModuleRegistry.hasHook('achievements.validate_commercial_operation');
    return { hasHook, stats: ModuleRegistry.getStats() };
  }`
})
```

### **Problema: Validator siempre falla**
```typescript
// Verificar ValidationContext
evaluate_script({
  function: `() => {
    const { useValidationContext } = require('@/hooks/useValidationContext');
    const ctx = useValidationContext();
    return {
      profile: ctx.profile,
      products: ctx.products?.length,
      staff: ctx.staff?.length,
      tables: ctx.tables?.length
    };
  }`
})
```

### **Problema: Store no persiste datos**
```typescript
// Verificar localStorage
evaluate_script({
  function: `() => {
    return {
      appStorage: JSON.parse(localStorage.getItem('g-mini-app-storage') || '{}'),
      operationsStorage: JSON.parse(localStorage.getItem('g-mini-operations-storage') || '{}'),
      fiscalStorage: JSON.parse(localStorage.getItem('g-mini-fiscal-storage') || '{}')
    };
  }`
})
```

---

## 🎯 CRITERIOS DE ÉXITO

### **El sistema pasa los tests si:**

1. ✅ TakeAwayToggle **bloquea** cuando faltan configuraciones
2. ✅ TakeAwayToggle **permite** cuando todo está configurado
3. ✅ SetupRequiredModal muestra requirements correctos
4. ✅ useValidationContext lee de todos los stores correctamente
5. ✅ Validators acceden a `ctx.profile.pickupHours`, `ctx.profile.address`, etc.
6. ✅ No hay errores en Console
7. ✅ No hay loops infinitos (verificar con Performance Monitor)
8. ✅ OpenShiftButton funciona igual que TakeAwayToggle

---

## 📝 COMANDOS ÚTILES

```bash
# Iniciar dev server (si no está corriendo)
pnpm dev

# TypeScript check
pnpm -s exec tsc --noEmit

# Ver logs en tiempo real (en otra terminal)
tail -f logs/app.log  # Si existe logging a archivo

# Verificar que puerto 5173 está abierto
netstat -an | findstr 5173  # Windows
lsof -i :5173               # Linux/Mac
```

---

## 🚀 INICIO DE SESIÓN DE TESTING

**Prompt sugerido para iniciar:**

```
Hola Claude, vamos a testear el sistema de validación que implementamos en la sesión anterior.

Lee el archivo VALIDATION_SYSTEM_TESTING_PROMPT.md que tiene todo el contexto.

Luego:
1. Verifica que el dev server esté corriendo en localhost:5173
2. Usa Chrome DevTools MCP para abrir la app
3. Ejecuta los tests en orden: TEST 1, TEST 2, TEST 3
4. Documenta resultados de cada test
5. Si encuentras bugs, repórtalos con capturas y logs

Empecemos por verificar que el servidor esté corriendo y abrir la app en Chrome.
```

---

## 📚 REFERENCIAS

**Archivos clave:**
- `src/modules/achievements/constants.ts` - Requirements definitions
- `src/modules/achievements/manifest.tsx` - Validation hook (líneas 193-250)
- `src/modules/sales/components/TakeAwayToggle.tsx` - Component under test
- `src/modules/fulfillment/onsite/components/OpenShiftButton.tsx` - Component under test
- `src/hooks/useValidationContext.ts` - Context provider
- `src/store/appStore.ts` - Shared config store
- `src/store/operationsStore.ts` - Operations config store
- `src/store/fiscalStore.ts` - Fiscal config store

**Documentación:**
- Chrome DevTools MCP: Ver tools disponibles en system prompt
- Module Registry: `src/modules/README.md`
- Hook System: `src/lib/modules/HookPoint.tsx`

---

**Última actualización:** 2025-01-27
**Autor:** Claude Code
**Sesión:** Validation System Cleanup & Testing Preparation
