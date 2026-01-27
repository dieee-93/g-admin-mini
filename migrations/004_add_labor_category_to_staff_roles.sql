-- =============================================================================
-- Migration: Add Labor Category Information to Staff Roles
-- =============================================================================
-- Adds fields for labor category and applicable convention to staff_roles
-- table for Argentina labor law compliance.
--
-- Date: 2026-01-14
-- Phase: 1 - Labor Category Fields
-- Author: G-Admin Mini Team
--
-- IMPORTANT: This migration adds fields to the STAFF ROLE (template/category).
-- Individual employee-specific fields (employment_type, experience_level) are
-- stored in the employees table, NOT in staff_roles.
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
  -- Labor Category Information (Argentina specific)
  ADD COLUMN IF NOT EXISTS labor_category TEXT,
  ADD COLUMN IF NOT EXISTS applicable_convention TEXT;

-- =============================================================================
-- ADD INDEXES FOR PERFORMANCE
-- =============================================================================

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

COMMENT ON COLUMN staff_roles.labor_category IS
  'Categoría laboral según convenio colectivo (ej: "Cocinero 3ra categoría", "Vendedor especializado")';

COMMENT ON COLUMN staff_roles.applicable_convention IS
  'Convenio colectivo de trabajo aplicable (ej: "CCT 130/75 - Comercio", "CCT 389/04 - Gastronómicos")';

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Ensure authenticated users can read these new columns
-- (No special permissions needed, inherits from table permissions)

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
-- AND column_name IN ('labor_category', 'applicable_convention')
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'staff_roles'
-- AND indexname LIKE '%labor%' OR indexname LIKE '%convention%';

-- View sample data
-- SELECT id, name, labor_category, applicable_convention, loaded_factor
-- FROM staff_roles
-- LIMIT 5;
