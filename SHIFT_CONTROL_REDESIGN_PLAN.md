# ShiftControl Widget - Plan de Rediseño Completo

**Fecha**: 2025-12-27  
**Objetivo**: Rediseñar ShiftControl con arquitectura limpia y UX profesional  
**Tiempo estimado**: 8-10 horas  
**Prioridad**: Alta

---

## 🎯 OBJETIVOS

### Funcionales
- [x] Separar acciones del turno vs acciones operacionales
- [x] Arquitectura modular con HookPoints
- [x] Widgets inyectados por cada módulo
- [x] Header informativo con contexto completo
- [x] Financial section consolidada
- [x] Quick actions claramente definidas

### No Funcionales
- [x] UI moderna y profesional
- [x] Jerarquía visual clara
- [x] Reducir cognitive load
- [x] Mobile-responsive
- [x] Performance < 100ms render

---

## 📋 ESTRUCTURA FINAL

```
┌──────────────────────────────────────────────────────────┐
│ 1. HERO HEADER                                           │
│    - Info contextual (quién, dónde, cuándo, timer)      │
│    - Acciones del turno (Cerrar, Pausar, Reporte)       │
├──────────────────────────────────────────────────────────┤
│ 2. FINANCIAL SNAPSHOT                                    │
│    - Total turno (grande, prominente)                    │
│    - Payment methods (con %)                             │
│    - Cash session (inline, no widget)                    │
│    - Comparativa histórica (opcional)                    │
├──────────────────────────────────────────────────────────┤
│ 3. OPERATIONAL STATUS                                    │
│    - HookPoint: shift-control.indicators                 │
│    - Widgets: Cash, Staff, Materials, Tables, Delivery   │
│    - Métricas de ritmo (opcional)                        │
├──────────────────────────────────────────────────────────┤
│ 4. QUICK ACTIONS                                         │
│    - Core: Nueva Venta, Nuevo Cliente                    │
│    - HookPoint: shift-control.quick-actions              │
│    - Module-injected actions                             │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 FASES DE IMPLEMENTACIÓN

### FASE 1: Arquitectura Limpia (2h)
**Objetivo**: Eliminar duplicaciones, establecer base modular

#### 1.1. Eliminar ShiftStats Inline (30 min)
**Archivos**:
- `src/modules/shift-control/components/ShiftControlWidget.tsx`

**Tareas**:
- [ ] Eliminar import de ShiftStats
- [ ] Eliminar import de CashSessionIndicator inline
- [ ] Eliminar sección "📊 INDICADORES" con ShiftStats
- [ ] Mantener SOLO HookPoint `shift-control.indicators`
- [ ] Verificar que indicatorsData se pasa correctamente

**Código a eliminar** (líneas 254-282):
```tsx
// ❌ ELIMINAR ESTA SECCIÓN COMPLETA
{isOperational && (
  <Stack gap="2">
    <Text fontSize="xs" fontWeight="semibold" color="gray.600" textTransform="uppercase">
      📊 Indicadores
    </Text>
    
    <HStack gap="2" flexWrap="wrap" align="stretch">
      <ShiftStats
        activeStaffCount={activeStaffCount}
        openTablesCount={openTablesCount}
        activeDeliveriesCount={activeDeliveriesCount}
        pendingOrdersCount={pendingOrdersCount}
        stockAlertsCount={stockAlerts.length}
        loading={loading}
      />
      
      <CashSessionIndicator
        cashSession={cashSession}
        compact={false}
      />
    </HStack>
  </Stack>
)}
```

**Testing**:
```bash
# 1. Verificar que compila sin errores
pnpm -s exec tsc --noEmit

# 2. Verificar en browser
pnpm dev
# → Abrir dashboard
# → Verificar que NO aparece ShiftStats
# → Verificar que HookPoint funciona (debería mostrar CashSessionIndicator de cash-management)
```

---

#### 1.2. Registrar Widgets Faltantes (30 min)
**Archivos**:
- `src/modules/staff/manifest.tsx`
- `src/modules/materials/manifest.tsx`

**Tareas Staff**:
- [ ] Importar `StaffIndicator` de `./widgets/StaffIndicator`
- [ ] Agregar registro en `setup()` después de línea 124
- [ ] Priority: 80
- [ ] Data: `{ activeStaffCount }`
- [ ] Test: Verificar badge aparece

**Código Staff** (agregar en manifest.tsx línea ~125):
```typescript
// ============================================
// SHIFT CONTROL INTEGRATION
// ============================================

