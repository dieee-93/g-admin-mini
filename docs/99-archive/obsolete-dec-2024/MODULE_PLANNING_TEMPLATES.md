# 📋 TEMPLATES DE PLANEACIÓN MODULAR - G-ADMIN MINI

**Objetivo**: Templates prácticos para aplicar el Framework de Planeación Modular
**Uso**: Copiar template → Completar análisis → Validar con checklist → Implementar

---

## 🎯 **TEMPLATE 1: ANÁLISIS INICIAL DE MÓDULO**

### **INFORMACIÓN BÁSICA**
```markdown
# ANÁLISIS MODULAR: [NOMBRE DEL MÓDULO]

**Fecha**: [YYYY-MM-DD]
**Solicitado por**: [Stakeholder]
**Analista**: [Nombre]
**Estimación inicial**: [X semanas]

## DESCRIPCIÓN INICIAL
**Funcionalidad propuesta**: [1-2 párrafos describiendo qué hace]

**Justificación de negocio**: [Por qué es necesario]

**Usuarios objetivo**: [Quién lo usará]

**Criticidad**: [ ] Baja [ ] Media [ ] Alta [ ] Crítica
```

---

## 🔍 **TEMPLATE 2: ANÁLISIS DIMENSIONAL PROFUNDO**

### **DIMENSIÓN 1: ENTIDADES COMPARTIDAS**
```markdown
## 1. MAPEO DE ENTIDADES

### ENTIDADES PRIMARIAS:
| Entidad | Descripción | Módulos que la usan actualmente | Potencial reutilización |
|---------|-------------|--------------------------------|------------------------|
| [Entidad 1] | [Descripción] | [Module A, Module B] | [Module C, Module D] |
| [Entidad 2] | [Descripción] | [Module X] | [Module Y, Module Z] |

### ENTIDADES SECUNDARIAS:
| Entidad | Descripción | Impacto | Reutilización |
|---------|-------------|---------|---------------|
| [Entidad A] | [Descripción] | [Alto/Medio/Bajo] | [Posibilidad] |

### ANÁLISIS DE OVERLAPS:
- **Overlap con [Módulo X]**: [Descripción del overlap y oportunidad]
- **Overlap con [Módulo Y]**: [Descripción del overlap y oportunidad]
```

### **DIMENSIÓN 2: FUNCIONALIDADES TRANSVERSALES**
```markdown
## 2. ANÁLISIS DE REUTILIZACIÓN FUNCIONAL

### 🕐 TIEMPO Y CALENDARIO:
- **Funcionalidades identificadas**:
  - [ ] Date/time pickers → Reutilizable en: [módulos]
  - [ ] Calendar views → Reutilizable en: [módulos]
  - [ ] Time calculations → Reutilizable en: [módulos]
  - [ ] Recurring patterns → Reutilizable en: [módulos]

### 👥 GESTIÓN DE PERSONAS:
- **Funcionalidades identificadas**:
  - [ ] Assignment logic → Reutilizable en: [módulos]
  - [ ] Availability tracking → Reutilizable en: [módulos]
  - [ ] Skill matching → Reutilizable en: [módulos]

### 📊 ANALYTICS Y REPORTING:
- **Funcionalidades identificadas**:
  - [ ] Usage patterns → Reutilizable en: [módulos]
  - [ ] Performance metrics → Reutilizable en: [módulos]
  - [ ] Forecasting → Reutilizable en: [módulos]

### ⚙️ CONFIGURACIÓN Y REGLAS:
- **Funcionalidades identificadas**:
  - [ ] Business rules → Reutilizable en: [módulos]
  - [ ] Approval workflows → Reutilizable en: [módulos]
  - [ ] Template systems → Reutilizable en: [módulos]
```

### **DIMENSIÓN 3: FLUJOS DE DATOS**
```markdown
## 3. MAPEO DE FLUJOS DE DATOS

### INPUTS (Datos que consume):
| Dato | Fuente | Formato | Frecuencia | Criticidad |
|------|--------|---------|------------|------------|
| [Dato 1] | [Módulo/API] | [JSON/etc] | [Real-time/Batch] | [Alta/Media/Baja] |

### OUTPUTS (Datos que produce):
| Dato | Destino | Formato | Frecuencia | Impacto |
|------|---------|---------|------------|---------|
| [Dato 1] | [Módulo/Sistema] | [JSON/etc] | [Real-time/Batch] | [Alto/Medio/Bajo] |

### TRANSFORMATIONS (Procesamientos):
| Proceso | Input | Output | Complejidad | Reutilización |
|---------|-------|--------|-------------|---------------|
| [Proceso 1] | [Input] | [Output] | [Alta/Media/Baja] | [Sí/No - Dónde] |
```

