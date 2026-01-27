-- =============================================================================
-- Migration: Rename staff_roles → job_roles
-- =============================================================================
-- Part of the nomenclature unification refactoring.
-- Renames the staff_roles table to job_roles to better reflect its purpose
-- as job role templates, not individual staff members.
--
-- Date: 2026-01-15
-- Author: G-Admin Mini Team
--
-- NOMENCLATURE CHANGE:
-- - OLD: staff_roles (confusing - sounds like "staff member roles")
-- - NEW: job_roles (clear - job position templates)
--
-- References:
-- - docs/staff/PROPUESTA_UNIFICACION_NOMENCLATURA.md
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. RENAME TABLE
-- =============================================================================

ALTER TABLE staff_roles RENAME TO job_roles;

-- =============================================================================
-- 2. RENAME INDEXES
-- =============================================================================

-- Primary key index
ALTER INDEX IF EXISTS staff_roles_pkey RENAME TO job_roles_pkey;

-- Custom indexes
ALTER INDEX IF EXISTS idx_staff_roles_organization_id RENAME TO idx_job_roles_organization_id;
ALTER INDEX IF EXISTS idx_staff_roles_is_active RENAME TO idx_job_roles_is_active;
ALTER INDEX IF EXISTS idx_staff_roles_labor_category RENAME TO idx_job_roles_labor_category;

-- =============================================================================
-- 3. RENAME CONSTRAINTS
-- =============================================================================

-- Foreign key constraints
ALTER TABLE job_roles
  RENAME CONSTRAINT staff_roles_organization_id_fkey TO job_roles_organization_id_fkey;

-- Check constraints (if any)
ALTER TABLE job_roles
  RENAME CONSTRAINT IF EXISTS chk_staff_roles_loaded_factor TO chk_job_roles_loaded_factor;

-- =============================================================================
-- 4. RENAME SEQUENCES
-- =============================================================================

-- If there's an auto-incrementing column (unlikely with UUID, but just in case)
-- ALTER SEQUENCE IF EXISTS staff_roles_id_seq RENAME TO job_roles_id_seq;

-- =============================================================================
-- 5. UPDATE RLS POLICIES
-- =============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view staff_roles in their organization" ON job_roles;
DROP POLICY IF EXISTS "Users can insert staff_roles in their organization" ON job_roles;
DROP POLICY IF EXISTS "Users can update staff_roles in their organization" ON job_roles;
DROP POLICY IF EXISTS "Users can delete staff_roles in their organization" ON job_roles;

-- Recreate with new names
CREATE POLICY "Users can view job_roles in their organization"
  ON job_roles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert job_roles in their organization"
  ON job_roles FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update job_roles in their organization"
  ON job_roles FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete job_roles in their organization"
  ON job_roles FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- 6. UPDATE COMMENTS
-- =============================================================================

COMMENT ON TABLE job_roles IS
  'Job role templates (e.g., "Cocinero", "Mesero"). Defines default rates and labor categories for positions. NOT individual team members.';

-- =============================================================================
-- 7. UPDATE VIEWS THAT REFERENCE staff_roles
-- =============================================================================

-- If there are any views, they need to be recreated
-- Example (adjust based on actual views in your schema):
-- DROP VIEW IF EXISTS staff_roles_with_calculations;
-- CREATE VIEW job_roles_with_calculations AS
--   SELECT * FROM job_roles;

-- =============================================================================
-- 8. VERIFY FOREIGN KEYS FROM OTHER TABLES
-- =============================================================================

-- Check if employees table references staff_roles
-- This will be handled in the next migration (007_rename_employees_to_team_members.sql)
-- but we verify here that the FK still works after rename

-- The FK constraint automatically updates its reference when we rename the table,
-- so employees.job_role_id will still point to the correct table

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

COMMIT;

-- =============================================================================
-- VERIFICATION QUERIES (for testing)
-- =============================================================================

-- Check table exists with new name
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name = 'job_roles';

-- Check indexes
-- SELECT indexname FROM pg_indexes
-- WHERE tablename = 'job_roles';

-- Check constraints
-- SELECT constraint_name FROM information_schema.table_constraints
-- WHERE table_name = 'job_roles';

-- Check RLS policies
-- SELECT policyname FROM pg_policies WHERE tablename = 'job_roles';
