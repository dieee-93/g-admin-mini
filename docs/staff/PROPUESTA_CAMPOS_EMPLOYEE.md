# Propuesta: Campos Faltantes en Formulario de Employee

**Fecha**: 2026-01-14
**Estado**: 🔄 Propuesta para implementación

---

## 📋 Resumen Ejecutivo

Aprovechar el contexto de la investigación sobre roles de trabajo para agregar campos críticos faltantes en el formulario de **Employee** (persona individual).

---

## 🎯 Campos a Agregar

### 1. Asignación de Rol de Trabajo ⭐ CRÍTICO

**Campo**: `job_role_id` (o `role_id`)

```typescript
interface Employee {
  // ... campos existentes ...

  // NUEVO - Asignación a rol de trabajo
  job_role_id?: string;          // FK a staff_roles/job_roles
  job_role_name?: string;        // Denormalizado para display
}
```

**UI en formulario**:
```
┌─────────────────────────────────────────┐
│ Puesto de Trabajo *                     │
│ [Seleccionar puesto...        ▼]        │
│ • Cocinero (Cocina)                     │
│ • Mesero (Servicio)                     │
│ • Cajero (Administración)               │
│                                         │
│ ℹ️ Tarifa base del puesto: $1,500/hora │
│    Factor de carga: 1.40                │
└─────────────────────────────────────────┘
```

**Por qué es crítico**:
- ✅ Vincula empleado con plantilla de puesto
- ✅ Hereda defaults de tarifa y factor de carga
- ✅ Permite análisis por rol
- ✅ Facilita reporting (ej: "costos por puesto")

---

### 2. Tipo de Contratación (Argentina) ⭐ CRÍTICO

**Campo existente mejorado**: `employment_type`

**Valores actuales**:
```typescript
employment_type: 'full_time' | 'part_time' | 'contract' | 'intern'
```

**Valores propuestos para Argentina**:
```typescript
employment_type:
  | 'full_time_employee'      // Relación dependencia - jornada completa
  | 'part_time_employee'      // Relación dependencia - jornada parcial
  | 'contractor_monotributo'  // Monotributista
  | 'contractor_responsable'  // Responsable Inscripto
  | 'intern'                  // Pasante
  | 'temporary'               // Temporario/eventual
  | 'informal'                // Trabajador informal (sin registrar)
```

**Constantes para UI**:
```typescript
export const EMPLOYMENT_TYPE_LABELS_AR: Record<EmploymentType, string> = {
  full_time_employee: 'Empleado en Relación de Dependencia - Jornada Completa',
  part_time_employee: 'Empleado en Relación de Dependencia - Jornada Parcial',
  contractor_monotributo: 'Monotributista',
  contractor_responsable: 'Contratado - Responsable Inscripto',
  intern: 'Pasante / Aprendiz',
  temporary: 'Temporario / Eventual',
  informal: 'Trabajador Informal',
};

export const EMPLOYMENT_TYPE_LOADED_FACTORS: Record<EmploymentType, number> = {
  full_time_employee: 1.50,      // 50% cargas sociales
  part_time_employee: 1.40,      // 40% cargas (MiPyME)
  contractor_monotributo: 1.10,  // 10% admin
  contractor_responsable: 1.20,  // 20% admin + gestión
  intern: 1.05,                  // 5% cargas mínimas
  temporary: 1.35,               // 35% cargas estándar
  informal: 1.00,                // Sin cargas (cash)
};
```

**UI en formulario**:
```
┌───────────────────────────────────────────────────────┐
│ Tipo de Contratación * ℹ️                             │
│ [Empleado en Relación de Dependencia - Completa ▼]   │
│                                                       │
│ 💡 Factor de carga sugerido: 1.50                    │
│    Incluye: Contrib. patronales 20.4% + ART 2-4%    │
│            + Seguro vida 0.5% + Otros                │
└───────────────────────────────────────────────────────┘
```

---

### 3. Nivel de Experiencia 🟡 IMPORTANTE

**Campo nuevo**: `experience_level`

```typescript
interface Employee {
  // ... campos existentes ...

  // NUEVO - Nivel de experiencia
  experience_level?: ExperienceLevel;
}

export type ExperienceLevel =
  | 'trainee'      // 0-6 meses
  | 'junior'       // 6-24 meses
  | 'semi_senior'  // 2-5 años
  | 'senior'       // 5-10 años
  | 'expert';      // 10+ años

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  trainee: 'Trainee / En Formación (0-6 meses)',
  junior: 'Junior (6 meses - 2 años)',
  semi_senior: 'Semi-Senior (2-5 años)',
  senior: 'Senior (5-10 años)',
  expert: 'Expert / Especialista (10+ años)',
};

export const EXPERIENCE_PRODUCTIVITY_FACTORS: Record<ExperienceLevel, number> = {
  trainee: 0.5,      // 50% productividad (aprendiendo)
  junior: 0.7,       // 70% productividad
  semi_senior: 1.0,  // 100% baseline
  senior: 1.3,       // 130% productividad
  expert: 1.5,       // 150% productividad
};
```

