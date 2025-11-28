# 🎯 PROMPT: Continuar Implementación del Dashboard

## 📍 CONTEXTO ACTUAL

### ✅ COMPLETADO (Fase 3 - Widgets via Hook Registry)

**10 widgets creados e inyectados exitosamente:**

1. **KPI Widgets (4):**
   - `src/modules/sales/widgets/RevenueStatWidget.tsx` (priority: 100)
   - `src/modules/sales/widgets/SalesStatWidget.tsx` (priority: 99)
   - `src/modules/staff/widgets/StaffStatWidget.tsx` (priority: 98)
   - `src/modules/materials/widgets/PendingOrdersWidget.tsx` (priority: 97)

2. **Chart Widgets (4):**
   - `src/modules/dashboard/widgets/SalesTrendChartWidget.tsx` (priority: 80)
   - `src/modules/dashboard/widgets/DistributionChartWidget.tsx` (priority: 79)
   - `src/modules/dashboard/widgets/RevenueAreaChartWidget.tsx` (priority: 70)
   - `src/modules/dashboard/widgets/MetricsBarChartWidget.tsx` (priority: 69)

3. **Insight Widgets (2):**
   - `src/modules/executive/widgets/PremiumCustomersInsight.tsx` (priority: 60)
   - `src/modules/executive/widgets/InventoryInsight.tsx` (priority: 59)

**Manifests actualizados:**
- ✅ `src/modules/sales/manifest.tsx`
- ✅ `src/modules/staff/manifest.tsx`
- ✅ `src/modules/materials/manifest.tsx`
- ✅ `src/modules/dashboard/manifest.tsx`
- ✅ `src/modules/executive/manifest.tsx`

---

## ❓ PREGUNTA ARQUITECTURAL CRÍTICA

**ANTES DE CONTINUAR, necesito entender la convención del proyecto:**

### ¿Cuándo usar Hook Registry vs Componentes Fijos?

**Hook Registry Pattern (`registry.addAction`):**
```tsx
// Ejemplo: Widget inyectado dinámicamente
registry.addAction(
  'dashboard.widgets',
  () => <RevenueStatWidget />,
  'sales',
  100
);
```

**Componente Fijo:**
```tsx
// Ejemplo: Componente hardcoded en JSX
<DashboardPage>
  <OperationalStatusWidget />
  <DynamicDashboardGrid />
</DashboardPage>
```

### 🤔 **MI DUDA:**

He observado que actualmente:
- ✅ **Widgets de métricas/analytics** → Hook Registry
- ✅ **Secciones de layout** → Componentes fijos (`AlertsAchievementsSection`, `CrossModuleInsights`)

**Pero NO está claro para estos 4 componentes ya creados:**

1. **`OperationalStatusWidget`** (Hero widget grande con estado operacional)
2. **`SmartAlertsBar`** (Barra colapsable de alertas)
3. **`QuickActionsWidget`** (Grid de botones de acciones rápidas)
4. **`ActivityFeedWidget`** (Timeline de eventos)

**¿Deberían inyectarse via Hook Registry o agregarse como componentes fijos?**

---

## 📋 OPCIONES PARA DECIDIR

### **Opción A: Componentes Fijos (Recomendado para Hero y Alerts)**

**Componentes fijos en page.tsx:**
- OperationalStatusWidget (Hero - siempre visible)
- SmartAlertsBar (Alerts - siempre visible si hay alertas)

**Via Hook Registry:**
- QuickActionsWidget (priority: 105)
- ActivityFeedWidget (priority: 50)

**Razón:** Hero y Alerts son parte fundamental del layout, no son "widgets modulares".

```tsx
// src/pages/admin/core/dashboard/page.tsx
<ContentLayout>
  {/* FIJO: Hero Widget */}
  <OperationalStatusWidget />

  {/* FIJO: Smart Alerts */}
  <SmartAlertsBar />

  {/* FIJO: Alerts & Achievements */}
  <AlertsAchievementsSection />

  {/* DINÁMICO: Widgets Grid con Hook Registry */}
  <DynamicDashboardGrid />

  {/* FIJO: Cross-Module Insights */}
  <CrossModuleInsights />
</ContentLayout>
```

---

### **Opción B: Todo via Hook Registry (Máxima flexibilidad)**

**Todos los componentes inyectados:**
- OperationalStatusWidget (priority: 120)
- SmartAlertsBar (priority: 115)
- QuickActionsWidget (priority: 105)
- ActivityFeedWidget (priority: 50)

**Razón:** Máxima modularidad - todo es dinámico y configurable.

**Problema:** DynamicDashboardGrid usa SimpleGrid, todos los widgets se renderizan en grid columns. ¿Cómo hacer que Hero ocupe ancho completo?

---

## 🎯 DECISIÓN REQUERIDA

**Por favor, responde:**

1. **¿Cuál es la convención del proyecto para Hook Registry?**
   - ¿Solo para widgets cross-module?
   - ¿Solo para componentes que varían por tenant/role?
   - ¿Para todo lo que puede ser "opcional"?

2. **¿Qué opción prefieres?**
   - Opción A (Híbrida: Hero+Alerts fijos, resto dinámico)
   - Opción B (Todo dinámico via Hook Registry)
   - Opción C (Otra configuración específica)

3. **Si eliges Opción B (todo dinámico):**
   - ¿Cómo manejar widgets de ancho completo en DynamicDashboardGrid?
   - ¿Modificar SimpleGrid para soportar col-span variable?
   - ¿O crear secciones separadas fuera del grid?

---

## 📦 ARCHIVOS RELEVANTES PARA CONTINUAR

