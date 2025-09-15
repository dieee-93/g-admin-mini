# Módulo de Customers - G-Admin Mini

## 📋 Descripción del Módulo

El módulo de **Customers** gestiona el CRM avanzado con análisis RFM, segmentación inteligente, y predicción de churn. Incluye funcionalidades de customer analytics, customer lifetime value (CLV), behavioral analysis, y recomendaciones estratégicas basadas en inteligencia artificial y análisis predictivo.

### Características principales:
- ✅ CRM completo con gestión avanzada de clientes
- ✅ **Análisis RFM** (Recency, Frequency, Monetary) automático
- ✅ **Segmentación inteligente** con IA (VIP, Frequent, At-Risk, New)
- ✅ **Predicción de churn** con machine learning
- ✅ **Customer Lifetime Value (CLV)** con precisión decimal
- ✅ **Analytics avanzados** de comportamiento y tendencias
- ✅ **Recomendaciones estratégicas** automatizadas
- ✅ **Programa de lealtad** y gestión de puntos
- ✅ Cálculos financieros con Decimal.js para precisión total

---

## 🏗️ Estructura Estándar de Módulo

Esta estructura sigue nuestro **patrón oficial** establecido en Products y Materials:

```
src/pages/admin/core/crm/customers/
├── README.md                   # 📖 Este archivo (documentación completa)
├── page.tsx                    # 🎯 Página orquestadora (componente principal)
│
├── components/                 # 🧩 Componentes UI específicos del módulo
│   ├── index.ts               # 📦 Barrel exports
│   ├── CustomersList/         # 📋 Lista de clientes con filtros avanzados
│   ├── CustomerFormModal/     # ➕ Modal para crear/editar clientes
│   ├── RFMAnalysisPanel/      # 📊 Panel de análisis RFM
│   ├── CustomerSegmentationPanel/ # 🎯 Panel de segmentación inteligente
│   ├── ChurnPredictionPanel/  # ⚠️ Panel de predicción de churn
│   ├── CustomerOrdersHistory/ # 📋 Historial de pedidos del cliente
│   ├── LoyaltyProgramPanel/   # 🎁 Panel del programa de lealtad
│   ├── CLVDashboard/          # 💰 Dashboard de Customer Lifetime Value
│   └── [otros componentes]/   # 🔧 Componentes adicionales
│
├── hooks/                     # 🪝 Hooks de negocio y página
│   ├── index.ts              # 📦 Barrel exports
│   ├── useCustomersPage.ts   # 🎭 Hook orquestador de la página
│   ├── existing/             # 📁 Hooks existentes preservados
│   └── [otros hooks]/        # 🔧 Hooks específicos
│
├── services/                  # ⚙️ Lógica de negocio y servicios
│   ├── index.ts              # 📦 Barrel exports
│   ├── existing/             # 📁 Servicios API existentes preservados
│   │
│   # Business Logic Services (movidos desde business-logic/)
│   ├── customerAnalyticsEngine.ts # 🧠 Motor de analytics avanzados
│   ├── customerRFMAnalytics.ts   # 📊 Análisis RFM con precisión decimal
│   └── __tests__/            # 🧪 Tests de business logic
│
├── types.ts                  # 🏷️ Definiciones TypeScript del módulo
│
└── utils/                   # 🛠️ Utilidades específicas del módulo
    ├── index.ts            # 📦 Barrel exports
    └── [utilidades]/       # 🔧 Helper functions para customers
```

---

## 🎯 Patrón "Página Orquestadora"

### Concepto
El archivo `page.tsx` actúa como un **orquestador limpio** siguiendo el patrón estándar:
- ✅ No contiene lógica de negocio (movida a `useCustomersPage` hook)
- ✅ Usa componentes semánticos del sistema de diseño
- ✅ Estructura condicional basada en estado de la página
- ✅ Métricas calculadas automáticamente por business logic services

### Implementación Actual