**Uso**:
- Para estimaciones de tiempo en producción
- Ajustar precios según experiencia del staff asignado
- Métricas de seniority del equipo

**UI en formulario**:
```
┌────────────────────────────────────────┐
│ Nivel de Experiencia ℹ️                 │
│ [Semi-Senior (2-5 años)        ▼]      │
│                                        │
│ 💡 Productividad estimada: 100%       │
│    (factor: 1.0x del tiempo base)     │
└────────────────────────────────────────┘
```

---

### 4. Factor de Carga Personalizado 🟡 IMPORTANTE

**Campo nuevo**: `loaded_factor_override`

```typescript
interface Employee {
  // ... campos existentes ...

  // NUEVO - Override del factor de carga
  loaded_factor_override?: number | null;  // Si null, usa el del rol o tipo empleo
}
```

**Lógica**:
```typescript
// Orden de precedencia para loaded_factor:
function getEffectiveLoadedFactor(employee: Employee): number {
  // 1. Override específico del empleado (máxima prioridad)
  if (employee.loaded_factor_override != null) {
    return employee.loaded_factor_override;
  }

  // 2. Factor sugerido por tipo de empleo
  if (employee.employment_type) {
    return EMPLOYMENT_TYPE_LOADED_FACTORS[employee.employment_type];
  }

  // 3. Factor del rol asignado
  if (employee.job_role_id && jobRole) {
    return jobRole.loaded_factor;
  }

  // 4. Default de Argentina
  return DEFAULT_LOADED_FACTOR_ARGENTINA; // 1.40
}
```

**UI en formulario**:
```
┌────────────────────────────────────────────────────┐
│ Factor de Carga (Opcional) ℹ️                      │
│ [ ] Usar factor personalizado                      │
│     [1.45          ]                               │
│                                                    │
│ ℹ️ Si no se especifica, se usa:                   │
│    1. Factor del tipo de contratación (1.50), o   │
│    2. Factor del puesto asignado (Cocinero: 1.40) │
└────────────────────────────────────────────────────┘
```

---

### 5. Datos Argentina Específicos 🟢 NICE TO HAVE

**Campos nuevos opcionales**:

```typescript
interface Employee {
  // ... campos existentes ...

  // Datos fiscales Argentina
  cuit_cuil?: string;                    // CUIT/CUIL (validar formato)
  afip_category?: string;                // Categoría AFIP (monotributo A-K)

  // Cargas sociales detalladas
  social_security_contributions?: {
    employer_rate: number;               // % patronal (18-20.4%)
    employee_rate: number;               // % empleado (17-21%)
    art_rate: number;                    // % ART (2-4%)
    life_insurance: number;              // Seguro de vida
  };

  // Para contratistas
  invoice_required: boolean;             // Requiere factura mensual
  last_invoice_date?: string;            // Última factura recibida

  // Para informales (contexto argentino)
  daily_attendance_tracking: boolean;    // Solo trackea asistencia, no pago
}
```

---

## 📐 Estructura del Formulario Mejorado

### Sección 1: Información Personal
- ✅ Ya existe (nombre, apellido, email, teléfono)

### Sección 2: Puesto y Contratación ⭐ NUEVA/MEJORADA

```
┌─────────────────────────────────────────────┐
│ ▼ PUESTO Y CONTRATACIÓN                     │
│                                             │
│ • Puesto de Trabajo * ℹ️                    │
│   [Cocinero                       ▼]        │
│   💡 Tarifa base: $1,500/hora               │
│                                             │
│ • Tipo de Contratación * ℹ️                 │
│   [Empleado Relación Dep. Completa ▼]      │
│   💡 Factor de carga sugerido: 1.50        │
│                                             │
│ • Nivel de Experiencia ℹ️                   │
│   [Semi-Senior (2-5 años)         ▼]        │
│   💡 Productividad: 100% (1.0x)             │
│                                             │
│ • Departamento * ℹ️                         │
│   [Cocina                         ▼]        │
└─────────────────────────────────────────────┘
```

### Sección 3: Compensación ⭐ MEJORADA

