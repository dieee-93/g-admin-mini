# Análisis y Mejoras del Formulario de Roles de Trabajo

**Fecha**: 2026-01-14
**Versión**: 1.0
**Estado**: 🔄 En Desarrollo

---

## 📋 Resumen Ejecutivo

Este documento analiza el formulario actual de creación de roles de trabajo en G-Admin Mini y propone mejoras para asegurar que los roles creados aporten funcionalidad completa al sistema, especialmente para el contexto argentino.

**Ubicación actual**: Gestión > Roles de Trabajo > "Crear Manualmente"
**Archivo**: `src/pages/admin/resources/staff/tabs/roles/components/StaffRoleFormModal.tsx`

---

## 🎯 Objetivos del Análisis

1. ✅ Revisar campos actuales del formulario
2. ✅ Identificar campos faltantes según teoría administrativa
3. ✅ Considerar particularidades del mercado argentino
4. ✅ Proponer mejoras para maximizar utilidad en el sistema
5. 🔄 Implementar cambios propuestos

---

## 📊 Análisis del Formulario Actual

### Campos Existentes ✅

| Campo | Tipo | Propósito | Estado |
|-------|------|-----------|--------|
| **Nombre** | string (requerido) | Identificación del rol | ✅ Correcto |
| **Departamento** | string (opcional) | Agrupación organizacional | ✅ Correcto |
| **Descripción** | textarea (opcional) | Responsabilidades del rol | ✅ Correcto |
| **Tarifa por Hora Base** | number (opcional) | Costo bruto por hora | ✅ Correcto |
| **Factor de Carga** | number (default 1.0) | Multiplicador para cargas sociales | ✅ Correcto |
| **Estado Activo** | boolean | Disponibilidad en selectores | ✅ Correcto |
| **Orden** | number | Ordenamiento en listados | ✅ Correcto |

### Cálculo Automático ✅

El formulario calcula y muestra:
```typescript
Costo Cargado por Hora = Tarifa Base × Factor de Carga
```

**Ejemplo**: $1,000/hora × 1.35 = $1,350/hora (incluye 35% de cargas)

---

## 🔴 Campos Faltantes Identificados

### 1. Información Laboral Argentina 🇦🇷

#### 1.1 Tipo de Contratación
**Prioridad**: 🔴 Alta

Argentina tiene diferentes regímenes laborales con diferentes cargas sociales:

| Tipo | Cargas Patronales | Factor de Carga Sugerido | Notas |
|------|-------------------|--------------------------|-------|
| **Relación de dependencia** | 18-20.4% + ART (2-4%) | 1.40-1.50 | Empleado en blanco completo |
| **Jornada completa** | 20.4% (grandes empresas) | 1.50 | >límite MiPyME |
| **Jornada parcial** | 18% (MiPyMEs) | 1.35 | Con certificado MiPyME |
| **Monotributista** | 0% patronal | 1.10 | Solo honorarios + IVA |
| **Contratado** | Variable según contrato | 1.20-1.30 | Factura A/B/C |
| **Pasante** | Mínimas o sin cargas | 1.05-1.10 | Programas específicos |

