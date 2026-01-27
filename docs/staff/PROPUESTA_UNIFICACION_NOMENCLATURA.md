# Propuesta: Unificación de Nomenclatura - Staff vs Employee

**Fecha**: 2026-01-14
**Estado**: 🔄 Propuesta para revisión

---

## 🔴 Problema Actual

Tenemos dos conceptos que causan confusión:

| Concepto Actual | ¿Qué representa? | Confusión |
|----------------|------------------|-----------|
| **Staff Role** | Plantilla/categoría de trabajo (ej: "Cocinero") | ❌ "Staff" suena como "personal/empleados" |
| **Employee** | Persona específica (ej: "Juan Pérez") | ✅ Claro |

**Problema**: "Staff Role" suena como "Rol del Personal", cuando en realidad es una **plantilla de puesto de trabajo**.

---

## ✅ Propuesta de Unificación

### Opción 1: Job Role + Employee (RECOMENDADA)

```
Job Role (Plantilla)        Employee (Persona)
├─ "Cocinero"              ├─ "Juan Pérez"
│  • Categoría laboral     │  • Asignado a: "Cocinero"
│  • CCT aplicable         │  • Tipo contratación: Monotributo
│  • Tarifa base: $1,500   │  • Experiencia: Junior
│                          │  • Tarifa: $1,200
├─ "Mesero"                ├─ "María González"
│  • Categoría laboral     │  • Asignada a: "Mesero"
│  • CCT aplicable         │  • Tipo contratación: Dependencia
│  • Tarifa base: $1,200   │  • Experiencia: Senior
                           │  • Tarifa: $1,800
```

**Ventajas**:
- ✅ Nomenclatura clara y estándar en RRHH
- ✅ "Job Role" es universalmente entendido
- ✅ No confunde con "Staff" (personal)

**Cambios necesarios**:
- Renombrar `staff_roles` → `job_roles` (tabla DB)
- Renombrar tipos: `StaffRole` → `JobRole`
- Mantener: `Employee` (ya es claro)

### Opción 2: Position Template + Staff Member

```
Position Template           Staff Member
├─ "Cocinero"              ├─ "Juan Pérez"
├─ "Mesero"                ├─ "María González"
```

**Ventajas**:
- ✅ "Position Template" es muy explícito
- ✅ "Staff Member" unifica el concepto de "personal"

**Desventajas**:
- ❌ Más verboso
- ❌ "Template" puede confundirse con plantillas de documentos

### Opción 3: Work Role + Team Member

```
Work Role                   Team Member
├─ "Cocinero"              ├─ "Juan Pérez"
├─ "Mesero"                ├─ "María González"
```

**Ventajas**:
- ✅ "Work Role" es claro
- ✅ "Team Member" suena más inclusivo

**Desventajas**:
- ❌ "Team Member" puede perder formalidad legal/fiscal

---

## 🎯 Recomendación Final

### **Opción 1: Job Role + Employee**

**Razones**:
1. **Estándar de industria**: "Job Role" es terminología común en RRHH
2. **Claridad**: No hay ambigüedad sobre qué representa cada concepto
3. **Legal/Fiscal**: "Employee" tiene implicaciones legales claras en Argentina
4. **Internacional**: Funciona tanto en español como inglés

### Nomenclatura en Español (UI)

| Inglés (código) | Español (UI) | Dónde se usa |
|----------------|--------------|--------------|
| Job Role | **Puesto de Trabajo** | Formulario, navegación |
| Employee | **Empleado** o **Personal** | Formulario, navegación |

**Ejemplos en UI**:
- "Gestión > Puestos de Trabajo" (antes: "Roles de Trabajo")
- "Gestión > Personal" (antes: "Staff" o "Empleados")

---

## 🔧 Plan de Migración

### Fase 1: Renombrar en Código (Sin romper DB)

```typescript
// Crear aliases temporales
export type JobRole = StaffRole;
export type JobRoleFormData = StaffRoleFormData;

// Deprecar gradualmente
/** @deprecated Use JobRole instead */
export type StaffRole = ...
```

### Fase 2: Actualizar UI

- Cambiar textos en formularios
- Actualizar navegación
- Documentar cambios

### Fase 3: Migración de DB (Opcional, más adelante)

```sql
-- Si decidimos renombrar la tabla
ALTER TABLE staff_roles RENAME TO job_roles;
ALTER INDEX idx_staff_roles_* RENAME TO idx_job_roles_*;
```

---

## 📊 Impacto del Cambio

### ¿Qué se rompe?

**Si solo cambiamos tipos/nombres internos**:
- ✅ Nada, es solo refactoring
- ✅ Aliases mantienen compatibilidad

**Si renombramos tabla DB**:
- ⚠️ Todas las queries
- ⚠️ Todas las references FK
- ⚠️ Policies de Supabase

**Recomendación**: Empezar solo con cambios en código y UI, tabla DB puede esperar.

---

## 💬 Feedback Necesario

**Preguntas para decidir**:

1. ¿Te gusta "Job Role" o prefieres otro término?
   - Job Role ✅
   - Position Template
   - Work Role
   - Otro: _____________

2. ¿Mantenemos "Employee" o cambiamos a "Staff Member"?
   - Employee ✅
   - Staff Member
   - Team Member

3. ¿En español preferís?
   - "Puesto de Trabajo" ✅
   - "Rol de Trabajo"
   - "Cargo"
   - "Posición"

4. ¿Renombramos tabla DB ahora o después?
   - Después (recomendado) ✅
   - Ahora
   - Nunca

---

## ✅ Decisión

**Pendiente de tu confirmación**. Una vez confirmado, procedo con:

1. ✅ Agregar aliases en tipos
2. ✅ Actualizar UI (textos en español)
3. ✅ Documentar cambio
4. ⏸️ Migración DB (futuro)

---

**¿Procedemos con Opción 1 (Job Role + Employee)?**
