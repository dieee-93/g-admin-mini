# 🧠 GUÍA MAESTRA DE PLANIFICACIÓN MODULAR - G-ADMIN MINI

**Objetivo**: Guía práctica única para análisis y planificación de módulos
**Audiencia**: Developers + IA assistants
**Uso**: Referencia OBLIGATORIA antes de escribir código

---

## 🚨 **PROCESO OBLIGATORIO: NO CODEAR SIN ESTE ANÁLISIS**

```
1. ANÁLISIS 5D → 2. TEMPLATES → 3. CHECKLIST → 4. APPROVAL → 5. CODING
```

---

## 🔍 **FASE 1: ANÁLISIS DE 5 DIMENSIONES**

### **METODOLOGÍA: Detectar reutilización ANTES de codear**

#### **DIMENSIÓN 1: ENTIDADES COMPARTIDAS**
```markdown
¿Qué entidades de negocio toca este módulo?

ENTIDADES PRIMARIAS:
├── 🎯 [Entidad Principal] → ¿Qué otros módulos la usan?
├── ⏰ [Entidad Temporal] → ¿Hay otros calendarios/horarios?
├── 👥 [Entidad Humana] → ¿Staff, customers, suppliers?
└── 🏢 [Entidad de Negocio] → ¿Ubicaciones, departamentos?

PREGUNTA CLAVE: ¿Al menos 2 módulos comparten estas entidades?
SI NO → REANALIZAR módulo
```

#### **DIMENSIÓN 2: FUNCIONALIDADES TRANSVERSALES**
```markdown
¿Qué funcionalidades pueden reutilizarse?

🕐 TIEMPO Y CALENDARIO:
- [ ] Date/time pickers → Reutilizable en: [módulos]
- [ ] Calendar views → Reutilizable en: [módulos]
- [ ] Recurring patterns → Reutilizable en: [módulos]

👥 GESTIÓN DE PERSONAS:
- [ ] Assignment logic → Reutilizable en: [módulos]
- [ ] Availability tracking → Reutilizable en: [módulos]

📊 ANALYTICS Y REPORTING:
- [ ] Performance metrics → Reutilizable en: [módulos]
- [ ] Forecasting → Reutilizable en: [módulos]

CRITERIO: ¿Al menos 3 casos de reutilización identificados?
SI NO → REANALIZAR funcionalidades
```

#### **DIMENSIÓN 3: FLUJOS DE DATOS**
```markdown
INPUTS → PROCESSING → OUTPUTS

INPUTS (consume):
| Dato | Fuente | EventBus Event | Criticidad |
|------|--------|----------------|------------|
| [Dato] | [Módulo] | [event.name] | [Alta/Media] |

OUTPUTS (produce):
| Dato | Destino | EventBus Event | Impacto |
|------|---------|----------------|---------|
| [Dato] | [Módulo] | [event.name] | [Alto/Medio] |

PREGUNTA: ¿Usa EventBus para comunicación entre módulos?
SI NO → REANALIZAR integración
```

