# Módulo de Scheduling - G-Admin Mini

## 📋 Descripción del Módulo

El módulo de **Scheduling** es el sistema integral de gestión de horarios y planificación laboral de G-Admin Mini, proporcionando herramientas completas para la programación de turnos, gestión de tiempo libre, planificación de cobertura y seguimiento de costos laborales en tiempo real.

### Características principales:
- ✅ Sistema de programación de turnos avanzado
- ✅ Gestión integral de solicitudes de tiempo libre
- ✅ Planificador inteligente de cobertura de personal
- ✅ Seguimiento en tiempo real de costos laborales
- ✅ Motor de programación automática
- ✅ Interface tabbed para navegación eficiente
- ✅ Dashboard de métricas laborales
- ✅ Sistema de alertas y notificaciones

---

## 🏗️ Estructura Estándar de Módulo

Esta estructura representa nuestro **patrón oficial** para todos los módulos de G-Admin Mini:

```
src/pages/admin/resources/scheduling/
├── README.md                          # 📖 Este archivo (documentación completa)
├── page.tsx                           # 🎯 Página orquestadora (componente principal)
│
├── components/                        # 🧩 Componentes UI específicos del módulo
│   ├── index.ts                       # 📦 Barrel exports
│   ├── WeeklySchedule/               # 📅 Programación semanal
│   │   ├── WeeklyScheduleView.tsx
│   │   └── index.ts
│   ├── TimeOff/                      # 🏖️ Gestión de tiempo libre
│   │   ├── TimeOffManager.tsx
│   │   └── index.ts
│   ├── Coverage/                     # 👥 Planificación de cobertura
│   │   ├── CoveragePlanner.tsx
│   │   └── index.ts
│   ├── LaborCosts/                   # 💰 Seguimiento de costos
│   │   ├── LaborCostTracker.tsx
│   │   └── index.ts
│   ├── RealTime/                     # ⏱️ Monitoreo en tiempo real
│   │   ├── RealTimeLaborTracker.tsx
│   │   └── index.ts
│   ├── Analytics/                    # 📊 Análisis y reportes
│   │   ├── SchedulingAnalytics.tsx
│   │   └── index.ts
│   └── AutoSchedulingModal.tsx       # 🤖 Modal de programación automática
│
├── hooks/                             # 🪝 Hooks de negocio y página
│   ├── index.ts                       # 📦 Barrel exports
│   ├── useSchedulingPage.ts          # 🎭 Hook orquestador de la página
│   └── useScheduling.ts              # 📊 Hook de lógica de negocio
│
├── services/                          # ⚙️ Lógica de negocio y servicios
│   └── schedulingApi.ts              # 🔌 API de scheduling
│
└── types/                             # 🏷️ Definiciones TypeScript
    ├── index.ts                       # 📦 Barrel exports
    └── schedulingTypes.ts             # 🏗️ Tipos de scheduling
```

---

## 🎯 Patrón "Página Orquestadora"

### Concepto
El archivo `page.tsx` actúa como un **orquestador limpio** que:
- ✅ No contiene lógica de negocio
- ✅ Usa componentes semánticos del sistema de diseño
- ✅ Delega la lógica a hooks especializados
- ✅ Mantiene una estructura clara y consistente

### Implementación Actual

```tsx
// src/pages/admin/resources/scheduling/page.tsx
export default function SchedulingPage() {
  // 🎭 Toda la lógica delegada al hook orquestador
  const {
    viewState,
    schedulingStats,
    isAutoSchedulingOpen,
    handleTabChange,
    setViewState,
    setIsAutoSchedulingOpen,
    handleScheduleGenerated
  } = useSchedulingPage();

  return (
    <Stack gap="lg" align="stretch">
      {/* Header with KPIs - Using hook data */}
      <CardWrapper variant="elevated" padding="md">
        <CardWrapper.Body>
          <VStack gap="md" align="start">
            <HStack gap="sm">
              <Icon icon={CalendarIcon} size="lg" color="blue.600" />
              <VStack align="start" gap="xs">
                <HStack gap="sm">
                  <Typography variant="title">Staff Scheduling</Typography>
                  <Badge colorPalette="blue">Week View</Badge>
                </HStack>
                <Typography variant="body" color="text.muted">
                  Manage employee schedules, time-off requests, and labor costs
                </Typography>
              </VStack>
            </HStack>

            {/* KPI Row */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap="md" width="full">
              {/* KPI Cards */}
            </SimpleGrid>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Tabbed Layout for Sections */}
      <Tabs>
        <TabList>
          <Tab onClick={() => handleTabChange('schedule')}>
            <HStack gap="sm">
              <Icon icon={CalendarIcon} size="sm" />
              <Typography>Weekly Schedule</Typography>
            </HStack>
          </Tab>
          {/* More tabs... */}
        </TabList>

        <TabPanels>
          <TabPanel><WeeklyScheduleView /></TabPanel>
          <TabPanel><TimeOffManager /></TabPanel>
          <TabPanel><CoveragePlanner /></TabPanel>
          <TabPanel><LaborCostTracker /></TabPanel>
          <TabPanel><RealTimeLaborTracker /></TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
}
```