const { StaffIndicator } = await import('./widgets/StaffIndicator');

registry.addAction(
  'shift-control.indicators',
  ({ activeStaffCount }) => (
    <StaffIndicator 
      activeStaffCount={activeStaffCount}
      key="staff-indicator"
    />
  ),
  'staff',
  80
);

logger.debug('App', 'Registered shift-control.indicators hook (StaffIndicator)');
```

**Tareas Materials**:
- [ ] Importar `StockAlertIndicator` de `./widgets/StockAlertIndicator`
- [ ] Agregar registro en `setup()` después de línea 157
- [ ] Priority: 70
- [ ] Data: `{ stockAlerts }`
- [ ] Test: Verificar badge aparece cuando hay alerts

**Código Materials** (agregar en manifest.tsx línea ~158):
```typescript
// ============================================
// SHIFT CONTROL INTEGRATION
// ============================================

const { StockAlertIndicator } = await import('./widgets/StockAlertIndicator');

registry.addAction(
  'shift-control.indicators',
  ({ stockAlerts }) => (
    <StockAlertIndicator 
      lowStockAlerts={stockAlerts?.length || 0}
      key="stock-alert-indicator"
    />
  ),
  'materials',
  70
);

logger.debug('App', 'Registered shift-control.indicators hook (StockAlertIndicator)');
```

**Testing**:
```bash
# 1. Verificar compilación
pnpm -s exec tsc --noEmit

# 2. Test en browser
pnpm dev
# → Dashboard abierto
# → Check-in empleado → debería ver badge "👥 1 empleados"
# → Verificar orden: [💰 Caja] [👥 Staff] (si hay alerts: [⚠️ Stock])
```

---

#### 1.3. Verificar Data Contract (30 min)
**Archivos**:
- `src/modules/shift-control/components/ShiftControlWidget.tsx`
- `src/store/shiftStore.ts`

**Tareas**:
- [ ] Revisar `indicatorsData` object (línea ~162)
- [ ] Confirmar que `stockAlerts` es array (no número)
- [ ] Verificar tipos en store
- [ ] Ajustar si hay inconsistencias

**Verificación**:
```typescript
// ShiftControlWidget.tsx (línea ~162)
const indicatorsData = {
  shiftId: currentShift?.id,
  cashSession,
  activeStaffCount,           // number
  openTablesCount,            // number
  activeDeliveriesCount,      // number
  pendingOrdersCount,         // number
  stockAlerts                 // StockAlert[] o number?
};

// Revisar en shiftStore.ts
interface ShiftState {
  stockAlerts: StockAlert[];  // ← Debería ser array
  // NO stockAlertsCount: number
}
```

**Fix si necesario**:
- Si `stockAlerts` es número, cambiarlo a array
- Actualizar handlers que modifican `stockAlerts`
- Ajustar `StockAlertIndicator` para recibir array

---

#### 1.4. Testing Fase 1 (30 min)
**Checklist**:
```
[ ] ShiftStats eliminado del código
[ ] CashSessionIndicator inline eliminado
[ ] Cash badge aparece (de cash-management)
[ ] Staff badge aparece al check-in
[ ] Materials badge aparece con stock bajo
[ ] Orden correcto: Cash (90) > Staff (80) > Materials (70)
[ ] No hay warnings en console
[ ] No hay TypeScript errors
```

**Comandos**:
```bash
# Compilación
pnpm -s exec tsc --noEmit

# Lint
pnpm -s exec eslint src/modules/shift-control
pnpm -s exec eslint src/modules/staff/manifest.tsx
pnpm -s exec eslint src/modules/materials/manifest.tsx

# Tests (si existen)
pnpm test shift-control
```

---

### FASE 2: Hero Header Redesign (2.5h)
**Objetivo**: Header informativo con acciones del turno inline

#### 2.1. Crear ShiftHeroHeader Component (1.5h)
**Archivo**: `src/modules/shift-control/components/ShiftHeroHeader.tsx` (NUEVO)

**Props**:
```typescript
interface ShiftHeroHeaderProps {
  shift: OperationalShift | null;
  isOperational: boolean;
  locationName: string;
  loading?: boolean;
  
  // Actions
  onOpenShift: () => void;
  onCloseShift: () => void;
  onViewReport?: () => void;
  
