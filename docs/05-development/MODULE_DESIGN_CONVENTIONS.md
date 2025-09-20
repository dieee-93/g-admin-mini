# 🎨 CONVENCIONES DE DISEÑO PARA MÓDULOS - G-ADMIN MINI

> **Fecha**: 18 Septiembre 2025
> **Versión**: 2.1 - Post-Análisis de Consistencia Visual
> **Basado en**: Análisis de inconsistencias + Design System v2.1
> **Estado**: CONVENCIONES OBLIGATORIAS - Enforcement Required

---

## 🚨 **CONTEXTO CRÍTICO**

### **PROBLEMA IDENTIFICADO**
El análisis de consistencia visual reveló **"ensalada enorme"** en componentes:
- ❌ **4+ patrones de layout** coexistiendo
- ❌ **3+ sistemas de alertas** solapados
- ❌ **Múltiples sistemas de imports** (shared vs chakra directo)
- ❌ **0 convenciones** seguidas consistentemente

### **OBJETIVO**
Establecer **convenciones obligatorias** para prevenir más inconsistencias y migrar sistemáticamente módulos existentes.

---

## 📋 **CONVENCIONES OBLIGATORIAS**

### **🎯 REGLA FUNDAMENTAL**
**"Un Solo Pattern por Propósito"** - Para cada necesidad UI hay UN pattern oficial.

### **📦 IMPORTS - REGLA ABSOLUTA**

#### **✅ PERMITIDO (ÚNICO)**
```typescript
// ÚNICO IMPORT VÁLIDO
import {
  ContentLayout, PageHeader, Section, FormSection, StatsSection,
  CardGrid, MetricCard, Button, Modal, Alert, Badge, Stack, Typography
} from '@/shared/ui';

// Para icons
import { HomeIcon, UserIcon } from '@heroicons/react/24/outline';
```

#### **❌ PROHIBIDO**
```typescript
// NUNCA USAR - Genera inconsistencias
import { Box, VStack, HStack, Text, SimpleGrid } from '@chakra-ui/react';
import { Icon as ChakraIcon } from '@chakra-ui/react';
```

### **🏗️ ESTRUCTURA DE PÁGINA - PLANTILLAS ESPECÍFICAS**

⚠️ **IMPORTANTE**: Este documento se enfoca en **enforcement y validación**.
Para **templates detallados** ver: `/docs/05-development/UI_MODULE_CONSTRUCTION_MASTER_GUIDE.md`

#### **TYPES DE PLANTILLAS OBLIGATORIAS**
```typescript
// 🏢 EMPRESARIAL (Sales, Staff, Materials, Customers)
// Estructura: Métricas → Gestión (tabs) → Acciones Rápidas

// ⚙️ CONFIGURACIÓN (Settings, Admin, Permisos)
// Estructura: Form Principal → Form Avanzado → Botones Acción

// 📊 ANALYTICS (Dashboard, Executive, Reporting)
// Estructura: Métricas Ejecutivas → Insights → Análisis Avanzado

// Base común para todas:
import { ContentLayout, Section, StatsSection } from '@/shared/ui';

export default function ModulePage() {
  return (
    <ContentLayout spacing="normal">
      {/* ⚠️ NO incluir ErrorBoundary/ResponsiveLayout aquí */}
      {/* Estructura específica según tipo de módulo */}
    </ContentLayout>
  );
}
```

### **📝 FORMULARIOS - PATTERN ÚNICO**

#### **TEMPLATE OBLIGATORIO PARA FORMULARIOS**
```typescript
// 📁 src/pages/admin/[domain]/[module]/components/[Module]Form.tsx
import {
  Modal, FormSection, InputField, SelectField, Button, Stack
} from '@/shared/ui';

interface ModuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  item?: ModuleItem;
}

export function ModuleForm({ isOpen, onClose, item }: ModuleFormProps) {
  return (
    <Modal.Root open={isOpen} onOpenChange={onClose}>
      <Modal.Content size="lg">
        <Modal.Header>
          <Modal.Title>
            {item ? 'Editar' : 'Crear'} {ModuleName}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Stack gap="lg">
            <FormSection title="Información Básica">
              <Stack gap="md">
                <InputField label="Nombre" required />
                <SelectField label="Categoría" />
              </Stack>
            </FormSection>

            {/* Secciones específicas del módulo */}
            <FormSection title="Detalles Específicos">
              {/* Campos específicos aquí */}
            </FormSection>
          </Stack>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
```

