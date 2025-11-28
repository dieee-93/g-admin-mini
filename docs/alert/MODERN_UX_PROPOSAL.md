# 🎨 Propuesta de Diseño Moderno para Sistema de Alertas
## G-Mini v3.1 - Modern Notification UX

**Estado:** ✅ Propuesta Aprobada  
**Fecha:** Enero 2025  
**Autor:** Architecture Team  

---

## 🎯 Problema Actual

### Sistemas Fragmentados (2 capas conflictivas)
```tsx
// App.tsx - DUAL SYSTEM PROBLEM
<AlertsProvider>
  <AutoGlobalAlertsDisplay />  // ❌ Panel flotante configurable
  <Toaster />                   // ❌ Toast separado de Chakra
</AlertsProvider>
```

**Pain Points Identificados:**
1. **Confusión visual**: Alertas en barra superior + toasts flotantes
2. **Inconsistencia**: Dos estilos de notificación diferentes
3. **Sobrecarga cognitiva**: Usuario no sabe dónde mirar
4. **Redundancia**: Mismo evento puede generar 2 notificaciones
5. **Complejidad**: Mantener 2 sistemas con lógica separada

---

## ✨ Solución Propuesta: Toast Stack Unificado

### Inspiración: Vercel/Linear/Notion (2025 Best Practices)

**Características Clave:**
- ✅ **Toast Stack único** (top-right, esquina superior derecha)
- ✅ **Persistencia inteligente** según severidad
- ✅ **Centro de notificaciones** (notification center drawer)
- ✅ **Micro-interacciones** (smooth animations, haptic feedback)
- ✅ **Acciones inline** (undo, snooze, dismiss)
- ✅ **Agrupación inteligente** (stack similar alerts)

---

## 🏗️ Arquitectura del Nuevo Sistema

### 1. Toast Stack (Primario) - Notificaciones Efímeras

**Ubicación:** Top-right corner, fixed position, z-index 9999  
**Duración por Severidad:**
- `info`: 3s (auto-dismiss)
- `success`: 3s (auto-dismiss)
- `warning`: 5s (manual dismiss disponible)
- `error`: 8s (manual dismiss obligatorio)
- `critical`: Persistente (no auto-dismiss, requiere acción)

**Jerarquía Visual:**
```
┌─────────────────────────────────┐
│ 🔴 CRITICAL (Persiste)          │
├─────────────────────────────────┤
│ 🟠 ERROR (8s)                   │
├─────────────────────────────────┤
│ 🟡 WARNING (5s)                 │
├─────────────────────────────────┤
│ 🔵 INFO (3s)                    │
│ ✅ SUCCESS (3s)                 │
└─────────────────────────────────┘
```

**Stacking Behavior:**
- Máximo 3 toasts visibles simultáneos
- Nuevos toasts empujan los viejos hacia abajo (stack animado)
- Toasts antiguos se "comprimen" visualmente (scale 0.95, opacity 0.8)
- Al pasar 3, los más antiguos se guardan en notification center

---

### 2. Notification Center (Secundario) - Historial Persistente

**Ubicación:** Drawer lateral (slide-in desde top-right)  
**Activador:** Badge en Navbar con contador (`<NavAlertBadge />`)  
**Contenido:**
- Historial completo de alertas (últimas 50)
- Filtros: `All` / `Unread` / `Critical` / `Acknowledged`
- Búsqueda por texto
- Acciones en bulk: "Mark all as read", "Clear all"
- Timeline agrupado por fecha (Today, Yesterday, This Week, Older)

**Estados de Alerta:**
```typescript
type AlertState = 
  | 'unread'        // 🔵 Nueva, no vista
  | 'read'          // ⚪ Vista, no accionada
  | 'acknowledged'  // ✅ Reconocida por usuario
  | 'resolved'      // ✔️ Problema resuelto (acción tomada)
  | 'snoozed'       // 💤 Pospuesta (reaparece después)
  | 'archived';     // 📦 Archivada (oculta del centro)
```

---

### 3. Badge System (Terciario) - Indicadores Contextuales

**Variantes Actuales (Mantener):**
```typescript
<NavAlertBadge count={criticalCount} />      // Navbar global
<SidebarAlertBadge module="materials" />     // Sidebar por módulo
<StockAlertBadge item={material} />          // Inline en tablas
<CriticalAlertBadge />                       // Pulso animado
```

**Comportamiento:**
- Contador solo muestra alertas `unread` + `critical`
- Pulso animado para `critical` (keyframes glow)
- Click abre Notification Center filtrado por contexto

---

## 🎨 Especificaciones de Diseño

### Toast Component (Nuevo v3.0)