```tsx
// src/pages/admin/core/crm/customers/page.tsx
function CustomersPage() {
  // 🎭 Toda la lógica delegada al hook orquestador
  const {
    pageState,
    metrics,
    actions,
    loading,
    error
  } = useCustomersPage();

  return (
    <ContentLayout spacing="normal">
      {/* 📋 Header semántico con acciones específicas de CRM */}
      <PageHeader
        title="Customers"
        subtitle="Advanced CRM with RFM Analytics & Intelligent Segmentation"
        actions={
          <>
            <Button variant="outline" colorPalette="blue" onClick={actions.handleRFMAnalysis}>
              <ChartBarIcon className="w-4 h-4" />
              RFM Analysis
            </Button>
            <Button variant="outline" colorPalette="green" onClick={actions.handleCustomerSegments}>
              <UserGroupIcon className="w-4 h-4" />
              Segmentation
            </Button>
            <Button variant="outline" colorPalette="red" onClick={actions.handleChurnPrediction}>
              <ExclamationTriangleIcon className="w-4 h-4" />
              Churn Risk
            </Button>
            <Button colorPalette="pink" onClick={actions.handleNewCustomer}>
              <PlusIcon className="w-4 h-4" />
              New Customer
            </Button>
          </>
        }
      />

      {/* 📊 Métricas avanzadas calculadas automáticamente */}
      <StatsSection>
        <CardGrid columns={{ base: 1, md: 4 }}>
          <MetricCard title="Total Customers" value={metrics.totalCustomers.toString()} />
          <MetricCard title="Active Customers" value={metrics.activeCustomers.toString()} />
          <MetricCard title="Average CLV" value={DecimalUtils.formatCurrency(metrics.averageCLV)} />
          <MetricCard title="At Risk" value={metrics.atRiskCustomers.toString()} />
        </CardGrid>
      </StatsSection>

      {/* 🧩 Secciones condicionales basadas en estado */}
      <Section variant="elevated" title="Customer Management">
        <CustomersList />
      </Section>

      {pageState.showRFMAnalysis && (
        <Section variant="elevated" title="RFM Analysis">
          <RFMAnalysisPanel />
        </Section>
      )}

      {pageState.showChurnPrediction && (
        <Section variant="elevated" title="Churn Risk Prediction">
          <ChurnPredictionPanel />
        </Section>
      )}
    </ContentLayout>
  );
}
```

### Hook Orquestador Avanzado

```tsx
// src/pages/admin/core/crm/customers/hooks/useCustomersPage.ts
export const useCustomersPage = (): UseCustomersPageReturn => {
  // 🚀 Configurar acciones rápidas del header global
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-customer',
        label: 'Nuevo Cliente',
        icon: PlusIcon,
        action: () => handleNewCustomer(),
        color: 'pink'
      },
      {
        id: 'rfm-analysis',
        label: 'Análisis RFM',
        icon: ChartBarIcon,
        action: () => handleRFMAnalysis(),
        color: 'blue'
      },
      // ... más acciones avanzadas
    ];
    setQuickActions(quickActions);
  }, [setQuickActions]);

  // 📊 Métricas calculadas usando business logic services
  const metrics: CustomersPageMetrics = useMemo(() => {
    if (!analyticsResult) return defaultMetrics;

    const atRiskCustomers = analyticsResult.customerAnalyses.filter(
      c => c.churnRisk === 'high' || c.churnRisk === 'critical'
    ).length;

    return {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === 'active').length,
      averageCLV: analyticsResult.overallMetrics.averageCustomerLifetimeValue,
      churnRate: analyticsResult.overallMetrics.churnRate,
      atRiskCustomers,
      // ... más métricas avanzadas
    };
  }, [customers, analyticsResult]);

  // 🧠 Generar analytics usando CustomerAnalyticsEngine
  const analytics = await CustomerAnalyticsEngine.generateCustomerAnalytics(
    customers, sales, saleItems, config
  );

  return { pageState, metrics, actions, /* ... */ };
};
```

---

## 🧠 Arquitectura de Business Logic Avanzada

