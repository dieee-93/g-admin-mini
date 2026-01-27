# ACHIEVEMENTS SYSTEM - Análisis Arquitectónico y Plan de Refactoring

**Fecha:** 2025-01-18  
**Estado:** 🔬 Investigación Completa  
**Prioridad:** 🔴 ALTA - Sistema con múltiples anti-patterns

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Problemas Identificados](#problemas-identificados)
3. [Clarificaciones del Cliente](#clarificaciones-del-cliente)
4. [Arquitectura Actual](#arquitectura-actual)
5. [Arquitectura Propuesta](#arquitectura-propuesta)
6. [Plan de Migración](#plan-de-migración)

---

## 🎯 RESUMEN EJECUTIVO {#resumen-ejecutivo}

### Estado Actual
- ✅ Sistema de requirements funcional (3 capas: mandatory, suggested, cumulative)
- ❌ Widget con anti-pattern de acceso directo a stores
- ❌ EventBus NO integrado con achievements
- ❌ Gamificación mezclada con requirements del sistema
- ❌ achievementsStore contiene data que debería estar en TanStack Query o DB

### Objetivo
Refactorizar el sistema de achievements para:
1. Separar gamificación (futura) de requirements del sistema
2. Integrar correctamente con EventBus
3. Migrar datos a TanStack Query donde corresponda
4. Implementar notificaciones cuando se completan achievements
5. Widget reactivo que se actualiza en tiempo real

---

## 🚨 PROBLEMAS IDENTIFICADOS {#problemas-identificados}

### Problema 1: Widget con Anti-Pattern
**📍 Ubicación:** `src/modules/achievements/components/AchievementsWidget.tsx:89-197`

**Descripción:**
```typescript
// ❌ ANTI-PATTERN: 6 niveles de imports dinámicos anidados
import('@/hooks/useValidationContext').then(({ useValidationContext }) => {
  import('@/modules/products/hooks/useProducts').then(({ useProducts }) => {
    import('@/store/staffStore').then(({ useStaffStore }) => {
      import('@/store/operationsStore').then(({ useOperationsStore }) => {
        import('@/store/salesStore').then(({ useSalesStore }) => {
          import('@/store/appStore').then(({ useAppStore }) => {
            import('@tanstack/react-query').then(({ useQueryClient }) => {
              // ❌ Acceso directo al cache de Query desde window
              const queryClient = (window as any).__queryClient;
              const productsData = queryClient?.getQueryData(['products', 'intelligence']) || [];
              // ... 100+ líneas más
            });
          });
        });
      });
    });
  });
});
```

**Por qué existe:**
Según los comentarios en el código, intentan evitar "infinite loops" causados por `useValidationContext`.

**Impacto:**
- Código extremadamente difícil de mantener
- No es reactivo - datos no se actualizan automáticamente
- Acceso inseguro al cache de Query
- Inconsistente con el resto del código

---

### Problema 2: useValidationContext causa Infinite Loops
**📍 Ubicación:** `src/hooks/useValidationContext.ts`

**Descripción:**
```typescript
// ❌ Crea 5+ suscripciones a Zustand stores en cada render
export function useValidationContext(): ValidationContext {
  const products = useProductsStore(state => state.products);  // ❌ Ya no existe
  const staff = useStaffStore(state => state.staff);
  const operations = useOperationsStore(state => state);
  const sales = useSalesStore(state => state.sales);  // ❌ Ya no existe
  // ...
}
```

**Root Cause:**
- Productos migrados a TanStack Query, pero ValidationContext aún usa Zustand
- Cada store update → re-render → nuevas suscripciones → loop infinito

---

### Problema 3: EventBus NO integrado
**📍 Ubicación:** `src/modules/achievements/` (todo el módulo)

**Descripción:**
- ✅ El diseño dice: "Achievements escucha eventos y trackea progreso"
- ❌ La realidad: NO hay listeners de EventBus en achievements
- ✅ Otros módulos SÍ usan EventBus correctamente:

```typescript
// ✅ EJEMPLO: Products module escucha eventos
eventBus.subscribe('materials.stock_updated', async (event) => {
  // Actualiza availability, invalida cache, etc.
});
```

**Eventos que deberían escucharse:**
- `products.created` - Para achievement "+10 productos"
- `sales.order_completed` - Para achievement "+10 ventas"
- `staff.member_added` - Para achievement "Primer empleado"
- `settings.updated` - Para re-validar requirements

---

### Problema 4: Gamificación mezclada con Requirements
**📍 Ubicación:** `src/store/achievementsStore.ts`

**Descripción:**
El store mezcla 3 tipos de datos:

```typescript
export interface AchievementsState {
  // ✅ UI State (OK en Zustand)
  isSetupModalOpen: boolean;
  setupModalData: SetupModalData | null;

  // ⚠️ GAMIFICATION DATA (debería estar en DB/TanStack Query)
  completedAchievements: Set<string>;  // Achievements del ADMIN/STAFF
  totalPoints: number;                  // Puntos de ADMIN/STAFF
  unlockedBadges: string[];             // Badges de ADMIN/STAFF

  // ⚠️ SYSTEM DATA (no debería persistirse)
  registeredRequirements: Map<BusinessCapabilityId, Requirement[]>;
  capabilityProgress: Map<BusinessCapabilityId, CapabilityProgress>;
}
```

**Problema:** 
Según cliente, puntos/badges NO son para administradores. Son para:
1. **Futuro cercano:** Sistema de onboarding/tutoriales
2. **Futuro lejano:** Clientes finales (loyalty program)

---

### Problema 5: Data en lugar de UI State (Zustand)
**📍 Ubicación:** `src/store/achievementsStore.ts:83, 428-455`

**Descripción:**
```typescript
// ❌ Requirements registry en Zustand (datos estáticos del sistema)
registeredRequirements: Map<BusinessCapabilityId, Requirement[]>

// ❌ Progress cache en Zustand (datos computados)
capabilityProgress: Map<BusinessCapabilityId, CapabilityProgress>
```

**Debería ser:**
- Requirements: Archivo estático o eventualmente en DB
- Progress: Computado on-demand desde TanStack Query data

---

## 💡 CLARIFICACIONES DEL CLIENTE {#clarificaciones-del-cliente}

### 1. Gamificación
> "El sistema de gamification/points/badges no termina de quedar clara su función"

**Propósito de Achievements:**
- **Obligatorios:** Enseñar a configurar el sistema (setup wizard)
- **Recomendados:** Sugerir mejoras (best practices)
- **Acumulativos:** Sensación de progreso (+10 clientes, +20 productos, etc.)

**NO es para:**
- ❌ Administradores/staff del panel (por ahora)
- ✅ Podría ser útil en el futuro para:
  - Motivación de empleados
  - Loyalty program para clientes finales

**ACCIÓN REQUERIDA:**
- Separar lógica de gamificación
- Comentar claramente qué es qué
- Preparar para uso futuro (empleados/clientes)

### 2. Widget Behavior
> "Lo ideal sería que se actualice en tiempo real si no es costoso"

**Prioridades:**
1. 🔴 **CRÍTICO:** Notificar cuando un achievement se completa (sistema de notificaciones de 3 niveles)
2. ✅ Actualización en tiempo real si no consume recursos excesivos
3. ✅ Validar en cada navegación al dashboard/achievements page

### 3. EventBus
> "No sé cuál es lo más óptimo para nuestra arquitectura"

**INVESTIGACIÓN:** Ver cómo otros módulos usan EventBus

### 4. Requirements Configuration
> "No sé si deberían ser configurables"

**Clarificación:**
- Requirements irán a DB eventualmente
- NO necesitan ser editables por admin
- PODRÍAN ser configurables para clientes finales (futuro)

---

## 🏗️ ARQUITECTURA ACTUAL {#arquitectura-actual}

### Data Flow Actual

```
┌─────────────────────────────────────────────────────┐
│ AchievementsWidget (Anti-pattern)                   │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ useEffect(() => {                              │ │
│ │   setTimeout(() => {                           │ │
│ │     import('@/hooks/useValidationContext')     │ │
│ │       .then(() => import('@/products'))        │ │
│ │         .then(() => import('@/stores'))        │ │
│ │           .then(() => {                        │ │
│ │             // ❌ window.__queryClient hack    │ │
│ │             // ❌ getState() directo           │ │
│ │             // ❌ No reactivo                  │ │
│ │           })                                   │ │
│ │   }, 100)                                       │ │
│ │ }, [capabilities])                              │ │
│ └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
               │
               ▼
     ┌──────────────────┐
     │ achievementsStore │  ❌ Mezcla UI + Data + Registry
     │                   │
     │ • isModalOpen ✅  │  (UI State)
     │ • points ⚠️       │  (Gamification - futuro)
     │ • requirements ❌ │  (Static data)
     │ • progress ❌     │  (Computed data)
     └──────────────────┘
               │
               ▼
        🚫 NO EventBus
        🚫 NO TanStack Query
        🚫 NO Notifications
```

### useValidationContext (Problemático)

```typescript
export function useValidationContext() {
  // ❌ Acceso a stores que ya no tienen estos datos
  const products = useProductsStore(state => state.products);  // undefined!
  const sales = useSalesStore(state => state.sales);          // undefined!
  
  // ✅ Estos SÍ existen
  const staff = useStaffStore(state => state.staff);
  const settings = useAppStore(state => state.settings);
  
  // ❌ Crea 5+ suscripciones → infinite loop
  return useMemo(() => ({
    products,
    staff,
    settings,
    // ...
  }), [productsLength, staffLength, settingsId]); // Dependencies problemáticas
}
```

---

## 🎯 ARQUITECTURA PROPUESTA {#arquitectura-propuesta}

### Principios de Diseño

Siguiendo las mejores prácticas de Kent C. Dodds y el patrón del proyecto:

1. **Separación de Responsabilidades**
   - UI State → Zustand
   - Server Data → TanStack Query
   - Static Config → Constants/Files
   - Events → EventBus

2. **Colocación de Estado**
   - Keep state as close to where it's needed as possible
   - No global state innecesario

3. **Reactividad**
   - EventBus para invalidar cache cuando cambia data
   - TanStack Query para data reactiva
   - Zustand solo para UI

### Nuevo Data Flow

```
┌─────────────────────────────────────────────────────┐
│ AchievementsWidget (Refactorizado)                  │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ // ✅ Hooks directos de TanStack Query         │ │
│ │ const { data: products } = useProducts();      │ │
│ │ const { data: staff } = useStaff();            │ │
│ │ const { data: settings } = useSettings();      │ │
│ │                                                 │ │
│ │ // ✅ Hook especializado                       │ │
│ │ const progress = useCapabilitiesProgress({     │ │
│ │   capabilities: activeCapabilities             │ │
│ │ });                                            │ │
│ │                                                 │ │
│ │ // ✅ Totalmente reactivo                      │ │
│ └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
               │
               ▼
     ┌──────────────────────────────┐
     │ useCapabilitiesProgress Hook │
     │                               │
     │ • Lee de TanStack Query      │
     │ • Computa progress           │
     │ • Cached automáticamente     │
     │ • Invalida con EventBus      │
     └──────────────────────────────┘
               │
               ▼
        ┌────────────┐      ┌─────────────────┐
        │  EventBus  │◄────►│ TanStack Query  │
        │            │      │                 │
        │ • Listen   │      │ • useProducts   │
        │ • Emit     │      │ • useStaff      │
        │ • Invalidate│     │ • useSettings   │
        └────────────┘      └─────────────────┘
               │                     │
               ▼                     ▼
        ┌──────────────────────────────┐
        │   Notifications System       │
        │   (Toast/Banner/Push)        │
        └──────────────────────────────┘
```

### Separación de Stores

```typescript
// ✅ UI STORE (Zustand)
interface AchievementsUIStore {
  // Modal state
  isSetupModalOpen: boolean;
  setupModalData: SetupModalData | null;
  
  // Actions
  openSetupModal: (data: SetupModalData) => void;
  closeSetupModal: () => void;
}

// ✅ GAMIFICATION STORE (Zustand + Persist)
// NOTA: Para uso futuro (empleados/clientes)
interface GamificationStore {
  // User-specific gamification data
  userId: string | null;
  completedAchievements: Set<string>;
  totalPoints: number;
  unlockedBadges: string[];
  
  // Eventualmente migrar a Supabase
  // TODO: Crear tabla `user_achievements` en DB
}

// ✅ REQUIREMENTS (Constants/File)
// src/modules/achievements/requirements/index.ts
export const REQUIREMENTS_BY_CAPABILITY = {
  pickup_orders: TAKEAWAY_MANDATORY,
  onsite_service: DINEIN_MANDATORY,
  delivery_shipping: DELIVERY_MANDATORY,
  // ...
};

// ✅ PROGRESS (Computed via TanStack Query)
export function useCapabilitiesProgress(capabilities: BusinessCapabilityId[]) {
  const { data: products } = useProducts();
  const { data: staff } = useStaff();
  const { data: settings } = useSettings();
  
  return useQuery({
    queryKey: ['achievements', 'progress', capabilities],
    queryFn: () => computeProgress({
      capabilities,
      context: { products, staff, settings }
    }),
    // Datos reactivos - se actualiza automáticamente
  });
}
```

### EventBus Integration

```typescript
// ✅ En achievements/manifest.tsx setup()
export const achievementsManifest: ModuleManifest = {
  setup: async (registry) => {
    const queryClient = registry.getQueryClient();
    
    // Escuchar eventos relevantes
    eventBus.subscribe('products.created', (event) => {
      // Invalidar cache de progress
      queryClient.invalidateQueries(['achievements', 'progress']);
      
      // Verificar si se completó achievement
      checkAchievement('products_milestone', event.payload);
    });
    
    eventBus.subscribe('sales.order_completed', (event) => {
      queryClient.invalidateQueries(['achievements', 'progress']);
      checkAchievement('sales_milestone', event.payload);
    });
    
    eventBus.subscribe('settings.updated', (event) => {
      queryClient.invalidateQueries(['achievements', 'progress']);
    });
    
    // Helper para verificar y notificar achievements
    async function checkAchievement(type: string, payload: any) {
      const completed = await evaluateAchievement(type, payload);
      
      if (completed) {
        // 🔴 CRÍTICO: Notificar al usuario
        notify.success({
          title: `¡Achievement desbloqueado! ${completed.name}`,
          description: completed.description,
          duration: 5000,
        });
        
        // Emitir evento para otros sistemas
        eventBus.emit('achievements.completed', {
          achievementId: completed.id,
          timestamp: new Date(),
        });
      }
    }
  }
};
```

---

## 📋 PLAN DE MIGRACIÓN {#plan-de-migración}

### Fase 1: Separación y Limpieza (2-3 horas)
**Objetivo:** Separar gamificación de requirements, limpiar código obsoleto

#### Paso 1.1: Crear nuevos stores separados
- [ ] Crear `src/store/achievementsUIStore.ts` (solo UI state)
- [ ] Crear `src/store/gamificationStore.ts` (para futuro)
- [ ] Documentar claramente el propósito de cada uno

#### Paso 1.2: Mover requirements a constants
- [ ] Crear `src/modules/achievements/requirements/index.ts`
- [ ] Mover `TAKEAWAY_MANDATORY`, `DINEIN_MANDATORY`, etc.
- [ ] Eliminar `registeredRequirements` del store

#### Paso 1.3: Comentar/documentar gamificación
- [ ] Agregar comentarios JSDOC explicando uso futuro
- [ ] Marcar con `// TODO: FUTURE - Employee/Customer gamification`
- [ ] Crear `GAMIFICATION_ROADMAP.md` con plan futuro

### Fase 2: EventBus Integration (2-3 horas)
**Objetivo:** Integrar EventBus para reactividad automática

#### Paso 2.1: Definir eventos
- [ ] Crear `src/modules/achievements/events.ts` con tipos de eventos
- [ ] Documentar qué eventos escucha achievements
- [ ] Documentar qué eventos emite achievements

#### Paso 2.2: Implementar listeners
- [ ] En `manifest.tsx` setup(), agregar listeners para:
  - `products.created/updated/deleted`
  - `sales.order_completed`
  - `staff.member_added`
  - `settings.updated`
- [ ] Invalidar TanStack Query cache correspondiente

#### Paso 2.3: Achievement completion detection
- [ ] Crear `src/modules/achievements/services/achievementDetector.ts`
- [ ] Implementar lógica para detectar cuando se completa un achievement
- [ ] Integrar con sistema de notificaciones

### Fase 3: Refactor Widget y ValidationContext (3-4 horas)
**Objetivo:** Eliminar anti-patterns, usar TanStack Query correctamente

#### Paso 3.1: Crear hook especializado
- [ ] Crear `src/modules/achievements/hooks/useCapabilitiesProgress.ts`
- [ ] Usar TanStack Query para data reactiva
- [ ] Computar progress on-demand

#### Paso 3.2: Refactor ValidationContext
- [ ] Eliminar accesos a stores obsoletos (`products`, `sales`)
- [ ] Usar TanStack Query hooks directamente
- [ ] Optimizar para evitar infinite loops

#### Paso 3.3: Refactor AchievementsWidget
- [ ] Eliminar dynamic imports anidados
- [ ] Usar `useCapabilitiesProgress()` hook
- [ ] Implementar loading/error states
- [ ] Verificar que sea totalmente reactivo

### Fase 4: Notificaciones (1-2 horas)
**Objetivo:** Notificar al usuario cuando completa achievements

#### Paso 4.1: Integrar con notify system
- [ ] Identificar el nivel correcto de notificación (toast/banner/push)
- [ ] Implementar notificación cuando achievement se completa
- [ ] Agregar sonido/animación (opcional)

#### Paso 4.2: Achievement history
- [ ] Mostrar achievements recientes en widget
- [ ] Link a página completa de achievements

### Fase 5: Testing y Validación (2 horas)
**Objetivo:** Verificar que todo funciona correctamente

#### Paso 5.1: Tests unitarios
- [ ] Tests para `useCapabilitiesProgress`
- [ ] Tests para achievement detection
- [ ] Tests para EventBus integration

#### Paso 5.2: Tests de integración
- [ ] Crear producto → verificar progress update
- [ ] Completar venta → verificar achievement notification
- [ ] Navegar a dashboard → verificar widget actualizado

#### Paso 5.3: Performance
- [ ] Verificar que no hay re-renders excesivos
- [ ] Verificar que EventBus no causa memory leaks
- [ ] Verificar que TanStack Query cache funciona correctamente

---

## 🎯 RESULTADO ESPERADO

### Después del Refactor:

✅ **Widget Reactivo**
```typescript
// ✅ Código limpio y reactivo
function AchievementsWidget() {
  const { activeCapabilities } = useCapabilities();
  const { data: progress, isLoading } = useCapabilitiesProgress(activeCapabilities);
  
  if (isLoading) return <Skeleton />;
  
  const allOperational = progress.every(p => p.isOperational);
  
  return allOperational 
    ? <CompactView progress={progress} />
    : <ProminentView progress={progress} />;
}
```

✅ **EventBus Integration**
```typescript
// Los datos se actualizan automáticamente cuando:
// - Se crea un producto
// - Se completa una venta
// - Se actualiza configuración
// etc.
```

✅ **Notificaciones**
```typescript
// Usuario ve notificación cuando completa achievement
notify.success({
  title: "¡Achievement desbloqueado!",
  description: "Has configurado tu primer método de pago"
});
```

✅ **Separación Clara**
```
achievements/
  ├── hooks/
  │   └── useCapabilitiesProgress.ts  ← Compute progress
  ├── requirements/
  │   └── index.ts                     ← Static requirements
  ├── services/
  │   └── achievementDetector.ts      ← Detect completions
  └── events.ts                        ← Event types

store/
  ├── achievementsUIStore.ts          ← UI state only
  └── gamificationStore.ts            ← Future use
```

---

## ⚠️ RIESGOS Y MITIGACIONES

### Riesgo 1: Breaking Changes
**Mitigación:** Refactor incremental, mantener compatibilidad durante migración

### Riesgo 2: Performance
**Mitigación:** Usar TanStack Query staleTime/gcTime apropiados, medir antes/después

### Riesgo 3: EventBus Overhead
**Mitigación:** Solo invalidar queries necesarias, no emitir eventos innecesarios

---

## 📝 PRÓXIMOS PASOS

**Antes de empezar:**
1. ✅ Revisión y aprobación de este documento
2. ❓ Decisión sobre niveles de notificaciones a usar
3. ❓ Confirmar eventos del EventBus a escuchar

**Comenzar con:**
- Fase 1: Separación y limpieza (más seguro, menos impacto)

---

**¿Aprobado para proceder?**