  // UI state
  hasBlockers?: boolean;
  blockersCount?: number;
}
```

**Estructura**:
```tsx
export function ShiftHeroHeader({ 
  shift, 
  isOperational, 
  locationName,
  onOpenShift,
  onCloseShift,
  onViewReport,
  hasBlockers,
  blockersCount,
  loading 
}: ShiftHeroHeaderProps) {
  
  return (
    <Stack gap="3">
      {/* Línea 1: Número de turno + Timer + Badge */}
      <HStack justify="space-between" align="center">
        <HStack gap="3" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            🕐 Turno #{shift?.id || 'N/A'}
          </Text>
          
          {isOperational && <ShiftTimer startTime={shift?.opened_at} />}
        </HStack>
        
        <Badge colorPalette={isOperational ? 'green' : 'gray'} size="lg">
          {isOperational ? '✓ Operativo' : '○ Cerrado'}
        </Badge>
      </HStack>
      
      {/* Línea 2: Metadata */}
      <HStack gap="2" fontSize="sm" color="gray.600">
        <Text>Abierto por {shift?.opened_by_name || 'N/A'}</Text>
        <Text>•</Text>
        <Text>{locationName}</Text>
      </HStack>
      
      {shift?.opened_at && (
        <HStack gap="2" fontSize="xs" color="gray.500">
          <Text>Desde {formatDate(shift.opened_at)}</Text>
          <Text>•</Text>
          <Text>hace {formatRelativeTime(shift.opened_at)}</Text>
        </HStack>
      )}
      
      {/* Línea 3: Acciones del turno */}
      <HStack gap="2" mt="2">
        {!isOperational && (
          <Button
            onClick={onOpenShift}
            loading={loading}
            colorPalette="green"
            size="md"
          >
            ▶ Abrir Turno
          </Button>
        )}
        
        {isOperational && (
          <>
            <Button
              onClick={onCloseShift}
              loading={loading}
              colorPalette="red"
              variant="solid"
              size="md"
              disabled={hasBlockers}
            >
              ■ Cerrar Turno
              {hasBlockers && ` (${blockersCount} pendientes)`}
            </Button>
            
            {onViewReport && (
              <Button
                onClick={onViewReport}
                variant="outline"
                size="md"
              >
                📊 Ver Reporte
              </Button>
            )}
          </>
        )}
      </HStack>
    </Stack>
  );
}
```

**Tareas**:
- [ ] Crear archivo component
- [ ] Implementar ShiftTimer sub-component (si no existe)
- [ ] Agregar formatDate y formatRelativeTime helpers
- [ ] Exportar desde index

**Helpers necesarios** (agregar en `src/modules/shift-control/utils/formatters.ts`):
```typescript
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (days > 0) return `${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
  return 'menos de 1 hora';
}
```

---

#### 2.2. Integrar ShiftHeroHeader en Widget (30 min)
**Archivo**: `src/modules/shift-control/components/ShiftControlWidget.tsx`

**Tareas**:
- [ ] Importar `ShiftHeroHeader`
- [ ] Reemplazar `ShiftHeader` en Card.Header
- [ ] Pasar props necesarias
- [ ] Eliminar acciones duplicadas de actions section

**Código** (modificar Card.Header, línea ~210):
```tsx
<Card.Header pb="4">
  <ShiftHeroHeader
    shift={currentShift}
    isOperational={isOperational}
    locationName={locationName}
    loading={loading}
    onOpenShift={handleOpenShift}
    onCloseShift={handleCloseShiftAttempt}
    onViewReport={handleViewReport} // ← Implementar handler
    hasBlockers={hasBlockers}
    blockersCount={closeBlockers.length}
  />
</Card.Header>
```

**Handler nuevo** (agregar en ShiftControlWidget):
```typescript
const handleViewReport = useCallback(() => {
  if (!currentShift) return;
  
  // TODO: Implementar reporte real
  // Por ahora, navegar a página de reportes o mostrar modal
  console.log('Ver reporte de turno:', currentShift.id);
  
  // Opción 1: Navegar
  // navigate(`/admin/tools/reporting/shifts/${currentShift.id}`);
  
  // Opción 2: Modal con resumen
  // setIsReportModalOpen(true);
}, [currentShift]);
```

---

#### 2.3. Deprecar ShiftHeader Antiguo (15 min)
**Archivo**: `src/modules/shift-control/components/ShiftHeader.tsx`

**Opciones**:
1. **Mantener** por compatibilidad (comentar como deprecated)
2. **Eliminar** si no se usa en otro lugar