### Hook Orquestador Scheduling

```tsx
// src/pages/admin/resources/scheduling/hooks/useSchedulingPage.ts
export const useSchedulingPage = (): UseSchedulingPageReturn => {
  const { setQuickActions } = useNavigation();

  // 🚀 Configurar acciones rápidas del scheduling
  useEffect(() => {
    setQuickActions([
      {
        id: 'new-shift',
        label: 'New Shift',
        icon: PlusIcon,
        action: () => console.log('Opening new shift form')
      },
      {
        id: 'auto-schedule',
        label: 'Auto Schedule',
        icon: Cog6ToothIcon,
        action: () => setIsAutoSchedulingOpen(true)
      }
    ]);

    return () => setQuickActions([]);
  }, [setQuickActions]);

  return {
    viewState,
    schedulingStats,
    isAutoSchedulingOpen,
    handleTabChange,
    setViewState,
    setIsAutoSchedulingOpen,
    handleScheduleGenerated
  };
};
```

---

## 🎨 Sistema de Diseño Integrado

### Componentes Semánticos Obligatorios

```tsx
import {
  // 🏗️ Componentes de Layout Semánticos (PRIORIDAD)
  Stack, VStack, HStack,        // Estructuras de layout
  CardWrapper,                  // Contenedores de contenido
  Tabs, TabList, Tab, TabPanels, TabPanel, // Navegación tabbed
  SimpleGrid,                   // Grillas responsivas

  // 🧩 Componentes Base
  Typography, Icon, Badge,      // Elementos básicos

  // 📊 Componentes de Negocio
  [componentes específicos según necesidad]
} from '@/shared/ui'
```

### Reglas de Diseño
1. **❌ NUNCA** importar de `@chakra-ui/react` directamente
2. **✅ SIEMPRE** usar componentes del sistema de diseño
3. **✅ USAR** `CardWrapper` para contenido estructurado
4. **✅ APLICAR** `Tabs` para navegación entre secciones
5. **✅ DELEGAR** theming automático (tokens `gray.*`)

---

## 🧠 Arquitectura de Scheduling

### Secciones del Scheduling

```typescript
// Tipos de secciones disponibles
export type SchedulingTab =
  | 'schedule'        // Programación semanal
  | 'timeoff'         // Gestión de tiempo libre
  | 'coverage'        // Planificación de cobertura
  | 'costs'           // Seguimiento de costos laborales
  | 'realtime';       // Monitoreo en tiempo real

// Configuración de cada sección
export interface SchedulingStats {
  total_shifts_this_week: number;
  employees_scheduled: number;
  coverage_percentage: number;
  pending_time_off: number;
  labor_cost_this_week: number;
  overtime_hours: number;
  understaffed_shifts: number;
  approved_requests: number;
}
```

### Integración de Scheduling

```typescript
// types/schedulingTypes.ts
export interface Shift {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  status: ShiftStatus;
  break_time?: number;
  notes?: string;
}

export interface TimeOffRequest {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  type: 'vacation' | 'sick' | 'personal' | 'emergency';
  status: 'pending' | 'approved' | 'denied';
  reason?: string;
}
```

---

## 🔄 Integración con EventBus

### Eventos del Módulo Scheduling

```typescript
// Eventos que emite el módulo
const SCHEDULING_EVENTS = {
  SHIFT_CREATED: 'scheduling:shift_created',
  SHIFT_UPDATED: 'scheduling:shift_updated',
  SHIFT_DELETED: 'scheduling:shift_deleted',
  TIMEOFF_REQUESTED: 'scheduling:timeoff_requested',
  TIMEOFF_APPROVED: 'scheduling:timeoff_approved',
  SCHEDULE_PUBLISHED: 'scheduling:schedule_published',
  AUTO_SCHEDULE_GENERATED: 'scheduling:auto_schedule_generated',
  COVERAGE_ALERT: 'scheduling:coverage_alert'
} as const;

// Eventos que escucha el módulo
const SUBSCRIBED_EVENTS = [
  'staff:employee_added',           // Nuevo empleado disponible para scheduling
  'staff:employee_updated',         // Cambios en disponibilidad de empleado
  'staff:position_changed',         // Cambios de posición que afectan horarios
  'operations:demand_forecast',     // Pronóstico de demanda para ajustar cobertura
  'fiscal:labor_budget_updated',    // Actualizaciones de presupuesto laboral
  'system:notification_sent'        // Notificaciones enviadas a empleados
] as const;
```

