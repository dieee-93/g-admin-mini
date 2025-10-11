# Materials Page UX/UI Improvement Roadmap

**Fecha:** 2025-10-03
**Módulo:** Materials (StockLab)
**Versión:** v2.1
**Estado:** 📋 Planning
**Autor:** Claude Code + Diego

---

## 📊 Executive Summary

Este documento detalla un plan completo de mejoras UX/UI para la página Materials de G-Admin Mini, manteniendo el minimalismo característico del sistema mientras se optimiza la experiencia de usuario, accesibilidad y consistencia con los patrones establecidos en v2.1.

### Métricas de Impacto Esperado

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|---------|
| Espacio vertical de alertas | ~300px | ~80px | -73% |
| Touch target size (mobile) | 32px | 48px | +50% |
| Tiempo de escaneo visual | ~8s | ~3s | -62% |
| Accesibilidad WCAG | AA parcial | AA completo | 100% |
| Consistencia con G-Admin v2.1 | 70% | 95% | +25% |
| Performance (>50 items) | Lag visible | Smooth | N/A |

---

## 🎯 Objetivos del Proyecto

### Objetivos Principales

1. **Mejorar Jerarquía Visual**
   - Reducir competencia por atención entre alertas
   - Clarificar navegación de tabs
   - Diferenciar items críticos vs normales

2. **Optimizar Espaciado y Respiración**
   - Aumentar legibilidad de cards
   - Mejorar touch targets en mobile
   - Balancear densidad de información

3. **Garantizar Consistencia con G-Admin v2.1**
   - Migrar a sistema `notify.*`
   - Usar componentes semánticos de Chakra v3
   - Integrar EventBus en operaciones críticas

4. **Mejorar Accesibilidad**
   - Cumplir WCAG 2.1 AA completo
   - Implementar ARIA roles y labels
   - Mejorar contraste y feedback visual

5. **Optimizar para Mobile-First**
   - Touch targets >48px
   - Layout adaptativo
   - Reducir scroll innecesario

### Objetivos Secundarios

- Implementar virtualización para listas >50 items
- Migrar a sistema de iconos G-Admin optimizado
- Preparar base para futuras features (drag-and-drop, bulk edit)

---

## 📁 Análisis de Situación Actual

### Estructura de la Página

```
MaterialsPage.tsx
├── 1. Alert: Capabilities Required (condicional)
├── 2. Alert: Modo Offline (condicional)
├── 3. MaterialsMetrics (4 cards KPIs)
├── 4. MaterialsAlerts (sistema de alertas inteligentes)
├── 5. Section: Gestión de Inventario
│   ├── Tabs: Inventario | Análisis ABC | Compras
│   └── InventoryTab
│       └── Lista de MaterialCard (10-100+ items)
└── 6. Section: Acciones Rápidas (4-8 botones)
```

### Archivos Involucrados

| Archivo | Líneas | Responsabilidad | Estado Actual |
|---------|--------|-----------------|---------------|
| `src/pages/admin/supply-chain/materials/page.tsx` | 160 | Layout principal | ✅ Bueno |
| `src/pages/admin/supply-chain/materials/components/MaterialsMetrics.tsx` | 120 | KPIs dashboard | ✅ Bueno |
| `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialsManagement.tsx` | 64 | Tabs wrapper | ⚠️ Usa Buttons |
| `src/pages/admin/supply-chain/materials/components/MaterialsManagement/InventoryTab.tsx` | 166 | Lista de items | ⚠️ Densa, sin agrupación |
| `src/pages/admin/supply-chain/materials/components/MaterialsActions.tsx` | 90 | Botones acción | ⚠️ Sin priorización |
| `src/pages/admin/supply-chain/materials/hooks/useMaterialsPage.ts` | 661 | Lógica de página | ✅ Bueno |

**Total:** ~1,261 líneas de código afectadas

### Problemas Identificados por Prioridad

#### 🔴 Críticos (Impiden uso eficiente)

1. **Sobrecarga de Alertas**
   - **Ubicación:** `page.tsx` líneas 94-106, 116-121
   - **Problema:** Hasta 5 alertas apiladas verticalmente
   - **Impacto:** Métricas importantes quedan "below the fold" en mobile
   - **Solución:** CollapsibleAlertStack component (nuevo)

2. **Tabs sin Semántica**
   - **Ubicación:** `MaterialsManagement.tsx` líneas 26-44
   - **Problema:** Implementados con `<Button>` en lugar de `<Tabs>`
   - **Impacto:** Sin ARIA, sin navegación por teclado, confusión visual
   - **Solución:** Migrar a `Tabs.Root` de Chakra v3

3. **Sin Agrupación Visual por Criticidad**
   - **Ubicación:** `InventoryTab.tsx` líneas 89-156
   - **Problema:** Todos los items mezclados, criticidad solo con icono pequeño
   - **Impacto:** Usuario debe buscar items críticos manualmente
   - **Solución:** Separar en secciones: Crítico → Stock Bajo → Saludable

#### 🟡 Importantes (Reducen calidad UX)

4. **Cards muy Densas**
   - **Ubicación:** `InventoryTab.tsx` líneas 94-154
   - **Problema:** `gap="xs"` (4px), texto apretado, botones pequeños
   - **Impacto:** Difícil lectura rápida, touch targets <48px
   - **Solución:** Aumentar gaps, card size="md", botones responsive

5. **Uso de toaster.create() en lugar de notify.***
   - **Ubicación:** `InventoryTab.tsx` líneas 29-34, 37-42, 146-151
   - **Problema:** No sigue convenciones G-Admin v2.1
   - **Impacto:** Inconsistencia de código, sin helpers de dominio
   - **Solución:** Migrar a `notify.success()`, `notify.warning()`, etc.

6. **MaterialsActions sin Jerarquía**
   - **Ubicación:** `MaterialsActions.tsx` líneas 35-80
   - **Problema:** 8 botones con mismo peso visual
   - **Impacto:** Usuario no sabe qué acción es principal
   - **Solución:** Hero button + grid de secundarias

#### 🟢 Mejoras (Optimizaciones)

7. **Sin Virtualización para Listas Largas**
   - **Ubicación:** `InventoryTab.tsx` línea 89
   - **Problema:** Renderiza todos los items (100+) sin lazy loading
   - **Impacto:** Performance degrada con inventarios grandes
   - **Solución:** `VirtualGrid` para >50 items

8. **Sin EventBus en Operaciones**
   - **Ubicación:** `InventoryTab.tsx` líneas 25-46
   - **Problema:** No emite eventos `materials.stock_updated`
   - **Impacto:** Otros módulos no se enteran de cambios
   - **Solución:** Integrar `emitEvent()` en `handleQuickUpdate`

9. **Iconos sin Sistema Optimizado**
   - **Ubicación:** `MaterialsActions.tsx`, `InventoryTab.tsx`
   - **Problema:** Import directo de Heroicons
   - **Impacto:** Bundle size no optimizado (-492x posible)
   - **Solución:** Migrar a `ActionIcon`, `NavIcon`

