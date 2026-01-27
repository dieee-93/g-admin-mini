-- =============================================================================
-- Migration: Rename employees → team_members
-- =============================================================================
-- Part of the nomenclature unification refactoring.
-- Renames the employees table to team_members to better reflect the inclusive
-- nature of the entity and align with the new naming convention.
--
-- Date: 2026-01-15
-- Author: G-Admin Mini Team
--
-- NOMENCLATURE CHANGE:
-- - OLD: employees (too formal, suggests only employees)
-- - NEW: team_members (inclusive, covers all types: employees, contractors, etc.)
--
-- References:
-- - docs/staff/PROPUESTA_UNIFICACION_NOMENCLATURA.md
-- - migrations/006_rename_staff_roles_to_job_roles.sql (prerequisite)
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. RENAME TABLE
-- =============================================================================

ALTER TABLE employees RENAME TO team_members;

-- =============================================================================
-- 2. RENAME INDEXES
-- =============================================================================

-- Primary key
ALTER INDEX IF EXISTS employees_pkey RENAME TO team_members_pkey;

-- Foreign key indexes
ALTER INDEX IF EXISTS idx_employees_organization_id RENAME TO idx_team_members_organization_id;
ALTER INDEX IF EXISTS idx_employees_user_id RENAME TO idx_team_members_user_id;
ALTER INDEX IF EXISTS idx_employees_job_role_id RENAME TO idx_team_members_job_role_id;

-- Status and filtering indexes
ALTER INDEX IF EXISTS idx_employees_is_active RENAME TO idx_team_members_is_active;
ALTER INDEX IF EXISTS idx_employees_employment_type RENAME TO idx_team_members_employment_type;
ALTER INDEX IF EXISTS idx_employees_experience_level RENAME TO idx_team_members_experience_level;

-- Unique identifier indexes
ALTER INDEX IF EXISTS idx_employees_cuit_cuil RENAME TO idx_team_members_cuit_cuil;
ALTER INDEX IF EXISTS idx_employees_email RENAME TO idx_team_members_email;

-- =============================================================================
-- 3. RENAME CONSTRAINTS
-- =============================================================================

-- Foreign key constraints
ALTER TABLE team_members
  RENAME CONSTRAINT IF EXISTS employees_organization_id_fkey TO team_members_organization_id_fkey;

ALTER TABLE team_members
  RENAME CONSTRAINT IF EXISTS employees_user_id_fkey TO team_members_user_id_fkey;

ALTER TABLE team_members
  RENAME CONSTRAINT IF EXISTS employees_job_role_id_fkey TO team_members_job_role_id_fkey;

-- Check constraints
ALTER TABLE team_members
  RENAME CONSTRAINT IF EXISTS chk_employees_employment_type TO chk_team_members_employment_type;

ALTER TABLE team_members
  RENAME CONSTRAINT IF EXISTS chk_employees_experience_level TO chk_team_members_experience_level;

ALTER TABLE team_members
  RENAME CONSTRAINT IF EXISTS chk_employees_loaded_factor_override TO chk_team_members_loaded_factor_override;

ALTER TABLE team_members
  RENAME CONSTRAINT IF EXISTS chk_employees_cuit_cuil TO chk_team_members_cuit_cuil;

-- =============================================================================
-- 4. RENAME SEQUENCES
-- =============================================================================

-- If there's an auto-incrementing column (unlikely with UUID, but just in case)
-- ALTER SEQUENCE IF EXISTS employees_id_seq RENAME TO team_members_id_seq;

-- =============================================================================
-- 5. UPDATE RLS POLICIES
-- =============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view employees in their organization" ON team_members;
DROP POLICY IF EXISTS "Users can insert employees in their organization" ON team_members;
DROP POLICY IF EXISTS "Users can update employees in their organization" ON team_members;
DROP POLICY IF EXISTS "Users can delete employees in their organization" ON team_members;

-- Recreate with new names
CREATE POLICY "Users can view team_members in their organization"
  ON team_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert team_members in their organization"
  ON team_members FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update team_members in their organization"
  ON team_members FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete team_members in their organization"
  ON team_members FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- 6. UPDATE FUNCTIONS THAT REFERENCE employees
-- =============================================================================

-- Update the function created in migration 005
DROP FUNCTION IF EXISTS get_effective_loaded_factor_for_employee(UUID);

