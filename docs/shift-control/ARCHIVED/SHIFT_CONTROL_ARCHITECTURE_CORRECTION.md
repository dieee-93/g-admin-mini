# 🔧 Corrección Arquitectónica: mobile_operations vs mobile_business

**Fecha**: 2025-01-26
**Issue**: Confusión entre `mobile_operations` (Capability) y `mobile_business` (Infrastructure)

---

## ❌ PROBLEMA DETECTADO

En `SHIFT_CONTROL_ARCHITECTURE_Q&A.md` cometí un **error conceptual** mezclando Capability e Infrastructure:

### ❌ Incorrecto (mi error):
```typescript
// Food Truck Solo
Capabilities: [mobile_operations, physical_products, pickup_orders]
Infrastructure: [mobile_business]  // ✅ CORRECTO
```

Pero luego escribí:

```typescript
// Multi-location + Food Truck
Capabilities: [onsite_service, mobile_operations, physical_products]
Infrastructure: [multi_location]  // ❌ ERROR: Si hay food truck, debe ser mobile_business
```

---

## ✅ ARQUITECTURA REAL DEL PROYECTO

Según `src/config/types/atomic-capabilities.ts`:

### 1️⃣ **Capabilities** (BusinessCapabilityId)
```typescript
export type BusinessCapabilityId =
  // QUÉ ofreces
  | 'physical_products'
  | 'professional_services'
  | 'asset_rental'
  | 'membership_subscriptions'
  | 'digital_products'

  // CÓMO entregas
  | 'onsite_service'
  | 'pickup_orders'
  | 'delivery_shipping'

  // POTENCIADORES
  | 'online_store'           // E-commerce 24/7
  | 'corporate_sales'        // B2B
  | 'mobile_operations';     // 🚚 Operaciones móviles
```

### 2️⃣ **Infrastructure** (InfrastructureId)
```typescript
export type InfrastructureId =
  | 'single_location'   // Un local fijo
  | 'multi_location'    // Múltiples locales fijos
  | 'mobile_business';  // 🚚 Negocio móvil (SIN local fijo)
```

---

## 🧩 DIFERENCIA CONCEPTUAL

### `mobile_operations` (Capability)
**Qué significa**: Agrega **features de movilidad** a tu operación.

**Features que activa**:
```typescript
// MOBILE DOMAIN (5 features)
- 'mobile_location_tracking'    // GPS, ubicación en tiempo real
- 'mobile_route_planning'       // Planificación de rutas
- 'mobile_inventory_constraints' // Inventario limitado móvil
```

**Caso de uso**:
- Food truck con ubicación dinámica
- Servicios a domicilio (plomería, limpieza)
- Delivery con tracking de drivers

---

### `mobile_business` (Infrastructure)
**Qué significa**: Tu negocio **NO tiene local fijo**.

**Características**:
- ❌ No tiene dirección fija en Google Maps
- ✅ Ubicación cambia diariamente
- ✅ Opera en eventos, ferias, rutas

**Conflicts con**:
```typescript
// MUTUAMENTE EXCLUYENTE
'single_location'   // NO puedes ser móvil Y tener local fijo
'multi_location'    // NO puedes ser móvil Y tener múltiples locales fijos
```

---

## 🎯 ESCENARIOS CORRECTOS

### ✅ Escenario 1: Food Truck Puro
```typescript
Capabilities: ['physical_products', 'pickup_orders', 'mobile_operations']
Infrastructure: ['mobile_business']  // ✅ Sin local fijo

Explicación:
- Vende productos físicos ✅
- Los clientes retiran en el truck ✅
- Tracking de ubicación ✅
- NO tiene local fijo ✅
```

---

### ✅ Escenario 2: Restaurante con Delivery Tracking
```typescript
Capabilities: ['physical_products', 'onsite_service', 'delivery_shipping', 'mobile_operations']
Infrastructure: ['single_location']  // ✅ Local fijo

Explicación:
- Vende comida en local fijo ✅
- mobile_operations activa tracking para DRIVERS (no para el restaurante) ✅
- El restaurante NO es móvil, pero sus deliveries SÍ ✅
```

**Aclaración importante**:
`mobile_operations` NO significa que el negocio sea móvil. Significa que **usa features de movilidad** (GPS, rutas, etc.)

---

### ✅ Escenario 3: Cadena de Restaurantes con Delivery
```typescript
Capabilities: ['physical_products', 'onsite_service', 'delivery_shipping', 'mobile_operations']
Infrastructure: ['multi_location']  // ✅ Múltiples locales fijos

Explicación:
- 3 restaurantes fijos ✅
- mobile_operations para trackear deliveries desde cada local ✅
- Los restaurantes NO son móviles ✅
```

---

### ❌ Escenario 4: IMPOSIBLE (Conflicts)
```typescript
Capabilities: ['onsite_service', 'mobile_operations']
Infrastructure: ['mobile_business', 'single_location']  // ❌ IMPOSIBLE

Error: mobile_business conflicts con single_location
No puedes ser móvil Y tener local fijo simultáneamente
```

---

## 🔍 RESOLUCIÓN DE LA CONFUSIÓN

### ¿Cuándo usar `mobile_operations`?

✅ **SÍ usar** si:
- Necesitas GPS tracking
- Planificación de rutas
- Tu negocio o tus DELIVERIES se mueven

❌ **NO confundir** con:
- Infrastructure (eso es `mobile_business`)

