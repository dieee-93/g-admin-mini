# Prompt: ShiftControl UI Architecture Design Session

**Objetivo**: Completar `SHIFT_CONTROL_UI_ARCHITECTURE.md` usando TODA la documentación existente, y limpiar docs redundantes.

---

## 📋 INSTRUCCIONES PARA CLAUDE

### FASE 1: Lectura y Consolidación (30 min)

**Tarea**: Leer TODOS los documentos en `docs/shift-control/` y consolidar información relevante.

**Pasos**:

1. **Listar documentos**:
   ```bash
   ls -la docs/shift-control/*.md
   ```

2. **Leer cada documento** y extraer:
   - Decisiones tomadas
   - Arquitectura definida
   - Requisitos identificados
   - Comportamientos por capability
   - Integraciones cross-module

3. **Identificar documentos**:
   - ✅ **Core** - Info esencial que va al documento maestro
   - ⚠️ **Partial** - Info parcialmente útil
   - ❌ **Redundante** - Info duplicada o desactualizada

4. **Crear tabla de clasificación**:
   ```
   | Documento | Clasificación | Info clave | Acción |
   |-----------|---------------|------------|--------|
   | RESEARCH_OPERATIONAL_VS_EMPLOYEE_SHIFTS.md | Core | Distinción conceptual | Consolidar |
   | ... | ... | ... | ... |
   ```

---

### FASE 2: Diseño de Arquitectura UI (60 min)

**Tarea**: Completar TODAS las secciones de `SHIFT_CONTROL_UI_ARCHITECTURE.md`

#### 2.1 Component Tree & Responsibilities

**Diseñar**:
```typescript
ShiftControlWidget (root)
├─ ¿Qué componentes hijos?
│  ├─ Props de cada uno
│  ├─ Responsabilidad única
│  └─ Cuándo se renderiza
```

**Consideraciones**:
- Soportar múltiples shifts (dropdown/selector)
- HookPoint para inyección dinámica
- Adaptación a capabilities
- Performance (memoization)

#### 2.2 Capability-Driven Rendering

**Definir matriz completa**:

```typescript
// Para cada feature en FeatureActivationEngine:

if (hasFeature('sales_pos')) {
  // ¿Qué se muestra?
  // ¿Qué indicadores?
  // ¿Qué acciones?
  // ¿Qué close blockers?
}

if (hasFeature('sales_pos_dine_in')) {
  // [...]
}

// Repetir para TODAS las features relevantes
```

**Features a considerar**:
- `sales_pos`
- `sales_pos_dine_in`
- `sales_pos_takeout`
- `fulfillment_delivery`
- `inventory_stock_management`
- `staff_shift_management`
- `staff_time_tracking`
- `scheduling_appointment_booking`
- `asset_rental_management`
- [... revisar FeatureActivationEngine para lista completa]

#### 2.3 State Machine

**Definir estados del widget**:

```
Estado: NO_SHIFT
├─ UI: Botón "Abrir Turno" prominente
├─ Indicadores: Ocultos
├─ Actions: Solo "Abrir Turno"
└─ Transition: click "Abrir Turno" → OPENING_MODAL

Estado: OPENING_MODAL
├─ UI: Modal de apertura
├─ Inputs: Tipo de shift, fondo caja, etc.
├─ Validaciones: [...]
└─ Transitions:
    ├─ Cancelar → NO_SHIFT
    └─ Confirmar → SHIFT_ACTIVE

Estado: SHIFT_ACTIVE
├─ UI: [Diseñar layout completo]
├─ Indicadores: Visibles y actualizados
├─ Actions: Quick actions disponibles
├─ Close button: Enabled/Disabled por blockers
└─ Transitions:
    ├─ Click "Cerrar Turno" → VALIDATE_CLOSE
    └─ Click "Cambiar Turno" → SWITCH_MODAL

Estado: VALIDATE_CLOSE
├─ UI: Loading indicator
├─ Process: Query close blockers
└─ Transitions:
    ├─ Hay blockers → CLOSE_BLOCKED
    └─ No blockers → CLOSING_MODAL

Estado: CLOSE_BLOCKED
├─ UI: Modal con lista de blockers
├─ Actions: "Aceptar" (volver a resolver)
└─ Transition: Click "Aceptar" → SHIFT_ACTIVE

Estado: CLOSING_MODAL
├─ UI: Modal de confirmación con resumen
├─ Summary: Ventas, labor cost, etc.
└─ Transitions:
    ├─ Cancelar → SHIFT_ACTIVE
    └─ Confirmar → CLOSING (loading)

Estado: CLOSING
├─ UI: Loading "Cerrando turno..."
├─ Process: Call closeShift() API
└─ Transitions:
    ├─ Success → SHIFT_CLOSED
    └─ Error → CLOSE_ERROR

Estado: SHIFT_CLOSED
├─ UI: Success message + resumen
├─ Opciones: Ver historial, abrir nuevo turno
└─ Transitions:
    ├─ Auto después 3s → NO_SHIFT
    └─ Click "Abrir Nuevo Turno" → OPENING_MODAL

// Agregar estados para múltiples shifts:
Estado: MULTIPLE_SHIFTS_ACTIVE
├─ UI: Dropdown mostrando shifts
├─ Indicadores: Del shift activo seleccionado
└─ [...]
```