CREATE OR REPLACE FUNCTION get_effective_loaded_factor_for_team_member(
  p_team_member_id UUID
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
  -- Get team member data
  SELECT
    tm.loaded_factor_override,
    tm.employment_type,
    jr.loaded_factor
  INTO
    v_override,
    v_employment_type,
    v_job_role_factor
  FROM team_members tm
  LEFT JOIN job_roles jr ON tm.job_role_id = jr.id
  WHERE tm.id = p_team_member_id;

  -- Priority 1: Override específico del team member
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

COMMENT ON FUNCTION get_effective_loaded_factor_for_team_member IS
  'Retorna el factor de carga efectivo para un team member según prioridad: override > employment_type > job_role > default';

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_effective_loaded_factor_for_team_member(UUID) TO authenticated;

-- =============================================================================
-- 7. UPDATE VIEWS
-- =============================================================================

-- Drop old view
DROP VIEW IF EXISTS team_members_with_calculations;

-- Recreate view with new table names
CREATE OR REPLACE VIEW team_members_with_calculations AS
SELECT
  tm.*,

  -- Job Role Info (denormalized)
  jr.name AS job_role_name,
  jr.department AS job_role_department,
  jr.labor_category AS job_role_labor_category,
  jr.applicable_convention AS job_role_convention,

  -- Effective Loaded Factor
  get_effective_loaded_factor_for_team_member(tm.id) AS effective_loaded_factor,

  -- Loaded Hourly Cost
  COALESCE(tm.hourly_rate, jr.default_hourly_rate, 0) *
    get_effective_loaded_factor_for_team_member(tm.id) AS loaded_hourly_cost,

  -- Productivity Factor (based on experience)
  CASE tm.experience_level
    WHEN 'trainee' THEN 0.5
    WHEN 'junior' THEN 0.7
    WHEN 'semi_senior' THEN 1.0
    WHEN 'senior' THEN 1.3
    WHEN 'expert' THEN 1.5
    ELSE 1.0
  END AS productivity_factor,

  -- Productivity Adjusted Cost
  (COALESCE(tm.hourly_rate, jr.default_hourly_rate, 0) *
    get_effective_loaded_factor_for_team_member(tm.id)) /
    NULLIF(CASE tm.experience_level
      WHEN 'trainee' THEN 0.5
      WHEN 'junior' THEN 0.7
      WHEN 'semi_senior' THEN 1.0
      WHEN 'senior' THEN 1.3
      WHEN 'expert' THEN 1.5
      ELSE 1.0
    END, 0) AS productivity_adjusted_cost

FROM team_members tm
LEFT JOIN job_roles jr ON tm.job_role_id = jr.id;

COMMENT ON VIEW team_members_with_calculations IS
  'Vista de team_members con campos calculados para costeo y productividad';

-- Grant permissions
GRANT SELECT ON team_members_with_calculations TO authenticated;

-- =============================================================================
-- 8. UPDATE FOREIGN KEYS FROM OTHER TABLES
-- =============================================================================

-- This will automatically update FKs that point to employees table
-- We need to identify all tables with FKs to employees:

-- Common tables that might reference employees:
-- - shifts (if exists)
-- - appointments (if exists)
-- - staff_allocations (for products)
-- - time_off_requests (if exists)
-- - schedules (if exists)

-- The FK constraints automatically update their reference when we rename the table

-- =============================================================================
-- 9. UPDATE COMMENTS
-- =============================================================================

COMMENT ON TABLE team_members IS
  'Team members (individuals) - includes employees, contractors, interns, etc. Each team member can be assigned to a job role template.';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

COMMIT;

-- =============================================================================
-- VERIFICATION QUERIES (for testing)
-- =============================================================================

-- Check table exists with new name
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name = 'team_members';

-- Check indexes
-- SELECT indexname FROM pg_indexes
-- WHERE tablename = 'team_members';

-- Check constraints
-- SELECT constraint_name FROM information_schema.table_constraints
-- WHERE table_name = 'team_members';

-- Check RLS policies
-- SELECT policyname FROM pg_policies WHERE tablename = 'team_members';

-- Check foreign key references TO team_members
-- SELECT
--   tc.table_name,
--   tc.constraint_name,
--   kcu.column_name
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.key_column_usage kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND ccu.table_name = 'team_members';