### **DIMENSIÓN 4: INTERFACES DE USUARIO**
```markdown
## 4. ANÁLISIS DE UI REUTILIZABLE

### 📱 COMPONENTES IDENTIFICADOS:
| Componente | Funcionalidad | Reutilizable en | Complejidad | Prioridad |
|------------|---------------|----------------|-------------|-----------|
| [Componente 1] | [Descripción] | [Módulos] | [Alta/Media/Baja] | [1-5] |

### 🎨 PATRONES DE INTERACCIÓN:
| Patrón | Descripción | Aplicable en | Esfuerzo | ROI |
|--------|-------------|--------------|----------|-----|
| [Patrón 1] | [Descripción] | [Contextos] | [Alto/Medio/Bajo] | [Alto/Medio/Bajo] |

### 📊 VISUALIZACIONES:
| Visualización | Datos | Reutilizable en | Complejidad |
|---------------|-------|----------------|-------------|
| [Chart/Graph] | [Tipo de datos] | [Módulos] | [Alta/Media/Baja] |
```

### **DIMENSIÓN 5: INTEGRACIÓN ARQUITECTÓNICA**
```markdown
## 5. PLAN DE INTEGRACIÓN ARQUITECTÓNICA

### 🏗️ EVENTBUS INTEGRATION:
**Events emitted**:
- `[modulo].[evento1]`: [Descripción] → Consumido por: [módulos]
- `[modulo].[evento2]`: [Descripción] → Consumido por: [módulos]

**Events consumed**:
- `[fuente].[evento]`: [Descripción] → Impacto: [descripción]

### 🔒 CAPABILITIES INTEGRATION:
**Required capabilities**:
- `[capability_1]`: [Justificación]
- `[capability_2]`: [Justificación]

**Optional capabilities**:
- `[capability_optional]`: [Feature que habilita]

### 📦 SLOTS INTEGRATION:
**Extension points**:
- `[slot_name]`: [Propósito] → Usado por: [módulos potenciales]

**Content injection**:
- `[injection_point]`: [Tipo de content] → Contexto: [cuándo/dónde]

### 🧮 ZUSTAND INTEGRATION:
**Local state**:
- [Estado específico del módulo]

**Shared state**:
- [Estado compartido con otros módulos]

**State synchronization**:
- [Qué state sincroniza y con quién]
```

---

## 🧩 **TEMPLATE 3: ANÁLISIS DE IMPACTO Y DEPENDENCIAS**

```markdown
# ANÁLISIS DE IMPACTO: [NOMBRE DEL MÓDULO]

## DEPENDENCIAS IDENTIFICADAS

### DEPENDENCIAS CRÍTICAS:
| Módulo/Sistema | Tipo | Impacto si falla | Mitigación |
|----------------|------|------------------|------------|
| [Módulo X] | [EventBus/API/DB] | [Descripción] | [Plan B] |

### DEPENDENCIAS OPCIONALES:
| Módulo/Sistema | Beneficio | Degradación si ausente |
|----------------|-----------|----------------------|
| [Módulo Y] | [Descripción] | [Funcionalidad reducida] |

## IMPACTO EN MÓDULOS EXISTENTES

### CAMBIOS REQUERIDOS:
| Módulo | Cambio | Esfuerzo | Riesgo |
|--------|--------|----------|--------|
| [Módulo A] | [Descripción] | [Alto/Medio/Bajo] | [Alto/Medio/Bajo] |

### OPORTUNIDADES DE MEJORA:
| Módulo | Mejora | Beneficio | Esfuerzo |
|--------|--------|-----------|----------|
| [Módulo B] | [Descripción] | [Descripción] | [Alto/Medio/Bajo] |
```

---

## 🎯 **TEMPLATE 4: DECISIONES ARQUITECTÓNICAS**