**Ejemplos**:
```typescript
// Food truck
mobile_operations = TRUE (tracking de ubicación)
mobile_business = TRUE (no tiene local fijo)

// Restaurante con delivery
mobile_operations = TRUE (tracking de drivers)
mobile_business = FALSE (tiene local fijo)

// Salón de belleza a domicilio
mobile_operations = TRUE (tracking de estilista)
mobile_business = FALSE (puede tener local + servicios móviles)
```

---

### ¿Cuándo usar `mobile_business`?

✅ **SÍ usar** si:
- NO tienes local fijo
- Tu ubicación cambia diariamente
- Eres food truck, feria, evento

❌ **NO usar** si:
- Tienes local fijo pero haces deliveries
- Tienes múltiples locales

---

## 🔧 CORRECCIONES A MIS DOCUMENTOS

### Documento: `SHIFT_CONTROL_ARCHITECTURE_Q&A.md`

#### ❌ ANTES (Incorrecto):
```typescript
// Multi-location + Food Truck
Capabilities: [onsite_service, mobile_operations, physical_products]
Infrastructure: [multi_location]  // ❌ ERROR
```

#### ✅ DESPUÉS (Correcto):
```typescript
// Cadena con Delivery Tracking (NO food truck)
Capabilities: [onsite_service, delivery_shipping, mobile_operations, physical_products]
Infrastructure: [multi_location]

// O si REALMENTE hay food truck:
Capabilities: [physical_products, pickup_orders, mobile_operations]
Infrastructure: [mobile_business]  // Mutuamente excluyente con multi_location
```

**Conclusión**: **NO puedes combinar `mobile_business` + `multi_location`**.

Si quieres cadena de restaurantes + food truck, son **2 business profiles distintos**:
1. Business Profile A: Multi-location (restaurantes)
2. Business Profile B: Mobile Business (food truck)

---

## 🎯 IMPLICACIONES PARA ShiftControlWidget

### Nueva Regla de Diseño

El widget debe detectar `mobile_business` (Infrastructure), NO `mobile_operations` (Capability):

```typescript
// ❌ INCORRECTO (mi código anterior)
if (hasCapability('mobile_operations')) {
  return <MobileWidget />;
}

// ✅ CORRECTO
const { infrastructure } = useCapabilities();

if (infrastructure.includes('mobile_business')) {
  // Negocio SIN local fijo → Mostrar ubicación
  return <MobileBusinessWidget />;
}

if (hasCapability('mobile_operations') && !infrastructure.includes('mobile_business')) {
  // Negocio CON local fijo + delivery tracking
  return <FixedLocationWithDeliveryWidget />;
}
```

---

## 📋 MATRIZ CORREGIDA

| Infrastructure | Capabilities | Interpretación | Widget Behavior |
|---------------|-------------|---------------|-----------------|
| `single_location` | `onsite_service` | Restaurante fijo | Turno normal |
| `single_location` | `onsite_service, mobile_operations, delivery_shipping` | Restaurante con delivery | Turno + tracking deliveries |
| `multi_location` | `onsite_service` | Cadena de restaurantes | Context-aware (LocationContext) |
| `multi_location` | `onsite_service, mobile_operations, delivery_shipping` | Cadena con delivery | Context-aware + tracking |
| `mobile_business` | `physical_products, pickup_orders, mobile_operations` | Food truck | Ubicación dinámica + turno |
| `mobile_business` | `professional_services, mobile_operations` | Servicios a domicilio | Ubicación + ruta del día |

---

## ✅ DECISIÓN FINAL

### Para ShiftControlWidget:

1. **Usar `infrastructure`** para determinar layout principal:
   - `single_location` → Widget simple
   - `multi_location` → Context-aware (LocationSelector)
   - `mobile_business` → Location tracking + mapa

2. **Usar `mobile_operations`** para features adicionales:
   - Mostrar mapa de ubicación actual
   - Mostrar ruta planificada
   - Mostrar deliveries en curso

3. **NO confundir** ambos:
   - `mobile_business` = estructura del negocio
   - `mobile_operations` = features de movilidad

---

## 🚀 CÓDIGO CORREGIDO

```typescript
function useShiftControl() {
  const { hasCapability, hasInfrastructure } = useCapabilities();
  const { currentLocation } = useLocationContext();

  // Determinar modo del widget
  const widgetMode = useMemo(() => {
    // 1. Negocio móvil SIN local fijo
    if (hasInfrastructure('mobile_business')) {
      return 'MOBILE_BUSINESS';
    }

    // 2. Multi-location (cadena)
    if (hasInfrastructure('multi_location')) {
      return 'MULTI_LOCATION';
    }

    // 3. Local único fijo
    return 'SINGLE_LOCATION';
  }, [hasInfrastructure]);

  // Features de movilidad (delivery tracking)
  const hasMobileFeatures = hasCapability('mobile_operations');

  return {
    widgetMode,
    hasMobileFeatures,
    currentLocation,
    // ...
  };
}
```

---

## 📝 ACCIÓN REQUERIDA

- [ ] Actualizar `SHIFT_CONTROL_ARCHITECTURE_Q&A.md` con correcciones
- [ ] Actualizar matriz de escenarios
- [ ] Clarificar que `mobile_business` NO puede combinarse con `multi_location`
- [ ] Diseñar widget con base en `infrastructure`, no solo `capabilities`

---

**Conclusión**: Tienes razón al detectar la confusión. `mobile_operations` es **capability** (features), `mobile_business` es **infrastructure** (estructura física). Son ortogonales pero a menudo se usan juntos en food trucks.

---

**Documento creado por**: Claude Code
**Última actualización**: 2025-01-26
**Estado**: 🟢 Corrección aplicada
