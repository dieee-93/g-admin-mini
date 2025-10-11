# 🚀 Atomic Capabilities v2.0 - Phase 5 Implementation

**Date**: 2025-01-09
**Current Status**: Phase 4 (Validation) COMPLETED ✅
**Next Phase**: Phase 5 (Integration & Slot System)
**Priority**: HIGH
**Estimated Time**: 2-3 hours

---

## 📋 Executive Summary

Implementar las últimas 2 tareas críticas para completar el sistema Atomic Capabilities v2.0:

1. **TAREA 1**: Conectar CapabilitiesDebugger (`/debug/capabilities`) con backend (Supabase)
2. **TAREA 2**: Implementar lógica de slots dinámicos (`getSlotsForActiveFeatures()`)

**Current System Status**:
- ✅ E2E Tests: 6/6 PASSED (100%)
- ✅ TypeScript: Compila sin errores
- ✅ Backend Schema: Columnas v4.0 existen
- ✅ Database: Registro de prueba funcionando
- ⚠️ Debugger: Solo muestra estado local (no sincroniza con DB)
- ⚠️ Slots: Función implementada pero retorna array vacío

---

## 🎯 Context: Current System State

### Frontend (Zustand Store)
**File**: `src/store/capabilityStore.ts`
- ✅ Maneja estado local con persist middleware
- ✅ Funciones: `setCapabilities()`, `toggleActivity()`, `completeMilestone()`
- ✅ Exporta: `useCapabilities()` hook
- ❌ **NO sincroniza** automáticamente con Supabase

### Backend (Supabase)
**Table**: `business_profiles`
**Current Record**:
```json
{
  "id": "3ab0829b-69f7-4c3f-87c7-606072cae633",
  "business_name": "Mi Negocio",
  "selected_activities": ["sells_products", "sells_products_onsite"],
  "selected_infrastructure": ["multi_location"],
  "completed_milestones": [],
  "is_first_time_dashboard": true,
  "setup_completed": true,
  "active_capabilities": [] // LEGACY - vacío
}
```

**Schema (v4.0 columns)**:
```sql
-- NEW v4.0 columns (✅ ya existen en DB)
selected_activities      jsonb NOT NULL DEFAULT '[]'
selected_infrastructure  jsonb NOT NULL DEFAULT '["single_location"]'
completed_milestones     jsonb NOT NULL DEFAULT '[]'
is_first_time_dashboard  boolean DEFAULT true

-- LEGACY columns (deprecated pero aún presentes)
active_capabilities           jsonb NOT NULL DEFAULT '[]'
business_structure            text DEFAULT 'single_location'
computed_configuration        jsonb DEFAULT '{}'
auto_resolved_capabilities    jsonb DEFAULT '[]'
```

### Service Layer
**File**: `src/services/businessProfileService.ts`
**Functions Available**:
- ✅ `loadProfileFromDB()` - Carga profile al iniciar app
- ✅ `saveProfileToDB(profile)` - Guarda cambios en DB
- ✅ `updateCompletedMilestonesInDB(milestones)` - Actualiza milestones
- ✅ `subscribeToProfileChanges(callback)` - Real-time sync
- ✅ `hasProfileInDB()` - Verifica existencia
- ✅ `getSelectedActivitiesFromDB()` - Lee solo activities

**Current Integration**:
- ✅ Se usa en `setupStore.ts` (wizard)
- ❌ **NO se usa** en `CapabilitiesDebugger.tsx`

### Debug Page
**File**: `src/pages/debug/capabilities/CapabilitiesDebugger.tsx` (462 lines)
**Current State**:
- ✅ Lee de `useCapabilities()` hook (Zustand)
- ✅ Muestra 8 stat boxes (activities, features, milestones, etc.)
- ✅ Permite toggle de activities/infrastructure
- ✅ UI con secciones colapsables
- ❌ **NO lee** desde Supabase
- ❌ **NO persiste** cambios a DB
- ❌ **NO muestra** diferencias entre localStorage vs DB

### Slot System
**File**: `src/config/FeatureRegistry.ts:858-866`
**Current Implementation**:
```typescript
export function getSlotsForActiveFeatures(
  features: FeatureId[]
): Array<{ id: string; component: string; priority: number }> {
  const slots: Array<{ id: string; component: string; priority: number }> = [];
  // TODO: Implement proper slot mapping based on features
  return slots;
}
```

