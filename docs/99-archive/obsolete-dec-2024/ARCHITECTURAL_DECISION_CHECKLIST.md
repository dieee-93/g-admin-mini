# ✅ CHECKLIST ARQUITECTÓNICO OBLIGATORIO - G-ADMIN MINI

**Objetivo**: Checklist mandatory que DEBE completarse antes de escribir cualquier línea de código
**Uso**: NO CODING hasta que todas las casillas estén marcadas ✅
**Enforcement**: Code review rechaza PRs sin este checklist completado

---

## 🚨 **REGLA FUNDAMENTAL**

### **🚫 PROHIBIDO CODEAR HASTA COMPLETAR**
```
❌ NO puedes escribir código hasta completar este checklist
❌ NO puedes hacer PR sin adjuntar este checklist completado
❌ NO puedes hacer merge sin approval de arquitectura
```

### **✅ PROCESO OBLIGATORIO**
```
1. Completar checklist → 2. Review arquitectónico → 3. Approval → 4. Coding
```

---

## 📋 **CHECKLIST ARQUITECTÓNICO**

### **🎯 FASE 1: ANÁLISIS BÁSICO**

#### **1.1 JUSTIFICACIÓN DE MÓDULO**
- [ ] **Business case documentado**: ¿Por qué es necesario este módulo?
- [ ] **Usuarios objetivo identificados**: ¿Quién lo usará y cómo?
- [ ] **Criticidad evaluada**: ¿Es crítico para el negocio?
- [ ] **ROI estimado**: ¿Cuál es el valor vs esfuerzo?

#### **1.2 ALCANCE DEFINIDO**
- [ ] **Funcionalidades core listadas**: ¿Qué hace exactamente?
- [ ] **Funcionalidades out-of-scope claras**: ¿Qué NO hace?
- [ ] **MVP vs Feature completa**: ¿Qué se implementa primero?
- [ ] **Timeline realista**: ¿Cuánto tiempo tomará realmente?

---

### **🔍 FASE 2: ANÁLISIS DE REUTILIZACIÓN (CRÍTICO)**

#### **2.1 ENTITIES REUSABILITY**
- [ ] **Entidades principales identificadas**: ¿Qué entidades de negocio usa?
- [ ] **Módulos que comparten entidades**: ¿Quién más usa estas entidades?
- [ ] **Overlaps documentados**: ¿Hay duplicación de conceptos?
- [ ] **Shared models definidos**: ¿Qué modelos van a shared/types/?

**🚨 CRITERIO DE RECHAZO**: Si no identificaste al menos 2 módulos que comparten entidades, REANALIZAR.

#### **2.2 FUNCTIONAL REUSABILITY**
- [ ] **Funcionalidades transversales identificadas**: ¿Qué función puede reutilizarse?
- [ ] **Casos de uso múltiples validados**: ¿En qué otros contextos aplica?
- [ ] **Shared business logic planeada**: ¿Qué va a shared/business-logic/?
- [ ] **Hooks compartidos identificados**: ¿Qué hooks van a shared/hooks/?

**🚨 CRITERIO DE RECHAZO**: Si no identificaste al menos 3 casos de reutilización, REANALIZAR.

#### **2.3 UI REUSABILITY**
- [ ] **Componentes reutilizables identificados**: ¿Qué UI puede reutilizarse?
- [ ] **Módulos consumidores validados**: ¿Quién más necesita estos componentes?
- [ ] **Shared UI components planeados**: ¿Qué va a shared/ui/?
- [ ] **Design patterns establecidos**: ¿Sigue patrones existentes?

**🚨 CRITERIO DE RECHAZO**: Si todos los componentes son específicos del módulo, REANALIZAR.

---

### **🏗️ FASE 3: INTEGRACIÓN ARQUITECTÓNICA**

#### **3.1 EVENTBUS INTEGRATION**
- [ ] **Events emitted definidos**: ¿Qué eventos emite y por qué?
  ```
  Ejemplo: [modulo].item_created, [modulo].status_changed
  ```
- [ ] **Events consumed definidos**: ¿Qué eventos escucha y cómo reacciona?
  ```
  Ejemplo: Escucha sales.completed → actualiza stock
  ```
