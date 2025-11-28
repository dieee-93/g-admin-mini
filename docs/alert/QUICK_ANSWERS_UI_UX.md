# 🎯 Respuestas Rápidas: Alertas UI/UX + Testing

**Fecha:** Enero 2025  
**Contexto:** Post-refactoring V2 (eliminación 1,073 líneas duplicadas)  

---

## ❓ Pregunta 1: ¿Sirve Playwright para testear diseño de interfaces?

### ✅ SÍ, CON CONFIGURACIÓN ADICIONAL

**Estado actual de Playwright en G-Mini:**
```typescript
// ✅ playwright.config.ts EXISTE y está configurado
- Base URL: http://localhost:5173
- Test dir: ./tests/e2e
- Screenshots: Sí (on failure)
- Videos: Sí (on retry)
- Traces: Sí (on failure)
- Tests existentes: 9 archivos (navigation, smoke, achievements, etc.)
```

**¿Qué puede hacer Playwright para testing de diseño?**

#### 1. ✅ Testing Funcional de UI (Ya configurado)
```typescript
// tests/e2e/alerts-functional.spec.ts
test('Toast aparece cuando hay stock crítico', async ({ page }) => {
  await page.goto('/admin/supply-chain/materials');
  await page.click('[data-testid="create-material"]');
  await page.fill('input[name="stock"]', '2');
  await page.fill('input[name="minimum"]', '10');
  await page.click('button[type="submit"]');
  
  // Verificar toast
  await expect(page.locator('[data-toast="critical"]')).toBeVisible();
  await expect(page.locator('[data-toast="critical"]')).toContainText('Stock Crítico');
});
```

#### 2. ⚠️ Visual Regression Testing (Requiere instalación)

**Opción A: Percy.io (Recomendado para empresas)**
```bash
pnpm add -D @percy/cli @percy/playwright
```

```typescript
// tests/e2e/alerts-visual.spec.ts
import percySnapshot from '@percy/playwright';

test('Toast design consistency', async ({ page }) => {
  await page.goto('/admin/supply-chain/materials');
  await triggerCriticalStockAlert();
  
  // Captura baseline visual
  await percySnapshot(page, 'Critical Toast - Desktop');
});
```

**Pros:** Dashboard online, comparación visual automática, CI/CD integration  
**Cons:** Servicio pago ($), requiere cuenta Percy

---

**Opción B: Playwright-Visual (Open Source)**
```bash
pnpm add -D playwright-visual
```

```typescript
import { compareScreenshots } from 'playwright-visual';

test('Toast visual regression', async ({ page }) => {
  await page.goto('/admin/supply-chain/materials');
  await triggerCriticalStockAlert();
  
  // Compara con baseline
  await compareScreenshots(page, 'critical-toast', {
    threshold: 0.05  // 5% diferencia permitida
  });
});
```

**Pros:** Gratis, self-hosted, control total  
**Cons:** Mantenimiento de baselines manual, sin dashboard

---

**Opción C: Native Playwright Screenshots (Básico)**
```typescript
test('Toast screenshot comparison', async ({ page }) => {
  await page.goto('/admin/supply-chain/materials');
  await triggerCriticalStockAlert();
  
  // Captura screenshot
  await expect(page.locator('[data-toast="critical"]')).toHaveScreenshot('critical-toast.png', {
    maxDiffPixels: 100  // Tolerancia de píxeles diferentes
  });
});
```

**Pros:** No requiere instalación adicional  
**Cons:** Básico, sin dashboard, comparación local

---

### 🎯 Recomendación para G-Mini

**Short term (1-2 semanas):**
- ✅ Usar Playwright nativo con `toHaveScreenshot()` para visual regression básico
- ✅ Tests funcionales de interacción (click, hover, dismiss)
- ✅ Tests de accesibilidad (ARIA labels, keyboard navigation)

**Long term (Q1 2025):**
- 🔄 Evaluar Percy.io para visual regression enterprise-grade
- 🔄 CI/CD integration (GitHub Actions + Percy)
- 🔄 Dashboard de regresión visual

---

## ❓ Pregunta 2: ¿Cuál es un diseño moderno con UX amable para alertas?

### ✨ Propuesta Completa: Toast Stack Unificado (Vercel-inspired)

Ver documento completo: **[MODERN_UX_PROPOSAL.md](./MODERN_UX_PROPOSAL.md)**

### 🚨 Problema Actual Identificado

