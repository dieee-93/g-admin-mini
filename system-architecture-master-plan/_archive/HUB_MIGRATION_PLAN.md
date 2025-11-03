# 🔄 PLAN DE MIGRACIÓN - Eliminación de Operations Hub

**Fecha de creación**: 2025-01-14
**Objetivo**: Eliminar Operations Hub y redistribuir features por función
**Impacto estimado**: -700 lines de código, mejora arquitectónica significativa

---

## 📋 RESUMEN EJECUTIVO

### Problema
Operations Hub es un módulo-contenedor con:
- Solo 25% de funcionalidad real (Tables)
- 75% mock/placeholders (Planning, Monitoring)
- Nested tabs que causan sobrecarga cognitiva
- Código orphan (KDS 526 lines) y duplicado (TableFloorPlan)

### Solución
Eliminar Hub y crear módulos funcionales:
1. **Floor Management** → Tables migrado sin nested tabs
2. **Kitchen Display** → KDS orphan reconectado + activar link module
3. **Eliminar mock code** → Planning y Monitoring
4. **Eliminar duplicados** → TableFloorPlan en Sales

---

## 🗺️ DESTINOS FINALES

### Features a MIGRAR (código útil)

#### 1. Tables Management (452 lines)
**Origen**: `src/pages/admin/operations/hub/tables.tsx`
**Destino**: `src/pages/admin/operations/floor/`
**Razón**: Funcionalidad completa y empresarial, merece módulo propio

**Cambios**:
- Eliminar nested tabs (Floor Plan, Reservations, Analytics)
- Convertir a secciones integradas en página única
- Mantener 100% de lógica de negocio (Supabase, real-time, stats)

#### 2. Kitchen Config (299 lines)
**Origen**: `src/pages/admin/operations/hub/components/kitchen/Kitchen.tsx`
**Destino**: `src/pages/admin/operations/kitchen/components/KitchenConfigDrawer.tsx`
**Razón**: Config útil pero debe ser drawer/modal, no tab principal

**Cambios**:
- Extraer config de modos (online-first, offline-first, auto, emergency)
- Convertir en drawer accesible desde Kitchen Display
- Mantener integración con EventBus y OfflineStatus

#### 3. KitchenDisplaySystem (526 lines - ORPHAN)
**Origen**: `src/pages/admin/operations/sales/components/OrderManagement/KitchenDisplaySystem.tsx`
**Destino**: `src/pages/admin/operations/kitchen/components/KitchenDisplay.tsx`
**Razón**: Código enterprise-grade no usado, debe reconectarse

**Cambios**:
- Mover de Sales a Kitchen module
- Activar link module (`modules/kitchen/manifest.tsx`)
- Conectar con EventBus (`sales.order_placed` → `kitchen.display.orders`)

---

### Features a ELIMINAR (mock/placeholders)

#### 4. Planning Component (129 lines)
**Origen**: `src/pages/admin/operations/hub/components/Planning/Planning.tsx`
**Razón**: Mock data hardcodeado, 0% funcional, confunde production con operations

**Acción**:
```bash
rm -rf src/pages/admin/operations/hub/components/Planning/
```

**Documentar**: Crear `docs/roadmap/PRODUCTION_PLANNING.md` si se planea implementar

#### 5. Monitoring Component (141 lines)
**Origen**: `src/pages/admin/operations/hub/components/Monitoring/Monitoring.tsx`
**Razón**: Mock data, no calcula métricas reales

**Acción**:
```bash
rm -rf src/pages/admin/operations/hub/components/Monitoring/
```

**Futuro**: Cuando se implemente → Dashboard widget, NO módulo

#### 6. TableFloorPlan en Sales (100 lines - DUPLICADO)
**Origen**: `src/pages/admin/operations/sales/components/TableManagement/TableFloorPlan.tsx`
**Razón**: Versión básica del component completo en Hub

**Acción**:
```bash
rm -rf src/pages/admin/operations/sales/components/TableManagement/TableFloorPlan.tsx
```

**Reemplazo**: Sales debe usar Floor module completo via import

---

## 📝 PLAN DE MIGRACIÓN PASO A PASO

### FASE 1: PREPARACIÓN (Sin impacto en producción)

**1.1 Crear nuevos módulos vacíos**
```bash
# Floor Management Module
mkdir -p src/pages/admin/operations/floor/components
touch src/pages/admin/operations/floor/page.tsx
touch src/pages/admin/operations/floor/README.md

# Kitchen Module (activar link module existente)
mkdir -p src/pages/admin/operations/kitchen/components
touch src/pages/admin/operations/kitchen/page.tsx
touch src/pages/admin/operations/kitchen/README.md
```

**1.2 Crear manifests para nuevos módulos**
```bash
touch src/modules/floor/manifest.tsx
# kitchen/manifest.tsx ya existe (447 lines), solo actualizar
```

**1.3 Backup de código crítico**
```bash
# Copiar antes de modificar
cp src/pages/admin/operations/hub/tables.tsx BACKUP_tables.tsx
cp src/pages/admin/operations/sales/components/OrderManagement/KitchenDisplaySystem.tsx BACKUP_kds.tsx
```

---

### FASE 2: MIGRACIÓN DE TABLES → FLOOR MODULE

**2.1 Crear Floor Module base**

**Archivo**: `src/pages/admin/operations/floor/page.tsx`