- [ ] **Cross-module workflows documentados**: ¿Cómo fluyen los datos entre módulos?
- [ ] **Event payload structures defined**: ¿Qué estructura tienen los eventos?

**🚨 CRITERIO DE RECHAZO**: Si el módulo no emite ni consume eventos, REANALIZAR integración.

#### **3.2 CAPABILITIES INTEGRATION**
- [ ] **Required capabilities identified**: ¿Qué permisos necesita el usuario?
  ```
  Ejemplo: inventory_management, staff_scheduling
  ```
- [ ] **Optional capabilities planned**: ¿Qué features son condicionales?
  ```
  Ejemplo: advanced_analytics (solo si analytics_premium)
  ```
- [ ] **Capability gates ubicadas**: ¿Dónde va cada CapabilityGate?
- [ ] **Progressive disclosure designed**: ¿Cómo se revelan features gradualmente?

**🚨 CRITERIO DE RECHAZO**: Si no usa CapabilityGate, REANALIZAR personalización.

#### **3.3 SLOTS INTEGRATION**
- [ ] **Extension points identified**: ¿Dónde otros módulos pueden extender?
  ```
  Ejemplo: [modulo]-sidebar, [modulo]-actions, [modulo]-metrics
  ```
- [ ] **Content injection planned**: ¿Qué content pueden inyectar otros módulos?
- [ ] **Plugin architecture designed**: ¿Cómo se extiende el módulo?
- [ ] **Third-party integration points**: ¿Dónde se conectan sistemas externos?

**🚨 CRITERIO DE RECHAZO**: Si no tiene extension points, REANALIZAR flexibilidad.

#### **3.4 ZUSTAND INTEGRATION**
- [ ] **Local state defined**: ¿Qué state es específico del módulo?
- [ ] **Shared state identified**: ¿Qué state comparte con otros módulos?
- [ ] **State synchronization planned**: ¿Cómo sincroniza con otros stores?
- [ ] **State persistence strategy**: ¿Qué se persiste y dónde?

---

### **💾 FASE 4: DATOS Y PERSISTENCIA**

#### **4.1 DATABASE DESIGN**
- [ ] **Tables/views identified**: ¿Qué tablas necesita en Supabase?
- [ ] **Relationships documented**: ¿Cómo se relaciona con datos existentes?
- [ ] **Migration plan created**: ¿Cómo se migran datos existentes?
- [ ] **Performance considerations**: ¿Índices, queries, optimizaciones?

#### **4.2 DATA FLOW**
- [ ] **Input sources mapped**: ¿De dónde vienen los datos?
- [ ] **Output destinations documented**: ¿A dónde van los datos?
- [ ] **Data transformations identified**: ¿Qué procesamientos se necesitan?
- [ ] **Real-time vs batch processing**: ¿Cuándo se procesa qué?

---

### **🎨 FASE 5: UI/UX STRATEGY**

#### **5.1 DESIGN SYSTEM COMPLIANCE**
- [ ] **Shared UI components used**: ¿Usa solo componentes de @/shared/ui?
- [ ] **No direct Chakra imports**: ¿Evita import directo de @chakra-ui/react?
- [ ] **Theming support**: ¿Funciona con todos los temas dinámicos?
- [ ] **Responsive design**: ¿Es mobile-first y responsive?

#### **5.2 USER EXPERIENCE**
- [ ] **User flows documented**: ¿Cómo navega el usuario?
- [ ] **Error states designed**: ¿Qué pasa cuando algo falla?
- [ ] **Loading states planned**: ¿Cómo se muestran estados de carga?
- [ ] **Empty states designed**: ¿Qué se muestra cuando no hay datos?

#### **5.3 ACCESSIBILITY**
- [ ] **Keyboard navigation**: ¿Funciona sin mouse?
- [ ] **Screen reader support**: ¿Tiene aria-labels apropiados?
- [ ] **Color contrast**: ¿Cumple estándares de accesibilidad?
- [ ] **Focus management**: ¿Maneja focus correctamente?

---

### **🧪 FASE 6: TESTING STRATEGY**

