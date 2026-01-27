-- =============================================================================
-- Migration: Add Labor Fields to Employees (Team Members)
-- =============================================================================
-- Adds fields for employment type, experience level, job role assignment,
-- and labor costing to employees table.
--
-- Date: 2026-01-14
-- Phase: 1 - Critical Fields (P0)
-- Author: G-Admin Mini Team
--
-- NOMENCLATURE NOTE:
-- - DB table: "employees" (unchanged for compatibility)
-- - Code alias: TeamMember (preferred in new code)
-- - UI Spanish: "Miembro del Equipo" / "Equipo"
--
-- References:
-- - docs/staff/PROPUESTA_CAMPOS_EMPLOYEE.md
-- - docs/staff/PROPUESTA_UNIFICACION_NOMENCLATURA.md
-- - src/modules/staff/types/staffRole.ts
-- =============================================================================

BEGIN;

-- =============================================================================
-- ADD NEW COLUMNS
-- =============================================================================

ALTER TABLE employees
  -- Job Role Assignment (CRITICAL)
  ADD COLUMN IF NOT EXISTS job_role_id UUID REFERENCES staff_roles(id) ON DELETE SET NULL,

  -- Employment Type (improved with Argentina values)
  -- Note: employment_type may already exist, we'll update the constraint
  ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'full_time_employee',

  -- Experience Level
  ADD COLUMN IF NOT EXISTS experience_level TEXT,

  -- Labor Costing Override
  ADD COLUMN IF NOT EXISTS loaded_factor_override NUMERIC(5,2),

  -- Argentina Specific - Fiscal Data
  ADD COLUMN IF NOT EXISTS cuit_cuil TEXT,
  ADD COLUMN IF NOT EXISTS afip_category TEXT,
  ADD COLUMN IF NOT EXISTS invoice_required BOOLEAN DEFAULT false;

-- =============================================================================
-- UPDATE CONSTRAINTS
-- =============================================================================

-- Drop old employment_type constraint if exists
ALTER TABLE employees
  DROP CONSTRAINT IF EXISTS chk_employees_employment_type,
  DROP CONSTRAINT IF EXISTS employees_employment_type_check;

-- Add new employment_type constraint with Argentina values
ALTER TABLE employees
  ADD CONSTRAINT chk_employees_employment_type
    CHECK (employment_type IN (
      'full_time_employee',      -- Relación dependencia - jornada completa
      'part_time_employee',      -- Relación dependencia - jornada parcial
      'contractor_monotributo',  -- Monotributista
      'contractor_responsable',  -- Responsable Inscripto
      'intern',                  -- Pasante
      'temporary',               -- Temporario/eventual
      'informal',                -- Trabajador informal
      -- Legacy values for backwards compatibility
      'full_time',
      'part_time',
      'contract'
    ));

-- Experience Level Constraint
ALTER TABLE employees
  DROP CONSTRAINT IF EXISTS chk_employees_experience_level;

ALTER TABLE employees
  ADD CONSTRAINT chk_employees_experience_level
    CHECK (experience_level IS NULL OR experience_level IN (
      'trainee',      -- 0-6 meses
      'junior',       -- 6-24 meses
      'semi_senior',  -- 2-5 años
      'senior',       -- 5-10 años
      'expert'        -- 10+ años
    ));

-- Loaded Factor Override Constraint
ALTER TABLE employees
  DROP CONSTRAINT IF EXISTS chk_employees_loaded_factor;

ALTER TABLE employees
  ADD CONSTRAINT chk_employees_loaded_factor_override
    CHECK (loaded_factor_override IS NULL OR
           (loaded_factor_override >= 1.0 AND loaded_factor_override <= 3.0));

-- CUIT/CUIL Format Validation (basic)
ALTER TABLE employees
  DROP CONSTRAINT IF EXISTS chk_employees_cuit_cuil;

ALTER TABLE employees
  ADD CONSTRAINT chk_employees_cuit_cuil
    CHECK (cuit_cuil IS NULL OR cuit_cuil ~ '^\d{2}-\d{8}-\d{1}$');

-- =============================================================================
-- ADD INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for job role assignment (critical for queries)
CREATE INDEX IF NOT EXISTS idx_employees_job_role_id
  ON employees(job_role_id)
  WHERE job_role_id IS NOT NULL;

-- Index for employment type filtering
CREATE INDEX IF NOT EXISTS idx_employees_employment_type
  ON employees(employment_type)
  WHERE employment_type IS NOT NULL;

-- Index for experience level filtering
CREATE INDEX IF NOT EXISTS idx_employees_experience_level
  ON employees(experience_level)
  WHERE experience_level IS NOT NULL;

-- Index for CUIT/CUIL lookups (unique tax ID)
CREATE INDEX IF NOT EXISTS idx_employees_cuit_cuil
  ON employees(cuit_cuil)
  WHERE cuit_cuil IS NOT NULL;

-- =============================================================================
-- ADD COLUMN COMMENTS (Documentation)
-- =============================================================================

COMMENT ON COLUMN employees.job_role_id IS
  'FK to staff_roles (job roles). Assigns team member to a job role template.';

COMMENT ON COLUMN employees.employment_type IS
  'Tipo de contratación según legislación argentina. Determines loaded factor for labor costing.';

COMMENT ON COLUMN employees.experience_level IS
  'Nivel de experiencia del miembro del equipo. Affects productivity estimations.';

COMMENT ON COLUMN employees.loaded_factor_override IS
  'Override del factor de carga. Si NULL, usa el del employment_type o job_role.';

COMMENT ON COLUMN employees.cuit_cuil IS
  'CUIT/CUIL del empleado (formato: XX-XXXXXXXX-X)';