```tsx
import { ContentLayout, Section } from '@/shared/ui'
import { FloorPlanView } from './components/FloorPlanView'
import { FloorStats } from './components/FloorStats'
import { ReservationsList } from './components/ReservationsList'

export default function FloorManagementPage() {
  return (
    <ContentLayout spacing="normal">
      {/* Stats Section - NO tab, section integrada */}
      <Section variant="flat" title="Floor Overview">
        <FloorStats />
      </Section>

      {/* Floor Plan Section - Core functionality */}
      <Section variant="elevated" title="Floor Plan">
        <FloorPlanView />
      </Section>

      {/* Reservations - Sección, NO tab anidado */}
      <Section variant="default" title="Upcoming Reservations">
        <ReservationsList />
        {/* TODO: Implementar cuando sea necesario */}
      </Section>

      {/* Analytics se puede agregar como sección adicional */}
      {/* Sin crear nested tabs */}
    </ContentLayout>
  )
}
```

**Ventajas**:
- ✅ NO nested tabs (todo en una página scrolleable)
- ✅ Stats visible sin click adicional
- ✅ Floor Plan es el foco principal
- ✅ Reservations accesible sin navegación extra

**2.2 Migrar código de tables.tsx**

```bash
# Copiar componente completo
cp src/pages/admin/operations/hub/tables.tsx \
   src/pages/admin/operations/floor/components/FloorPlanView.tsx
```

**2.3 Refactorizar para eliminar nested tabs**

Extraer lógica de `tables.tsx` en componentes modulares:

**FloorPlanView.tsx** (core):
- Grid de mesas con statuses (available, occupied, reserved, etc.)
- Real-time updates con Supabase subscriptions
- Click handlers para selección de mesa
- Party tracking

**FloorStats.tsx**:
```tsx
// Stats bar - métricas principales
- Tables Available: X/Y
- Occupied: X%
- Daily Revenue: $X
- Avg Wait Time: X min
- Turn Count: X
```

**TableDetail.tsx**:
- Drawer/Modal con info completa de party
- Customer details
- Time seated
- Amount spent
- Actions (mark ready for bill, etc.)

**ReservationsList.tsx**:
- Lista de reservas upcoming
- Placeholder por ahora (Coming Soon)
- Cuando se implemente: filtros por fecha, estado, etc.

**2.4 Actualizar imports en Sales**

Cambiar de TableFloorPlan básico a Floor module:

**Antes** (Sales usa duplicado básico):
```tsx
// SalesPage.tsx
import { TableFloorPlan } from './components/TableManagement/TableFloorPlan'

<TableFloorPlan />
```

**Después** (Sales usa Floor module completo):
```tsx
// SalesPage.tsx
import { FloorPlanQuickView } from '@/pages/admin/operations/floor/components/QuickView'

<FloorPlanQuickView onTableSelect={handleTableSelect} />
```

**QuickView.tsx** = versión simplificada del FloorPlanView para embedding

**2.5 Eliminar duplicado en Sales**

```bash
rm -rf src/pages/admin/operations/sales/components/TableManagement/TableFloorPlan.tsx
rm -rf src/pages/admin/operations/sales/components/TableManagement/ # si está vacío
```

---

### FASE 3: MIGRACIÓN DE KDS → KITCHEN MODULE

**3.1 Mover KitchenDisplaySystem de Sales a Kitchen**

```bash
mv src/pages/admin/operations/sales/components/OrderManagement/KitchenDisplaySystem.tsx \
   src/pages/admin/operations/kitchen/components/KitchenDisplay.tsx
```

**3.2 Crear Kitchen Module page**

**Archivo**: `src/pages/admin/operations/kitchen/page.tsx`

```tsx
import { ContentLayout, Section, Stack, Button, Drawer } from '@/shared/ui'
import { KitchenDisplay } from './components/KitchenDisplay'
import { KitchenStats } from './components/KitchenStats'
import { KitchenConfigDrawer } from './components/KitchenConfigDrawer'
import { CogIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export default function KitchenPage() {
  const [configOpen, setConfigOpen] = useState(false)

  return (
    <>
      <ContentLayout spacing="normal">
        {/* Stats + Config button */}
        <Section variant="flat" title="Kitchen Display System">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <KitchenStats />
            <Button
              variant="outline"
              onClick={() => setConfigOpen(true)}
              leftIcon={<CogIcon className="w-5 h-5" />}
            >
              Configuration
            </Button>
          </Stack>
        </Section>

        {/* KDS - Active Orders */}
        <Section variant="elevated" title="Active Orders">
          <KitchenDisplay />
        </Section>
      </ContentLayout>

      {/* Config Drawer - NO es tab, es drawer */}
      <KitchenConfigDrawer
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
      />
    </>
  )
}
```

**Ventajas**:
- ✅ KDS es el foco principal
- ✅ Config accesible pero no es tab
- ✅ Stats visible arriba
- ✅ Sin nested tabs

**3.3 Migrar Kitchen Config como Drawer**

Extraer config de `hub/components/kitchen/Kitchen.tsx` → `KitchenConfigDrawer.tsx`:

**KitchenConfigDrawer.tsx**:
```tsx
import { Drawer, Stack, Select, Switch, Alert } from '@/shared/ui'
import { useKitchenConfig } from './hooks/useKitchenConfig'
import { useOfflineStatus } from '@/lib/offline'

export function KitchenConfigDrawer({ isOpen, onClose }) {
  const { config, updateConfig } = useKitchenConfig()
  const { isOnline, connectionQuality } = useOfflineStatus()

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Kitchen Configuration">
      <Stack gap={4}>
        {/* Mode Selection */}
        <Select
          label="Operation Mode"
          value={config.mode}
          onChange={(e) => updateConfig({ mode: e.target.value })}
        >
          <option value="online-first">Online First</option>
          <option value="offline-first">Offline First</option>
          <option value="auto">Auto (Adaptive)</option>
          <option value="offline-only">Offline Only</option>
        </Select>

        {/* Emergency Mode Toggle */}
        <Switch
          label="Emergency Mode"
          checked={config.emergencyMode}
          onChange={(e) => updateConfig({ emergencyMode: e.target.checked })}
        />

        {/* Connection Status */}
        <Alert status={isOnline ? 'success' : 'warning'}>
          Status: {isOnline ? 'Online' : 'Offline'}
          {isOnline && ` (${connectionQuality})`}
        </Alert>

        {/* Effective Mode Display */}
        <Text>
          Effective Mode: <Badge>{effectiveMode}</Badge>
        </Text>
      </Stack>
    </Drawer>
  )
}
```

