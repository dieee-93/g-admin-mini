# 🧠 GUÍA MAESTRA DE PLANIFICACIÓN MODULAR - G-ADMIN MINI

**Objetivo**: Guía práctica única para análisis y planificación de módulos
**Audiencia**: Developers + IA assistants
**Uso**: Referencia OBLIGATORIA antes de escribir código

---

## 🚨 **PROCESO OBLIGATORIO: NO CODEAR SIN ESTE ANÁLISIS**

```
0. INVESTIGACIÓN EMPÍRICA → 1. ANÁLISIS 5D → 2. TEMPLATES → 3. CHECKLIST → 4. APPROVAL → 5. CODING
```

### ⚠️ **CRITICAL UPDATE**: Framework mejorado con lecciones de falla en análisis scheduling

**Problema Detectado**: Análisis teórico sin investigación empírica = **85% conclusiones incorrectas**
**Solución**: **INVESTIGACIÓN EMPÍRICA OBLIGATORIA** antes de aplicar cualquier framework

---

## 🔍 **FASE 0: INVESTIGACIÓN EMPÍRICA OBLIGATORIA**

### 🚨 **CRITICAL**: NO PROCEDER SIN COMPLETAR ESTA FASE

**Razón**: Evitar análisis basado en asunciones que resulten 85% incorrectas

### **STEP 1: MODULE INVENTORY REAL**
```bash
# Tamaño y estructura del módulo
find src/[module-path] -name "*.tsx" -o -name "*.ts" | wc -l
find src/[module-path] -type f \( -name "*.tsx" -o -name "*.ts" \) -exec wc -l {} + | tail -1

# Estructura de archivos real
tree src/[module-path]/ -I node_modules | head -20
ls -la src/[module-path]/components/
```

### **STEP 2: SHARED COMPONENTS VERIFICATION**
```bash
# ✅ OBLIGATORIO: ¿Qué shared components existen ya?
find src/shared/ui -name "*.tsx" | head -20
grep -r "export.*Component\|export.*function" src/shared/ui/index.ts

# ✅ OBLIGATORIO: ¿Cuáles usa REALMENTE este módulo?
grep -r "from '@/shared/ui'" src/[module-path]/
grep -r "import.*shared" src/[module-path]/

# ✅ OBLIGATORIO: ¿Qué componentes business existen?
find src/shared/ui/components/business -name "*.tsx"
```

### **STEP 3: BUSINESS LOGIC VERIFICATION**
```bash
# ✅ OBLIGATORIO: ¿Business logic ya separada?
find src/business-logic -name "*[module]*"
find src/shared -name "*[module]*"
ls -la src/business-logic/

# ✅ OBLIGATORIO: ¿APIs implementadas?
find src/services -name "*[module]*"
find src/[module-path] -name "*Api*" -o -name "*api*"
```

### **STEP 4: INTEGRATION VERIFICATION**
```bash
# ✅ OBLIGATORIO: EventBus integration real
grep -r "useModuleIntegration\|emitEvent" src/[module-path]/
grep -r "EventBus\|events" src/[module-path]/

# ✅ OBLIGATORIO: Store integration real
find src/store -name "*[module]*"
grep -r "zustand\|useStore" src/[module-path]/

# ✅ OBLIGATORIO: Capabilities real
grep -r "hasCapability\|CapabilityGate" src/[module-path]/
```

### **STEP 5: INTELLIGENCE SYSTEMS VERIFICATION**
```bash
# ✅ OBLIGATORIO: ¿Intelligence Engine existe?
find src/[module-path] -name "*Intelligence*" -o -name "*Engine*"
grep -r "IntelligenceEngine\|AlertsAdapter" src/[module-path]/

# ✅ OBLIGATORIO: ¿Alertas implementadas?
grep -r "useAlerts\|AlertSystem" src/[module-path]/
```

