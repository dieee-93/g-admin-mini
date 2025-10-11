# 🎯 ESTRATEGIA DE IMPLEMENTACIÓN - Sistema de Capacidades Atómicas

**Objetivo**: Refactorizar BusinessModelRegistry eliminando redundancias mediante capacidades atómicas combinables.

**Trabajo con**: Claude Code (AI-assisted development)

**Enfoque**: ✅ Híbrido (C) - Diseño conceptual → Spec técnica → Implementación directa (sin legacy)

---

## 📊 VISIÓN GENERAL

```
┌─────────────────────────────────────────────────────────────┐
│                    ROADMAP DE 4 FASES                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FASE 1: Diseño Conceptual (SIN código)                    │
│  ├─ Definir capabilities atómicas                          │
│  ├─ Definir feature tags                                   │
│  ├─ Crear matriz capability → tags                         │
│  └─ Validar 10+ casos de uso                               │
│     ✅ Salida: ATOMIC_CAPABILITIES_DESIGN.md completo       │
│                                                             │
│  FASE 2: Especificación Técnica (tipos TS sin implementar) │
│  ├─ Crear types-skeleton.ts                                │
│  ├─ Documentar relaciones (diagramas)                      │
│  ├─ Definir API del engine                                 │
│  └─ Contratos de funciones (JSDoc completo)                │
│     ✅ Salida: ATOMIC_CAPABILITIES_TECHNICAL_SPEC.md        │
│                                                             │
│  FASE 3: Implementación Directa (código limpio, sin legacy)│
│  ├─ Reescribir BusinessModelRegistry.ts                    │
│  ├─ Actualizar FeatureEngine.ts                            │
│  ├─ Actualizar wizard                                      │
│  └─ Tests de integración                                   │
│     ✅ Salida: Sistema funcionando, código limpio           │
│                                                             │
│  FASE 4: Validación Final                                  │
│  ├─ Code review                                            │
│  ├─ Documentación final                                    │
│  ├─ Performance audit                                      │
│  └─ Testing exhaustivo                                     │
│     ✅ Salida: Sistema production-ready                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Estado actual**: ⏳ FASE 1 en progreso (parcial)

---

## 📊 SITUACIÓN ACTUAL

### Arquitectura existente (3 capas)
```
1. BusinessModelRegistry.ts → Define activities + infrastructure
2. FeatureRegistry.ts → Define features (core + conditional)
3. RequirementsRegistry.ts → Define validations + milestones

FeatureEngine.ts → Resuelve: user choices → active features
CapabilityStore.ts → Mantiene estado (Zustand + persist)
CapabilityGate.tsx → Renderizado condicional
```

### Problema identificado
- `BusinessActivityId` mezcla QUÉ + CÓMO (ej: `sells_products_onsite`, `sells_products_pickup`)
- Features compartidas se duplican en múltiples activities
- Lógica de activación compleja por redundancias

---

## 🎯 ESTRATEGIA: 4 FASES ITERATIVAS

**Principio**: DISEÑO COMPLETO antes del código. Validación en cada fase.

### **FASE 1: Diseño Conceptual** (DONE parcial ✅)
**Objetivo**: Definir el modelo mental sin código

**Artefactos**:
- [x] `ATOMIC_CAPABILITIES_DESIGN.md` - Documento conceptual
- [ ] Definir TODAS las capabilities atómicas (BusinessCapabilityId)
- [ ] Definir TODOS los feature tags (FeatureId)
- [ ] Matriz completa Capability → Tags
- [ ] Casos de uso validados (10+ casos reales)

**Criterio de avance**: Poder explicar el sistema a un humano sin mencionar código.

---

### **FASE 2: Especificación Técnica**
**Objetivo**: Traducir conceptos a tipos TypeScript + esquemas de datos

**Artefactos**:
```
docs/02-architecture/
  ├── ATOMIC_CAPABILITIES_TECHNICAL_SPEC.md
  │   ├── Tipos TypeScript (interfaces/types)
  │   ├── Esquema de relaciones (diagrama)
  │   ├── Flujo de datos (sequence diagrams)
  │   └── API del sistema (funciones públicas)
  │
  └── CAPABILITY_MAPPING_DATA.ts (o .json)
      └── Matriz completa de activación
          { capability: [...featureTags] }