**Verificar uso**:
```bash
# Buscar imports de ShiftHeader
grep -r "from.*ShiftHeader" src/
```

Si solo se usa en ShiftControlWidget:
- [ ] Eliminar archivo `ShiftHeader.tsx`
- [ ] Eliminar export de `index.ts`
- [ ] Verificar que no hay imports rotos

---

#### 2.4. Testing Fase 2 (30 min)
**Checklist**:
```
[ ] Header muestra número de turno
[ ] Timer cuenta correctamente
[ ] Badge "Operativo" verde cuando activo
[ ] Metadata visible (quién abrió, ubicación)
[ ] Fecha relativa correcta ("hace X días")
[ ] Botón "Abrir Turno" funciona
[ ] Botón "Cerrar Turno" funciona
[ ] Botón "Ver Reporte" aparece (aunque sea placeholder)
[ ] Botones disabled cuando loading
[ ] Mobile responsive (test en DevTools)
```

---

### FASE 3: Financial Section Upgrade (1.5h)
**Objetivo**: Mejorar ShiftTotalsCard con comparativas y contexto

#### 3.1. Mejorar ShiftTotalsCard (1h)
**Archivo**: `src/modules/shift-control/components/ShiftTotalsCard.tsx`

**Mejoras**:
- [ ] Agregar comparativa histórica (vs turno anterior)
- [ ] Mostrar porcentajes en payment methods
- [ ] Integrar cash session inline (no widget separado)
- [ ] Color-coded indicators (✅ ⚠️ ❌)
- [ ] Layout más compacto

**Estructura mejorada**:
```tsx
export function ShiftTotalsCard({ shift, cashSession, loading }: Props) {
  // Calcular datos
  const total = calculateTotal(shift);
  const previousTotal = usePreviousShiftTotal(); // Hook nuevo
  const percentChange = calculatePercentChange(total, previousTotal);
  
  return (
    <Stack gap="4" bg="blue.50" p="4" borderRadius="lg" borderWidth="1px">
      {/* Sección título */}
      <HStack justify="space-between" align="center">
        <Text fontSize="xs" fontWeight="semibold" color="gray.600">
          💰 RESUMEN FINANCIERO
        </Text>
        
        {percentChange !== 0 && (
          <Badge colorPalette={percentChange > 0 ? 'green' : 'red'} size="sm">
            {percentChange > 0 ? '▲' : '▼'} {Math.abs(percentChange)}% vs anterior
          </Badge>
        )}
      </HStack>
      
      {/* Total prominente */}
      <Box textAlign="center" py="3">
        <Text fontSize="xs" color="gray.600" mb="1">TOTAL TURNO</Text>
        <Text fontSize="4xl" fontWeight="bold" color="blue.700">
          {formatCurrency(total)}
        </Text>
      </Box>
      
      {/* Payment methods con porcentajes */}
      <SimpleGrid columns={4} gap="3">
        {paymentMethods.map(method => (
          <Box key={method.key} textAlign="center" p="2" bg="white" borderRadius="md">
            <Text fontSize="2xl" mb="1">{method.icon}</Text>
            <Text fontSize="lg" fontWeight="bold">{formatCurrency(method.amount)}</Text>
            <Text fontSize="xs" color="gray.500">{method.percent}%</Text>
          </Box>
        ))}
      </SimpleGrid>
      
      {/* Cash session inline */}
      {cashSession && (
        <HStack 
          justify="space-between" 
          p="3" 
          bg="green.50" 
          borderRadius="md"
          borderWidth="1px"
          borderColor="green.200"
        >
          <HStack gap="2">
            <Text fontSize="lg">🏦</Text>
            <Box>
              <Text fontSize="sm" fontWeight="semibold">Caja Abierta</Text>
              <Text fontSize="xs" color="gray.600">
                Cajón: {formatCurrency(calculateCashInDrawer(cashSession))}
              </Text>
            </Box>
          </HStack>
          
          <Badge colorPalette="green">✓ Balance OK</Badge>
        </HStack>
      )}
    </Stack>
  );
}
```