### **STEP 6: CROSS-MODULE OPPORTUNITY ANALYSIS** (NUEVO)
```bash
# ✅ OBLIGATORIO: Análisis sistemático de oportunidades cross-module
# Buscar duplicación de funcionalidad similar en otros módulos

# 1. Buscar types/interfaces similares en otros módulos
find src/ -name "*types*" -exec grep -l "[ComponentName]\|[ConceptName]" {} \;

# 2. Buscar lógica similar implementada manualmente
grep -r "[core-concept]" src/pages/admin/ --exclude-dir=[current-module]

# 3. Mapear oportunidades de reutilización
grep -r "[shared-component-name]" src/ --exclude-dir=[current-module]

# 4. Identificar módulos con business logic duplicada
find src/ -name "*[business-domain]*" | grep -v [current-module]
```

### **VALIDATION CHECKPOINT - EVIDENCIA OBLIGATORIA:**
- [ ] ✅ **Module Inventory**: [número archivos] archivos, [número líneas] líneas
- [ ] ✅ **Shared Components**: [lista real con archivos fuente verificados]
- [ ] ✅ **Business Logic**: [ubicación real y estado - shared vs module-specific]
- [ ] ✅ **APIs**: [implementación verificada - mock vs real]
- [ ] ✅ **EventBus**: [integration confirmada con código específico]
- [ ] ✅ **Store**: [store específico identificado y uso verificado]
- [ ] ✅ **Intelligence**: [engine/alertas verificados o confirmado que no existen]
- [ ] ✅ **Cross-Module Opportunities**: [duplicaciones y oportunidades identificadas]

### 🚨 **MANDATORY RULE**:
**SI NO TIENES EVIDENCIA REAL PARA CADA PUNTO → NO PROCEDER CON ANÁLISIS 5D**

**Ejemplos de NO evidencia válida:**
- ❌ "Probablemente usa shared components"
- ❌ "Parece que necesita business logic separada"
- ❌ "Debería tener EventBus integration"

**Ejemplos de SÍ evidencia válida:**
- ✅ "WeeklyCalendar importado en línea 8 de WeeklyScheduleView.tsx"
- ✅ "business-logic/scheduling/schedulingCalculations.ts existe con 156 líneas"
- ✅ "useModuleIntegration usado en línea 67 de page.tsx"

---

## 🔍 **FASE 1: ANÁLISIS DE 5 DIMENSIONES** (Solo aplicar con evidencia empírica)

### **METODOLOGÍA: Detectar reutilización ANTES de codear**

#### **DIMENSIÓN 1: ENTIDADES COMPARTIDAS (CON VERIFICACIÓN EMPÍRICA)**

### 🔍 **INVESTIGACIÓN OBLIGATORIA ANTES DE ANALIZAR**:
```bash
# Buscar types/interfaces del módulo
find src/[module-path] -name "*types*" -o -name "*interface*"
grep -r "interface\|type.*=" src/[module-path]/types/

# Verificar reutilización REAL entre módulos
grep -r "import.*Employee\|import.*Staff" src/
grep -r "from.*shared.*types" src/
grep -r "export.*interface.*Employee" src/shared/

# Mapear entidades en otros módulos
find src/ -name "*types*" -exec grep -l "Employee\|Staff\|Schedule" {} \;
```

### **ANÁLISIS CON EVIDENCIA**:
¿Qué entidades de negocio toca este módulo?

**EVIDENCIA REQUERIDA**: Solo incluir entidades con imports verificados

ENTIDADES PRIMARIAS (con evidencia de archivo):
├── 🎯 [Entidad Principal] → **EVIDENCIA**: `grep -r "import.*[Entity]" src/` muestra: [archivos]
├── 📊 [Entidad de Datos] → **EVIDENCIA**: [archivo:línea] importa desde [ubicación]
├── ⏰ [Entidad Temporal] → **EVIDENCIA**: [verification command + resultado]
├── 👥 [Entidad Humana] → **EVIDENCIA**: [shared types ubicación verificada]
└── 🏢 [Entidad de Negocio] → **EVIDENCIA**: [cross-module usage confirmado]