#### **DIMENSIÓN 4: INTERFACES DE USUARIO Y CONSISTENCIA CROSS-MÓDULO**
```markdown
⚠️ CRÍTICO: Prevenir inconsistencia entre módulos y componentes no utilizados

UI PATTERN ANALYSIS:
├── 🎯 TIPO DE MÓDULO → ¿Empresarial, Configuración o Analytics?
├── 📐 LAYOUT PATTERN → ¿Sigue plantilla establecida?
├── 📊 MÉTRICAS DISPLAY → ¿Usa patrón estándar de métricas?
├── 🔄 NAVEGACIÓN → ¿Consistente con módulos similares?
└── 📱 RESPONSIVE → ¿Mismo comportamiento cross-módulo?

CONSISTENCY CHECKLIST:
- [ ] ¿Qué módulos existentes muestran información similar?
- [ ] ¿Cómo organizan la información otros módulos del mismo tipo?
- [ ] ¿Qué componentes UI ya existen para este tipo de datos?
- [ ] ¿La navegación es consistente con módulos relacionados?
- [ ] ¿Las métricas siguen el mismo patrón visual?

UI REUSABILITY ANALYSIS:
├── 📅 Calendar components → ¿Usa shared/ui? ¿Otros módulos similares?
├── 📊 Charts/Analytics → ¿Patrón consistente con dashboard existente?
├── 📋 List/Grid views → ¿Mismo layout que módulos relacionados?
├── 🔔 Alerts → ¿Integra con Sistema Unificado v2.1?
├── ⚙️ Settings → ¿Usa ContentLayout + FormSection como otros?
└── 🎨 Visual Hierarchy → ¿Misma jerarquía que módulos similares?

CROSS-MODULE EVALUATION:
**Pregunta clave**: "¿Si un usuario viene de [Módulo X], entenderá
inmediatamente cómo usar este módulo?"

MÓDULOS REFERENCIAS (analizar antes de diseñar):
- Si es EMPRESARIAL → Revisar: Sales, Staff, Materials, Customers
- Si es CONFIGURACIÓN → Revisar: Settings, Admin, Permisos
- Si es ANALYTICS → Revisar: Dashboard, Executive, Reporting

TEMPLATE COMPLIANCE:
- [ ] ✅ Identifica tipo: Empresarial/Config/Analytics
- [ ] ✅ Usa plantilla establecida como base
- [ ] ✅ Métricas en misma posición que módulos similares
- [ ] ✅ Navegación consistente (tabs, botones, menús)
- [ ] ✅ Mismo flujo de acciones que módulos relacionados

❌ RED FLAGS CRÍTICOS:
- Import directo de @chakra-ui/react
- Implementación custom de alertas
- Layout único sin justificación
- Navegación diferente a módulos similares
- Componentes que no se reutilizarán
- Métricas en posiciones inconsistentes
- No sigue Design System v2.1

🎯 CRITERIO DE VALIDACIÓN:
"Un desarrollador debe poder copiar 70% del código UI
de un módulo similar y solo cambiar la lógica de datos"

📋 IMPLEMENTACIÓN DETALLADA:
Ver: `/docs/05-development/UI_MODULE_CONSTRUCTION_MASTER_GUIDE.md`
- 3 plantillas específicas por tipo de módulo
- Código real verificado y patterns obligatorios
- Checklist de validación completo
```

#### **DIMENSIÓN 5: INTEGRACIÓN ARQUITECTÓNICA**
```markdown
EVENTBUS INTEGRATION:
Events emitted: [modulo].[evento] → Consumido por: [módulos]
Events consumed: [fuente].[evento] → Impacto: [descripción]

CAPABILITIES INTEGRATION:
Required: [capability_name] → Justificación: [razón]
Optional: [capability_optional] → Feature: [qué habilita]

ZUSTAND INTEGRATION:
Local state: [estado específico del módulo]
Shared state: [estado compartido con otros módulos]
```

#### **DIMENSIÓN 6: INTELIGENCIA DE ALERTAS** 🧠
```markdown
⚠️ NUEVA DIMENSIÓN: Sistema de alertas inteligentes por módulo

INTELLIGENT ALERTS ARCHITECTURE:
├── 🎯 Domain Intelligence → ¿Requiere lógica específica del dominio?
├── 🔄 Cross-Module Correlations → ¿Afecta otros módulos?
├── 📊 Business Rules → ¿Reglas complejas de negocio?
└── 🚨 Alert Complexity → ¿Simple threshold vs análisis predictivo?

INTELIGENCIA REQUERIDA:
- [ ] Análisis ABC/Pareto → [justificación]
- [ ] Predicciones temporales → [consumo, demanda, etc.]
- [ ] Correlaciones cross-module → [impacto en otros módulos]
- [ ] Reglas de negocio complejas → [ej: márgenes, reliability]
- [ ] Contexto específico → [priorización, recommendations]

ARCHITECTURE DECISION:
- [ ] ✅ Usar sistema unificado básico (AlertUtils.createStockAlert)
- [ ] ✅ Implementar Engine inteligente específico del módulo
- [ ] ✅ Crear correlaciones cross-module

ENGINE STRUCTURE (si aplica):
```typescript
class [Module]IntelligenceEngine extends BaseIntelligentEngine {
  analyze(data: [Module]Data): IntelligentAlert[] {
    return [
      ...this.analyze[Specific]Rules(data),
      ...this.analyze[Predictive]Patterns(data),
      ...this.analyze[CrossModule]Impact(data)
    ];
  }
}
```

EJEMPLOS POR DOMINIO:
- Materials: ABC analysis + Stock prediction + Supplier impact
- Products: Margin erosion + Demand forecasting + Recipe cost changes
- Providers: Reliability analysis + Price volatility + Lead time prediction
- Sales: Revenue patterns + Conversion analysis + Customer behavior
- Staff: Performance analytics + Schedule optimization + Labor cost analysis

PREGUNTA CLAVE: ¿Este módulo maneja datos complejos que requieren
análisis inteligente más allá de simples thresholds?
SI SÍ → Implementar Engine específico
SI NO → Usar sistema básico unificado
```

---