**Fuente**: [ARCA - Aportes y contribuciones](https://www.afip.gob.ar/relaciones-laborales/empleadores/aportes-y-contribuciones.asp)

**Campos propuestos**:
```typescript
employment_type: 'full_time' | 'part_time' | 'contractor' | 'monotributista' | 'intern'
```

#### 1.2 Categoría Laboral
**Prioridad**: 🟡 Media

En Argentina, los convenios colectivos definen categorías que determinan salarios mínimos:

**Ejemplos**:
- **Comercio (CCT 130/75)**: Maestranza, Auxiliar, Administrativo, Cajero, Vendedor
- **Gastronómico**: Ayudante de cocina, Cocinero, Chef, Mozo, Encargado
- **Servicios profesionales**: Junior, Semi-senior, Senior, Principal

**Fuente**: [Categorías de Empleados de Comercio](https://estudiovilaplana.com.ar/empleadoscomercioyservicios/)

**Campo propuesto**:
```typescript
labor_category?: string  // "Cocinero 3ra categoría", "Vendedor especializado"
applicable_convention?: string  // "CCT 130/75", "CCT 389/04 Gastronómicos"
```

### 2. Información para Costeo Avanzado

#### 2.1 Nivel de Experiencia
**Prioridad**: 🟡 Media

Para cálculos de productividad y estimaciones de tiempos:

```typescript
experience_level: 'trainee' | 'junior' | 'semi_senior' | 'senior' | 'expert'
```

**Uso en el sistema**:
- **Estimación de tiempos**: Un junior puede tardar 2x vs un senior
- **Asignación inteligente**: Sugerir roles según complejidad de producto
- **Análisis de costos**: Comparar costo/productividad

#### 2.2 Tiempo de Capacitación
**Prioridad**: 🟢 Baja

Para calcular costos de onboarding:

```typescript
training_hours?: number  // Horas necesarias para capacitar a alguien nuevo
training_cost?: number   // Costo estimado de capacitación
```

**Uso**:
- Calcular ROI de contratación
- Planificar capacitaciones
- Estimar tiempo de ramp-up

#### 2.3 Productividad Esperada
**Prioridad**: 🟢 Baja

```typescript
productivity_factor?: number  // 0.5 = 50% productivo, 1.0 = 100%, 1.2 = 120%
```

**Ejemplo**:
- **Cocinero experto**: 1.2 (hace más en menos tiempo)
- **Cocinero junior**: 0.7 (aún aprendiendo)

### 3. Información para Scheduling

#### 3.1 Disponibilidad Típica
**Prioridad**: 🟡 Media

```typescript
typical_hours_per_week?: number  // 40, 30, 20
max_consecutive_hours?: number   // 8, 6, 4 (límites legales)
requires_breaks?: boolean
```

**Uso en el sistema**:
- Módulo de Scheduling
- Cálculo de capacidad disponible
- Respeto de límites legales (Ley de Contrato de Trabajo)

#### 3.2 Turnos Preferidos
**Prioridad**: 🟢 Baja

```typescript
preferred_shifts?: ('morning' | 'afternoon' | 'night' | 'weekend')[]
```

### 4. Capacidades y Habilidades

#### 4.1 Skills Requeridas
**Prioridad**: 🟡 Media

```typescript
required_skills?: string[]  // ["Cocina italiana", "Manejo de horno a leña"]
optional_skills?: string[]
certifications_required?: string[]  // ["Manipulación de alimentos", "RCP"]
```

**Uso**:
- **Asignación inteligente**: Matching rol-empleado
- **Detección de gaps**: Identificar necesidades de capacitación
- **Compliance**: Asegurar certificaciones obligatorias

#### 4.2 Responsabilidades Clave
**Prioridad**: 🟢 Baja

Expandir el campo `description` actual con estructura:

```typescript
responsibilities?: {
  primary: string[]    // Responsabilidades principales
  secondary: string[]  // Responsabilidades secundarias
  decision_authority: string  // Nivel de autonomía
}
```

### 5. Información Financiera Adicional

#### 5.1 Componentes del Salario
**Prioridad**: 🟡 Media

En Argentina, el salario puede incluir varios componentes:

```typescript
salary_components?: {
  base_salary: number           // Sueldo básico
  overtime_multiplier?: number  // 1.5x, 2x para horas extras
  night_shift_bonus?: number    // Plus nocturno
  weekend_bonus?: number        // Plus fin de semana
  productivity_bonus?: number   // Bono por productividad
}
```

**Fuentes**:
- [Convenios Colectivos de Trabajo](https://www.capacitarte.org/blog/nota/que-son-convenios-colectivos-trabajo)
- [Cargas sociales 2025](https://navenegocios.ar/blog/cargas-sociales)

#### 5.2 Costos Indirectos
**Prioridad**: 🟢 Baja

```typescript
indirect_costs?: {
  uniforms?: number          // Uniformes anuales
  tools_equipment?: number   // Herramientas/equipamiento
  training_budget?: number   // Presupuesto capacitación anual
}
```

---

## 💡 Propuestas de Implementación

### Fase 1: Campos Críticos (Corto Plazo) 🔴

**Prioridad Alta - Implementar primero**

1. **Tipo de Contratación** (employment_type)
   - Enum con opciones predefinidas
   - Factor de carga automático según tipo
   - Tooltip explicativo para cada tipo

2. **Categoría Laboral** (labor_category)
   - Campo de texto libre con autocomplete
   - Opcional pero recomendado
   - Ejemplos según industria

3. **Nivel de Experiencia** (experience_level)
   - Enum: trainee | junior | semi_senior | senior | expert
   - Afecta estimaciones de tiempo
   - Color coding en UI

### Fase 2: Mejoras de Costeo (Mediano Plazo) 🟡

**Prioridad Media - Próxima iteración**

4. **Componentes Salariales**
   - Campos opcionales para bonificaciones
   - Cálculo de horas extras
   - Plus nocturnos y fin de semana

5. **Disponibilidad y Scheduling**
   - Horas típicas por semana
   - Límites de horas consecutivas
   - Preferencias de turno

### Fase 3: Features Avanzadas (Largo Plazo) 🟢

**Prioridad Baja - Futuras mejoras**

6. **Skills y Capacidades**
   - Lista de skills requeridas
   - Certificaciones necesarias
   - Matching automático

7. **Costos de Capacitación**
   - Tiempo de onboarding
   - Costo de formación
   - ROI tracking

---

## 🎨 Propuesta de UI Mejorada

### Estructura de Formulario Propuesta

```
┌─────────────────────────────────────────────┐
│ NUEVO ROL DE TRABAJO                        │
├─────────────────────────────────────────────┤
│                                             │
│ ▼ INFORMACIÓN BÁSICA                        │
│   • Nombre *                                │
│   • Departamento                            │
│   • Descripción                             │
│   • Orden                                   │
│                                             │
│ ▼ INFORMACIÓN LABORAL 🇦🇷                   │
│   • Tipo de Contratación *                  │
│     [●] Relación de dependencia             │
│     [ ] Monotributista                      │
│     [ ] Contratado                          │
│   • Categoría Laboral                       │
│     [  Cocinero 3ra categoría    ] 🔍       │
│   • Convenio Colectivo Aplicable            │
│     [  CCT 389/04 Gastronómicos  ] 🔍       │
│                                             │
│ ▼ COSTEO DE MANO DE OBRA                    │
│   • Tarifa por Hora Base          $1,000   │
│   • Factor de Carga (sugerido)    1.40 ℹ️   │
│                                             │
│   ┌───────────────────────────────────────┐ │
│   │ 💡 Costo Cargado: $1,400/hora        │ │
│   │ = $1,000 × 1.40                      │ │
│   │                                      │ │
│   │ Incluye:                             │ │
│   │ • Contribuciones patronales: 20.4%  │ │
│   │ • ART: ~3%                           │ │
│   │ • Otros: ~16.6%                      │ │
│   └───────────────────────────────────────┘ │
│                                             │
│ ▼ EXPERIENCIA Y PRODUCTIVIDAD              │
│   • Nivel de Experiencia                    │
│     [ Seleccionar... ▼]                     │
│   • Factor de Productividad     1.0         │
│                                             │
│ ▼ ESTADO                                    │
│   [✓] Rol Activo                            │
│                                             │
├─────────────────────────────────────────────┤
│              [Cancelar]  [Crear Rol]        │
└─────────────────────────────────────────────┘
```

### Explicaciones Contextuales (Tooltips)

**Factor de Carga - Tooltip**:
```
Factor de Carga (Loaded Factor)
───────────────────────────────
Multiplicador que incluye:

• Contribuciones patronales (18-20.4%)
• ART (2-4%)
• Seguro de vida (~0.5%)
• Otros costos laborales

Sugerencias por tipo:
• Dependencia: 1.40-1.50
• Monotributista: 1.10
• Contratado: 1.20-1.30

El factor puede variar según:
- Tamaño empresa (MiPyME vs grande)
- Convenio colectivo
- Ubicación geográfica
```

**Tipo de Contratación - Tooltip**:
```
Tipos de Contratación en Argentina
──────────────────────────────────
Relación de dependencia:
Empleado "en blanco" con todos los beneficios
Cargas sociales: ~23-26% adicional

Monotributista:
Trabajador independiente que factura
Sin cargas patronales, solo honorarios + IVA

Contratado:
Locación de servicios por tiempo/proyecto
Cargas variables según contrato

Pasante:
Estudiante con convenio educativo
Cargas mínimas o inexistentes
```

---

## 🔧 Cambios Técnicos Necesarios

### 1. Actualizar Tipos (staffRole.ts)

```typescript
// Agregar nuevos enums
export type EmploymentType =
  | 'full_time_employee'      // Relación dependencia - jornada completa
  | 'part_time_employee'      // Relación dependencia - jornada parcial
  | 'contractor_monotributo'  // Monotributista
  | 'contractor_responsable'  // Contratado - Responsable inscripto
  | 'intern'                  // Pasante
  | 'temporary';              // Temporario/eventual

export type ExperienceLevel =
  | 'trainee'      // 0-6 meses
  | 'junior'       // 6-24 meses
  | 'semi_senior'  // 2-5 años
  | 'senior'       // 5-10 años
  | 'expert';      // 10+ años

// Actualizar interfaz StaffRole
export interface StaffRole {
  // ... campos existentes ...

  // NUEVOS CAMPOS - Fase 1
  employment_type: EmploymentType;
  labor_category?: string | null;
  applicable_convention?: string | null;
  experience_level?: ExperienceLevel | null;

  // NUEVOS CAMPOS - Fase 2
  salary_components?: {
    overtime_multiplier?: number;    // 1.5, 2.0
    night_shift_bonus?: number;      // Adicional nocturno
    weekend_bonus?: number;          // Adicional fin de semana
  } | null;

  typical_hours_per_week?: number | null;
  max_consecutive_hours?: number | null;

  // NUEVOS CAMPOS - Fase 3
  required_skills?: string[] | null;
  certifications_required?: string[] | null;
  productivity_factor?: number | null;  // 0.5-2.0, default 1.0
  training_hours?: number | null;
}

// Agregar constantes
export const LOADED_FACTOR_SUGGESTIONS: Record<EmploymentType, number> = {
  full_time_employee: 1.50,      // 50% adicional
  part_time_employee: 1.40,      // 40% adicional
  contractor_monotributo: 1.10,  // 10% adicional
  contractor_responsable: 1.20,  // 20% adicional
  intern: 1.05,                  // 5% adicional
  temporary: 1.35,               // 35% adicional
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time_employee: 'Relación de Dependencia - Jornada Completa',
  part_time_employee: 'Relación de Dependencia - Jornada Parcial',
  contractor_monotributo: 'Monotributista',
  contractor_responsable: 'Contratado - Responsable Inscripto',
  intern: 'Pasante',
  temporary: 'Temporario/Eventual',
};
```

### 2. Actualizar Formulario (StaffRoleFormModal.tsx)

**Cambios principales**:

1. Agregar campos de Fase 1:
   - Select de employment_type (requerido)
   - Input de labor_category (opcional)
   - Input de applicable_convention (opcional)
   - Select de experience_level (opcional)

2. Lógica de factor de carga inteligente:
   ```typescript
   // Auto-sugerir factor de carga según tipo de empleo
   const handleEmploymentTypeChange = (type: EmploymentType) => {
     setFormData(prev => ({
       ...prev,
       employment_type: type,
       // Auto-sugerir factor si no fue editado manualmente
       loaded_factor: prev.loaded_factor === 1.0
         ? LOADED_FACTOR_SUGGESTIONS[type]
         : prev.loaded_factor
     }));
   };
   ```

3. Tooltips informativos con información de Argentina

4. Validaciones actualizadas:
   ```typescript
   if (!formData.employment_type) {
     newErrors.employment_type = 'El tipo de contratación es requerido';
   }
   ```

### 3. Actualizar Base de Datos

**Migration SQL**:

```sql
-- Migration: add_employment_info_to_staff_roles
-- Fecha: 2026-01-14

ALTER TABLE staff_roles
  -- Fase 1: Información laboral
  ADD COLUMN employment_type TEXT NOT NULL DEFAULT 'full_time_employee',
  ADD COLUMN labor_category TEXT,
  ADD COLUMN applicable_convention TEXT,
  ADD COLUMN experience_level TEXT,

  -- Fase 2: Componentes salariales
  ADD COLUMN salary_components JSONB,
  ADD COLUMN typical_hours_per_week INTEGER,
  ADD COLUMN max_consecutive_hours INTEGER,

  -- Fase 3: Skills y productividad
  ADD COLUMN required_skills TEXT[],
  ADD COLUMN certifications_required TEXT[],
  ADD COLUMN productivity_factor DECIMAL(5,2) DEFAULT 1.00,
  ADD COLUMN training_hours INTEGER;

-- Constraints
ALTER TABLE staff_roles
  ADD CONSTRAINT chk_employment_type
    CHECK (employment_type IN (
      'full_time_employee',
      'part_time_employee',
      'contractor_monotributo',
      'contractor_responsable',
      'intern',
      'temporary'
    )),
  ADD CONSTRAINT chk_experience_level
    CHECK (experience_level IS NULL OR experience_level IN (
      'trainee', 'junior', 'semi_senior', 'senior', 'expert'
    )),
  ADD CONSTRAINT chk_productivity_factor
    CHECK (productivity_factor IS NULL OR
           (productivity_factor >= 0.1 AND productivity_factor <= 3.0)),
  ADD CONSTRAINT chk_typical_hours
    CHECK (typical_hours_per_week IS NULL OR
           (typical_hours_per_week > 0 AND typical_hours_per_week <= 84)),
  ADD CONSTRAINT chk_max_consecutive_hours
    CHECK (max_consecutive_hours IS NULL OR
           (max_consecutive_hours > 0 AND max_consecutive_hours <= 12));

-- Índices para búsquedas
CREATE INDEX idx_staff_roles_employment_type ON staff_roles(employment_type);
CREATE INDEX idx_staff_roles_experience_level ON staff_roles(experience_level);
CREATE INDEX idx_staff_roles_labor_category ON staff_roles(labor_category);

-- Comentarios
COMMENT ON COLUMN staff_roles.employment_type IS 'Tipo de contratación según legislación argentina';
COMMENT ON COLUMN staff_roles.labor_category IS 'Categoría laboral según convenio colectivo';
COMMENT ON COLUMN staff_roles.applicable_convention IS 'CCT aplicable (ej: CCT 130/75)';
COMMENT ON COLUMN staff_roles.productivity_factor IS 'Factor de productividad (1.0 = 100%)';
```

---

## 📈 Impacto Esperado

### Beneficios por Stakeholder

#### 1. Para Administradores
- ✅ **Costeo más preciso**: Factores de carga realistas para Argentina
- ✅ **Cumplimiento legal**: Consideración de convenios colectivos
- ✅ **Mejor planificación**: Información de disponibilidad y capacidad

#### 2. Para el Sistema
- ✅ **Asignación inteligente**: Matching rol-empleado por skills
- ✅ **Estimaciones precisas**: Considerar nivel de experiencia
- ✅ **Scheduling mejorado**: Respeto de límites legales

#### 3. Para Reportes
- ✅ **Análisis de costos**: Desglose por tipo de contratación
- ✅ **Productividad**: Comparación cost/output
- ✅ **Compliance**: Auditoría de categorías y convenios

---

## 🚀 Plan de Implementación

### Sprint 1: Fundamentos (Fase 1)
**Estimación**: 2-3 días

- [ ] Actualizar tipos en `staffRole.ts`
- [ ] Crear migration de base de datos
- [ ] Actualizar formulario con campos básicos
- [ ] Agregar validaciones
- [ ] Testing unitario

### Sprint 2: Mejoras de Costeo (Fase 2)
**Estimación**: 2-3 días

- [ ] Implementar componentes salariales
- [ ] Agregar campos de disponibilidad
- [ ] Actualizar cálculos de costo
- [ ] Integrar con módulo de Scheduling
- [ ] Testing de integración

### Sprint 3: Features Avanzadas (Fase 3)
**Estimación**: 3-4 días

- [ ] Sistema de skills y matching
- [ ] Costos de capacitación
- [ ] Dashboard de productividad
- [ ] Reportes avanzados
- [ ] Testing E2E completo

---

## 📚 Referencias

### Documentación Consultada

1. **Teoría Administrativa**
   - `docs/teoria-administrativa/01-FUNDAMENTOS-COSTEO.md`
   - `docs/teoria-administrativa/02-COSTEO-GASTRONOMIA.md`
   - `docs/teoria-administrativa/03-COSTEO-SERVICIOS.md`

2. **Legislación Argentina**
   - [ARCA - Aportes y contribuciones](https://www.afip.gob.ar/relaciones-laborales/empleadores/aportes-y-contribuciones.asp)
   - [Cargas sociales 2025](https://navenegocios.ar/blog/cargas-sociales)
   - [Categorías laborales Argentina](https://estudiovilaplana.com.ar/empleadoscomercioyservicios/)
   - [Convenios Colectivos](https://www.capacitarte.org/blog/nota/que-son-convenios-colectivos-trabajo)

3. **Benchmarks Internacionales**
   - Labor cost components: salarios + payroll taxes (10-12%) + benefits (5-10%)
   - Loaded factors típicos: 1.25-1.50 para empleados full-time
   - Argentina: 23-26% contribuciones patronales + 17-21% aportes empleado

---

## 🤝 Próximos Pasos

1. **Revisión del documento** con el equipo
2. **Priorización** de fases según necesidades del negocio
3. **Validación con usuarios** (especialmente campos de Argentina)
4. **Implementación incremental** comenzando por Fase 1
5. **Testing exhaustivo** con datos reales argentinos

---

**Autor**: Claude (Sonnet 4.5)
**Revisores**: Pendiente
**Última actualización**: 2026-01-14
