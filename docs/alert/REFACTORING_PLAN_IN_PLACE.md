# 🔧 Plan de Refactoring In-Place: Alert System UI/UX
## Modificación de componentes existentes sin crear clases nuevas

**Fecha:** 19 de Noviembre, 2025  
**Estrategia:** Refactoring incremental sobre base actual

---

## 📊 Análisis de Componentes Actuales

### 1. **GlobalAlertsDisplay.tsx** (319 líneas)
**Estado actual:**
- Panel flotante configurable (top-right, top-left, bottom-right, bottom-left)
- Comportamiento colapsable con auto-collapse
- Límite de alertas visibles configurable (`maxVisible`)
- Sticky header con contador y acciones
- Acciones bulk (acknowledge all, resolve all, dismiss all)
- Portal rendering para z-index control

**Problemas identificados:**
- ❌ No es toast stack (es panel fijo colapsable)
- ❌ No tiene progress bar para auto-dismiss timing
- ❌ No usa animaciones modernas (Framer Motion)
- ❌ Header siempre visible (no se oculta automáticamente)

**✅ Cosas que MANTENER:**
- Portal rendering strategy
- Position config system
- Bulk actions logic
- Memoization (ya usa `memo()`)

---

### 2. **AlertDisplay.tsx** (402 líneas)
**Estado actual:**
- Component display con 4 variantes: `card` | `banner` | `inline` | `minimal`
- Severity color mapping
- Icon mapping (severity + type)
- Actions rendering (acknowledge, resolve, dismiss, custom actions)
- Metadata display (timestamp, context, tags)

**Problemas identificados:**
- ❌ No tiene progress bar visual
- ❌ No tiene animaciones enter/exit
- ❌ No está optimizado para toast stack (necesita más compacto)

**✅ Cosas que MANTENER:**
- Severity/type icon system
- Actions rendering logic
- Metadata display (útil para notification center)
- Memoization

---

### 3. **AlertsProvider.tsx** (707 líneas)
**Estado actual:**
- Context split: `AlertsStateContext` + `AlertsActionsContext` (EXCELENTE optimization)
- State management con `useState` + `localStorage` persistence
- Auto-expire alerts con interval
- Bulk actions (bulkCreate, bulkAcknowledge, etc.)
- Stats calculation con `useMemo`
- EventBus integration

**Problemas identificados:**
- ❌ No tiene estados para notification center (`read`, `snoozed`)
- ❌ No tiene historial separado de alertas activas
- ❌ No tiene lógica para toast stack (duration management, progress tracking)

**✅ Cosas que MANTENER:**
- Split context pattern (performance)
- All callbacks con empty deps (stability)
- localStorage persistence
- EventBus integration
- Stats calculation

---

## 🎯 Estrategia de Refactoring

### Fase 1: Extender tipos y state (AlertsProvider)

**Cambios en `types.ts`:**
```typescript
// AÑADIR nuevos estados
export type AlertStatus = 
  | 'active'       // Existente
  | 'acknowledged' // Existente
  | 'resolved'     // Existente
  | 'dismissed'    // Existente
  | 'snoozed';     // 🆕 NUEVO

// AÑADIR nuevo campo en Alert interface
export interface Alert {
  // ... campos existentes ...
  
  // 🆕 NUEVOS para Notification Center
  readAt?: Date;           // Timestamp cuando se leyó
  snoozedUntil?: Date;     // Snooze hasta esta fecha
  archivedAt?: Date;       // Archivado del centro
}

// 🆕 NUEVO: Config para toast duration
export interface ToastDurationConfig {
  info: number;      // 3000ms
  success: number;   // 3000ms
  warning: number;   // 5000ms
  error: number;     // 8000ms
  critical: number;  // Infinity (no auto-dismiss)
}

// EXTENDER AlertsConfiguration
export interface AlertsConfiguration {
  // ... existentes ...
  
  // 🆕 NUEVOS
  toastDuration?: ToastDurationConfig;
  toastStackMax?: number;           // Max toasts visibles (default: 3)
  notificationCenterMax?: number;    // Max en historial (default: 50)
}
```