**Hooks nuevos** (crear `src/modules/shift-control/hooks/usePreviousShiftTotal.ts`):
```typescript
export function usePreviousShiftTotal() {
  const { data } = useQuery({
    queryKey: ['shift', 'previous-total'],
    queryFn: async () => {
      const { data } = await supabase
        .from('operational_shifts')
        .select('cash_total, card_total, transfer_total, qr_total')
        .order('closed_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!data) return 0;
      
      return (data.cash_total || 0) + 
             (data.card_total || 0) + 
             (data.transfer_total || 0) + 
             (data.qr_total || 0);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  return data || 0;
}
```

---

#### 3.2. Testing Fase 3 (30 min)
**Checklist**:
```
[ ] Total turno visible y grande
[ ] Comparativa muestra % correcto
[ ] Payment methods muestran porcentajes
[ ] Cash session inline (no widget separado)
[ ] Balance indicator correcto (✅/⚠️/❌)
[ ] Layout responsive
[ ] No hay saltos visuales (skeleton?)
```

---

### FASE 4: Quick Actions Implementation (2h)
**Objetivo**: Sección de acciones operacionales frecuentes

#### 4.1. Definir Core Actions (30 min)
**Archivo**: `src/modules/shift-control/components/ShiftControlWidget.tsx`

**Core Actions** (siempre visibles si turno operativo):
1. **Nueva Venta** - navega a /admin/operations/sales/pos
2. **Nuevo Cliente** - abre modal CustomerFormModal

**Handlers**:
```typescript
const handleNewSale = useCallback(() => {
  navigate('/admin/operations/sales/pos');
}, [navigate]);

const handleNewCustomer = useCallback(() => {
  // TODO: Abrir modal de nuevo cliente
  // Por ahora, navegar
  navigate('/admin/core/crm/customers?action=new');
}, [navigate]);
```

**UI**:
```tsx
{isOperational && (
  <Stack gap="2">
    <Text fontSize="xs" fontWeight="semibold" color="gray.600">
      ⚡ ACCIONES RÁPIDAS
    </Text>
    
    <HStack gap="2" flexWrap="wrap">
      {/* Core actions */}
      <Button onClick={handleNewSale} size="md" colorPalette="green">
        🚀 Nueva Venta
      </Button>
      
      <Button onClick={handleNewCustomer} size="md" colorPalette="blue">
        👤 Nuevo Cliente
      </Button>
      
      {/* Module-injected actions */}
      <HookPoint
        name="shift-control.quick-actions"
        data={quickActionsData}
        direction="row"
        gap="2"
        fallback={null}
      />
    </HStack>
  </Stack>
)}
```

---

#### 4.2. Implementar Quick Actions en Módulos (1h)
**Módulos a modificar**:
1. Operations (Tables)
2. Fulfillment (Delivery)
3. Materials (Receive Stock)
4. Cash (Cash Drop)

**Ejemplo: Tables Quick Action**
**Archivo**: `src/modules/operations/manifest.tsx` (o similar)

```typescript
// En setup() del manifest
registry.addAction(
  'shift-control.quick-actions',
  ({ shift }) => {
    if (!shift) return null;
    
    return (
      <Button
        size="md"
        variant="outline"
        colorPalette="purple"
        onClick={() => navigate('/admin/operations/fulfillment/onsite')}
      >
        🍽️ Ver Mesas
      </Button>
    );
  },
  'operations-tables',
  50
);
```

**Ejemplo: Delivery Quick Action**
```typescript
registry.addAction(
  'shift-control.quick-actions',
  ({ shift }) => {
    if (!shift) return null;
    
    return (
      <Button
        size="md"
        variant="outline"
        colorPalette="cyan"
        onClick={() => navigate('/admin/operations/fulfillment/delivery')}
      >
        🚚 Mapa Entregas
      </Button>
    );
  },
  'fulfillment-delivery',
  40
);
```

**Criterio de inclusión**:
- ✅ Se usa >10 veces por turno
- ✅ Crítico para operación
- ✅ Tiempo-sensible
- ❌ NO configuraciones
- ❌ NO reportes

---

#### 4.3. Testing Fase 4 (30 min)
**Checklist**:
```
[ ] "Nueva Venta" navega correctamente
[ ] "Nuevo Cliente" funciona (navega o modal)
[ ] Module actions aparecen según features activos
[ ] Botones responsive (wrap en mobile)
[ ] Orden correcto de prioridades
[ ] No hay acciones duplicadas
```

---

### FASE 5: Operational Status (1h)
**Objetivo**: Sección de widgets inyectados limpia y funcional

#### 5.1. Mejorar HookPoint Layout (30 min)
**Archivo**: `src/modules/shift-control/components/ShiftControlWidget.tsx`

