# 📋 FUTURE REQUIREMENTS - FASE 2

**Versión:** 1.1.0
**Fecha:** 2025-01-16
**Estado:** EN PROGRESO

---

## 🎯 PROPÓSITO

Este documento contiene requirements que están **diseñados pero comentados** hasta que se implementen los stores/features faltantes.

---

## ✅ REQUIREMENTS ACTIVADOS (COMPLETADOS)

### 1. Physical Products - Suppliers Validation ✅ COMPLETADO FASE 2.2

**Ubicación:** `src/modules/achievements/constants.ts:408-421`

**Estado:** ✅ ACTIVADO
**Fecha completado:** 2025-01-16

```typescript
{
  id: 'physical_min_suppliers',
  tier: 'mandatory',
  capability: 'physical_products',
  name: 'Registrar al menos 1 proveedor activo',
  description: 'Necesitas proveedores para abastecer materiales',
  icon: '🚚',
  category: 'setup',
  blocksAction: 'catalog:publish',
  validator: (ctx) => (ctx.suppliers?.length || 0) >= 1,
  redirectUrl: '/admin/supply-chain/suppliers',
  estimatedMinutes: 5,
}
```

**Completado:**
- ✅ Creado `src/store/suppliersStore.ts`
- ✅ Descomentado campo `suppliers` en `ValidationContext` (types.ts)
- ✅ Agregado al `useValidationContext` hook
- ✅ Descomentado requirement en `constants.ts`

**Impacto:**
- `physical_products` capability pasó de **4 a 5 requirements activos**

---

## ⏸️ REQUIREMENTS DESACTIVADOS (TODO FASE 2)

### 2. Appointments Validation

**Capability afectada:** `professional_services`

```typescript
// TODO FASE 2: Agregar validación de appointments
// {
//   id: 'services_appointments_enabled',
//   tier: 'mandatory',
//   capability: 'professional_services',
//   name: 'Sistema de agendamiento configurado',
//   validator: (ctx) => (ctx.appointments?.length || 0) >= 0,
// }
```

**Bloqueadores:**
- ❌ No existe `appointmentsStore`
- ✅ Existe tabla `appointments` y `appointment_slots` en DB

**Para activar:**
1. Crear `src/store/appointmentsStore.ts`
2. Descomentar campo `appointments` en `ValidationContext` (types.ts:135-139)
3. Agregar al `useValidationContext` hook
4. Agregar requirement a `PROFESSIONAL_SERVICES_MANDATORY`

---

### 3. Payment Methods & Gateways

**Capabilities afectadas:** TODAS (actualmente usando paymentsStore ✅)

```typescript
// ✅ FASE 2.1 COMPLETADO - Usando paymentsStore
const paymentMethods = usePaymentsStore(state => state.paymentMethods);
const paymentGateways = usePaymentsStore(state => state.paymentGateways);
```

**Estado:**
- ✅ Store implementado: `src/store/paymentsStore.ts`
- ✅ Integrado en `useValidationContext.ts`
- ✅ 15 requirements automáticamente activados
- ⏸️ Pendiente: APIs backend + componentes UI

**Para completar totalmente:**
1. ✅ Crear `src/store/paymentsStore.ts` (COMPLETADO)
2. ⏸️ Implementar `paymentMethodsApi` y `paymentGatewaysApi`
3. ⏸️ Crear tablas Supabase (payment_methods, payment_gateways)
4. ⏸️ Integrar con UI de finance-integrations

**Impacto:** **ALTO** - Casi todas las capabilities requieren validar payments (15 requirements activados)

---

### 4. Delivery Zones

**Capability afectada:** `delivery_shipping` (actualmente hardcoded como `[]`)

```typescript
// Actualmente en useValidationContext.ts:227-235
const deliveryZones = useMemo(() => [] as Array<...>, []);
```

**Bloqueadores:**
- ❌ No existe `deliveryStore`

**Para activar:**
1. Crear `src/store/deliveryStore.ts`
2. Reemplazar array vacío en `useValidationContext`
3. Requirements de `DELIVERY_MANDATORY` empezarán a funcionar

---

### 5. E-commerce Settings