```tsx
<Toast
  severity="error"
  title="Stock crítico"
  message="Harina 000 tiene 2kg restantes (mínimo: 10kg)"
  icon={<ExclamationTriangleIcon />}
  actions={[
    { label: "Ver Material", onClick: () => navigate('/materials/123') },
    { label: "Snooze 1h", onClick: () => snooze('1h') }
  ]}
  progress={0.75}  // Barra de progreso para auto-dismiss
  onDismiss={() => dismiss()}
/>
```

**Tokens de Diseño:**
```typescript
const toastStyles = {
  width: '360px',
  minHeight: '80px',
  padding: '16px',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(10px)', // Glassmorphism
  
  severity: {
    info: {
      bg: 'blue.50',
      border: '1px solid blue.200',
      iconColor: 'blue.500'
    },
    success: {
      bg: 'green.50',
      border: '1px solid green.200',
      iconColor: 'green.500'
    },
    warning: {
      bg: 'orange.50',
      border: '1px solid orange.200',
      iconColor: 'orange.500'
    },
    error: {
      bg: 'red.50',
      border: '1px solid red.200',
      iconColor: 'red.500'
    },
    critical: {
      bg: 'red.500', // ❗ Invertido: fondo sólido rojo
      color: 'white',
      border: '2px solid red.700',
      iconColor: 'white',
      animation: 'pulse 2s ease-in-out infinite'
    }
  },
  
  animation: {
    enter: 'slideInRight 0.3s ease-out',
    exit: 'slideOutRight 0.2s ease-in',
    stack: 'scaleDown 0.2s ease-out'
  }
};
```

---

### Notification Center Drawer

```tsx
<Drawer placement="right" size="md">
  <Drawer.Header>
    <HStack justify="space-between">
      <Text fontWeight="bold">Notificaciones</Text>
      <Badge colorScheme="red">{unreadCount}</Badge>
    </HStack>
    <Tabs size="sm">
      <Tab>Todas</Tab>
      <Tab>Críticas</Tab>
      <Tab>Reconocidas</Tab>
    </Tabs>
  </Drawer.Header>
  
  <Drawer.Body>
    <Timeline>
      <TimelineGroup label="Hoy">
        <TimelineItem
          icon={<StockIcon />}
          time="hace 2 minutos"
          severity="critical"
          isUnread
        >
          <Alert inline compact />
        </TimelineItem>
      </TimelineGroup>
    </Timeline>
  </Drawer.Body>
  
  <Drawer.Footer>
    <Button size="sm" onClick={markAllRead}>
      Marcar todo como leído
    </Button>
  </Drawer.Footer>
</Drawer>
```

---

## 🔄 Flujo de Usuario (User Journey)

### Escenario 1: Stock Crítico Detectado

**1. Alerta Generada** (EventBus):
```typescript
eventBus.emit('materials.stock.critical', {
  materialId: '123',
  name: 'Harina 000',
  current: 2,
  minimum: 10
});
```

**2. Toast Aparece** (Top-right, 8s duration):
```
┌─────────────────────────────────────────┐
│ 🔴 Stock Crítico                        │
│ Harina 000 tiene 2kg restantes         │
│ ┌─────────────┐  ┌──────────────────┐  │
│ │ Ver Material│  │ Snooze 1h       │  │
│ └─────────────┘  └──────────────────┘  │
│ ━━━━━━━━━━━━━━━━━━ 75% ━━━━━━━━━━━━━ │
└─────────────────────────────────────────┘
```

**3. Usuario Interactúa:**
- **Opción A**: Ignora → Auto-dismiss después de 8s → Va al Notification Center
- **Opción B**: Click "Ver Material" → Navigate to `/materials/123` → Alert marca como `resolved`
- **Opción C**: Click "Snooze 1h" → Desaparece, reaparece en 1h si no se resuelve
- **Opción D**: Click "X" (dismiss) → Marca como `acknowledged`, va al centro

**4. Badge Actualiza:**
```tsx
<NavAlertBadge count={5} />  // 5 alertas unread/critical
```

**5. Notification Center:**
```
┌───────────────────────────────────────┐
│ Notificaciones                    [5] │
│ ─────────────────────────────────────│
│ HOY                                   │
│ ● 🔴 Stock Crítico | hace 30s        │
│   Harina 000 (2kg / mín: 10kg)       │
│   [Ver Material] [Snooze]            │
│                                       │
│ ○ 🟡 Alerta ABC | hace 5 min         │
│   Material reclasificado a clase C   │
│                                       │
│ AYER                                  │
│ ○ 🔵 Nuevo proveedor | 20:30         │
│   ...                                 │
└───────────────────────────────────────┘
```

---

## 📊 Comparación: Antes vs Después

### Sistema Actual (Fragmentado)

