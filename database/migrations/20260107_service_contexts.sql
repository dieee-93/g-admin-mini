-- ============================================================================
-- MIGRATION: Service Contexts for Product Costing
-- Date: 2026-01-07
-- Description: 
--   - Creates service_contexts table for delivery/fulfillment context costing
--   - Creates context_staff_requirements table for service staff per context
--   - Creates context_additional_costs table for extra costs per context
-- 
-- Purpose:
--   Service contexts define different ways a product can be delivered/served
--   (dine-in, takeaway, delivery, etc.) with associated service costs.
--   This is for COSTING, separate from FulfillmentPolicies (operations).
--
-- Related docs: docs/product/COSTING_ARCHITECTURE.md (Section 9)
-- ============================================================================

-- ============================================================================
-- 1. CREATE SERVICE_CONTEXTS TABLE
-- Purpose: Define delivery/service contexts for product costing
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.service_contexts (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  
  -- Context identification
  key TEXT NOT NULL,                              -- Unique key: 'dine_in', 'takeaway', etc.
  name TEXT NOT NULL,                             -- Display name: 'Salón', 'Para llevar'
  description TEXT,
  
  -- Feature dependency (optional)
  requires_feature TEXT,                          -- Feature key that must be active
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,               -- Default context for new orders
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT service_contexts_org_key_unique UNIQUE(organization_id, key)
);