### Separación de Responsabilidades CRM

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   page.tsx      │───▶│     hooks/      │───▶│   services/     │
│  (Orquestador)  │    │ (Estado/Efectos)│    │ (Analytics IA)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   🎭 UI Structure        🪝 CRM State Mgmt      🧠 Advanced Analytics
```

### Servicios de Negocio Específicos CRM

**Moved from `business-logic/` to `customers/services/`:**

1. **customerAnalyticsEngine.ts** - Motor de analytics avanzados
   ```typescript
   export class CustomerAnalyticsEngine {
     // 🧠 Análisis comportamental completo con 1300+ líneas de lógica
     static async generateCustomerAnalytics(): Promise<CustomerAnalyticsResult>

     // 🎯 Segmentación inteligente (VIP, Frequent, At-Risk, New)
     private static generateCustomerSegments(): Promise<CustomerSegment[]>

     // ⚡ Predicción de churn con ML
     private static generatePredictions(): ChurnPrediction[]

     // 💡 Recomendaciones estratégicas automatizadas
     private static generateRecommendations(): ActionableRecommendation[]
   }
   ```

2. **customerRFMAnalytics.ts** - Análisis RFM con precisión decimal
   ```typescript
   // 💰 Customer Lifetime Value con NPV y precisión decimal
   export function calculateCustomerCLV(params: CLVCalculationParams): number

   // 📊 Análisis RFM completo
   export function calculateRFMScores(customers: Customer[]): CustomerRFMProfile[]

   // 🎯 Segmentación basada en RFM
   export function segmentCustomersByRFM(): CustomerSegment[]
   ```

---

## 🎨 Sistema de Diseño Integrado

### Componentes Semánticos CRM

```tsx
import {
  // 🏗️ Componentes de Layout Semánticos (PRIORIDAD)
  ContentLayout,    // Estructura principal de página
  PageHeader,       // Header con título, subtítulo y acciones CRM
  Section,          // Secciones con variants para cada análisis
  StatsSection,     // Sección especializada para métricas CRM

  // 📊 Componentes de Métricas Avanzadas
  MetricCard, CardGrid,

  // 🧩 Componentes Base
  Button, Modal, Alert, Badge
} from '@/shared/ui'
```

### Reglas de Diseño Customers
1. **❌ NUNCA** importar de `@chakra-ui/react` directamente
2. **✅ USAR** `ContentLayout spacing="normal"` como contenedor
3. **✅ APLICAR** `PageHeader` con acciones CRM específicas (RFM, Segmentation, Churn)
4. **✅ IMPLEMENTAR** `Section` condicionales para análisis avanzados
5. **✅ UTILIZAR** `StatsSection + CardGrid + MetricCard` para KPIs de CRM

---

## 📊 Funcionalidades Avanzadas de CRM

### 1. Análisis RFM Automatizado
```typescript
// Segmentación automática por comportamiento de compra
const rfmAnalysis = CustomerRFMAnalytics.calculateRFMScores(customers);
// Genera: Champions, Loyal Customers, Potential Loyalists, At Risk, etc.
```

### 2. Motor de Analytics con IA
```typescript
// Análisis comportamental completo con 15+ métricas
const analytics = await CustomerAnalyticsEngine.generateCustomerAnalytics(
  customers, sales, saleItems, config
);
// Incluye: CLV, churn prediction, product recommendations, seasonal patterns
```

### 3. Predicción de Churn con ML
```typescript
// Predicciones de churn con probabilidad y acciones preventivas
const churnPredictions = analytics.predictions.churnPredictions;
// Para cada cliente: probability, timeToChurn, preventionActions
```

### 4. Segmentación Inteligente
```typescript
// 6+ segmentos predefinidos + segmentos customizables
const segments = [
  'vip-customers',      // Alto valor, alta frecuencia
  'frequent-diners',    // Alta frecuencia, valor moderado
  'at-risk-customers',  // Riesgo de churn
  'new-customers',      // Recién adquiridos
  'price-sensitive',    // Sensibles a descuentos
  'occasional-visitors' // Baja frecuencia, potencial crecimiento
];
```

### 5. Customer Lifetime Value (CLV)
```typescript
// CLV con NPV discount y precisión decimal
const clv = calculateCustomerCLV({
  average_order_value: customer.avgOrderValue,
  purchase_frequency: customer.monthlyFrequency,
  customer_lifespan_months: 24,
  profit_margin_rate: 0.65,
  discount_rate: 0.1 // NPV discount
});
```

---

## 🔄 Integración con EventBus

### Eventos del Módulo CRM

```typescript
// Eventos que emite el módulo customers
const CUSTOMERS_EVENTS = {
  CUSTOMER_CREATED: 'customers:customer_created',
  CUSTOMER_UPDATED: 'customers:customer_updated',
  RFM_ANALYSIS_COMPLETED: 'customers:rfm_analysis_completed',
  CHURN_RISK_DETECTED: 'customers:churn_risk_detected',
  SEGMENT_CHANGED: 'customers:segment_changed',
  CLV_RECALCULATED: 'customers:clv_recalculated',
  LOYALTY_POINTS_UPDATED: 'customers:loyalty_points_updated'
} as const;