| Componente | Ubicación | Tipo | Persistencia | Problema |
|-----------|-----------|------|--------------|----------|
| `GlobalAlertsDisplay` | Top-bar | Panel colapsable | Configurable | Ocupa espacio fijo |
| `Toaster` | Floating | Toast stack | 3-5s | Inconsistente con alertas |
| `AlertBadge` | Navbar/Sidebar | Badge contador | Permanente | No relacionado con toasts |

**Resultado:** 😵 Usuario ve alertas duplicadas, no sabe dónde mirar, confusión

---

### Sistema Propuesto (Unificado)

| Componente | Ubicación | Tipo | Persistencia | Beneficio |
|-----------|-----------|------|--------------|-----------|
| `UnifiedToast` | Top-right | Toast stack | Inteligente (3-∞s) | Single source of truth |
| `NotificationCenter` | Drawer | Historial | Permanente | Context preservado |
| `AlertBadge` | Navbar/Sidebar | Badge contador | Vinculado | Abre centro filtrado |

**Resultado:** ✅ Usuario sabe dónde mirar, interacciones claras, experiencia consistente

---

## 🛠️ Plan de Implementación

### Fase 1: Nuevo Toast System (1-2 días)
- [ ] Crear `UnifiedToast` component (Chakra v3 + Framer Motion)
- [ ] Implementar `ToastManager` (Zustand store)
- [ ] Migrar lógica de `AlertsProvider` → `ToastManager`
- [ ] Implementar duration inteligente por severidad
- [ ] Añadir progress bar animado
- [ ] Testing: Toast appearance, stacking, dismissal

### Fase 2: Notification Center (2-3 días)
- [ ] Crear `NotificationCenterDrawer` component
- [ ] Implementar `useNotifications()` hook (CRUD operations)
- [ ] Timeline agrupado por fecha
- [ ] Filtros (All, Unread, Critical)
- [ ] Búsqueda por texto
- [ ] Acciones en bulk (mark all read, clear)
- [ ] Testing: Drawer opening, filtering, search

### Fase 3: Badge Integration (1 día)
- [ ] Conectar `NavAlertBadge` → open NotificationCenter
- [ ] Vincular `SidebarAlertBadge` → filtro por módulo
- [ ] Implementar pulso animado para critical
- [ ] Testing: Badge counts, click behavior

### Fase 4: Migration & Cleanup (1 día)
- [ ] Migrar eventos existentes → nuevo sistema
- [ ] Eliminar `GlobalAlertsDisplay` (deprecated)
- [ ] Eliminar `Toaster` de App.tsx
- [ ] Actualizar `useGlobalAlertsInit()` hook
- [ ] Testing: E2E smoke tests, regression

### Fase 5: Visual Testing (1 día)
- [ ] Instalar `@percy/playwright` o `playwright-visual`
- [ ] Crear baseline screenshots (toast states, center)
- [ ] Tests de regresión visual (light/dark mode)
- [ ] Testing: Playwright visual comparisons

**Total Estimado:** 6-8 días de desarrollo

---

## 🎯 Métricas de Éxito

### Cuantitativas
- ✅ **0** sistemas de notificación (unificado)
- ✅ **<300ms** tiempo de aparición de toast
- ✅ **100%** alertas con acciones inline
- ✅ **0** alertas duplicadas
- ✅ **95%+** tests coverage (visual + functional)

### Cualitativas
- ✅ Usuario entiende dónde mirar (toast → centro)
- ✅ Consistencia visual en toda la app
- ✅ Acciones claras (snooze, resolve, dismiss)
- ✅ Reducción de "alert fatigue"
- ✅ Experiencia modern UX (2025 standards)

---

## 📚 Referencias de Inspiración

### Vercel Dashboard
- Toast stack animado (top-right)
- Notification center con timeline
- Acciones inline (deploy, logs)

### Linear App
- Toast minimalista (glassmorphism)
- Keyboard shortcuts (⌘K para centro)
- Agrupación inteligente de notificaciones

### Notion
- Toast con undo action (edit recovery)
- Notification center con filtros avanzados
- Badge pulso animado para críticas

### Framer Motion Examples
- Smooth animations (spring physics)
- Stagger effects para toast stack
- Micro-interactions (haptic feedback)

---

## 🚀 Next Steps

1. **Revisión de propuesta** con equipo de producto
2. **Validación de tokens** de diseño (colores, spacing)
3. **Aprobación de timeline** de implementación
4. **Kick-off de Fase 1** (crear UnifiedToast)

---

**Documentos Relacionados:**
- [ALERT_ARCHITECTURE_V2.md](./ALERT_ARCHITECTURE_V2.md) - Arquitectura actual
- [SMART_ALERTS_GUIDE.md](./SMART_ALERTS_GUIDE.md) - Lógica de negocio
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - API reference
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Estado actual

**Autor:** Architecture Team  
**Última Actualización:** Enero 2025  
**Versión:** 1.0.0