**Mantener**:
- ✅ Offline/Online mode selection
- ✅ Connection quality monitoring
- ✅ Emergency mode toggle
- ✅ EventBus integration
- ✅ Supabase config persistence

**3.4 Actualizar kitchen manifest**

**Archivo**: `src/modules/kitchen/manifest.tsx`

```tsx
import type { ModuleManifest } from '@/lib/modules/types'

export const kitchenManifest: ModuleManifest = {
  id: 'kitchen',
  name: 'Kitchen Display System',
  version: '1.0.0',

  // Link module - auto-instala cuando sales + materials activos
  depends: ['sales', 'materials'],
  autoInstall: true,
  category: 'integration',

  requiredFeatures: ['production_kitchen_display'],
  optionalFeatures: ['production_order_queue'],

  hooks: {
    provide: [
      'kitchen.order_ready',
      'kitchen.display.orders',
      'kitchen.ingredient.check'
    ],
    consume: [
      'sales.order_placed',
      'materials.stock_updated'
    ]
  },

  setup: (registry) => {
    // Listen to order placed events
    registry.addAction('sales.order_placed', (order) => {
      // Send to kitchen display
      emit('kitchen.display.orders', {
        orderId: order.id,
        items: order.items,
        priority: order.priority || 'NORMAL',
        station: determineStation(order.items)
      })
    }, 'kitchen', 100)

    // Listen to stock updates
    registry.addAction('materials.stock_updated', (material) => {
      // Check if affects active orders
      emit('kitchen.ingredient.check', {
        materialId: material.id,
        available: material.quantity > 0
      })
    }, 'kitchen', 80)

    // Provide order ready hook
    registry.addFilter('operations.order_ready', (data) => {
      // Kitchen processed order
      return {
        ...data,
        kitchenCompletedAt: new Date().toISOString(),
        prepTime: calculatePrepTime(data.orderId)
      }
    }, 'kitchen', 100)
  },

  teardown: (registry) => {
    registry.removeAction('sales.order_placed', 'kitchen')
    registry.removeAction('materials.stock_updated', 'kitchen')
    registry.removeFilter('operations.order_ready', 'kitchen')
  }
}
```

**Ventajas de link module**:
- ✅ Auto-activa cuando Sales + Materials están activos
- ✅ Integra features cross-module sin acoplamiento
- ✅ Sigue patrón Odoo (integration modules)

---

### FASE 4: ELIMINAR MOCK CODE

**4.1 Eliminar Planning component**

```bash
rm -rf src/pages/admin/operations/hub/components/Planning/
```

**4.2 Eliminar Monitoring component**

```bash
rm -rf src/pages/admin/operations/hub/components/Monitoring/
```

**4.3 Documentar TODOs para futuro**

Si se planea implementar en el futuro:

**docs/roadmap/PRODUCTION_PLANNING.md**:
```markdown
# Production Planning Module - Future Implementation

## Overview
Módulo para planificación de producción basado en demanda forecasting.

## Features
- [ ] Production schedule (daily, weekly)
- [ ] Ingredient requirements calculation
- [ ] Capacity planning
- [ ] Integration with Products/Recipes

## Dependencies
- Products module (recipes)
- Materials module (stock levels)
- Predictive analytics (forecasting)

## Implementation Priority
- **Priority**: Medium
- **Estimated Effort**: 3-4 weeks
- **Blocking**: None (independent module)

## Notes
Previously existed as mock in Operations Hub → Planning tab.
Should be implemented as standalone module when needed.
```

**docs/roadmap/OPERATIONS_MONITORING.md**:
```markdown
# Operations Monitoring - Future Implementation

## Overview
Real-time monitoring dashboard for operational metrics.

## Features
- [ ] Prep time tracking (average, by station)
- [ ] Order completion rate
- [ ] Table turnover metrics
- [ ] Customer satisfaction tracking
- [ ] Alert system (wait times, delays)

## Dependencies
- Kitchen module (prep time)
- Floor module (table metrics)
- Sales module (order data)
- EventBus (real-time events)

## Implementation Priority
- **Priority**: Low (Dashboard widgets sufficient initially)
- **Estimated Effort**: 2-3 weeks
- **Blocking**: Kitchen + Floor modules must be complete

## Notes
Previously existed as mock in Operations Hub → Monitoring tab.
Should be implemented as Dashboard widgets, NOT standalone module.
```

---

### FASE 5: ACTUALIZAR ROUTING

**5.1 Agregar rutas nuevas en App.tsx**

**Ubicación**: `src/App.tsx` línea ~298 (después de `/admin/sales`)

```tsx
{/* 🏢 ADMIN - OPERATIONS - Floor Management */}
<Route path="/admin/operations/floor" element={
  <ProtectedRouteNew>
    <RoleGuard requiredModule="operations">
      <ResponsiveLayout>
        <LazyWithErrorBoundary moduleName="Floor Management">
          <LazyFloorPage />
        </LazyWithErrorBoundary>
      </ResponsiveLayout>
    </RoleGuard>
  </ProtectedRouteNew>
} />

{/* 🔥 ADMIN - OPERATIONS - Kitchen Display */}
<Route path="/admin/operations/kitchen" element={
  <ProtectedRouteNew>
    <RoleGuard requiredModule="operations">
      <ResponsiveLayout>
        <LazyWithErrorBoundary moduleName="Kitchen Display">
          <LazyKitchenPage />
        </LazyWithErrorBoundary>
      </ResponsiveLayout>
    </RoleGuard>
  </ProtectedRouteNew>
} />
```