**Mejoras**:
```tsx
{isOperational && (
  <Stack gap="2">
    <Text fontSize="xs" fontWeight="semibold" color="gray.600">
      🎯 ESTADO OPERACIONAL
    </Text>
    
    <HStack gap="2" flexWrap="wrap" align="stretch">
      <HookPoint
        name="shift-control.indicators"
        data={indicatorsData}
        direction="row"
        gap="2"
        fallback={
          <Text fontSize="sm" color="gray.500">
            No hay indicadores activos
          </Text>
        }
      />
    </HStack>
    
    {/* Métricas de ritmo (opcional) */}
    {showMetrics && (
      <HStack gap="3" fontSize="xs" color="gray.600" mt="2">
        <Text>📊 Ritmo: {ordersPerHour} pedidos/hora</Text>
        <Text>•</Text>
        <Text>🎯 Meta: {targetOrdersPerHour}/hora</Text>
        {ritmoPercent < 100 && (
          <Badge colorPalette="orange" size="sm">
            {ritmoPercent}% de meta
          </Badge>
        )}
      </HStack>
    )}
  </Stack>
)}
```

---

#### 5.2. Widgets Opcionales (30 min)
**SI hay tiempo y features activos, crear**:

**TablesIndicator** (`src/modules/operations/widgets/TablesIndicator.tsx`):
```tsx
export function TablesIndicator({ openTablesCount }: { openTablesCount: number }) {
  if (openTablesCount === 0) return null;
  
  const navigate = useNavigate();
  
  return (
    <HStack
      gap="2"
      padding="3"
      borderWidth="1px"
      borderRadius="md"
      borderColor="purple.200"
      bg="purple.50"
      cursor="pointer"
      onClick={() => navigate('/admin/operations/fulfillment/onsite')}
      _hover={{ bg: 'purple.100' }}
    >
      <Icon color="purple.600"><TableCellsIcon /></Icon>
      <Text fontSize="sm" fontWeight="medium">
        {openTablesCount} mesas abiertas
      </Text>
    </HStack>
  );
}
```

Registrar en manifest con priority 60.

---

### FASE 6: Polish & Testing (2h)
**Objetivo**: Refinamiento final y testing completo

#### 6.1. Responsive Design (30 min)
**Tareas**:
- [ ] Test en mobile (320px, 375px, 414px)
- [ ] Test en tablet (768px, 1024px)
- [ ] Test en desktop (1280px, 1920px)
- [ ] Ajustar breakpoints si necesario
- [ ] Verificar flexWrap funciona
- [ ] Stack vertical en mobile

**Breakpoints**:
```tsx
<Stack 
  direction={{ base: 'column', md: 'row' }}
  gap="3"
>
  {/* Financial + Operational en mobile: vertical */}
  {/* Desktop: horizontal */}
</Stack>
```

---

#### 6.2. Performance (30 min)
**Métricas objetivo**:
- [ ] First render < 100ms
- [ ] Re-renders al actualizar < 50ms
- [ ] No re-renders innecesarios
- [ ] Memoización correcta

**Herramientas**:
```tsx
// React DevTools Profiler
// Buscar componentes con >10 renders

// Performance tab en Chrome
// Verificar layout shifts < 0.1 CLS
```

**Optimizaciones**:
- [ ] useMemo para cálculos costosos
- [ ] useCallback para handlers
- [ ] React.memo en sub-components
- [ ] Lazy load modal components

---

#### 6.3. Accessibility (30 min)
**Checklist WCAG AAA**:
```
[ ] Todos los botones tienen labels
[ ] Keyboard navigation funciona (Tab, Enter, Esc)
[ ] Focus indicators visibles
[ ] Color contrast > 7:1
[ ] Screen reader friendly (aria-labels)
[ ] No depende solo de color para info
[ ] Headings jerárquicos (h1, h2, h3)
```

**Testing**:
```bash
# Lighthouse audit
# Accessibility score > 95

# aXe DevTools
# 0 violations
```

---

#### 6.4. Testing End-to-End (30 min)
**Flujos completos**:

**Flujo 1: Apertura de turno**
```
1. Usuario sin turno ve dashboard
2. ShiftControl muestra "No hay turno activo"
3. Click "Abrir Turno"
4. Modal abre con validaciones
5. Completa form (ubicación, efectivo)
6. Sistema valida achievements
7. Turno se crea → Dashboard actualiza
8. Ve todas las secciones pobladas
9. Indicadores en 0 inicialmente
```