```markdown
# DECISIONES ARQUITECTÓNICAS: [NOMBRE DEL MÓDULO]

## DECISIÓN 1: REUTILIZACIÓN vs ESPECÍFICO

### COMPONENTES PARA SHARED:
| Componente | Justificación | Ubicación propuesta | Esfuerzo adicional |
|------------|---------------|---------------------|-------------------|
| [Componente] | [Usado por X módulos] | [shared/ui/] | [X días] |

### COMPONENTES ESPECÍFICOS:
| Componente | Justificación | Ubicación |
|------------|---------------|-----------|
| [Componente] | [Solo para este módulo] | [module/components/] |

## DECISIÓN 2: EVENTBUS EVENTS

### EVENTS NUEVOS:
| Evento | Payload | Justificación | Consumidores |
|--------|---------|---------------|--------------|
| `[modulo].[evento]` | `[estructura]` | [Razón] | [módulos] |

### EVENTS EXISTENTES A USAR:
| Evento | Fuente | Cómo se usa |
|--------|--------|-------------|
| `[fuente].[evento]` | [Módulo] | [Descripción] |

## DECISIÓN 3: CAPABILITIES

### CAPABILITIES NUEVAS:
| Capability | Justificación | Impacto |
|------------|---------------|---------|
| `[nueva_capability]` | [Razón] | [Módulos afectados] |

### CAPABILITIES EXISTENTES:
| Capability | Uso |
|------------|-----|
| `[existente]` | [Cómo se usa] |

## DECISIÓN 4: ESTADO Y PERSISTENCIA

### ZUSTAND STATE:
- **Local**: [Lista de state local]
- **Compartido**: [Lista de state compartido]

### PERSISTENCIA:
- **Database**: [Qué se persiste]
- **LocalStorage**: [Qué se guarda localmente]
- **Cache**: [Qué se cachea]
```

---

## ✅ **TEMPLATE 5: CHECKLIST DE VALIDACIÓN**

```markdown
# CHECKLIST DE VALIDACIÓN: [NOMBRE DEL MÓDULO]

## ANÁLISIS COMPLETADO:
- [ ] Dimensión 1: Entidades compartidas identificadas
- [ ] Dimensión 2: Funcionalidades transversales mapeadas
- [ ] Dimensión 3: Flujos de datos documentados
- [ ] Dimensión 4: UI reutilizable catalogada
- [ ] Dimensión 5: Integración arquitectónica planeada

## REUTILIZACIÓN VALIDADA:
- [ ] Al menos 3 casos de reutilización identificados
- [ ] Componentes shared justificados con múltiples consumidores
- [ ] EventBus integration definida
- [ ] Capabilities mapping completado

## IMPACTO EVALUADO:
- [ ] Dependencias críticas identificadas
- [ ] Módulos existentes impact assessment
- [ ] Plan de migración si necesario
- [ ] Riesgos técnicos documentados

## DECISIONES ARQUITECTÓNICAS:
- [ ] Shared vs específico decidido
- [ ] EventBus events definidos
- [ ] Capabilities strategy clara
- [ ] State management plan

## IMPLEMENTACIÓN LISTA:
- [ ] Estructura de carpetas definida
- [ ] Orden de implementación planificado
- [ ] Testing strategy establecida
- [ ] Documentation plan creado

## STAKEHOLDER APPROVAL:
- [ ] Business stakeholder reviewed
- [ ] Technical lead approved
- [ ] Architecture team validated
- [ ] Implementation team briefed
```

---

## 📚 **EJEMPLO PRÁCTICO: USO DE TEMPLATES**

### **Aplicando los templates al Scheduling Module:**

1. **Template 1**: Análisis inicial → "Staff scheduling con calendar component"
2. **Template 2**: Análisis dimensional → Identificó 5+ casos de reutilización
3. **Template 3**: Impacto → Cambios necesarios en Payroll, HR, Production
4. **Template 4**: Decisiones → shared/scheduling/ components, nuevos events
5. **Template 5**: Validación → ✅ 8 casos de reutilización validados

**Resultado**: En lugar de 1 módulo específico → Arquitectura reutilizable para 8+ contextos

---

**🎯 OBJETIVO ALCANZADO: Templates que fuerzan pensamiento arquitectónico profundo y detectan reutilización antes de codear.**