**5.2 Eliminar ruta de Hub**

**Buscar y eliminar** (línea ~298):
```tsx
- <Route path="/admin/operations" element={
-   <ProtectedRouteNew>
-     <RoleGuard requiredModule="operations">
-       <ResponsiveLayout>
-         <LazyWithErrorBoundary moduleName="Operaciones">
-           <LazyOperationsPage />
-         </LazyWithErrorBoundary>
-       </ResponsiveLayout>
-     </RoleGuard>
-   </ProtectedRouteNew>
- } />
```

**Opcional - Redirect para bookmarks**:
```tsx
{/* Redirect old hub route */}
<Route
  path="/admin/operations"
  element={<Navigate to="/admin/operations/floor" replace />}
/>
```

**5.3 Actualizar LazyModules.ts**

**Ubicación**: `src/lib/lazy/LazyModules.ts` línea ~31

**Agregar**:
```tsx
// Lazy-loaded Floor Management Page (pages/admin/operations/floor/page.tsx)
export const LazyFloorPage = createLazyComponent(
  () => import('../../pages/admin/operations/floor/page'),
  'floor',
  {
    chunkName: 'floor-module',
    preload: false,
    priority: 'high', // High-priority for restaurant operations
    cacheStrategy: 'both'
  }
);

// Lazy-loaded Kitchen Display Page (pages/admin/operations/kitchen/page.tsx)
export const LazyKitchenPage = createLazyComponent(
  () => import('../../pages/admin/operations/kitchen/page'),
  'kitchen',
  {
    chunkName: 'kitchen-module',
    preload: false,
    priority: 'high', // Critical for kitchen operations
    cacheStrategy: 'both'
  }
);
```

**Eliminar**:
```tsx
- // Lazy-loaded Operations Page (pages/admin/operations/hub/page.tsx)
- export const LazyOperationsPage = createLazyComponent(
-   () => import('../../pages/admin/operations/hub/page'),
-   'operations',
-   {
-     chunkName: 'operations-module',
-     preload: false,
-     priority: 'high',
-     cacheStrategy: 'both'
-   }
- );
```

---

### FASE 6: ACTUALIZAR NAVEGACIÓN

**6.1 Editar Sidebar navigation items**

**Ubicación**: `src/shared/navigation/Sidebar.tsx` o `src/contexts/NavigationContext.tsx`

**Buscar sección Operations** y actualizar:

**ANTES**:
```tsx
{
  label: 'Operations Hub',
  path: '/admin/operations',
  icon: ChartBarIcon,
  requiredModule: 'operations'
}
```

**DESPUÉS**:
```tsx
{
  label: 'Operations',
  icon: ChartBarIcon,
  requiredModule: 'operations',
  children: [
    {
      label: 'Floor Management',
      path: '/admin/operations/floor',
      icon: BuildingStorefrontIcon,
      description: 'Table management and floor plan'
    },
    {
      label: 'Kitchen Display',
      path: '/admin/operations/kitchen',
      icon: FireIcon,
      description: 'Kitchen orders and display system'
    },
    {
      label: 'Sales POS',
      path: '/admin/sales',
      icon: ShoppingCartIcon,
      description: 'Point of Sale system'
    }
  ]
}
```

**Iconos sugeridos**:
- Floor: `BuildingStorefrontIcon` o `HomeModernIcon`
- Kitchen: `FireIcon` o `BeakerIcon`
- Sales: `ShoppingCartIcon`

**6.2 Actualizar FeatureRegistry**

**Ubicación**: `src/config/FeatureRegistry.ts`

**Eliminar features obsoletas**:
```tsx
- 'operations_hub_planning': { ... }
- 'operations_hub_monitoring': { ... }
```

**Agregar features nuevas**:
```tsx
'operations_floor_management': {
  id: 'operations_floor_management',
  name: 'Floor Management',
  description: 'Table management, floor plan, and reservations',
  category: 'operations',
  requiredCapabilities: ['onsite_service'],
  dependencies: []
},

'operations_kitchen_display': {
  id: 'operations_kitchen_display',
  name: 'Kitchen Display System',
  description: 'Kitchen order display and queue management',
  category: 'operations',
  requiredCapabilities: ['requires_preparation'],
  dependencies: ['sales_pos', 'materials_inventory']
},
```

**6.3 Actualizar ModuleRegistry**

Si existe entrada en `src/modules/index.ts`:

**Eliminar**:
```tsx
- export { operationsHubManifest } from './operations-hub/manifest'
```

**Agregar**:
```tsx
export { floorManifest } from './floor/manifest'
// kitchen manifest ya existe
```

---

### FASE 7: LIMPIEZA FINAL

**7.1 Eliminar carpeta hub completa**

```bash
# Verificar que no hay imports activos
grep -r "operations/hub" src/

# Si está limpio, eliminar
rm -rf src/pages/admin/operations/hub/
```

**7.2 Eliminar module manifest de operations-hub**

```bash
# Verificar existencia
ls src/modules/operations-hub/

# Eliminar si existe
rm -rf src/modules/operations-hub/
```

**7.3 Limpiar imports muertos**

```bash
# Buscar referencias a hub en todo el proyecto
grep -r "operations/hub" src/
grep -r "LazyOperationsPage" src/
grep -r "operations_hub" src/

# Revisar cada match y eliminar imports no usados
```

