m,.k,# Casos Híbridos Raros - Product Types Edge Cases

**Date**: 2025-01-08
**Purpose**: Identificar casos edge que NO encajan limpiamente en los "tipos fundamentales"

---

## 🤔 CASOS HÍBRIDOS RAROS IDENTIFICADOS

### Caso 1: Subscription Box con Variación Mensual
**Ejemplo**: Caja de vinos mensuales, caja de snacks

**Características**:
```typescript
{
  // Es retail (productos físicos)
  has_materials: true,

  // Pero es RECURRENTE (como membresía)
  is_recurring: true,
  billing_cycle: 'monthly',

  // Y los materiales CAMBIAN cada mes
  components_vary_by_cycle: true,

  // Puede venderse async
  is_async_sellable: true
}
```

**¿Qué tipo fundamental es?**
- ❌ No es `standard_product` (es recurrente)
- ❌ No es `membership` puro (entrega físicos)
- ❌ No es `asset_rental` (no devuelves nada)
- ✅ Necesita: **`recurring_product`** o **`subscription_box`**

**Secciones especiales necesarias**:
- Material selection POR CICLO
- Shipping schedule
- Subscription terms (cancelación, pausar)

---

**Respuesta a tu pregunta sobre membership vs subscription box**:

La diferencia entre `membership` puro y `subscription_box` es:

**Membership puro** (Gym, Netflix):
- Pagas recurrentemente
- Obtienes ACCESO a un servicio/espacio
- NO recibes productos físicos cada mes
- Ejemplo: Acceso al gym, acceso a streaming

**Subscription Box** (Caja de vinos, HelloFresh):
- Pagas recurrentemente
- Recibes PRODUCTOS FÍSICOS cada ciclo
- Los productos se ENVÍAN (shipping/delivery)
- Los materiales/productos pueden VARIAR cada mes

**La diferencia clave**:
- Membership = Acceso recurrente (intangible)
- Subscription Box = Productos físicos recurrentes (tangible + shipping)

Ambos son "recurrentes", pero uno entrega acceso y otro entrega físicos.

---

### Caso 2: Clase Híbrida (Presencial + Streaming)
**Ejemplo**: Clase de yoga que puede tomarse presencial O por streaming

**Características**:
```typescript
{
  // Requiere staff (instructor)
  has_staff_requirements: true,
  staff_allocation: [{ role: 'instructor', duration: 60 }],

  // Requiere booking
  requires_booking: true,

  // Es TAMBIÉN digital (streaming)
  is_digital: true,
  digital_delivery: {
    type: 'streaming',
    platform: 'Zoom'
  },

  // Puede tener materiales opcionales (mat de yoga)
  has_materials: true,
  materials_optional: true,

  // Tiene DOS modalidades
  delivery_modes: ['in_person', 'online'],

  // Pricing puede ser DIFERENTE por modalidad
  pricing_by_mode: {
    in_person: 15.00,
    online: 10.00
  }
}
```

**¿Qué tipo fundamental es?**
- ❌ No es `standard_product` (tiene componente digital)
- ❌ No es `digital_product` (tiene presencial)
- ❌ No es `event` (es recurrente, no único)
- ✅ Necesita: **`hybrid_service`** o modalidad en `standard_product`

**Problema de pricing**:
- Un solo producto con DOS precios según modalidad
- ¿Cómo registrar en DB? ¿Dos productos separados?

---

### Caso 3: Kit DIY con Soporte Opcional
**Ejemplo**: Kit de cerveza artesanal + consultoría opcional

**Características**:
```typescript
{
  // Base: Producto retail
  has_materials: true,
  is_retail: true,

  // Addon: Soporte/consultoría (staff opcional)
  has_optional_staff: true,
  staff_allocation: [
    {
      role: 'consultant',
      duration: 30,
      optional: true,
      additional_price: 25.00
    }
  ],

  // Puede incluir video tutorial (digital)
  includes_digital_content: true,
  digital_content: {
    type: 'tutorial_video',
    access_duration_days: 90
  }
}
```