### **📊 LISTAS Y GRIDS - COMPONENT ÚNICO**

#### **USAR FILTERABLE DATA GRID (ÚNICO)**
```typescript
// 📁 src/pages/admin/[domain]/[module]/components/[Module]List.tsx
import {
  Section, FilterableDataGrid, ActionButton, Badge
} from '@/shared/ui';

export function ModuleList() {
  const { items, loading, filters, setFilters } = useModuleData();

  const columnConfig = [
    { key: 'name', label: 'Nombre', sortable: true },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => (
        <Badge colorPalette={item.active ? 'green' : 'gray'}>
          {item.active ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (item) => (
        <ActionButton size="sm" onClick={() => editItem(item)}>
          Editar
        </ActionButton>
      )
    }
  ];

  return (
    <Section variant="default" title="Lista de Items">
      <FilterableDataGrid
        data={items}
        columns={columnConfig}
        loading={loading}
        filters={filters}
        onFiltersChange={setFilters}
        searchFields={['name', 'description']}
        virtualized={items.length > 100}
      />
    </Section>
  );
}
```

### **🚨 ALERTAS - SISTEMA ÚNICO**

#### **USAR ALERTS SYSTEM V2.1 (ÚNICO)**
```typescript
// NUNCA crear implementación custom de alertas
// SIEMPRE usar el sistema unificado

import { useModuleAlerts } from '@/shared/alerts/hooks/useModuleAlerts';

function ModuleComponent() {
  const { alerts, actions } = useModuleAlerts('module_name');

  const handleBusinessAction = async () => {
    try {
      await performAction();

      // Usar sistema unificado para alertas
      actions.create({
        type: 'success',
        severity: 'info',
        context: 'module_name',
        title: 'Acción completada exitosamente',
        description: 'La operación se realizó correctamente'
      });
    } catch (error) {
      actions.create({
        type: 'error',
        severity: 'high',
        context: 'module_name',
        title: 'Error en la operación',
        description: error.message
      });
    }
  };
}
```

### **📈 MÉTRICAS - TEMPLATE ÚNICO**

#### **STATS SECTION + METRIC CARD (ÚNICO)**
```typescript
// NUNCA crear métricas custom
// SIEMPRE usar StatsSection + MetricCard

import { StatsSection, CardGrid, MetricCard } from '@/shared/ui';

function ModuleMetrics() {
  const { metrics } = useModuleMetrics();

  return (
    <StatsSection>
      <CardGrid columns={{ base: 1, md: 4 }}>
        <MetricCard
          title="Total Items"
          value={metrics.total.toString()}
          subtitle="en el sistema"
          icon={CubeIcon}
          trend={metrics.trend}
        />

        <MetricCard
          title="Elementos Activos"
          value={metrics.active.toString()}
          subtitle="operativos"
          icon={CheckCircleIcon}
          colorPalette="green"
        />

        <MetricCard
          title="Necesitan Atención"
          value={metrics.needsAttention.toString()}
          subtitle="requieren revisión"
          icon={ExclamationTriangleIcon}
          colorPalette={metrics.needsAttention > 0 ? "orange" : "gray"}
        />

        <MetricCard
          title="Valor Total"
          value={formatCurrency(metrics.totalValue)}
          subtitle="valor estimado"
          icon={CurrencyDollarIcon}
        />
      </CardGrid>
    </StatsSection>
  );
}
```

---

## 🔧 **ENFORCEMENT Y VALIDACIÓN**

### **📋 ESLINT RULES - OBLIGATORIAS**

