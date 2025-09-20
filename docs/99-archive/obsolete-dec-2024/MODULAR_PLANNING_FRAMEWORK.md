# 🧠 FRAMEWORK DE PLANEACIÓN MODULAR - G-ADMIN MINI

**Objetivo**: Detectar relaciones y reutilización ANTES de escribir código
**Basado en**: Ejemplo real del scheduling module → staff, production, horarios
**Uso**: OBLIGATORIO antes de implementar cualquier módulo nuevo

---

## 🎯 **FILOSOFÍA DEL FRAMEWORK**

### **PRINCIPIO FUNDAMENTAL**
> **"Cada funcionalidad nueva puede ser reutilizada por 3+ módulos que no consideraste inicialmente"**

### **EL PROBLEMA QUE RESUELVE**
❌ **Antes**: "Voy a hacer un calendario para scheduling"
✅ **Después**: "¿Qué módulos necesitan funcionalidad de tiempo/calendario/eventos?"

---

## 🔍 **METODOLOGÍA: 5 DIMENSIONAL ANALYSIS**

### **DIMENSIÓN 1: ENTIDADES COMPARTIDAS**

**PREGUNTA CLAVE**: *¿Qué entidades de negocio toca este módulo?*

#### **Template de Análisis**
```
MÓDULO PROPUESTO: [nombre del módulo]

ENTIDADES PRIMARIAS:
├── 🎯 [Entidad Principal] → ¿Qué otros módulos la usan?
├── 📊 [Entidad de Datos] → ¿Quién más necesita estos datos?
├── ⏰ [Entidad Temporal] → ¿Hay otros calendarios/horarios?
├── 👥 [Entidad Humana] → ¿Staff, customers, suppliers?
└── 🏢 [Entidad de Negocio] → ¿Ubicaciones, departamentos, áreas?

ENTIDADES SECUNDARIAS:
├── 💰 [Entidad Financiera] → ¿Costos, precios, pagos?
├── 📋 [Entidad de Proceso] → ¿Workflows, aprobaciones?
├── 📊 [Entidad de Métrica] → ¿Analytics, reportes?
└── ⚙️ [Entidad de Config] → ¿Settings, preferencias?
```

#### **Ejemplo Real: Scheduling Module**
```
MÓDULO PROPUESTO: Staff Scheduling

ENTIDADES PRIMARIAS:
├── 🎯 Schedule/Calendar → TAMBIÉN USADO POR:
│   ├── Production Planning (horarios de producción)
│   ├── Restaurant Hours (horarios del local)
│   ├── Maintenance Scheduling (mantenimiento)
│   └── Event Planning (eventos especiales)
├── ⏰ Time Slots → TAMBIÉN USADO POR:
│   ├── Kitchen Time Slots (cooking schedules)
│   ├── Delivery Time Windows (entregas)
│   └── Reservation System (mesas)
├── 👥 Staff → TAMBIÉN USADO POR:
│   ├── Payroll (cálculo de horas)
│   ├── Performance Analytics
│   └── Training Management
```

### **DIMENSIÓN 2: FUNCIONALIDADES TRANSVERSALES**

**PREGUNTA CLAVE**: *¿Qué funcionalidades de este módulo podrían necesitar otros módulos?*

