# 🏢 Sistema de Capacidades de Negocio - Guía Completa

> **Última actualización**: 2025-09-08  
> **Autor**: Consolidación de business-dna-report.md + BUSINESS_CAPABILITIES_SYSTEM.md  
> **Estado**: Documento unificado

## 🎯 Visión General

El **Sistema de Capacidades Operativas** permite personalizar completamente la experiencia de G-Admin basándose en las capacidades que tiene cada negocio. Reemplaza el modelo rígido de "tipos de negocio" con un sistema flexible de flags booleanas y análisis comparativo inteligente.

### Objetivos Principales

- **Personalización Total**: Cada usuario ve solo las funcionalidades relevantes para su negocio
- **Escalabilidad**: Fácil agregar nuevas capacidades sin romper código existente
- **UX Simplificada**: Reduce sobrecarga cognitiva mostrando solo lo necesario
- **Flexibilidad**: Los negocios pueden activar/desactivar capacidades según evolucionen
- **Análisis Inteligente**: Comparación con cohorts similares para insights accionables

## 🏗️ Arquitectura del Sistema

### Estructura Base

```
src/
├── pages/setup/steps/business-setup/business-model/
│   ├── BusinessModelStep.tsx               # Componente principal del paso
│   ├── config/
│   │   └── businessCapabilities.ts        # Tipado y configuración
│   └── components/
│       ├── BusinessPreviewPanel.tsx       # Panel de preview
│       ├── CapabilityCard.tsx              # Card individual
│       ├── CapabilitySelector.tsx          # Selector principal
│       ├── ChannelOption.tsx               # Opciones de canal
│       ├── StructureOption.tsx             # Opciones de estructura
│       ├── SubCapabilityOption.tsx         # Sub-capacidades
│       └── constellation/
│           ├── BusinessConstellation.tsx   # Visualización principal
│           ├── ArchetypeStar.tsx           # Estrella central
│           └── OperationalPlanet.tsx       # Planetas operacionales
├── store/
│   └── businessCapabilitiesStore.ts       # Estado global (Zustand)
├── hooks/
│   └── usePersonalizedExperience.ts       # Hook principal
└── components/personalization/
    └── CapabilityGate.tsx                  # Renderizado condicional
```

### Flujo High-Level

1. **Setup Inicial**: Usuario configura capacidades de su negocio via wizard
2. **Personalización Automática**: Sistema adapta UI/funcionalidades según capacidades
3. **Cálculo de Tier**: Determina tier operacional basado en complejidad
4. **Personalización Continua**: Dashboard y tutoriales se adaptan dinámicamente

## 🎯 Tipos de Capacidades (Según Código Real)
```json
{
  "userDna": {
    "archetype": "Restaurante/Bar",
    "operationalProfile": [
      { "name": "Escala Local", "isUnlocked": true, "icon": "🏠" },
      { "name": "Canal Digital Sincrónico", "isUnlocked": false, "icon": "🌐" }
    ]
  },
  "comparativeInsights": [
    {
      "type": "donut_chart",
      "title": "Adopción de Canal Digital",
      "insight": "El 65% de los negocios como el tuyo ya venden online.",
      "data": [
        { "name": "Con Canal Digital", "value": 65 },
        { "name": "Sin Canal Digital", "value": 35 }
      ]
    }
  ],
  "contextualInsights": [
    {
      "title": "Oportunidad en Delivery",
      "text": "Considera activar el delivery para alcanzar a más clientes en tu área."
    }
  ]
}
```

## 📊 Componentes Frontend

### Página Principal DNA Report

**Ruta:** `/admin/reports/dna`

#### Componentes Principales:

**`DnaReportPage.tsx`**:
- Componente de página principal
- Fetch de datos del endpoint `/api/reports/business-dna`
- Manejo de estados loading/error
- Orquestación del layout del reporte

**`DnaReportConstellation.tsx`**:
- Versión reutilizable del `BusinessConstellation`
- Elementos visuales adicionales (anotaciones, paths destacados)
- Basado en insights de la API

**`ComparativeInsightCard.tsx`**:
- Card genérico para mostrar insights individuales
- Prop `type` (`donut_chart`, `bar_chart`, `text`)
- Integración con librería de charts (recharts/nivo)

**`PrintReportButton.tsx`**:
- Trigger de funcionalidad print del browser
- Stylesheet específico para impresión (`@media print`)
- Formato limpio para papel

