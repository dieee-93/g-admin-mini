# Módulo de Operations Hub - G-Admin Mini

## 📋 Descripción del Módulo

El módulo de **Operations Hub** es el centro de comando operacional de G-Admin Mini, integrando gestión de cocina, planificación de recursos, administración de mesas y monitoreo en tiempo real. Proporciona una vista unificada de todas las operaciones del restaurante para optimizar eficiencia y coordinación.

### Características principales:
- ✅ Centro de comando operacional unificado
- ✅ Gestión de cocina y órdenes en tiempo real
- ✅ Planificación de recursos y horarios
- ✅ Administración de mesas y reservas
- ✅ Monitoreo de métricas operacionales
- ✅ Interface tabbed para navegación eficiente
- ✅ Dashboard de estado general
- ✅ Alertas y notificaciones operacionales

---

## 🏗️ Estructura Estándar de Módulo

Esta estructura representa nuestro **patrón oficial** para todos los módulos de G-Admin Mini:

```
src/pages/admin/operations/hub/
├── README.md                     # 📖 Este archivo (documentación completa)
├── page.tsx                      # 🎯 Página orquestadora (componente principal)
│
├── components/                   # 🧩 Componentes UI específicos del módulo
│   ├── index.ts                  # 📦 Barrel exports
│   ├── Planning/                 # 📅 Planificación y horarios
│   │   ├── Planning.tsx
│   │   └── index.ts
│   ├── Kitchen/                  # 🍳 Gestión de cocina
│   │   ├── Kitchen.tsx
│   │   └── index.ts
│   ├── Tables/                   # 🪑 Administración de mesas
│   │   ├── Tables.tsx
│   │   └── index.ts
│   ├── Monitoring/               # 📊 Monitoreo en tiempo real
│   │   ├── Monitoring.tsx
│   │   └── index.ts
│   └── OperationsHeader.tsx      # 🎯 Header de operaciones
│
├── hooks/                        # 🪝 Hooks de negocio y página
│   ├── index.ts                  # 📦 Barrel exports
│   ├── useHubPage.ts            # 🎭 Hook orquestador de la página
│   └── useKitchenConfig.ts      # 🍳 Hook de configuración de cocina
│
├── services/                     # ⚙️ Lógica de negocio y servicios
│   └── [servicios]/             # 🔧 Servicios de operaciones
│
├── types/                        # 🏷️ Definiciones TypeScript
│   ├── index.ts                  # 📦 Barrel exports
│   └── operationsTypes.ts        # 🏗️ Tipos de operaciones
│
├── schedules/                    # 📅 Configuraciones de horarios
└── tables.tsx                   # 🪑 Configuración de mesas (legacy)
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
// src/pages/admin/operations/hub/page.tsx
export default function OperationsPage() {
  // 🎭 Toda la lógica delegada al hook orquestador
  const {
    overviewCards,
    tabs
  } = useHubPage();

  return (
    <Stack gap="lg" align="stretch">
      <OperationsHeader />

      {/* 🎯 Overview Cards usando datos del hook */}
      <Stack direction={{ base: 'column', lg: 'row' }} gap="md">
        {overviewCards.map((card) => (
          <CardWrapper key={card.id} variant="elevated" padding="md" width="full">
            <CardWrapper.Body>
              <VStack align="start" gap="xs">
                <HStack gap="sm">
                  <Icon icon={card.icon} size="lg" color={card.color} />
                  <Typography variant="title">{card.title}</Typography>
                </HStack>
                <Typography variant="body" color="text.muted">
                  {card.description}
                </Typography>
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>
        ))}
      </Stack>

      {/* 🗂️ Interface tabbed para secciones */}
      <Tabs>
        <TabList>
          {tabs.map((tab) => (
            <Tab key={tab.id}>{tab.label}</Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel><Planning /></TabPanel>
          <TabPanel><Kitchen /></TabPanel>
          <TabPanel><Tables /></TabPanel>
          <TabPanel><Monitoring /></TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
}
```

### Hook Orquestador Operations Hub

```tsx
// src/pages/admin/operations/hub/hooks/useHubPage.ts
export const useHubPage = (): UseHubPageReturn => {
  const { setQuickActions } = useNavigation();

  // 🚀 Configurar acciones rápidas del operations hub
  useEffect(() => {
    setQuickActions([
      {
        id: 'new-recipe',
        label: 'Nueva Receta',
        icon: CogIcon,
        action: () => console.log('New recipe'),
        color: 'orange'
      }
    ]);

    return () => setQuickActions([]);
  }, [setQuickActions]);

  // 📊 Configuración de cards de overview
  const overviewCards = [
    {
      id: 'planning',
      icon: CalendarIcon,
      title: 'Planificación',
      description: 'Gestión de horarios y recursos',
      color: 'blue.600'
    },
    {
      id: 'kitchen',
      icon: CogIcon,
      title: 'Cocina',
      description: 'Estado y órdenes activas',
      color: 'green.600'
    },
    {
      id: 'tables',
      icon: ChartBarIcon,
      title: 'Mesas',
      description: 'Ocupación y reservas',
      color: 'purple.600'
    },
    {
      id: 'monitoring',
      icon: ClockIcon,
      title: 'Monitoreo',
      description: 'Métricas en tiempo real',
      color: 'orange.600'
    }
  ];

  return {
    overviewCards,
    tabs: [
      { id: 'planning', label: 'Planificación', component: 'Planning' },
      { id: 'kitchen', label: 'Cocina', component: 'Kitchen' },
      { id: 'tables', label: 'Mesas', component: 'Tables' },
      { id: 'monitoring', label: 'Monitoreo', component: 'Monitoring' }
    ]
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

  // 🧩 Componentes Base
  Typography, Icon,             // Elementos básicos

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

## 🧠 Arquitectura de Hub Operacional

### Secciones del Hub

```typescript
// Tipos de secciones disponibles
export type HubSection =
  | 'planning'        // Planificación de recursos y horarios
  | 'kitchen'         // Gestión de cocina y órdenes
  | 'tables'          // Administración de mesas
  | 'monitoring';     // Monitoreo en tiempo real