---

## 🗺️ Roadmap de Implementación

### Fase 1: Fundamentos (Semana 1) - 21h

**Objetivo:** Resolver problemas críticos que impactan usabilidad diaria

#### Tarea 1.1: Sistema de Alertas Jerarquizado
- **Prioridad:** 🔴 Crítica
- **Tiempo:** 4h
- **Archivos:**
  - `page.tsx` (modificar)
  - `src/components/ui/CollapsibleAlertStack.tsx` (nuevo)

**Implementación:**

```tsx
// 📄 src/components/ui/CollapsibleAlertStack.tsx (NUEVO)
import { useState, Children } from 'react';
import { Stack, Button, Badge } from '@/shared/ui';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface CollapsibleAlertStackProps {
  children: React.ReactNode;
  maxVisible?: number;
  sortByPriority?: boolean;
}

export function CollapsibleAlertStack({
  children,
  maxVisible = 1,
  sortByPriority = true
}: CollapsibleAlertStackProps) {
  const [expanded, setExpanded] = useState(false);

  // Filtrar children nulos/undefined
  const alerts = Children.toArray(children).filter(Boolean);

  if (alerts.length === 0) return null;

  // Ordenar por priority (1=crítico, 5=info)
  const sortedAlerts = sortByPriority
    ? alerts.sort((a: any, b: any) =>
        (a.props?.priority || 5) - (b.props?.priority || 5)
      )
    : alerts;

  const visibleAlerts = expanded ? sortedAlerts : sortedAlerts.slice(0, maxVisible);
  const hiddenCount = alerts.length - maxVisible;

  return (
    <Stack direction="column" gap="xs">
      <Stack direction="column" gap="xs">
        {visibleAlerts}
      </Stack>

      {hiddenCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          alignSelf="flex-start"
        >
          {expanded ? (
            <>
              <ChevronUpIcon className="w-4 h-4" />
              Ocultar alertas
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-4 h-4" />
              Ver {hiddenCount} alerta{hiddenCount > 1 ? 's' : ''} más
              <Badge colorPalette="gray" size="xs" ml="xs">
                {hiddenCount}
              </Badge>
            </>
          )}
        </Button>
      )}
    </Stack>
  );
}

// Agregar prop priority a Alert component
declare module '@/shared/ui' {
  interface AlertProps {
    priority?: 1 | 2 | 3 | 4 | 5;
  }
}
```

```tsx
// 📄 page.tsx (MODIFICAR líneas 94-121)
import { CollapsibleAlertStack } from '@/components/ui/CollapsibleAlertStack';

// ANTES:
{!status.isActive && (
  <Alert variant="subtle" title="Module Capabilities Required">
    Missing capabilities: {status.missingCapabilities.join(', ')}
  </Alert>
)}

{!isOnline && (
  <Alert variant="warning" title="Modo Offline">
    Los cambios se sincronizarán cuando recuperes la conexión
  </Alert>
)}

<CapabilityGate capability="inventory_tracking">
  <MaterialsAlerts onAlertAction={actions.handleAlertAction} context="materials" />
</CapabilityGate>

// DESPUÉS:
<CollapsibleAlertStack maxVisible={1} sortByPriority>
  {!isOnline && (
    <Alert
      variant="warning"
      title="Modo Offline"
      description="Los cambios se sincronizarán cuando recuperes la conexión"
      priority={1}  // Crítico
    />
  )}

  {!status.isActive && (
    <Alert
      variant="subtle"
      title="Module Capabilities Required"
      description={`Missing capabilities: ${status.missingCapabilities.join(', ')}`}
      priority={3}  // Info
    />
  )}

  <CapabilityGate capability="inventory_tracking">
    <MaterialsAlerts
      onAlertAction={actions.handleAlertAction}
      context="materials"
      priority={2}  // Warning (pasar a MaterialsAlerts)
    />
  </CapabilityGate>
</CollapsibleAlertStack>
```

**Testing:**
- [ ] Verificar que solo 1 alerta visible por defecto
- [ ] Click en "Ver X alertas más" expande correctamente
- [ ] Ordenamiento por priority funciona (offline > capabilities)
- [ ] En mobile, ocupa máximo 100px de altura cuando colapsado

**Métricas de Éxito:**
- Altura de sección alertas: 300px → 80px (-73%)
- Métricas visibles sin scroll en mobile: 0/4 → 4/4

---

#### Tarea 1.2: Migrar a Tabs Semántico de Chakra v3
- **Prioridad:** 🔴 Crítica
- **Tiempo:** 3h
- **Archivos:**
  - `src/shared/ui/Tabs.tsx` (nuevo wrapper)
  - `MaterialsManagement.tsx` (modificar)

**Implementación:**

```tsx
// 📄 src/shared/ui/Tabs.tsx (NUEVO)
import { Tabs as ChakraTabs } from '@chakra-ui/react';

export const Tabs = {
  Root: ChakraTabs.Root,
  List: ChakraTabs.List,
  Trigger: ChakraTabs.Trigger,
  Content: ChakraTabs.Content,
  Indicator: ChakraTabs.Indicator,
};

export type { TabsRootProps } from '@chakra-ui/react';
```

```tsx
// 📄 src/shared/ui/index.ts (MODIFICAR)
export { Tabs } from './Tabs';
export type { TabsRootProps } from './Tabs';
```

```tsx
// 📄 MaterialsManagement.tsx (MODIFICAR líneas 1-64)
import { Tabs, Stack, Icon } from '@/shared/ui';
import { CubeIcon, ChartBarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

// ANTES:
<Stack direction="column" gap="md">
  <Stack direction="row" gap="sm">
    <Button variant={activeTab === 'inventory' ? 'solid' : 'outline'} onClick={() => onTabChange('inventory')}>
      Inventario
    </Button>
    <Button variant={activeTab === 'analytics' ? 'solid' : 'outline'} onClick={() => onTabChange('analytics')}>
      Análisis ABC
    </Button>
    <Button variant={activeTab === 'procurement' ? 'solid' : 'outline'} onClick={() => onTabChange('procurement')}>
      Compras
    </Button>
  </Stack>

  <Stack>
    {activeTab === 'inventory' && <InventoryTab {...props} />}
    {activeTab === 'analytics' && <ABCAnalysisTab />}
    {activeTab === 'procurement' && <ProcurementTab />}
  </Stack>
</Stack>

// DESPUÉS:
<Tabs.Root
  value={activeTab}
  onValueChange={onTabChange}
  variant="enclosed"  // O "line" para estilo minimalista
  colorPalette="blue"
>
  <Tabs.List borderBottom="2px solid" borderColor="gray.200">
    <Tabs.Trigger value="inventory" gap="sm">
      <Icon icon={CubeIcon} size="sm" />
      Inventario
    </Tabs.Trigger>

    <Tabs.Trigger value="analytics" gap="sm">
      <Icon icon={ChartBarIcon} size="sm" />
      Análisis ABC
    </Tabs.Trigger>

    <Tabs.Trigger value="procurement" gap="sm">
      <Icon icon={ClipboardDocumentListIcon} size="sm" />
      Compras
    </Tabs.Trigger>

    <Tabs.Indicator
      height="3px"
      bg="blue.500"
      borderRadius="md"
    />
  </Tabs.List>

  <Box mt="lg">
    <Tabs.Content value="inventory">
      <InventoryTab {...props} />
    </Tabs.Content>

    <Tabs.Content value="analytics">
      <ABCAnalysisTab />
    </Tabs.Content>

    <Tabs.Content value="procurement">
      <ProcurementTab />
    </Tabs.Content>
  </Box>
</Tabs.Root>
```