## 🎯 Tipos de Capacidades (Según Código Real)

### Capacidades Principales
```typescript
interface BusinessCapabilities {
  // Ofertas Principales
  sells_products: boolean;
  sells_services: boolean;
  manages_events: boolean;
  manages_recurrence: boolean;

  // Sub-opciones de Productos
  sells_products_for_onsite_consumption: boolean;
  sells_products_for_pickup: boolean;
  sells_products_with_delivery: boolean;
  sells_digital_products: boolean;

  // Sub-opciones de Servicios
  sells_services_by_appointment: boolean;
  sells_services_by_class: boolean;
  sells_space_by_reservation: boolean;

  // Sub-opciones de Eventos
  hosts_private_events: boolean;
  manages_offsite_catering: boolean;

  // Sub-opciones de Recurrencia
  manages_rentals: boolean;
  manages_memberships: boolean;
  manages_subscriptions: boolean;

  // Capacidades Independientes
  has_online_store: boolean;
  is_b2b_focused: boolean;
}
```

### Estructura de Negocio
```typescript
type BusinessStructure = 'single_location' | 'multi_location' | 'mobile';
```

### Tiers Operacionales
```typescript
type OperationalTier = 
  | 'Sin Configurar' 
  | 'Básico' 
  | 'Intermedio' 
  | 'Avanzado' 
  | 'Empresa';
```

## 🔧 Implementación del Store

### BusinessCapabilitiesStore (Zustand)

**Ubicación**: `src/store/businessCapabilitiesStore.ts`

```typescript
interface BusinessCapabilitiesState {
  // Estado principal
  profile: BusinessProfile | null;
  isLoading: boolean;
  
  // Computed values para personalización
  enabledFeatures: string[];
  dashboardModules: string[];
  relevantTutorials: string[];
  
  // Actions principales
  initializeProfile: (basicData: Partial<BusinessProfile>) => void;
  setCapability: (capability: keyof BusinessCapabilities, value: boolean) => void;
  updateBasicInfo: (info: Partial<BusinessProfile>) => void;
  completeSetup: () => void;
  completeMilestone: (milestoneId: string) => void;
  resetProfile: () => void;
  
  // Helpers para personalización de UI
  hasCapability: (capability: keyof BusinessCapabilities) => boolean;
  shouldShowModule: (moduleId: string) => boolean;
  shouldShowTutorial: (tutorialId: string) => boolean;
  getOperationalTier: () => OperationalTier;
}
```

### Funciones Clave del Store

#### **setCapability**: Actualiza capacidad y recalcula dependencias
- Actualiza la capacidad específica
- Recalcula tier operacional automáticamente  
- Actualiza módulos habilitados del dashboard
- Recalcula tutoriales relevantes

#### **initializeProfile**: Configura perfil inicial
- Inicializa con capacidades por defecto (todas false)
- Establece módulos básicos del dashboard
- Configura país y moneda por defecto (Argentina, ARS)

#### **Personalización Automática**:
- `enabledFeatures`: Features del sistema habilitadas según capacidades
- `dashboardModules`: Módulos del dashboard a mostrar
- `relevantTutorials`: Tutoriales contextuales según setup

### Hook Principal

```typescript
function usePersonalizedExperience() {
  const store = useBusinessCapabilitiesStore();
  
  return {
    // Estado principal
    profile: store.profile,
    tier: store.getOperationalTier(),

    // Módulos y navegación
    modules: personalizedModules,
    navigationItems: getNavigationItems(),

    // Dashboard personalizado
    dashboardWidgets: personalizedDashboardWidgets,
    dashboardLayout: getDashboardLayout(),

    // Sistema de tutoriales y logros
    tutorials: personalizedTutorials,
    milestones: personalizedMilestones,
    onboardingFlow: getOnboardingFlow(),

    // Helper functions
    hasCapability: store.hasCapability,
    shouldShowModule: store.shouldShowModule,
    shouldShowFeature,
    
    // Progreso y métricas
    setupProgress: {
      completed: completedMilestones,
      total: totalMilestones,
      percentage: Math.round((completedMilestones / totalMilestones) * 100)
    }
  };
}
```

## 🎨 Componentes UI

### BusinessModelStep (Componente Principal)

**Ubicación**: `src/pages/setup/steps/business-setup/business-model/BusinessModelStep.tsx`