**Archivos comunes a revisar**:
- `src/App.tsx` ✅ (ya limpiado en Fase 5)
- `src/lib/lazy/LazyModules.ts` ✅ (ya limpiado en Fase 5)
- `src/shared/navigation/Sidebar.tsx` ✅ (ya limpiado en Fase 6)
- `src/config/FeatureRegistry.ts` ✅ (ya limpiado en Fase 6)

**7.4 Actualizar documentación**

```bash
# Eliminar README de hub
rm -f src/pages/admin/operations/hub/README.md

# Crear READMEs nuevos
cat > src/pages/admin/operations/floor/README.md << 'EOF'
# Floor Management Module

## Overview
Comprehensive floor management for restaurant operations including table tracking, reservations, and floor plan visualization.

## Features
- ✅ Real-time table status tracking
- ✅ Floor plan grid visualization
- ✅ Party management (size, customer, seated time, spent)
- ✅ Revenue and turnover metrics
- ✅ Wait time estimation
- 🚧 Reservations (placeholder)
- 🚧 Analytics (placeholder)

## Dependencies
- Supabase: `tables`, `parties` tables
- Real-time subscriptions for live updates
- RPC: `pos_estimate_next_table_available`

## Usage
Navigate to `/admin/operations/floor` to access floor management.

## Integration
- Sales POS can quick-view floor plan via `FloorPlanQuickView` component
- Real-time updates broadcast via Supabase channels

## Technical Details
- 452 lines core logic (migrated from Operations Hub)
- Real-time subscriptions with 30s auto-refresh
- Decimal.js for financial precision
- Table statuses: available, occupied, reserved, cleaning, ready_for_bill, maintenance
- Priority levels: normal, vip, urgent, attention_needed
EOF

cat > src/pages/admin/operations/kitchen/README.md << 'EOF'
# Kitchen Display System Module

## Overview
Enterprise-grade Kitchen Display System (KDS) for managing kitchen orders, stations, and preparation workflow.

## Features
- ✅ 6 kitchen stations (grill, fryer, salad, dessert, drinks, expedite)
- ✅ Priority management (VIP, RUSH, NORMAL)
- ✅ Item status workflow (PENDING → IN_PROGRESS → READY → SERVED)
- ✅ Order timing & progress tracking
- ✅ Station filtering & sorting
- ✅ Special instructions & allergy warnings
- ✅ Modifications tracking
- ✅ Offline/Online mode configuration

## Dependencies
- EventBus: `sales.order_placed`, `materials.stock_updated`
- Link module: Auto-activates when Sales + Materials are active
- Supabase: Kitchen config persistence

## Usage
Navigate to `/admin/operations/kitchen` to access KDS.

## Integration
- **Link Module Pattern**: Auto-installs when dependencies active (Odoo pattern)
- **EventBus**: Listens to `sales.order_placed` → displays in kitchen
- **Materials**: Checks ingredient availability via `materials.stock_updated`

## Technical Details
- 526 lines core logic (migrated from Sales orphan)
- Config drawer for mode selection (not tab)
- Real-time order updates via EventBus
- Station-based workflow management

## Configuration
Access config drawer via button in page header:
- Operation modes: online-first, offline-first, auto, offline-only
- Emergency mode toggle
- Connection quality monitoring
EOF
```

---

### FASE 8: TESTING & VALIDACIÓN

**8.1 Tests de compilación**

```bash
# TypeScript type checking
pnpm -s exec tsc --noEmit

# ESLint validation (0 warnings required)
pnpm lint

# Si hay errores, corregir antes de continuar
```

**Errores comunes esperados**:
- Missing imports (actualizar paths después de migración)
- Type mismatches (verificar props de componentes migrados)
- Unused imports (limpiar con `pnpm lint:fix`)

**8.2 Tests funcionales manuales**

Checklist de funcionalidad:

**Floor Management** (`/admin/operations/floor`):
- [ ] Página carga sin errores
- [ ] Tables grid muestra datos de Supabase
- [ ] Table statuses actualizan (available, occupied, etc.)
- [ ] Stats bar muestra métricas correctas (revenue, wait time, etc.)
- [ ] Real-time updates funcionan (cambiar status en DB → refleja en UI)
- [ ] Click en mesa muestra TableDetail drawer/modal
- [ ] No hay nested tabs (todo en una página)
- [ ] Reservations placeholder visible (Coming Soon)

**Kitchen Display** (`/admin/operations/kitchen`):
- [ ] Página carga sin errores
- [ ] KDS muestra órdenes activas (si hay)
- [ ] Stations filtran correctamente (grill, fryer, etc.)
- [ ] Priority levels funcionan (VIP, RUSH, NORMAL)
- [ ] Config drawer abre con botón
- [ ] Mode selection guarda en Supabase
- [ ] EventBus integration funciona (`sales.order_placed` → display)
- [ ] Connection status actualiza (online/offline)

**Sales POS** (`/admin/sales`):
- [ ] TableFloorPlan eliminado (no debe existir)
- [ ] Si usa Floor module → FloorPlanQuickView funciona
- [ ] No hay console errors de imports rotos

**8.3 Tests de navegación**

Checklist de navegación:

**Sidebar**:
- [ ] Operations section muestra children (Floor, Kitchen, Sales)
- [ ] Iconos correctos para cada item
- [ ] Links funcionan al hacer click
- [ ] Active state correcto en cada página

**Routing**:
- [ ] `/admin/operations/floor` carga Floor Management
- [ ] `/admin/operations/kitchen` carga Kitchen Display
- [ ] `/admin/operations` (hub old route) redirige o 404 (según implementación)
- [ ] No hay rutas rotas (verificar con React Router DevTools)

**Breadcrumbs** (si existen):
- [ ] Floor: `Admin / Operations / Floor Management`
- [ ] Kitchen: `Admin / Operations / Kitchen Display`

**8.4 Tests de integración**