**Cambios en `AlertsProvider.tsx`:**
```typescript
// 🆕 AÑADIR nuevo estado para drawer
const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

// 🆕 AÑADIR nuevas acciones
const markAsRead = useCallback(async (id: string) => {
  setAlerts(prev => prev.map(alert =>
    alert.id === id
      ? { ...alert, readAt: new Date() }
      : alert
  ));
}, []);

const snooze = useCallback(async (id: string, duration: number) => {
  const snoozedUntil = new Date(Date.now() + duration);
  setAlerts(prev => prev.map(alert =>
    alert.id === id
      ? { 
          ...alert, 
          status: 'snoozed', 
          snoozedUntil 
        }
      : alert
  ));
  
  // Reactivar después de duration
  setTimeout(() => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id && alert.status === 'snoozed'
        ? { ...alert, status: 'active', snoozedUntil: undefined }
        : alert
    ));
  }, duration);
}, []);

const archive = useCallback(async (id: string) => {
  setAlerts(prev => prev.map(alert =>
    alert.id === id
      ? { ...alert, archivedAt: new Date() }
      : alert
  ));
}, []);

// 🆕 AÑADIR acciones de drawer
const openNotificationCenter = useCallback(() => {
  setIsNotificationCenterOpen(true);
}, []);

const closeNotificationCenter = useCallback(() => {
  setIsNotificationCenterOpen(false);
}, []);

// 🆕 ACTUALIZAR stats para incluir unread
const stats = useMemo(() => {
  const unread = alerts.filter(a => !a.readAt && a.status !== 'dismissed').length;
  // ... stats existentes ...
  return {
    // ... existentes ...
    unread
  };
}, [alerts]);
```

---

### Fase 2: Transformar GlobalAlertsDisplay → Toast Stack

**Cambios en `GlobalAlertsDisplay.tsx`:**

**2.1. Añadir soporte para progress bar:**
```typescript
// 🆕 AÑADIR tracking de progress para auto-dismiss
const [progress, setProgress] = useState<Record<string, number>>({});

useEffect(() => {
  // Timer para actualizar progress de toasts
  const interval = setInterval(() => {
    setProgress(prev => {
      const updated = { ...prev };
      visibleAlerts.forEach(alert => {
        if (!alert.autoExpire) return;
        
        const elapsed = Date.now() - alert.createdAt.getTime();
        const duration = alert.autoExpire * 60 * 1000;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        
        updated[alert.id] = newProgress;
      });
      return updated;
    });
  }, 100);
  
  return () => clearInterval(interval);
}, [visibleAlerts]);
```

**2.2. Cambiar layout de panel → stack:**
```tsx
// ANTES: Panel con header + collapsible body
<Box position="fixed" {...positionStyles[finalPosition]} zIndex={1100} w="350px">
  <VStack gap="2">
    <CardWrapper bg={...}>  {/* Header sticky */}
      <CardWrapper.Body>...</CardWrapper.Body>
    </CardWrapper>
    <Collapsible.Root>
      <Collapsible.Content>
        {alerts.map(...)} {/* Body colapsable */}
      </Collapsible.Content>
    </Collapsible.Root>
  </VStack>
</Box>

// DESPUÉS: Toast stack sin header permanente
<Portal>
  <Box
    position="fixed"
    top={4}
    right={4}
    zIndex={9999}
    display="flex"
    flexDirection="column"
    gap="2"
    maxW="400px"
  >
    {visibleAlerts.map((alert, index) => (
      <motion.div
        key={alert.id}
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ 
          opacity: index < 3 ? 1 : 0.8,
          x: 0,
          scale: index < 3 ? 1 : 0.95,
          y: index * -2  // Slight stagger
        }}
        exit={{ opacity: 0, x: 100, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <AlertDisplay
          alert={alert}
          variant="card"
          size="sm"
          showActions
          progress={progress[alert.id]}
          onDismiss={() => actions.dismiss(alert.id)}
        />
      </motion.div>
    ))}
  </VStack>
</Portal>
```