**Slot Infrastructure Available**:
- ✅ `src/lib/composition/Slot.tsx` - Componente base
- ✅ `src/lib/composition/hooks/useSlots.ts` - Hooks de gestión
- ✅ `src/lib/composition/SlotProvider.tsx` - Context provider
- ✅ `useSlotContent()`, `useFeatureSlotContent()` hooks

**Where Used**:
- `src/store/capabilityStore.ts:27` - Import
- Called 1x en `activateFeatures()` function

---

## 🎯 TAREA 1: Conectar CapabilitiesDebugger con Backend

### 1.1 Objetivos

**Funcionalidad Requerida**:
1. Al cargar `/debug/capabilities`:
   - Mostrar datos de **Zustand** (localStorage)
   - Mostrar datos de **Supabase** (business_profiles table)
   - Comparar ambos y mostrar diferencias

2. Al hacer cambios (toggle activity/infrastructure):
   - Actualizar **Zustand** (inmediato - optimistic UI)
   - Persistir a **Supabase** (async)
   - Mostrar loading state durante sync
   - Mostrar error si falla sync

3. Agregar sección de "Sync Status":
   - Estado actual: "✅ Synced" | "🔄 Syncing..." | "❌ Error"
   - Timestamp del último sync
   - Botón "Force Sync from DB" (sobrescribir local con DB)
   - Botón "Force Push to DB" (sobrescribir DB con local)

4. Real-time updates:
   - Suscribirse a cambios en `business_profiles`
   - Actualizar UI automáticamente si DB cambia

### 1.2 Implementation Plan

**Step 1: Add DB State to Component**

```tsx
// src/pages/debug/capabilities/CapabilitiesDebugger.tsx

import { useState, useEffect } from 'react';
import {
  loadProfileFromDB,
  saveProfileToDB,
  subscribeToProfileChanges,
  hasProfileInDB
} from '@/services/businessProfileService';
import type { UserProfile } from '@/store/capabilityStore';

export function CapabilitiesDebugger() {
  const {
    profile,
    activeFeatures,
    toggleActivity,
    setInfrastructure,
    // ... existing hooks
  } = useCapabilities();

  // NEW: DB state
  const [dbProfile, setDbProfile] = useState<UserProfile | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hasDbProfile, setHasDbProfile] = useState(false);

  // Load DB profile on mount
  useEffect(() => {
    loadDbProfile();
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    const unsubscribe = subscribeToProfileChanges((updatedProfile) => {
      setDbProfile(updatedProfile);
      setLastSyncTime(new Date());
    });

    return unsubscribe;
  }, []);

  const loadDbProfile = async () => {
    try {
      setSyncStatus('syncing');
      const [profile, exists] = await Promise.all([
        loadProfileFromDB(),
        hasProfileInDB()
      ]);
      setDbProfile(profile);
      setHasDbProfile(exists);
      setLastSyncTime(new Date());
      setSyncStatus('idle');
    } catch (error) {
      setSyncError(error.message);
      setSyncStatus('error');
    }
  };

  const syncToDb = async () => {
    if (!profile) return;

    try {
      setSyncStatus('syncing');
      await saveProfileToDB(profile);
      setDbProfile(profile);
      setLastSyncTime(new Date());
      setSyncStatus('idle');
      setSyncError(null);
    } catch (error) {
      setSyncError(error.message);
      setSyncStatus('error');
    }
  };

  const forceSyncFromDb = async () => {
    if (!confirm('¿Sobrescribir estado local con datos de la DB?')) return;

    try {
      setSyncStatus('syncing');
      const profile = await loadProfileFromDB();
      if (profile) {
        // Update Zustand store with DB data
        setCapabilities(profile.selectedActivities);
        setInfrastructure(profile.selectedInfrastructure);
      }
      setLastSyncTime(new Date());
      setSyncStatus('idle');
    } catch (error) {
      setSyncError(error.message);
      setSyncStatus('error');
    }
  };

  // ... rest of component
}
```

**Step 2: Add Sync Status Section to UI**