#### 2.4 Component Specifications

**Para CADA componente del tree, definir**:

```typescript
// Ejemplo template:
interface ComponentNameProps {
  // Todas las props con tipos
  shift: OperationalShift;
  onAction: () => void;
  // ...
}

// Behavior
- ¿Qué renderiza en cada estado?
- ¿Cómo reacciona a capabilities?
- ¿Qué eventos emite?
- ¿Necesita memoization?

// Rendering logic
- Condicionales por capability
- Condicionales por estado
- Condicionales por props

// Example code (opcional)
function ComponentName({ shift, onAction }: ComponentNameProps) {
  // [...]
}
```

**Componentes a especificar**:
- ShiftControlWidget (root)
- ShiftHeader
- ShiftSelector (si múltiples)
- IndicatorsSection
- QuickActionsBar
- AlertsPanel
- ShiftFooter
- OpenShiftModal
- CloseShiftModal
- CloseBlockersModal
- ShiftHistoryModal
- [... otros necesarios]

#### 2.5 HookPoint Strategy

**Definir inyección completa**:

```typescript
// HookPoint: shift-control.indicators
registry.addAction(
  'shift-control.indicators',
  ({ data }) => <CashSessionIndicator session={data.cashSession} />,
  'cash-management',
  90 // Priority
);

// ¿Qué otros módulos inyectan?
// ¿Qué priority tienen?
// ¿Qué props reciben?
```

**Para cada HookPoint**:
- Nombre del hook
- Data que recibe
- Módulos que inyectan (listado completo)
- Orden de priority
- Cuándo se renderiza cada inyección

#### 2.6 Data Flow & Performance

**Diagramar**:
- Props flow: Store → Widget → Children
- Event flow: User action → Handler → Store → UI update
- Memoization strategy
- Re-render prevention

---

### FASE 3: Limpieza de Documentación (20 min)

**Tarea**: Consolidar/eliminar documentos redundantes

#### 3.1 Clasificar documentos

Basado en la tabla de FASE 1, decidir para cada documento:

**ACCIÓN A: Consolidar en SHIFT_CONTROL_UI_ARCHITECTURE.md**
- Copiar secciones relevantes
- Actualizar referencias
- Marcar original como DEPRECATED

**ACCIÓN B: Mantener (pero agregar nota)**
- Agregar al inicio: "⚠️ Este documento está siendo consolidado en SHIFT_CONTROL_UI_ARCHITECTURE.md"
- Agregar: "⚠️ Para la última versión, consultar documento maestro"

**ACCIÓN C: Eliminar**
- Crear archivo `docs/shift-control/ARCHIVED/`
- Mover documentos obsoletos
- Crear README.md en ARCHIVED explicando qué se archivó y por qué

#### 3.2 Estructura final deseada