```
┌─────────────────────────────────────────────┐
│ ▼ COMPENSACIÓN                              │
│                                             │
│ • Tarifa por Hora * ℹ️                      │
│   [$1,500          ]                        │
│   💡 Heredado del puesto "Cocinero"         │
│                                             │
│ • Factor de Carga ℹ️                        │
│   [ ] Usar factor personalizado             │
│       [1.50        ]                        │
│   💡 Factor por tipo: 1.50 (Dependencia)   │
│                                             │
│ 💰 COSTO TOTAL POR HORA: $2,250            │
│    = $1,500 × 1.50                          │
│    (incluye cargas sociales)                │
└─────────────────────────────────────────────┘
```

### Sección 4: Datos Fiscales Argentina (Opcional) 🇦🇷

```
┌─────────────────────────────────────────────┐
│ ▼ DATOS FISCALES (Opcional)                │
│                                             │
│ • CUIT/CUIL                                 │
│   [20-12345678-9               ]            │
│                                             │
│ • Categoría AFIP (solo monotributo)         │
│   [Categoría B                 ▼]           │
│                                             │
│ • Requiere Factura Mensual                  │
│   [✓] Sí  [ ] No                            │
└─────────────────────────────────────────────┘
```

### Sección 5: Programación y Disponibilidad
- ✅ Ya existe

---

## 🔧 Implementación Técnica

### 1. Actualizar Tipos

**Archivo**: `src/pages/admin/resources/staff/types.ts`

```typescript
import type {
  ExperienceLevel,
  EmploymentType // Del módulo staff
} from '@/modules/staff/types';

export interface Employee {
  // ... campos existentes ...

  // NUEVOS CAMPOS
  job_role_id?: string;
  job_role_name?: string;

  employment_type: EmploymentType; // Mejorado con valores AR

  experience_level?: ExperienceLevel;

  loaded_factor_override?: number | null;

  // Argentina specific
  cuit_cuil?: string;
  afip_category?: string;
  invoice_required?: boolean;
}
```

### 2. Migration SQL

```sql
-- Migration: Add Employee Labor Fields
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS job_role_id UUID REFERENCES staff_roles(id),
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS loaded_factor_override NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS cuit_cuil TEXT,
  ADD COLUMN IF NOT EXISTS afip_category TEXT,
  ADD COLUMN IF NOT EXISTS invoice_required BOOLEAN DEFAULT false;

-- Constraints
ALTER TABLE employees
  ADD CONSTRAINT chk_employees_experience_level
    CHECK (experience_level IS NULL OR experience_level IN (
      'trainee', 'junior', 'semi_senior', 'senior', 'expert'
    )),
  ADD CONSTRAINT chk_employees_loaded_factor
    CHECK (loaded_factor_override IS NULL OR
           (loaded_factor_override >= 1.0 AND loaded_factor_override <= 3.0));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_job_role_id
  ON employees(job_role_id)
  WHERE job_role_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_employees_experience_level
  ON employees(experience_level)
  WHERE experience_level IS NOT NULL;
```

### 3. Actualizar Formulario

**Archivo**: `src/pages/admin/resources/staff/components/EmployeeForm.tsx`

Agregar secciones con los nuevos campos usando la misma estructura existente.

---

## 📊 Beneficios

### Para el Negocio

1. **Costeo Preciso**: Factor de carga correcto según tipo de empleado
2. **Compliance Argentina**: Datos fiscales necesarios (CUIT, categoría AFIP)
3. **Productividad**: Estimaciones ajustadas por experiencia
4. **Reportes**: Análisis por puesto, tipo de contratación, seniority

### Para el Sistema

1. **Trazabilidad**: Empleado → Puesto → Categoría laboral → CCT
2. **Flexibilidad**: Overrides cuando sea necesario
3. **Automatización**: Sugerencias inteligentes de factores
4. **Escalabilidad**: Base para features futuros (scheduling inteligente)

---

## ✅ Priorización

| Prioridad | Campos | Razón |
|-----------|--------|-------|
| 🔴 P0 (Crítico) | `job_role_id`, `employment_type` mejorado | Sin esto, no hay vínculo rol-empleado |
| 🟡 P1 (Alta) | `experience_level`, `loaded_factor_override` | Mejora costeo y productividad |
| 🟢 P2 (Media) | Datos fiscales Argentina | Útil pero no bloqueante |

---

## 🚀 Siguiente Paso

¿Procedemos a implementar los campos **P0** (Críticos) ahora mismo?

1. ✅ Actualizar tipos
2. ✅ Crear migration SQL
3. ✅ Actualizar formulario EmployeeForm.tsx
4. ✅ Agregar constantes y helpers

**Estimación**: ~30-40 minutos de implementación
