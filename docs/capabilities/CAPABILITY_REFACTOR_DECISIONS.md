# 🎯 Decisiones de Refactor - Capabilities System

**Fecha**: 2025-01-26
**Decisor**: Diego + Claude
**Estado**: ✅ Decisiones tomadas - Listos para implementar

---

## 📋 CONTEXTO

Durante el diseño del ShiftControlWidget se detectaron 3 problemas arquitectónicos críticos que requieren refactor antes de continuar con la implementación.

**Documentos de referencia**:
- `docs/capabilities/CAPABILITY_ARCHITECTURE_ISSUES.md` - Análisis detallado de problemas
- `docs/shift-control/SHIFT_CONTROL_ARCHITECTURE.md` - Diseño original del widget
- `docs/shift-control/SHIFT_CONTROL_ARCHITECTURE_QA.md` - Preguntas y respuestas

---

## ✅ DECISIÓN 1: mobile_operations - Arquitectura GPS/Location

### 🎯 Problema

`mobile_operations` capability se usa para activar features de GPS tracking, pero genera confusión:
- ❌ Restaurante fijo necesita GPS para deliveries → ¿Debe activar mobile_operations?
- ❌ Nombre sugiere "negocio móvil" pero realmente activa "GPS features"
- ❌ Se solapa con `mobile_business` (Infrastructure)

### ✅ Decisión Tomada

**MANTENER `mobile_operations` como Capability, pero auditar arquitectura capabilities-features**

**Razón**:
`mobile_operations` fue diseñada específicamente para **activar soporte de food trucks** (combinable con otras capabilities). Su propósito es correcto, pero necesitamos asegurar que la arquitectura de auto-activación de features funcione correctamente.

**Implementación**:

```typescript
// ✅ REGLA: GPS features se auto-activan según contexto

// 1. Si tiene delivery_shipping → Auto-activar delivery tracking features
if (hasCapability('delivery_shipping')) {
  autoActivateFeatures([
    'mobile_location_tracking',  // Para drivers
    'mobile_route_planning',     // Optimización de rutas
  ]);
}

// 2. Si tiene mobile_operations → Activar features de food truck
if (hasCapability('mobile_operations')) {
  autoActivateFeatures([
    'mobile_location_tracking',    // Ubicación del truck
    'mobile_route_planning',       // Ruta planificada
    'mobile_inventory_constraints' // Inventario limitado móvil
  ]);
}

// 3. Si tiene professional_services SIN onsite → Servicios a domicilio
if (hasCapability('professional_services') && !hasCapability('onsite_service')) {
  autoActivateFeatures([
    'mobile_location_tracking',  // Ubicación del técnico
    'mobile_route_planning'      // Ruta del día
  ]);
}
```

**Acción requerida**:
- [ ] Auditar `FeatureActivationEngine` para GPS tracking
- [ ] Verificar que delivery_shipping activa tracking automáticamente
- [ ] Verificar que mobile_operations activa features correctas
- [ ] Documentar en `ATOMIC_CAPABILITIES_DESIGN.md`

---

## ✅ DECISIÓN 2: online_store → async_operations (RENAMING)

### 🎯 Problema

`online_store` genera confusión conceptual:
- Nombre sugiere "e-commerce puro" (como Amazon)
- Realidad: "Operaciones fuera de horario" (pre-orders, pre-booking)
- No todos los negocios con online_store son 24/7

### ✅ Decisión Tomada

**RENOMBRAR `online_store` → `async_operations`**

**Nueva descripción**:
> "Operaciones asíncronas: Permite recibir pedidos, reservas y citas fuera del horario operativo del negocio físico"

**Comportamiento**:

```typescript
// Restaurante con async_operations
Horario físico: 12:00 - 23:00

├─ 15:00 (DENTRO horario)
│  └─ Cliente ordena → Procesamiento INMEDIATO
│
└─ 02:00 (FUERA horario)
   └─ Cliente ordena → Pedido PROGRAMADO para mañana

// Salón con async_operations
Horario físico: 10:00 - 20:00

├─ 14:00 (DENTRO horario)
│  └─ Cliente agenda → Walk-in o cita inmediata
│
└─ 23:00 (FUERA horario)
   └─ Cliente agenda → Cita para mañana
```