**Testing:**
- [ ] Navegación por teclado (Tab, Enter, Arrow keys)
- [ ] ARIA roles automáticos (`role="tablist"`, `aria-selected`)
- [ ] Indicador animado se mueve suavemente
- [ ] Iconos alineados correctamente
- [ ] Responsive: scroll horizontal en mobile si es necesario

**Métricas de Éxito:**
- Accesibilidad Lighthouse: 85 → 100
- Navegación por teclado: No → Sí

---

#### Tarea 1.3: Agrupación Visual por Criticidad
- **Prioridad:** 🔴 Crítica
- **Tiempo:** 8h
- **Archivos:**
  - `InventoryTab.tsx` (refactor mayor)
  - `src/components/ui/Collapsible.tsx` (nuevo, si no existe)

**Implementación:**

```tsx
// 📄 src/components/ui/Collapsible.tsx (NUEVO si no existe)
import { useState } from 'react';
import { Box, Button, Icon, Stack, Typography } from '@/shared/ui';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}

export function Collapsible({
  title,
  children,
  defaultOpen = false,
  badge
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Box>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        width="full"
        justifyContent="space-between"
        py="md"
      >
        <Stack direction="row" align="center" gap="sm">
          <Typography variant="heading" size="md">
            {title}
          </Typography>
          {badge}
        </Stack>

        <Icon
          icon={isOpen ? ChevronUpIcon : ChevronDownIcon}
          size="md"
        />
      </Button>

      {isOpen && (
        <Box mt="md">
          {children}
        </Box>
      )}
    </Box>
  );
}
```

