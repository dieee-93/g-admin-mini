# Achievements System - Data Sources & Validation Logic

**Fecha**: 20 de diciembre, 2025  
**Autor**: Análisis del sistema de achievements

---

## 📊 Resumen Ejecutivo

### ¿Los achievements están hardcoded?
**Respuesta Corta**: **Parcialmente**

- ✅ **Los TIPOS de achievements**: SÍ están hardcoded (definidos en código)
- ✅ **Los CÁLCULOS**: NO están hardcoded (son REALES, consultan datos de la DB)

---

## 🎯 Desglose Detallado

### 1. ¿DE DÓNDE SALEN LOS ACHIEVEMENTS?

#### A. Definición de Achievements (Hardcoded)

**Ubicación**: `src/modules/achievements/requirements/`

Los achievements/requirements están **definidos en código TypeScript**:

```typescript
// src/modules/achievements/requirements/takeaway.ts
export const TAKEAWAY_MANDATORY: Achievement[] = [
  {
    id: 'takeaway_business_name',
    name: 'Configurar nombre del negocio',  // ← Hardcoded
    description: 'Define el nombre comercial',  // ← Hardcoded
    icon: '🏪',  // ← Hardcoded
    validator: (ctx) => !!ctx.profile?.businessName?.trim(),  // ← Lógica hardcoded
    redirectUrl: '/admin/settings/business',  // ← Hardcoded
  },
  {
    id: 'takeaway_min_products',
    name: 'Publicar al menos 5 productos',  // ← Hardcoded
    validator: (ctx) => {
      const published = ctx.products?.filter(p => p.is_published) || [];
      return published.length >= 5;  // ← Lógica hardcoded
    },
  },
  // ... más achievements
];
```

**Archivos de Requirements:**
```
src/modules/achievements/requirements/
├── takeaway.ts      ← 5 requirements para TakeAway
├── dinein.ts        ← Requirements para Dine-In
├── delivery.ts      ← Requirements para Delivery
├── ecommerce.ts     ← Requirements para E-commerce
├── cumulative.ts    ← Achievements acumulativos (gamificación)
└── index.ts         ← Registry central
```

**Registry Central:**
```typescript
// src/modules/achievements/requirements/index.ts
export const REQUIREMENTS_BY_CAPABILITY = {
  pickup_orders: TAKEAWAY_MANDATORY,      // ← 5 requirements
  onsite_service: DINEIN_MANDATORY,       // ← N requirements
  delivery_shipping: DELIVERY_MANDATORY,  // ← N requirements
};
```

---

### 2. ¿LOS CÁLCULOS SON REALES O HARDCODED?

#### ✅ **LOS CÁLCULOS SON 100% REALES**

**Flujo de Validación:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. AlertsAchievementsSection (UI Component)                 │
│    Ubicación: dashboard/components/AlertsAchievementsSection│
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ const allProgress = computeAllProgress(
                   │   profile.selectedCapabilities,
                   │   validationContext
                   │ );
                   │
                   v
┌─────────────────────────────────────────────────────────────┐
│ 2. computeAllProgress (Pure Function)                       │
│    Ubicación: services/progressCalculator.ts                │
│                                                              │
│    - Itera sobre cada capability                            │
│    - Llama a getRequirements(capability)                    │
│    - Ejecuta validator(context) en cada requirement         │
│    - Cuenta cuántos pasan validación                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ getRequirements(capability)
                   │
                   v
┌─────────────────────────────────────────────────────────────┐
│ 3. REQUIREMENTS_BY_CAPABILITY                                │
│    Ubicación: requirements/index.ts                          │
│                                                              │
│    Retorna array de requirements con validators             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ validator(validationContext)
                   │
                   v
┌─────────────────────────────────────────────────────────────┐
│ 4. ValidationContext (DATOS REALES)                         │
│    Ubicación: hooks/useValidationContext.ts                 │
│                                                              │
│    Combina datos de múltiples fuentes:                      │
│    ✅ products (TanStack Query → Supabase)                  │
│    ✅ staff (Zustand → Supabase)                            │
│    ✅ sales (Store → eventualmente Supabase)                │
│    ✅ profile (AppStore → localStorage/Supabase)            │
│    ✅ paymentMethods (PaymentsStore)                        │
│    ✅ tables (OperationsStore)                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. EJEMPLO REAL: "Publicar al menos 5 productos"