```
docs/shift-control/
├── SHIFT_CONTROL_UI_ARCHITECTURE.md  ← DOCUMENTO MAESTRO
├── CONTINUATION_PROMPT.md            ← Para próxima sesión
├── SESSION_SUMMARY_2025-12-04.md     ← Historia de la sesión
└── ARCHIVED/                         ← Docs obsoletos
    ├── README.md
    ├── RESEARCH_*.md (si ya consolidado)
    ├── IMPLEMENTATION_*.md (si ya consolidado)
    └── [... otros obsoletos]
```

**Objetivo**: Reducir de 17+ docs a ~3-5 docs activos

---

## 🎯 OUTPUT ESPERADO

Al finalizar esta sesión, debes entregar:

### 1. `SHIFT_CONTROL_UI_ARCHITECTURE.md` COMPLETO

Todas las secciones "[TO BE DEFINED]" reemplazadas con:
- ✅ Component tree completo con responsabilidades
- ✅ State machine detallado con transiciones
- ✅ Capability-driven rendering logic completo
- ✅ Component specifications para TODOS los componentes
- ✅ HookPoint strategy detallada
- ✅ Data flow & performance considerations
- ✅ Responsive design strategy

### 2. Tabla de Documentos

```markdown
| Documento Original | Clasificación | Acción Tomada | Razón |
|-------------------|---------------|---------------|-------|
| RESEARCH_OPERATIONAL_VS_EMPLOYEE_SHIFTS.md | Core | Consolidado | Info clave movida a maestro |
| SHIFT_LIFECYCLE_BY_CAPABILITY.md | Core | Consolidado | Capability matrix integrada |
| STAFF_MODULE_UPDATE_SUMMARY.md | Redundante | Archivado | Info ya no relevante |
| ... | ... | ... | ... |
```

### 3. Plan de Limpieza Ejecutado

- [ ] Documentos consolidados marcados con deprecation notice
- [ ] Carpeta ARCHIVED/ creada
- [ ] Documentos obsoletos movidos
- [ ] README.md en ARCHIVED/ explicando qué se archivó

---

## 💡 ESTRATEGIA RECOMENDADA

### Orden de trabajo:

1. **Empezar con State Machine** (más claro)
   - Define estados y transiciones
   - Esto guía el resto del diseño

2. **Luego Component Tree**
   - Basado en estados, diseñar componentes
   - Un componente por responsabilidad

3. **Capability Matrix**
   - Para cada capability, qué se muestra
   - Basado en SHIFT_LIFECYCLE_BY_CAPABILITY.md

4. **Component Specs**
   - Detallar cada componente del tree
   - Props, behavior, rendering

5. **HookPoints & Data Flow**
   - Cómo se integran otros módulos
   - Basado en RESEARCH_OPERATIONAL_VS_EMPLOYEE_SHIFTS.md

6. **Performance & Responsive**
   - Optimizaciones necesarias
   - Basado en docs/optimization/

7. **Consolidación**
   - Marcar docs procesados
   - Archivar redundantes

---

## ✅ CHECKLIST DE INICIO

Antes de empezar, verificar:

- [ ] Tengo acceso a `docs/shift-control/`
- [ ] Puedo leer todos los 17+ documentos
- [ ] Entiendo el objetivo: 1 doc maestro completo
- [ ] Entiendo que debo archivar docs redundantes
- [ ] Tengo claro el output esperado

---

## 🚀 PROMPT DE INICIO

Usa este prompt para empezar:

```
Hola! Voy a diseñar la arquitectura UI completa de ShiftControl.

OBJETIVO:
Completar docs/shift-control/SHIFT_CONTROL_UI_ARCHITECTURE.md usando
TODA la documentación existente en docs/shift-control/

TAREAS:
1. Leer los 17+ documentos existentes
2. Consolidar info en el documento maestro
3. Limpiar documentación redundante

Lee el archivo: docs/shift-control/DESIGN_SESSION_PROMPT.md
Sigue las instrucciones de las 3 fases.

EMPECEMOS:
Lista todos los documentos en docs/shift-control/ y clasifícalos.
```

---

**Creado por**: Claude Code
**Fecha**: 2025-12-04
**Estado**: ✅ READY TO USE
