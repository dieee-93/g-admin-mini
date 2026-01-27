# ShiftControl - UI Architecture & Design (MASTER DOCUMENT)

**Fecha**: 2025-12-04
**Estado**: 🚧 DRAFT - To be completed
**Propósito**: ÚNICO documento definitivo para arquitectura UI del componente ShiftControl

---

## 📋 ESTE ES EL DOCUMENTO MAESTRO

**Todos los demás documentos se consolidan AQUÍ.**

Después de completar este documento, los demás se pueden archivar o eliminar.

---

## 🎯 OBJETIVO

Diseñar la arquitectura de componentes del ShiftControl Widget que:
- ✅ Se adapta dinámicamente a capabilities activas
- ✅ Usa HookPoint pattern para inyección de contenido
- ✅ Respeta convenciones del proyecto
- ✅ Es performante (no re-renders innecesarios)
- ✅ Soporta múltiples operational shifts por día

---

## 📐 ARQUITECTURA DE COMPONENTES

### Component Tree

```
[TO BE DESIGNED]

Ejemplo base a expandir:
ShiftControlWidget
├─ ShiftHeader
├─ ShiftSelector (si múltiples shifts)
├─ IndicatorsGrid (HookPoint)
├─ QuickActionsBar (HookPoint)
├─ AlertsPanel (HookPoint)
└─ ShiftFooter
```

### Component Responsibilities

**[TO BE DEFINED]**

- ¿Qué hace cada componente?
- ¿Qué props recibe?
- ¿Cuándo se renderiza?
- ¿Cómo se adapta a capabilities?

---

## 🎨 VISUAL DESIGN

### Layout Structure

**[TO BE DESIGNED]**

Mockup/wireframe del widget en diferentes estados.

### Responsive Behavior

**[TO BE DEFINED]**

- Desktop (>1024px)
- Tablet (768px-1024px)
- Mobile (<768px)

---

## 🔌 HOOKPOINT STRATEGY

### Hook Points Provided

**[TO BE DEFINED]**

1. `shift-control.indicators`
   - Qué se inyecta
   - Orden de priority
   - Props que reciben

2. `shift-control.quick-actions`
   - [...]

3. `shift-control.alerts`
   - [...]

### Injection Rules

**[TO BE DEFINED]**

¿Cómo se determina qué módulos inyectan qué contenido?

---

## 🎭 STATE MACHINE

### Estados del Widget

**[TO BE DEFINED]**

Estado 1: No operational shift
Estado 2: Single shift active
Estado 3: Multiple shifts (one active)
Estado 4: Closing validation
Estado 5: Shift closed

### Transitions

**[TO BE DEFINED]**

¿Cómo se transiciona entre estados?
¿Qué triggers causan cambios?

---

## 🧩 CAPABILITY-DRIVEN RENDERING

### Rendering Logic

**[TO BE DEFINED]**

```typescript
// Ejemplo a expandir:
if (hasFeature('sales_pos')) {
  // Mostrar CashSessionIndicator
  // Mostrar botón "Abrir Caja"
  // Agregar close blocker: cash_session_open
}

if (hasFeature('sales_pos_dine_in')) {
  // Mostrar TablesIndicator
  // Agregar close blocker: tables_open
}

// ... etc para todas las capabilities
```

### Feature Matrix

**[TO BE DEFINED]**

| Feature | Indicators | Actions | Blockers |
|---------|-----------|---------|----------|
| sales_pos | CashSession | OpenCash | cash_open |
| sales_pos_dine_in | Tables | ViewTables | tables_open |
| ... | ... | ... | ... |

---

## 📦 COMPONENT SPECIFICATIONS

### ShiftHeader

**[TO BE DEFINED]**

```typescript
interface ShiftHeaderProps {
  // Props
}

// Behavior
// Rendering logic
// Adaptations
```

### [Otros componentes...]

**[TO BE DEFINED]**

---

## 🔄 DATA FLOW

### Props Flow

**[TO BE DEFINED]**

¿Cómo fluyen los datos desde el store hacia los componentes?

### Event Flow

**[TO BE DEFINED]**

¿Qué eventos emite el widget?
¿Qué eventos consume?

---

## ⚡ PERFORMANCE CONSIDERATIONS

### Memoization Strategy

**[TO BE DEFINED]**

¿Qué componentes necesitan React.memo?
¿Qué props necesitan useMemo?
¿Qué callbacks necesitan useCallback?

### Re-render Prevention

**[TO BE DEFINED]**

Estrategias para evitar re-renders innecesarios.

---

## ♿ ACCESSIBILITY

**[TO BE DEFINED]**

- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management

---

## 📱 RESPONSIVE DESIGN

**[TO BE DEFINED]**

Cómo se adapta el layout a diferentes tamaños de pantalla.

---

## 🎯 IMPLEMENTATION CHECKLIST

Una vez diseñado, implementar en este orden:

- [ ] Types e interfaces
- [ ] Sub-componentes básicos
- [ ] ShiftControlWidget principal
- [ ] HookPoint integrations
- [ ] Capability-driven logic
- [ ] Modals (Open/Close/History)
- [ ] Testing
- [ ] Documentation

---

## 📚 REFERENCES

### Consolidado de documentos existentes:

**[TO BE CONSOLIDATED]**

Información relevante de:
- RESEARCH_OPERATIONAL_VS_EMPLOYEE_SHIFTS.md
- SHIFT_LIFECYCLE_BY_CAPABILITY.md
- SHIFT_CONTROL_EXECUTION_PLAN.md
- CONTINUATION_PROMPT.md
- [... otros relevantes]

---

**Estado**: 🚧 INCOMPLETE - Waiting for design session
**Next**: Use prompt to complete this document