#### **Categories de Reutilización**
```
🕐 TIEMPO Y CALENDARIO:
├── Date/time pickers → ¿Quién más selecciona fechas?
├── Calendar views → ¿Qué otros módulos muestran calendarios?
├── Time calculations → ¿Quién más calcula duraciones?
├── Recurring patterns → ¿Qué otros módulos tienen recurrencia?
└── Timezone handling → ¿Multi-ubicación necesita timezones?

👥 GESTIÓN DE PERSONAS:
├── Assignment logic → ¿Quién más asigna personas a tareas?
├── Availability tracking → ¿Qué otros módulos necesitan disponibilidad?
├── Skill matching → ¿Production necesita matching de skills?
├── Workload balancing → ¿Otros módulos balancean carga?
└── Notification systems → ¿Quién más notifica cambios?

📊 ANALYTICS Y REPORTING:
├── Usage patterns → ¿Qué otros módulos analizan patrones?
├── Performance metrics → ¿Quién más mide performance?
├── Forecasting → ¿Production, Sales necesitan forecasting?
├── Optimization → ¿Qué otros módulos optimizan recursos?
└── Cost analysis → ¿Quién más analiza costos?

⚙️ CONFIGURACIÓN Y REGLAS:
├── Business rules → ¿Qué otros módulos tienen reglas complejas?
├── Approval workflows → ¿Quién más necesita aprobaciones?
├── Constraint management → ¿Otros módulos tienen constraints?
├── Template systems → ¿Quién más usa templates?
└── Integration points → ¿Qué otros módulos se integran?
```

### **DIMENSIÓN 3: FLUJOS DE DATOS**

**PREGUNTA CLAVE**: *¿Qué datos consume y qué datos produce este módulo?*

#### **Data Flow Mapping**
```
INPUTS (Datos que consume):
├── 📥 [Tipo de Dato] ← ¿De qué módulos viene?
│   ├── Staff info ← HR/Staff module
│   ├── Business hours ← Settings module
│   ├── Sales forecast ← Sales/Analytics
│   └── Production requirements ← Production module
├── 📥 [Configuración] ← ¿Quién configura qué?
└── 📥 [Eventos externos] ← ¿Qué triggers externos?

OUTPUTS (Datos que produce):
├── 📤 [Tipo de Dato] → ¿Qué módulos lo necesitan?
│   ├── Assigned shifts → Payroll module
│   ├── Labor costs → Finance module
│   ├── Productivity metrics → Analytics module
│   └── Coverage gaps → Management alerts
├── 📤 [Eventos] → ¿Qué módulos escuchan?
└── 📤 [Métricas] → ¿Quién consume métricas?

TRANSFORMATIONS (Procesamientos):
├── 🔄 [Lógica de Negocio] → ¿Otros módulos la necesitan?
├── 🔄 [Cálculos] → ¿Reutilizable en otros contextos?
└── 🔄 [Validaciones] → ¿Reglas aplicables elsewhere?
```

### **DIMENSIÓN 4: INTERFACES DE USUARIO (ACTUALIZADA V2.1)**

**PREGUNTA CLAVE**: *¿Qué patrones de UI de este módulo son reutilizables?*

**⚠️ NUEVA CONSIDERACIÓN CRÍTICA**: Verificar **consistencia con Design System v2.1** antes de proponer reutilización

#### **UI Consistency Analysis (NUEVO - OBLIGATORIO)**
```
🚨 VERIFICACIÓN PREVIA OBLIGATORIA:
├── ¿Usa Design System v2.1? (ContentLayout, Section, StatsSection)
├── ¿Importa solo de @/shared/ui? (NO @chakra-ui/react directo)
├── ¿Sigue templates obligatorios? (PageHeader, FormSection, FilterableDataGrid)
├── ¿Es consistente con módulos existentes? (Materials como referencia)
└── ¿Evita "ensalada de components"? (NO crear más patterns inconsistentes)
```