```

**Salida esperada**:
- Tipos TS completos (sin implementación)
- Esquema de datos validado
- Contratos de funciones definidos

**Criterio de avance**: Otro developer puede implementar el código siguiendo la spec.

---

### **FASE 2.5: Diseño de Persistencia** ⭐ NUEVA
**Objetivo**: Diseñar estrategia de persistencia y conexión con base de datos

**Herramienta**: MCP Supabase (para inspeccionar y modificar DB en tiempo real)

**Contexto - Estado actual de `business_profiles` table** (verificado con MCP):
```sql
-- Campos existentes que usaremos:
selected_activities         JSONB   DEFAULT '[]'                    -- ⭐ Para BusinessCapabilityId[]
selected_infrastructure     JSONB   DEFAULT '["single_location"]'   -- ⭐ Para InfrastructureId[]
computed_configuration      JSONB   DEFAULT '{}'                    -- Cache de features activadas
active_capabilities         JSONB   DEFAULT '[]'                    -- Legacy (mantener compatibilidad)
completed_milestones        JSONB   DEFAULT '[]'                    -- Para gamificación
```

**Tareas**:

1. **✅ Inspeccionar schema con MCP Supabase** (COMPLETADO)
   ```typescript
   // Ya verificamos que tenemos los campos necesarios:
   selected_activities: BusinessCapabilityId[]        // ← PERFECTO
   selected_infrastructure: InfrastructureId[]        // ← PERFECTO
   ```

2. **Mapear capabilities atómicas a schema existente**
   ```json
   // Ejemplo de datos guardados en DB:
   {
     "selected_activities": [
       "onsite_service",
       "pickup_orders",
       "delivery_shipping",
       "requires_preparation"
     ],
     "selected_infrastructure": ["single_location"],
     "computed_configuration": {
       "activeFeatures": [
         "product_catalog",
         "inventory_tracking",
         "table_management",
         "pos_onsite",
         "pickup_management",
         "delivery_management",
         "kitchen_display"
       ],
       "activeModules": ["sales", "materials", "operations"],
       "activeSlots": [...]
     }
   }
   ```

3. **Definir flujo Wizard → Database** (usar MCP para validar)
   - Wizard captura `selected_activities` + `selected_infrastructure`
   - Frontend POST a `/api/business-profile/update`
   - Backend:
     1. Valida capabilities con `FeatureEngine.activateFeatures()`
     2. Guarda en DB: `selected_activities`, `selected_infrastructure`
     3. Calcula y guarda `computed_configuration`
   - capabilityStore sincroniza desde DB

4. **Actualizar Debug System** (conectar con MCP Supabase)
   - Debug UI lee/escribe directamente a `business_profiles` (vía MCP)
   - Toggle capabilities en tiempo real
   - Visualizar `computed_configuration` en vivo
   - Botón "Reset to defaults" para testing

5. **Validar con MCP Supabase**
   ```typescript
   // Usaremos MCP para:
   - Verificar constraints y indexes
   - Probar queries de capabilities
   - Validar RLS policies
   - Testear funciones helper (has_capability, etc.)
   ```

6. **Actualizar comentarios y documentación de DB** (vía migration SQL)
   ```sql
   COMMENT ON COLUMN business_profiles.selected_activities IS
   'Array de BusinessCapabilityId atómicas: onsite_service, pickup_orders, etc.';
   ```

**Artefactos**:
```
database/
  └── migrations/
      └── update_business_profiles_atomic_capabilities.sql ⭐ NUEVO

docs/02-architecture/
  └── PERSISTENCE_STRATEGY.md ⭐ NUEVO
      ├── Schema de DB actualizado
      ├── Flujo de datos Wizard → DB
      ├── API endpoints necesarios
      └── Debug system integration
```

**Criterio de avance**: Schema DB listo, flujo wizard→DB diseñado, debug system actualizado.

---

### **FASE 3: Implementación Directa**
**Objetivo**: Reemplazar sistema actual con código limpio (sin legacy)

**Contexto**: App en desarrollo, sin usuarios reales, DB casi vacía
**Estrategia**: Reemplazo directo, mantener estructura/nombres compatibles

```typescript
// BusinessModelRegistry.ts (REEMPLAZO COMPLETO)

// ✅ NUEVO SISTEMA (nombres compatibles con estructura original)
export type BusinessActivityId =  // ← Mismo nombre que antes
  | 'onsite_service'
  | 'pickup_orders'
  | 'delivery_shipping'
  | 'requires_preparation'
  | 'async_operations'
  | 'corporate_sales'
  | 'mobile_operations';