**¿Qué tipo fundamental es?**
- ✅ Podría ser `standard_product` CON addons
- ❌ Pero los addons son OPCIONALES (complicación)

**Pregunta clave**: ¿Staff "opcional" vs "requerido"?

---

### Caso 4: Asset Rental con Consumibles
**Ejemplo**: Alquiler de auto + combustible incluido (X litros)

**Características**:
```typescript
{
  // Es rental de asset
  is_rental: true,
  requires_asset: true,
  asset_type: 'vehicle',

  // Pero INCLUYE consumibles (materiales)
  has_materials: true,
  materials_included_in_rental: true,
  components: [
    {
      item: 'fuel',
      quantity: 20,  // 20 litros incluidos
      replenishment: 'per_rental'
    }
  ],

  // Y puede tener staff (chofer) OPCIONAL
  has_optional_staff: true
}
```

**¿Qué tipo fundamental es?**
- ✅ Es `asset_rental`
- ✅ PERO necesita soportar materiales incluidos

**Pregunta**: ¿Cómo calcular costo?
- Costo del asset (depreciación)
- + Costo de consumibles (20L combustible)
- + Staff opcional si aplica

---

### Caso 5: Evento con Asset + Digital + Físico
**Ejemplo**: Conferencia presencial en sala alquilada + streaming + kit físico enviado

**Características**:
```typescript
{
  // Requiere asset (sala de conferencias)
  requires_asset: true,
  asset_type: 'space',

  // Es digital (streaming simultáneo)
  is_digital: true,
  digital_delivery: {
    type: 'event',
    platform: 'YouTube Live',
    max_participants: 1000
  },

  // Incluye kit físico
  has_materials: true,
  components: [
    { item: 'conference_badge', quantity: 1 },
    { item: 'swag_bag', quantity: 1 }
  ],

  // Requiere staff
  has_staff_requirements: true,
  staff_allocation: [
    { role: 'speaker', duration: 120 },
    { role: 'av_technician', duration: 180 },
    { role: 'event_coordinator', duration: 240 }
  ],

  // Booking
  requires_booking: true,

  // Múltiples modalidades de asistencia
  attendance_modes: {
    in_person: { price: 100, capacity: 50 },
    streaming: { price: 30, capacity: 1000 },
    hybrid: { price: 80, includes_recording: true }
  }
}
```

**¿Qué tipo fundamental es?**
- 😵 Es TODO a la vez
- ❌ No encaja en NINGÚN tipo fundamental limpiamente

**Este es el caso más complejo**

---

### Caso 6: Servicio "A Medida" con Materiales Variables
**Ejemplo**: Traje a medida, muebles custom

**Características**:
```typescript
{
  // Requiere staff (sastre, carpintero)
  has_staff_requirements: true,

  // Usa materiales PERO no sabemos cuáles hasta después de consulta
  has_materials: true,
  materials_determined_after_consultation: true,

  // Requiere booking (consulta inicial)
  requires_booking: true,

  // Precio se calcula DESPUÉS de consulta
  pricing_model: 'quote_based',
  base_price: null,  // No hay precio fijo

  // Puede requerir múltiples citas
  multi_phase_service: true,
  phases: [
    { name: 'consultation', duration: 30 },
    { name: 'measurement', duration: 60 },
    { name: 'fitting', duration: 30 },
    { name: 'delivery', duration: 15 }
  ]
}
```

**¿Qué tipo fundamental es?**
- ✅ Podría ser `standard_product` con `quote_based` pricing
- ❌ Pero pricing NULL rompe validaciones

**Problema**: Nuestro sistema asume precio conocido upfront

---

### Caso 7: Membresía con Assets Incluidos
**Ejemplo**: Membresía de gym con uso de casilleros (assets)