// Eventos que escucha el módulo
const SUBSCRIBED_EVENTS = [
  'sales:new_sale',              // Actualizar RFM scores y CLV
  'sales:sale_completed',        // Recalcular métricas del cliente
  'products:new_purchase',       // Actualizar product preferences
  'loyalty:points_redeemed',     // Actualizar loyalty metrics
  'marketing:campaign_response'  // Actualizar engagement metrics
] as const;
```

---

## 📊 Testing Strategy

### Estructura de Tests

```
src/pages/admin/core/crm/customers/
├── __tests__/
│   ├── page.test.tsx                    # Tests del componente principal
│   ├── components/
│   │   ├── RFMAnalysisPanel.test.tsx    # Tests de componentes CRM
│   │   └── ChurnPredictionPanel.test.tsx
│   ├── hooks/
│   │   ├── useCustomersPage.test.ts     # Tests de hooks
│   │   └── useRFMAnalysis.test.ts
│   └── services/
│       ├── __tests__/                   # Tests de business logic
│       ├── customerAnalyticsEngine.test.ts
│       └── customerRFMAnalytics.test.ts
```

---

## 🚀 Migración Completada

### ✅ Trabajo Realizado

1. **✅ Reestructuración de Módulo**
   - Creada subcarpeta `customers/` dentro de `crm/`
   - Movido contenido existente preservando estructura
   - Aplicado patrón estándar de G-Admin Mini

2. **✅ Movimiento de Business Logic Avanzada**
   - **customerAnalyticsEngine.ts** (1300+ líneas) - Motor de analytics con IA
   - **customerRFMAnalytics.ts** - Análisis RFM con precisión decimal
   - Incluye tests y documentación completa
   - Actualizado `business-logic/index.ts` con comentarios de migración

3. **✅ Hook Orquestador CRM**
   - `useCustomersPage.ts` con funcionalidad CRM avanzada
   - 5+ quick actions (RFM, Segmentation, Churn, Loyalty)
   - Métricas automáticas (CLV, Churn Rate, Retention Rate)
   - Estado complejo para análisis condicionales

4. **✅ Refactorización de Página**
   - Convertido de Tabs pattern a patrón estándar
   - `ContentLayout + PageHeader + Section` semánticos
   - Secciones condicionales para análisis avanzados
   - Métricas CRM con `StatsSection + MetricCard`

5. **✅ Barrel Exports**
   - `services/index.ts` con business logic migrada
   - `hooks/index.ts` para hooks del módulo
   - Preservación de estructura existente en subcarpetas

---

## 🔗 Referencias Técnicas

### Dependencias Clave CRM
- **Decimal.js**: Precisión en CLV y cálculos financieros
- **CustomerAnalyticsEngine**: Motor de IA para segmentación
- **RFM Analytics**: Análisis comportamental avanzado
- **ChakraUI v3**: Sistema de componentes base
- **Heroicons**: Iconografía CRM consistente

### Patrones Aplicados
- ✅ **Advanced Analytics**: CustomerAnalyticsEngine con 15+ métricas
- ✅ **RFM Segmentation**: Recency, Frequency, Monetary analysis
- ✅ **Predictive ML**: Churn prediction con machine learning
- ✅ **Decimal Precision**: CLV y métricas financieras exactas
- ✅ **Event-Driven CRM**: Comunicación en tiempo real

---

## 📈 Métricas de Calidad CRM

### Indicadores de Éxito
- ⚡ **Performance**: RFM analysis < 500ms, Churn prediction < 1s
- 🧪 **Testing**: Cobertura > 85%, tests de analytics + UI
- 📦 **Bundle Size**: Incremento < 100KB (analytics engine incluido)
- 🔧 **Mantenibilidad**: Lógica CRM modular y escalable
- 🎨 **UX Consistency**: 100% componentes del design system

### Funcionalidades CRM Validadas
```bash
# Analytics Engine
✅ Segmentación automática (6+ segmentos)
✅ Predicción de churn (ML-based)
✅ CLV con precisión decimal
✅ RFM analysis completo
✅ Recomendaciones estratégicas automatizadas
```

---

**🎯 Este README.md documenta la migración completa del módulo Customers con analytics avanzados siguiendo el patrón estándar.**

**📋 El módulo Customers ahora implementa el CRM más avanzado de G-Admin Mini con RFM analytics, predicción de churn, y segmentación inteligente usando business logic de clase enterprise.**