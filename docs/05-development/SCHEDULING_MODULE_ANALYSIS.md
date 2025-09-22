# 📅 ANÁLISIS MODULAR: SCHEDULING MODULE

**Fecha**: 2025-09-20
**Análisis**: Aplicación de metodología 6D para rediseño del módulo Scheduling
**Objetivo**: Identificar oportunidades de reutilización y definir plan de modernización

---

## 1. INFORMACIÓN BÁSICA

**Funcionalidad**: Sistema integral de gestión de horarios y turnos de empleados
**Justificación**: Control de costos laborales, optimización de cobertura y gestión automatizada de turnos
**Usuarios**: Managers, HR, Staff supervisors
**Criticidad**: ✅ Alta (impacta costos laborales directamente)

---

## 2. ANÁLISIS 6D COMPLETADO

### DIMENSIÓN 1: ENTIDADES COMPARTIDAS

| Entidad | Módulos que la usan | Potencial de Reutilización |
|---------|-------------------|---------------------------|
| Staff/Employee | Staff, Scheduling, Sales, Performance | Staff management, Kitchen, Gamification |
| Time Slots | Scheduling, Production, Reservations | Kitchen scheduling, Delivery windows |
| Calendar/Date | Scheduling, Events, Maintenance | ALL modules (universal component) |
| Labor Costs | Scheduling, Finance, Reporting | Budget analysis, Executive dashboard |
| Positions/Roles | Staff, Scheduling, Permissions | Access control, Capability system |

**✅ CRITERIO VALIDADO**: 5+ módulos comparten estas entidades

### DIMENSIÓN 2: FUNCIONALIDADES TRANSVERSALES

**🕐 TIEMPO Y CALENDARIO**:
- ✅ Date/time pickers → Reutilizable en: Materials (expirations), Sales (scheduling), Kitchen (production times)
- ✅ Calendar views → Reutilizable en: Events, Maintenance, Production planning, Reservations
- ✅ Recurring patterns → Reutilizable en: Maintenance schedules, Promotional campaigns, Stock reorders
- ✅ Time zone handling → Reutilizable en: Multi-location support, Reporting

**👥 GESTIÓN DE PERSONAS**:
- ✅ Assignment logic → Reutilizable en: Task assignment, Kitchen stations, Delivery routes
- ✅ Availability tracking → Reutilizable en: Resource allocation, Equipment availability
- ✅ Notification system → Reutilizable en: ALL modules (universal alerts)

**📊 ANALYTICS Y REPORTING**:
- ✅ Performance metrics → Reutilizable en: Sales performance, Kitchen efficiency, Staff evaluation
- ✅ Cost tracking → Reutilizable en: Materials costing, Revenue analysis
- ✅ Forecasting → Reutilizable en: Demand forecasting, Inventory planning, Sales projections

**✅ CRITERIO VALIDADO**: 12+ casos de reutilización identificados

### DIMENSIÓN 3: FLUJOS DE DATOS

**INPUTS (consume)**:
| Dato | Fuente | EventBus Event | Criticidad |
|------|--------|----------------|------------|
| Staff availability | Staff module | `staff.availability_updated` | Alta |
| Labor cost rates | HR/Finance | `hr.rate_updated` | Alta |
| Sales volume data | Sales module | `sales.daily_volume` | Media |
| Kitchen demand | Kitchen module | `kitchen.demand_forecast` | Media |
| Time-off requests | Staff module | `staff.timeoff_requested` | Alta |

**OUTPUTS (produce)**:
| Dato | Destino | EventBus Event | Impacto |
|------|---------|----------------|---------|
| Schedule changes | Staff, Kitchen | `scheduling.schedule_updated` | Alto |
| Overtime alerts | Finance, Manager | `scheduling.overtime_alert` | Alto |
| Coverage gaps | HR, Operations | `scheduling.coverage_gap` | Alto |
| Labor cost projections | Finance, Executive | `scheduling.cost_forecast` | Alto |
| Shift confirmations | Staff | `scheduling.shift_confirmed` | Medio |

**✅ CRITERIO VALIDADO**: Usa EventBus para comunicación cross-módulo

### DIMENSIÓN 4: INTERFACES DE USUARIO Y CONSISTENCIA CROSS-MÓDULO

**⚠️ ANÁLISIS CRÍTICO**: El módulo actual NO sigue Design System v2.1

**ESTADO ACTUAL** (page.tsx:1-235):
```typescript
// ❌ IMPORTS INCORRECTOS
import { Stack, VStack, HStack, Typography, CardWrapper, Badge, Tabs } from '@/shared/ui';

// ❌ NO SIGUE PLANTILLA EMPRESARIAL
// Usa CardWrapper + VStack en lugar de ContentLayout + Section
```

**UI PATTERN ANALYSIS**:
- **🎯 TIPO DE MÓDULO**: ✅ Empresarial (gestión operacional)
- **📐 LAYOUT PATTERN**: ❌ No sigue plantilla (CardWrapper vs ContentLayout)
- **📊 MÉTRICAS DISPLAY**: ❌ No usa StatsSection + MetricCard
- **🔄 NAVEGACIÓN**: ❌ Tabs custom vs Section + Tabs estándar
- **📱 RESPONSIVE**: ❌ No implementa mobile-first patterns