**Características**:
```typescript
{
  // Es membresía (recurrente)
  is_recurring: true,
  billing_cycle: 'monthly',

  // Incluye acceso a assets
  includes_asset_access: true,
  allowed_assets: ['gym_locker', 'yoga_mat', 'training_room'],

  // Requiere booking para assets específicos (sala privada)
  asset_booking_required: ['training_room'],

  // NO requiere booking para entrada general
  requires_booking: false,

  // Puede incluir staff (trainer) opcional
  has_optional_staff: true,
  staff_sessions_included: 2  // 2 sesiones con trainer/mes
}
```

**¿Qué tipo fundamental es?**
- ❌ No es `asset_rental` (no alquilas, es acceso)
- ❌ No es `membership` puro (incluye assets)
- ✅ Necesita: **`membership_with_assets`**?

---

### Caso 8: Producto con "Experiencia" Incluida
**Ejemplo**: Botella de vino premium + cata virtual con sommelier

**Características**:
```typescript
{
  // Base: Producto retail
  has_materials: true,
  is_retail: true,
  components: [{ item: 'wine_bottle', quantity: 1 }],

  // Incluye experiencia digital
  includes_digital_experience: true,
  digital_experience: {
    type: 'virtual_event',
    duration: 45,
    requires_booking: true,  // ← Booking solo para la cata
    platform: 'Zoom'
  },

  // Requiere staff para la experiencia
  has_staff_requirements: true,
  staff_for_experience_only: true
}
```

**¿Qué tipo fundamental es?**
- ✅ Base es `standard_product`
- ❌ Pero tiene componente de booking + digital + staff

**Pregunta**: ¿Separar en DOS productos?
- Producto 1: Vino (retail)
- Producto 2: Cata (service)
- O: Un solo producto con ambos

---

### Caso 9: Asset Temporal con Opción a Compra
**Ejemplo**: Alquiler de laptop con opción de compra al final

**Características**:
```typescript
{
  // Es rental
  is_rental: true,
  requires_asset: true,

  // Pero puede convertirse en venta
  rent_to_own: true,
  rental_payments_count_towards_purchase: true,

  // Pricing híbrido
  rental_price_per_month: 50,
  purchase_price: 600,
  accumulated_rental_credit: true  // Rentas acumulan como crédito
}
```

**¿Qué tipo fundamental es?**
- ✅ Es `asset_rental`
- ❌ Pero tiene lógica de "conversión a venta"

**Pregunta**: ¿Esto es concern de Products o de Finance?

---

### Caso 10: Servicio Multi-Etapa con Assets Intermedios
**Ejemplo**: Tratamiento dental (múltiples citas + equipos específicos por etapa)

**Características**:
```typescript
{
  // Servicio con staff
  has_staff_requirements: true,

  // Multi-fase
  multi_phase_service: true,
  phases: [
    {
      name: 'diagnosis',
      duration: 30,
      requires_asset: true,
      asset: 'x_ray_machine',
      staff: [{ role: 'dentist', count: 1 }]
    },
    {
      name: 'cleaning',
      duration: 60,
      requires_asset: true,
      asset: 'dental_chair',
      staff: [{ role: 'hygienist', count: 1 }],
      has_materials: true,
      components: [{ item: 'cleaning_supplies', quantity: 1 }]
    },
    {
      name: 'filling',
      duration: 90,
      requires_asset: true,
      asset: 'dental_chair',
      staff: [{ role: 'dentist', count: 1 }],
      has_materials: true,
      materials_vary: true  // Depende del caso
    }
  ],

  // Cada fase requiere booking separado
  requires_booking: true,
  booking_per_phase: true
}
```

**¿Qué tipo fundamental es?**
- 😵 Es un "workflow" más que un producto
- ❌ NO encaja en tipos simples

---

## 🎯 ANÁLISIS: ¿Qué Revela Esto?

### Patrones Emergentes:

1. **Modalidades múltiples** (presencial + online)
   - Un producto, múltiples formas de entrega
   - Pricing diferenciado por modalidad