**2.3. ELIMINAR código de header/collapse:**
- ❌ Remover `<CardWrapper>` con header
- ❌ Remover `<Collapsible>` wrapping
- ❌ Remover `isCollapsed` state
- ❌ Remover botones de expand/collapse
- ✅ MANTENER Portal, position logic, bulk actions (moverlas al NotificationCenter)

---

### Fase 3: Extender AlertDisplay con progress bar

**Cambios en `AlertDisplay.tsx`:**

```typescript
// 🆕 AÑADIR prop para progress
export interface AlertDisplayProps {
  // ... props existentes ...
  progress?: number;  // 0-100, para progress bar
}

// 🆕 AÑADIR progress bar rendering
const renderProgressBar = () => {
  if (!progress || alert.status !== 'active') return null;
  
  return (
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      h="2px"
      bg="gray.200"
      overflow="hidden"
    >
      <Box
        h="full"
        bg={`${severityColor}.500`}
        w={`${progress}%`}
        transition="width 0.1s linear"
      />
    </Box>
  );
};

// EN EL RETURN:
<CardWrapper position="relative">
  {/* ... contenido existente ... */}
  {renderProgressBar()}
</CardWrapper>
```

---

### Fase 4: Crear NotificationCenter component (NUEVO)

**Archivo:** `src/shared/alerts/components/NotificationCenter.tsx`

```typescript
import React, { memo, useMemo, useCallback, useState } from 'react';
import {
  Drawer,
  VStack,
  HStack,
  Text,
  Input,
  Badge,
  Tabs,
  Button
} from '@chakra-ui/react';
import { useAlertsState, useAlertsActions } from '../AlertsProvider';
import { AlertDisplay } from './AlertDisplay';
import type { Alert, AlertSeverity } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter = memo(function NotificationCenter({
  isOpen,
  onClose
}: NotificationCenterProps) {
  const { alerts, stats } = useAlertsState();
  const actions = useAlertsActions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'critical' | 'acknowledged'>('all');
  
  // 🎯 OPTIMIZADO: Filter + search con useMemo
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    
    // Filter by tab
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(a => !a.readAt);
        break;
      case 'critical':
        filtered = filtered.filter(a => a.severity === 'critical');
        break;
      case 'acknowledged':
        filtered = filtered.filter(a => a.status === 'acknowledged');
        break;
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term)
      );
    }
    
    // Exclude archived
    filtered = filtered.filter(a => !a.archivedAt);
    
    return filtered;
  }, [alerts, activeFilter, searchTerm]);
  
  // 🎯 OPTIMIZADO: Group by timeline
  const timelineGroups = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      today: filteredAlerts.filter(a => a.createdAt >= todayStart),
      yesterday: filteredAlerts.filter(a => 
        a.createdAt >= yesterdayStart && a.createdAt < todayStart
      ),
      thisWeek: filteredAlerts.filter(a => 
        a.createdAt >= weekStart && a.createdAt < yesterdayStart
      ),
      older: filteredAlerts.filter(a => a.createdAt < weekStart)
    };
  }, [filteredAlerts]);
  
  // 🎯 OPTIMIZADO: Callbacks estables
  const handleMarkAllRead = useCallback(() => {
    filteredAlerts
      .filter(a => !a.readAt)
      .forEach(a => actions.markAsRead(a.id));
  }, [filteredAlerts, actions]);
  
  const handleClearAll = useCallback(() => {
    filteredAlerts.forEach(a => actions.archive(a.id));
  }, [filteredAlerts, actions]);
  
  return (
    <Drawer.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} placement="right" size="md">
      <Drawer.Backdrop />
      <Drawer.Content>
        <Drawer.Header>
          <HStack justify="space-between">
            <Text fontWeight="bold">Notificaciones</Text>
            <Badge colorScheme="red">{stats.unread}</Badge>
          </HStack>
        </Drawer.Header>
        
        <Drawer.Body>
          {/* Search */}
          <Input
            placeholder="Buscar notificaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            mb={4}
          />
          
          {/* Tabs */}
          <Tabs.Root value={activeFilter} onValueChange={(v) => setActiveFilter(v.value)}>
            <Tabs.List>
              <Tabs.Trigger value="all">Todas</Tabs.Trigger>
              <Tabs.Trigger value="unread">No leídas</Tabs.Trigger>
              <Tabs.Trigger value="critical">Críticas</Tabs.Trigger>
              <Tabs.Trigger value="acknowledged">Reconocidas</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
          
          {/* Timeline Groups */}
          <VStack gap={4} mt={4} align="stretch">
            {timelineGroups.today.length > 0 && (
              <TimelineGroup label="Hoy" alerts={timelineGroups.today} />
            )}
            {timelineGroups.yesterday.length > 0 && (
              <TimelineGroup label="Ayer" alerts={timelineGroups.yesterday} />
            )}
            {timelineGroups.thisWeek.length > 0 && (
              <TimelineGroup label="Esta semana" alerts={timelineGroups.thisWeek} />
            )}
            {timelineGroups.older.length > 0 && (
              <TimelineGroup label="Anterior" alerts={timelineGroups.older} />
            )}
          </VStack>
        </Drawer.Body>
        
        <Drawer.Footer>
          <HStack justify="space-between" w="full">
            <Button size="sm" onClick={handleMarkAllRead}>
              Marcar todo como leído
            </Button>
            <Button size="sm" variant="ghost" onClick={handleClearAll}>
              Limpiar todo
            </Button>
          </HStack>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  );
});

// Helper component
function TimelineGroup({ label, alerts }: { label: string; alerts: Alert[] }) {
  const actions = useAlertsActions();
  
  return (
    <VStack align="stretch" gap={2}>
      <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
        {label}
      </Text>
      {alerts.map(alert => (
        <AlertDisplay
          key={alert.id}
          alert={alert}
          variant="inline"
          size="sm"
          showActions
          onAcknowledge={actions.acknowledge}
          onResolve={actions.resolve}
          onDismiss={actions.dismiss}
        />
      ))}
    </VStack>
  );
}
```

