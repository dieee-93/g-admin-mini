-- ============================================================================
-- MIGRATION: Staff Roles and Labor Costing System
-- Date: 2026-01-06
-- Description: 
--   - Creates staff_roles table for job roles (separate from system roles)
--   - Adds user_id and staff_role_id to employees
--   - Adds FK constraint to product_staff_allocations
--   - Adds labor_costing_config to staff_policies
-- 
-- Related docs: docs/product/COSTING_ARCHITECTURE.md (Section 3 & 5)
-- ============================================================================

-- ============================================================================
-- 1. CREATE STAFF_ROLES TABLE
-- Purpose: Define job roles for labor costing (e.g., "Cocinero", "Mesero")
-- This is SEPARATE from system roles (ADMIN, SUPERVISOR, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.staff_roles (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  
  -- Role information
  name TEXT NOT NULL,
  department TEXT,
  description TEXT,
  
  -- Costing
  default_hourly_rate DECIMAL(10,2),
  loaded_factor DECIMAL(4,3) DEFAULT 1.0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT staff_roles_org_name_unique UNIQUE(organization_id, name)
);

-- Add comment explaining the purpose
COMMENT ON TABLE public.staff_roles IS 'Job roles for labor costing (e.g., Cocinero, Mesero). Separate from system access roles.';
COMMENT ON COLUMN public.staff_roles.loaded_factor IS 'Burden rate multiplier (1.325 = 32.5% for benefits/taxes). Default 1.0 means no burden.';
COMMENT ON COLUMN public.staff_roles.default_hourly_rate IS 'Base hourly rate for this role. Can be overridden per employee or allocation.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_roles_org ON public.staff_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_active ON public.staff_roles(organization_id, is_active) WHERE is_active = true;

-- ============================================================================
-- 2. MODIFY EMPLOYEES TABLE
-- Add staff_role_id (job role) and user_id (optional panel access)
-- ============================================================================

-- Add staff_role_id column (FK to staff_roles)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'staff_role_id'
  ) THEN
    ALTER TABLE public.employees 
    ADD COLUMN staff_role_id UUID REFERENCES public.staff_roles(id);
    
    COMMENT ON COLUMN public.employees.staff_role_id IS 'Job role for costing. FK to staff_roles.';
  END IF;
END $$;

-- Add user_id column (optional FK to auth.users for panel access)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.employees 
    ADD COLUMN user_id UUID REFERENCES auth.users(id);
    
    COMMENT ON COLUMN public.employees.user_id IS 'Optional link to auth.users. If set, employee can access the panel.';
  END IF;
END $$;

-- Add deprecation comment to legacy position column
-- Note: employees.role column does not exist in current schema (was in types only)
COMMENT ON COLUMN public.employees.position IS 'DEPRECATED: Use staff_roles.name for job title. Kept for backward compatibility.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_staff_role ON public.employees(staff_role_id) WHERE staff_role_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_user ON public.employees(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- 3. MODIFY PRODUCT_STAFF_ALLOCATIONS TABLE
-- Add proper FK to staff_roles and optional employee_id
-- ============================================================================

-- Add employee_id column (optional, for specific employee assignment)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'product_staff_allocations' 
    AND column_name = 'employee_id'
  ) THEN
    ALTER TABLE public.product_staff_allocations 
    ADD COLUMN employee_id UUID REFERENCES public.employees(id);
    
    COMMENT ON COLUMN public.product_staff_allocations.employee_id IS 'Optional specific employee. If null, uses role-based costing.';
  END IF;
END $$;

-- Add loaded_factor_override column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'product_staff_allocations' 
    AND column_name = 'loaded_factor_override'
  ) THEN
    ALTER TABLE public.product_staff_allocations 
    ADD COLUMN loaded_factor_override DECIMAL(4,3);
    
    COMMENT ON COLUMN public.product_staff_allocations.loaded_factor_override IS 'Override the loaded factor for this specific allocation.';
  END IF;
END $$;