#### **UI Reusability Analysis (CORREGIDA)**
```
📱 COMPONENTES DE UI (Solo si siguen Design System v2.1):
├── 📅 Calendar/Date components → ¿Usa shared/ui base components?
├── ⏰ Time selectors → ¿Compatible con FilterableDataGrid?
├── 👥 People pickers → ¿Sigue pattern de SupplierSelector?
├── 📊 Timeline views → ¿Usa MetricCard + CardGrid base?
├── 🎯 Drag & drop → ¿Compatible con Section variants?
├── 📋 List/Grid views → ¿Usa FilterableDataGrid template?
├── 🔔 Notification panels → ¿Integra con Alerts System v2.1?
└── ⚙️ Settings screens → ¿Usa ContentLayout + FormSection?

🎨 PATRONES DE INTERACCIÓN (Validados contra sistema existente):
├── Bulk operations → ¿Compatible con FilterableDataGrid actions?
├── Quick actions → ¿Usa ActionButton component?
├── Approval flows → ¿Integra con EventBus + Alerts v2.1?
├── Conflict resolution → ¿Usa Alert components estándar?
├── Auto-suggestions → ¿Compatible con InputField/SelectField?
├── Real-time updates → ¿Integra con EventBus architecture?
├── Mobile optimization → ¿Usa responsive tokens del Design System?
└── Accessibility → ¿Sigue estándares automáticos de shared/ui?

📊 VISUALIZATIONS (Estandarizadas):
├── Charts/graphs → ¿Usa AnalyticsDashboard template base?
├── Heatmaps → ¿Compatible con MetricCard system?
├── Progress indicators → ¿Usa Progress components de shared/ui?
├── Status indicators → ¿Usa Badge components estándar?
└── Comparison views → ¿Sigue pattern de Section + CardGrid?
```

#### **🚨 RED FLAGS - NO REUTILIZAR SI:**
```
❌ Componente usa @chakra-ui/react imports directos
❌ No sigue Design System v2.1 conventions
❌ Crea pattern nuevo sin justificación arquitectónica
❌ Duplica funcionalidad de FilterableDataGrid, MetricCard, etc.
❌ No es compatible con sistema de alertas v2.1
❌ Requiere refactoring masivo para ser reutilizable
```

### **DIMENSIÓN 5: INTEGRACIÓN ARQUITECTÓNICA**

**PREGUNTA CLAVE**: *¿Cómo se integra este módulo con la arquitectura existente?*

#### **Architecture Integration Checklist**
```
🏗️ EVENTBUS INTEGRATION:
├── Events emitted → ¿Qué otros módulos los necesitan?
│   ├── schedule.created → ¿Production, Payroll escuchan?
│   ├── schedule.conflict → ¿Management notifications?
│   ├── schedule.optimization → ¿Analytics tracking?
│   └── schedule.approved → ¿Finance, HR implications?
├── Events consumed → ¿De qué módulos viene información?
│   ├── staff.availability_changed → Staff module
│   ├── production.demand_forecast → Production module
│   ├── sales.peak_hours_analysis → Sales module
│   └── finance.labor_budget_limits → Finance module

🔒 CAPABILITIES INTEGRATION:
├── Required capabilities → ¿Qué permisos necesita?
│   ├── schedule_management → Crear/editar schedules
│   ├── staff_assignment → Asignar personal
│   ├── labor_cost_access → Ver costos laborales
│   └── analytics_access → Ver métricas
├── Conditional features → ¿Qué features son opcionales?
│   ├── Advanced analytics → Solo si analytics_premium
│   ├── Multi-location → Solo si multi_location_enabled
│   ├── Integration APIs → Solo si integrations_enabled
│   └── AI optimization → Solo si ai_features_enabled

📦 SLOTS INTEGRATION:
├── Extension points → ¿Dónde otros módulos pueden extender?
│   ├── Custom scheduling rules → Plugin architecture
│   ├── Additional metrics → Custom KPIs
│   ├── Integration panels → Third-party integrations
│   └── Custom notifications → Personalized alerts
├── Content injection → ¿Qué content puede ser inyectado?
│   ├── Custom fields → Module-specific data
│   ├── Additional actions → Context-specific buttons
│   ├── Extra validations → Business-specific rules
│   └── Custom views → Alternative visualizations

🧮 ZUSTAND INTEGRATION:
├── State management → ¿Qué state es local vs global?
│   ├── Current schedule view → Local al módulo
│   ├── Staff availability → Compartido con HR
│   ├── Business rules → Global configuration
│   └── User preferences → Global user settings
├── State synchronization → ¿Qué state sincroniza con otros módulos?
│   ├── Schedule changes → Sync con Payroll
│   ├── Staff assignments → Sync con HR
│   ├── Labor costs → Sync con Finance
│   └── Performance metrics → Sync con Analytics
```