---

### Fase 5: Integrar NotificationCenter con badges

**Cambios en `AlertBadge.tsx`:**

```typescript
// 🆕 AÑADIR click handler para abrir drawer
export function NavAlertBadge({ count, onClick }: { count: number; onClick?: () => void }) {
  const { openNotificationCenter } = useAlertsActions();
  
  const handleClick = useCallback(() => {
    openNotificationCenter();
    onClick?.();
  }, [openNotificationCenter, onClick]);
  
  return (
    <Badge
      colorScheme={count > 0 ? 'red' : 'gray'}
      cursor="pointer"
      onClick={handleClick}
      data-testid="nav-alert-badge"
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
}
```

**Actualizar App.tsx para incluir NotificationCenter:**

```tsx
import { NotificationCenter } from '@/shared/alerts/components/NotificationCenter';

// EN EL RENDER:
<AlertsProvider>
  <AutoGlobalAlertsDisplay />  {/* Toast stack */}
  <NotificationCenter />        {/* Drawer (controlado por provider state) */}
  {/* REMOVED: <Toaster /> */}
</AlertsProvider>
```

---

## 🗄️ Cambios en Supabase Schema

**Tabla `alerts` (si existe) - AÑADIR columnas:**

```sql
ALTER TABLE public.alerts
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Index para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_alerts_read_at ON public.alerts(read_at);
CREATE INDEX IF NOT EXISTS idx_alerts_snoozed_until ON public.alerts(snoozed_until);
CREATE INDEX IF NOT EXISTS idx_alerts_archived_at ON public.alerts(archived_at);
```

---

## 📝 Checklist de Implementación

### Fase 1: Types & Provider (1-2 horas)
- [ ] Extender `AlertStatus` con `'snoozed'`
- [ ] Añadir campos `readAt`, `snoozedUntil`, `archivedAt` en `Alert` interface
- [ ] Crear `ToastDurationConfig` type
- [ ] Extender `AlertsConfiguration`
- [ ] Añadir `isNotificationCenterOpen` state en provider
- [ ] Implementar `markAsRead()`, `snooze()`, `archive()` actions
- [ ] Implementar `openNotificationCenter()`, `closeNotificationCenter()`
- [ ] Actualizar `stats` con `unread` count
- [ ] Testing: Validar tipos con `tsc --noEmit`