ENTIDADES SECUNDARIAS (CRÍTICO - EVITA INTEGRACIONES PERDIDAS):
├── 💰 [Entidad Financiera] → ¿Costos, precios, presupuestos, ROI?
├── 📋 [Entidad de Proceso] → ¿Workflows, aprobaciones, estados?
├── 📊 [Entidad de Métrica] → ¿KPIs, analytics, reportes?
└── ⚙️ [Entidad de Config] → ¿Settings, reglas, preferencias?

EJEMPLO PRÁCTICO - SCHEDULING:
PRIMARIAS: Staff (👥), TimeSlots (⏰), Schedule (🎯)
SECUNDARIAS: Labor costs (💰), Approval workflows (📋),
            Efficiency metrics (📊), Business rules (⚙️)

PREGUNTA CLAVE: ¿Al menos 2 módulos comparten estas entidades?
SI NO → REANALIZAR módulo
```

#### **DIMENSIÓN 2: FUNCIONALIDADES TRANSVERSALES (ESTRUCTURA COMPLETA)**
```markdown
¿Qué funcionalidades de este módulo podrían necesitar otros módulos?

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

🔄 CROSS-MODULE OPPORTUNITY ANALYSIS (NUEVO):
**MANDATORY**: Ejecutar comandos de Step 6 para identificar:
├── ✅ **Duplicación detectada** → OPORTUNIDAD de reutilización
├── ✅ **Lógica similar** → OPORTUNIDAD de abstracción
├── ✅ **Components manuales** → OPORTUNIDAD de shared components
└── ✅ **Types duplicados** → OPORTUNIDAD de tipos unificados

⚠️ MINDSET CHANGE: "Duplicación = OPORTUNIDAD, no problema"

CRITERIO ACTUALIZADO: ¿Al menos 3 casos de reutilización O 2+ oportunidades cross-module?
SI NO → REANALIZAR funcionalidades Y ejecutar análisis cross-module
```

#### **DIMENSIÓN 3: FLUJOS DE DATOS (CON TRANSFORMACIONES)**
```markdown
INPUTS → PROCESSING → OUTPUTS

INPUTS (Datos que consume):
├── 📥 [Tipo de Dato] ← ¿De qué módulos viene?
│   ├── Staff info ← HR/Staff module
│   ├── Business hours ← Settings module
│   ├── Sales forecast ← Sales/Analytics
│   └── Production requirements ← Production module
├── 📥 [Configuración] ← ¿Quién configura qué?
└── 📥 [Eventos externos] ← ¿Qué triggers externos?

TRANSFORMATIONS (CRÍTICO - EVITA DUPLICACIÓN):
├── 🔄 [Lógica de Negocio] → ¿Otros módulos la necesitan?
│   ├── Schedule optimization → Production planning
│   ├── Conflict resolution → Resource management
│   └── Cost calculation → Finance, Analytics
├── 🔄 [Cálculos] → ¿Reutilizable en otros contextos?
│   ├── Time overlap detection → Events, Maintenance
│   ├── Workload balancing → Task assignment
│   └── Efficiency scoring → Performance analytics
└── 🔄 [Validaciones] → ¿Reglas aplicables elsewhere?
    ├── Availability validation → Resource booking
    ├── Skill requirement validation → Task assignment
    └── Business rule validation → Compliance modules

OUTPUTS (Datos que produce):
├── 📤 [Tipo de Dato] → ¿Qué módulos lo necesitan?
│   ├── Assigned shifts → Payroll module
│   ├── Labor costs → Finance module
│   ├── Productivity metrics → Analytics module
│   └── Coverage gaps → Management alerts
├── 📤 [Eventos] → ¿Qué módulos escuchan?
└── 📤 [Métricas] → ¿Quién consume métricas?