export type InfrastructureId =  // ← Mantiene nombre original
  | 'single_location'
  | 'multi_location'
  | 'mobile_business'
  | 'online_only';

// Matriz de activación (reemplaza activatesFeatures viejo)
const CAPABILITY_FEATURES: Record<BusinessActivityId, FeatureId[]> = {
  'onsite_service': ['materials_management', 'pos_system', ...],
  'pickup_orders': ['pickup_scheduling', ...],
  // ... resto
};

// ✅ Mantener API pública compatible
export function getActivatedFeatures(
  activities: BusinessActivityId[],
  infrastructure: InfrastructureId[]
): FeatureId[] {
  // NUEVA lógica, MISMA firma
  const featuresSet = new Set<FeatureId>();

  activities.forEach(activity => {
    CAPABILITY_FEATURES[activity].forEach(f => featuresSet.add(f));
  });

  // Infrastructure también activa features
  infrastructure.forEach(infra => {
    INFRASTRUCTURE_FEATURES[infra].forEach(f => featuresSet.add(f));
  });

  return Array.from(featuresSet);
}
```

**Archivos a modificar** (reemplazo directo):
1. `src/config/BusinessModelRegistry.ts` - Reescribir completamente
2. `src/config/FeatureRegistry.ts` - Actualizar si es necesario
3. `src/lib/features/FeatureEngine.ts` - Mantener API, actualizar lógica
4. `src/store/capabilityStore.ts` - Sin cambios (usa API pública)
5. `src/pages/setup/` - Actualizar wizard con nuevas capabilities

**Criterio de avance**: Tests pasan, código limpio sin legacy.

---

### **FASE 4: Validación y Cleanup**
**Objetivo**: Eliminar legacy code, optimizar, documentar

**Tareas**:
- [ ] Remover tipos/funciones v1
- [ ] Actualizar tests
- [ ] Actualizar documentación
- [ ] Performance audit
- [ ] Developer experience improvements

**Criterio de éxito**: Sistema 100% migrado, sin legacy code, docs actualizadas.

---

## 🛠️ ARTEFACTOS PROPUESTOS

### Documentos de Diseño
```
docs/
├── ATOMIC_CAPABILITIES_DESIGN.md ✅ (ya existe, mejorar)
├── ATOMIC_CAPABILITIES_TECHNICAL_SPEC.md ⏳ (crear en Fase 2)
└── ATOMIC_CAPABILITIES_MIGRATION_GUIDE.md ⏳ (crear en Fase 3)
```

### Esqueleto de Código
```typescript
// docs/02-architecture/types-skeleton.ts
// Este archivo NO ejecuta, solo define contratos

/**
 * NIVEL 1: User Choices (lo que elige en wizard)
 */
export type BusinessCapabilityId =
  | 'onsite_service'       // Servicio en local
  | 'pickup_orders'        // Retiro de pedidos
  | 'delivery_shipping'    // Envío a domicilio
  | 'requires_preparation' // Requiere cocina/producción
  | 'async_operations'     // Venta 24/7
  | 'corporate_sales'      // B2B
  | 'mobile_operations';   // Food truck/móvil

/**
 * NIVEL 2: Feature Tags (lo que activa cada capability)
 */
export type FeatureTag =
  | 'materials_management'
  | 'recipes'
  | 'kitchen_management'
  | 'pos_system'
  | 'staff_management'
  | 'table_management'
  | 'pickup_scheduling'
  | 'delivery_zones'
  | 'delivery_tracking'
  | 'async_orders'
  | 'corporate_accounts'
  | 'mobile_pos';

/**
 * NIVEL 3: Matriz de Activación
 */
export interface CapabilityFeatureMapping {
  [capability: BusinessCapabilityId]: FeatureTag[];
}

/**
 * NIVEL 4: Engine API (funciones públicas)
 */
export interface CapabilityEngine {
  /**
   * Obtiene features activas según capabilities seleccionadas
   * Deduplicación automática de tags compartidos
   */
  getActiveFeatures(
    selectedCapabilities: BusinessCapabilityId[]
  ): FeatureTag[];

  /**
   * Valida que combinación de capabilities sea válida
   */
  validateCapabilities(
    capabilities: BusinessCapabilityId[]
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };

  /**
   * Sugiere capabilities adicionales según las seleccionadas
   */
  suggestCapabilities(
    current: BusinessCapabilityId[]
  ): BusinessCapabilityId[];
}
```

---

## 📋 WORKFLOW PROPUESTO (Para Claude Code)

### **Sesión 1: Completar Fase 1 (Diseño Conceptual)**
```
1. Revisar ATOMIC_CAPABILITIES_DESIGN.md actual
2. Definir lista COMPLETA de capabilities (sin código)
3. Definir lista COMPLETA de feature tags
4. Crear matriz completa capability → tags
5. Validar con 10 casos de uso reales
6. Checkpoint: ¿El modelo mental es claro? → SÍ/NO
```

### **Sesión 2: Fase 2 (Especificación Técnica)**
```
1. Crear types-skeleton.ts con TODOS los tipos
2. Documentar relaciones en diagrams (Mermaid)
3. Definir API completa del engine
4. Escribir contratos de funciones (JSDoc completo)
5. Checkpoint: ¿Otro dev puede implementarlo? → SÍ/NO
```

### **Sesión 2.5: Fase 2.5 (Diseño de Persistencia)** ⭐ NUEVA
```
1. ✅ Inspeccionar business_profiles con MCP Supabase
2. Mapear capabilities atómicas → campos DB existentes
3. Diseñar flujo Wizard → Database
4. Actualizar Debug System (conectar con MCP)
5. Validar schema con queries de prueba (MCP)
6. Crear migration SQL si es necesario
7. Checkpoint: ¿Schema listo para implementación? → SÍ/NO
```

### **Sesión 3-N: Fase 3 (Implementación Directa)**
```
1. Reescribir BusinessModelRegistry.ts (código limpio)
2. Actualizar FeatureEngine con nueva lógica
3. Actualizar wizard con nuevas capabilities
4. Tests de integración
5. Limpiar imports obsoletos
6. Checkpoint: ¿Tests pasan? ¿Código limpio? → SÍ/NO
```

### **Última Sesión: Fase 4 (Validación Final)**
```
1. Code review completo
2. Testing exhaustivo con MCP Supabase:
   - Probar todos los casos de uso en DB real
   - Validar computed_configuration se genera correctamente
   - Testear funciones helper (has_capability, etc.)
   - Verificar RLS policies funcionan
3. Testing del Debug System:
   - Toggle capabilities en vivo
   - Verificar sincronización DB ↔ capabilityStore
4. Performance audit
5. Actualizar documentación final
6. Verificar ejemplos en docs funcionan
```

---

## 🎨 PROPUESTA ALTERNATIVA: "Living Specification"

**En lugar de docs estáticos, usar:**

### **Opción A: TypeScript + JSDoc como Spec**
```typescript
// src/config/AtomicCapabilitiesSpec.ts

/**
 * @capability onsite_service
 * @description Servicio o consumo en el local
 * @examples
 *   - Restaurant con mesas
 *   - Café con barra
 *   - Peluquería con sillas
 *   - Retail con atención en mostrador
 * @activates
 *   - materials_management (gestión de stock)
 *   - pos_system (punto de venta)
 *   - staff_management (gestión de personal)
 *   - service_areas (áreas de servicio/mesas)
 * @conflicts
 *   - online_only (no tiene sentido si no hay local)
 */
export const ONSITE_SERVICE: CapabilityDefinition = {
  id: 'onsite_service',
  name: 'Servicio en Local',
  description: 'Atención y consumo en el local físico',
  features: [
    'materials_management',
    'pos_system',
    'staff_management',
    'service_areas'
  ],
  examples: [
    'Restaurant con mesas',
    'Café con barra',
    'Peluquería',
    'Tienda con mostrador'
  ],
  conflicts: ['online_only']
};
```

**Ventajas**:
- Spec = Código (siempre sincronizados)
- Type safety out of the box
- AI puede leer y generar código directamente
- Tests validan la spec

---

## ✅ DECISIÓN: ENFOQUE HÍBRIDO (C) ✅

**Estrategia seleccionada**:

### **C) Híbrido - Sin código legacy**
- **Fase 1**: Doc markdown (diseño conceptual - ATOMIC_CAPABILITIES_DESIGN.md)
- **Fase 2**: Especificación técnica (types skeleton + diagramas)
- **Fase 3**: Implementación directa (reemplazo completo, código limpio)
- **Fase 4**: Validación final

**Ventajas**:
- ✅ Diseño claro antes del código
- ✅ TypeScript con JSDoc exhaustivo
- ✅ Sin código legacy ni migraciones
- ✅ Mantiene compatibilidad de nombres/estructura
- ✅ App en desarrollo = podemos romper sin consecuencias

**Características clave**:
- Reemplazo directo (no dual-mode)
- Mantener nombres originales: `BusinessActivityId`, `InfrastructureId`
- API pública compatible donde sea posible
- Código 100% limpio desde el inicio

---

## 🎯 PRÓXIMO PASO INMEDIATO

**Completar Fase 1 - Diseño Conceptual**:

1. Abrir `ATOMIC_CAPABILITIES_DESIGN.md`
2. Definir lista FINAL de `BusinessCapabilityId` (todas, sin código)
3. Definir lista FINAL de `FeatureTag` (todos, sin código)
4. Completar matriz capability → tags (100%)
5. Validar con 10 casos de uso

**Tiempo estimado**: 1-2 sesiones con Claude Code

**Criterio de avance**: Poder responder "¿Cómo funciona el sistema?" sin dudar.

---

## 🗄️ USO DE MCP SUPABASE EN CADA FASE

### **Durante Fase 2.5 (Diseño de Persistencia)**
```typescript
// 1. Inspeccionar schema actual
mcp__supabase__execute_sql({
  query: `
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'business_profiles'
  `
})