**CONSISTENCY CHECKLIST**:
- ❌ No usa ContentLayout como Materials/Sales
- ❌ No implementa métricas con StatsSection
- ❌ No sigue patrón de alertas unificado
- ❌ Navegación inconsistente con otros módulos empresariales
- ❌ No integra CapabilityGate
- ❌ No usa Design System v2.1

**UI REUSABILITY ANALYSIS**:
- **📅 Calendar components**: ✅ Potencial alto - shared/ui/Calendar
- **📊 Charts/Analytics**: ✅ Potencial alto - métricas laborales
- **📋 List/Grid views**: ✅ Reutilizable - empleados, turnos
- **🔔 Alerts**: ❌ No integra Sistema Unificado v2.1
- **⚙️ Settings**: ❌ No implementado
- **🎨 Visual Hierarchy**: ❌ Inconsistente

**CROSS-MODULE EVALUATION**:
**Pregunta clave**: "¿Si un usuario viene de Materials/Sales, entenderá inmediatamente cómo usar Scheduling?"
**Respuesta**: ❌ NO - Layout y navegación completamente diferentes

**MÓDULOS REFERENCIAS**: Como módulo EMPRESARIAL debe seguir Materials y Sales
- Materials: ✅ ContentLayout + StatsSection + Section + CapabilityGate
- Sales: ✅ Sistema integrado con alertas y EventBus
- Scheduling: ❌ Implementación legacy con CardWrapper

**❌ RED FLAGS CRÍTICOS ENCONTRADOS**:
- ❌ Import directo de componentes incorrectos (`CardWrapper`, `VStack`)
- ❌ No implementa CapabilityGate
- ❌ No integra Sistema de Alertas Unificado
- ❌ Layout completamente diferente a módulos similares
- ❌ No sigue Design System v2.1
- ❌ Métricas en formato legacy (no MetricCard)

### DIMENSIÓN 5: INTEGRACIÓN ARQUITECTÓNICA

**EVENTBUS INTEGRATION**:
❌ **NO IMPLEMENTADO** - No usa useModuleIntegration

**Eventos a emitir**:
- `scheduling.schedule_updated` → Consumido por: Staff, Kitchen, Finance
- `scheduling.overtime_alert` → Consumido por: Finance, Manager dashboard
- `scheduling.coverage_gap` → Consumido por: HR, Operations

**Eventos a consumir**:
- `staff.availability_updated` → Impacto: Recalcular horarios automáticamente
- `sales.volume_forecast` → Impacto: Ajustar staffing requirements

**CAPABILITIES INTEGRATION**:
❌ **NO IMPLEMENTADO** - No usa CapabilityGate

**Required**:
- `schedule_management` → Justificación: Crear/editar horarios
- `approve_timeoff` → Justificación: Aprobar solicitudes
- `view_labor_costs` → Justificación: Ver costos laborales

**ZUSTAND INTEGRATION**:
❌ **NO IMPLEMENTADO** - Usa solo useState local

**Local state**: Filtros de vista, semana seleccionada
**Shared state**: Staff data, configuración de roles, holidays

### DIMENSIÓN 6: INTELIGENCIA DE ALERTAS 🧠

**DECISION**: ✅ **ENGINE INTELIGENTE REQUERIDO**

**JUSTIFICACIÓN**:
- Datos complejos: Patterns de staffing, optimización de costos, predicción de demanda
- Análisis multi-variable: Overtime vs coverage vs costo vs satisfaction
- Correlaciones cross-module: Sales volume → Staff requirements

**INTELIGENCIA REQUERIDA**:
- ✅ **Análisis de costos laborales** → Detectar overtime patterns, optimizar costos
- ✅ **Predicciones de demanda** → Basado en sales history, eventos especiales
- ✅ **Optimización automática** → Balancear coverage vs costo vs employee satisfaction
- ✅ **Correlaciones cross-module** → Sales forecasting → Staff requirements
- ✅ **Contextualización específica** → Holidays, events, seasonal patterns

**ARCHITECTURE DECISION**: ✅ **SchedulingIntelligenceEngine**

```typescript
class SchedulingIntelligenceEngine extends BaseIntelligentEngine {
  analyze(data: SchedulingData): IntelligentAlert[] {
    return [
      ...this.analyzeLaborCosts(data),        // Overtime patterns, cost optimization
      ...this.analyzeCoverageGaps(data),      // Staffing requirements vs actual
      ...this.analyzeEfficiencyPatterns(data), // Performance correlation with scheduling
      ...this.analyzeCrossModuleImpact(data)  // Sales/Kitchen demand correlation
    ];
  }
}
```

**TIPOS DE ALERTAS INTELIGENTES**:
- 🚨 **"Overtime crítico detectado"** → Patrón: >40h semanales, tendencia creciente
- ⚠️ **"Gap de cobertura previsto"** → Predicción: Demanda alta + staff insuficiente
- 💰 **"Costo laboral 15% sobre budget"** → Threshold inteligente basado en histórico
- 📈 **"Demanda alta detectada, requiere +2 staff"** → Correlación con sales forecasting
- 🔄 **"Patrón de ausentismo detectado"** → Employee satisfaction correlation