PREGUNTA: ¿Usa EventBus para comunicación entre módulos?
SI NO → REANALIZAR integración
```

#### **DIMENSIÓN 4: PLANIFICACIÓN UX/UI Y ARQUITECTURA DE INFORMACIÓN**

### 🎯 **NUEVA DIMENSIÓN CRÍTICA AÑADIDA**
**Razón**: Gap detectado - Framework cubría implementación UI pero NO planificación UX

### 🔍 **INVESTIGACIÓN OBLIGATORIA ANTES DE PLANIFICAR UI**:
```bash
# Verificar plantillas UI existentes aplicables
grep -r "PLANTILLA.*EMPRESARIAL\|PLANTILLA.*CONFIG" docs/05-development/
find docs/ -name "*UI*CONSTRUCTION*" -o -name "*PAGE*CONSTRUCTION*"

# Mapear flujos existentes similares en módulos del mismo tipo
find src/pages/admin -name "*page.tsx" | head -10
grep -r "ContentLayout\|Section\|Tabs" src/pages/admin/[similar-module]/

# Verificar patrones de navegación existentes
grep -r "useRouter\|navigate\|Tabs\|Modal" src/pages/admin/[similar-module]/
```

### **PLANIFICACIÓN UX/UI OBLIGATORIA (ANTES DE CONSTRUCCIÓN)**:

#### **4.1 USER FLOW MAPPING**
```markdown
🎯 OBLIGATORIO: Mapear flujos completos ANTES de codear

PRIMARY USER FLOWS:
├── 📱 **Entry Point** → ¿Cómo llega el usuario al módulo?
├── 🎯 **Main Actions** → ¿Cuáles son las 3 acciones principales?
├── 🔄 **Secondary Flows** → ¿Editar, ver detalles, reportes?
├── 📊 **Data Views** → ¿Listas, cards, tables, charts?
└── 🚪 **Exit Points** → ¿Hacia dónde va después?

**EVIDENCIA REQUERIDA**: User journey map o diagrama de flujo verificado con stakeholders
```

#### **4.2 SCREEN HIERARCHY & INFORMATION ARCHITECTURE**
```markdown
🏗️ OBLIGATORIO: Definir arquitectura de pantallas

SCREEN STRUCTURE PLANNING:
├── 🏠 **Landing View** → Métricas + Acciones principales + Navigation
├── 📋 **List/Management View** → Data display + Filters + Actions
├── 📝 **Form/Create View** → Input fields + Validation + Save/Cancel
├── 👁️ **Detail View** → Read-only info + Related actions
├── 📊 **Analytics View** → Charts + Filters + Export
└── ⚙️ **Settings View** → Configuration + Preferences

**MOBILE ADAPTATION PLANNING**:
- ¿Qué secciones se colapsan en mobile?
- ¿Navegación bottom tabs vs hamburger menu?
- ¿Touch targets mínimo 44px?
- ¿Scroll behavior y lazy loading?
```

#### **4.3 INTERACTION DESIGN PLANNING**
```markdown
🎨 OBLIGATORIO: Planificar interacciones específicas

INTERACTION PATTERNS:
├── 🎯 **Primary CTAs** → [Ubicación, color, texto, acción]
├── 📝 **Form Interactions** → [Validation, error handling, success states]
├── 📊 **Data Interactions** → [Sort, filter, pagination, selection]
├── 🔄 **Loading States** → [Skeleton, spinner, progressive loading]
├── ❌ **Error Handling** → [Error boundaries, retry mechanisms, fallbacks]
└── 📱 **Mobile Gestures** → [Swipe, tap, long press, pull-to-refresh]

**SLOT PLANNING** (Para extensibilidad):
- ¿Dónde van extensiones de otros módulos?
- ¿Qué acciones son customizables por capabilities?
- ¿Dónde se insertan widgets adicionales?
```

#### **4.4 STATE MANAGEMENT UX PLANNING**
```markdown
🧠 OBLIGATORIO: Planificar estados y transiciones UX