```typescript
function BusinessModelStep() {
  const { profile, setCapability, completeSetup } = useBusinessCapabilitiesStore();
  
  return (
    <HStack spacing={8} align="start">
      <VStack flex={1} spacing={6}>
        <CapabilitySelector />
        <BusinessPreviewPanel />
      </VStack>
      <Box flex={1}>
        <BusinessConstellation capabilities={profile?.capabilities} />
      </Box>
    </HStack>
  );
}
```

### CapabilityCard

**Ubicación**: `src/pages/setup/steps/business-setup/business-model/components/CapabilityCard.tsx`

```typescript
interface CapabilityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggle: () => void;
  children: React.ReactNode;
}

function CapabilityCard({
  icon,
  title,
  description,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  children,
}: CapabilityCardProps) {
  return (
    <Box>
      <Box
        borderWidth="1px"
        borderColor={isSelected ? 'gray.400' : 'gray.200'}
        borderRadius="lg"
        bg={isSelected ? 'gray.100' : 'transparent'}
        transition="all 0.2s"
        _hover={{
          borderColor: isSelected ? 'gray.400' : 'gray.300',
          bg: isSelected ? 'gray.200' : 'gray.100',
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        }}
        overflow="hidden"
      >
        <Flex p={4} align="center" justify="space-between" onClick={onSelect} cursor="pointer">
          <HStack gap={3}>
            <Circle
              size="36px"
              bg={isSelected ? 'gray.700' : 'gray.100'}
              color={isSelected ? 'gray.50' : 'gray.600'}
            >
              {icon}
            </Circle>
            <Stack gap={0}>
              <Text fontWeight="medium" fontSize="sm">{title}</Text>
              <Text fontSize="xs" color="gray.600">{description}</Text>
            </Stack>
          </HStack>
          {isSelected && (
            <Box onClick={(e) => { e.stopPropagation(); onToggle(); }} cursor="pointer">
              {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Box>
          )}
        </Flex>

        <AnimatePresence>
          {isSelected && isExpanded && (
            <Collapsible.Root open={isExpanded}>
              <Collapsible.Content>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box p={4} pt={0} borderTop="1px solid" borderColor="gray.200">
                    {children}
                  </Box>
                </motion.div>
              </Collapsible.Content>
            </Collapsible.Root>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
```

### Otros Componentes Relacionados

**CapabilitySelector**: `src/pages/setup/steps/business-setup/business-model/components/CapabilitySelector.tsx`

**BusinessConstellation**: `src/pages/setup/steps/business-setup/business-model/components/BusinessConstellation.tsx`

**BusinessPreviewPanel**: `src/pages/setup/steps/business-setup/business-model/components/BusinessPreviewPanel.tsx`

## 📊 Ejemplo de Uso Completo

```typescript
// En BusinessModelStep.tsx
function BusinessModelStep({ onComplete, onBack }: BusinessModelStepProps) {
  const businessModel = useBusinessCapabilities();
  const [selectedCompetencies, setSelectedCompetencies] = useState({
    products: false,
    services: false,
    events: false,
    recurrence: false,
  });

  const handleCompetencyChange = (competency: keyof typeof selectedCompetencies) => {
    const isSelected = !selectedCompetencies[competency];
    setSelectedCompetencies(prev => ({ ...prev, [competency]: isSelected }));

    // Mapeo de competencias a capacidades principales
    const competencyToCapabilityMap = {
      products: 'sells_products',
      services: 'sells_services', 
      events: 'manages_events',
      recurrence: 'manages_recurrence',
    };

    const mainCapability = competencyToCapabilityMap[competency];
    
    if (businessModel.capabilities[mainCapability] !== isSelected) {
      businessModel.toggleMainCapability(mainCapability);
    }
  };

  const handleSubmit = () => {
    if (!businessModel.canSubmit) {
      console.log('❌ Cannot submit - validation failed');
      return;
    }
    
    const finalData = businessModel.getBusinessModelData();
    console.log('✅ Business model defined:', finalData);
    onComplete(finalData);
  };

  return (
    <Grid templateColumns={{ base: '1fr', lg: '3fr 1.2fr' }} gap={8}>
      <GridItem>
        {/* Configuración interactiva */}
        <CapabilitySelector
          capabilities={businessModel.capabilities}
          expandedCards={businessModel.expandedCards}
          selectedCompetencies={selectedCompetencies}
          onToggleMain={businessModel.toggleMainCapability}
          onToggleSub={businessModel.toggleSubCapability}
          onToggleCard={businessModel.toggleCard}
        />
      </GridItem>
      
      <GridItem>
        {/* Panel de preview del negocio */}
        <BusinessPreviewPanel 
          capabilities={businessModel.capabilities}
          profile={businessModel.operationalProfile}
        />
      </GridItem>
    </Grid>
  );
}
```