2. **Componentes opcionales**
   - Staff opcional, materiales opcionales
   - Pricing addon

3. **Productos recurrentes**
   - Subscriptions, memberships
   - Contenido/materiales que varían por ciclo

4. **Multi-fase/Multi-etapa**
   - No es "un producto", es "un journey"
   - Cada etapa tiene diferentes requirements

5. **Productos "experiencia"**
   - Base física + componente experiencial
   - Difícil separar en dos productos

6. **Pricing dinámico**
   - Quote-based (no precio upfront)
   - Rent-to-own (pricing híbrido)

---

## 💡 IMPLICACIONES PARA EL DISEÑO

### Opción A: Tipos Fundamentales + Flags Especiales
```typescript
type ProductType =
  | 'standard_product'
  | 'asset_rental'
  | 'digital_product'
  | 'membership'

// Flags adicionales para casos híbridos
interface ProductConfig {
  type: ProductType  // ← Tipo base

  // Modifiers para casos híbridos
  has_multiple_delivery_modes?: boolean
  has_optional_components?: boolean
  is_multi_phase?: boolean
  is_experience_bundle?: boolean
  pricing_model?: 'fixed' | 'quote_based' | 'rent_to_own'
}
```

**Pro**: Mantiene tipos simples, flags manejan complejidad
**Contra**: Muchos flags pueden volverse confuso

---

### Opción B: Tipos Fundamentales + Subtipos
```typescript
type ProductType =
  | { base: 'standard_product', subtype: 'simple' | 'multi_phase' | 'experience_bundle' }
  | { base: 'asset_rental', subtype: 'simple' | 'rent_to_own' | 'with_consumables' }
  | { base: 'digital_product', subtype: 'pure' | 'hybrid' }
  | { base: 'membership', subtype: 'basic' | 'with_assets' | 'subscription_box' }
```

**Pro**: Jerarquía clara, tipo + subtipo
**Contra**: Más complejo de implementar

---

### Opción C: Sistema de Tags/Traits
```typescript
// NO hay "tipo", solo características
interface ProductTraits {
  has_materials: boolean
  has_staff: boolean
  requires_booking: boolean
  is_digital: boolean
  is_rental: boolean
  is_recurring: boolean
  is_multi_phase: boolean
  has_delivery_modes: boolean
  // ... etc
}

// El "tipo" emerge de la combinación de traits
function inferProductType(traits: ProductTraits): string {
  // Lógica compleja para inferir
}
```

**Pro**: Máxima flexibilidad, cualquier combinación
**Contra**: UX confusa, validaciones complejas

---

## 🎯 RECOMENDACIÓN

Para los casos híbridos raros:

1. **Fase 1 (MVP)**: Tipos fundamentales simples
   - `standard_product`, `asset_rental`, `digital_product`, `membership`
   - Cubren 80% de casos

2. **Fase 2 (Casos comunes híbridos)**: Agregar flags
   - `has_multiple_delivery_modes`
   - `has_optional_components`
   - `is_multi_phase`

3. **Fase 3 (Casos muy raros)**: Workarounds específicos
   - Crear múltiples productos vinculados
   - Usar "Custom" type con configuración manual
   - No intentar soportar TODO desde día 1

**Rationale**:
- Casos 1-6 son relativamente comunes → necesitan soporte
- Casos 7-10 son MUY raros → pueden esperar o usar workarounds
- No vale la pena sobre-engineerizar para el 1% de casos edge

---

## 📝 DECISIÓN PENDIENTE PARA DIEGO

¿Cuál approach prefieres?

1. **Tipos + Flags** (simple, escalable)
2. **Tipos + Subtipos** (jerárquico, más formal)
3. **100% Traits** (máxima flexibilidad, complejidad alta)

Y de los 10 casos híbridos listados:
- ¿Cuáles son MUST-HAVE para tu MVP?
- ¿Cuáles pueden esperar a fases posteriores?