```tsx
{/* NEW SECTION: Sync Status */}
<Section variant="elevated">
  <Stack gap={4}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="heading" fontSize="lg">
        🔄 Database Sync Status
      </Typography>
      <Badge
        colorPalette={
          syncStatus === 'error' ? 'red' :
          syncStatus === 'syncing' ? 'orange' :
          'green'
        }
        size="lg"
      >
        {syncStatus === 'error' ? '❌ Error' :
         syncStatus === 'syncing' ? '🔄 Syncing...' :
         '✅ Synced'}
      </Badge>
    </div>

    {/* Sync Info */}
    <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
      <StatBox label="Last Sync" value={lastSyncTime?.toLocaleTimeString() || 'Never'} color="blue" />
      <StatBox label="DB Profile Exists" value={hasDbProfile ? 'Yes' : 'No'} color={hasDbProfile ? 'green' : 'red'} />
      <StatBox label="Local Changes" value={profile && dbProfile ? 'Comparing...' : 'N/A'} color="orange" />
    </SimpleGrid>

    {/* Sync Error */}
    {syncError && (
      <Alert status="error" title="Sync Error">
        <Typography variant="body" fontSize="sm">{syncError}</Typography>
      </Alert>
    )}

    {/* Sync Actions */}
    <Stack direction="row" gap={3}>
      <Button
        onClick={syncToDb}
        disabled={syncStatus === 'syncing'}
        colorPalette="blue"
      >
        {syncStatus === 'syncing' ? 'Syncing...' : '⬆️ Push to DB'}
      </Button>
      <Button
        onClick={forceSyncFromDb}
        disabled={syncStatus === 'syncing'}
        variant="outline"
        colorPalette="purple"
      >
        ⬇️ Pull from DB
      </Button>
      <Button
        onClick={loadDbProfile}
        disabled={syncStatus === 'syncing'}
        variant="ghost"
      >
        🔄 Refresh
      </Button>
    </Stack>

    {/* Data Comparison */}
    {profile && dbProfile && (
      <Box p={4} bg="gray.50" borderRadius="md">
        <Typography variant="body" fontWeight="bold" mb={2}>
          📊 Local vs Database Comparison
        </Typography>
        <Stack gap={2} fontSize="sm">
          <ComparisonRow
            label="Selected Activities"
            local={profile.selectedActivities?.length || 0}
            db={dbProfile.selectedActivities?.length || 0}
          />
          <ComparisonRow
            label="Infrastructure"
            local={profile.selectedInfrastructure?.length || 0}
            db={dbProfile.selectedInfrastructure?.length || 0}
          />
          <ComparisonRow
            label="Completed Milestones"
            local={profile.completedMilestones?.length || 0}
            db={dbProfile.completedMilestones?.length || 0}
          />
        </Stack>
      </Box>
    )}
  </Stack>
</Section>
```

**Step 3: Add Helper Component**

```tsx
// Helper component for comparison rows
function ComparisonRow({ label, local, db }: { label: string; local: number; db: number }) {
  const isDifferent = local !== db;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="body" fontWeight="medium">{label}</Typography>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Badge colorPalette="blue" size="sm">Local: {local}</Badge>
        <Typography variant="caption" color="gray.500">vs</Typography>
        <Badge colorPalette={isDifferent ? 'orange' : 'green'} size="sm">
          DB: {db}
        </Badge>
        {isDifferent && <span style={{ color: 'orange' }}>⚠️</span>}
      </div>
    </div>
  );
}
```

**Step 4: Auto-sync on Changes**

```tsx
// Modify existing toggle handlers to auto-sync
const handleToggleActivity = async (activityId: BusinessActivityId) => {
  // Optimistic update
  toggleActivity(activityId);

  // Sync to DB
  setTimeout(async () => {
    try {
      await syncToDb();
    } catch (error) {
      logger.error('CapabilitiesDebugger', 'Failed to sync after toggle', { error });
    }
  }, 300); // Debounce
};
```

### 1.3 Acceptance Criteria

- [ ] Debugger muestra 2 secciones: "Local State" y "Database State"
- [ ] Sync status visible con timestamp
- [ ] Comparación visual entre local y DB (destacar diferencias)
- [ ] Botón "Push to DB" persiste cambios locales
- [ ] Botón "Pull from DB" sobrescribe local con DB
- [ ] Real-time subscription actualiza UI cuando DB cambia
- [ ] Loading states durante operaciones async
- [ ] Error handling con mensajes claros
- [ ] TypeScript compila sin errores
- [ ] Logs informativos en consola (dev mode)

---

## 🎯 TAREA 2: Implementar Lógica de Slots Dinámicos

### 2.1 Objetivos

**Funcionalidad Requerida**:

Implementar `getSlotsForActiveFeatures()` para inyectar componentes dinámicos basados en features activas.

**Casos de Uso**:
1. **Dashboard Widgets**: Mostrar widgets específicos según features
2. **Module Extensions**: Agregar tabs/secciones a módulos existentes
3. **Toolbar Actions**: Botones de acción condicionales
4. **Sidebar Items**: Menú dinámico según capacidades

**Architecture**:
```
FeatureId → Slot Definitions → Dynamic Components
```