### Fase 2: Toast Stack (2-3 horas)
- [ ] Instalar Framer Motion si no existe: `pnpm add framer-motion`
- [ ] Añadir `progress` state en `GlobalAlertsDisplay`
- [ ] Implementar timer para actualizar progress
- [ ] ELIMINAR header sticky de `GlobalAlertsDisplay`
- [ ] ELIMINAR `Collapsible` wrapping
- [ ] Cambiar layout a toast stack con `motion.div`
- [ ] Implementar animaciones enter/exit con Framer Motion
- [ ] Ajustar positioning (siempre top-right, no configurable)
- [ ] Testing: Validar animaciones en navegador

### Fase 3: Progress Bar (1 hora)
- [ ] Añadir `progress?: number` prop en `AlertDisplay`
- [ ] Implementar `renderProgressBar()` helper
- [ ] Integrar progress bar en render (position: absolute)
- [ ] Ajustar colores por severity
- [ ] Testing: Validar progress visual

### Fase 4: Notification Center (3-4 horas)
- [ ] Crear `NotificationCenter.tsx` component
- [ ] Implementar drawer con Chakra Drawer
- [ ] Añadir search input con estado local
- [ ] Implementar tabs (All, Unread, Critical, Acknowledged)
- [ ] Crear timeline grouping logic (`useMemo`)
- [ ] Implementar `TimelineGroup` helper component
- [ ] Añadir bulk actions (Mark all read, Clear all)
- [ ] Optimizar con `useCallback`/`useMemo`
- [ ] Testing: Validar filtros y búsqueda

### Fase 5: Badge Integration (30 min)
- [ ] Actualizar `NavAlertBadge` con `onClick` handler
- [ ] Conectar badge con `openNotificationCenter()`
- [ ] Actualizar `SidebarAlertBadge` similar
- [ ] Testing: Click badge → drawer opens

### Fase 6: App.tsx Cleanup (15 min)
- [ ] REMOVER `<Toaster />` import y usage
- [ ] Añadir `<NotificationCenter />` import
- [ ] Integrar `<NotificationCenter />` en render
- [ ] Testing: Validar no hay errores de compilación

### Fase 7: Supabase (30 min - OPCIONAL)
- [ ] Ejecutar migration SQL para añadir columnas
- [ ] Verificar indexes creados
- [ ] Testing: Query alerts con nuevos campos

### Fase 8: TypeScript Validation (15 min)
- [ ] Ejecutar `pnpm -s exec tsc --noEmit`
- [ ] Corregir errores de tipos
- [ ] Validar 0 errores

### Fase 9: Visual Testing Setup (1 hora)
- [ ] Instalar playwright-visual: `pnpm add -D playwright-visual`
- [ ] Configurar en `playwright.config.ts`
- [ ] Ejecutar tests: `pnpm test:e2e tests/e2e/alerts-visual-testing.spec.ts`
- [ ] Generar baselines: `pnpm test:e2e --update-snapshots`
- [ ] Validar tests pasan

---

## 🎯 Resumen de Cambios

### Archivos MODIFICADOS (no crear nuevos):
1. ✏️ `src/shared/alerts/types.ts` - Extender tipos
2. ✏️ `src/shared/alerts/AlertsProvider.tsx` - Añadir nuevas acciones
3. ✏️ `src/shared/alerts/components/GlobalAlertsDisplay.tsx` - Transformar en toast stack
4. ✏️ `src/shared/alerts/components/AlertDisplay.tsx` - Añadir progress bar
5. ✏️ `src/shared/alerts/components/AlertBadge.tsx` - Integrar con drawer
6. ✏️ `src/App.tsx` - Remover Toaster, añadir NotificationCenter

### Archivos NUEVOS (solo 1):
1. 🆕 `src/shared/alerts/components/NotificationCenter.tsx` - Drawer component

### Archivos ELIMINADOS:
- ❌ NINGUNO (no eliminamos código, solo modificamos)

---

**Total estimado:** 8-10 horas de implementación + 2-3 horas de testing

**Prioridad:** 🔥 ALTA - Mejora crítica de UX