**Requirement Definition (Hardcoded):**
```typescript
{
  id: 'takeaway_min_products',
  name: 'Publicar al menos 5 productos',  // ← Texto hardcoded
  validator: (ctx) => {
    const published = ctx.products?.filter(p => p.is_published) || [];
    return published.length >= 5;  // ← Umbral hardcoded (5)
  },
}
```

**Validación (Datos Reales):**
```typescript
// hooks/useValidationContext.ts
const { data: productsRaw = [] } = useProducts();  // ← Query a Supabase

const products = useMemo(
  () => productsRaw.map(p => ({
    id: p.id,
    name: p.name,
    is_published: p.is_published ?? false,  // ← Dato REAL de DB
  })),
  [productsLength]
);
```

**Resultado:**
```typescript
// Si tienes 3 productos publicados en Supabase:
ctx.products = [
  { id: '1', is_published: true },   // ← Dato real
  { id: '2', is_published: true },   // ← Dato real
  { id: '3', is_published: true },   // ← Dato real
  { id: '4', is_published: false },  // ← No publicado
];

validator(ctx) // false (3 < 5) ❌
// Achievement NO completado

// Si tienes 6 productos publicados:
validator(ctx) // true (6 >= 5) ✅
// Achievement COMPLETADO
```

---

## 📈 ¿Qué Datos Son Reales?

### ✅ DATOS 100% REALES (de Supabase)

| Campo | Fuente | Query/Store |
|-------|--------|-------------|
| **Productos** | `useProducts()` | TanStack Query → Supabase `products` table |
| **Productos publicados** | `p.is_published` | Campo real en DB |
| **Nombre del negocio** | `profile.businessName` | AppStore (localStorage + futuro Supabase) |
| **Dirección** | `profile.address` | AppStore |
| **Staff activo** | `staff.filter(s => s.status === 'active')` | StaffStore → Supabase `employees` table |
| **Mesas** | `tables` | OperationsStore → Supabase `tables` table |

### ⚠️ DATOS PARCIALMENTE REALES

| Campo | Estado | Notas |
|-------|--------|-------|
| **Métodos de pago** | Zustand store | TODO: Migrar a Supabase |
| **Horarios de pickup** | AppStore (localStorage) | TODO: Migrar a Supabase |
| **Ventas totales** | Hardcoded `0` | Línea 145 useValidationContext.ts: `const salesCount = 0;` ⚠️ |

---

## 🔍 Hallazgos Importantes

### 1. ⚠️ SALES COUNT ESTÁ HARDCODED

**Ubicación**: `src/hooks/useValidationContext.ts:145`

```typescript
// ❌ PROBLEMA: Hardcoded
const salesCount = 0;

// TODO: Integrar con TanStack Query
// const { data: salesData } = useSales();
// const salesCount = salesData?.length || 0;
```

**Impacto:**
- Cualquier achievement que dependa de ventas **siempre mostrará 0**
- Ejemplo: "Completar 10 ventas" nunca se marcará como completo

**Solución:**
```typescript
// Usar TanStack Query para obtener ventas reales
const { data: salesData } = useSales();
const salesCount = salesData?.length || 0;
```

---

### 2. ✅ PRODUCTS FUNCIONAN CORRECTAMENTE

**Validación Real:**
```typescript
const { data: productsRaw = [] } = useProducts();  // ← TanStack Query

const products = useMemo(
  () => productsRaw.map(p => ({
    id: p.id,
    name: p.name,
    is_published: p.is_published ?? false,  // ← REAL
  })),
  [productsLength]
);
```

**Resultado**: ✅ Los contadores de productos SON CORRECTOS

---

### 3. ✅ STAFF FUNCIONA CORRECTAMENTE

**Validación Real:**
```typescript
const staffRaw = useStaffStore(state => state.staff);

const staff = useMemo(
  () => staffRaw.map(s => ({
    id: s.id,
    name: s.name,
    is_active: s.status === 'active',  // ← REAL
  })),
  [staffLength]
);
```

**Resultado**: ✅ Los contadores de staff SON CORRECTOS

---

## 🎯 Conclusiones

### ¿Los achievements son hardcoded?

| Aspecto | Hardcoded? | Detalles |
|---------|-----------|----------|
| **Nombres de achievements** | ✅ SÍ | "Publicar 5 productos", "Configurar nombre", etc. |
| **Descripciones** | ✅ SÍ | Textos definidos en código |
| **Iconos** | ✅ SÍ | Emojis hardcoded |
| **Umbrales** | ✅ SÍ | "5 productos", "1 método de pago", etc. |
| **RedirectURLs** | ✅ SÍ | `/admin/settings/business`, etc. |
| **Lógica de validación** | ✅ SÍ | Validators en código |
| **DATOS validados** | ❌ **NO** | Vienen de Supabase/stores REALES |
| **Cálculo de progreso** | ❌ **NO** | Computado en tiempo real |