#### **6.1 UNIT TESTING**
- [ ] **Business logic tests**: ¿Testea lógica de negocio?
- [ ] **Component tests**: ¿Testea componentes de UI?
- [ ] **Hook tests**: ¿Testea custom hooks?
- [ ] **Utility tests**: ¿Testea funciones utilitarias?

#### **6.2 INTEGRATION TESTING**
- [ ] **EventBus integration tests**: ¿Testea eventos entre módulos?
- [ ] **Database integration tests**: ¿Testea queries y mutations?
- [ ] **API integration tests**: ¿Testea llamadas externas?
- [ ] **State synchronization tests**: ¿Testea Zustand integration?

#### **6.3 E2E TESTING**
- [ ] **User workflows tested**: ¿Testea flujos de usuario completos?
- [ ] **Cross-module workflows**: ¿Testea integración entre módulos?
- [ ] **Error scenarios**: ¿Testea casos de error?
- [ ] **Performance scenarios**: ¿Testea performance bajo carga?

---

### **📊 FASE 7: MONITORING & OBSERVABILITY**

#### **7.1 METRICS**
- [ ] **Business metrics defined**: ¿Qué métricas de negocio mide?
- [ ] **Technical metrics identified**: ¿Qué métricas técnicas trackea?
- [ ] **User behavior tracking**: ¿Qué acciones de usuario rastrea?
- [ ] **Performance monitoring**: ¿Cómo detecta performance issues?

#### **7.2 ALERTS**
- [ ] **Error alerts configured**: ¿Cómo se notifican errores?
- [ ] **Performance alerts**: ¿Cuándo alerta sobre lentitud?
- [ ] **Business alerts**: ¿Cuándo alerta sobre anomalías de negocio?
- [ ] **Integration failure alerts**: ¿Cómo detecta fallos de integración?

---

## 🔥 **CRITERIOS DE RECHAZO AUTOMÁTICO**

### **🚨 RED FLAGS - RECHAZO INMEDIATO**
- [ ] **Menos de 3 casos de reutilización identificados**
- [ ] **No usa EventBus para comunicación entre módulos**
- [ ] **No implementa CapabilityGate**
- [ ] **Importa directamente de @chakra-ui/react**
- [ ] **No define extension points (Slots)**
- [ ] **Toda la UI es específica del módulo**
- [ ] **No tiene plan de testing**
- [ ] **No considera mobile/responsive**

### **⚠️ YELLOW FLAGS - REQUIERE JUSTIFICACIÓN**
- [ ] **Solo 1-2 casos de reutilización**
- [ ] **Componentes UI mayormente específicos**
- [ ] **Lógica de negocio no reutilizable**
- [ ] **Pocas integraciones con módulos existentes**
- [ ] **Estado mayormente local (poco compartido)**

---

## 📝 **TEMPLATE DE COMPLETION**

### **CHECKLIST COMPLETION CERTIFICATE**
```
MÓDULO: [Nombre del módulo]
ANALISTA: [Nombre]
FECHA: [YYYY-MM-DD]

FASES COMPLETADAS:
[ ] Fase 1: Análisis Básico (X/X items)
[ ] Fase 2: Análisis de Reutilización (X/X items)
[ ] Fase 3: Integración Arquitectónica (X/X items)
[ ] Fase 4: Datos y Persistencia (X/X items)
[ ] Fase 5: UI/UX Strategy (X/X items)
[ ] Fase 6: Testing Strategy (X/X items)
[ ] Fase 7: Monitoring & Observability (X/X items)

TOTAL: XX/XX items completados

CRITERIOS DE RECHAZO:
[ ] Verificado - No red flags detectados
[ ] Verificado - Yellow flags justificados

REUTILIZACIÓN SUMMARY:
- Shared components: [número]
- Shared business logic: [número]
- Cross-module integrations: [número]
- Extension points: [número]

APPROVED BY:
- [ ] Business Stakeholder: [Nombre]
- [ ] Technical Lead: [Nombre]
- [ ] Architecture Review: [Nombre]

STATUS: [ ] APPROVED FOR IMPLEMENTATION [ ] REQUIRES REVISION

NEXT STEPS:
1. [Acción 1]
2. [Acción 2]
3. [Acción 3]
```

---

**🎯 ENFORCEMENT: Este checklist es OBLIGATORIO. No se acepta código sin completion certificate adjunto.**