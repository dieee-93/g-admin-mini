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
├── types/
│   └── businessCapabilities.ts     # Tipado y configuración
├── store/
│   └── businessCapabilitiesStore.ts # Estado global (Zustand)
├── hooks/
│   └── usePersonalizedExperience.ts # Hook principal
├── components/
│   ├── setup/
│   │   ├── BusinessCapabilitiesForm.tsx    # Pantalla principal
│   │   ├── CapabilityCard.tsx              # Card individual
│   │   └── BusinessConstellation.tsx       # Visualización
│   └── reports/
│       ├── DnaReportConstellation.tsx      # Reporte visual
│       ├── ComparativeInsightCard.tsx      # Insights comparativos
│       └── PrintReportButton.tsx           # Funcionalidad de impresión
└── pages/admin/reports/dna/
    └── page.tsx                            # Página de reporte DNA
```

### Flujo High-Level

1. **Setup Inicial**: Usuario configura capacidades de su negocio
2. **Personalización Automática**: Sistema adapta UI/funcionalidades
3. **Análisis Comparativo**: Generación de insights vs cohort similar
4. **Reporte DNA**: Visualización completa del perfil de negocio

## 🧬 Business DNA Report - Diseño Técnico

### Backend API

**Endpoint:** `POST /api/reports/business-dna`

**Autenticación:** Requiere sesión de usuario autenticada

**Request Body:**
```json
{
  "userId": "string"
}
```

**Lógica del Backend:**

1. **Fetch User DNA**: Obtener `archetype` y `operationalProfile` del userId
2. **Análisis de Cohort**: Query de base de datos para cohort anónimo
   - **Cohort Primario**: Negocios con mismo `archetype`
   - **Cohort Secundario**: Negocios con al menos un `operationalProfile` superpuesto
3. **Generar Insights Comparativos**: Calcular métricas clave
   - % de negocios del cohort que tienen cierta "capacidad" desbloqueada
   - Combinación más común de capacidades para el arquetipo
   - Promedio de capacidades desbloqueadas por arquetipo
4. **Generar Insights Contextuales**: Proveer consejo accionable
5. **Construir Respuesta**: Ensamblar data en response JSON

**Response Body:**
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

## 🎯 Tipos de Capacidades

### Arquetipos Base
```typescript
type BusinessArchetype = 
  | "Restaurante/Bar"
  | "Cafetería/Panadería" 
  | "Food Truck"
  | "Catering"
  | "Delivery Kitchen"
  | "Retail Food"
  | "Cloud Kitchen";
```

### Capacidades Operativas
```typescript
interface OperationalCapability {
  id: string;
  name: string;
  icon: string;
  category: CapabilityCategory;
  isUnlocked: boolean;
  dependencies?: string[];
  businessImpact: {
    revenue: number;
    efficiency: number;
    customerSatisfaction: number;
  };
}

type CapabilityCategory = 
  | "Escala" 
  | "Canal"
  | "Especialización"
  | "Tecnología"
  | "Operaciones";
```

### Ejemplos de Capacidades

#### **Escala**
- 🏠 **Escala Local**: Operación en una ubicación fija
- 🌆 **Multi-Ubicación**: Múltiples sucursales o ubicaciones
- 🌍 **Escala Regional**: Operación en múltiples ciudades/regiones

#### **Canal**
- 🍽️ **Dine-In**: Servicio en mesa tradicional
- 🥡 **Take-Away**: Pedidos para llevar
- 🚚 **Delivery**: Entrega a domicilio
- 🌐 **Canal Digital Sincrónico**: Pedidos online en tiempo real
- 📱 **Canal Digital Asíncrono**: Pedidos con anticipación

#### **Especialización**
- 🎂 **Eventos**: Catering para eventos especiales
- ☕ **Café Premium**: Especialización en café de especialidad
- 🥗 **Healthy Food**: Enfoque en comida saludable
- 🍕 **Fast Food**: Comida rápida estandarizada

#### **Tecnología**
- 💳 **POS Avanzado**: Sistema de punto de venta integrado
- 📊 **Analytics**: Análisis de datos avanzado
- 🤖 **Automatización**: Procesos automatizados
- 📱 **App Móvil**: Aplicación móvil propia

#### **Operaciones**
- 👨‍🍳 **Cocina Compartida**: Uso de cocinas de terceros
- 📦 **Gestión de Inventario**: Control avanzado de stock
- 👥 **Gestión de Staff**: Manejo de equipos grandes
- 💰 **Multi-Payment**: Múltiples métodos de pago

## 🔧 Implementación del Store

### BusinessCapabilitiesStore (Zustand)

```typescript
interface BusinessCapabilitiesState {
  // Estado
  capabilities: OperationalCapability[];
  archetype: BusinessArchetype | null;
  isLoading: boolean;
  
  // Acciones
  setArchetype: (archetype: BusinessArchetype) => void;
  toggleCapability: (capabilityId: string) => void;
  setCapabilities: (capabilities: OperationalCapability[]) => void;
  loadCapabilities: () => Promise<void>;
  saveCapabilities: () => Promise<void>;
  
  // Selectores
  getActiveCapabilities: () => OperationalCapability[];
  getCapabilitiesByCategory: (category: CapabilityCategory) => OperationalCapability[];
  canAccess: (feature: string) => boolean;
}
```

### Hook Principal

```typescript
function usePersonalizedExperience() {
  const store = useBusinessCapabilitiesStore();
  
  return {
    // Estado
    capabilities: store.capabilities,
    archetype: store.archetype,
    isLoading: store.isLoading,
    
    // Funciones de acceso
    canAccess: store.canAccess,
    getActiveCapabilities: store.getActiveCapabilities,
    
    // Acciones
    toggleCapability: store.toggleCapability,
    saveCapabilities: store.saveCapabilities,
    
    // Computed values
    completionPercentage: computed(() => {
      const active = store.getActiveCapabilities().length;
      const total = store.capabilities.length;
      return Math.round((active / total) * 100);
    }),
    
    nextRecommendedCapability: computed(() => {
      // Lógica para recomendar siguiente capacidad
    })
  };
}
```

## 🎨 Componentes UI

### BusinessCapabilitiesForm

```typescript
function BusinessCapabilitiesForm() {
  const { capabilities, archetype, toggleCapability, saveCapabilities } = usePersonalizedExperience();
  
  return (
    <VStack spacing={8}>
      <ArchetypeSelector />
      <SimpleGrid columns={3} spacing={6}>
        {capabilities.map(capability => (
          <CapabilityCard
            key={capability.id}
            capability={capability}
            onToggle={() => toggleCapability(capability.id)}
          />
        ))}
      </SimpleGrid>
      <BusinessConstellation capabilities={capabilities} />
      <Button onClick={saveCapabilities}>Guardar Configuración</Button>
    </VStack>
  );
}
```

### CapabilityCard

```typescript
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