```javascript
// .eslintrc.js - AGREGAR ESTAS RULES
module.exports = {
  rules: {
    // Prohibir imports directos de Chakra UI
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@chakra-ui/react'],
            message: 'Use @/shared/ui instead of direct Chakra UI imports. See MODULE_DESIGN_CONVENTIONS.md'
          }
        ]
      }
    ],

    // Enforcer componentes específicos
    'custom/use-design-system-components': [
      'error',
      {
        'Box': 'Use Section or ContentLayout from @/shared/ui',
        'VStack': 'Use Stack from @/shared/ui',
        'HStack': 'Use Stack direction="row" from @/shared/ui',
        'SimpleGrid': 'Use CardGrid from @/shared/ui',
        'Text': 'Use Typography from @/shared/ui'
      }
    ]
  }
};
```

### **🔍 CODE REVIEW CHECKLIST - OBLIGATORIO**

```markdown
## ✅ CHECKLIST DE REVISIÓN - CONVENCIONES DE DISEÑO

### IMPORTS (RECHAZAR SI NO CUMPLE)
- [ ] ¿Usa SOLO imports de @/shared/ui?
- [ ] ¿NO importa de @chakra-ui/react directamente?
- [ ] ¿Sigue el pattern de imports establecido?

### ESTRUCTURA (RECHAZAR SI NO CUMPLE)
- [ ] ¿Páginas usan ContentLayout + PageHeader + Section?
- [ ] ¿Formularios usan Modal + FormSection template?
- [ ] ¿Listas usan FilterableDataGrid component?
- [ ] ¿Métricas usan StatsSection + MetricCard?

### ALERTAS (RECHAZAR SI NO CUMPLE)
- [ ] ¿Usa Alerts System v2.1 unificado?
- [ ] ¿NO implementa sistema custom de alertas?
- [ ] ¿Integra con useModuleAlerts hook?

### CONSISTENCIA (RECHAZAR SI NO CUMPLE)
- [ ] ¿Es visualmente consistente con módulo Materials?
- [ ] ¿NO introduce patterns nuevos sin justificación?
- [ ] ¿Sigue templates obligatorios?
```

### **🚨 CRITERIOS DE RECHAZO AUTOMÁTICO**

**PR SERÁ RECHAZADO SI:**
- ❌ Contiene imports de `@chakra-ui/react`
- ❌ No usa `ContentLayout` para páginas principales
- ❌ Crea sistema de alertas custom
- ❌ No usa `FilterableDataGrid` para listas
- ❌ No sigue templates obligatorios
- ❌ Introduce inconsistencias visuales

---

## 📚 **MIGRACIÓN DE MÓDULOS EXISTENTES**

### **🎯 PRIORIDADES DE MIGRACIÓN**

#### **CRÍTICO (Semana 1-2)**
1. **Achievements Module** - 100% Chakra directo, máximo impacto visual
2. **Consolidación Alertas** - 3 sistemas solapados

#### **ALTO (Semana 3-4)**
3. **Finance Modules** - Múltiples patterns, alta complejidad
4. **Intelligence Modules** - Mixed imports

#### **MODERADO (Semana 5-6)**
5. **Staff Module** - Shared UI legacy
6. **Customers Module** - Parcialmente migrado

### **📋 PROCESS DE MIGRACIÓN**

#### **STEP 1: AUDIT PRE-MIGRACIÓN**
```bash
# Ejecutar audit de módulo
npm run audit:visual-consistency -- --module=achievements

# Verificar imports problemáticos
npm run lint:design-system -- --module=achievements

# Generar reporte de inconsistencias
npm run analyze:module-patterns -- --module=achievements
```

#### **STEP 2: MIGRATION SYSTEMATIC**
```bash
# 1. Reemplazar imports
# ANTES: import { Box, VStack } from '@chakra-ui/react'
# DESPUÉS: import { Section, Stack } from '@/shared/ui'

# 2. Migrar estructura de página
# ANTES: <Box><VStack>content</VStack></Box>
# DESPUÉS: <ContentLayout><Section>content</Section></ContentLayout>

# 3. Migrar formularios
# ANTES: Custom modal implementation
# DESPUÉS: Modal + FormSection template

# 4. Migrar listas
# ANTES: Custom grid/list implementation
# DESPUÉS: FilterableDataGrid component

# 5. Migrar alertas
# ANTES: Custom alerts implementation
# DESPUÉS: useModuleAlerts hook
```