**EventBus**:
```bash
# En DevTools console
eventBus.emit('sales.order_placed', {
  id: 'test-123',
  items: [{ name: 'Test Item', station: 'grill' }],
  priority: 'RUSH'
})

# Verificar que Kitchen Display recibe el evento
```

**Supabase Real-time**:
```sql
-- En Supabase SQL Editor
UPDATE tables SET status = 'occupied' WHERE id = 1;

-- Verificar que Floor Management actualiza en tiempo real
```

**8.5 Tests de performance**

```bash
# Bundle size check
pnpm build

# Verificar chunks generados
ls -lh dist/assets/

# Floor module chunk debe ser ~50-100kb
# Kitchen module chunk debe ser ~60-120kb
# No debe haber chunks huérfanos de hub
```

**8.6 Smoke test en dev**

```bash
# Iniciar dev server
pnpm dev

# Abrir browser en http://localhost:5173
# Navegar manualmente a:
- /admin/operations/floor
- /admin/operations/kitchen
- /admin/sales

# Verificar:
- No hay console errors
- No hay warnings de React
- No hay network errors (404s)
- Pages renderizan correctamente
```

**8.7 Checklist final**

Antes de commit:
- [ ] `pnpm -s exec tsc --noEmit` pasa
- [ ] `pnpm lint` pasa (0 warnings)
- [ ] Tests manuales completos (8.2)
- [ ] Navegación funciona (8.3)
- [ ] EventBus integration funciona (8.4)
- [ ] Bundle size razonable (8.5)
- [ ] Smoke test exitoso (8.6)
- [ ] No hay console errors en browser
- [ ] Git status limpio (no archivos temporales)

---

## 📊 IMPACTO DE LA MIGRACIÓN

### Archivos Creados (~12 archivos nuevos)

**Módulo Floor** (6 archivos):
```
src/pages/admin/operations/floor/
├── page.tsx                          # 80 lines - Main page
├── README.md                         # 40 lines - Documentation
└── components/
    ├── FloorPlanView.tsx            # 200 lines - Grid + logic (de tables.tsx)
    ├── FloorStats.tsx               # 80 lines - Stats bar
    ├── TableDetail.tsx              # 100 lines - Party info drawer
    ├── ReservationsList.tsx         # 50 lines - Placeholder
    └── QuickView.tsx                # 60 lines - Para embedding en Sales
```

**Módulo Kitchen** (4 archivos):
```
src/pages/admin/operations/kitchen/
├── page.tsx                          # 90 lines - Main page
├── README.md                         # 45 lines - Documentation
└── components/
    ├── KitchenDisplay.tsx           # 526 lines - Migrado de Sales
    ├── KitchenStats.tsx             # 60 lines - Stats bar
    └── KitchenConfigDrawer.tsx      # 150 lines - Config migrado de Hub
```

**Module Manifests** (1 archivo):
```
src/modules/floor/manifest.tsx        # 80 lines - Module definition
# kitchen/manifest.tsx ya existe (447 lines) - solo update setup()
```

**Lazy Definitions** (modificación):
```
src/lib/lazy/LazyModules.ts          # +30 lines - LazyFloorPage, LazyKitchenPage
```

**Total líneas nuevas**: ~1,591 lines

---

### Archivos Modificados (~6 archivos)

**Routing**:
```
src/App.tsx                           # +40 lines (nuevas rutas), -15 lines (hub route)
```

**Lazy Loading**:
```
src/lib/lazy/LazyModules.ts          # +30 lines (nuevas), -15 lines (LazyOperationsPage)
```

**Navigation**:
```
src/shared/navigation/Sidebar.tsx    # +20 lines (children), -5 lines (hub item)
# o NavigationContext.tsx
```

**Features**:
```
src/config/FeatureRegistry.ts        # +30 lines (floor, kitchen), -20 lines (hub features)
```

**Module Registry**:
```
src/modules/index.ts                  # +1 line (floor export), -1 line (hub export)
src/modules/kitchen/manifest.tsx     # +50 lines (setup hooks)
```

**Total modificaciones**: ~155 lines added, ~56 lines removed

---

### Archivos Eliminados (~20 archivos)

**Hub completo**:
```
src/pages/admin/operations/hub/
├── page.tsx                                    # -80 lines
├── README.md                                   # -120 lines
├── tables.tsx                                  # -452 lines (migrado a Floor)
└── components/
    ├── Planning/
    │   └── Planning.tsx                        # -129 lines (eliminado)
    ├── kitchen/
    │   └── Kitchen.tsx                         # -299 lines (migrado a KitchenConfigDrawer)
    ├── Tables/
    │   └── Tables.tsx                          # -7 lines (wrapper)
    └── Monitoring/
        └── Monitoring.tsx                      # -141 lines (eliminado)
```

**Duplicados en Sales**:
```
src/pages/admin/operations/sales/components/
├── TableManagement/
│   └── TableFloorPlan.tsx                      # -100 lines (eliminado)
└── OrderManagement/
    └── KitchenDisplaySystem.tsx                # -526 lines (migrado a Kitchen)
```

**Manifests obsoletos**:
```
src/modules/operations-hub/
└── manifest.tsx                                 # -150 lines (eliminado)
```

**Lazy definitions obsoletos**:
```
src/lib/lazy/LazyModules.ts                     # -15 lines (LazyOperationsPage)
```

**Total líneas eliminadas**: ~2,004 lines

---

### Balance Final de Código

| Métrica | Valor |
|---------|-------|
| **Líneas creadas** | +1,591 |
| **Líneas modificadas** | +155 / -56 |
| **Líneas eliminadas** | -2,004 |
| **Balance neto** | **-413 lines** |

