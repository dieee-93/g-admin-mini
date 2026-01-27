# ANÁLISIS DEL SISTEMA DE LOGROS Y REQUIREMENTS

**Fecha:** 2025-01-16
**Versión:** 1.0.0
**Estado:** Análisis completo

---

## 📋 TABLA DE CONTENIDOS

1. [Estado Actual de la Implementación](#estado-actual)
2. [Arquitectura del Sistema](#arquitectura)
3. [Capabilities y Requirements Actuales](#capabilities-actuales)
4. [Gaps y Modificaciones Necesarias](#gaps)
5. [Plan de Implementación](#plan)

---

## 🎯 ESTADO ACTUAL DE LA IMPLEMENTACIÓN {#estado-actual}

### ✅ **LO QUE ESTÁ IMPLEMENTADO**

#### 1. **Sistema de 3 Capas** (src/modules/achievements/types.ts:20-22)
```typescript
export type AchievementTier = 'mandatory' | 'suggested' | 'cumulative';
```

El sistema ya distingue correctamente tres tipos de logros:
- **MANDATORY**: Requisitos obligatorios que bloquean operaciones comerciales
- **SUGGESTED**: Mejoras sugeridas (planificado para Fase 8+)
- **CUMULATIVE**: Logros de gamificación con puntos

#### 2. **Sistema de Hooks** (src/modules/achievements/manifest.tsx:98-121)

El módulo `achievements` provee 4 hooks principales:
```typescript
provide: [
  'achievements.register_requirement',      // Módulos registran sus requirements
  'achievements.validate_commercial_operation', // Validar antes de operación
  'achievements.get_progress',              // Obtener progreso de capability
  'dashboard.widgets',                      // Widget en dashboard
]
```

#### 3. **Validación Context Unificado** (src/modules/achievements/types.ts:39-103)

Sistema de contexto desacoplado que combina datos de múltiples stores:
- Business Profile (nombre, dirección, horarios)
- Products (publicados, con imágenes)
- Staff (activos, roles)
- Operations (mesas, zonas de delivery)
- Payments (métodos, gateways)
- Metrics (ventas, loyalty)

#### 4. **Requirements Definidos** (src/modules/achievements/constants.ts)

✅ **TAKEAWAY_MANDATORY** (5 requirements) - src/modules/achievements/constants.ts:27-100
- ✅ Nombre del negocio
- ✅ Dirección del local
- ✅ Horarios de retiro
- ✅ Mínimo 5 productos publicados
- ✅ Método de pago configurado

✅ **DINEIN_MANDATORY** (6 requirements) - src/modules/achievements/constants.ts:108-192
- ✅ Nombre del negocio
- ✅ Horarios de atención
- ✅ Al menos 1 mesa configurada
- ✅ Al menos 1 empleado activo
- ✅ Mínimo 3 productos publicados
- ✅ Método de pago configurado

✅ **ECOMMERCE_MANDATORY** (7 requirements) - src/modules/achievements/constants.ts:200-298
- ✅ Nombre comercial
- ✅ Logo del negocio
- ✅ Mínimo 10 productos publicados
- ✅ Gateway de pago online
- ✅ Política de envío/retiro
- ✅ Términos y condiciones
- ✅ Información de contacto (email, teléfono)

✅ **DELIVERY_MANDATORY** (4 requirements) - src/modules/achievements/constants.ts:306-370
- ✅ Zonas de cobertura
- ✅ Tarifas por zona
- ✅ Al menos 1 repartidor activo
- ✅ Horarios de delivery

#### 5. **Registro Automático** (src/modules/sales/manifest.tsx:159-171)

Los módulos registran sus requirements automáticamente en el setup:
```typescript
if (hasFeature('sales_pickup_orders')) {
  registry.doAction('achievements.register_requirement', {
    capability: 'pickup_counter',
    requirements: TAKEAWAY_MANDATORY
  });
}
```

#### 6. **Widget Evolutivo** (src/modules/achievements/components/AchievementsWidget.tsx)

El widget cambia su comportamiento según completitud:
- **Vista PROMINENTE**: Setup incompleto (2 columnas, alta visibilidad)
- **Vista COMPACTA**: Setup completo (1 columna, baja prioridad)

---

## 🏗️ ARQUITECTURA DEL SISTEMA {#arquitectura}

### **Flujo de Datos**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. BOOTSTRAP (lib/modules/bootstrap.ts)                        │
│    - Achievements module se registra PRIMERO (autoInstall:true)│
│    - Setup hooks ANTES que otros módulos                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. MODULE SETUP (sales, fulfillment-onsite, etc.)              │
│    - Cada módulo registra sus requirements via hook            │
│    registry.doAction('achievements.register_requirement', {...})│
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. VALIDATION ON ACTION                                        │
│    - Usuario intenta "Abrir Turno" / "Activar TakeAway"        │
│    - Componente llama validateOperation()                      │
│    registry.doAction('achievements.validate_commercial_op'...) │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. VALIDATOR EXECUTION                                         │
│    - Se filtran requirements con blocksAction === action       │
│    - Se ejecutan validators con ValidationContext             │
│    - Si faltan: return { allowed: false, missing: [...] }     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. UI RESPONSE                                                 │
│    - Si bloqueado: Modal con checklist de requirements         │
│    - Si permitido: Ejecutar acción comercial                  │
└─────────────────────────────────────────────────────────────────┘
```

### **Componentes Clave**

| Archivo | Responsabilidad |
|---------|----------------|
| `achievements/manifest.tsx` | Setup de hooks, storage de requirements |
| `achievements/types.ts` | Definiciones de tipos |
| `achievements/constants.ts` | Arrays de requirements por capability |
| `sales/manifest.tsx` | Registro de TAKEAWAY_MANDATORY |
| `fulfillment/onsite/manifest.tsx` | Registro de DINEIN_MANDATORY |
| `achievements/components/AchievementsWidget.tsx` | Widget dashboard |
| `hooks/useValidationContext.ts` | Hook para obtener context unificado |

---

## 🗺️ CAPABILITIES Y REQUIREMENTS ACTUALES {#capabilities-actuales}

### **Mapeado Capability → Requirements**

| Capability ID | Business Model | Requirements Definidos | Bloqueados Por Acción |
|--------------|----------------|----------------------|---------------------|
| `pickup_orders` | TakeAway | ✅ 5 mandatory | `takeaway:toggle_public` |
| `onsite_service` | Dine-In | ✅ 6 mandatory | `dinein:open_shift` |
| `online_store` | E-commerce | ✅ 7 mandatory | `ecommerce:toggle_public` |
| `delivery_shipping` | Delivery | ✅ 4 mandatory | `delivery:enable_public` |
| `physical_products` | Productos Físicos | ❌ NO DEFINIDO | - |
| `professional_services` | Servicios Profesionales | ❌ NO DEFINIDO | - |
| `asset_rental` | Alquileres | ❌ NO DEFINIDO | - |
| `membership_subscriptions` | Membresías | ❌ NO DEFINIDO | - |
| `digital_products` | Productos Digitales | ❌ NO DEFINIDO | - |
| `corporate_sales` | B2B | ❌ NO DEFINIDO | - |
| `mobile_operations` | Móvil | ❌ NO DEFINIDO | - |

### **⚠️ ANÁLISIS CRÍTICO**

**Problema de Nomenclatura:**
- Constants usa: `pickup_counter`, `onsite_service`
- Types usa: `pickup_orders`, `onsite_service`
- ✅ **ACCIÓN REQUERIDA**: Unificar nomenclatura

---

## 🔴 GAPS Y MODIFICACIONES NECESARIAS {#gaps}

### **1. Capabilities sin Requirements Definidos**

#### **A. Physical Products (Productos Físicos)**

**Configuraciones obligatorias sugeridas:**

```typescript
PHYSICAL_PRODUCTS_MANDATORY: [
  {
    id: 'physical_products_min_catalog',
    name: 'Catálogo con al menos 3 productos',
    validator: (ctx) => ctx.products?.length >= 3,
    blocksAction: 'catalog:publish'
  },
  {
    id: 'physical_products_inventory_setup',
    name: 'Sistema de inventario configurado',
    validator: (ctx) => /* Check inventory tracking enabled */,
    blocksAction: 'sales:create_order'
  },
  {
    id: 'physical_products_pricing',
    name: 'Precios configurados en todos los productos',
    validator: (ctx) => ctx.products?.every(p => p.price > 0),
    blocksAction: 'catalog:publish'
  }
]
```

#### **B. Professional Services (Servicios Profesionales)**

**Configuraciones obligatorias sugeridas:**

```typescript
PROFESSIONAL_SERVICES_MANDATORY: [
  {
    id: 'services_min_offerings',
    name: 'Al menos 2 servicios publicados',
    validator: (ctx) => ctx.products?.filter(p => p.type === 'service').length >= 2,
    blocksAction: 'services:accept_bookings'
  },
  {
    id: 'services_scheduling_enabled',
    name: 'Sistema de agendamiento configurado',
    validator: (ctx) => ctx.profile?.schedulingEnabled,
    blocksAction: 'services:accept_bookings'
  },
  {
    id: 'services_staff_assigned',
    name: 'Al menos 1 profesional asignado',
    validator: (ctx) => ctx.staff?.filter(s => s.role === 'professional').length >= 1,
    blocksAction: 'services:accept_bookings'
  },
  {
    id: 'services_duration_defined',
    name: 'Duración definida para cada servicio',
    validator: (ctx) => ctx.products?.every(p => p.duration_minutes > 0),
    blocksAction: 'services:accept_bookings'
  }
]
```

#### **C. Asset Rental (Alquileres)**

**Configuraciones obligatorias sugeridas:**

```typescript
ASSET_RENTAL_MANDATORY: [
  {
    id: 'rental_min_assets',
    name: 'Al menos 1 activo disponible para alquiler',
    validator: (ctx) => ctx.rentalAssets?.length >= 1,
    blocksAction: 'rental:accept_bookings'
  },
  {
    id: 'rental_pricing_by_duration',
    name: 'Tarifas por duración configuradas (hora/día/semana)',
    validator: (ctx) => ctx.rentalAssets?.every(a => a.pricing),
    blocksAction: 'rental:accept_bookings'
  },
  {
    id: 'rental_availability_tracking',
    name: 'Sistema de disponibilidad configurado',
    validator: (ctx) => /* Check availability tracking enabled */,
    blocksAction: 'rental:accept_bookings'
  },
  {
    id: 'rental_deposit_policy',
    name: 'Política de depósito/garantía definida',
    validator: (ctx) => ctx.profile?.rentalDepositPolicy,
    blocksAction: 'rental:accept_bookings'
  }
]
```

#### **D. Membership/Subscriptions (Membresías)**

**Configuraciones obligatorias sugeridas:**

```typescript
MEMBERSHIP_MANDATORY: [
  {
    id: 'membership_min_plans',
    name: 'Al menos 1 plan de membresía configurado',
    validator: (ctx) => ctx.membershipPlans?.length >= 1,
    blocksAction: 'membership:accept_subscriptions'
  },
  {
    id: 'membership_recurring_billing',
    name: 'Facturación recurrente configurada',
    validator: (ctx) => ctx.paymentGateways?.some(g => g.supports_subscriptions),
    blocksAction: 'membership:accept_subscriptions'
  },
  {
    id: 'membership_benefits_defined',
    name: 'Beneficios de cada plan definidos',
    validator: (ctx) => ctx.membershipPlans?.every(p => p.benefits?.length > 0),
    blocksAction: 'membership:accept_subscriptions'
  },
  {
    id: 'membership_terms_conditions',
    name: 'Términos de suscripción publicados',
    validator: (ctx) => ctx.profile?.membershipTerms,
    blocksAction: 'membership:accept_subscriptions'
  }
]
```

#### **E. Digital Products (Productos Digitales)**

**Configuraciones obligatorias sugeridas:**

```typescript
DIGITAL_PRODUCTS_MANDATORY: [
  {
    id: 'digital_min_products',
    name: 'Al menos 1 producto digital publicado',
    validator: (ctx) => ctx.products?.filter(p => p.type === 'digital').length >= 1,
    blocksAction: 'digital:accept_orders'
  },
  {
    id: 'digital_file_delivery_setup',
    name: 'Sistema de entrega de archivos configurado',
    validator: (ctx) => ctx.profile?.digitalDeliveryEnabled,
    blocksAction: 'digital:accept_orders'
  },
  {
    id: 'digital_license_management',
    name: 'Gestión de licencias configurada (si aplica)',
    validator: (ctx) => /* Check if licensing is needed and configured */,
    blocksAction: 'digital:accept_orders'
  },
  {
    id: 'digital_payment_gateway',
    name: 'Gateway de pago online integrado',
    validator: (ctx) => ctx.paymentGateways?.some(g => g.is_active),
    blocksAction: 'digital:accept_orders'
  }
]
```

#### **F. Corporate Sales / B2B**

**Configuraciones obligatorias sugeridas:**

```typescript
CORPORATE_SALES_MANDATORY: [
  {
    id: 'b2b_credit_terms',
    name: 'Términos de crédito corporativo definidos',
    validator: (ctx) => ctx.profile?.b2bCreditTerms,
    blocksAction: 'b2b:accept_corporate_orders'
  },
  {
    id: 'b2b_approval_workflow',
    name: 'Workflow de aprobación configurado',
    validator: (ctx) => ctx.profile?.approvalWorkflowEnabled,
    blocksAction: 'b2b:accept_corporate_orders'
  },
  {
    id: 'b2b_tiered_pricing',
    name: 'Precios por volumen configurados',
    validator: (ctx) => /* Check tiered pricing setup */,
    blocksAction: 'b2b:accept_corporate_orders'
  },
  {
    id: 'b2b_min_products',
    name: 'Al menos 5 productos en catálogo B2B',
    validator: (ctx) => ctx.products?.filter(p => p.available_b2b).length >= 5,
    blocksAction: 'b2b:accept_corporate_orders'
  }
]
```

#### **G. Mobile Operations (Operaciones Móviles)**

**Configuraciones obligatorias sugeridas:**

```typescript
MOBILE_OPERATIONS_MANDATORY: [
  {
    id: 'mobile_location_tracking',
    name: 'Sistema de ubicación en tiempo real configurado',
    validator: (ctx) => ctx.profile?.mobileTrackingEnabled,
    blocksAction: 'mobile:start_operations'
  },
  {
    id: 'mobile_route_planning',
    name: 'Rutas o zonas de operación definidas',
    validator: (ctx) => ctx.mobileRoutes?.length >= 1,
    blocksAction: 'mobile:start_operations'
  },
  {
    id: 'mobile_inventory_constraints',
    name: 'Inventario móvil configurado',
    validator: (ctx) => /* Check mobile inventory setup */,
    blocksAction: 'mobile:start_operations'
  },
  {
    id: 'mobile_schedule',
    name: 'Horarios/calendario móvil definido',
    validator: (ctx) => ctx.profile?.mobileSchedule,
    blocksAction: 'mobile:start_operations'
  }
]
```

### **2. Problema de Nomenclatura**

**Inconsistencias detectadas:**

| Lugar | Capability ID Usado |
|-------|-------------------|
| `atomic-capabilities.ts` | `pickup_orders` ✅ CORRECTO |
| `achievements/constants.ts` | `pickup_counter` ❌ INCORRECTO |
| `atomic-capabilities.ts` | `onsite_service` ✅ CORRECTO (ambos usan esto) |
| `atomic-capabilities.ts` | `delivery_shipping` ✅ CORRECTO |

**🔧 FIX REQUERIDO:**
```typescript
// En constants.ts - CAMBIAR:
capability: 'pickup_counter' → capability: 'pickup_orders'
```

### **3. ValidationContext Faltante**

El `ValidationContext` actual no tiene campos para validar:
- ❌ `rentalAssets` - Para asset_rental
- ❌ `membershipPlans` - Para membership_subscriptions
- ❌ `digitalProducts` - Para digital_products
- ❌ `b2bCreditTerms`, `approvalWorkflowEnabled` - Para corporate_sales
- ❌ `mobileRoutes`, `mobileSchedule` - Para mobile_operations

**🔧 EXTENSIÓN REQUERIDA en types.ts:**

```typescript
export interface ValidationContext {
  // ... existing fields ...

  // Rental/Asset management
  rentalAssets?: Array<{
    id: string;
    name: string;
    pricing?: Record<string, number>; // hourly, daily, weekly
    is_available: boolean;
  }>;

  // Membership/Subscriptions
  membershipPlans?: Array<{
    id: string;
    name: string;
    benefits?: string[];
    price: number;
    billing_cycle: string;
  }>;

  // Digital Products
  digitalProducts?: Array<{
    id: string;
    name: string;
    file_url?: string;
    license_type?: string;
  }>;

  // B2B/Corporate
  b2bSettings?: {
    creditTerms?: string;
    approvalWorkflowEnabled?: boolean;
    tieredPricingEnabled?: boolean;
  };

  // Mobile Operations
  mobileOperations?: {
    trackingEnabled?: boolean;
    routes?: Array<{ id: string; name: string }>;
    schedule?: Record<string, any>;
    mobileInventory?: boolean;
  };
}
```

### **4. Missing Module Manifests**

Capabilities sin módulo correspondiente que registre requirements:

- ❌ No existe `modules/physical-products/manifest.tsx`
- ❌ No existe `modules/professional-services/manifest.tsx`
- ❌ No existe `modules/rental/manifest.tsx`
- ❌ No existe `modules/membership/manifest.tsx`
- ❌ No existe `modules/digital-products/manifest.tsx`
- ❌ No existe `modules/corporate-sales/manifest.tsx` (aunque existe código en sales/b2b)
- ❌ No existe `modules/mobile/manifest.tsx`

**🔧 ACCIÓN REQUERIDA:**
Crear manifests para cada capability que registren sus requirements en setup.

---

## 📝 PLAN DE IMPLEMENTACIÓN {#plan}

### **Fase 1: Corrección de Nomenclatura** ⚡ URGENTE

**Objetivo:** Unificar IDs de capabilities en todo el codebase

**Tareas:**
1. ✅ Cambiar `pickup_counter` → `pickup_orders` en `constants.ts`
2. ✅ Verificar que todos los validators usen capability IDs correctos
3. ✅ Actualizar `CAPABILITY_NAMES` para reflejar IDs correctos

**Impacto:** Alto - Evita bugs de validación fallida

---

### **Fase 2: Extender ValidationContext** 🔧

**Objetivo:** Agregar campos faltantes para nuevas capabilities

**Tareas:**
1. ✅ Agregar tipos para `rentalAssets`, `membershipPlans`, `digitalProducts`
2. ✅ Agregar `b2bSettings` y `mobileOperations`
3. ✅ Actualizar `useValidationContext` hook para incluir nuevos stores
4. ✅ Crear stores si no existen: `rentalStore`, `membershipStore`, etc.

**Impacto:** Alto - Necesario para validaciones

---

### **Fase 3: Definir Requirements para Capabilities Faltantes** 📋

**Objetivo:** Completar constants.ts con todos los MANDATORY

**Tareas:**
1. ✅ Agregar `PHYSICAL_PRODUCTS_MANDATORY`
2. ✅ Agregar `PROFESSIONAL_SERVICES_MANDATORY`
3. ✅ Agregar `ASSET_RENTAL_MANDATORY`
4. ✅ Agregar `MEMBERSHIP_MANDATORY`
5. ✅ Agregar `DIGITAL_PRODUCTS_MANDATORY`
6. ✅ Agregar `CORPORATE_SALES_MANDATORY`
7. ✅ Agregar `MOBILE_OPERATIONS_MANDATORY`

**Impacto:** Crítico - Sin esto, las capabilities no tienen validaciones

---

### **Fase 4: Crear Module Manifests** 🏗️

**Objetivo:** Cada capability debe tener su módulo registrador

**Tareas:**
1. ✅ Crear `modules/physical-products/manifest.tsx`
2. ✅ Crear `modules/professional-services/manifest.tsx`
3. ✅ Crear `modules/rental/manifest.tsx`
4. ✅ Crear `modules/membership/manifest.tsx`
5. ✅ Crear `modules/digital-products/manifest.tsx`
6. ✅ Crear `modules/corporate-sales/manifest.tsx`
7. ✅ Crear `modules/mobile/manifest.tsx`

**Estructura de cada manifest:**
```typescript
export const [capability]Manifest: ModuleManifest = {
  id: '[capability]',
  requiredFeatures: ['feature_from_FeatureRegistry'],

  setup: async (registry) => {
    const { useCapabilityStore } = await import('@/store/capabilityStore');
    const hasFeature = useCapabilityStore.getState().hasFeature;

    if (hasFeature('[relevant_feature]')) {
      registry.doAction('achievements.register_requirement', {
        capability: '[capability_id]',
        requirements: [CAPABILITY]_MANDATORY
      });
    }
  }
};
```

**Impacto:** Crítico - Sin esto, requirements no se registran

---

### **Fase 5: Testing y Validación** ✅

**Objetivo:** Asegurar que el sistema funciona end-to-end

**Tareas:**
1. ✅ Test unitario: Validators retornan correcto true/false
2. ✅ Test integración: Registrar requirements desde módulo
3. ✅ Test E2E: Bloquear acción comercial si requirements faltantes
4. ✅ Test UI: Modal con checklist se muestra correctamente

**Impacto:** Alto - Garantiza calidad

---

### **Fase 6: Documentación** 📚

**Objetivo:** Documentar el sistema para futuros desarrolladores

**Tareas:**
1. ✅ Crear `docs/REQUIREMENTS_ACHIEVEMENTS_SYSTEM.md`
2. ✅ Documentar cómo agregar nuevos requirements
3. ✅ Documentar ValidationContext y cómo extenderlo
4. ✅ Ejemplos de uso para cada capability

**Impacto:** Medio - Facilita mantenimiento futuro

---

## 🎯 RESUMEN EJECUTIVO

### **Estado Actual:**
- ✅ Sistema de 3 capas implementado y funcionando
- ✅ 4 capabilities con requirements definidos (TakeAway, Dine-In, E-commerce, Delivery)
- ✅ Sistema de hooks funcionando correctamente
- ✅ Widget evolutivo implementado

### **Principales Gaps:**
1. ❌ 7 capabilities sin requirements definidos
2. ❌ ValidationContext incompleto (falta campos para nuevas capabilities)
3. ❌ Inconsistencia de nomenclatura (`pickup_counter` vs `pickup_orders`)
4. ❌ Falta módulos manifest para registrar requirements automáticamente

### **Impacto si no se corrige:**
- ⚠️ Usuarios podrán activar capabilities sin completar configuraciones críticas
- ⚠️ Sistema de logros solo funciona para 4 de 11 capabilities
- ⚠️ Experiencia de onboarding incompleta

### **Esfuerzo Estimado:**
- **Fase 1 (Nomenclatura)**: 2 horas
- **Fase 2 (ValidationContext)**: 4 horas
- **Fase 3 (Requirements)**: 8 horas
- **Fase 4 (Manifests)**: 6 horas
- **Fase 5 (Testing)**: 4 horas
- **Fase 6 (Docs)**: 2 horas

**Total: ~26 horas** (3-4 días de desarrollo)

---

## 📌 PRÓXIMOS PASOS RECOMENDADOS

1. **INMEDIATO**: Corregir nomenclatura `pickup_counter` → `pickup_orders`
2. **CORTO PLAZO**: Definir requirements para las 7 capabilities faltantes
3. **MEDIANO PLAZO**: Crear manifests para auto-registro
4. **LARGO PLAZO**: Sistema de SUGGESTED achievements (Fase 8+)

---

**Autor:** Claude (Anthropic AI)
**Revisión:** Pendiente
**Aprobación:** Pendiente