### 2.2 Slot Mapping Strategy

**Design Decision**: 3-tier slot system

**Tier 1: Core Slots** (Always visible, no feature required)
- `dashboard-header`
- `dashboard-main`
- `module-content`

**Tier 2: Feature Slots** (Requires specific features)
- `sales-pos-actions` → requires `sales_pos_onsite` OR `sales_pos_mobile`
- `inventory-alerts` → requires `inventory_stock_tracking`
- `production-kitchen` → requires `production_kitchen_display`

**Tier 3: Composite Slots** (Multiple feature combinations)
- `advanced-analytics` → requires `analytics_*` features (any)
- `mobile-integrations` → requires `mobile_*` features (all)

### 2.3 Implementation Plan

**Step 1: Define Slot Registry**

Create new file: `src/config/SlotRegistry.ts`

```typescript
/**
 * SLOT REGISTRY v1.0
 * Maps features to dynamic slot content
 * Based on Atomic Capabilities v2.0
 */

import type { FeatureId } from './FeatureRegistry';

export interface SlotDefinition {
  id: string;
  name: string;
  component: string; // Path to lazy-loaded component
  priority: number; // Higher = rendered first
  requiredFeatures: FeatureId[] | 'any' | 'core';
  featureMode: 'any' | 'all'; // 'any' = OR, 'all' = AND
  targetSlots: string[]; // Which slot IDs to inject into
  category?: 'widget' | 'action' | 'section' | 'integration';
  metadata?: Record<string, any>;
}

/**
 * SLOT REGISTRY - All available dynamic slots
 */
export const SLOT_REGISTRY: Record<string, SlotDefinition> = {
  // ==========================================
  // DASHBOARD WIDGETS
  // ==========================================

  'dashboard-sales-widget': {
    id: 'dashboard-sales-widget',
    name: 'Sales Overview Widget',
    component: '@/pages/admin/core/dashboard/components/widgets/SalesWidget',
    priority: 100,
    requiredFeatures: ['sales_order_management'],
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  'dashboard-inventory-widget': {
    id: 'dashboard-inventory-widget',
    name: 'Inventory Alerts Widget',
    component: '@/pages/admin/core/dashboard/components/widgets/InventoryWidget',
    priority: 90,
    requiredFeatures: ['inventory_stock_tracking'],
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  'dashboard-production-widget': {
    id: 'dashboard-production-widget',
    name: 'Production Status Widget',
    component: '@/pages/admin/core/dashboard/components/widgets/ProductionWidget',
    priority: 80,
    requiredFeatures: ['production_kitchen_display', 'production_recipe_management'],
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  'dashboard-scheduling-widget': {
    id: 'dashboard-scheduling-widget',
    name: 'Staff Schedule Widget',
    component: '@/pages/admin/core/dashboard/components/widgets/SchedulingWidget',
    priority: 70,
    requiredFeatures: ['scheduling_shift_management'],
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  // ==========================================
  // MODULE ACTIONS
  // ==========================================

  'sales-quick-actions': {
    id: 'sales-quick-actions',
    name: 'POS Quick Actions',
    component: '@/pages/admin/operations/sales/components/QuickActionsToolbar',
    priority: 100,
    requiredFeatures: ['sales_pos_onsite', 'sales_pos_mobile'],
    featureMode: 'any',
    targetSlots: ['sales-toolbar'],
    category: 'action'
  },

  'inventory-procurement-actions': {
    id: 'inventory-procurement-actions',
    name: 'Procurement Quick Actions',
    component: '@/pages/admin/supply-chain/materials/components/ProcurementActions',
    priority: 80,
    requiredFeatures: ['inventory_purchase_orders'],
    featureMode: 'any',
    targetSlots: ['materials-toolbar'],
    category: 'action'
  },

  // ==========================================
  // ANALYTICS INTEGRATIONS
  // ==========================================

  'analytics-rfm-section': {
    id: 'analytics-rfm-section',
    name: 'RFM Analysis Section',
    component: '@/pages/admin/core/intelligence/components/RFMAnalysis',
    priority: 90,
    requiredFeatures: ['analytics_customer_insights', 'crm_customer_segmentation'],
    featureMode: 'all',
    targetSlots: ['intelligence-sections'],
    category: 'section'
  },

  'analytics-sales-forecasting': {
    id: 'analytics-sales-forecasting',
    name: 'Sales Forecasting',
    component: '@/pages/admin/core/intelligence/components/SalesForecasting',
    priority: 85,
    requiredFeatures: ['analytics_sales_forecasting'],
    featureMode: 'any',
    targetSlots: ['intelligence-sections'],
    category: 'section'
  },

  // ==========================================
  // MOBILE INTEGRATIONS
  // ==========================================

  'mobile-qr-ordering': {
    id: 'mobile-qr-ordering',
    name: 'QR Code Ordering',
    component: '@/pages/admin/operations/sales/components/QROrderingIntegration',
    priority: 70,
    requiredFeatures: ['mobile_qr_ordering'],
    featureMode: 'any',
    targetSlots: ['sales-integrations'],
    category: 'integration'
  },

  'mobile-delivery-tracking': {
    id: 'mobile-delivery-tracking',
    name: 'Delivery Tracking Widget',
    component: '@/pages/admin/operations/delivery/components/TrackingWidget',
    priority: 75,
    requiredFeatures: ['mobile_delivery_tracking'],
    featureMode: 'any',
    targetSlots: ['operations-widgets'],
    category: 'widget'
  },

  // ==========================================
  // FINANCE INTEGRATIONS
  // ==========================================

  'finance-afip-integration': {
    id: 'finance-afip-integration',
    name: 'AFIP Integration Panel',
    component: '@/pages/admin/finance/components/AFIPIntegration',
    priority: 100,
    requiredFeatures: ['finance_invoicing_afip'],
    featureMode: 'any',
    targetSlots: ['finance-integrations'],
    category: 'integration'
  },

  // ==========================================
  // MULTISITE FEATURES
  // ==========================================

  'multisite-location-switcher': {
    id: 'multisite-location-switcher',
    name: 'Location Switcher',
    component: '@/shared/navigation/LocationSwitcher',
    priority: 200,
    requiredFeatures: ['multisite_location_management'],
    featureMode: 'any',
    targetSlots: ['navbar-actions'],
    category: 'action'
  },

  'multisite-central-dashboard': {
    id: 'multisite-central-dashboard',
    name: 'Central Dashboard View',
    component: '@/pages/admin/core/dashboard/components/MultisiteDashboard',
    priority: 150,
    requiredFeatures: ['multisite_central_dashboard'],
    featureMode: 'any',
    targetSlots: ['dashboard-main'],
    category: 'section'
  }
};

/**
 * Get slot definitions for active features
 */
export function getSlotDefinitionsForFeatures(
  features: FeatureId[]
): SlotDefinition[] {
  return Object.values(SLOT_REGISTRY).filter(slot => {
    // Core slots always visible
    if (slot.requiredFeatures === 'core') return true;

    // 'any' means no feature required
    if (slot.requiredFeatures === 'any') return true;

    // Check feature requirements
    const requiredFeatures = slot.requiredFeatures as FeatureId[];

    if (slot.featureMode === 'all') {
      // ALL features required (AND)
      return requiredFeatures.every(f => features.includes(f));
    } else {
      // ANY feature required (OR)
      return requiredFeatures.some(f => features.includes(f));
    }
  });
}
```