```tsx
// 📄 InventoryTab.tsx (REFACTOR COMPLETO líneas 50-156)
import { useMemo } from 'react';
import { Stack, Typography, Button, Icon, Badge, Card, Box, Section, Separator } from '@/shared/ui';
import { Collapsible } from '@/components/ui/Collapsible';
import { CubeIcon, PlusIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useMaterials } from '@/store/materialsStore';
import { formatCurrency, formatQuantity } from '@/business-logic/shared/decimalUtils';
import { toaster } from '@/shared/ui';
import { logger } from '@/lib/logging';

// ... interfaces sin cambios ...

export function InventoryTab({ ... }: InventoryTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { getFilteredItems } = useMaterials();
  const materials = getFilteredItems();

  // ✅ NUEVA LÓGICA: Agrupar por status
  const groupedMaterials = useMemo(() => {
    const critical: MaterialItem[] = [];
    const low: MaterialItem[] = [];
    const healthy: MaterialItem[] = [];

    materials.forEach((item) => {
      const status = getStockStatus(item);
      if (status === 'critical') critical.push(item);
      else if (status === 'low') low.push(item);
      else healthy.push(item);
    });

    return { critical, low, healthy };
  }, [materials]);

  // ... handleQuickUpdate sin cambios ...
  // ... getStockStatus, getStatusColor sin cambios ...

  // ✅ NUEVA FUNCIÓN: Renderizar card de material
  const renderMaterialCard = (item: MaterialItem) => {
    const status = getStockStatus(item);
    const statusColor = getStatusColor(status);

    return (
      <Card.Root
        key={item.id}
        variant="outline"
        size="md"  // Cambio: sm → md
        role="article"
        aria-labelledby={`material-${item.id}-title`}
      >
        <Card.Body>
          <Stack
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            gap={{ base: "md", md: "lg" }}  // Cambio: gap aumentado
          >
            {/* Información del item */}
            <Stack direction="column" gap="sm" flex="1">  {/* Cambio: xs → sm */}
              <Stack direction="row" align="center" gap="md" flexWrap="wrap">
                <Typography
                  id={`material-${item.id}-title`}
                  variant="heading"
                  size={{ base: "sm", md: "md" }}
                >
                  {item.name}
                </Typography>

                <Badge
                  colorPalette={statusColor}
                  size="sm"
                  aria-label={`Clasificación ABC: ${item.abcClass || 'No asignada'}`}
                >
                  {item.abcClass || 'N/A'}
                </Badge>

                {/* ✅ MEJORA: Badges de status más visibles */}
                {status === 'critical' && (
                  <Badge
                    colorPalette="red"
                    size="md"
                    variant="solid"
                    gap="xs"
                  >
                    <Icon icon={ExclamationTriangleIcon} size="xs" />
                    CRÍTICO
                  </Badge>
                )}

                {status === 'low' && (
                  <Badge
                    colorPalette="yellow"
                    size="sm"
                    variant="subtle"
                    gap="xs"
                  >
                    <Icon icon={ExclamationTriangleIcon} size="xs" />
                    Stock Bajo
                  </Badge>
                )}
              </Stack>

              <Typography variant="body" size="sm" color="gray.600">
                {item.description || 'Sin descripción'}
              </Typography>

              {/* ✅ MEJORA: Grid para datos técnicos */}
              <Grid
                templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
                gap="md"
                mt="xs"
              >
                <Box>
                  <Typography variant="caption" color="gray.500" fontWeight="semibold">
                    Stock Actual
                  </Typography>
                  <Typography
                    variant="body"
                    size="md"
                    fontWeight="bold"
                    color={item.stock <= item.minStock ? "red.600" : "text.primary"}
                  >
                    {formatQuantity(item.stock, item.unit, 1)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="gray.500" fontWeight="semibold">
                    Stock Mínimo
                  </Typography>
                  <Typography variant="body" size="md">
                    {formatQuantity(item.minStock, item.unit, 1)}
                  </Typography>
                </Box>

                <Box gridColumn={{ base: "span 2", md: "auto" }}>
                  <Typography variant="caption" color="gray.500" fontWeight="semibold">
                    Costo Unitario
                  </Typography>
                  <Typography variant="body" size="md" fontWeight="semibold" color="green.600">
                    {formatCurrency(item.unit_cost || 0)}
                  </Typography>
                </Box>
              </Grid>
            </Stack>

            {/* ✅ MEJORA: Botones responsive */}
            <Stack
              direction="row"
              gap={{ base: "xs", md: "sm" }}
              justify={{ base: "space-between", md: "flex-end" }}
              width={{ base: "full", md: "auto" }}
            >
              <Button
                size={{ base: "md", md: "sm" }}
                variant="outline"
                disabled={isLoading || item.stock <= 0}
                onClick={() => handleQuickUpdate(item.id, item.stock - 1, item.name)}
                flex={{ base: "1", md: "0" }}
                minW={{ base: "auto", md: "60px" }}
                aria-label={`Reducir stock de ${item.name}`}
              >
                -1
              </Button>

              <Button
                size={{ base: "md", md: "sm" }}
                variant="outline"
                disabled={isLoading}
                onClick={() => handleQuickUpdate(item.id, item.stock + 1, item.name)}
                flex={{ base: "1", md: "0" }}
                minW={{ base: "auto", md: "60px" }}
                aria-label={`Aumentar stock de ${item.name}`}
              >
                +1
              </Button>

              <Button
                size={{ base: "md", md: "sm" }}
                variant="solid"
                colorPalette="blue"
                disabled={isLoading}
                onClick={() => handleQuickUpdate(item.id, item.minStock, item.name)}
                flex={{ base: "1", md: "0" }}
                minW={{ base: "auto", md: "80px" }}
                aria-label={`Establecer stock mínimo de ${item.name}`}
              >
                Min
              </Button>
            </Stack>
          </Stack>
        </Card.Body>
      </Card.Root>
    );
  };

  return (
    <Stack direction="column" gap="xl">
      {/* Header con botón agregar */}
      <Stack direction="row" justify="space-between" align="center">
        <Typography variant="heading" size="lg">
          Gestión de Inventario ({materials.length} items)
        </Typography>
        <Button
          variant="solid"
          size="sm"
          onClick={onAddMaterial}
          disabled={isLoading || !onAddMaterial}
        >
          <Icon icon={PlusIcon} size="sm" />
          Agregar Item
        </Button>
      </Stack>

      {/* ✅ SECCIÓN CRÍTICA (siempre expandida) */}
      {groupedMaterials.critical.length > 0 && (
        <>
          <Section variant="elevated" colorPalette="red">
            <Stack direction="column" gap="md">
              <Stack direction="row" align="center" gap="sm">
                <Icon icon={ExclamationTriangleIcon} size="lg" color="red.500" />
                <Typography variant="heading" size="lg" color="red.600">
                  Stock Crítico
                </Typography>
                <Badge colorPalette="red" size="lg" variant="solid">
                  {groupedMaterials.critical.length}
                </Badge>
              </Stack>

              <Typography variant="body" size="sm" color="red.600">
                Requieren reposición inmediata
              </Typography>

              <Stack direction="column" gap="sm" mt="sm">
                {groupedMaterials.critical.map(renderMaterialCard)}
              </Stack>
            </Stack>
          </Section>

          <Separator orientation="horizontal" thickness="2px" />
        </>
      )}

      {/* ✅ SECCIÓN STOCK BAJO (colapsable) */}
      {groupedMaterials.low.length > 0 && (
        <>
          <Box>
            <Collapsible
              title="Stock Bajo"
              defaultOpen={false}
              badge={
                <Badge colorPalette="yellow" size="md" variant="subtle">
                  {groupedMaterials.low.length}
                </Badge>
              }
            >
              <Stack direction="column" gap="sm">
                {groupedMaterials.low.map(renderMaterialCard)}
              </Stack>
            </Collapsible>
          </Box>

          <Separator orientation="horizontal" thickness="1px" />
        </>
      )}

      {/* ✅ SECCIÓN STOCK SALUDABLE */}
      {groupedMaterials.healthy.length > 0 && (
        <Box>
          <Stack direction="row" align="center" gap="sm" mb="md">
            <Icon icon={CheckCircleIcon} size="md" color="green.500" />
            <Typography variant="heading" size="md" color="green.600">
              Stock Saludable
            </Typography>
            <Badge colorPalette="green" size="md" variant="subtle">
              {groupedMaterials.healthy.length}
            </Badge>
          </Stack>

          <Stack direction="column" gap="sm">
            {groupedMaterials.healthy.map(renderMaterialCard)}
          </Stack>
        </Box>
      )}

      {/* Empty state */}
      {materials.length === 0 && (
        <Stack
          direction="column"
          gap="md"
          align="center"
          justify="center"
          minH="200px"
          bg="gray.50"
          borderRadius="md"
          p="xl"
        >
          <Icon icon={CubeIcon} size="xl" color="gray.400" />
          <Typography variant="heading" size="md" color="gray.600">
            No hay materiales disponibles
          </Typography>
          <Typography variant="body" color="gray.500" textAlign="center">
            Los datos están cargando o no hay materiales en el inventario
          </Typography>
        </Stack>
      )}

      {performanceMode && (
        <Typography variant="caption" color="orange.500">
          Modo de rendimiento activado - Animaciones reducidas
        </Typography>
      )}
    </Stack>
  );
}
```

**Testing:**
- [ ] Items críticos siempre visibles en sección roja
- [ ] Items de stock bajo en collapsible (cerrado por defecto)
- [ ] Items saludables agrupados abajo
- [ ] Badges de status visibles y descriptivos
- [ ] Grid de datos técnicos responsive (2 cols mobile, 3 desktop)
- [ ] Botones con touch targets >48px en mobile
- [ ] Separadores visuales entre secciones

**Métricas de Éxito:**
- Tiempo de encontrar item crítico: 8s → 1s (-87%)
- Touch target size: 32px → 48px (+50%)
- Feedback visual de status: Solo icono → Badge + texto

---

#### Tarea 1.4: Cards Responsive + Touch Targets
- **Prioridad:** 🔴 Crítica
- **Tiempo:** 6h
- **Estado:** ✅ **INCLUIDA EN TAREA 1.3**

Esta tarea está integrada en el refactor de InventoryTab (Tarea 1.3) mediante:
- Card size responsive: `size={{ base: "md", md: "md" }}`
- Botones responsive: `size={{ base: "md", md: "sm" }}`
- Layout adaptive: `direction={{ base: "column", md: "row" }}`
- Touch targets: `flex={{ base: "1", md: "0" }}` asegura botones grandes en mobile

**No requiere trabajo adicional.**

---

### Fase 2: Consistencia (Semana 2) - 10h

**Objetivo:** Alinear con convenciones G-Admin v2.1

#### Tarea 2.1: Migrar a Sistema notify.*
- **Prioridad:** 🟡 Importante
- **Tiempo:** 2h
- **Archivos:**
  - `InventoryTab.tsx` (modificar líneas 25-46)

**Implementación:**