## 📋 **FASE 2: TEMPLATES PRÁCTICOS**

### **TEMPLATE: ANÁLISIS COMPLETO**
```markdown
# ANÁLISIS MODULAR: [NOMBRE DEL MÓDULO]

## 1. INFORMACIÓN BÁSICA
**Funcionalidad**: [Qué hace]
**Justificación**: [Por qué es necesario]
**Usuarios**: [Quién lo usa]
**Criticidad**: [ ] Baja [ ] Media [ ] Alta

## 2. ANÁLISIS 5D COMPLETADO
### ENTIDADES COMPARTIDAS:
| Entidad | Módulos que la usan | Reutilización |
|---------|-------------------|---------------|
| [Entity] | [Module A, B] | [Module C, D] |

### FUNCIONALIDADES TRANSVERSALES:
- ✅ [Función 1] → Reutilizable en: [3+ módulos]
- ✅ [Función 2] → Reutilizable en: [3+ módulos]

### FLUJOS DE DATOS:
**EventBus Events**:
- EMITE: `[modulo].[evento]` → [módulos consumidores]
- ESCUCHA: `[fuente].[evento]` → [cómo reacciona]

### UI COMPONENTS:
- ✅ Usa Design System v2.1
- ✅ Componente X → Reutilizable en: [módulos]
- ✅ NO imports directos de Chakra

### INTEGRACIÓN:
- ✅ EventBus: [eventos definidos]
- ✅ Capabilities: [permisos requeridos]
- ✅ Zustand: [estado compartido]

### INTELIGENCIA DE ALERTAS:
**Decision**: [ ] Básico [ ] Engine Inteligente [ ] Cross-Module

**Justificación**: [Por qué se necesita inteligencia específica]

**Intelligence Engine** (si aplica):
```typescript
class [Module]IntelligenceEngine extends BaseIntelligentEngine {
  analyze(data: [Module]Data): IntelligentAlert[] {
    return [
      ...this.analyze[DomainSpecific](data),
      ...this.analyze[Predictive](data),
      ...this.analyze[CrossModule](data)
    ];
  }
}
```

**Tipos de alertas inteligentes**:
- [ ] [Tipo 1]: [descripción] → Ejemplo: ABC stock analysis
- [ ] [Tipo 2]: [descripción] → Ejemplo: Predictive stockout
- [ ] [Tipo 3]: [descripción] → Ejemplo: Cross-module margin impact

**Cross-Module Correlations**:
- [Módulo A] → [Impacto] → [Módulo B]
- [Módulo C] → [Trigger] → [Este módulo]

## 3. REUTILIZACIÓN SUMMARY
- **Shared components**: [número] → [lista]
- **Shared business logic**: [número] → [lista]
- **Cross-module integrations**: [número] → [lista]
- **Extension points**: [número] → [lista]

## 4. CRITERIOS DE VALIDACIÓN
- [ ] ✅ Al menos 2 módulos comparten entidades
- [ ] ✅ Al menos 3 casos de reutilización
- [ ] ✅ Usa EventBus para comunicación
- [ ] ✅ Sigue Design System v2.1
- [ ] ✅ Implementa CapabilityGate
- [ ] ✅ Decisión de alertas justificada (básica vs inteligente)
- [ ] ✅ Si usa Engine inteligente → Base abstracta implementada
- [ ] ✅ Cross-module correlations identificadas
```

---

## ✅ **FASE 3: CHECKLIST DE VALIDACIÓN**

### **CRITERIOS DE RECHAZO AUTOMÁTICO**
```markdown
❌ RECHAZAR SI:
- [ ] Menos de 3 casos de reutilización identificados
- [ ] No usa EventBus para comunicación entre módulos
- [ ] No implementa CapabilityGate
- [ ] Importa directamente de @chakra-ui/react
- [ ] No define extension points
- [ ] Toda la UI es específica del módulo
- [ ] No considera mobile/responsive

⚠️ REQUIERE JUSTIFICACIÓN SI:
- [ ] Solo 1-2 casos de reutilización
- [ ] Pocas integraciones con módulos existentes
- [ ] Estado mayormente local
```

### **APPROVAL CHECKLIST**
```markdown
FASES COMPLETADAS:
- [ ] ✅ Análisis 5D completado (100%)
- [ ] ✅ Template rellenado completamente
- [ ] ✅ Criterios de rechazo verificados
- [ ] ✅ Al menos 3 casos de reutilización
- [ ] ✅ EventBus integration definida
- [ ] ✅ Design System v2.1 compliance

APPROVALS:
- [ ] Business Stakeholder
- [ ] Technical Lead
- [ ] Architecture Review

STATUS: [ ] APPROVED [ ] REQUIRES REVISION
```