**Cambios requeridos**:

1. **Tipos** (`src/config/types/atomic-capabilities.ts`):
```typescript
export type BusinessCapabilityId =
  // ...
  | 'async_operations'    // ✅ Renamed from 'online_store'
  | 'corporate_sales'
  | 'mobile_operations';
```

2. **Business Model Registry**:
```typescript
{
  id: 'async_operations',
  name: 'Operaciones Asíncronas',
  description: 'Recibe pedidos, reservas y citas fuera del horario operativo',
  icon: '🌙',
  activatesFeatures: [
    'sales_online_order_processing',
    'scheduling_after_hours_booking',
    'sales_deferred_fulfillment'
  ]
}
```

3. **Migration script**:
```sql
-- Migrate existing data
UPDATE business_profiles
SET selected_activities = array_replace(selected_activities, 'online_store', 'async_operations')
WHERE 'online_store' = ANY(selected_activities);
```

4. **Codebase**:
```bash
# Global find & replace
- 'online_store' → 'async_operations'
- "online_store" → "async_operations"
- hasCapability('online_store') → hasCapability('async_operations')
```

**Acción requerida**:
- [ ] Crear migration script
- [ ] Ejecutar find & replace global
- [ ] Update tests
- [ ] Update documentation

---

## ✅ DECISIÓN 3: digital_products - Widget Behavior

### 🎯 Problema

Productos digitales operan 24/7 por naturaleza (descarga automática, sin staff). ¿Qué muestra ShiftControlWidget?

### ✅ Decisión Tomada

**Widget Simplificado para digital_products puro**

**Regla**:

```typescript
// Caso 1: Digital PURO (100% digital)
if (hasCapability('digital_products') && !hasAnyPhysicalCapability()) {
  return <DigitalStoreWidget />; // Widget simplificado
}

// Caso 2: Híbrido (física + digital)
if (hasCapability('digital_products') && hasAnyPhysicalCapability()) {
  return <PhysicalShiftControlWidget />; // Widget normal, ignora digital
}
```

**Widget Simplificado** (`DigitalStoreWidget`):

```tsx
<Box borderColor="blue.500">
  <Stack>
    {/* Status badge */}
    <Badge colorPalette="blue" variant="solid">
      ● TIENDA ONLINE ACTIVA (24/7)
    </Badge>

    {/* Métricas del día */}
    <SimpleGrid columns={3} gap={4}>
      <Stat>
        <StatLabel>Ventas Hoy</StatLabel>
        <StatNumber>47</StatNumber>
        <StatHelpText>+12% vs ayer</StatHelpText>
      </Stat>

      <Stat>
        <StatLabel>Revenue Hoy</StatLabel>
        <StatNumber>$3,240</StatNumber>
      </Stat>

      <Stat>
        <StatLabel>Descargas Pendientes</StatLabel>
        <StatNumber>3</StatNumber>
        <StatHelpText>Procesando...</StatHelpText>
      </Stat>
    </SimpleGrid>

    {/* Quick Actions */}
    <QuickActionsGrid>
      <QuickAction icon={DocumentIcon} label="Nuevo Producto" />
      <QuickAction icon={ChartIcon} label="Analytics" />
      <QuickAction icon={UsersIcon} label="Clientes" />
    </QuickActionsGrid>
  </Stack>
</Box>
```

**NO muestra**:
- ❌ Turno abierto/cerrado (no aplica)
- ❌ Cash session (no hay efectivo)
- ❌ Staff activo (no hay staff operativo)
- ❌ Business hours (opera 24/7)

**SÍ muestra**:
- ✅ Ventas del día
- ✅ Revenue
- ✅ Pedidos/descargas pendientes
- ✅ Quick actions relevantes

**Acción requerida**:
- [ ] Crear componente `DigitalStoreWidget`
- [ ] Agregar lógica de detección en `useWidgetMode`
- [ ] Tests para pure digital

---

## 🎨 DECISIÓN 4: Pattern para Evitar Nested Conditions

### 🎯 Problema