COMMENT ON COLUMN employees.afip_category IS
  'Categoría AFIP (solo para monotributistas: A, B, C, etc.)';

COMMENT ON COLUMN employees.invoice_required IS
  'Si TRUE, el empleado debe presentar factura mensual (contratistas)';

-- =============================================================================
-- MIGRATE LEGACY DATA
-- =============================================================================

-- Update legacy employment_type values to new format
UPDATE employees
SET employment_type = CASE employment_type
  WHEN 'full_time' THEN 'full_time_employee'
  WHEN 'part_time' THEN 'part_time_employee'
  WHEN 'contract' THEN 'contractor_monotributo'
  ELSE employment_type
END
WHERE employment_type IN ('full_time', 'part_time', 'contract');

-- =============================================================================
-- CREATE HELPER FUNCTION: Get Effective Loaded Factor
-- =============================================================================

CREATE OR REPLACE FUNCTION get_effective_loaded_factor_for_employee(
  p_employee_id UUID
)
RETURNS NUMERIC(5,2)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_loaded_factor NUMERIC(5,2);
  v_override NUMERIC(5,2);
  v_employment_type TEXT;
  v_job_role_factor NUMERIC(5,2);
BEGIN
  -- Get employee data
  SELECT
    e.loaded_factor_override,
    e.employment_type,
    sr.loaded_factor
  INTO
    v_override,
    v_employment_type,
    v_job_role_factor
  FROM employees e
  LEFT JOIN staff_roles sr ON e.job_role_id = sr.id
  WHERE e.id = p_employee_id;

  -- Priority 1: Override específico del empleado
  IF v_override IS NOT NULL THEN
    RETURN v_override;
  END IF;

  -- Priority 2: Factor según tipo de empleo
  IF v_employment_type IS NOT NULL THEN
    v_loaded_factor := CASE v_employment_type
      WHEN 'full_time_employee' THEN 1.50
      WHEN 'part_time_employee' THEN 1.40
      WHEN 'contractor_monotributo' THEN 1.10
      WHEN 'contractor_responsable' THEN 1.20
      WHEN 'intern' THEN 1.05
      WHEN 'temporary' THEN 1.35
      WHEN 'informal' THEN 1.00
      ELSE NULL
    END;

    IF v_loaded_factor IS NOT NULL THEN
      RETURN v_loaded_factor;
    END IF;
  END IF;

  -- Priority 3: Factor del job role asignado
  IF v_job_role_factor IS NOT NULL THEN
    RETURN v_job_role_factor;
  END IF;

  -- Priority 4: Default de Argentina
  RETURN 1.40;
END;
$$;

COMMENT ON FUNCTION get_effective_loaded_factor_for_employee IS
  'Retorna el factor de carga efectivo para un empleado según prioridad: override > employment_type > job_role > default';

-- =============================================================================
-- CREATE VIEW: Team Members with Calculated Fields
-- =============================================================================

CREATE OR REPLACE VIEW team_members_with_calculations AS
SELECT
  e.*,

  -- Job Role Info (denormalized)
  sr.name AS job_role_name,
  sr.department AS job_role_department,
  sr.labor_category AS job_role_labor_category,
  sr.applicable_convention AS job_role_convention,

  -- Effective Loaded Factor
  get_effective_loaded_factor_for_employee(e.id) AS effective_loaded_factor,

  -- Loaded Hourly Cost
  COALESCE(e.hourly_rate, sr.default_hourly_rate, 0) *
    get_effective_loaded_factor_for_employee(e.id) AS loaded_hourly_cost,

  -- Productivity Factor (based on experience)
  CASE e.experience_level
    WHEN 'trainee' THEN 0.5
    WHEN 'junior' THEN 0.7
    WHEN 'semi_senior' THEN 1.0
    WHEN 'senior' THEN 1.3
    WHEN 'expert' THEN 1.5
    ELSE 1.0
  END AS productivity_factor,

  -- Productivity Adjusted Cost
  (COALESCE(e.hourly_rate, sr.default_hourly_rate, 0) *
    get_effective_loaded_factor_for_employee(e.id)) /
    NULLIF(CASE e.experience_level
      WHEN 'trainee' THEN 0.5
      WHEN 'junior' THEN 0.7
      WHEN 'semi_senior' THEN 1.0
      WHEN 'senior' THEN 1.3
      WHEN 'expert' THEN 1.5
      ELSE 1.0
    END, 0) AS productivity_adjusted_cost

FROM employees e
LEFT JOIN staff_roles sr ON e.job_role_id = sr.id;

COMMENT ON VIEW team_members_with_calculations IS
  'Vista de employees (team members) con campos calculados para costeo y productividad';

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant usage on new function
GRANT EXECUTE ON FUNCTION get_effective_loaded_factor_for_employee(UUID) TO authenticated;

-- Grant access to view
GRANT SELECT ON team_members_with_calculations TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

COMMIT;

-- =============================================================================
-- VERIFICATION QUERIES (for testing)
-- =============================================================================

-- Check new columns exist
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'employees'
-- AND column_name IN (
--   'job_role_id', 'experience_level', 'loaded_factor_override',
--   'cuit_cuil', 'afip_category', 'invoice_required'
-- )
-- ORDER BY ordinal_position;

-- Test effective loaded factor function
-- SELECT
--   id,
--   first_name,
--   last_name,
--   employment_type,
--   loaded_factor_override,
--   get_effective_loaded_factor_for_employee(id) as effective_factor
-- FROM employees
-- LIMIT 5;

-- View sample data with calculations
-- SELECT
--   first_name,
--   last_name,
--   job_role_name,
--   employment_type,
--   experience_level,
--   effective_loaded_factor,
--   loaded_hourly_cost,
--   productivity_factor
-- FROM team_members_with_calculations
-- LIMIT 5;