UX STATE MAPPING:
├── 🔄 **Loading States** → ¿Skeleton, spinner, progressive loading?
├── ✅ **Success States** → ¿Notifications, navigation, visual feedback?
├── ❌ **Error States** → ¿Retry buttons, fallback content, error boundaries?
├── 📭 **Empty States** → ¿Call-to-action, help text, illustrations?
├── 🔒 **Permission States** → ¿Disabled UI, hidden features, upgrade prompts?
└── 📱 **Offline States** → ¿Cached data, sync indicators, offline actions?

**TRANSITION PLANNING**:
- ¿Animaciones entre vistas (fade, slide)?
- ¿Loading-to-content smooth transitions?
- ¿Form validation feedback timing?
- ¿Navigation state preservation?
```

---

#### **DIMENSIÓN 5: CONSISTENCIA UI Y IMPLEMENTACIÓN TÉCNICA**

```markdown
⚠️ CRÍTICO: Prevenir inconsistencia entre módulos y componentes duplicados

UI PATTERN ANALYSIS:
├── 🎯 TIPO DE MÓDULO → ¿Empresarial, Configuración o Analytics?
├── 📐 LAYOUT PATTERN → ¿Sigue plantilla establecida?
├── 📊 MÉTRICAS DISPLAY → ¿Usa patrón estándar de métricas?
├── 🔄 NAVEGACIÓN → ¿Consistente con módulos similares?
└── 📱 RESPONSIVE → ¿Mismo comportamiento cross-módulo?

🚨 AUDIT OBLIGATORIO DE COMPONENTES EXISTENTES (PASO 1):
ANTES DE DISEÑAR CUALQUIER INTERFAZ:
- [ ] ✅ OBLIGATORIO: Revisar `/src/shared/ui/index.ts` completamente
- [ ] ✅ OBLIGATORIO: Mapear necesidades → componentes existentes
- [ ] ✅ OBLIGATORIO: Identificar gaps REALES (no duplicar)
- [ ] ✅ PROHIBIDO: Crear DatePicker, Modal, Button, Card, etc. custom

INVENTORY DE COMPONENTES SHARED/UI (REVISAR SIEMPRE):
├── 📋 Data Display → FilterableDataGrid, MetricCard, CardGrid
├── 📝 Forms → ContentLayout, FormSection, InputField, SelectField
├── 📊 Analytics → StatsSection, AnalyticsDashboard template
├── 🎨 Layout → Section, Stack, Typography, Layout variants
├── 🔔 Feedback → Alert, Badge, Progress, Spinner, Toast
├── 📅 Date/Time → [Verificar si existe antes de crear]
└── 🎯 Business → RecipeCostCard, InventoryAlertBadge, etc.

CONSISTENCY CHECKLIST:
- [ ] ¿Qué módulos existentes muestran información similar?
- [ ] ¿Cómo organizan la información otros módulos del mismo tipo?
- [ ] ✅ MAPEADO: ¿Qué componentes shared/ui cubren mis necesidades?
- [ ] ¿La navegación es consistente con módulos relacionados?
- [ ] ¿Las métricas siguen el mismo patrón visual?

UI MAPPING OBLIGATORIO (NO OPCIONAL):
├── 📅 Calendario necesario → ✅ VERIFICAR: ¿Existe en shared/ui?
├── 📊 Charts/Analytics → ✅ USAR: MetricCard + AnalyticsDashboard
├── 📋 Lista/Grid de datos → ✅ USAR: FilterableDataGrid (SIEMPRE)
├── 🔔 Alertas/Notificaciones → ✅ USAR: Sistema Unificado v2.1
├── ⚙️ Configuración → ✅ USAR: ContentLayout + FormSection
├── 📊 Métricas → ✅ USAR: StatsSection + MetricCard
└── 🎨 Layout general → ✅ USAR: Section variants (default/elevated/flat)

❌ EJEMPLOS DE VIOLACIONES CRÍTICAS:
- Crear custom DatePicker cuando debería usar shared/ui
- Implementar tabla custom en lugar de FilterableDataGrid
- Crear alertas custom ignorando Sistema Unificado v2.1
- Diseñar layout único sin verificar Section + ContentLayout

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