```tsx
// App.tsx - DUAL NOTIFICATION SYSTEM ❌
<AlertsProvider>
  <AutoGlobalAlertsDisplay />  // Sistema 1: Panel flotante
  <Toaster />                   // Sistema 2: Toast Chakra UI
</AlertsProvider>
```

**Pain Points:**
1. ❌ Usuario ve alertas duplicadas (panel top + toast floating)
2. ❌ Inconsistencia visual (2 estilos diferentes)
3. ❌ Confusión: No sabe dónde mirar
4. ❌ Complejidad: Mantener 2 sistemas de notificaciones

---

### ✅ Solución Propuesta: Sistema Unificado (3 componentes)

#### 1. 🍞 Toast Stack (Primario)
**Ubicación:** Top-right corner (fixed, z-index 9999)  
**Comportamiento:**
- Máximo 3 toasts visibles
- Nuevos toasts empujan viejos hacia abajo (smooth animation)
- Duration inteligente:
  - `info`: 3s auto-dismiss
  - `success`: 3s auto-dismiss
  - `warning`: 5s (dismissable)
  - `error`: 8s (dismissable)
  - `critical`: ∞ (requiere acción)

**Ejemplo Visual:**
```
Top-right corner:
┌─────────────────────────────────┐
│ 🔴 CRITICAL (sticky)           │ ← Nunca auto-dismiss
├─────────────────────────────────┤
│ 🟠 ERROR (8s) ━━━━━━ 50% ━━━━  │ ← Progress bar
├─────────────────────────────────┤
│ 🟡 WARNING (5s) ━━━━━━━ 75% ━━ │ ← Dismissable
└─────────────────────────────────┘
```

#### 2. 🔔 Notification Center (Secundario)
**Ubicación:** Drawer lateral (slide-in desde right)  
**Activador:** `<NavAlertBadge count={5} />` en Navbar  
**Contenido:**
- Historial completo (últimas 50 alertas)
- Timeline agrupado: Today / Yesterday / This Week / Older
- Filtros: All, Unread, Critical, Acknowledged
- Búsqueda por texto
- Acciones bulk: "Mark all as read", "Clear all"

**Ejemplo Visual:**
```
┌─────────────────────────────────────┐
│ Notificaciones              [5] 🔴  │
│ ─────────────────────────────────── │
│ [ Todas | Críticas | Leídas ]      │
│                                     │
│ HOY                                 │
│ ● 🔴 Stock Crítico | hace 2 min    │
│   Harina 000: 2kg (mín: 10kg)      │
│   [Ver Material] [Snooze]          │
│                                     │
│ ○ 🟡 Alerta ABC | hace 15 min      │
│   Material reclasificado a C       │
│                                     │
│ AYER                                │
│ ○ 🔵 Nuevo proveedor | 20:30       │
│   ...                               │
└─────────────────────────────────────┘
```

#### 3. 🔖 Badge System (Terciario)
**Variantes existentes (mantener):**
```tsx
<NavAlertBadge count={criticalCount} />     // Navbar global
<SidebarAlertBadge module="materials" />    // Por módulo
<StockAlertBadge item={material} />         // Inline tablas
<CriticalAlertBadge />                      // Pulso animado
```

**Comportamiento:**
- Contador solo muestra `unread` + `critical`
- Click abre Notification Center (filtrado por contexto)
- Pulso animado para alertas críticas

---

### 🎨 Design Tokens (Chakra v3)

```typescript
const toastTokens = {
  width: '360px',
  minHeight: '80px',
  padding: '16px',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(10px)',  // Glassmorphism
  
  severity: {
    critical: {
      bg: 'red.500',           // ❗ Fondo sólido rojo
      color: 'white',
      border: '2px solid red.700',
      animation: 'pulse 2s infinite'
    },
    error: {
      bg: 'red.50',
      border: '1px solid red.200',
      iconColor: 'red.500'
    },
    // ... (ver MODERN_UX_PROPOSAL.md para todos)
  }
};
```

---

### 🔄 Flujo de Usuario Completo

**Escenario:** Stock crítico detectado

1. **EventBus emite evento:**
```typescript
eventBus.emit('materials.stock.critical', {
  materialId: '123',
  name: 'Harina 000',
  current: 2,
  minimum: 10
});
```

2. **Toast aparece (top-right, 8s):**
```
┌─────────────────────────────────────┐
│ 🔴 Stock Crítico                    │
│ Harina 000: 2kg restantes           │
│ ┌──────────┐  ┌──────────────────┐ │
│ │ Ver Ahora│  │ Snooze 1h       │ │
│ └──────────┘  └──────────────────┘ │
│ ━━━━━━━━━━━━ 75% ━━━━━━━━━━━━━━━━│
└─────────────────────────────────────┘
```