Código con múltiples condiciones anidadas es ilegible:

```typescript
// ❌ ANTI-PATTERN: Nested conditions
if (hasCapability('delivery_shipping') ||
    hasInfrastructure('mobile_business') ||
    (hasCapability('professional_services') && !hasCapability('onsite_service'))) {
  activateFeature('gps_location_tracking');
}
```

### ✅ Decisión Tomada

**Usar Strategy Pattern + Rule Engine**

#### Opción A: Strategy Pattern (Recomendada)

```typescript
/**
 * Widget Mode Strategy
 * Determina qué variante del widget renderizar según capabilities
 */
interface WidgetModeStrategy {
  shouldApply: (capabilities: Capabilities) => boolean;
  priority: number;
  component: React.ComponentType;
}

const widgetModeStrategies: WidgetModeStrategy[] = [
  // 1. Pure Digital (highest priority)
  {
    shouldApply: (caps) => caps.has('digital_products') && !caps.hasAnyPhysical(),
    priority: 100,
    component: DigitalStoreWidget
  },

  // 2. Mobile Business
  {
    shouldApply: (caps) => caps.hasInfrastructure('mobile_business'),
    priority: 90,
    component: MobileBusinessWidget
  },

  // 3. Multi-location
  {
    shouldApply: (caps) => caps.hasInfrastructure('multi_location'),
    priority: 80,
    component: MultiLocationWidget
  },

  // 4. Hybrid (física + async)
  {
    shouldApply: (caps) => caps.has('onsite_service') && caps.has('async_operations'),
    priority: 70,
    component: HybridWidget
  },

  // 5. Physical only (default)
  {
    shouldApply: () => true,  // Fallback
    priority: 0,
    component: PhysicalWidget
  }
];

// Usage
function useWidgetMode() {
  const capabilities = useCapabilities();

  const strategy = useMemo(() => {
    return widgetModeStrategies
      .sort((a, b) => b.priority - a.priority)
      .find(s => s.shouldApply(capabilities));
  }, [capabilities]);

  return strategy;
}

// In component
const { component: WidgetComponent } = useWidgetMode();
return <WidgetComponent />;
```

**Ventajas**:
- ✅ Legible: Una condición por strategy
- ✅ Testeable: Cada strategy se prueba aislada
- ✅ Extensible: Agregar nuevas variantes sin tocar código existente
- ✅ Prioridad clara: Orden explícito de evaluación

---

#### Opción B: Rule-Based Engine

```typescript
/**
 * Capability Rules Engine
 * Define reglas declarativas para activación de features
 */
interface CapabilityRule {
  name: string;
  when: (caps: Capabilities) => boolean;
  then: string[];  // Features to activate
}

const capabilityRules: CapabilityRule[] = [
  {
    name: 'Delivery GPS Tracking',
    when: (caps) => caps.has('delivery_shipping'),
    then: ['mobile_location_tracking', 'mobile_route_planning']
  },

  {
    name: 'Food Truck Features',
    when: (caps) => caps.has('mobile_operations'),
    then: ['mobile_location_tracking', 'mobile_route_planning', 'mobile_inventory_constraints']
  },

  {
    name: 'Mobile Services Tracking',
    when: (caps) => caps.has('professional_services') && !caps.has('onsite_service'),
    then: ['mobile_location_tracking', 'mobile_route_planning']
  }
];

// Engine
function evaluateCapabilityRules(capabilities: Capabilities): string[] {
  const activatedFeatures = new Set<string>();

  for (const rule of capabilityRules) {
    if (rule.when(capabilities)) {
      rule.then.forEach(feature => activatedFeatures.add(feature));
    }
  }

  return Array.from(activatedFeatures);
}
```

**Ventajas**:
- ✅ Declarativo: Reglas legibles
- ✅ Debuggeable: Se puede log de qué reglas se ejecutaron
- ✅ Auditable: Fácil revisar qué activa qué

---

### ✅ Decisión Final: Usar AMBAS

**Strategy Pattern** → Para variantes de UI (widgets)
**Rule Engine** → Para auto-activación de features

**Implementación**:

