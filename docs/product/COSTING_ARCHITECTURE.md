# ARQUITECTURA DE COSTEO DE PRODUCTOS Y SERVICIOS

> **Version**: 1.1.0
> **Fecha**: 2026-01-06
> **Status**: EN DISEÑO - Staff/Labor diseño completado

---

## TABLA DE CONTENIDOS

1. [Vision General](#1-vision-general)
2. [Principios de Diseño](#2-principios-de-diseño)
3. [Arquitectura User vs Employee](#3-arquitectura-user-vs-employee)
4. [Componentes de Costo](#4-componentes-de-costo)
5. [Staff/Labor - Diseño Detallado](#5-stafflabor---diseño-detallado)
6. [Arquitectura por Capas](#6-arquitectura-por-capas)
7. [Integración con Módulos](#7-integración-con-módulos)
8. [Cálculo por Tipo de Producto](#8-cálculo-por-tipo-de-producto)
9. [Contextos de Servicio](#9-contextos-de-servicio)
10. [Configuración del Sistema](#10-configuración-del-sistema)
11. [Decisiones Pendientes](#11-decisiones-pendientes)
12. [Plan de Implementación](#12-plan-de-implementación)

---

## 1. VISION GENERAL

### 1.1 Objetivo

Diseñar un sistema de costeo **multi-industria** con **precisión quirúrgica** que permita calcular el costo real de cualquier producto o servicio, considerando:

- Materiales (BOM/Recipe) - Ya diseñado en RECIPE_DESIGN_DEFINITIVO.md
- Staff/Labor (tiempo de personal)
- Assets (equipos, herramientas)
- Overhead (costos indirectos)
- Contextos de servicio (salón, delivery, takeaway, etc.)

### 1.2 Alcance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TIPOS DE PRODUCTOS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  physical_product    Productos físicos elaborados (Hamburguesa, Mueble)     │
│  service             Servicios profesionales (Corte de pelo, Consultoría)   │
│  rental              Alquiler de assets (Alquiler de herramienta)           │
│  digital             Productos digitales (E-book, Curso online)             │
│  membership          Membresías/Suscripciones                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Fórmula General de Costo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  COSTO TOTAL = Materials + Labor + Assets + Overhead + Context             │
│                                                                             │
│  Donde:                                                                     │
│  ├── Materials  = Σ(ingrediente.qty × ingrediente.unit_cost)               │
│  ├── Labor      = Σ(role.time × role.loaded_hourly_cost)                   │
│  ├── Assets     = Σ(asset.usage_time × asset.hourly_cost) [si es directo]  │
│  ├── Overhead   = f(prime_cost, config) [% o fijo]                         │
│  └── Context    = Labor adicional + Costos adicionales del contexto        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. PRINCIPIOS DE DISEÑO

### 2.1 Progressive Disclosure of Complexity

El sistema debe funcionar en **niveles incrementales** de complejidad. Nada es bloqueante excepto lo absolutamente necesario.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NIVEL DE COMPLETITUD                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  NIVEL 0: Mínimo (producto vacío)                                           │
│  └── Solo precio de venta. Costo = 0 o estimado.                           │
│      ⚠️ Sistema advierte pero NO bloquea.                                  │
│                                                                             │
│  NIVEL 1: BOM básico                                                        │
│  └── Materiales asignados.                                                 │
│      Costo = Σ materiales                                                  │
│                                                                             │
│  NIVEL 2: BOM + Staff                                                       │
│  └── Staff de producción asignado.                                         │
│      Costo = Materiales + Labor                                            │
│                                                                             │
│  NIVEL 3: BOM + Staff + Assets                                              │
│  └── Equipos asignados (si aplica).                                        │
│      Costo = Materiales + Labor + Assets                                   │
│                                                                             │
│  NIVEL 4: Completo                                                          │
│  └── Overhead configurado.                                                 │
│      Costo = Materiales + Labor + Assets + Overhead                        │
│                                                                             │
│  NIVEL 5: Con Contextos                                                     │
│  └── Costos variables por contexto de servicio.                            │
│      Costo = Base + Context-specific costs                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Flexibilidad sobre Rigidez

- **Roles vs Empleados**: El usuario puede asignar roles genéricos ("Cocinero") o empleados específicos ("Juan Pérez"). El sistema funciona con ambos.
- **Overhead Simple vs ABC**: El usuario puede usar un % simple o configurar Activity-Based Costing completo.
- **Contextos Dinámicos**: Los contextos de servicio dependen de las capabilities activadas.

### 2.3 Configurabilidad Multi-Industria

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CONFIGURACIÓN POR INDUSTRIA (ejemplos)                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GASTRONOMÍA:                                                               │
│  ├── Labor loaded_factor: 1.30                                             │
│  ├── Overhead method: percentage (15-25% sobre prime cost)                 │
│  ├── Target food cost: 28-35%                                              │
│  └── Contextos: salon, delivery, takeaway                                  │
│                                                                             │
│  SERVICIOS PROFESIONALES:                                                   │
│  ├── Labor loaded_factor: 1.40                                             │
│  ├── Overhead method: percentage (40-60% sobre labor)                      │
│  ├── Target utilization: 70-80%                                            │
│  └── Contextos: onsite, remote                                             │
│                                                                             │
│  MANUFACTURA:                                                               │
│  ├── Labor loaded_factor: 1.35                                             │
│  ├── Overhead method: machine_hours o ABC                                  │
│  ├── Asset depreciation: directo por producto                              │
│  └── Contextos: standard, rush_order                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. ARQUITECTURA USER VS EMPLOYEE

### 3.1 El Problema

El sistema tiene dos conceptos que pueden confundirse:

1. **Users del sistema** (auth.users) - Cuentas que pueden hacer login al panel
2. **Empleados operativos** (employees) - Staff que trabaja y tiene costo laboral

No todos los empleados necesitan acceso al panel (ej: cocinero), y no todos los usuarios 
del panel son empleados con costo laboral (ej: dueño que no trabaja operativamente).

### 3.2 Dos Tipos de "Roles"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CLARIFICACIÓN DE ROLES                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SYSTEM ROLE (acceso al panel):                                              │
│  ├── Propósito: Permisos de la aplicación                                   │
│  ├── Tabla: users_roles                                                     │
│  ├── Valores: CLIENTE, OPERADOR, SUPERVISOR, ADMINISTRADOR, SUPER_ADMIN     │
│  ├── Se asigna a: auth.users                                                │
│  └── Usado por: AuthContext, PermissionsRegistry                            │
│                                                                             │
│  STAFF ROLE (rol de trabajo):                                                │
│  ├── Propósito: Costeo de mano de obra                                      │
│  ├── Tabla: staff_roles (NUEVA)                                             │
│  ├── Valores: "Cocinero", "Mesero", "Barbero", "Consultor", etc.            │
│  ├── Se asigna a: employees                                                 │
│  └── Usado por: Product costing, Staff allocation                           │
│                                                                             │
│  ⚠️ employees.role ('admin'|'manager'|'supervisor'|'employee')              │
│     → LEGACY/DEPRECADO - Usar SystemRole para permisos                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Modelo de Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ARQUITECTURA DE DATOS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐                                                       │
│  │   auth.users     │ ◄──────── Supabase Auth                               │
│  │   (Supabase)     │                                                       │
│  └────────┬─────────┘                                                       │
│           │                                                                 │
│           │ 1:N                                                             │
│           ▼                                                                 │
│  ┌──────────────────┐                                                       │
│  │   users_roles    │ ◄──────── Rol del SISTEMA (permisos panel)            │
│  │   user_id ──────►│──── auth.users.id                                     │
│  │   role           │ CLIENTE | OPERADOR | SUPERVISOR | ADMIN | SUPER_ADMIN │
│  └──────────────────┘                                                       │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════    │
│                        SEPARACIÓN CONCEPTUAL                                │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  ┌──────────────────┐         ┌──────────────────┐                          │
│  │   staff_roles    │ ◄─────  │   employees      │                          │
│  │   (NUEVA)        │  N:1    │                  │                          │
│  ├──────────────────┤         ├──────────────────┤                          │
│  │ id               │◄────────│ staff_role_id    │ Rol de TRABAJO           │
│  │ name             │         │ user_id (NULL OK)│───► auth.users (opcional)│
│  │ default_hourly_  │         │ hourly_rate      │                          │
│  │   rate           │         │ salary           │                          │
│  │ loaded_factor    │         │ position (LEGACY)│                          │
│  │ department       │         │ ...              │                          │
│  └──────────────────┘         └──────────────────┘                          │
│                                        │                                    │
│                                        │ 1:N                                │
│                                        ▼                                    │
│                               ┌──────────────────┐                          │
│                               │ product_staff_   │                          │
│                               │ allocations      │                          │
│                               ├──────────────────┤                          │
│                               │ product_id       │                          │
│                               │ role_id ─────────│───► staff_roles.id       │
│                               │ employee_id      │───► employees.id (opc.)  │
│                               │ duration_minutes │                          │
│                               │ hourly_rate      │ (override opcional)      │
│                               └──────────────────┘                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Escenarios de Uso

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ESCENARIOS                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. EMPLEADO SIN ACCESO AL PANEL (Cocinero operativo)                        │
│     employees:                                                               │
│       ├── staff_role_id: uuid("cocinero")                                   │
│       ├── user_id: NULL ◄─── Sin cuenta de sistema                          │
│       └── hourly_rate: 15.00                                                │
│     → Tiene costo laboral, NO puede hacer login                             │
│                                                                             │
│  2. EMPLEADO CON ACCESO AL PANEL (Gerente de turno)                          │
│     employees:                                                               │
│       ├── staff_role_id: uuid("gerente_turno")                              │
│       ├── user_id: uuid ──────► auth.users (tiene cuenta)                   │
│       └── hourly_rate: 25.00                                                │
│     users_roles:                                                             │
│       ├── user_id: uuid                                                     │
│       └── role: 'SUPERVISOR'                                                │
│     → Tiene costo laboral Y puede acceder al panel como SUPERVISOR          │
│                                                                             │
│  3. USUARIO SIN COSTO LABORAL (Dueño/Administrador)                          │
│     auth.users: existe                                                       │
│     users_roles:                                                             │
│       ├── user_id: uuid                                                     │
│       └── role: 'ADMINISTRADOR'                                             │
│     employees: NO EXISTE ◄─── No tiene registro de empleado                 │
│     → Puede acceder al panel, NO tiene costo laboral asignado               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Migración/Deprecación

```typescript
// employees.role está DEPRECADO
// Mantener por compatibilidad pero no usar para lógica nueva

interface Employee {
  // ... campos existentes ...
  
  /** @deprecated Use staff_role_id instead */
  role: 'admin' | 'manager' | 'supervisor' | 'employee';
  
  /** @deprecated Use position from staff_roles */
  position: string;
  
  // NUEVOS campos
  staff_role_id?: string;  // FK a staff_roles - para costeo
  user_id?: string;        // FK a auth.users - si tiene acceso al panel
}
```

---

## 4. COMPONENTES DE COSTO

### 4.1 Materials (Ya Diseñado)

**Referencia**: `docs/recipe/RECIPE_DESIGN_DEFINITIVO.md`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MATERIALS COST                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Fuente:        Recipe/BOM del producto                                     │
│  Cálculo:       Σ(input.quantity × input.unit_cost)                        │
│  Consideraciones:                                                           │
│  ├── Yield % (rendimiento)                                                 │
│  ├── Waste % (merma)                                                       │
│  └── Encapsulamiento (producto dentro de producto)                         │
│                                                                             │
│  Estado:        ✅ DISEÑADO (ver RECIPE_DESIGN_DEFINITIVO.md)               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Labor/Staff

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LABOR COST                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Concepto:      Costo del tiempo de personal para producir/entregar        │
│                                                                             │
│  Componentes:                                                               │
│  ├── Base hourly rate (salario base / horas trabajables)                   │
│  ├── Loaded factor (carga social, beneficios, impuestos)                   │
│  │   └── Típico: 125-160% del base según país/tipo empleo                  │
│  └── Effective hourly cost = base × loaded_factor                          │
│                                                                             │
│  Asignación:                                                                │
│  ├── Por ROL (genérico): "Cocinero", "Mesero", "Consultor"                 │
│  ├── Por EMPLEADO (específico): "Juan Pérez"                               │
│  └── Por CONTEXTO: Staff de producción vs Staff de servicio                │
│                                                                             │
│  Fórmula:                                                                   │
│  labor_cost = Σ(allocation.minutes / 60 × role.loaded_hourly_cost)         │
│                                                                             │
│  Estado:        ✅ DISEÑADO (ver Sección 5)                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Assets (Por Diseñar)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ASSET COST                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Concepto:      Costo de uso de equipos/herramientas en producción          │
│                                                                             │
│  Dos Modos de Asignación:                                                   │
│                                                                             │
│  1. OVERHEAD (tradicional):                                                 │
│     └── Depreciación va al pool de overhead general                        │
│     └── Se distribuye proporcionalmente a todos los productos              │
│                                                                             │
│  2. DIRECTO (ABC - Activity Based):                                         │
│     └── Cada producto indica qué assets usa y por cuánto tiempo            │
│     └── Costo = usage_time × asset.hourly_cost                             │
│     └── hourly_cost = depreciation + maintenance + energy                  │
│                                                                             │
│  Componentes del hourly_cost:                                               │
│  ├── Depreciación horaria:                                                 │
│  │   └── (purchase_price - salvage_value) / useful_life_hours              │
│  ├── Mantenimiento prorrateado:                                            │
│  │   └── annual_maintenance_cost / annual_usage_hours                      │
│  └── Energía (opcional):                                                   │
│      └── power_consumption_kw × energy_cost_per_kwh                        │
│                                                                             │
│  Estado:        ⏳ POR DISEÑAR                                              │
│                                                                             │
│  Preguntas pendientes:                                                      │
│  ├── ¿Qué assets son "directos" vs "overhead"?                             │
│  ├── ¿Cómo se calcula la depreciación? (método configurable)               │
│  ├── ¿Se trackea uso real o estimado?                                      │
│  └── ¿Qué expone el módulo Assets como API pública?                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Overhead (Por Diseñar)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  OVERHEAD COST                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Concepto:      Costos indirectos que no se pueden asignar directamente    │
│                                                                             │
│  Incluye típicamente:                                                       │
│  ├── Renta/Alquiler de local                                               │
│  ├── Utilities (luz, agua, gas, internet)                                  │
│  ├── Salarios administrativos (no de producción)                           │
│  ├── Seguros                                                               │
│  ├── Depreciación de equipos (si no es directo)                            │
│  ├── Software/Licencias generales                                          │
│  └── Marketing, legal, contable, etc.                                      │
│                                                                             │
│  Métodos de Asignación:                                                     │
│                                                                             │
│  1. SIMPLE (% sobre base):                                                  │
│     ├── % sobre prime cost (materials + labor)                             │
│     ├── % sobre labor cost                                                 │
│     └── Fijo por unidad                                                    │
│                                                                             │
│  2. ABC (Activity-Based Costing):                                           │
│     └── Pools de overhead con drivers específicos                          │
│     └── Ej: Facilities por sq_ft, Admin por headcount                      │
│                                                                             │
│  Estado:        ⏳ POR DISEÑAR                                              │
│                                                                             │
│  Preguntas pendientes:                                                      │
│  ├── ¿Qué nivel de complejidad soportar inicialmente?                      │
│  ├── ¿Dónde se configura? (Settings globales vs por producto)              │
│  └── ¿Cómo se manejan múltiples locations con overhead diferente?          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.5 Context Costs (Por Diseñar)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CONTEXT COSTS                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Concepto:      Costos adicionales que varían según CÓMO se entrega        │
│                 el producto/servicio                                        │
│                                                                             │
│  Ejemplo - Restaurante:                                                     │
│  ┌────────────┬─────────────────────────────────────────────────────────┐  │
│  │ Contexto   │ Costos adicionales                                     │  │
│  ├────────────┼─────────────────────────────────────────────────────────┤  │
│  │ Salón      │ + 5 min mesero ($0.83)                                 │  │
│  │ Delivery   │ + 15 min repartidor ($2.50) + comisión plataforma 15%  │  │
│  │ Takeaway   │ + $0 (sin labor adicional)                             │  │
│  └────────────┴─────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Componentes de un Contexto:                                                │
│  ├── ID único                                                              │
│  ├── Nombre display                                                        │
│  ├── Feature requerida (fulfillment_delivery, etc.)                        │
│  ├── Staff adicional requerido                                             │
│  └── Costos adicionales (fijos, %, etc.)                                   │
│                                                                             │
│  Estado:        ⏳ POR DISEÑAR                                              │
│                                                                             │
│  Preguntas pendientes:                                                      │
│  ├── ¿Contextos configurables por organización?                            │
│  ├── ¿Se heredan del Feature System o son independientes?                  │
│  └── ¿Cómo interactúa con el módulo Fulfillment?                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. STAFF/LABOR - DISEÑO DETALLADO

### 5.1 Modelo de Datos: staff_roles

Nueva tabla para definir roles de trabajo con información de costeo:

```sql
-- ============================================================================
-- STAFF ROLES: Roles de trabajo para costeo de mano de obra
-- ============================================================================

CREATE TABLE staff_roles (
  -- Identidad
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Información del rol
  name TEXT NOT NULL,                      -- "Cocinero", "Mesero", "Barbero"
  department TEXT,                         -- Agrupación opcional
  description TEXT,
  
  -- Costeo
  default_hourly_rate DECIMAL(10,2),       -- Tarifa base por hora
  loaded_factor DECIMAL(4,3) DEFAULT 1.0,  -- Factor de carga (1.325 = 32.5%)
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT staff_roles_pkey PRIMARY KEY (id),
  CONSTRAINT staff_roles_org_name_unique UNIQUE(organization_id, name)
);

-- Índices
CREATE INDEX idx_staff_roles_org ON staff_roles(organization_id);
CREATE INDEX idx_staff_roles_active ON staff_roles(organization_id, is_active);
```

### 5.2 Modificaciones a employees

```sql
-- ============================================================================
-- EMPLOYEES: Agregar links a staff_roles y auth.users
-- ============================================================================

-- Agregar FK a staff_roles (rol de trabajo para costeo)
ALTER TABLE employees 
ADD COLUMN staff_role_id UUID REFERENCES staff_roles(id);

-- Agregar FK a auth.users (opcional - solo si tiene acceso al panel)
ALTER TABLE employees 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Índices
CREATE INDEX idx_employees_staff_role ON employees(staff_role_id);
CREATE INDEX idx_employees_user ON employees(user_id) WHERE user_id IS NOT NULL;

-- Comentarios de deprecación
COMMENT ON COLUMN employees.role IS 'DEPRECATED: Use users_roles for system access';
COMMENT ON COLUMN employees.position IS 'DEPRECATED: Use staff_roles.name for job title';
```

### 5.3 Modificaciones a product_staff_allocations

```sql
-- ============================================================================
-- PRODUCT_STAFF_ALLOCATIONS: Agregar FK real a staff_roles
-- ============================================================================

-- Agregar FK constraint (role_id ya existe pero sin constraint)
ALTER TABLE product_staff_allocations
ADD CONSTRAINT fk_staff_role 
FOREIGN KEY (role_id) REFERENCES staff_roles(id);

-- Agregar campo para asignación de empleado específico (opcional)
ALTER TABLE product_staff_allocations
ADD COLUMN employee_id UUID REFERENCES employees(id);

-- Agregar campo para override de loaded_factor (opcional)
ALTER TABLE product_staff_allocations
ADD COLUMN loaded_factor_override DECIMAL(4,3);

-- Índice para búsqueda por rol
CREATE INDEX idx_product_staff_alloc_role ON product_staff_allocations(role_id);
```

### 5.4 Configuración en staff_policies

```sql
-- ============================================================================
-- STAFF_POLICIES: Agregar configuración de costeo laboral
-- ============================================================================

ALTER TABLE staff_policies
ADD COLUMN labor_costing_config JSONB DEFAULT '{
  "default_loaded_factor": 1.325,
  "factors_by_employment_type": {
    "full_time": 1.40,
    "part_time": 1.25,
    "contract": 1.10,
    "intern": 1.05
  },
  "calculation_precision": 4,
  "round_to_cents": true
}'::jsonb;
```

### 5.5 TypeScript Types

```typescript
// =============================================================================
// src/modules/staff/types/staffRole.ts
// =============================================================================

/**
 * StaffRole: Rol de trabajo para costeo de mano de obra
 * NO confundir con SystemRole (permisos del panel)
 */
export interface StaffRole {
  id: string;
  organization_id: string;
  
  // Identidad
  name: string;                    // "Cocinero", "Mesero", "Barbero"
  department?: string;
  description?: string;
  
  // Costeo
  default_hourly_rate?: number;    // Tarifa base por hora
  loaded_factor: number;           // Factor de carga (default 1.0)
  
  // Calculated (no stored)
  loaded_hourly_cost?: number;     // default_hourly_rate × loaded_factor
  
  // Metadata
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Configuración de costeo laboral (en staff_policies)
 */
export interface LaborCostingConfig {
  default_loaded_factor: number;   // Default: 1.325
  factors_by_employment_type?: {
    full_time?: number;
    part_time?: number;
    contract?: number;
    intern?: number;
  };
  calculation_precision?: number;  // Decimal places (default 4)
  round_to_cents?: boolean;        // Round final to 2 decimals
}

/**
 * StaffAllocation actualizado para productos
 */
export interface StaffAllocation {
  id?: string;
  product_id: string;
  
  // Asignación (al menos uno requerido)
  role_id: string;                 // FK a staff_roles
  employee_id?: string;            // FK a employees (opcional, más específico)
  
  // Tiempo
  duration_minutes: number;
  count: number;                   // Cantidad de personas
  
  // Costeo (overrides opcionales)
  hourly_rate_override?: number;   // Override del rate del rol
  loaded_factor_override?: number; // Override del factor del rol
  
  // Calculated fields (no stored, computed on read)
  role_name?: string;
  employee_name?: string;
  effective_hourly_rate?: number;  // Rate usado (con overrides aplicados)
  loaded_hourly_cost?: number;     // effective_hourly_rate × loaded_factor
  total_hours?: number;            // duration_minutes / 60 × count
  total_cost?: number;             // total_hours × loaded_hourly_cost
}

/**
 * Resultado del cálculo de costo laboral
 */
export interface LaborCostResult {
  total_cost: number;
  total_hours: number;
  breakdown: LaborCostBreakdownItem[];
}

export interface LaborCostBreakdownItem {
  allocation_id?: string;
  role_name: string;
  employee_name?: string;
  count: number;
  duration_minutes: number;
  hourly_rate: number;
  loaded_factor: number;
  loaded_hourly_cost: number;
  hours: number;
  cost: number;
}
```

### 5.6 Jerarquía de Loaded Factor

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RESOLUCIÓN DEL LOADED FACTOR                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Prioridad (mayor a menor):                                                 │
│                                                                             │
│  1. StaffAllocation.loaded_factor_override                                  │
│     └── Override específico en la asignación del producto                   │
│                                                                             │
│  2. StaffRole.loaded_factor                                                  │
│     └── Factor configurado en el rol de trabajo                             │
│                                                                             │
│  3. labor_costing_config.factors_by_employment_type[type]                    │
│     └── Factor por tipo de empleo (si hay employee_id)                      │
│                                                                             │
│  4. labor_costing_config.default_loaded_factor                               │
│     └── Default de la organización                                          │
│                                                                             │
│  5. System Default: 1.325                                                    │
│     └── Hardcoded fallback                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// Implementación de la resolución
function resolveLoadedFactor(
  allocation: StaffAllocation,
  role: StaffRole,
  employee: Employee | null,
  config: LaborCostingConfig
): number {
  const SYSTEM_DEFAULT = 1.325;
  
  // 1. Override en allocation
  if (allocation.loaded_factor_override != null) {
    return allocation.loaded_factor_override;
  }
  
  // 2. Factor del rol
  if (role.loaded_factor != null && role.loaded_factor !== 1.0) {
    return role.loaded_factor;
  }
  
  // 3. Factor por tipo de empleo
  if (employee && config.factors_by_employment_type) {
    const typeFactors = config.factors_by_employment_type;
    const factor = typeFactors[employee.employment_type as keyof typeof typeFactors];
    if (factor != null) {
      return factor;
    }
  }
  
  // 4. Default de organización
  if (config.default_loaded_factor != null) {
    return config.default_loaded_factor;
  }
  
  // 5. System default
  return SYSTEM_DEFAULT;
}
```

### 5.7 Jerarquía de Hourly Rate

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RESOLUCIÓN DEL HOURLY RATE                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Prioridad (mayor a menor):                                                 │
│                                                                             │
│  1. StaffAllocation.hourly_rate_override                                     │
│     └── Override específico en la asignación del producto                   │
│                                                                             │
│  2. Employee.hourly_rate (si hay employee_id)                                │
│     └── Rate específico del empleado asignado                               │
│                                                                             │
│  3. StaffRole.default_hourly_rate                                            │
│     └── Rate por defecto del rol                                            │
│                                                                             │
│  4. Fallback: 0 (con warning)                                                │
│     └── Sistema advierte pero no bloquea                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.8 Staff Module API

```typescript
// =============================================================================
// src/modules/staff/manifest.tsx - Exports actualizados
// =============================================================================

exports: {
  // =========================================================================
  // HOOKS
  // =========================================================================
  hooks: {
    useEmployeesList: () => useCrudOperations({
      tableName: 'employees',
      selectQuery: `
        id, first_name, last_name, position, hourly_rate, 
        is_active, checked_in, checked_in_at,
        staff_role_id, user_id,
        staff_roles (id, name, default_hourly_rate, loaded_factor)
      `
    }),
    
    useStaffRoles: () => useCrudOperations({
      tableName: 'staff_roles',
      selectQuery: '*'
    }),
  },
  
  // =========================================================================
  // COSTING API - Para uso por Products module
  // =========================================================================
  costing: {
    /**
     * Obtiene todos los roles activos para selector de asignación
     */
    getRolesForAllocation: async (): Promise<StaffRoleOption[]> => {
      const { data } = await supabase
        .from('staff_roles')
        .select('id, name, department, default_hourly_rate, loaded_factor')
        .eq('is_active', true)
        .order('sort_order');
      
      return data?.map(role => ({
        ...role,
        loaded_hourly_cost: (role.default_hourly_rate ?? 0) * role.loaded_factor
      })) ?? [];
    },
    
    /**
     * Obtiene el costo horario cargado de un rol
     */
    getRoleHourlyCost: async (roleId: string): Promise<number> => {
      const { data: role } = await supabase
        .from('staff_roles')
        .select('default_hourly_rate, loaded_factor')
        .eq('id', roleId)
        .single();
      
      if (!role) return 0;
      return (role.default_hourly_rate ?? 0) * (role.loaded_factor ?? 1);
    },
    
    /**
     * Calcula el costo laboral de un conjunto de asignaciones
     */
    calculateLaborCost: async (
      allocations: StaffAllocation[],
      config?: LaborCostingConfig
    ): Promise<LaborCostResult> => {
      // Implementación completa con resolución de rates y factors
      // Ver sección 5.9
    },
    
    /**
     * Obtiene empleados de un rol específico
     */
    getEmployeesByRole: async (roleId: string): Promise<Employee[]> => {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('staff_role_id', roleId)
        .eq('is_active', true);
      
      return data ?? [];
    },
    
    /**
     * Obtiene la configuración de costeo de la organización
     */
    getLaborCostingConfig: async (): Promise<LaborCostingConfig> => {
      const { data } = await supabase
        .from('staff_policies')
        .select('labor_costing_config')
        .single();
      
      return data?.labor_costing_config ?? {
        default_loaded_factor: 1.325
      };
    },
  },
  
  // =========================================================================
  // LEGACY (mantener por compatibilidad)
  // =========================================================================
  getStaffAvailability: async () => [...],
  getActiveStaff: async () => [...],
  
  /** @deprecated Use costing.calculateLaborCost instead */
  calculateLaborCost: (hours: number, rate: number) => hours * rate,
}
```

### 5.9 Implementación del Cálculo

```typescript
// =============================================================================
// src/modules/staff/services/laborCostCalculation.ts
// =============================================================================

import Decimal from 'decimal.js';

export async function calculateLaborCost(
  allocations: StaffAllocation[],
  config?: LaborCostingConfig
): Promise<LaborCostResult> {
  // Obtener config si no se provee
  const costingConfig = config ?? await getLaborCostingConfig();
  
  // Acumular resultados
  let totalCost = new Decimal(0);
  let totalHours = new Decimal(0);
  const breakdown: LaborCostBreakdownItem[] = [];
  
  for (const allocation of allocations) {
    // Obtener rol
    const role = await getStaffRole(allocation.role_id);
    if (!role) continue;
    
    // Obtener empleado si está especificado
    const employee = allocation.employee_id 
      ? await getEmployee(allocation.employee_id) 
      : null;
    
    // Resolver hourly rate
    const hourlyRate = resolveHourlyRate(allocation, role, employee);
    
    // Resolver loaded factor
    const loadedFactor = resolveLoadedFactor(
      allocation, role, employee, costingConfig
    );
    
    // Calcular costo cargado por hora
    const loadedHourlyCost = new Decimal(hourlyRate).times(loadedFactor);
    
    // Calcular horas totales
    const hours = new Decimal(allocation.duration_minutes)
      .dividedBy(60)
      .times(allocation.count);
    
    // Calcular costo
    const cost = hours.times(loadedHourlyCost);
    
    // Acumular
    totalCost = totalCost.plus(cost);
    totalHours = totalHours.plus(hours);
    
    // Agregar al breakdown
    breakdown.push({
      allocation_id: allocation.id,
      role_name: role.name,
      employee_name: employee 
        ? `${employee.first_name} ${employee.last_name}` 
        : undefined,
      count: allocation.count,
      duration_minutes: allocation.duration_minutes,
      hourly_rate: hourlyRate,
      loaded_factor: loadedFactor,
      loaded_hourly_cost: loadedHourlyCost.toNumber(),
      hours: hours.toNumber(),
      cost: cost.toNumber(),
    });
  }
  
  // Redondear si está configurado
  const finalCost = costingConfig.round_to_cents
    ? totalCost.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    : totalCost.toDecimalPlaces(costingConfig.calculation_precision ?? 4);
  
  return {
    total_cost: finalCost.toNumber(),
    total_hours: totalHours.toNumber(),
    breakdown,
  };
}

function resolveHourlyRate(
  allocation: StaffAllocation,
  role: StaffRole,
  employee: Employee | null
): number {
  // 1. Override en allocation
  if (allocation.hourly_rate_override != null) {
    return allocation.hourly_rate_override;
  }
  
  // 2. Rate del empleado
  if (employee?.hourly_rate != null) {
    return employee.hourly_rate;
  }
  
  // 3. Rate del rol
  if (role.default_hourly_rate != null) {
    return role.default_hourly_rate;
  }
  
  // 4. Fallback (con warning)
  console.warn(
    `No hourly rate found for allocation. Role: ${role.name}. Using 0.`
  );
  return 0;
}
```

---

## 6. ARQUITECTURA POR CAPAS

### 6.1 Vista General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         UI LAYER                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ BOM/Recipe  │  │ Staff       │  │ Assets      │  │ Cost        │  │  │
│  │  │ Editor      │  │ Allocation  │  │ Allocation  │  │ Summary     │  │  │
│  │  │ Tab         │  │ Tab         │  │ Tab         │  │ Tab         │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │  │
│  └─────────┼────────────────┼────────────────┼────────────────┼─────────┘  │
│            │                │                │                │            │
│            ▼                ▼                ▼                ▼            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    COST CALCULATION ENGINE                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  ProductCostCalculator                                          │  │  │
│  │  │  ├── getMaterialsCost() → Recipe Module                         │  │  │
│  │  │  ├── getLaborCost() → Staff Module                              │  │  │
│  │  │  ├── getAssetsCost() → Assets Module                            │  │  │
│  │  │  ├── getOverheadCost() → Overhead Config                        │  │  │
│  │  │  ├── getContextCost(context) → Context Registry                 │  │  │
│  │  │  └── getTotalCost(context?) → Aggregated                        │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│            │                │                │                │            │
│            ▼                ▼                ▼                ▼            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      MODULE APIs (Public Exports)                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│  │  │ Recipe   │  │ Staff    │  │ Assets   │  │ Settings │              │  │
│  │  │ Module   │  │ Module   │  │ Module   │  │ Module   │              │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘              │  │
│  └───────┼─────────────┼─────────────┼─────────────┼────────────────────┘  │
│          │             │             │             │                       │
│          ▼             ▼             ▼             ▼                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         DATA LAYER (Supabase)                         │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │  │
│  │  │recipes  │  │staff    │  │assets   │  │overhead │  │contexts │     │  │
│  │  │         │  │roles    │  │         │  │_config  │  │         │     │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Flujo de Cálculo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FLUJO: Calcular costo de "Hamburguesa Premium" para contexto "Delivery"    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. UI solicita cálculo:                                                    │
│     ProductCostCalculator.getTotalCost(productId, { context: 'delivery' })  │
│                                                                             │
│  2. Calculator obtiene recipe:                                              │
│     recipeAPI.getRecipeCost(product.recipe_id)                              │
│     → Returns: { materialsCost: $12.50, inputs: [...] }                    │
│                                                                             │
│  3. Calculator obtiene labor de PRODUCCIÓN:                                 │
│     staffAPI.calculateLaborCost(product.staff_allocations.production)       │
│     → Returns: $4.14 (Cocinero 10min + Ayudante 5min)                      │
│                                                                             │
│  4. Calculator obtiene assets (si hay):                                     │
│     assetsAPI.calculateAssetCost(product.asset_allocations)                 │
│     → Returns: $0.50 (Parrilla 5min)                                       │
│                                                                             │
│  5. Calculator obtiene overhead:                                            │
│     overheadConfig.calculate(primeCost: $16.64)                             │
│     → Returns: $3.33 (20% sobre prime cost)                                │
│                                                                             │
│  6. Calculator obtiene costo de CONTEXTO:                                   │
│     contextRegistry.getCost('delivery', product)                            │
│     ├── Labor: Repartidor 15min = $2.50                                    │
│     └── Additional: Platform fee 15% = $2.85                               │
│     → Returns: $5.35                                                       │
│                                                                             │
│  7. Resultado:                                                              │
│     {                                                                       │
│       materials: $12.50,                                                   │
│       labor: {                                                             │
│         production: $4.14,                                                 │
│         service: $2.50                                                     │
│       },                                                                   │
│       assets: $0.50,                                                       │
│       overhead: $3.33,                                                     │
│       contextAdditional: $2.85,                                            │
│       total: $25.82                                                        │
│     }                                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. INTEGRACIÓN CON MÓDULOS

### 7.1 Módulos Involucrados

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MÓDULO          │ ROL EN COSTEO                   │ ESTADO ACTUAL          │
├──────────────────┼─────────────────────────────────┼────────────────────────┤
│  Recipe          │ Provee costo de materiales      │ ✅ Funcional           │
│  Staff           │ Provee roles y hourly rates     │ ⚠️ Parcial            │
│  Assets          │ Provee assets y costos de uso   │ ⚠️ Sin cálculo depre. │
│  Products        │ Consume todos los anteriores    │ ⚠️ Solo materiales    │
│  Settings        │ Configura overhead, factors     │ ⏳ Por implementar     │
│  Fulfillment     │ Define contextos de servicio    │ ⏳ Por definir         │
│  Feature System  │ Activa/desactiva contextos      │ ✅ Funcional           │
└──────────────────┴─────────────────────────────────┴────────────────────────┘
```

### 7.2 APIs Públicas Requeridas

#### Staff Module API (por definir)

```typescript
// Lo que Products necesita del módulo Staff
interface StaffModuleAPI {
  // Obtener roles disponibles
  getRoles(): Promise<StaffRole[]>;
  
  // Obtener hourly cost de un rol (ya con loaded factor)
  getRoleHourlyCost(roleId: string): number;
  
  // Calcular costo de una asignación de staff
  calculateLaborCost(allocations: StaffAllocation[]): LaborCostResult;
  
  // Obtener empleados de un rol (para asignación específica)
  getEmployeesByRole(roleId: string): Promise<Employee[]>;
  
  // Obtener hourly cost de un empleado específico
  getEmployeeHourlyCost(employeeId: string): number;
}

interface StaffAllocation {
  type: 'role' | 'employee';
  role_id?: string;
  employee_id?: string;
  duration_minutes: number;
  context?: 'production' | 'service';  // Distinguir producción de servicio
}

interface LaborCostResult {
  totalCost: number;
  breakdown: {
    role_or_employee: string;
    minutes: number;
    hourlyRate: number;
    cost: number;
  }[];
}
```

#### Assets Module API (por definir)

```typescript
// Lo que Products necesita del módulo Assets
interface AssetsModuleAPI {
  // Obtener assets disponibles
  getAssets(): Promise<Asset[]>;
  
  // Obtener costo por hora de un asset
  getAssetHourlyCost(assetId: string): AssetHourlyCost;
  
  // Calcular costo de uso de assets
  calculateAssetCost(allocations: AssetAllocation[]): AssetCostResult;
}

interface AssetHourlyCost {
  depreciation_per_hour: number;
  maintenance_per_hour: number;
  energy_per_hour: number;
  total_per_hour: number;
}

interface AssetAllocation {
  asset_id: string;
  usage_minutes: number;
}

interface AssetCostResult {
  totalCost: number;
  breakdown: {
    asset_name: string;
    minutes: number;
    hourlyCost: number;
    cost: number;
  }[];
}
```

### 7.3 Eventos de Sincronización

```typescript
// Cuando cambian los costos base, se deben recalcular los productos

// Staff: Cuando cambia hourly_rate o loaded_factor
eventBus.on('staff.role_updated', (event) => {
  // Recalcular productos que usan este rol
  productCostService.recalculateByRole(event.roleId);
});

// Assets: Cuando cambia el valor o se registra mantenimiento
eventBus.on('assets.asset_updated', (event) => {
  // Recalcular productos que usan este asset
  productCostService.recalculateByAsset(event.assetId);
});

// Materials: Cuando cambia el costo unitario
eventBus.on('materials.cost_updated', (event) => {
  // Ya manejado por Recipe module
});

// Settings: Cuando cambia la configuración de overhead
eventBus.on('settings.overhead_updated', (event) => {
  // Recalcular todos los productos
  productCostService.recalculateAll();
});
```

---

## 8. CÁLCULO POR TIPO DE PRODUCTO

### 8.1 Physical Product (Elaborado)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHYSICAL PRODUCT (ej: Hamburguesa)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Componentes de costo:                                                      │
│  ├── ✅ Materials (Recipe/BOM)                                             │
│  ├── ✅ Labor - Producción (quién la prepara)                              │
│  ├── 🟡 Labor - Servicio (quién la entrega, según contexto)                │
│  ├── 🟡 Assets (equipos usados: parrilla, horno, etc.)                     │
│  ├── 🟡 Overhead (% sobre prime cost)                                      │
│  └── 🟡 Context costs (delivery fee, etc.)                                 │
│                                                                             │
│  Fórmula:                                                                   │
│  base_cost = materials + labor_production + assets + overhead               │
│  context_cost = labor_service + additional_fees                             │
│  total_cost(context) = base_cost + context_cost                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Service

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SERVICE (ej: Corte de Pelo, Consultoría)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Componentes de costo:                                                      │
│  ├── 🟡 Materials (consumibles: shampoo, hojas, etc.) - OPCIONALES         │
│  ├── ✅ Labor (quién ejecuta el servicio)                                  │
│  ├── 🟡 Assets (equipos: silla, herramientas)                              │
│  └── 🟡 Overhead (% sobre labor cost, típicamente mayor que productos)     │
│                                                                             │
│  Particularidad:                                                            │
│  - Labor es el componente DOMINANTE (60-80% del costo)                     │
│  - Overhead suele ser mayor (40-60% sobre labor)                           │
│  - Context: onsite vs remote puede variar costos                           │
│                                                                             │
│  Fórmula:                                                                   │
│  cost = materials + labor + assets + overhead                               │
│  overhead = labor × overhead_percentage (típico 40-60%)                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Rental

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RENTAL (ej: Alquiler de Herramienta)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Componentes de costo:                                                      │
│  ├── ✅ Asset depreciation (por período de alquiler)                       │
│  ├── 🟡 Maintenance prorrateado                                            │
│  ├── 🟡 Labor (entrega, inspección, etc.)                                  │
│  └── 🟡 Overhead                                                           │
│                                                                             │
│  Particularidad:                                                            │
│  - El "costo" es realmente el desgaste del asset                           │
│  - Puede incluir depósito de seguridad (no es costo, es garantía)          │
│  - El precio de alquiler debe cubrir depreciación + profit                 │
│                                                                             │
│  Fórmula:                                                                   │
│  cost_per_day = asset.daily_depreciation + daily_maintenance               │
│               + labor_per_rental + overhead                                 │
│                                                                             │
│  Ya definido en productForm.ts:                                             │
│  - DepreciationConfig (straight_line, declining_balance, units_of_prod)    │
│  - MaintenanceConfig                                                        │
│  - SecurityDepositConfig                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.4 Digital

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DIGITAL (ej: E-book, Curso Online)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Componentes de costo:                                                      │
│  ├── ✅ Labor de creación (amortizado sobre ventas esperadas)              │
│  ├── 🟡 Platform fees (si aplica: Stripe, hosting)                         │
│  └── 🟡 Overhead mínimo                                                    │
│                                                                             │
│  Particularidad:                                                            │
│  - Costo marginal cercano a $0                                             │
│  - El "costo" es la amortización de la inversión inicial                   │
│  - Pricing basado en valor, no en costo                                    │
│                                                                             │
│  Fórmula:                                                                   │
│  cost_per_unit = creation_cost / expected_units_sold                        │
│                + platform_fee_percentage × price                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.5 Membership

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MEMBERSHIP (ej: Suscripción Mensual)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Componentes de costo:                                                      │
│  ├── ✅ Cost to serve (uso promedio de recursos por miembro)               │
│  ├── 🟡 Platform/Payment fees                                              │
│  ├── 🟡 Support costs prorrateados                                         │
│  └── 🟡 Churn cost (costo de adquisición amortizado)                       │
│                                                                             │
│  Particularidad:                                                            │
│  - Costo recurrente, no por unidad                                         │
│  - Depende del nivel de uso del miembro                                    │
│  - LTV vs CAC es la métrica clave                                          │
│                                                                             │
│  Fórmula:                                                                   │
│  monthly_cost = avg_usage_cost + support_cost_per_member                    │
│               + payment_fee + acquisition_cost / avg_lifetime_months        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. CONTEXTOS DE SERVICIO

### 9.1 Concepto

Los **contextos de servicio** representan las diferentes formas en que un producto puede ser entregado al cliente, cada una con costos potencialmente diferentes.

### 9.2 Integración con Feature System

```typescript
// Los contextos dependen de las features activadas
const DELIVERY_CONTEXTS: DeliveryContext[] = [
  {
    id: 'dine_in',
    name: 'Salón / En el local',
    requires_feature: 'fulfillment_onsite',
    staff_requirements: [
      { role_id: 'waiter', minutes_per_order: 5, per: 'order' }
    ],
    additional_costs: []
  },
  {
    id: 'takeaway',
    name: 'Para llevar',
    requires_feature: 'fulfillment_pickup',
    staff_requirements: [
      { role_id: 'cashier', minutes_per_order: 2, per: 'order' }
    ],
    additional_costs: [
      { type: 'fixed', name: 'Packaging', amount: 0.50 }
    ]
  },
  {
    id: 'delivery_own',
    name: 'Delivery Propio',
    requires_feature: 'fulfillment_delivery',
    staff_requirements: [
      { role_id: 'delivery_driver', minutes_per_order: 20, per: 'order' }
    ],
    additional_costs: []
  },
  {
    id: 'delivery_platform',
    name: 'Delivery (PedidosYa, Rappi)',
    requires_feature: 'fulfillment_delivery',
    staff_requirements: [], // Sin staff propio
    additional_costs: [
      { type: 'percentage', name: 'Platform Commission', percentage: 0.25 }
    ]
  }
];

// Filtrar por features activas
function getActiveContexts(): DeliveryContext[] {
  return DELIVERY_CONTEXTS.filter(ctx => 
    featureEngine.isActive(ctx.requires_feature)
  );
}
```

### 9.3 Separación de Staff: Producción vs Servicio

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAFF DE PRODUCCIÓN vs STAFF DE SERVICIO                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRODUCCIÓN (fijo, independiente del contexto):                             │
│  ├── Se define en el producto                                              │
│  ├── Siempre se aplica                                                     │
│  └── Ejemplo: "Cocinero 10 min, Ayudante 5 min"                            │
│                                                                             │
│  SERVICIO (variable, depende del contexto):                                 │
│  ├── Se define en el contexto de servicio                                  │
│  ├── Se aplica según cómo se entrega                                       │
│  └── Ejemplo: "Mesero 5 min" solo para salón                               │
│                                                                             │
│  Modelo de datos:                                                           │
│                                                                             │
│  Product:                                                                   │
│  └── staff_allocations: StaffAllocation[]                                  │
│      └── Solo staff de PRODUCCIÓN                                          │
│                                                                             │
│  DeliveryContext:                                                           │
│  └── staff_requirements: ContextStaffRequirement[]                          │
│      └── Staff de SERVICIO por contexto                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. CONFIGURACIÓN DEL SISTEMA

### 10.1 Niveles de Configuración

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  JERARQUÍA DE CONFIGURACIÓN                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Nivel 1: DEFAULTS DEL SISTEMA                                              │
│  └── Valores por defecto hardcodeados                                      │
│      ├── labor_loaded_factor: 1.325                                        │
│      ├── overhead_percentage: 0.20                                         │
│      └── overhead_method: 'prime_cost_percentage'                          │
│                                                                             │
│  Nivel 2: CONFIGURACIÓN DE ORGANIZACIÓN                                     │
│  └── Settings globales de la empresa                                       │
│      ├── Override de loaded_factor                                         │
│      ├── Override de overhead                                              │
│      └── Configuración de contextos                                        │
│                                                                             │
│  Nivel 3: CONFIGURACIÓN POR CATEGORÍA                                       │
│  └── Settings por categoría de producto (opcional)                         │
│      └── Ej: "Bebidas" tiene overhead diferente que "Comidas"              │
│                                                                             │
│  Nivel 4: CONFIGURACIÓN POR PRODUCTO                                        │
│  └── Override específico del producto                                      │
│      └── Ej: "Producto premium" tiene overhead fijo especial               │
│                                                                             │
│  Resolución: Producto > Categoría > Organización > Sistema                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Estructura de Settings

```typescript
interface OrganizationCostSettings {
  // Labor settings
  labor: {
    default_loaded_factor: number;  // Default: 1.325
    factors_by_employment_type?: {
      full_time: number;
      part_time: number;
      contract: number;
      intern: number;
    };
  };
  
  // Overhead settings
  overhead: {
    method: 'none' | 'prime_cost_percentage' | 'labor_percentage' | 'fixed_per_unit' | 'abc';
    percentage?: number;          // Si method es *_percentage
    fixed_amount?: number;        // Si method es fixed_per_unit
    abc_config?: ABCConfig;       // Si method es abc
  };
  
  // Asset costing settings
  assets: {
    default_allocation_mode: 'overhead' | 'direct';
    depreciation_method: 'straight_line' | 'declining_balance' | 'units_of_production';
    include_maintenance: boolean;
    include_energy: boolean;
  };
  
  // Context settings
  contexts: {
    enabled: boolean;
    default_context: string;
  };
}

interface ABCConfig {
  pools: {
    id: string;
    name: string;
    monthly_amount: number;
    driver: 'labor_hours' | 'machine_hours' | 'units_produced' | 'square_feet';
  }[];
}
```

---

## 11. DECISIONES PENDIENTES

### 11.1 Staff/Labor

| # | Pregunta | Opciones | Decidido |
|---|----------|----------|----------|
| 1 | ¿Asignar roles o empleados específicos? | Ambos (flexible) | ✅ |
| 2 | ¿Dónde se configura loaded_factor? | staff_policies + override por rol/allocation | ✅ |
| 3 | ¿Cómo se separa staff producción vs servicio? | Producto vs Contexto | ✅ |
| 4 | ¿Qué campos expone StaffRole? | Ver Sección 5.5 | ✅ |
| 5 | ¿Se permite override de hourly_rate por producto? | Sí, en StaffAllocation | ✅ |
| 6 | ¿Tabla separada para staff_roles? | Sí, nueva tabla | ✅ |
| 7 | ¿Cómo conviven SystemRole y StaffRole? | Separados (Sección 3) | ✅ |
| 8 | ¿Employees pueden no tener acceso al panel? | Sí, user_id nullable | ✅ |

### 11.2 Assets

| # | Pregunta | Opciones | Decidido |
|---|----------|----------|----------|
| 1 | ¿Cómo se calcula depreciación? | Configurable (3 métodos) | ✅ |
| 2 | ¿Directo vs Overhead? | Configurable por asset | ✅ |
| 3 | ¿Incluir energía en costo horario? | Opcional | ✅ |
| 4 | ¿Incluir mantenimiento? | Opcional | ✅ |
| 5 | ¿Cómo se trackea el uso? | Por definir | ⏳ |

### 11.3 Overhead

| # | Pregunta | Opciones | Decidido |
|---|----------|----------|----------|
| 1 | ¿Qué métodos soportar inicialmente? | Simple % primero, ABC después | ✅ |
| 2 | ¿Dónde se configura? | Org settings | ✅ |
| 3 | ¿Override por categoría/producto? | Sí, opcional | ✅ |
| 4 | ¿Cómo manejar múltiples locations? | Por definir | ⏳ |

### 11.4 Contextos

| # | Pregunta | Opciones | Decidido |
|---|----------|----------|----------|
| 1 | ¿Contextos configurables? | Sí, basados en features | ✅ |
| 2 | ¿Cómo se heredan del Feature System? | Por feature requirement | ✅ |
| 3 | ¿Se pueden crear contextos custom? | Por definir | ⏳ |

---

## 12. PLAN DE IMPLEMENTACIÓN

### Fase 1: Fundamentos ✅ COMPLETADA
- [x] Crear documento de arquitectura (este documento)
- [x] Validar modelo conceptual
- [x] Definir arquitectura User vs Employee

### Fase 2: Staff/Labor ✅ DISEÑO COMPLETADO
- [x] Diseñar modelo de datos para StaffRole (Sección 5.1)
- [x] Diseñar modificaciones a employees (Sección 5.2)
- [x] Diseñar StaffAllocation interface (Sección 5.5)
- [x] Definir API pública del módulo Staff (Sección 5.8)
- [x] Definir jerarquía de loaded_factor (Sección 5.6)
- [x] Definir jerarquía de hourly_rate (Sección 5.7)
- [ ] Crear migración SQL
- [ ] Implementar tipos TypeScript
- [ ] Implementar Staff Module API
- [ ] Diseñar UI de asignación de staff a producto

### Fase 3: Assets
- [ ] Diseñar lógica de depreciación
- [ ] Diseñar AssetAllocation interface
- [ ] Definir API pública del módulo Assets
- [ ] Diseñar UI de asignación de assets a producto

### Fase 4: Overhead
- [ ] Diseñar configuración de overhead
- [ ] Implementar método simple (%)
- [ ] Diseñar UI de configuración

### Fase 5: Contextos
- [ ] Diseñar DeliveryContext model
- [ ] Integrar con Feature System
- [ ] Implementar cálculo por contexto

### Fase 6: ProductCostCalculator
- [ ] Unificar todos los componentes
- [ ] Crear engine de cálculo centralizado
- [ ] Diseñar UI de Cost Summary

### Fase 7: Testing y Refinamiento
- [ ] Tests de precisión decimal
- [ ] Tests de integración
- [ ] Validación con casos reales

---

## CHANGELOG

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.1.0 | 2026-01-06 | Agregado: Sección 3 (User vs Employee), Sección 5 (Staff/Labor diseño detallado), decisiones actualizadas |
| 1.0.0 | 2026-01-06 | Documento inicial con arquitectura base |

---

**FIN DEL DOCUMENTO**

> Este documento es un "living document" que se actualizará a medida que se tomen decisiones de diseño en cada fase.