---

## 📊 Testing Strategy

### Estructura de Tests

```
src/pages/admin/resources/scheduling/
├── __tests__/
│   ├── page.test.tsx                     # Tests del componente principal
│   ├── components/
│   │   ├── WeeklySchedule/
│   │   │   └── WeeklyScheduleView.test.tsx
│   │   ├── TimeOff/
│   │   │   └── TimeOffManager.test.tsx
│   │   ├── Coverage/
│   │   │   └── CoveragePlanner.test.tsx
│   │   ├── LaborCosts/
│   │   │   └── LaborCostTracker.test.tsx
│   │   └── RealTime/
│   │       └── RealTimeLaborTracker.test.tsx
│   ├── hooks/
│   │   ├── useSchedulingPage.test.ts     # Tests del hook orquestador
│   │   └── useScheduling.test.ts         # Tests del hook de negocio
│   └── services/
│       └── schedulingApi.test.ts         # Tests de servicios
```

---

## 🚀 Secciones del Scheduling

### ✅ Secciones Implementadas

1. **📅 Weekly Schedule (Programación Semanal)**
   - Vista de calendario semanal interactiva
   - Creación y edición de turnos
   - Gestión de plantillas de turnos
   - Copia de horarios entre semanas

2. **🏖️ Time Off (Gestión de Tiempo Libre)**
   - Solicitudes de tiempo libre
   - Proceso de aprobación/denegación
   - Calendario de ausencias
   - Gestión de diferentes tipos de licencias

3. **👥 Coverage Planning (Planificación de Cobertura)**
   - Análisis de cobertura por turno
   - Identificación de turnos con personal insuficiente
   - Sugerencias de cobertura automática
   - Gestión de empleados de reemplazo

4. **💰 Labor Costs (Seguimiento de Costos)**
   - Cálculo automático de costos laborales
   - Seguimiento de horas extra
   - Análisis de presupuesto vs real
   - Proyecciones de costos semanales/mensuales

5. **⏱️ Real-Time (Monitoreo en Tiempo Real)**
   - Estado actual de empleados
   - Alertas de asistencia
   - Seguimiento en vivo de horas trabajadas
   - Dashboard de métricas instantáneas

### 🔄 Flujo de Scheduling

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Weekly Schedule │───▶│   Time Off      │───▶│   Coverage      │
│                 │    │   Management    │    │   Planning      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Labor Costs    │    │   Real-Time     │    │   Auto Schedule │
│   Tracking      │    │   Monitoring    │    │    Engine       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔗 Referencias Técnicas

### Dependencias Clave Scheduling
- **CardWrapper**: Contenedores de sección estructurados
- **Tabs System**: Navegación entre secciones de scheduling
- **SimpleGrid**: Layout responsivo para KPIs y métricas
- **Real-time Updates**: Actualizaciones en tiempo real vía EventBus
- **Navigation Context**: Integración con navegación global
- **Auto-Scheduling Engine**: Motor de programación inteligente

### Patrones Scheduling Aplicados
- ✅ **Tabbed Interface**: Navegación eficiente entre funciones
- ✅ **Real-time Monitoring**: Métricas y estado actualizados
- ✅ **Smart Scheduling**: Programación automática inteligente
- ✅ **Cross-Module Integration**: Integración con Staff, Operations y Fiscal
- ✅ **Labor Cost Management**: Control integral de costos laborales

---

## 📈 Métricas de Calidad Scheduling

### Indicadores de Éxito Específicos
- ⚡ **Performance**: Carga de secciones < 200ms
- 🧪 **Testing Coverage**: > 85% en componentes críticos
- 📦 **Bundle Size**: Carga lazy de secciones no activas
- 🔧 **Scheduling Accuracy**: Programación automática > 95% precisión
- 🎯 **User Experience**: Navegación entre secciones < 1 segundo

### Validación Técnica Scheduling
```bash
# Comandos de verificación específicos
npm run test:scheduling       # Tests del módulo scheduling
npm run analyze:scheduling    # Análisis del sistema de scheduling
npm run validate:shifts       # Validación de turnos y horarios
npm run benchmark:auto        # Performance del motor automático
```

---

**🎯 Este README.md documenta el sistema integral de gestión de horarios de G-Admin Mini.**

**📋 El módulo Scheduling implementa el patrón oficial mientras proporciona gestión completa del capital humano y planificación laboral.**