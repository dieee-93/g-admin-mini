# Corrección: Roles de Trabajo vs Empleados

**Fecha**: 2026-01-14
**Estado**: ✅ Corregido

---

## 🔴 Error Identificado

Durante la implementación inicial, se confundieron dos conceptos distintos:

1. **Staff Role** (Rol de trabajo): Plantilla/categoría como "Cocinero", "Mesero"
2. **Employee** (Empleado): Persona específica que tiene un rol asignado

### Campos Incorrectos Iniciales

Se agregaron campos que corresponden al **empleado individual**, NO al **rol**:
- ❌ `employment_type` (monotributista vs empleado) → Va en Employee
- ❌ `experience_level` (trainee, junior, senior) → Va en Employee

---

## ✅ Corrección Aplicada

### Campos que SÍ pertenecen a Staff Role:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `labor_category` | Categoría laboral según CCT | "Cocinero 3ra categoría" |
| `applicable_convention` | Convenio colectivo aplicable | "CCT 389/04 - Gastronómicos" |
| `default_hourly_rate` | Tarifa base por defecto | $1,500/hora |
| `loaded_factor` | Factor de carga por defecto | 1.40 (40% adicional) |

### Campos que NO pertenecen a Staff Role:

Estos irán en el formulario de **Empleados**:
- `employment_type`: Tipo de contratación del empleado
- `experience_level`: Nivel de experiencia del empleado
- Cargas sociales específicas del empleado
- Factor de productividad individual

---

## 📋 Ejemplo Práctico

### ✅ Correcto - Staff Role (Plantilla)

```typescript
// Rol: "Cocinero"
{
  name: "Cocinero",
  labor_category: "Cocinero 3ra categoría",
  applicable_convention: "CCT 389/04 - Gastronómicos",
  default_hourly_rate: 1500,  // Valor base de referencia
  loaded_factor: 1.40,         // Factor base de referencia
}
```

### ✅ Correcto - Employees (Personas específicas)

```typescript
// Empleado 1: Juan (monotributista, junior)
{
  name: "Juan Pérez",
  role_id: "cocinero-id",           // Asignado al rol "Cocinero"
  employment_type: "monotributista",
  experience_level: "junior",
  hourly_rate: 1200,                // Puede variar del default
  loaded_factor: 1.10,              // Monotributo: sin cargas patronales
}

// Empleado 2: María (empleada en blanco, senior)
{
  name: "María González",
  role_id: "cocinero-id",           // Asignado al mismo rol "Cocinero"
  employment_type: "full_time_employee",
  experience_level: "senior",
  hourly_rate: 2000,                // Tarifa más alta por experiencia
  loaded_factor: 1.50,              // Empleado completo: con cargas
}
```

---

## 🔧 Cambios Implementados

### 1. Tipos (`src/modules/staff/types/staffRole.ts`)

✅ **Removido**:
```typescript
// ❌ Ya no existe
export type EmploymentType = ...
export type ExperienceLevel = ...
export const LOADED_FACTOR_SUGGESTIONS = ...
```

✅ **Agregado**:
```typescript
// ✅ Solo campos relevantes al rol
export interface StaffRole {
  // ...
  labor_category?: string | null;
  applicable_convention?: string | null;
  // ...
}

export const COMMON_ARGENTINE_CONVENTIONS = [
  'CCT 130/75 - Comercio',
  'CCT 389/04 - Gastronómicos',
  // ...
];
```

### 2. Formulario (`StaffRoleFormModal.tsx`)

✅ **Removido**:
- Select de "Tipo de Contratación"
- Select de "Nivel de Experiencia"
- Auto-sugerencia de factor por tipo de empleo

✅ **Mantenido**:
- Input de "Categoría Laboral"
- Input de "Convenio Colectivo" (con autocomplete de CCT comunes)
- Alert explicativo: "Este formulario define un rol (plantilla)"

### 3. Migration SQL

✅ **Simplificada**:
```sql
-- Solo 2 campos nuevos
ALTER TABLE staff_roles
  ADD COLUMN labor_category TEXT,
  ADD COLUMN applicable_convention TEXT;
```

---

## 📚 Documentación Actualizada

### Archivos Corregidos:
1. ✅ `src/modules/staff/types/staffRole.ts` - Tipos actualizados
2. ✅ `src/pages/admin/resources/staff/tabs/roles/components/StaffRoleFormModal.tsx` - Formulario corregido
3. ✅ `migrations/004_add_labor_category_to_staff_roles.sql` - Migration simplificada
4. ✅ Este documento (`ROLES_DE_TRABAJO_CORRECCION.md`)

### Documento Original:
- `docs/staff/ROLES_DE_TRABAJO_ANALISIS.md` - Contiene análisis inicial (para referencia histórica, pero con campos incorrectos)

---

## 🎯 Próximos Pasos

### Para implementar campos de Employee:

Cuando se trabaje en el formulario de **Empleados** (diferente al de Roles), ahí SÍ se agregarán:

1. **Tipo de Contratación**:
   - Relación de dependencia (jornada completa/parcial)
   - Monotributista
   - Contratado/Responsable inscripto
   - Pasante

2. **Nivel de Experiencia**:
   - Trainee, Junior, Semi-Senior, Senior, Expert

3. **Cargas Sociales Específicas**:
   - Factor de carga personalizado según tipo de contratación
   - Contribuciones patronales específicas
   - ART según actividad

4. **Productividad**:
   - Factor de productividad individual
   - Métricas de desempeño

---

## ✅ Validación

### Conceptos Correctos Ahora:

| Entidad | Propósito | Ejemplos |
|---------|-----------|----------|
| **Staff Role** | Plantilla/categoría de trabajo | "Cocinero", "Mesero", "Barbero" |
| **Employee** | Persona específica | "Juan Pérez (Cocinero, monotributo, junior)" |

### Flujo Correcto:
1. Crear **Staff Roles** (plantillas): "Cocinero", "Mesero", etc.
2. Crear **Employees** y asignarles un rol
3. Cada empleado hereda los defaults del rol pero puede tener sus propios valores

---

**Lección aprendida**: Separar claramente las características del ROL (plantilla compartida) vs características del EMPLEADO (persona individual).
