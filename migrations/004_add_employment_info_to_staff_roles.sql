-- =============================================================================
-- Migration: Add Employment Information to Staff Roles (Phase 1)
-- =============================================================================
-- Adds fields for employment type, labor category, and experience level
-- to staff_roles table for better labor costing in Argentina context.
--
-- Date: 2026-01-14
-- Phase: 1 - Critical Fields
-- Author: G-Admin Mini Team
--
-- References:
-- - docs/staff/ROLES_DE_TRABAJO_ANALISIS.md
-- - src/modules/staff/types/staffRole.ts
-- =============================================================================

BEGIN;

-- =============================================================================
-- ADD NEW COLUMNS
-- =============================================================================

ALTER TABLE staff_roles
  -- Phase 1: Employment Information (Critical)
  ADD COLUMN IF NOT EXISTS employment_type TEXT NOT NULL DEFAULT 'full_time_employee',
  ADD COLUMN IF NOT EXISTS labor_category TEXT,
  ADD COLUMN IF NOT EXISTS applicable_convention TEXT,
  ADD COLUMN IF NOT EXISTS experience_level TEXT;

-- =============================================================================
-- ADD CONSTRAINTS
-- =============================================================================

-- Employment Type Constraint
ALTER TABLE staff_roles
  DROP CONSTRAINT IF EXISTS chk_staff_roles_employment_type;

ALTER TABLE staff_roles
  ADD CONSTRAINT chk_staff_roles_employment_type
    CHECK (employment_type IN (
      'full_time_employee',      -- Relación de dependencia - jornada completa
      'part_time_employee',      -- Relación de dependencia - jornada parcial
      'contractor_monotributo',  -- Monotributista
      'contractor_responsable',  -- Contratado - Responsable inscripto
      'intern',                  -- Pasante
      'temporary'                -- Temporario/eventual
    ));

-- Experience Level Constraint
ALTER TABLE staff_roles
  DROP CONSTRAINT IF EXISTS chk_staff_roles_experience_level;

ALTER TABLE staff_roles
  ADD CONSTRAINT chk_staff_roles_experience_level
    CHECK (experience_level IS NULL OR experience_level IN (
      'trainee',      -- 0-6 meses de experiencia
      'junior',       -- 6-24 meses de experiencia
      'semi_senior',  -- 2-5 años de experiencia
      'senior',       -- 5-10 años de experiencia
      'expert'        -- 10+ años de experiencia
    ));

-- =============================================================================
-- ADD INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for filtering by employment type
CREATE INDEX IF NOT EXISTS idx_staff_roles_employment_type
  ON staff_roles(employment_type)
  WHERE is_active = true;

-- Index for filtering by experience level
CREATE INDEX IF NOT EXISTS idx_staff_roles_experience_level
  ON staff_roles(experience_level)
  WHERE is_active = true AND experience_level IS NOT NULL;

-- Index for labor category searches (for autocomplete)
CREATE INDEX IF NOT EXISTS idx_staff_roles_labor_category
  ON staff_roles(labor_category)
  WHERE labor_category IS NOT NULL;

-- Index for convention searches (for autocomplete)
CREATE INDEX IF NOT EXISTS idx_staff_roles_applicable_convention
  ON staff_roles(applicable_convention)
  WHERE applicable_convention IS NOT NULL;

-- =============================================================================
-- ADD COLUMN COMMENTS (Documentation)
-- =============================================================================

COMMENT ON COLUMN staff_roles.employment_type IS
  'Tipo de contratación según legislación argentina. Afecta cálculo de cargas sociales.';

COMMENT ON COLUMN staff_roles.labor_category IS
  'Categoría laboral según convenio colectivo (ej: "Cocinero 3ra categoría", "Vendedor especializado")';

COMMENT ON COLUMN staff_roles.applicable_convention IS
  'Convenio colectivo de trabajo aplicable (ej: "CCT 130/75 - Comercio", "CCT 389/04 - Gastronómicos")';

COMMENT ON COLUMN staff_roles.experience_level IS
  'Nivel de experiencia del rol. Afecta productividad y estimaciones de tiempo.';

-- =============================================================================
-- UPDATE EXISTING ROWS WITH SENSIBLE DEFAULTS
-- =============================================================================