## 🔄 Flujo de Datos

1. **Inicialización**: Se carga el store con capacidades por defecto
2. **Selección de Competencias**: Usuario activa competencias principales (productos, servicios, eventos, recurrencia)
3. **Configuración Detallada**: Se expanden sub-capacidades específicas para cada competencia
4. **Perfil Operacional**: Se define estructura organizacional y canales de venta
5. **Validación**: El sistema verifica consistencia de la configuración
6. **Persistencia**: Se guarda el modelo de negocio completo en Supabase

## 🎯 Estados del Sistema

- **Inicial**: Sin capacidades seleccionadas
- **Configurando**: Seleccionando capacidades principales y sub-capacidades
- **Validando**: Verificando consistencia del modelo
- **Completo**: Modelo validado y listo para usar
- **Guardado**: Configuración persistida en base de datos

## 🚀 Integración con Otros Módulos

El sistema de capacidades de negocio se integra con:

- **Setup Wizard**: Determina qué pasos mostrar según capacidades
- **Dashboard**: Personaliza widgets según el modelo de negocio
- **Navegación**: Filtra módulos disponibles
- **Análisis**: Adapta métricas y reportes al tipo de negocio
- **Tutoriales**: Personaliza onboarding según capacidades

---

✅ **Documentación actualizada** - Todas las rutas, componentes e interfaces ahora reflejan la implementación actual del código.
interface CapabilityCardProps {
  capability: OperationalCapability;
  onToggle: () => void;
}

function CapabilityCard({ capability, onToggle }: CapabilityCardProps) {
  return (
    <Card 
      variant={capability.isUnlocked ? "elevated" : "outline"}
      cursor="pointer"
      onClick={onToggle}
    >
      <CardBody textAlign="center">
        <Text fontSize="3xl">{capability.icon}</Text>
        <Text fontWeight="bold">{capability.name}</Text>
        <BusinessImpactBadges impact={capability.businessImpact} />
      </CardBody>
    </Card>
  );
}
```

## 📈 Análisis Comparativo

### Métricas de Cohort

```typescript
interface CohortAnalysis {
  primaryCohort: {
    archetype: BusinessArchetype;
    sampleSize: number;
    averageCapabilities: number;
    topCapabilities: Array<{
      capability: string;
      adoptionRate: number;
    }>;
  };
  
  comparativeMetrics: Array<{
    capability: string;
    userHas: boolean;
    cohortAdoption: number;
    recommendation: 'maintain' | 'consider' | 'priority';
    impact: 'high' | 'medium' | 'low';
  }>;
  
  insights: Array<{
    type: 'opportunity' | 'strength' | 'gap';
    title: string;
    description: string;
    actionable: boolean;
  }>;
}
```

### Generación de Insights

```typescript
function generateContextualInsights(
  userCapabilities: OperationalCapability[],
  cohortData: CohortAnalysis
): ContextualInsight[] {
  const insights: ContextualInsight[] = [];
  
  // Detectar oportunidades
  cohortData.comparativeMetrics
    .filter(metric => !metric.userHas && metric.cohortAdoption > 0.6)
    .forEach(opportunity => {
      insights.push({
        type: 'opportunity',
        title: `Oportunidad en ${opportunity.capability}`,
        description: `El ${Math.round(opportunity.cohortAdoption * 100)}% de negocios similares ya usa esta capacidad`,
        actionable: true,
        capability: opportunity.capability
      });
    });
    
  // Detectar fortalezas
  cohortData.comparativeMetrics
    .filter(metric => metric.userHas && metric.cohortAdoption < 0.4)
    .forEach(strength => {
      insights.push({
        type: 'strength',
        title: `Ventaja Competitiva`,
        description: `Tienes ${strength.capability}, que solo usa el ${Math.round(strength.cohortAdoption * 100)}% de tu competencia`,
        actionable: false
      });
    });
    
  return insights;
}
```

## 🔗 Integración con Módulos

### Conditional Rendering

```typescript
// En cualquier componente
function SalesModule() {
  const { canAccess } = usePersonalizedExperience();
  
  return (
    <div>
      <BasicSalesFeatures />
      
      {canAccess('delivery') && <DeliverySection />}
      {canAccess('dine-in') && <TableManagement />}
      {canAccess('pos-avanzado') && <AdvancedPOSFeatures />}
      {canAccess('analytics') && <SalesAnalytics />}
    </div>
  );
}
```

### Feature Gates

```typescript
// Sistema de feature gates basado en capacidades
const FEATURE_REQUIREMENTS = {
  'table-management': ['dine-in'],
  'delivery-tracking': ['delivery', 'canal-digital'],
  'inventory-forecasting': ['gestion-inventario', 'analytics'],
  'staff-scheduling': ['gestion-staff'],
  'multi-location-reporting': ['multi-ubicacion', 'analytics']
};