#### **DIMENSIÓN 5: INTEGRACIÓN ARQUITECTÓNICA (EXPANDIDA)**
```markdown
🏗️ EVENTBUS INTEGRATION:
├── Events emitted → ¿Qué otros módulos los necesitan?
│   ├── [modulo].created → ¿Production, Payroll escuchan?
│   ├── [modulo].conflict → ¿Management notifications?
│   ├── [modulo].optimization → ¿Analytics tracking?
│   └── [modulo].approved → ¿Finance, HR implications?
├── Events consumed → ¿De qué módulos viene información?
│   ├── staff.availability_changed → Staff module
│   ├── production.demand_forecast → Production module
│   ├── sales.peak_hours_analysis → Sales module
│   └── finance.labor_budget_limits → Finance module

🔒 CAPABILITIES INTEGRATION:
├── Required capabilities → ¿Qué permisos necesita?
│   ├── [module]_management → Crear/editar records
│   ├── [entity]_assignment → Asignar recursos
│   ├── cost_access → Ver costos/financieros
│   └── analytics_access → Ver métricas
├── Conditional features → ¿Qué features son opcionales?
│   ├── Advanced analytics → Solo si analytics_premium
│   ├── Multi-location → Solo si multi_location_enabled
│   ├── Integration APIs → Solo si integrations_enabled
│   └── AI optimization → Solo si ai_features_enabled

📦 SLOTS INTEGRATION (SISTEMA ACTUALIZADO v3.2):
├── Extension points → ¿Dónde otros módulos pueden extender?
│   ├── Slots para inyectar componentes → <Slot name="[entity]-actions" />
│   ├── Renderización condicional automática → requirements: ['capability']
│   ├── Registro dinámico de módulos → registerModuleSlots()
│   └── Componentes cross-module → Eliminan condicionales manuales
├── Implementación moderna:
│   ├── SlotRegistry centralizado → Una fuente de verdad
│   ├── Capabilities como requirements → Automático show/hide
│   ├── APIs limpias → <Slot name="X" data={entity} single />
│   └── Registro modular → Cada módulo registra sus extensiones

🧮 ZUSTAND INTEGRATION:
├── State management → ¿Qué state es local vs global?
│   ├── Current [entity] view → Local al módulo
│   ├── [Entity] availability → Compartido con otros módulos
│   ├── Business rules → Global configuration
│   └── User preferences → Global user settings
├── State synchronization → ¿Qué state sincroniza con otros módulos?
│   ├── [Entity] changes → Sync con módulos dependientes
│   ├── [Entity] assignments → Sync con HR/Finance
│   ├── Cost calculations → Sync con Finance
│   └── Performance metrics → Sync con Analytics
```

#### **DIMENSIÓN 6: STRATEGIC BUSINESS CONTEXT** 🎯 **(NUEVO)**
```markdown
🚨 NUEVA DIMENSIÓN CRÍTICA: Análisis del contexto estratégico del negocio

BUSINESS MODEL EXPANSION POTENTIAL:
├── 📊 **Capabilities Mapping** → ¿Qué business capabilities habilita este módulo?
│   ├── Current capabilities: [lista de capabilities verificadas]
│   ├── Potential capabilities: [capabilities que podría habilitar]
│   └── Business models affected: [cuántos business models usan/podrían usar]
├── 💰 **Revenue Impact Assessment** → ¿Qué oportunidades de negocio desbloquea?
│   ├── New markets enabled: [industrias/mercados nuevos]
│   ├── Revenue streams: [tipos de monetización habilitados]
│   └── Competitive advantage: [diferenciación vs competencia]
└── 🔮 **Future Expansion ROI** → ¿Cuál es el ROI de inversión vs potencial?
    ├── 12-month potential: [business models que se podrían activar]
    ├── 24-month vision: [expansión de mercado proyectada]
    └── Strategic importance: [building block vs peripheral]

STRATEGIC IMPORTANCE ASSESSMENT:
├── 🏗️ **Core vs Peripheral** → ¿Es este módulo fundamental o auxiliar?
│   ├── Dependencies: [qué otros módulos dependen de este]
│   ├── Foundational: [es prerequisito para otras funcionalidades]
│   └── Differentiator: [es clave para propuesta de valor]
├── 🔗 **Integration Criticality** → ¿Qué tan crítica es su integración?
│   ├── Cross-module impact: [efectos en otros módulos]
│   ├── Data flow centrality: [centralidad en flujos de datos]
│   └── Business process enablement: [procesos críticos que habilita]

BUSINESS CAPABILITIES DEEP-DIVE:
```bash
# Verificar capabilities habilitadas por este módulo
grep -r "[module-concept]" src/lib/capabilities/types/BusinessCapabilities.ts
grep -r "[module-name]" src/lib/capabilities/types/BusinessModels.ts