// 2. Probar queries de capabilities
mcp__supabase__execute_sql({
  query: `
    SELECT selected_activities, selected_infrastructure
    FROM business_profiles
    WHERE organization_id IS NULL
  `
})

// 3. Validar funciones helper
mcp__supabase__execute_sql({
  query: "SELECT has_capability('onsite_service')"
})
```

### **Durante Fase 3 (Implementación)**
```typescript
// Insertar datos de prueba para cada caso de uso
mcp__supabase__execute_sql({
  query: `
    UPDATE business_profiles
    SET selected_activities = '["onsite_service", "pickup_orders"]'::jsonb,
        selected_infrastructure = '["single_location"]'::jsonb
    WHERE organization_id IS NULL
  `
})

// Verificar que capabilityStore sincroniza correctamente
```

### **Durante Fase 4 (Validación)**
```typescript
// Testing de los 10 casos de uso
for (const caso of casosDeUso) {
  // 1. Insertar capabilities del caso
  mcp__supabase__execute_sql({
    query: `UPDATE business_profiles SET selected_activities = ...`
  })

  // 2. Verificar computed_configuration se generó bien
  mcp__supabase__execute_sql({
    query: `SELECT computed_configuration FROM business_profiles`
  })

  // 3. Validar que UI muestra features correctas
}
```

### **Debug System - Conexión en Vivo con DB**
```typescript
// El debug system usará MCP para:
- Leer capabilities actuales desde DB
- Actualizar capabilities en tiempo real
- Visualizar computed_configuration
- Reset a defaults para testing
```

---

## 💬 ESTADO ACTUAL Y PRÓXIMOS PASOS

### ✅ FASE 1 COMPLETADA - Diseño Conceptual

**Tareas completadas**:

1. ✅ **Completar diseño conceptual** en `ATOMIC_CAPABILITIES_DESIGN.md`:
   - Definir lista COMPLETA de `BusinessActivityId` (9 capabilities atómicas)
   - Definir lista COMPLETA de `FeatureId` (25 feature tags del código existente)
   - Crear matriz 100% completa: capability → features
   - Validar con 10 casos de uso reales

2. ✅ **Resolver ambigüedades pendientes**:
   - ✅ Catálogo online es universal (implícito)
   - ✅ Abstracción total - no separar food vs retail
   - ✅ POS genérico (contexto decide uso)

3. ✅ **Validar nomenclatura**:
   - IDs claros y autoexplicativos
   - Sin ambigüedades
   - Fáciles de entender en el wizard

4. ✅ **Diseñar Wizard UI** (interfaz sin redundancias)

5. ✅ **Documentar convenciones** de nomenclatura

---

### ⏳ PRÓXIMO PASO: FASE 2 - Especificación Técnica

**Tareas pendientes**:

1. Crear `ATOMIC_CAPABILITIES_TECHNICAL_SPEC.md`
   - Tipos TypeScript completos (sin implementación)
   - Diagramas de relaciones (Mermaid)
   - API del sistema (contratos de funciones)
   - Flujo de datos (sequence diagrams)

2. Crear `types-skeleton.ts` (solo definiciones)
   - Interfaces completas
   - JSDoc exhaustivo

3. Plan de implementación detallado
   - Archivos a modificar
   - Orden de cambios
   - Tests requeridos

**¿Arrancamos con Fase 2 ahora?**