**Step 2: Update `getSlotsForActiveFeatures()`**

```typescript
// src/config/FeatureRegistry.ts

import { getSlotDefinitionsForFeatures } from './SlotRegistry';

/**
 * Get dynamic slots based on active features (v2.0)
 * Returns simplified slot objects for composition system
 */
export function getSlotsForActiveFeatures(
  features: FeatureId[]
): Array<{ id: string; component: string; priority: number }> {
  const slotDefinitions = getSlotDefinitionsForFeatures(features);

  // Map to simplified format
  return slotDefinitions.map(slot => ({
    id: slot.id,
    component: slot.component,
    priority: slot.priority
  }));
}

/**
 * Get slots for a specific target slot ID
 * Useful for rendering slots in specific locations
 */
export function getSlotsForTarget(
  features: FeatureId[],
  targetSlotId: string
): Array<{ id: string; component: string; priority: number }> {
  const allSlots = getSlotsForActiveFeatures(features);
  const definitions = getSlotDefinitionsForFeatures(features);

  return allSlots.filter((slot, index) => {
    const definition = definitions[index];
    return definition.targetSlots.includes(targetSlotId);
  }).sort((a, b) => b.priority - a.priority); // Sort by priority descending
}
```

**Step 3: Create Example Widget Components**

Create: `src/pages/admin/core/dashboard/components/widgets/SalesWidget.tsx`