-- Add comments
COMMENT ON TABLE public.service_contexts IS 'Delivery/service contexts for product costing. Defines how products are served/delivered with associated costs.';
COMMENT ON COLUMN public.service_contexts.key IS 'Unique key within org: dine_in, takeaway, delivery_own, delivery_platform, etc.';
COMMENT ON COLUMN public.service_contexts.requires_feature IS 'Feature key that must be active for this context (e.g., fulfillment_onsite, fulfillment_delivery).';
COMMENT ON COLUMN public.service_contexts.is_default IS 'Default context for new orders when no context is specified.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_contexts_org ON public.service_contexts(organization_id);
CREATE INDEX IF NOT EXISTS idx_service_contexts_active ON public.service_contexts(organization_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_service_contexts_feature ON public.service_contexts(requires_feature) WHERE requires_feature IS NOT NULL;

-- ============================================================================
-- 2. CREATE CONTEXT_STAFF_REQUIREMENTS TABLE
-- Purpose: Define service staff requirements per context
-- This is SERVICE staff (variable by context), not PRODUCTION staff (fixed per product)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.context_staff_requirements (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id UUID NOT NULL REFERENCES public.service_contexts(id) ON DELETE CASCADE,
  
  -- Staff role
  role_id UUID NOT NULL REFERENCES public.staff_roles(id),
  
  -- Time calculation
  minutes_per_unit DECIMAL(6,2) NOT NULL,         -- Minutes required per unit
  per TEXT NOT NULL DEFAULT 'order',              -- What the unit is: 'order', 'item', 'guest', 'table'
  
  -- Staff count (for team scenarios)
  count INTEGER NOT NULL DEFAULT 1,               -- Number of staff at this role
  
  -- Optional rate overrides
  hourly_rate_override DECIMAL(10,2),             -- Override role's base rate
  loaded_factor_override DECIMAL(4,3),            -- Override role's loaded factor
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT context_staff_per_valid CHECK (per IN ('order', 'item', 'guest', 'table')),
  CONSTRAINT context_staff_minutes_positive CHECK (minutes_per_unit > 0),
  CONSTRAINT context_staff_count_positive CHECK (count > 0)
);

-- Add comments
COMMENT ON TABLE public.context_staff_requirements IS 'Service staff requirements per delivery context. This is for SERVICE staff (variable by context), not production staff.';
COMMENT ON COLUMN public.context_staff_requirements.per IS 'What unit the time is calculated against: order (entire order), item (each item), guest (per cover), table (per table).';
COMMENT ON COLUMN public.context_staff_requirements.count IS 'Number of staff members at this role needed. Default 1.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_context_staff_context ON public.context_staff_requirements(context_id);
CREATE INDEX IF NOT EXISTS idx_context_staff_role ON public.context_staff_requirements(role_id);

-- ============================================================================
-- 3. CREATE CONTEXT_ADDITIONAL_COSTS TABLE
-- Purpose: Define additional (non-labor) costs per context
-- Examples: packaging, platform commissions, handling fees
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.context_additional_costs (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id UUID NOT NULL REFERENCES public.service_contexts(id) ON DELETE CASCADE,
  
  -- Cost identification
  name TEXT NOT NULL,                             -- 'Packaging', 'Platform Commission'
  cost_type TEXT NOT NULL,                        -- 'fixed', 'percentage', 'per_item'
  
  -- Cost amounts (one will be used based on type)
  amount DECIMAL(10,2),                           -- For 'fixed': fixed amount per order
  percentage DECIMAL(5,4),                        -- For 'percentage': % of order total (0.25 = 25%)
  amount_per_item DECIMAL(10,2),                  -- For 'per_item': amount per item
  
  -- Conditionals
  min_order_value DECIMAL(10,2),                  -- Only apply if order >= this value
  max_amount DECIMAL(10,2),                       -- Cap the cost at this maximum
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  include_in_cost BOOLEAN DEFAULT true,           -- Include in product cost calculation
  include_in_price BOOLEAN DEFAULT false,         -- Include in price shown to customer
  
  -- Category for reporting
  cost_category TEXT DEFAULT 'other',             -- 'packaging', 'platform_fee', 'commission', 'delivery_fee', 'handling', 'other'
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT context_cost_type_valid CHECK (cost_type IN ('fixed', 'percentage', 'per_item')),
  CONSTRAINT context_cost_category_valid CHECK (cost_category IN ('packaging', 'platform_fee', 'commission', 'delivery_fee', 'handling', 'other')),
  -- Ensure appropriate amount field is set based on type
  CONSTRAINT context_cost_amount_check CHECK (
    (cost_type = 'fixed' AND amount IS NOT NULL) OR
    (cost_type = 'percentage' AND percentage IS NOT NULL) OR
    (cost_type = 'per_item' AND amount_per_item IS NOT NULL)
  )
);

-- Add comments
COMMENT ON TABLE public.context_additional_costs IS 'Additional non-labor costs per delivery context. Examples: packaging, platform commissions, handling fees.';
COMMENT ON COLUMN public.context_additional_costs.cost_type IS 'Type of cost calculation: fixed (per order), percentage (of order total), per_item (per item in order).';
COMMENT ON COLUMN public.context_additional_costs.percentage IS 'Percentage as decimal. 0.25 = 25%. Used when cost_type = percentage.';
COMMENT ON COLUMN public.context_additional_costs.include_in_cost IS 'Whether to include this cost in product cost calculations.';
COMMENT ON COLUMN public.context_additional_costs.include_in_price IS 'Whether to show/add this cost to customer-facing price.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_context_costs_context ON public.context_additional_costs(context_id);
CREATE INDEX IF NOT EXISTS idx_context_costs_active ON public.context_additional_costs(context_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_context_costs_category ON public.context_additional_costs(cost_category);

-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.service_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_staff_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_additional_costs ENABLE ROW LEVEL SECURITY;

-- Service contexts policies
CREATE POLICY "Users can view service contexts of their organization"
  ON public.service_contexts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage service contexts of their organization"
  ON public.service_contexts FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Context staff requirements policies (inherit from parent context)
CREATE POLICY "Users can view context staff requirements"
  ON public.context_staff_requirements FOR SELECT
  USING (
    context_id IN (
      SELECT id FROM public.service_contexts 
      WHERE organization_id IN (
        SELECT organization_id FROM public.users_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage context staff requirements"
  ON public.context_staff_requirements FOR ALL
  USING (
    context_id IN (
      SELECT id FROM public.service_contexts 
      WHERE organization_id IN (
        SELECT organization_id FROM public.users_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Context additional costs policies (inherit from parent context)
CREATE POLICY "Users can view context additional costs"
  ON public.context_additional_costs FOR SELECT
  USING (
    context_id IN (
      SELECT id FROM public.service_contexts 
      WHERE organization_id IN (
        SELECT organization_id FROM public.users_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage context additional costs"
  ON public.context_additional_costs FOR ALL
  USING (
    context_id IN (
      SELECT id FROM public.service_contexts 
      WHERE organization_id IN (
        SELECT organization_id FROM public.users_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 5. UPDATED_AT TRIGGERS
-- ============================================================================

-- Function for updating updated_at (if not already exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for service_contexts
DROP TRIGGER IF EXISTS update_service_contexts_updated_at ON public.service_contexts;
CREATE TRIGGER update_service_contexts_updated_at
  BEFORE UPDATE ON public.service_contexts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for context_staff_requirements
DROP TRIGGER IF EXISTS update_context_staff_requirements_updated_at ON public.context_staff_requirements;
CREATE TRIGGER update_context_staff_requirements_updated_at
  BEFORE UPDATE ON public.context_staff_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for context_additional_costs
DROP TRIGGER IF EXISTS update_context_additional_costs_updated_at ON public.context_additional_costs;
CREATE TRIGGER update_context_additional_costs_updated_at
  BEFORE UPDATE ON public.context_additional_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. ENSURE ONLY ONE DEFAULT CONTEXT PER ORGANIZATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.ensure_single_default_context()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this context as default
  IF NEW.is_default = true THEN
    -- Unset any existing default for this organization
    UPDATE public.service_contexts
    SET is_default = false
    WHERE organization_id = NEW.organization_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_default_context_trigger ON public.service_contexts;
CREATE TRIGGER ensure_single_default_context_trigger
  BEFORE INSERT OR UPDATE ON public.service_contexts
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_default_context();

-- ============================================================================
-- 7. HELPER FUNCTION: Get Active Contexts for Organization
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_active_service_contexts(p_organization_id UUID)
RETURNS TABLE (
  id UUID,
  key TEXT,
  name TEXT,
  description TEXT,
  requires_feature TEXT,
  is_default BOOLEAN,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    sc.key,
    sc.name,
    sc.description,
    sc.requires_feature,
    sc.is_default,
    sc.sort_order
  FROM public.service_contexts sc
  WHERE sc.organization_id = p_organization_id
    AND sc.is_active = true
  ORDER BY sc.sort_order, sc.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. HELPER FUNCTION: Calculate Context Cost
-- Returns the total additional cost for a context given order details
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_context_cost(
  p_context_id UUID,
  p_order_total DECIMAL(10,2),
  p_item_count INTEGER
)
RETURNS TABLE (
  staff_cost DECIMAL(10,2),
  additional_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2)
) AS $$
DECLARE
  v_staff_cost DECIMAL(10,2) := 0;
  v_additional_cost DECIMAL(10,2) := 0;
  v_cost DECIMAL(10,2);
BEGIN
  -- Calculate staff cost
  SELECT COALESCE(SUM(
    (csr.minutes_per_unit / 60.0) * 
    COALESCE(csr.hourly_rate_override, sr.default_hourly_rate, 0) *
    COALESCE(csr.loaded_factor_override, sr.loaded_factor, 1.0) *
    csr.count *
    CASE csr.per
      WHEN 'order' THEN 1
      WHEN 'item' THEN p_item_count
      ELSE 1
    END
  ), 0)
  INTO v_staff_cost
  FROM public.context_staff_requirements csr
  JOIN public.staff_roles sr ON sr.id = csr.role_id
  WHERE csr.context_id = p_context_id;
  
  -- Calculate additional costs
  FOR v_cost IN
    SELECT 
      CASE cac.cost_type
        WHEN 'fixed' THEN cac.amount
        WHEN 'percentage' THEN p_order_total * cac.percentage
        WHEN 'per_item' THEN cac.amount_per_item * p_item_count
      END AS calculated_cost
    FROM public.context_additional_costs cac
    WHERE cac.context_id = p_context_id
      AND cac.is_active = true
      AND cac.include_in_cost = true
      AND (cac.min_order_value IS NULL OR p_order_total >= cac.min_order_value)
  LOOP
    v_additional_cost := v_additional_cost + LEAST(v_cost, COALESCE(
      (SELECT max_amount FROM public.context_additional_costs WHERE context_id = p_context_id LIMIT 1),
      v_cost
    ));
  END LOOP;
  
  RETURN QUERY SELECT v_staff_cost, v_additional_cost, (v_staff_cost + v_additional_cost);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