-- Add FK constraint to staff_roles (role_id already exists but without FK)
-- First check if the constraint exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_product_staff_alloc_role' 
    AND table_name = 'product_staff_allocations'
  ) THEN
    -- Note: This may fail if there are orphan role_ids
    -- In that case, clean up orphan records first
    BEGIN
      ALTER TABLE public.product_staff_allocations 
      ADD CONSTRAINT fk_product_staff_alloc_role 
      FOREIGN KEY (role_id) REFERENCES public.staff_roles(id);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not add FK constraint fk_product_staff_alloc_role. Orphan role_ids may exist.';
    END;
  END IF;
END $$;

-- Index for role lookups
CREATE INDEX IF NOT EXISTS idx_product_staff_alloc_role ON public.product_staff_allocations(role_id);
CREATE INDEX IF NOT EXISTS idx_product_staff_alloc_employee ON public.product_staff_allocations(employee_id) WHERE employee_id IS NOT NULL;

-- ============================================================================
-- 4. ADD LABOR_COSTING_CONFIG TO STAFF_POLICIES
-- Stores organization-level labor costing configuration
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'staff_policies' 
    AND column_name = 'labor_costing_config'
  ) THEN
    ALTER TABLE public.staff_policies 
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
    
    COMMENT ON COLUMN public.staff_policies.labor_costing_config IS 'Labor costing configuration: loaded factors, precision settings.';
  END IF;
END $$;

-- ============================================================================
-- 5. CREATE UPDATED_AT TRIGGER FOR STAFF_ROLES
-- ============================================================================

-- Create or replace the trigger function (may already exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to staff_roles
DROP TRIGGER IF EXISTS update_staff_roles_updated_at ON public.staff_roles;
CREATE TRIGGER update_staff_roles_updated_at
  BEFORE UPDATE ON public.staff_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) FOR STAFF_ROLES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view staff_roles (read access for all authenticated)
DROP POLICY IF EXISTS "staff_roles_select_policy" ON public.staff_roles;
CREATE POLICY "staff_roles_select_policy" ON public.staff_roles
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert/update/delete
DROP POLICY IF EXISTS "staff_roles_modify_policy" ON public.staff_roles;
CREATE POLICY "staff_roles_modify_policy" ON public.staff_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('ADMINISTRADOR', 'SUPER_ADMIN')
      AND ur.is_active = true
    )
  );

-- ============================================================================
-- 7. SAMPLE DATA (Optional - uncomment to seed default roles)
-- ============================================================================

/*
-- Insert common staff roles (adjust organization_id as needed)
INSERT INTO public.staff_roles (organization_id, name, department, default_hourly_rate, loaded_factor, sort_order)
VALUES
  -- Kitchen roles
  ('YOUR_ORG_ID', 'Chef Principal', 'Cocina', 25.00, 1.35, 1),
  ('YOUR_ORG_ID', 'Cocinero', 'Cocina', 15.00, 1.30, 2),
  ('YOUR_ORG_ID', 'Ayudante de Cocina', 'Cocina', 10.00, 1.25, 3),
  
  -- Service roles
  ('YOUR_ORG_ID', 'Mesero', 'Servicio', 12.00, 1.25, 10),
  ('YOUR_ORG_ID', 'Cajero', 'Servicio', 13.00, 1.25, 11),
  ('YOUR_ORG_ID', 'Repartidor', 'Delivery', 11.00, 1.20, 12),
  
  -- Management
  ('YOUR_ORG_ID', 'Gerente de Turno', 'Gerencia', 20.00, 1.40, 20),
  ('YOUR_ORG_ID', 'Supervisor', 'Gerencia', 18.00, 1.35, 21)
ON CONFLICT (organization_id, name) DO NOTHING;
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- 
-- Next steps:
-- 1. Run this migration on your database
-- 2. Populate staff_roles with your organization's job roles
-- 3. Update employees to link to staff_roles via staff_role_id
-- 4. Optionally link employees to auth.users via user_id for panel access
-- 5. Clean up orphan role_ids in product_staff_allocations if FK failed
-- ============================================================================