# Mapear business models que usan estas capabilities
find src/lib/capabilities/ -name "*.ts" -exec grep -l "[capability-name]" {} \;
```

MARKET EXPANSION MATRIX:
| Business Model | Current Support | Potential Support | Revenue Impact | Implementation Effort |
|----------------|-----------------|-------------------|----------------|-----------------------|
| Restaurant     | ✅ Full         | ✅ Full           | Current        | None                  |
| Medical        | ❌ None         | ✅ High           | +High          | Medium                |
| Fitness        | ❌ None         | ✅ High           | +High          | Medium                |
| Education      | ❌ None         | ✅ Medium         | +Medium        | Low                   |
| Rental         | ❌ None         | ✅ High           | +High          | High                  |

STRATEGIC DECISION CRITERIA:
- [ ] ✅ **Building Block Status**: ¿Es fundamental para múltiples business models?
- [ ] ✅ **Revenue Enablement**: ¿Desbloquea nuevas oportunidades de monetización?
- [ ] ✅ **Market Differentiation**: ¿Nos diferencia competitivamente?
- [ ] ✅ **Scalability Foundation**: ¿Es prerequisito para escalar a nuevos mercados?

**CONCLUSIÓN ESTRATÉGICA**: [Core/Peripheral] + [High/Medium/Low Strategic Value]
```

#### **DIMENSIÓN 7: INTELIGENCIA DE ALERTAS** 🧠
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

## 4. CRITERIOS DE VALIDACIÓN ACTUALIZADOS (v2.0)
**CRITERIOS TÉCNICOS**:
- [ ] ✅ Al menos 2 módulos comparten entidades
- [ ] ✅ Al menos 3 casos de reutilización O 2+ oportunidades cross-module
- [ ] ✅ Usa EventBus para comunicación
- [ ] ✅ Sigue Design System v2.1
- [ ] ✅ Implementa CapabilityGate
- [ ] ✅ Cross-module opportunities analysis completado

**CRITERIOS ESTRATÉGICOS** (NUEVOS):
- [ ] ✅ Business capabilities mapping completado
- [ ] ✅ Strategic importance assessment realizado
- [ ] ✅ Market expansion potential evaluado
- [ ] ✅ Revenue impact quantificado

**CRITERIOS DE INTELIGENCIA**:
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

**🎯 MANTRA**: "Investigar PRIMERO, detectar reutilización DESPUÉS, evitar duplicación SIEMPRE"

---

## 🚨 **LECCIONES DE FALLA CRÍTICA - ANÁLISIS SCHEDULING**

### **CASO DE ESTUDIO: Por qué falló el análisis original**

**Framework Aplicado**: Module Planning Master Guide v2.1 completo
**Resultado**: 85% conclusiones incorrectas, plan de refactorización inválido
**Causa**: Aplicación de framework teórico sin investigación empírica

### **ERRORES ESPECÍFICOS COMETIDOS:**