---

## 🧪 **TEMPLATE DE APLICACIÓN**

### **FASE 1: ANÁLISIS DIMENSIONAL**
```markdown
# ANÁLISIS MODULAR: [NOMBRE DEL MÓDULO]

## 1. ENTIDADES COMPARTIDAS
[ ] Mapear entidades primarias y secundarias
[ ] Identificar módulos que usan cada entidad
[ ] Documentar overlaps y oportunidades de reutilización

## 2. FUNCIONALIDADES TRANSVERSALES
[ ] Categorizar funcionalidades por tipo
[ ] Identificar patrones reutilizables
[ ] Mapear potenciales consumidores

## 3. FLUJOS DE DATOS
[ ] Documentar inputs/outputs/transformations
[ ] Identificar módulos upstream/downstream
[ ] Validar integraciones necesarias

## 4. INTERFACES DE USUARIO
[ ] Catalogar componentes reutilizables
[ ] Identificar patrones de interacción comunes
[ ] Planificar shared component library

## 5. INTEGRACIÓN ARQUITECTÓNICA
[ ] Definir EventBus integration
[ ] Especificar Capabilities required
[ ] Planificar Slots extension points
[ ] Estructurar Zustand state management
```

### **FASE 2: DECISIONES ARQUITECTÓNICAS**
```markdown
# DECISIONES DE REUTILIZACIÓN

## COMPONENTES COMPARTIDOS IDENTIFICADOS:
├── [Componente 1] → Usado por: [Module A, Module B, Module C]
├── [Componente 2] → Usado por: [Module X, Module Y]
└── [Componente 3] → Específico del módulo

## FUNCIONALIDADES COMPARTIDAS IDENTIFICADAS:
├── [Funcionalidad 1] → Abstracción: [shared/business-logic/]
├── [Funcionalidad 2] → Hook compartido: [shared/hooks/]
└── [Funcionalidad 3] → Específica del módulo

## EVENTOS EVENTBUS:
├── EMITE: [evento1, evento2, evento3]
├── ESCUCHA: [evento_a, evento_b, evento_c]
└── CROSS-MODULE: [Módulo X ↔ Módulo Y workflows]

## CAPABILITIES REQUERIDAS:
├── [capability_1] → Razón: [explicación]
├── [capability_2] → Razón: [explicación]
└── [capability_3] → Razón: [explicación]
```

---

## 🎯 **EJEMPLO COMPLETO: SCHEDULING MODULE**

### **RESULTADO DEL ANÁLISIS**
```
MÓDULO: Staff Scheduling

REUTILIZACIÓN IDENTIFICADA:
├── 📅 Calendar Component → REUTILIZABLE EN:
│   ├── Production Planning (horarios de producción)
│   ├── Restaurant Hours (horarios del local)
│   ├── Maintenance Scheduling
│   ├── Event Planning
│   └── Reservation System
├── ⏰ Time Slot Logic → REUTILIZABLE EN:
│   ├── Kitchen Time Management
│   ├── Delivery Windows
│   └── Table Reservations
├── 👥 Assignment Engine → REUTILIZABLE EN:
│   ├── Task Assignment (Production)
│   ├── Shift Coverage (Operations)
│   └── Resource Allocation (Events)
├── 📊 Conflict Resolution → REUTILIZABLE EN:
│   ├── Resource Conflicts (Kitchen)
│   ├── Schedule Conflicts (Events)
│   └── Capacity Conflicts (Tables)

ARQUITECTURA RESULTANTE:
├── 📦 shared/scheduling/ → Calendar, TimeSlot, Assignment components
├── 🧮 shared/business-logic/scheduling/ → Core scheduling algorithms
├── 🎨 shared/ui/scheduling/ → Time pickers, calendar views
└── 📡 EventBus events → schedule.*, assignment.*, conflict.*
```

---

**🎯 RESULTADO: En lugar de 1 módulo específico, identificaste 5+ casos de reutilización que justifican una arquitectura compartida robusta.**