// Configuración de cada sección
export interface HubSectionConfig {
  id: HubSection;
  title: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  component: React.ComponentType;
}
```

### Integración Operacional

```typescript
// services/operationsService.ts
export class OperationsService {
  /**
   * 🍳 Gestión de cocina
   */
  static async getKitchenStatus(): Promise<KitchenStatus> {
    // Estado actual de la cocina
  }

  /**
   * 📅 Planificación de recursos
   */
  static async getResourceAllocation(): Promise<ResourceAllocation[]> {
    // Asignación actual de recursos
  }

  /**
   * 🪑 Estado de mesas
   */
  static async getTablesStatus(): Promise<Table[]> {
    // Estado actual de todas las mesas
  }

  /**
   * 📊 Métricas en tiempo real
   */
  static async getOperationsMetrics(): Promise<OperationsMetrics> {
    // Métricas operacionales actuales
  }
}
```

---

## 🔄 Integración con EventBus

### Eventos del Módulo Operations Hub

```typescript
// Eventos que emite el módulo
const HUB_EVENTS = {
  SECTION_CHANGED: 'hub:section_changed',
  ORDER_STATUS_UPDATED: 'hub:order_status_updated',
  TABLE_STATUS_CHANGED: 'hub:table_status_changed',
  ALERT_TRIGGERED: 'hub:alert_triggered',
  METRICS_UPDATED: 'hub:metrics_updated'
} as const;

// Eventos que escucha el módulo
const SUBSCRIBED_EVENTS = [
  'kitchen:order_completed',        // Actualizar estado de cocina
  'sales:order_created',            // Nueva orden en el sistema
  'staff:schedule_updated',         // Cambios en horarios
  'tables:reservation_made',        // Nueva reserva de mesa
  'system:alert_generated'          // Alertas del sistema
] as const;
```

---

## 📊 Testing Strategy

### Estructura de Tests

```
src/pages/admin/operations/hub/
├── __tests__/
│   ├── page.test.tsx                    # Tests del componente principal
│   ├── components/
│   │   ├── Planning/
│   │   │   └── Planning.test.tsx
│   │   ├── Kitchen/
│   │   │   └── Kitchen.test.tsx
│   │   ├── Tables/
│   │   │   └── Tables.test.tsx
│   │   └── Monitoring/
│   │       └── Monitoring.test.tsx
│   ├── hooks/
│   │   ├── useHubPage.test.ts           # Tests del hook orquestador
│   │   └── useKitchenConfig.test.ts
│   └── services/
│       └── operationsService.test.ts    # Tests de servicios
```

---

## 🚀 Secciones del Operations Hub

### ✅ Secciones Implementadas

1. **📅 Planning (Planificación)**
   - Gestión de horarios de personal
   - Asignación de recursos
   - Programación de turnos

2. **🍳 Kitchen (Cocina)**
   - Estado de órdenes activas
   - Gestión de cola de preparación
   - Métricas de eficiencia

3. **🪑 Tables (Mesas)**
   - Estado de ocupación
   - Gestión de reservas
   - Rotación de mesas

4. **📊 Monitoring (Monitoreo)**
   - Métricas en tiempo real
   - Alertas operacionales
   - Dashboard de KPIs

### 🔄 Flujo Operacional

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Planning   │───▶│   Kitchen   │───▶│   Tables    │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│                Monitoring                           │
│            (Métricas Consolidadas)                  │
└─────────────────────────────────────────────────────┘
```

---

## 🔗 Referencias Técnicas

### Dependencias Clave Operations Hub
- **CardWrapper**: Contenedores de sección estructurados
- **Tabs System**: Navegación entre secciones operacionales
- **OperationsHeader**: Header especializado del hub
- **Real-time Updates**: Actualizaciones en tiempo real vía EventBus
- **Navigation Context**: Integración con navegación global

### Patrones Operations Hub Aplicados
- ✅ **Tabbed Interface**: Navegación eficiente entre secciones
- ✅ **Real-time Monitoring**: Métricas y estado actualizados
- ✅ **Unified Command Center**: Centro de comando operacional
- ✅ **Cross-Section Integration**: Integración entre áreas operativas
- ✅ **Alert Management**: Sistema de alertas y notificaciones

---

## 📈 Métricas de Calidad Operations Hub

### Indicadores de Éxito Específicos
- ⚡ **Performance**: Carga de secciones < 200ms
- 🧪 **Testing Coverage**: > 85% en componentes críticos
- 📦 **Bundle Size**: Carga lazy de secciones no activas
- 🔧 **Operations Accuracy**: Datos en tiempo real > 99% precisión
- 🎯 **User Experience**: Navegación entre secciones < 1 segundo

### Validación Técnica Operations Hub
```bash
# Comandos de verificación específicos
npm run test:operations       # Tests del módulo operations
npm run analyze:hub          # Análisis del hub operacional
npm run validate:realtime    # Validación de datos en tiempo real
npm run benchmark:sections   # Performance de secciones
```

---

**🎯 Este README.md documenta el centro de comando operacional de G-Admin Mini.**

**📋 El módulo Operations Hub implementa el patrón oficial mientras proporciona gestión unificada de todas las operaciones del restaurante.**