#### **STEP 3: VALIDATION POST-MIGRACIÓN**
```bash
# Verificar compliance
npm run lint:design-system -- --module=achievements

# Test visual consistency
npm run test:visual-regression -- --module=achievements

# Performance check
npm run build:analyze -- --focus=achievements
```

---

## 📊 **MÉTRICAS DE COMPLIANCE**

### **🎯 KPIs DE CONVENCIONES**

```typescript
interface DesignConventionsMetrics {
  // Import compliance
  sharedUIUsage: '95%',              // Target: >90%
  chakraDirectImports: '5%',         // Target: <10%

  // Structure compliance
  contentLayoutUsage: '90%',         // Target: >85% pages
  pageHeaderUsage: '95%',            // Target: >90% main pages
  sectionUsage: '85%',               // Target: >80% content areas

  // Component compliance
  filterableDataGridUsage: '80%',    // Target: >75% lists
  formSectionUsage: '90%',           // Target: >85% forms
  metricCardUsage: '95%',            // Target: >90% metrics

  // Alerts compliance
  unifiedAlertsUsage: '100%',        // Target: 100% (no custom)
  moduleAlertsIntegration: '95%',    // Target: >90%

  // Consistency metrics
  visualConsistencyScore: '85%',     // Target: >80%
  patternDiversityIndex: '3',        // Target: <5 patterns total
  onboardingTime: '1 day'            // Target: <2 days
}
```

### **📈 TRACKING DASHBOARD**

```typescript
// Dashboard de compliance en tiempo real
function DesignComplianceDashboard() {
  return (
    <ContentLayout>
      <PageHeader title="Design Conventions Compliance" />

      <StatsSection>
        <CardGrid columns={{ base: 1, md: 4 }}>
          <MetricCard
            title="Import Compliance"
            value="87%"
            target="90%"
            colorPalette="orange"
          />
          <MetricCard
            title="Structure Compliance"
            value="92%"
            target="85%"
            colorPalette="green"
          />
          <MetricCard
            title="Alert Systems"
            value="3 active"
            target="1 unified"
            colorPalette="red"
          />
          <MetricCard
            title="Visual Consistency"
            value="78%"
            target="80%"
            colorPalette="orange"
          />
        </CardGrid>
      </StatsSection>

      <Section variant="elevated" title="Módulos por Compliance">
        <ComplianceByModuleTable />
      </Section>
    </ContentLayout>
  );
}
```

---

## 🎯 **PRÓXIMOS PASOS INMEDIATOS**

### **SEMANA 1: CRISIS MANAGEMENT**
1. **Implementar ESLint rules** - Prevenir más inconsistencias
2. **Consolidar alertas** - Un solo sistema activo
3. **Migrar Achievements** - Módulo más problemático

### **SEMANA 2: SYSTEMATIC APPROACH**
4. **Templates obligatorios** - PageTemplate, FormTemplate, ListTemplate
5. **Training sessions** - Team alignment en convenciones
6. **Documentation updates** - Actualizar guías existentes

### **SEMANA 3-6: MIGRATION EXECUTION**
7. **Migración sistemática** - Finance → Intelligence → Staff → Customers
8. **Compliance monitoring** - Dashboard de métricas
9. **Performance validation** - Asegurar no degradation

---

## 🏆 **RESULTADOS ESPERADOS**

### **INMEDIATOS (2 semanas)**
- ✅ **0 nuevas inconsistencias** - ESLint previene problemas
- ✅ **1 sistema de alertas** - Consolidación completada
- ✅ **95% compliance** en Achievements module

### **MEDIANO PLAZO (6 semanas)**
- ✅ **90% módulos migrados** - Compliance sistemático
- ✅ **50% reducción** en tiempo de desarrollo UI
- ✅ **85% consistency score** - Métricas objetivas

### **LARGO PLAZO (3 meses)**
- ✅ **Zero tolerance** para inconsistencias
- ✅ **Self-enforcing system** - Herramientas automatizan compliance
- ✅ **Best practices reference** - Otros proyectos adoptan approach

---

**🎯 MANTRA**: "Una sola forma correcta de hacer cada cosa" - Consistency through Enforcement

---

*Convenciones de Diseño para Módulos - Septiembre 2025*
*Documento base para eliminación sistemática de inconsistencias visuales*