---

## 🎯 **EJEMPLO PRÁCTICO: SCHEDULING MODULE**

### **RESULTADO DEL ANÁLISIS 5D**
```
MÓDULO: Staff Scheduling

REUTILIZACIÓN IDENTIFICADA:
├── 📅 Calendar Component → REUTILIZABLE EN:
│   ├── Production Planning, Restaurant Hours
│   ├── Maintenance Scheduling, Event Planning
│   └── Reservation System (5 módulos total)
├── ⏰ Time Slot Logic → REUTILIZABLE EN:
│   ├── Kitchen Time Management
│   └── Delivery Windows (3 módulos total)
├── 👥 Assignment Engine → REUTILIZABLE EN:
│   ├── Task Assignment, Resource Allocation
│   └── Shift Coverage (4 módulos total)

ARQUITECTURA RESULTANTE:
├── 📦 shared/scheduling/ → Calendar, TimeSlot components
├── 🧮 shared/business-logic/scheduling/ → Core algorithms
├── 🎨 shared/ui/scheduling/ → Time pickers, views
└── 📡 EventBus events → schedule.*, assignment.*

INTELIGENCIA DE ALERTAS:
├── 📊 Engine específico → SchedulingIntelligenceEngine
├── 🧠 Lógica inteligente:
│   ├── Análisis de costos laborales (overtime detection)
│   ├── Predicción de gaps de cobertura
│   ├── Optimización automática de turnos
│   └── Correlación con Materials/Sales para demand forecasting
├── 🔄 Cross-module correlations:
│   ├── Sales volume → Staff requirements prediction
│   ├── Materials stockouts → Production schedule adjustments
│   └── Staff performance → Quality/efficiency correlations

ALERTAS INTELIGENTES GENERADAS:
├── 🚨 "Overtime crítico detectado" (40h+ semanales)
├── ⚠️ "Gap de cobertura previsto" (turno sin personal)
├── 💰 "Costo laboral 15% sobre budget" (threshold inteligente)
└── 📈 "Demanda alta detectada, requiere +2 staff" (predictivo)

RESULTADO: 5+ casos de reutilización + Engine inteligente → Arquitectura compartida justificada
```

---

## 🚨 **QUICK REFERENCE PARA IA**

### **QUESTIONS TO ASK BEFORE CODING**
1. ¿Este módulo comparte entidades con otros? → Identificar shared models
2. ¿Esta funcionalidad la necesitan otros módulos? → Mover a shared/
3. ¿Cómo se comunica con otros módulos? → Usar EventBus
4. ¿Qué UI puede reutilizarse? → Usar Design System v2.1
5. ¿Qué permisos necesita? → Implementar CapabilityGate
6. ¿Requiere alertas inteligentes o básicas? → Evaluar complejidad del dominio
7. ¿Qué correlaciones cross-module afectan las alertas? → Identificar dependencies

### **RED FLAGS IMMEDIATE**
- Props como `onBusinessAction`, `onStockUpdate` → Prop drilling
- Import de `@chakra-ui/react` → Usar `@/shared/ui`
- Implementación custom de alertas → Usar Sistema Unificado o Engine
- Componente sin datos → Agregar `use[Module]()` hook
- No EventBus integration → Módulo aislado (malo)
- Engine inteligente sin base abstracta → Usar BaseIntelligentEngine
- Alertas básicas para datos complejos → Evaluar Engine inteligente

### **ALWAYS CORRECT PATTERNS**
- `const { items } = useMaterials()` → Hook directo para datos
- `emitEvent('item_updated', data)` → EventBus para eventos
- `const canEdit = hasCapability('edit')` → Capabilities local
- `import { ContentLayout, Section } from '@/shared/ui'` → Design System
- `AlertUtils.createStockAlert(...)` → Alertas básicas
- `MaterialsIntelligenceEngine.analyze(...)` → Alertas inteligentes
- `<AlertBadge context="materials" />` → UI unificada de alertas

---

## 📚 **DOCUMENTOS CONSOLIDADOS**

Este documento reemplaza y consolida:
- ✅ `MODULAR_PLANNING_FRAMEWORK.md` → Metodología 5D
- ✅ `MODULE_PLANNING_TEMPLATES.md` → Templates prácticos
- ✅ `ARCHITECTURAL_DECISION_CHECKLIST.md` → Validación

**PROCESO**: Framework → Templates → Checklist → Approval → Coding

---

**🎯 MANTRA**: "Detectar reutilización ANTES de codear para evitar duplicación"