```tsx
// 📄 InventoryTab.tsx (MODIFICAR)
// QUITAR:
import { toaster } from '@/shared/ui';

// AGREGAR:
import { notify } from '@/lib/notifications';

// ANTES (líneas 29-34):
toaster.create({
  title: 'Stock actualizado',
  description: `${itemName}: ${formatQuantity(newStock, materials.find(m => m.id === itemId)?.unit || '', 1)}`,
  type: 'success',
  duration: 3000
});

// DESPUÉS:
notify.success({
  title: 'Stock actualizado',
  description: `${itemName}: ${formatQuantity(newStock, materials.find(m => m.id === itemId)?.unit || '', 1)}`
});

// ANTES (líneas 37-42):
toaster.create({
  title: 'Error al actualizar stock',
  description: 'No se pudo actualizar el stock. Intenta nuevamente.',
  type: 'error',
  duration: 5000
});

// DESPUÉS:
notify.error({
  title: 'Error al actualizar stock',
  description: 'No se pudo actualizar el stock. Intenta nuevamente.'
});

// ANTES (líneas 146-151):
toaster.create({
  title: 'Stock mínimo alcanzado',
  description: 'No puedes reducir el stock por debajo de 0',
  type: 'warning',
  duration: 3000
});

// DESPUÉS:
notify.warning({
  title: 'Stock mínimo alcanzado',
  description: 'No puedes reducir el stock por debajo de 0'
});
```

**OPCIONAL: Crear helpers de dominio:**

```tsx
// 📄 src/lib/notifications/materialNotifications.ts (NUEVO)
import { notify } from './index';
import { formatQuantity } from '@/business-logic/shared/decimalUtils';

export const materialNotify = {
  stockUpdated: (itemName: string, newStock: number, unit: string) => {
    notify.success({
      title: 'Stock actualizado',
      description: `${itemName}: ${formatQuantity(newStock, unit, 1)}`
    });
  },

  stockUpdateFailed: () => {
    notify.error({
      title: 'Error al actualizar stock',
      description: 'No se pudo actualizar el stock. Intenta nuevamente.'
    });
  },

  stockMinReached: () => {
    notify.warning({
      title: 'Stock mínimo alcanzado',
      description: 'No puedes reducir el stock por debajo de 0'
    });
  },

  materialCreated: (itemName: string) => {
    notify.success({
      title: 'Material creado',
      description: `${itemName} agregado al inventario`
    });
  }
};

// Usar en InventoryTab:
import { materialNotify } from '@/lib/notifications/materialNotifications';

materialNotify.stockUpdated(itemName, newStock, item.unit);
materialNotify.stockUpdateFailed();
materialNotify.stockMinReached();
```

**Testing:**
- [ ] Notificaciones aparecen en `bottom-end`
- [ ] Duración automática (3s success, 5s error)
- [ ] Estilo consistente con resto de G-Admin
- [ ] No hay imports de `toaster` restantes

**Métricas de Éxito:**
- Consistencia de código: 70% → 90%
- Imports directos a toaster: 3 → 0

---

#### Tarea 2.2: Padding y Espaciado Mejorado
- **Prioridad:** 🟡 Importante
- **Tiempo:** 2h
- **Estado:** ✅ **INCLUIDA EN TAREA 1.3**

Esta tarea está integrada en el refactor de InventoryTab (Tarea 1.3) mediante:
- Card size: `sm` → `md`
- Gaps: `xs` (4px) → `sm` (8px) → `md` (12px)
- Grid spacing: `gap="md"` en datos técnicos

**No requiere trabajo adicional.**

---

#### Tarea 2.3: Hero Button en MaterialsActions
- **Prioridad:** 🟡 Importante
- **Tiempo:** 4h
- **Archivos:**
  - `MaterialsActions.tsx` (refactor)

**Implementación:**

```tsx
// 📄 MaterialsActions.tsx (REFACTOR COMPLETO)
import { Box, Button, Grid, Section, Separator, Stack, Typography, Icon } from '@/shared/ui';
import {
  PlusIcon,
  CogIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface MaterialsActionsProps {
  onAddMaterial?: () => void;
  onBulkOperations?: () => void;
  onGenerateReport?: () => Promise<void>;
  onSyncInventory?: () => Promise<void>;
  isMobile?: boolean;
  hasCapability: (capability: string) => boolean;
}

export function MaterialsActions({
  onAddMaterial,
  onBulkOperations,
  onGenerateReport,
  onSyncInventory,
  isMobile = false,
  hasCapability
}: MaterialsActionsProps) {

  return (
    <Section variant="default">
      <Stack direction="column" gap="xl">

        {/* ✅ HERO ACTION - Acción primaria destacada */}
        <Box textAlign="center">
          <Button
            variant="solid"
            colorPalette="blue"
            size={{ base: "lg", md: "xl" }}
            onClick={onAddMaterial}
            width={{ base: "full", md: "auto" }}
            minW={{ md: "320px" }}
            height={{ base: "56px", md: "64px" }}
          >
            <Icon icon={PlusIcon} size={{ base: "md", md: "lg" }} />
            <Stack direction="column" gap="xxs" align="start">
              <Typography variant="heading" size={{ base: "sm", md: "md" }} color="white">
                Agregar Material
              </Typography>
              <Typography
                variant="caption"
                color="whiteAlpha.800"
                display={{ base: "none", md: "block" }}
              >
                Crear nuevo item en inventario
              </Typography>
            </Stack>
          </Button>
        </Box>

        <Separator orientation="horizontal" />

        {/* ✅ ACCIONES SECUNDARIAS - Grid organizado */}
        <Box>
          <Typography variant="body" size="sm" color="gray.600" mb="md">
            Operaciones adicionales
          </Typography>

          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)"
            }}
            gap="md"
          >
            {hasCapability('bulk_operations') && onBulkOperations && (
              <Button
                variant="outline"
                size="md"
                onClick={onBulkOperations}
                justifyContent="flex-start"
                height="56px"
              >
                <Icon icon={CogIcon} size="sm" />
                <Stack direction="column" align="start" gap="xxs">
                  <Typography variant="body" size="sm" fontWeight="semibold">
                    Operaciones Masivas
                  </Typography>
                  <Typography variant="caption" color="gray.500">
                    Editar múltiples items
                  </Typography>
                </Stack>
              </Button>
            )}

            {onGenerateReport && (
              <Button
                variant="outline"
                size="md"
                onClick={onGenerateReport}
                justifyContent="flex-start"
                height="56px"
              >
                <Icon icon={DocumentTextIcon} size="sm" />
                <Stack direction="column" align="start" gap="xxs">
                  <Typography variant="body" size="sm" fontWeight="semibold">
                    Generar Reporte
                  </Typography>
                  <Typography variant="caption" color="gray.500">
                    Exportar inventario
                  </Typography>
                </Stack>
              </Button>
            )}

            {onSyncInventory && (
              <Button
                variant="outline"
                size="md"
                onClick={onSyncInventory}
                justifyContent="flex-start"
                height="56px"
              >
                <Icon icon={ArrowPathIcon} size="sm" />
                <Stack direction="column" align="start" gap="xxs">
                  <Typography variant="body" size="sm" fontWeight="semibold">
                    Sincronizar
                  </Typography>
                  <Typography variant="caption" color="gray.500">
                    Actualizar datos
                  </Typography>
                </Stack>
              </Button>
            )}
          </Grid>
        </Box>

      </Stack>
    </Section>
  );
}
```