### ¿Los cálculos son correctos?

| Métrica | Estado | Precisión |
|---------|--------|-----------|
| **Productos publicados** | ✅ CORRECTO | 100% real de Supabase |
| **Staff activo** | ✅ CORRECTO | 100% real de Supabase |
| **Mesas configuradas** | ✅ CORRECTO | 100% real de Supabase |
| **Nombre de negocio** | ✅ CORRECTO | Real de AppStore |
| **Métodos de pago** | ⚠️ PARCIAL | Real de PaymentsStore (no persistido) |
| **Ventas completadas** | ❌ **INCORRECTO** | Hardcoded a 0 |

---

## 🔧 Acciones Recomendadas

### Prioridad Alta

1. **Arreglar Sales Count** (CRÍTICO)
   ```typescript
   // En useValidationContext.ts:145
   - const salesCount = 0;
   + const { data: salesData } = useSales();
   + const salesCount = salesData?.length || 0;
   ```

### Prioridad Media

2. **Migrar Métodos de Pago a Supabase**
   - Actualmente en PaymentsStore (no persistido)
   - Crear tabla `payment_methods` en Supabase

3. **Migrar Horarios a Supabase**
   - Actualmente en AppStore (localStorage)
   - Crear tabla `business_hours` en Supabase

### Prioridad Baja (Futuro)

4. **Hacer Requirements Configurables**
   - Mover requirements a Supabase
   - Permitir customización por tenant
   - Admin UI para editar achievements

---

## 📝 Ejemplo de Flow Real

### Escenario: Usuario con 3 productos publicados

```typescript
// 1. Usuario abre Dashboard
<AlertsAchievementsSection />

// 2. Component computa progreso
const allProgress = computeAllProgress(
  ['pickup_orders'],  // Capabilities seleccionadas
  validationContext   // Datos reales
);

// 3. ValidationContext obtiene productos
const { data: productsRaw } = useProducts();
// → SELECT * FROM products WHERE tenant_id = 'xxx'
// → Retorna: [
//     { id: '1', is_published: true },
//     { id: '2', is_published: true },
//     { id: '3', is_published: true },
//     { id: '4', is_published: false },
//   ]

// 4. Validator ejecuta con datos reales
validator: (ctx) => {
  const published = ctx.products.filter(p => p.is_published);
  // published.length = 3
  return published.length >= 5;  // false
}

// 5. Resultado en UI
Progress: 3/5 productos ✅ REAL
Barra de progreso: 60% ✅ REAL
Achievement: ❌ Incompleto ✅ CORRECTO
```

---

## 🎨 Interfaz de Usuario

### Vista "Progreso & Logros"

```
┌──────────────────────────────────────────────────────────┐
│ Progreso de Configuración                    87% ✅     │
│ ████████████████████████████████░░░░░░░░                │
│                                                          │
│ 🏪 TakeAway                                    4/5       │
│ ├─ ✅ Configurar nombre del negocio                     │
│ ├─ ✅ Configurar dirección del local                    │
│ ├─ ✅ Definir horarios de retiro                        │
│ ├─ ❌ Publicar al menos 5 productos (3/5) ← REAL       │
│ └─ ✅ Configurar método de pago                         │
│                                                          │
│ 🍽️ Dine-In                                     5/6       │
│ ├─ ✅ ...                                                │
│ └─ ❌ Configurar 3 mesas (2/3) ← REAL                  │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Validación Final

### ¿Los datos que ves son reales?

**SÍ**, con una excepción:

- ✅ Productos: **REAL** (Supabase)
- ✅ Staff: **REAL** (Supabase)
- ✅ Mesas: **REAL** (Supabase)
- ✅ Configuración: **REAL** (AppStore)
- ❌ Ventas: **Hardcoded a 0** (necesita fix)

### ¿Los achievements se pueden modificar sin código?

**NO** actualmente. Son hardcoded en TypeScript.

**Futuro** (Phase 3+):
- Migrar a Supabase
- Admin UI para crear/editar achievements
- Customización por tenant

---

**Conclusión**: El sistema es **mayormente real**, con cálculos precisos basados en datos de Supabase. Solo necesita arreglar el contador de ventas para ser 100% real.