**Simplificación**:
- ✅ -413 lines de código total
- ✅ Eliminado mock code (270 lines de Planning + Monitoring)
- ✅ Eliminado duplicados (100 lines de TableFloorPlan)
- ✅ Reconectado orphan code (526 lines de KDS ahora en uso)
- ✅ Código más modular y mantenible

---

### Estructura Final de Operations Domain

**ANTES** (confuso):
```
/admin/operations/
├── hub/                    # 1,080 lines - 75% mock/wrappers
│   ├── Planning (mock)
│   ├── Kitchen (config only)
│   ├── Tables (nested tabs)
│   └── Monitoring (mock)
├── sales/                  # Tenía KDS orphan (526 lines)
└── [otros módulos]
```

**DESPUÉS** (claro):
```
/admin/operations/
├── floor/                  # ~570 lines - 100% funcional
│   └── Floor Plan + Stats + Reservations (secciones integradas)
│
├── kitchen/                # ~826 lines - 100% funcional
│   └── KDS + Queue + Config drawer
│
├── sales/                  # Sin duplicados
│   └── POS (usa Floor via QuickView)
│
└── [otros módulos]
```

---

## ⚠️ RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Links rotos en navegación** | Alta | Alto | Fase 8: Testing exhaustivo de rutas + redirect optional |
| **Imports muertos causan errors** | Media | Alto | `tsc --noEmit` + `pnpm lint` antes de commit |
| **Supabase queries rotas** | Baja | Alto | Mantener exact SQL queries al migrar, no modificar |
| **Real-time subscriptions fallan** | Baja | Medio | Verificar channel names idénticos, testing manual |
| **FeatureRegistry desactualizado** | Media | Bajo | Update features en Fase 6, verificar capabilities |
| **Users con bookmarks a /operations** | Baja | Bajo | Redirect 301 en App.tsx (opcional) |
| **EventBus hooks rotos** | Baja | Medio | Test integration en Fase 8.4 |
| **Module Registry no encuentra modules** | Baja | Medio | Verificar manifests exportados en `modules/index.ts` |

---

## 🎯 RESULTADO FINAL

### Arquitectura Post-Migración

**ANTES** (Operations Hub - confuso):
```
/admin/operations (Hub)
├── Planning (mock) ❌                 # 0% funcional
├── Kitchen (config only) ⚠️           # 30% útil
├── Tables (nested tabs) ⚠️            # 100% funcional, pero nested
└── Monitoring (mock) ❌               # 0% funcional
```

**KDS orphan en Sales** (desconectado):
```
/admin/sales/components/OrderManagement/
└── KitchenDisplaySystem.tsx ⚠️       # 526 lines sin uso
```

**DESPUÉS** (Módulos funcionales - claro):
```
/admin/operations/
│
├── floor/ ✅                          # 100% funcional
│   ├── Floor Plan (grid visual)
│   ├── Stats (revenue, occupancy, wait time)
│   ├── Table Detail (party tracking)
│   └── Reservations (placeholder, Coming Soon)
│
├── kitchen/ ✅                        # 100% funcional
│   ├── Kitchen Display (KDS completo)
│   ├── Stats (prep time, active orders)
│   ├── Config Drawer (modes, offline settings)
│   └── EventBus integration (auto-orders from Sales)
│
└── sales/ ✅                          # Sin duplicados
    └── POS (usa FloorPlanQuickView de Floor module)
```

---

### Beneficios Arquitectónicos

**1. Screaming Architecture** ✅
- Floor Management → `/operations/floor` (nombre claro)
- Kitchen Display → `/operations/kitchen` (función obvia)
- Sin nombres ambiguos ("Hub" eliminado)

**2. NO Nested Tabs** ✅
- Floor: Secciones integradas (no Floor Plan → sub-tabs)
- Kitchen: Config en drawer (no tab adicional)
- Navegación de 1 nivel (evita sobrecarga cognitiva)

**3. Eliminación de Mock Code** ✅
- Planning (129 lines mock) → eliminado, documentado en roadmap
- Monitoring (141 lines mock) → eliminado, documentado en roadmap
- -270 lines de código sin valor

**4. Eliminación de Duplicados** ✅
- TableFloorPlan básico (100 lines en Sales) → eliminado
- Sales usa Floor module completo via QuickView
- -100 lines de duplicación

**5. Reconexión de Orphan Code** ✅
- KDS (526 lines orphan en Sales) → migrado a Kitchen module
- Activación de link module kitchen (447 lines manifest)
- EventBus integration (sales → kitchen)
- +526 lines de código valioso ahora en uso

**6. Modularidad Real** ✅
- Floor module: Componentes separados (FloorPlanView, Stats, Detail)
- Kitchen module: KDS + Config independientes
- Reusabilidad (FloorPlanQuickView embeddable en Sales)

**7. Simplificación de Código** ✅
- Balance neto: -413 lines
- Menos complejidad (no wrappers, no tabs anidados)
- Mejor mantenibilidad (features por función)

---

### User Experience Mejorada

**Navegación más clara**:
- **Antes**: Admin → Operations Hub → Tables tab → Floor Plan sub-tab (3 clicks)
- **Después**: Admin → Floor Management (1 click, todo visible)

**Naming descriptivo**:
- **Antes**: "Hub" (¿qué hace?)
- **Después**: "Floor Management" (claro), "Kitchen Display" (obvio)

**Sin frustración**:
- **Antes**: "Kitchen" tab → esperaba KDS, encontró config ❌
- **Después**: "Kitchen Display" → es KDS, config en drawer ✅

**Features accesibles**:
- **Antes**: KDS 526 lines orphan, no se podía usar
- **Después**: KDS activo en `/admin/operations/kitchen`, integrado con Sales

---

### Métricas de Éxito