```typescript
/**
 * Sales Overview Widget - Dynamic Dashboard Component
 * Only visible if sales features are active
 */

import { Box, Typography, Stack } from '@/shared/ui';
import { useCapabilities } from '@/store/capabilityStore';

export function SalesWidget() {
  const { hasFeature } = useCapabilities();

  if (!hasFeature('sales_order_management')) {
    return null; // Should never render without feature, but double-check
  }

  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
      <Typography variant="heading" fontSize="lg" mb={3}>
        📊 Sales Overview
      </Typography>
      <Stack gap={2}>
        <Typography variant="body" fontSize="sm" color="gray.600">
          Today's Sales: $1,234.56
        </Typography>
        <Typography variant="body" fontSize="sm" color="gray.600">
          Orders: 45
        </Typography>
        <Typography variant="body" fontSize="sm" color="gray.600">
          Avg Ticket: $27.43
        </Typography>
      </Stack>
    </Box>
  );
}
```

Repeat for other widgets: `InventoryWidget.tsx`, `ProductionWidget.tsx`, `SchedulingWidget.tsx`

**Step 4: Integrate Slots into Dashboard**

Update: `src/pages/admin/core/dashboard/page.tsx`

```typescript
import { getSlotsForTarget } from '@/config/FeatureRegistry';
import { useCapabilities } from '@/store/capabilityStore';
import { Slot } from '@/lib/composition';
import { lazy, Suspense } from 'react';

export default function DashboardPage() {
  const { activeFeatures } = useCapabilities();

  // Get widgets for dashboard
  const widgetSlots = getSlotsForTarget(activeFeatures, 'dashboard-widgets');

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat">
        <Typography variant="heading" fontSize="2xl">Dashboard</Typography>
      </Section>

      {/* Dynamic Widgets */}
      <Section variant="elevated">
        <Typography variant="heading" fontSize="lg" mb={4}>
          Your Widgets
        </Typography>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {widgetSlots.map(slot => {
            const Component = lazy(() => import(slot.component));
            return (
              <Suspense key={slot.id} fallback={<WidgetSkeleton />}>
                <Component />
              </Suspense>
            );
          })}
        </SimpleGrid>
      </Section>

      {/* ... rest of dashboard */}
    </ContentLayout>
  );
}

function WidgetSkeleton() {
  return (
    <Box p={4} bg="gray.100" borderRadius="md" h="150px">
      <Typography variant="caption" color="gray.500">Loading...</Typography>
    </Box>
  );
}
```

### 2.4 Acceptance Criteria

- [ ] `SlotRegistry.ts` creado con 10+ slot definitions
- [ ] `getSlotsForActiveFeatures()` retorna slots correctos según features
- [ ] `getSlotsForTarget()` filtra por targetSlot
- [ ] Widget components creados (SalesWidget, InventoryWidget, etc.)
- [ ] Dashboard integra slots dinámicos
- [ ] Slots se renderizan solo si features activas
- [ ] Prioridad de slots funciona (order correcto)
- [ ] Lazy loading de componentes funciona
- [ ] TypeScript compila sin errores
- [ ] Tests unitarios para slot filtering logic

---

## 🧪 Testing Strategy

### Unit Tests

**File**: `src/config/__tests__/SlotRegistry.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getSlotDefinitionsForFeatures, SLOT_REGISTRY } from '../SlotRegistry';
import { getSlotsForActiveFeatures, getSlotsForTarget } from '../FeatureRegistry';

describe('SlotRegistry', () => {
  it('should return slots for sales features', () => {
    const features = ['sales_order_management', 'sales_pos_onsite'];
    const slots = getSlotDefinitionsForFeatures(features);

    expect(slots.length).toBeGreaterThan(0);
    expect(slots.some(s => s.id === 'dashboard-sales-widget')).toBe(true);
  });

  it('should respect featureMode "all"', () => {
    const features = ['analytics_customer_insights']; // Solo 1 de 2 requeridos
    const slots = getSlotDefinitionsForFeatures(features);

    // RFM requiere 2 features con mode 'all'
    expect(slots.some(s => s.id === 'analytics-rfm-section')).toBe(false);
  });

  it('should filter by target slot ID', () => {
    const features = ['sales_pos_onsite', 'inventory_stock_tracking'];
    const dashboardSlots = getSlotsForTarget(features, 'dashboard-widgets');

    expect(dashboardSlots.every(s =>
      SLOT_REGISTRY[s.id].targetSlots.includes('dashboard-widgets')
    )).toBe(true);
  });

  it('should sort by priority descending', () => {
    const features = ['sales_order_management', 'inventory_stock_tracking'];
    const slots = getSlotsForTarget(features, 'dashboard-widgets');

    for (let i = 0; i < slots.length - 1; i++) {
      expect(slots[i].priority).toBeGreaterThanOrEqual(slots[i + 1].priority);
    }
  });
});
```