### Componentes Ya Creados (listos para usar)
```
src/pages/admin/core/dashboard/components/
├── OperationalStatusWidget.tsx      ✅ Creado
├── SmartAlertsBar.tsx               ✅ Creado
├── QuickActionsWidget.tsx           ✅ Creado
├── ActivityFeedWidget.tsx           ✅ Creado
├── AlertsAchievementsSection.tsx    ✅ Creado e integrado
├── CrossModuleInsights.tsx          ✅ Creado e integrado
└── DynamicDashboardGrid.tsx         ✅ Creado e integrado
```

### Dashboard Page (para modificar)
```
src/pages/admin/core/dashboard/page.tsx
```

### Shared Widgets (base components)
```
src/shared/widgets/
├── StatCard.tsx        ✅ Base para KPIs
├── InsightCard.tsx     ✅ Base para insights
└── AlertCard.tsx       ✅ Base para alertas
```

### Manifests (si se requiere inyección)
```
src/modules/dashboard/manifest.tsx   ← Para QuickActions/Activity
src/modules/executive/manifest.tsx   ← Para OperationalStatus?
```

---

## 🚀 PRÓXIMOS PASOS (según decisión)

### **Si Opción A (Híbrida):**

1. **Actualizar `page.tsx`:**
   ```tsx
   import { OperationalStatusWidget, SmartAlertsBar } from './components';

   <ContentLayout>
     <OperationalStatusWidget />
     <SmartAlertsBar />
     <AlertsAchievementsSection />
     <DynamicDashboardGrid />
     <CrossModuleInsights />
   </ContentLayout>
   ```

2. **Crear wrappers para Hook Registry:**
   - `src/modules/dashboard/widgets/QuickActionsWidget.tsx` (wrapper)
   - `src/modules/dashboard/widgets/ActivityFeedWidget.tsx` (wrapper)

3. **Actualizar `dashboard/manifest.tsx`:**
   ```tsx
   const { QuickActionsWidget, ActivityFeedWidget } = await import('./widgets');

   registry.addAction('dashboard.widgets',
     () => <QuickActionsWidget />, 'dashboard', 105);

   registry.addAction('dashboard.widgets',
     () => <ActivityFeedWidget />, 'dashboard', 50);
   ```

---

### **Si Opción B (Todo dinámico):**

1. **Crear 4 wrappers en `src/modules/dashboard/widgets/`:**
   - OperationalStatusWidget.tsx (wrapper, priority: 120)
   - SmartAlertsBarWidget.tsx (wrapper, priority: 115)
   - QuickActionsWidget.tsx (wrapper, priority: 105)
   - ActivityFeedWidget.tsx (wrapper, priority: 50)

2. **Modificar `DynamicDashboardGrid.tsx`:**
   - Detectar widgets de ancho completo
   - Usar col-span={12} para Hero/Alerts
   - Mantener grid para widgets normales

3. **Actualizar manifest:**
   ```tsx
   const {
     OperationalStatusWidget,
     SmartAlertsBarWidget,
     QuickActionsWidget,
     ActivityFeedWidget
   } = await import('./widgets');

   // Inyectar los 4 con prioridades correctas
   ```

---

## 📝 INFORMACIÓN ADICIONAL

### Dashboard Original vs Actual

**Ver análisis completo en:** `DASHBOARD_COMPARISON_ANALYSIS.md`

**Diferencia clave:**
- **Original:** Hero + Alerts + Tabs (Overview/Analytics/Ops/Activity)
- **Actual:** 3 Sections verticales + DynamicDashboardGrid

---

## ✅ CHECKLIST PARA CONTINUAR

- [ ] Decidir estrategia: Opción A, B, o C
- [ ] Entender convención de Hook Registry del proyecto
- [ ] Implementar los 4 componentes según decisión
- [ ] Actualizar manifests si es necesario
- [ ] Actualizar page.tsx si es necesario
- [ ] Probar en navegador: `pnpm run dev`
- [ ] Verificar que se vean todos los widgets
- [ ] Conectar datos reales (actualmente mock data)

---

## 🎯 PROMPT PARA INICIAR NUEVA SESIÓN

```
Hola! Necesito continuar con la implementación del dashboard.

CONTEXTO:
- Ya tengo 10 widgets funcionando e inyectados via Hook Registry
- Faltan 4 componentes por integrar: OperationalStatusWidget, SmartAlertsBar,
  QuickActionsWidget, ActivityFeedWidget
- Estos 4 componentes YA ESTÁN CREADOS en src/pages/admin/core/dashboard/components/

PREGUNTA:
¿Cuál es la convención del proyecto G-Admin Mini para usar Hook Registry?
- ¿Qué tipo de componentes se inyectan dinámicamente?
- ¿Qué componentes van fijos en el JSX?

Lee el archivo: CONTINUE_DASHBOARD_IMPLEMENTATION.md

Basándote en la convención del proyecto, elige y ejecuta:
- Opción A (Híbrida: Hero+Alerts fijos, resto dinámico)
- Opción B (Todo dinámico via Hook Registry)
- O sugiere Opción C si hay una mejor forma

Luego implementa la solución completa para que el dashboard se vea como
el diseño en newdashboard/src/components/dashboard/Dashboard.tsx
```

---

**Documentos de referencia creados:**
- ✅ `DASHBOARD_WIDGETS_IMPLEMENTATION_SUMMARY.md` - Resumen de widgets creados
- ✅ `DASHBOARD_COMPARISON_ANALYSIS.md` - Análisis comparativo detallado
- ✅ `CONTINUE_DASHBOARD_IMPLEMENTATION.md` - Este archivo (prompt para continuar)

**Última actualización:** 2025-01-24