**Capability afectada:** `online_store`

```typescript
// Campos faltantes en profile:
// - deliveryHours: undefined     (TODO en useValidationContext.ts:183)
// - shippingPolicy: undefined    (TODO en useValidationContext.ts:184)
// - termsAndConditions: undefined (TODO en useValidationContext.ts:185)
```

**Bloqueadores:**
- ❌ No existe `ecommerceStore`

**Para activar:**
1. Crear `src/store/ecommerceStore.ts` o agregar a `appStore`
2. Agregar campos al `useValidationContext`
3. Requirements de `ECOMMERCE_MANDATORY` están activos pero algunos retornan `undefined`

---

### 6. Membership Plans

**Capability afectada:** `membership_subscriptions`

```typescript
// TODO FASE 2: Validación de recurring billing
// {
//   id: 'membership_recurring_billing',
//   validator: (ctx) => ctx.membershipPlans?.some(p => p.recurring_billing)
// }
```

**Bloqueadores:**
- ❌ No existe `membershipPlansStore`
- ✅ Existe tabla `product_recurring_configs` en DB

**Para activar:**
1. Crear `src/store/membershipPlansStore.ts` o extender `productsStore`
2. Descomentar campo en `ValidationContext` (types.ts:141-145)
3. Agregar validaciones más específicas de recurring billing

---

## 📊 RESUMEN DE IMPACTO

| Store Faltante | Requirements Bloqueados | Capabilities Afectadas | Prioridad |
|----------------|------------------------|----------------------|-----------|
| `paymentsStore` | 0 (✅ COMPLETADO) | TODAS | ✅ DONE |
| `suppliersStore` | 1 requirement | physical_products | 🟡 MEDIA |
| `deliveryStore` | 4 requirements | delivery_shipping | 🟡 MEDIA |
| `ecommerceStore` | 3 requirements | online_store | 🟡 MEDIA |
| `appointmentsStore` | 1-2 requirements | professional_services | 🟢 BAJA |
| `membershipPlansStore` | 1 requirement | membership_subscriptions | 🟢 BAJA |

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### Fase 2.1 - Crítico (Semana 1-2)
1. ✅ **paymentsStore** - COMPLETADO (2025-01-16) - Bloquea casi todos los requirements
2. ⏸️ **suppliersStore** - Importante para physical_products

### Fase 2.2 - Importante (Semana 3-4)
3. ✅ **deliveryStore** - Completa delivery_shipping
4. ✅ **ecommerceStore** - Completa online_store

### Fase 2.3 - Nice-to-have (Semana 5+)
5. ✅ **appointmentsStore** - Para professional_services
6. ✅ **membershipPlansStore** - Para subscriptions

---

## 📝 CHECKLIST PARA ACTIVAR UN REQUIREMENT

Cuando implementes un store faltante:

- [x] Crear store en `src/store/{name}Store.ts`
- [x] Exportar desde `src/store/index.ts`
- [ ] Descomentar tipo en `ValidationContext` (`src/modules/achievements/types.ts`)
- [x] Agregar al `useValidationContext` hook (`src/hooks/useValidationContext.ts`)
- [ ] Descomentar requirement en `constants.ts`
- [ ] Probar validación end-to-end
- [x] Actualizar este documento marcando como ✅

**FASE 2.1 COMPLETADA (paymentsStore):**
- [x] `src/store/paymentsStore.ts` creado
- [x] Exportado desde `src/store/index.ts`
- [x] Integrado en `useValidationContext.ts` (líneas 27, 196-222)
- [x] 15 requirements activados automáticamente
- [x] TypeScript check: 0 errores
- [x] ESLint check: 0 errores
- [x] Documento de implementación: `FASE_2.1_PAYMENTS_STORE_COMPLETE.md`

---

## 🔗 REFERENCIAS

- Decisión de arquitectura: `VALIDATION_ARCHITECTURE_DECISION.md`
- Hallazgos de investigación: `CODEBASE_INVESTIGATION_FINDINGS.md`
- Constants actuales: `src/modules/achievements/constants.ts`
- ValidationContext: `src/modules/achievements/types.ts`

---

**Última actualización:** 2025-01-16