### E2E Tests

**File**: `e2e/debugger-sync.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Capabilities Debugger - DB Sync', () => {
  test('should load and display DB profile', async ({ page }) => {
    await page.goto('http://localhost:5173/debug/capabilities');

    // Wait for DB load
    await page.waitForSelector('[data-testid="sync-status"]');

    // Check sync status
    const syncStatus = await page.textContent('[data-testid="sync-status"]');
    expect(syncStatus).toContain('Synced');
  });

  test('should push local changes to DB', async ({ page }) => {
    await page.goto('http://localhost:5173/debug/capabilities');

    // Toggle activity
    await page.click('[data-testid="toggle-sells_products"]');

    // Click Push to DB
    await page.click('[data-testid="push-to-db"]');

    // Wait for sync
    await page.waitForSelector('[data-testid="sync-status"]:has-text("Synced")');

    // Verify in DB (need API call or DB check)
    // ... add verification logic
  });
});
```

### Manual Testing Checklist

- [ ] Navigate to `/debug/capabilities`
- [ ] Verify "Sync Status" section shows
- [ ] Verify local and DB state displayed
- [ ] Toggle an activity → Check local updates immediately
- [ ] Click "Push to DB" → Verify DB updates (check Supabase UI)
- [ ] Click "Pull from DB" → Verify local overwrites with DB data
- [ ] Open multiple browser tabs → Verify real-time sync between tabs
- [ ] Disable network → Verify error handling
- [ ] Navigate to dashboard → Verify widgets render based on features
- [ ] Change features in debugger → Navigate to dashboard → Verify widgets update

---

## 📁 File Structure

```
src/
├── config/
│   ├── BusinessModelRegistry.ts      (existing)
│   ├── FeatureRegistry.ts            (UPDATE: getSlotsForActiveFeatures)
│   ├── RequirementsRegistry.ts       (existing)
│   └── SlotRegistry.ts               (NEW)
│
├── services/
│   └── businessProfileService.ts     (existing - no changes)
│
├── pages/
│   ├── debug/
│   │   └── capabilities/
│   │       └── CapabilitiesDebugger.tsx  (UPDATE: add DB sync)
│   │
│   └── admin/
│       └── core/
│           └── dashboard/
│               ├── page.tsx                    (UPDATE: integrate slots)
│               └── components/
│                   └── widgets/
│                       ├── SalesWidget.tsx     (NEW)
│                       ├── InventoryWidget.tsx (NEW)
│                       ├── ProductionWidget.tsx (NEW)
│                       └── SchedulingWidget.tsx (NEW)
│
├── lib/
│   └── composition/                   (existing - no changes)
│       ├── Slot.tsx
│       ├── hooks/useSlots.ts
│       └── index.ts
│
└── __tests__/
    └── SlotRegistry.test.ts          (NEW)
```

---

## 🎯 Success Criteria

### TAREA 1: Debugger + Backend
- [ ] Sync status section visible
- [ ] Real-time sync works
- [ ] Push/Pull buttons functional
- [ ] Error handling robust
- [ ] TypeScript compiles
- [ ] No console errors

### TAREA 2: Slot System
- [ ] SlotRegistry.ts con 10+ definitions
- [ ] getSlotsForActiveFeatures() implementada
- [ ] 4 widget components creados
- [ ] Dashboard renderiza widgets dinámicamente
- [ ] Lazy loading funciona
- [ ] TypeScript compiles
- [ ] Unit tests pasan

### Overall System Health
- [ ] E2E wizard → dashboard → debugger flow works
- [ ] DB persistence verified in Supabase UI
- [ ] No memory leaks (check with React DevTools Profiler)
- [ ] Bundle size <5MB (verify with `pnpm build`)
- [ ] Lighthouse score >90 (Performance, Accessibility)

---

## ⚙️ Technical Specifications

### TypeScript

**Required Types**:
```typescript
// SlotRegistry.ts
interface SlotDefinition {
  id: string;
  name: string;
  component: string;
  priority: number;
  requiredFeatures: FeatureId[] | 'any' | 'core';
  featureMode: 'any' | 'all';
  targetSlots: string[];
  category?: 'widget' | 'action' | 'section' | 'integration';
  metadata?: Record<string, any>;
}

// CapabilitiesDebugger.tsx
interface DbSyncState {
  dbProfile: UserProfile | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime: Date | null;
  syncError: string | null;
  hasDbProfile: boolean;
}
```

