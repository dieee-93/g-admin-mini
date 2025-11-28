# 🔍 HALLAZGOS DE INVESTIGACIÓN DEL CODEBASE

**Fecha:** 2025-01-16
**Propósito:** Determinar qué está implementado para definir requirements reales

---

## ✅ STORES EXISTENTES (confirmados en src/store/)

| Store | Archivo | Estado | Datos Disponibles |
|-------|---------|--------|-------------------|
| `useProductsStore` | productsStore.ts | ✅ EXISTE | products: ProductWithIntelligence[] |
| `useMaterialsStore` | materialsStore.ts | ✅ EXISTE | items: MaterialItem[] (types: MEASURABLE, COUNTABLE, ELABORATED) |
| `useStaffStore` | staffStore.ts | ✅ EXISTE | staff: Employee[] (con role) |
| `useAssetsStore` | assetsStore.ts | ✅ EXISTE | items: Asset[] (para rental) |
| `useOperationsStore` | operationsStore.ts | ✅ EXISTE | tables, operatingHours, pickupHours |
| `useSalesStore` | salesStore.ts | ✅ EXISTE | sales[] |
| `useAppStore` | appStore.ts | ✅ EXISTE | settings (businessName, address, logoUrl, contact) |
| `useFiscalStore` | fiscalStore.ts | ✅ EXISTE | taxId |
| ~~suppliersStore~~ | - | ❌ NO EXISTE | Pero existe suppliersApi + suppliersService |
| ~~appointmentsStore~~ | - | ❌ NO EXISTE | Existe tabla `appointments` en DB |
| ~~paymentsStore~~ | - | ❌ NO EXISTE | Hardcoded como [] en useValidationContext |
| ~~deliveryStore~~ | - | ❌ NO EXISTE | Hardcoded como [] en useValidationContext |

---

## 📊 TABLAS DE BASE DE DATOS (confirmadas)

### Productos y Catálogo
- ✅ `products` (type, duration_minutes, is_published, price, product_type)
- ✅ `catalog_products`
- ✅ `product_components` (para recetas/BOM)
- ✅ `product_rental_terms` (asset_rental)
- ✅ `product_asset_configs` (asset_rental)
- ✅ `product_recurring_configs` (memberships)
- ✅ `product_digital_deliveries` (digital_products)
- ✅ `product_staff_allocations` (professional_services)

### Inventario y Cadena de Suministro
- ✅ `items` (materials/inventory)
- ✅ `suppliers`
- ✅ `supplier_orders`
- ✅ `supplier_order_items`
- ✅ `inventory_transfers`

### Operaciones
- ✅ `appointments`
- ✅ `appointment_slots`
- ✅ `schedules`
- ✅ `shift_schedules`

### Assets
- ✅ `rental_items`
- ✅ `maintenance_schedules`

---

## 🎯 VALIDATION CONTEXT ACTUAL

### Campos que YA funcionan (src/hooks/useValidationContext.ts):

```typescript
{
  profile: {
    businessName, address, logoUrl, taxId,
    contactEmail, contactPhone,
    operatingHours, pickupHours,
    deliveryHours: undefined,      // TODO
    shippingPolicy: undefined,     // TODO
    termsAndConditions: undefined  // TODO
  },
  products: [...],   // ✅ FUNCIONA
  staff: [...],      // ✅ FUNCIONA
  tables: [...],     // ✅ FUNCIONA (desde operationsStore)
  salesCount,        // ✅ FUNCIONA

  // NOT IMPLEMENTED YET:
  paymentMethods: [],     // ❌ Hardcoded []
  paymentGateways: [],    // ❌ Hardcoded []
  deliveryZones: [],      // ❌ Hardcoded []
  loyaltyProgram: undefined // ❌ Hardcoded undefined
}
```

---

## 🛠️ SERVICIOS EXISTENTES (NO STORES)

| Entidad | Tipo | Ubicación |
|---------|------|-----------|
| Suppliers | Service + API | src/pages/admin/supply-chain/suppliers/services/ |
| Appointments | Solo tablas DB | - |
| Payments | ❌ No implementado | - |
| Delivery | ❌ No implementado | - |

---

## 📝 CONCLUSIONES PARA REQUIREMENTS

### ✅ Podemos validar directamente:

1. **physical_products:**
   - ✅ `materials?.length >= 1` (usar materialsStore)
   - ⚠️ `suppliers?.length >= 1` (existe suppliersApi pero NO store)
   - ✅ `products?.length >= 1` (usar productsStore)

2. **professional_services:**
   - ✅ `staff?.some(s => s.role === 'professional')`
   - ✅ `products?.some(p => p.type === 'service' && p.duration_minutes > 0)`
   - ⚠️ Appointments: tabla existe pero no hay store

3. **asset_rental:**
   - ✅ `assetsStore.items.length >= 1`
   - ✅ Verificar que asset tenga pricing configurado

4. **membership_subscriptions:**
   - ✅ `products?.some(p => p.type === 'membership')`
   - ⚠️ Recurring billing: existe tabla pero no store

5. **digital_products:**
   - ✅ `products?.some(p => p.type === 'digital')`
   - ⚠️ Digital delivery: existe tabla pero no store

---

## ⚠️ LIMITACIONES ENCONTRADAS

### Campos que NO podemos validar aún:
1. **Payments:** No existe paymentMethods store
2. **Delivery:** No existe deliveryZones store
3. **Suppliers:** Existe API pero no store (necesita fetch en runtime)
4. **Appointments:** Existe tabla pero no store

### Estrategia propuesta:
- **Opción A:** Agregar campos al ValidationContext y extender useValidationContext hook
- **Opción B:** Validar solo lo que existe en stores actuales
- **Opción C:** Crear stores mínimos solo para validación

---

## 🎬 PRÓXIMO PASO

Voy a definir requirements basándome en:
1. ✅ **Stores confirmados** (materialsStore, assetsStore, staffStore, productsStore)
2. ⚠️ **Extender ValidationContext** para materials, suppliers, assets
3. ⚠️ **TODO markers** para campos pendientes (payments, delivery, appointments)