**Testing:**
- [ ] Hero button visualmente destacado (más grande, centrado)
- [ ] Acciones secundarias en grid responsive (1 col mobile, 2-3 desktop)
- [ ] Iconos alineados correctamente
- [ ] Descripciones legibles
- [ ] Separador visual claro

**Métricas de Éxito:**
- Claridad de acción principal: Usuario identifica "Agregar" en <2s
- Touch target del hero button: 56px mobile, 64px desktop

---

#### Tarea 2.4: Badges con Texto Descriptivo
- **Prioridad:** 🟡 Importante
- **Tiempo:** 2h
- **Estado:** ✅ **INCLUIDA EN TAREA 1.3**

Esta tarea está integrada en el refactor de InventoryTab (Tarea 1.3) mediante:
- Badge "CRÍTICO" con texto + icono
- Badge "Stock Bajo" con texto + icono
- `aria-label` descriptivos en todos los badges

**No requiere trabajo adicional.**

---

### Fase 3: Optimizaciones (Semana 3) - 15h

**Objetivo:** Performance y preparación para escala

#### Tarea 3.1: Virtualización para Listas Largas
- **Prioridad:** 🟢 Mejora
- **Tiempo:** 6h
- **Archivos:**
  - `InventoryTab.tsx` (modificar)
  - Verificar `src/lib/performance/VirtualGrid.tsx` existe

**Implementación:**

```tsx
// 📄 InventoryTab.tsx (AGREGAR al inicio del componente)
import { VirtualGrid } from '@/lib/performance/VirtualGrid';

export function InventoryTab({ ... }) {
  // ... código existente ...

  const shouldVirtualize = materials.length > 50;

  // ✅ NUEVA FUNCIÓN: Renderizar con virtualización si es necesario
  const renderMaterialList = (items: MaterialItem[]) => {
    if (shouldVirtualize && items.length > 50) {
      return (
        <VirtualGrid
          items={items}
          renderItem={renderMaterialCard}
          columns={{ base: 1, md: 1, lg: 1 }}  // Lista vertical
          gap="sm"
          estimatedItemHeight={180}
          overscan={5}
        />
      );
    }

    // Renderizado normal para <50 items
    return (
      <Stack direction="column" gap="sm">
        {items.map(renderMaterialCard)}
      </Stack>
    );
  };

  return (
    <Stack direction="column" gap="xl">
      {/* ... header ... */}

      {/* ✅ SECCIÓN CRÍTICA con virtualización */}
      {groupedMaterials.critical.length > 0 && (
        <Section variant="elevated" colorPalette="red">
          {/* ... título ... */}
          {renderMaterialList(groupedMaterials.critical)}
        </Section>
      )}

      {/* ✅ SECCIÓN STOCK BAJO con virtualización */}
      {groupedMaterials.low.length > 0 && (
        <Collapsible title="Stock Bajo" defaultOpen={false}>
          {renderMaterialList(groupedMaterials.low)}
        </Collapsible>
      )}

      {/* ✅ SECCIÓN SALUDABLE con virtualización */}
      {groupedMaterials.healthy.length > 0 && (
        <Box>
          {/* ... título ... */}
          {renderMaterialList(groupedMaterials.healthy)}
        </Box>
      )}
    </Stack>
  );
}
```

**Testing:**
- [ ] Con 10 items: renderizado normal
- [ ] Con 60 items: virtualización activa
- [ ] Scroll suave sin lag
- [ ] Items fuera del viewport no renderizados (verificar DevTools)
- [ ] Búsqueda/filtrado funciona correctamente

**Métricas de Éxito:**
- Renderizado inicial (100 items): 450ms → 80ms (-82%)
- FPS durante scroll: 30fps → 60fps
- Memoria usada: 45MB → 12MB (-73%)

---

#### Tarea 3.2: Integrar EventBus en Operaciones
- **Prioridad:** 🟢 Mejora
- **Tiempo:** 4h
- **Archivos:**
  - `InventoryTab.tsx` (modificar)
  - `page.tsx` (verificar CONFIG)

**Implementación:**

```tsx
// 📄 InventoryTab.tsx (MODIFICAR handleQuickUpdate)
import { useModuleIntegration } from '@/hooks/useModuleIntegration';

// En el componente:
export function InventoryTab({ ... }) {
  const { emitEvent } = useModuleIntegration('materials', MATERIALS_MODULE_CONFIG);

  const handleQuickUpdate = async (itemId: string, newStock: number, itemName: string) => {
    setIsLoading(true);

    // Guardar stock anterior para el evento
    const item = materials.find(m => m.id === itemId);
    const oldStock = item?.stock || 0;

    try {
      await onStockUpdate(itemId, newStock);

      // ✅ NUEVO: Emitir evento para otros módulos
      emitEvent('materials.stock_updated', {
        itemId,
        itemName,
        oldStock,
        newStock,
        delta: newStock - oldStock,
        unit: item?.unit || '',
        timestamp: Date.now(),
        userId: user?.id  // Si está disponible
      });

      materialNotify.stockUpdated(itemName, newStock, item?.unit || '');

    } catch (error) {
      logger.error('MaterialsStore', 'Error updating stock:', error);

      // ✅ NUEVO: Emitir evento de error
      emitEvent('materials.stock_update_failed', {
        itemId,
        itemName,
        error: (error as Error).message,
        timestamp: Date.now()
      });

      materialNotify.stockUpdateFailed();
    } finally {
      setIsLoading(false);
    }
  };
}
```

```tsx
// 📄 page.tsx (VERIFICAR MATERIALS_MODULE_CONFIG)
const MATERIALS_MODULE_CONFIG = {
  capabilities: ['inventory_tracking', 'supplier_management', 'purchase_orders'],
  events: {
    emits: [
      'materials.stock_updated',
      'materials.stock_update_failed',
      'materials.low_stock_alert',
      'materials.purchase_order_created'
    ],
    listens: [
      'sales.completed',           // Reducir stock automáticamente
      'products.recipe_updated',   // Recalcular requirements
      'kitchen.item_consumed'      // Stock depletion en tiempo real
    ]
  },
  eventHandlers: {
    'sales.completed': (data: any) => {
      // Auto-reduce stock based on sale
      logger.info('MaterialsStore', '🛒 Materials: Sale completed, updating stock...', data);
    },
    'products.recipe_updated': (data: any) => {
      // Recalculate material requirements
      logger.debug('MaterialsStore', '📝 Materials: Recipe updated, recalculating requirements...', data);
    },
    'kitchen.item_consumed': (data: any) => {
      // Real-time stock depletion
      logger.info('MaterialsStore', '🍳 Materials: Kitchen consumption recorded...', data);
    }
  }
} as const;
```