3. **Usuario interactúa:**
- **Opción A:** Ignora → Auto-dismiss (8s) → Va a Notification Center
- **Opción B:** Click "Ver Ahora" → Navigate `/materials/123` → Alert marca `resolved`
- **Opción C:** Click "Snooze 1h" → Desaparece, reaparece en 1h si no se resuelve
- **Opción D:** Click "X" → Marca `acknowledged`, va al centro

4. **Badge actualiza:**
```tsx
<NavAlertBadge count={5} />  // 5 alertas unread/critical
```

5. **Notification Center guarda historial:**
- Timeline: "HOY" → 🔴 Stock Crítico | hace 30s
- Estado: `unread` → `acknowledged` → `resolved`
- Acción: Click "Ver Material" registrado

---

### 📊 Comparación: Antes vs Después

| Aspecto | ❌ Sistema Actual | ✅ Sistema Propuesto |
|---------|-------------------|----------------------|
| **Sistemas** | 2 (AlertsProvider + Toaster) | 1 (UnifiedToast + Center) |
| **Ubicación** | Top bar + Floating random | Top-right consistente |
| **Persistencia** | Configurable (confuso) | Inteligente por severidad |
| **Historial** | ❌ No disponible | ✅ Notification Center |
| **Acciones inline** | ⚠️ Parcial | ✅ Todas las alertas |
| **Agrupación** | ❌ No | ✅ Stacking automático |
| **Consistencia** | ❌ Baja (2 estilos) | ✅ Alta (1 sistema) |

---

### 🛠️ Plan de Implementación (6-8 días)

**Fase 1: UnifiedToast Component (2 días)**
- [ ] Crear `UnifiedToast.tsx` con Chakra v3 + Framer Motion
- [ ] `ToastManager` Zustand store
- [ ] Duration inteligente por severidad
- [ ] Progress bar animado
- [ ] Stacking behavior (max 3 visible)

**Fase 2: Notification Center (2-3 días)**
- [ ] `NotificationCenterDrawer.tsx` component
- [ ] Timeline agrupado (Today, Yesterday, etc.)
- [ ] Filtros (All, Unread, Critical)
- [ ] Búsqueda por texto
- [ ] Acciones bulk

**Fase 3: Badge Integration (1 día)**
- [ ] Conectar `NavAlertBadge` → open Center
- [ ] Pulso animado para critical
- [ ] Filtro por contexto en Center

**Fase 4: Migration (1 día)**
- [ ] Eliminar `GlobalAlertsDisplay`
- [ ] Eliminar `Toaster` de App.tsx
- [ ] Migrar eventos existentes
- [ ] E2E tests

**Fase 5: Visual Testing (1 día)**
- [ ] Playwright visual regression (Percy o nativo)
- [ ] Baseline screenshots
- [ ] Light/dark mode tests

---

## 🎯 Métricas de Éxito

**Cuantitativas:**
- ✅ **1** sistema de notificación (reducción de 2 → 1)
- ✅ **<300ms** tiempo de aparición de toast
- ✅ **100%** alertas con acciones inline
- ✅ **0** alertas duplicadas
- ✅ **95%+** test coverage (visual + functional)

**Cualitativas:**
- ✅ Usuario sabe dónde mirar (consistencia)
- ✅ Experiencia moderna (Vercel-like)
- ✅ Reducción de "alert fatigue"
- ✅ Acciones claras (snooze, resolve, dismiss)

---

## 📚 Recursos

- **[MODERN_UX_PROPOSAL.md](./MODERN_UX_PROPOSAL.md)** - Propuesta completa (este documento fue generado)
- **[ALERT_ARCHITECTURE_V2.md](./ALERT_ARCHITECTURE_V2.md)** - Arquitectura actual del sistema
- **[SMART_ALERTS_GUIDE.md](./SMART_ALERTS_GUIDE.md)** - Guía de implementación Layer 2
- **Inspiración:** Vercel Dashboard, Linear App, Notion

---

## 🚀 Próximos Pasos

1. **Review propuesta** con equipo de producto/diseño
2. **Aprobar design tokens** (colores, spacing, animations)
3. **Validar timeline** (6-8 días realista)
4. **Kick-off Fase 1** (crear UnifiedToast component)
5. **Setup visual testing** (Percy vs Playwright nativo)

---

**Documentación actualizada:** Enero 2025  
**Estado:** ✅ Propuesta lista para revisión  
**Próxima acción:** Aprobación de stakeholders