**Code Quality**:
- ✅ -413 lines netas (simplificación)
- ✅ 0% mock code (Planning, Monitoring eliminados)
- ✅ 0% duplicación (TableFloorPlan eliminado)
- ✅ 100% reconnection (KDS orphan → Kitchen module)

**Architecture**:
- ✅ Screaming architecture coherente
- ✅ 0 nested tabs (complejidad eliminada)
- ✅ Modularidad real (componentes reutilizables)
- ✅ Link module pattern activo (kitchen auto-install)

**User Experience**:
- ✅ Navegación 1-click (vs 3-clicks antes)
- ✅ Nombres descriptivos (Floor, Kitchen vs Hub)
- ✅ Features completas (KDS funcional, Tables completo)
- ✅ Sin placeholders visibles (mock code eliminado)

---

## 📅 CRONOGRAMA ESTIMADO

### Esfuerzo Total: ~8-12 horas (1.5 días)

**Día 1 - Mañana** (4 horas):
- Fase 1: Preparación (30 min)
- Fase 2: Migración Tables → Floor (2 horas)
- Fase 3: Migración KDS → Kitchen (1.5 horas)

**Día 1 - Tarde** (4 horas):
- Fase 4: Eliminar mock code (30 min)
- Fase 5: Actualizar routing (1 hora)
- Fase 6: Actualizar navegación (1.5 horas)
- Fase 7: Limpieza final (1 hora)

**Día 2 - Mañana** (4 horas):
- Fase 8: Testing completo (3 horas)
- Ajustes y fixes (1 hora)

**Buffer**: +2-4 horas para bugs inesperados

---

## 🚀 PRÓXIMOS PASOS POST-MIGRACIÓN

Una vez completada la migración de Hub:

**1. Continuar con decisiones arquitectónicas pendientes**:
- Decisión 2: E-commerce/Async Operations (11 features)
- Decisión 3: Delivery Management (8 features)
- Decisión 4: Multi-Location (5 features)

**2. Implementar features placeholder**:
- Floor → Reservations (si se requiere)
- Floor → Analytics (si se requiere)
- Kitchen → Order Queue (si se requiere)

**3. Production Planning**:
- Evaluar si es módulo independiente o tab en Products
- Basado en roadmap (`docs/roadmap/PRODUCTION_PLANNING.md`)

**4. Operations Monitoring**:
- Implementar como Dashboard widgets (NO módulo)
- Basado en roadmap (`docs/roadmap/OPERATIONS_MONITORING.md`)

**5. Refactor global de navegación**:
- Basado en todas las decisiones arquitectónicas
- Crear mapa de rutas definitivo
- Eliminar rutas huérfanas/duplicadas

---

## 📋 CHECKLIST DE EJECUCIÓN

**Pre-Migration**:
- [ ] Backup de código crítico (`tables.tsx`, `KitchenDisplaySystem.tsx`)
- [ ] Git branch nueva (`git checkout -b refactor/eliminate-hub`)
- [ ] Git commit actual (`git commit -am "Snapshot before hub migration"`)

**Fase 1 - Preparación**:
- [ ] Crear carpetas `floor/` y `kitchen/`
- [ ] Crear manifests base
- [ ] Verificar que dev server funciona

**Fase 2 - Floor Migration**:
- [ ] Crear `floor/page.tsx`
- [ ] Migrar `tables.tsx` → `FloorPlanView.tsx`
- [ ] Extraer componentes (Stats, Detail, QuickView)
- [ ] Actualizar imports en Sales
- [ ] Eliminar `TableFloorPlan.tsx` duplicado

**Fase 3 - Kitchen Migration**:
- [ ] Mover KDS de Sales → `kitchen/components/`
- [ ] Crear `kitchen/page.tsx`
- [ ] Migrar Kitchen config → `KitchenConfigDrawer.tsx`
- [ ] Actualizar `kitchen/manifest.tsx` (setup hooks)

**Fase 4 - Cleanup Mock**:
- [ ] Eliminar `Planning/`
- [ ] Eliminar `Monitoring/`
- [ ] Crear roadmap docs (si aplica)

**Fase 5 - Routing**:
- [ ] Agregar rutas Floor y Kitchen en `App.tsx`
- [ ] Eliminar ruta Hub
- [ ] Actualizar `LazyModules.ts`

**Fase 6 - Navigation**:
- [ ] Actualizar Sidebar (children)
- [ ] Actualizar FeatureRegistry
- [ ] Actualizar ModuleRegistry exports

**Fase 7 - Final Cleanup**:
- [ ] Eliminar carpeta `hub/` completa
- [ ] Eliminar `operations-hub/manifest.tsx`
- [ ] Limpiar imports muertos (`grep -r "operations/hub"`)
- [ ] Crear READMEs para Floor y Kitchen

**Fase 8 - Testing**:
- [ ] `pnpm -s exec tsc --noEmit` pasa
- [ ] `pnpm lint` pasa (0 warnings)
- [ ] Floor Management carga y funciona
- [ ] Kitchen Display carga y funciona
- [ ] Sales POS funciona (sin duplicados)
- [ ] Navegación sidebar funciona
- [ ] EventBus integration funciona
- [ ] Real-time updates funcionan
- [ ] No console errors
- [ ] Bundle size razonable

**Post-Migration**:
- [ ] Git commit (`git commit -am "refactor: Eliminate Operations Hub, create Floor + Kitchen modules"`)
- [ ] PR review (si aplica)
- [ ] Merge to main
- [ ] Deploy (verificar en producción)
- [ ] Actualizar documentación master plan

---

**FIN DEL PLAN DE MIGRACIÓN**

Este plan puede ejecutarse de forma iterativa o de una sola vez. Se recomienda completar todas las fases en orden para evitar estado inconsistente del sistema.