**CROSS-MODULE CORRELATIONS**:
- Sales volume → Staff requirements prediction
- Materials stockouts → Kitchen scheduling adjustments
- Staff performance → Quality correlation analysis
- Holiday/events → Demand forecasting and staffing

---

## 3. ESTADO ACTUAL VS OBJETIVO

### ANÁLISIS DE GAPS CRÍTICOS

**ARQUITECTURA**:
- ❌ No usa Design System v2.1
- ❌ No implementa 13 sistemas integrados
- ❌ No sigue plantilla empresarial
- ❌ EventBus integration ausente

**FUNCIONALIDAD**:
- ✅ Lógica de negocio sólida (hooks/useScheduling.ts)
- ✅ Tipos bien definidos
- ❌ No integra sistema de alertas inteligentes
- ❌ No implementa offline-first

**UI/UX**:
- ❌ Inconsistente con otros módulos empresariales
- ❌ No responsive design patterns
- ❌ No mobile-first approach
- ❌ Métricas en formato legacy

### REUTILIZACIÓN SUMMARY

**Shared components identificados**: 8
- Calendar/DatePicker, TimeSlot selector, Employee selector, Cost calculator
- Assignment logic, Notification system, Performance metrics, Forecasting engine

**Shared business logic**: 6
- Time calculations, Labor cost formulas, Availability matching
- Conflict detection, Auto-optimization algorithms, Cross-module correlations

**Cross-module integrations**: 8
- Staff ↔ Scheduling (availability, assignments)
- Sales ↔ Scheduling (demand forecasting)
- Finance ↔ Scheduling (cost tracking)
- Kitchen ↔ Scheduling (production alignment)

**Extension points**: 5
- Custom scheduling algorithms, Holiday calendars, Performance metrics
- Integration with external HR systems, Advanced analytics

---

## 4. CRITERIOS DE VALIDACIÓN

**REUTILIZACIÓN**:
- ✅ Al menos 2 módulos comparten entidades (Staff, Calendar, Costs)
- ✅ Al menos 3 casos de reutilización (12+ identificados)
- ❌ Usa EventBus para comunicación (pendiente implementar)
- ❌ Sigue Design System v2.1 (gap crítico)
- ❌ Implementa CapabilityGate (pendiente)

**INTELIGENCIA**:
- ✅ Decisión de alertas justificada (Engine inteligente requerido)
- ✅ Base abstracta para implementar (BaseIntelligentEngine disponible)
- ✅ Cross-module correlations identificadas
- ✅ Complejidad de datos amerita análisis inteligente

**CONSISTENCIA**:
- ❌ Sigue plantilla empresarial (gap mayor)
- ❌ UI consistency con módulos similares (rediseño requerido)
- ❌ Integración arquitectónica completa (13 sistemas)

---

## 5. DECISIONES CRÍTICAS

### **DECISION 1: REDISEÑO ARQUITECTÓNICO COMPLETO**
**Justificación**: Gaps críticos en Design System, EventBus, y consistencia UI
**Alcance**: Page component, hook integration, UI components
**Impacto**: Alto - requiere refactoring significant

### **DECISION 2: IMPLEMENTAR ENGINE INTELIGENTE**
**Justificación**: Complejidad de datos amerita análisis predictivo
**Componentes**: SchedulingIntelligenceEngine + AlertsAdapter
**Beneficio**: Optimización automática de costos y cobertura

### **DECISION 3: REUTILIZACIÓN MASIVA**
**Justificación**: 12+ casos de reutilización identificados
**Estrategia**: Migrar componentes a shared/ui y shared/business-logic
**ROI**: Reducción significativa de duplicación código

---

## 6. PRÓXIMOS PASOS

### **FASE 1: REDISEÑO ARQUITECTÓNICO** (Prioritario)
1. Migrar page.tsx a plantilla empresarial
2. Implementar useModuleIntegration
3. Integrar 13 sistemas obligatorios
4. Implementar CapabilityGate

### **FASE 2: SISTEMA INTELIGENTE**
1. Crear SchedulingIntelligenceEngine
2. Implementar correlaciones cross-module
3. Integrar con Sistema Unificado de Alertas

### **FASE 3: REUTILIZACIÓN**
1. Extraer componentes shared
2. Migrar lógica de negocio común
3. Documentar extension points

---

## 7. CONCLUSIONES

**ESTADO**: ❌ Módulo con implementación legacy que requiere modernización completa
**POTENCIAL**: ✅ Alto - 12+ casos de reutilización y engine inteligente justificado
**PRIORIDAD**: 🔥 Crítica - impacta consistencia del sistema y ROI arquitectónico

**RECOMENDACIÓN**: Proceder con rediseño completo siguiendo metodología 6D y plantilla empresarial establecida.

---

*Análisis completado según MODULE_PLANNING_MASTER_GUIDE.md*
*Documento técnico para desarrollo basado en evidencia*