### Performance Targets

- DB load: <500ms
- Sync operation: <1s
- Slot rendering: <100ms
- Bundle impact: <50KB (SlotRegistry + widgets)

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 📚 References

### Documentation
- `docs/02-architecture/ATOMIC_CAPABILITIES_TECHNICAL_SPEC.md` - System architecture
- `ATOMIC_CAPABILITIES_E2E_TEST_RESULTS.md` - Testing results
- `ATOMIC_CAPABILITIES_VALIDATION_REPORT.md` - Validation analysis

### Related Files
- `src/store/capabilityStore.ts` - State management
- `src/services/businessProfileService.ts` - DB operations
- `src/lib/composition/` - Slot infrastructure
- `src/config/FeatureRegistry.ts` - Feature definitions

### External Resources
- Zustand docs: https://docs.pmnd.rs/zustand
- Supabase real-time: https://supabase.com/docs/guides/realtime
- React lazy loading: https://react.dev/reference/react/lazy

---

## 🚦 Implementation Workflow

### Phase 1: Setup (15 min)
1. Create `SlotRegistry.ts` skeleton
2. Add DB sync state to `CapabilitiesDebugger.tsx`
3. Run `pnpm -s exec tsc --noEmit` to verify types

### Phase 2: TAREA 1 - Debugger Backend (60 min)
1. Implement `loadDbProfile()`, `syncToDb()`, `forceSyncFromDb()`
2. Add Sync Status section UI
3. Add real-time subscription
4. Test manually with Supabase UI

### Phase 3: TAREA 2 - Slot System (60 min)
1. Complete `SlotRegistry.ts` with 10+ definitions
2. Implement `getSlotsForActiveFeatures()` and `getSlotsForTarget()`
3. Create 4 widget components
4. Integrate into Dashboard

### Phase 4: Testing (30 min)
1. Unit tests for slot filtering
2. Manual E2E test (wizard → dashboard → debugger)
3. Verify DB persistence in Supabase
4. Check bundle size

### Phase 5: Documentation (15 min)
1. Update CLAUDE.md with new patterns
2. Add JSDoc comments to public functions
3. Create migration notes (if needed)

**Total Estimated Time**: 3 hours

---

## 🔧 Development Commands

```bash
# TypeScript validation
pnpm -s exec tsc --noEmit

# Run dev server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run specific test file
pnpm test SlotRegistry.test.ts

# Check bundle size
pnpm build && ls -lh dist/assets/*.js
```

---

## ✅ Definition of Done

**TAREA 1 Complete When**:
- [ ] Code committed with message: `feat: connect CapabilitiesDebugger to Supabase backend`
- [ ] TypeScript compiles with 0 errors
- [ ] Manual test passed (wizard → debugger → sync)
- [ ] No console errors in browser
- [ ] DB verified in Supabase UI

**TAREA 2 Complete When**:
- [ ] Code committed with message: `feat: implement dynamic slot system with 10+ definitions`
- [ ] TypeScript compiles with 0 errors
- [ ] Unit tests pass (SlotRegistry.test.ts)
- [ ] Dashboard shows dynamic widgets
- [ ] Bundle size <5MB

**Phase 5 Complete When**:
- [ ] Both tareas completed
- [ ] E2E flow works (wizard → dashboard → debugger → DB)
- [ ] Documentation updated
- [ ] Code reviewed (self-review checklist)
- [ ] No TODO comments left in code
- [ ] Performance targets met
- [ ] Ready for user acceptance testing

---

## 🎉 Expected Outcomes

### User Experience
- Debug page shows real-time sync status
- Dashboard adapts to selected business capabilities
- Widgets appear/disappear based on features
- Smooth performance (no lag)

### Developer Experience
- Clear slot definitions (self-documenting)
- Easy to add new slots (just update SlotRegistry)
- TypeScript autocomplete for slot IDs
- Simple testing (unit + E2E)

### System Health
- Data integrity (local ↔ DB always synced)
- Resilient (handles network errors gracefully)
- Performant (lazy loading, memoization)
- Maintainable (separation of concerns)

---

**END OF PROMPT**

---

## 📝 Notes for Implementation
|
1. **Priority**: Tarea 1 first (backend sync), then Tarea 2 (slots)
2. **Testing**: Test each tarea independently before integration
3. **Commits**: Separate commits for each tarea
4. **Questions**: If design decisions needed, document in code comments with "DESIGN_DECISION:" prefix
5. **Breaking Changes**: None expected - all additions, no deletions

**Ready to implement?** 🚀