function useFeatureAccess(feature: string): boolean {
  const { getActiveCapabilities } = usePersonalizedExperience();
  
  const requirements = FEATURE_REQUIREMENTS[feature] || [];
  const activeCapabilityIds = getActiveCapabilities().map(c => c.id);
  
  return requirements.every(req => activeCapabilityIds.includes(req));
}
```

## 🎯 Casos de Uso

### Caso 1: Restaurante Tradicional
```typescript
const traditionalRestaurant = {
  archetype: "Restaurante/Bar",
  capabilities: [
    "escala-local",
    "dine-in", 
    "take-away",
    "pos-basico",
    "gestion-inventario"
  ]
};
// UI muestra: Gestión de mesas, inventario básico, POS simple
```

### Caso 2: Cloud Kitchen
```typescript
const cloudKitchen = {
  archetype: "Cloud Kitchen", 
  capabilities: [
    "delivery",
    "canal-digital-sincrónico",
    "cocina-compartida",
    "analytics",
    "automatización"
  ]
};
// UI muestra: Panel de delivery, analytics avanzados, automatización
```

### Caso 3: Multi-ubicación
```typescript
const multiLocation = {
  archetype: "Restaurante/Bar",
  capabilities: [
    "multi-ubicacion",
    "dine-in",
    "delivery", 
    "gestion-staff",
    "analytics",
    "pos-avanzado"
  ]
};
// UI muestra: Dashboard multi-ubicación, gestión centralizada de staff
```

## 🔧 Troubleshooting

### Problemas Comunes

**1. Capacidades no se guardan**
- Verificar conexión a base de datos
- Comprobar permisos de usuario
- Validar formato de datos en store

**2. UI no se actualiza después de cambio**
- Verificar subscripción al store
- Comprobar que `canAccess` está siendo usado correctamente
- Revisar dependencias de useEffect

**3. Insights comparativos incorrectos**
- Verificar tamaño de cohort (mínimo 10 negocios)
- Comprobar filtros de arquetipo
- Validar cálculos de porcentajes

### Debugging

```typescript
// Hook para debugging
function useCapabilitiesDebug() {
  const store = useBusinessCapabilitiesStore();
  
  useEffect(() => {
    console.log('Capabilities Debug:', {
      archetype: store.archetype,
      activeCount: store.getActiveCapabilities().length,
      totalCount: store.capabilities.length,
      activeCapabilities: store.getActiveCapabilities().map(c => c.id)
    });
  }, [store.capabilities, store.archetype]);
}
```

## 📝 Notas de Implementación

### Consideraciones de Performance
- **Lazy Loading**: Cargar capacidades solo cuando se necesiten
- **Memoización**: Usar React.memo para CapabilityCard
- **Debounce**: Para saves automáticos de configuración

### Consideraciones de UX
- **Onboarding**: Wizard guiado para setup inicial
- **Progressive Disclosure**: Mostrar capacidades avanzadas gradualmente
- **Feedback Visual**: Animaciones para cambios de estado

### Consideraciones de Datos
- **Backup**: Mantener configuración anterior en caso de rollback
- **Versionado**: Sistema de versiones para esquema de capacidades
- **Migración**: Scripts para migrar usuarios de sistema anterior

## 🔗 Referencias

- **API Documentation**: Endpoints específicos en `/api/business-capabilities`
- **Component Library**: Componentes reutilizables en `src/shared/ui`
- **Business Logic**: Lógica de negocio en `src/business-logic/capabilities`
- **Database Schema**: Tablas relacionadas en `business_profiles` y `capability_templates`