-- Update loaded_factor based on new employment_type for existing roles
-- Only update if loaded_factor is still at default (1.0)
UPDATE staff_roles
SET loaded_factor = CASE employment_type
  WHEN 'full_time_employee' THEN 1.50      -- 50% adicional
  WHEN 'part_time_employee' THEN 1.40      -- 40% adicional
  WHEN 'contractor_monotributo' THEN 1.10  -- 10% adicional
  WHEN 'contractor_responsable' THEN 1.20  -- 20% adicional
  WHEN 'intern' THEN 1.05                  -- 5% adicional
  WHEN 'temporary' THEN 1.35               -- 35% adicional
  ELSE loaded_factor
END
WHERE loaded_factor = 1.0;

-- =============================================================================
-- CREATE HELPER FUNCTION: Get Suggested Loaded Factor
-- =============================================================================

CREATE OR REPLACE FUNCTION get_suggested_loaded_factor(p_employment_type TEXT)
RETURNS NUMERIC(5,2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE p_employment_type
    WHEN 'full_time_employee' THEN 1.50
    WHEN 'part_time_employee' THEN 1.40
    WHEN 'contractor_monotributo' THEN 1.10
    WHEN 'contractor_responsable' THEN 1.20
    WHEN 'intern' THEN 1.05
    WHEN 'temporary' THEN 1.35
    ELSE 1.30  -- default fallback
  END;
END;
$$;

COMMENT ON FUNCTION get_suggested_loaded_factor IS
  'Retorna el factor de carga sugerido según tipo de contratación para Argentina (2026)';

-- =============================================================================
-- CREATE HELPER FUNCTION: Get Productivity Factor by Experience
-- =============================================================================

CREATE OR REPLACE FUNCTION get_productivity_factor(p_experience_level TEXT)
RETURNS NUMERIC(3,2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE p_experience_level
    WHEN 'trainee' THEN 0.50      -- 50% productivity (learning)
    WHEN 'junior' THEN 0.70       -- 70% productivity
    WHEN 'semi_senior' THEN 1.00  -- 100% baseline
    WHEN 'senior' THEN 1.30       -- 130% productivity (experience)
    WHEN 'expert' THEN 1.50       -- 150% productivity (mastery)
    ELSE 1.00  -- default baseline
  END;
END;
$$;

COMMENT ON FUNCTION get_productivity_factor IS
  'Retorna el multiplicador de productividad según nivel de experiencia';

-- =============================================================================
-- CREATE VIEW: Staff Roles with Calculated Fields
-- =============================================================================

CREATE OR REPLACE VIEW staff_roles_with_calculations AS
SELECT
  sr.*,
  -- Loaded hourly cost (already exists)
  COALESCE(sr.default_hourly_rate, 0) * sr.loaded_factor AS loaded_hourly_cost,

  -- Suggested loaded factor for comparison
  get_suggested_loaded_factor(sr.employment_type) AS suggested_loaded_factor,

  -- Productivity factor based on experience
  get_productivity_factor(sr.experience_level) AS productivity_factor,

  -- Effective hourly rate adjusted by productivity
  CASE
    WHEN sr.experience_level IS NOT NULL AND sr.default_hourly_rate IS NOT NULL
    THEN (sr.default_hourly_rate * sr.loaded_factor) / get_productivity_factor(sr.experience_level)
    ELSE sr.default_hourly_rate * sr.loaded_factor
  END AS productivity_adjusted_cost
FROM staff_roles sr;

COMMENT ON VIEW staff_roles_with_calculations IS
  'Vista de staff_roles con campos calculados para costeo y productividad';

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant usage on new functions
GRANT EXECUTE ON FUNCTION get_suggested_loaded_factor(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_productivity_factor(TEXT) TO authenticated;

-- Grant access to view
GRANT SELECT ON staff_roles_with_calculations TO authenticated;

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
-- WHERE table_name = 'staff_roles'
-- AND column_name IN ('employment_type', 'labor_category', 'applicable_convention', 'experience_level')
-- ORDER BY ordinal_position;

-- Check constraints
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'staff_roles'::regclass
-- AND conname LIKE '%employment%' OR conname LIKE '%experience%';

-- Test helper functions
-- SELECT
--   get_suggested_loaded_factor('full_time_employee') as full_time_factor,
--   get_suggested_loaded_factor('contractor_monotributo') as monotributo_factor,
--   get_productivity_factor('trainee') as trainee_productivity,
--   get_productivity_factor('senior') as senior_productivity;

-- View sample data
-- SELECT * FROM staff_roles_with_calculations LIMIT 5;