**Flujo 2: Operación durante turno**
```
1. Usuario con turno activo
2. Check-in empleado → Badge "👥 1" aparece
3. Nueva venta → Total turno aumenta
4. Abrir mesa → Badge "🍽️ 1" aparece
5. Stock bajo → Badge "⚠️ 1" aparece
6. Dashboard refleja cambios en tiempo real
```

**Flujo 3: Cierre de turno**
```
1. Usuario intenta cerrar turno
2. Sistema valida blockers
3. Si hay blockers → Muestra lista
4. Usuario resuelve uno a uno
5. Re-intenta → Sin blockers
6. Modal de cierre abre
7. Completa form (notas, discrepancias)
8. Turno cierra → Dashboard vuelve a "No hay turno"
```

---

## 📊 CRITERIOS DE ÉXITO

### Funcionales
- [x] Todas las secciones renderizan correctamente
- [x] Widgets se inyectan según módulos activos
- [x] Acciones del turno separadas de acciones operacionales
- [x] Header informativo con contexto completo
- [x] Financial section consolidada con comparativas
- [x] Quick actions claramente definidas
- [x] Ninguna funcionalidad rota

### UX
- [x] Jerarquía visual clara (F-pattern)
- [x] Cognitive load reducido (< 7 elementos por sección)
- [x] Acciones frecuentes accesibles (< 2 clicks)
- [x] Feedback inmediato (loading states)
- [x] Mobile-responsive (320px+)

### Performance
- [x] First Contentful Paint < 1.5s
- [x] Time to Interactive < 3s
- [x] Re-renders optimizados (< 5 por update)
- [x] No layout shifts (CLS < 0.1)
- [x] Lighthouse score > 90

### Código
- [x] 0 TypeScript errors
- [x] 0 ESLint warnings
- [x] 0 console.errors
- [x] Code coverage > 80% (si hay tests)
- [x] Arquitectura modular (HookPoints)

---

## 📁 ARCHIVOS MODIFICADOS/CREADOS

### Nuevos
```
src/modules/shift-control/components/
  ShiftHeroHeader.tsx                  ✅ NUEVO
  
src/modules/shift-control/utils/
  formatters.ts                        ✅ NUEVO

src/modules/shift-control/hooks/
  usePreviousShiftTotal.ts             ✅ NUEVO

src/modules/operations/widgets/
  TablesIndicator.tsx                  ⏳ OPCIONAL
  
src/modules/fulfillment/widgets/
  DeliveryIndicator.tsx                ⏳ OPCIONAL
```

### Modificados
```
src/modules/shift-control/components/
  ShiftControlWidget.tsx               ✅ MODIFICAR
  ShiftTotalsCard.tsx                  ✅ MEJORAR
  ShiftHeader.tsx                      ❌ DEPRECAR/ELIMINAR
  ShiftStats.tsx                       ❌ ELIMINAR INLINE

src/modules/staff/
  manifest.tsx                         ✅ REGISTRAR WIDGET

src/modules/materials/
  manifest.tsx                         ✅ REGISTRAR WIDGET
```

---

## ⏱️ TIMELINE

### Estimación Realista
```
Fase 1: Arquitectura Limpia        2h
Fase 2: Hero Header                 2.5h
Fase 3: Financial Section           1.5h
Fase 4: Quick Actions               2h
Fase 5: Operational Status          1h
Fase 6: Polish & Testing            2h
────────────────────────────────────────
TOTAL:                              11h
```

### Por Día (4h/día)
```
Día 1: Fase 1 + Fase 2 inicio       (4h)
Día 2: Fase 2 fin + Fase 3          (4h)
Día 3: Fase 4 + Fase 5 inicio       (4h)
Día 4: Fase 5 fin + Fase 6          (3h)
```

---

## 🚀 SIGUIENTE PASO

**¿Por dónde empezamos?**

**Opción A**: Fase 1 completa (2h)
- Arquitectura limpia primero
- Base sólida para resto

**Opción B**: Fase 2 primero (2.5h)
- Header nuevo más impactante
- Mejora visual inmediata

**Opción C**: Iterativo (1h cada vez)
- Fase 1.1 (30min)
- Fase 1.2 (30min)
- Review → Continuar

**Recomendación**: Opción A - Arquitectura limpia es prerequisito para todo lo demás.

---

**FIN DEL PLAN**