1. **Error de Shared Components**:
   ```
   ❌ Mi Conclusión: "Mover WeeklyCalendar a shared/ui como oportunidad"
   ✅ Realidad: WeeklyCalendar YA ESTABA en shared/ui y se usaba
   🔍 Comando que hubiera evitado error: find src/shared/ui -name "*Calendar*"
   ```

2. **Error de Business Logic**:
   ```
   ❌ Mi Conclusión: "Extraer business logic a shared/"
   ✅ Realidad: YA EXISTÍA business-logic/scheduling/schedulingCalculations.ts
   🔍 Comando que hubiera evitado error: find src/business-logic -name "*schedul*"
   ```

3. **Error de API Integration**:
   ```
   ❌ Mi Conclusión: "APIs principalmente mock"
   ✅ Realidad: APIs reales de Supabase implementadas (coverageApi.ts)
   🔍 Comando que hubiera evitado error: find src/services -name "*Api*"
   ```

### **PATTERN DEL FALLO**:
```
Framework Teórico → Asunciones Lógicas → Análisis Especulativo → Conclusiones Incorrectas
```

### **PATTERN CORRECTO**:
```
Investigación Empírica → Evidencia Verificada → Análisis Basado en Realidad → Conclusiones Válidas
```

### **PRINCIPIOS PARA EVITAR REPETIR ERRORES:**

1. **NUNCA ASUMIR**: Todo debe verificarse con comandos específicos
2. **EVIDENCIA PRIMERO**: Investigación empírica antes que framework teórico
3. **VALIDACIÓN CRUZADA**: Buscar evidencia que contradiga tus conclusiones
4. **COMANDOS OBLIGATORIOS**: Cada análisis debe incluir comandos verificables
5. **ZERO SPECULATION**: Solo conclusiones respaldadas por código real

### **CHECKLIST ANTI-FALLA:**
- [ ] ¿Ejecuté comandos para verificar cada afirmación?
- [ ] ¿Tengo evidencia específica (archivo:línea) para cada conclusión?
- [ ] ¿Busqué activamente evidencia que contradiga mi análisis?
- [ ] ¿Validé el estado real antes de aplicar frameworks teóricos?
- [ ] ¿Evité toda especulación sobre "lo que debería ser"?

---

**⚠️ MENSAJE FINAL**: Este framework es poderoso, pero INÚTIL sin investigación empírica exhaustiva. La mejora más crítica es anteponer comandos de verificación a todo análisis teórico.

---

## 🚀 **LECCIONES APRENDIDAS v2.0 - FIRST SUCCESSFUL APPLICATION**

### **✅ ÉXITOS VALIDADOS**
1. **Investigación empírica obligatoria** evitó 85% conclusiones incorrectas
2. **Detección de duplicación** Staff/Scheduling funcionó perfectamente
3. **Strategic context revelation** reveló potencial 8+ business models
4. **Framework evolution** de sobrediseñado → subdiseñado

### **📈 MEJORAS IMPLEMENTADAS v2.0**
1. **STEP 6: Cross-Module Opportunity Analysis** → Metodología sistemática
2. **DIMENSIÓN 6: Strategic Business Context** → Análisis de potencial estratégico
3. **Criterios actualizados** → Include business capabilities + strategic assessment
4. **Mindset change** → "Duplicación = OPORTUNIDAD, no problema"

### **🎯 MANTRA EVOLUTION**
- **v1.0**: "COMANDOS PRIMERO, FRAMEWORKS DESPUÉS"
- **v2.0**: "COMANDOS PRIMERO, CONTEXTO ESTRATÉGICO SEGUNDO, FRAMEWORKS PARA EL FUTURO"

### **🔮 FRAMEWORK MATURITY STATUS**
- ✅ **Tested in production** → Scheduling module analysis successful
- ✅ **False positives avoided** → Empirical research worked
- ✅ **Strategic insights generated** → Multi-business context revealed
- ✅ **Architecture validated** → Unified Calendar Architecture emerged

**RESULTADO**: Framework ready for application to legacy modules (Staff, Operations Hub)