```typescript
// File: src/lib/capabilities/strategies/widgetModeStrategies.ts
export const widgetModeStrategies = [/* ... */];

// File: src/lib/capabilities/rules/featureActivationRules.ts
export const featureActivationRules = [/* ... */];

// File: src/lib/capabilities/hooks/useWidgetMode.ts
export function useWidgetMode() {
  const capabilities = useCapabilities();
  return widgetModeStrategies
    .sort((a, b) => b.priority - a.priority)
    .find(s => s.shouldApply(capabilities));
}

// File: src/lib/capabilities/engines/FeatureActivationEngine.ts
export function evaluateFeatureActivation(capabilities: Capabilities) {
  return featureActivationRules
    .filter(rule => rule.when(capabilities))
    .flatMap(rule => rule.then);
}
```

**Acción requerida**:
- [ ] Crear `src/lib/capabilities/strategies/`
- [ ] Crear `src/lib/capabilities/rules/`
- [ ] Migrar lógica existente a strategies
- [ ] Unit tests para cada strategy/rule

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1: Refactor Capabilities (3-4 días)

**Prioridad CRÍTICA**:

1. **Renaming online_store → async_operations** (1 día)
   - [ ] Migration script
   - [ ] Global find & replace
   - [ ] Update types
   - [ ] Update tests
   - [ ] Update docs

2. **Auditar GPS Features Auto-Activation** (1 día)
   - [ ] Revisar FeatureActivationEngine
   - [ ] Verificar delivery_shipping rules
   - [ ] Verificar mobile_operations rules
   - [ ] Agregar missing rules si hay
   - [ ] Tests de integración

3. **Implementar Strategy Pattern** (1-2 días)
   - [ ] Crear widgetModeStrategies
   - [ ] Crear featureActivationRules
   - [ ] Migrar lógica existente
   - [ ] Unit tests
   - [ ] Integration tests

### Fase 2: ShiftControl Implementation (5-6 días)

**Con arquitectura limpia**:

4. **Module Exports Verification** (1 día)
   - [ ] Verificar Cash Module exports
   - [ ] Verificar Staff Module exports
   - [ ] Verificar Scheduling Module exports
   - [ ] Agregar missing exports

5. **Hooks Orchestration** (1 día)
   - [ ] Crear useShiftControl (orquestador limpio)
   - [ ] Integrar con strategies
   - [ ] Unit tests

6. **UI Components** (2 días)
   - [ ] PhysicalWidget
   - [ ] HybridWidget (física + async)
   - [ ] MobileBusinessWidget
   - [ ] DigitalStoreWidget
   - [ ] MultiLocationWidget (context-aware)

7. **Dynamic Quick Actions** (1 día)
   - [ ] Hook point: dashboard.quick_actions
   - [ ] Registrar actions en manifests
   - [ ] Filtrado por capabilities

8. **Testing & Polish** (1 día)
   - [ ] Tests por cada variante
   - [ ] Accessibility audit
   - [ ] Performance check

**Total**: ~8-10 días

---

## ✅ CRITERIOS DE ÉXITO

### Capabilities Refactor

- [ ] `async_operations` renombrado y migrado
- [ ] GPS features se auto-activan correctamente
- [ ] Strategy pattern implementado
- [ ] 0 nested conditions en componentes
- [ ] Test coverage > 80%

### ShiftControl Widget

- [ ] Funciona con TODAS las variantes de capabilities
- [ ] NO tiene data hardcodeada
- [ ] Quick Actions dinámicas
- [ ] Tiempo de carga < 500ms
- [ ] WCAG 2.1 AA compliant

---

## 📚 REFERENCIAS

### Documentos
- `docs/capabilities/CAPABILITY_ARCHITECTURE_ISSUES.md`
- `docs/shift-control/SHIFT_CONTROL_ARCHITECTURE.md`
- `src/config/types/atomic-capabilities.ts`

### Patterns
- Strategy Pattern: https://refactoring.guru/design-patterns/strategy
- Rule Engine: https://martinfowler.com/bliki/RulesEngine.html

---

**Documento creado por**: Claude Code
**Aprobado por**: Diego
**Estado**: ✅ Listo para implementación
**Última actualización**: 2025-01-26