**Testing:**
- [ ] Evento `materials.stock_updated` se emite correctamente
- [ ] Payload contiene toda la información necesaria
- [ ] Otros módulos pueden escuchar (verificar en EventBus debugger)
- [ ] Eventos de error se emiten cuando falla la operación

**Métricas de Éxito:**
- Comunicación cross-module: Manual → Automática via EventBus
- Audit trail: Sin log → Eventos trazables

---

#### Tarea 3.3: Migrar a Sistema de Iconos G-Admin
- **Prioridad:** 🟢 Mejora
- **Tiempo:** 3h
- **Archivos:**
  - `MaterialsActions.tsx` (modificar)
  - `InventoryTab.tsx` (modificar)
  - Verificar `src/components/ui/Icon.tsx` tiene ActionIcon

**Implementación:**

```tsx
// 📄 MaterialsActions.tsx
// ANTES:
import { PlusIcon, CogIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui';

<Icon icon={PlusIcon} size="lg" />

// DESPUÉS:
import { ActionIcon } from '@/components/ui/Icon';

<ActionIcon name="add" size="lg" />
<ActionIcon name="settings" size="sm" />
<ActionIcon name="save" size="sm" />
<ActionIcon name="loading" size="sm" />
```

```tsx
// 📄 InventoryTab.tsx
// ANTES:
import { CubeIcon, PlusIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui';

<Icon icon={CubeIcon} size="xl" />
<Icon icon={ExclamationTriangleIcon} size="xs" />

// DESPUÉS:
import { ActionIcon, StatusIcon } from '@/components/ui/Icon';

<StatusIcon name="inventory" size="xl" />  // CubeIcon
<StatusIcon name="alert" size="xs" />      // ExclamationTriangleIcon
<StatusIcon name="success" size="md" />    // CheckCircleIcon
```

**NOTA:** Verificar primero qué iconos están disponibles en el sistema G-Admin:

```bash
# Verificar sistema de iconos
grep -r "ActionIcon" src/components/ui/Icon.tsx
grep -r "StatusIcon" src/components/ui/Icon.tsx
```

Si no existe el sistema de iconos optimizado, **SKIP esta tarea** o crear el sistema primero.

**Testing:**
- [ ] Iconos se renderizan correctamente
- [ ] Tamaños consistentes
- [ ] Bundle size reducido (verificar con `npm run build`)

**Métricas de Éxito:**
- Bundle size: Verificar con build analyzer
- Imports de Heroicons: 15+ → 0

---

#### Tarea 3.4: Paginación como Alternativa a Virtualización
- **Prioridad:** 🟢 Mejora (Opcional)
- **Tiempo:** 2h
- **Archivos:**
  - `InventoryTab.tsx` (agregar opción)

**Implementación:** (Ver sección P4.2 del análisis UX/UI para código completo)

Esta tarea es **OPCIONAL** y solo si la virtualización (Tarea 3.1) no funciona bien o no está disponible.

---

### Fase 4: Testing y Documentación (Semana 4) - 8h

#### Tarea 4.1: Testing Exhaustivo
- **Tiempo:** 4h
- **Checklist:**

**Funcionalidad:**
- [ ] Todas las alertas se consolidan correctamente
- [ ] Tabs funcionan con teclado (Tab, Enter, Arrows)
- [ ] Items críticos/bajo/saludable se agrupan bien
- [ ] Botones de stock funcionan (+1, -1, Min)
- [ ] Notificaciones aparecen con notify.*
- [ ] Virtualización activa con >50 items
- [ ] EventBus emite eventos correctamente

**Responsive:**
- [ ] Mobile (375px): Cards stack verticalmente
- [ ] Tablet (768px): Layout intermedio
- [ ] Desktop (1440px): Layout completo
- [ ] Touch targets >48px en mobile
- [ ] Tabs tienen scroll horizontal en mobile

**Accesibilidad:**
- [ ] Lighthouse Accessibility: 100
- [ ] Screen reader: Todos los elementos descriptivos
- [ ] Navegación por teclado: Completa
- [ ] Contraste WCAG AA: Todos los textos
- [ ] ARIA labels: Completos

**Performance:**
- [ ] FPS durante scroll: 60fps
- [ ] Lighthouse Performance: >90
- [ ] Bundle size: No aumenta significativamente

---

#### Tarea 4.2: Documentación
- **Tiempo:** 2h
- **Entregables:**

1. **Actualizar MODULE_DESIGN_CONVENTIONS.md**
   - Agregar ejemplo de agrupación por criticidad
   - Documentar patrón CollapsibleAlertStack
   - Agregar patrón Hero Button + secundarias

2. **Crear MATERIALS_PAGE_PATTERNS.md**
   - Patrones específicos del módulo Materials
   - Ejemplos de código reutilizables
   - Decisiones de diseño documentadas

3. **Actualizar CHANGELOG.md**
   - Versión v2.1.1
   - Lista de mejoras implementadas
   - Breaking changes (si los hay)

---

#### Tarea 4.3: Performance Benchmarks
- **Tiempo:** 2h
- **Métricas a medir:**

| Métrica | Baseline | Meta | Resultado |
|---------|----------|------|-----------|
| Tiempo de carga inicial | - | <1.5s | - |
| FPS durante scroll (100 items) | - | 60fps | - |
| Memoria usada (100 items) | - | <20MB | - |
| Bundle size total | - | Sin aumento | - |
| Lighthouse Performance | - | >90 | - |
| Lighthouse Accessibility | - | 100 | - |

---

## 📋 Checklist de Implementación

### Pre-requisitos
- [ ] Branch creado: `feature/materials-ux-ui-improvements`
- [ ] Issues creados en GitHub (si se usa)
- [ ] Stakeholders notificados
- [ ] Backup de archivos originales

### Fase 1 (Semana 1)
- [ ] Tarea 1.1: Sistema de Alertas Jerarquizado (4h)
- [ ] Tarea 1.2: Tabs Semántico (3h)
- [ ] Tarea 1.3: Agrupación por Criticidad (8h)
- [ ] Tarea 1.4: ✅ Incluida en 1.3

### Fase 2 (Semana 2)
- [ ] Tarea 2.1: Migrar a notify.* (2h)
- [ ] Tarea 2.2: ✅ Incluida en 1.3
- [ ] Tarea 2.3: Hero Button (4h)
- [ ] Tarea 2.4: ✅ Incluida en 1.3

### Fase 3 (Semana 3)
- [ ] Tarea 3.1: Virtualización (6h)
- [ ] Tarea 3.2: EventBus Integration (4h)
- [ ] Tarea 3.3: Sistema de Iconos (3h) - Opcional
- [ ] Tarea 3.4: Paginación (2h) - Opcional

### Fase 4 (Semana 4)
- [ ] Tarea 4.1: Testing (4h)
- [ ] Tarea 4.2: Documentación (2h)
- [ ] Tarea 4.3: Benchmarks (2h)

### Post-implementación
- [ ] Code review completo
- [ ] Merge a main
- [ ] Deploy a staging
- [ ] User acceptance testing
- [ ] Deploy a producción
- [ ] Monitoreo post-deploy (1 semana)

---

## 🚨 Riesgos y Mitigaciones

### Riesgo 1: Virtualización rompe comportamiento existente
**Probabilidad:** Media
**Impacto:** Alto
**Mitigación:**
- Implementar feature flag para activar/desactivar
- Testing exhaustivo con diferentes tamaños de lista
- Rollback plan: Remover VirtualGrid, usar paginación

### Riesgo 2: Cambio de Tabs rompe navegación existente
**Probabilidad:** Baja
**Impacto:** Medio
**Mitigación:**
- Mantener misma API de props (activeTab, onTabChange)
- Testing de navegación por teclado
- Fallback a botones si Tabs falla

### Riesgo 3: notify.* no existe o tiene API diferente
**Probabilidad:** Baja
**Impacto:** Bajo
**Mitigación:**
- Verificar existencia de `@/lib/notifications` antes de empezar
- Si no existe, crear wrapper sobre toaster
- Documentar API en MATERIALS_PAGE_PATTERNS.md

### Riesgo 4: Performance degrada en mobile
**Probabilidad:** Media
**Impacto:** Alto
**Mitigación:**
- Benchmarks antes y después en dispositivos reales
- Usar `shouldReduceAnimations` para deshabilitar animaciones
- Paginación como fallback si virtualización es lenta

### Riesgo 5: Agrupación por criticidad es lenta
**Probabilidad:** Baja
**Impacto:** Medio
**Mitigación:**
- `useMemo` para evitar re-cálculos
- Benchmarks con 500+ items
- Caché de status si es necesario

---

## 📊 Métricas de Éxito del Proyecto

### Métricas Cuantitativas

| KPI | Baseline | Meta | Peso |
|-----|----------|------|------|
| Espacio vertical de alertas (mobile) | 300px | <100px | 20% |
| Tiempo de encontrar item crítico | 8s | <2s | 25% |
| Touch target size (mobile) | 32px | 48px | 15% |
| Lighthouse Accessibility | 85 | 100 | 15% |
| FPS durante scroll (100 items) | 30fps | 60fps | 15% |
| Consistencia de código (patrones G-Admin) | 70% | 95% | 10% |

**Meta general:** ≥85% de KPIs cumplidos

### Métricas Cualitativas

- [ ] Usuario puede identificar items críticos en <3s
- [ ] Navegación de tabs es intuitiva (sin explicación)
- [ ] Acciones principales están claras (sin buscar)
- [ ] Página se ve "profesional y pulida"
- [ ] Feedback visual es claro en todas las acciones

---

## 🔄 Plan de Rollback

Si después del deploy se detectan problemas críticos:

### Rollback Rápido (15 minutos)
```bash
git revert <commit-hash>
git push origin main
npm run build && npm run deploy
```

### Rollback Parcial (por feature)
1. **Alertas:** Remover `<CollapsibleAlertStack>`, volver a alerts individuales
2. **Tabs:** Cambiar `<Tabs.Root>` de vuelta a `<Button>`
3. **Agrupación:** Remover lógica de `groupedMaterials`, renderizar lista flat
4. **Virtualización:** Remover `<VirtualGrid>`, usar `map()` directo

### Archivos a Restaurar
- `page.tsx` (líneas 94-121)
- `MaterialsManagement.tsx` (completo)
- `InventoryTab.tsx` (completo)
- `MaterialsActions.tsx` (completo)

---

## 📝 Notas de Implementación

### Convenciones de Código

1. **Nomenclatura:**
   - Componentes: PascalCase (`CollapsibleAlertStack`)
   - Funciones: camelCase (`handleQuickUpdate`)
   - Constantes: UPPER_SNAKE_CASE (`MATERIALS_MODULE_CONFIG`)

2. **Imports:**
   - Agrupar por categoría (React, UI, Business Logic, Utils)
   - Orden alfabético dentro de cada grupo
   - Usar alias de path (`@/shared/ui`, no rutas relativas)

3. **Comentarios:**
   - ✅ para mejoras implementadas
   - ❌ para problemas resueltos
   - 📄 para archivos nuevos/modificados
   - 🔴/🟡/🟢 para prioridades

4. **TypeScript:**
   - Todas las props con interfaces explícitas
   - No usar `any`, preferir `unknown` si es necesario
   - Exportar tipos desde archivos de componentes

### Git Workflow

**Commits:**
```
feat(materials): add CollapsibleAlertStack component
feat(materials): migrate to semantic Tabs component
refactor(materials): group items by criticality
feat(materials): improve responsive layout and touch targets
refactor(materials): migrate to notify.* notification system
feat(materials): add hero button to MaterialsActions
perf(materials): add virtualization for large lists
feat(materials): integrate EventBus in stock operations
```

**Branch naming:**
```
feature/materials-ux-ui-improvements
```

**PR template:**
```markdown
## 🎯 Objetivo
Mejorar UX/UI de Materials page manteniendo minimalismo G-Admin v2.1

## 📊 Cambios Principales
- [ ] Sistema de alertas jerarquizado
- [ ] Tabs semántico con Chakra v3
- [ ] Agrupación visual por criticidad
- [ ] Layout responsive + touch targets
- [ ] Migración a notify.*
- [ ] Hero button en acciones
- [ ] Virtualización para listas >50
- [ ] EventBus integration

## 🧪 Testing
- [ ] Funcionalidad completa
- [ ] Responsive (mobile/tablet/desktop)
- [ ] Accesibilidad (Lighthouse 100)
- [ ] Performance (60fps scroll)

## 📸 Screenshots
[Agregar before/after]

## 📝 Notas
[Decisiones técnicas importantes]
```

---

## 🎓 Lecciones Aprendidas (Post-mortem)

_Completar después de la implementación_

### Qué funcionó bien
-

### Qué no funcionó
-

### Qué mejorar para próximos proyectos
-

---

## 📚 Referencias

- [G-Admin Module Design Conventions](./05-development/MODULE_DESIGN_CONVENTIONS.md)
- [Chakra UI v3 Migration Guide](https://www.chakra-ui.com/docs/get-started/migration)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [EventBus v2 Documentation](../src/lib/events/README.md)
- [Performance Optimization Guide](./PERFORMANCE_ANALYSIS_REPORT.md)

---

**Última actualización:** 2025-10-03
**Próxima revisión:** Después de Fase 1 (Semana 1)
**Aprobado por:** [Pendiente]
