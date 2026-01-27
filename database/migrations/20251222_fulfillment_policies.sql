-- ================================================
-- FULFILLMENT POLICIES SETTINGS - Phase 2 Module 3
-- ================================================
-- Purpose: Store delivery, pickup, and fulfillment rules
-- Route: /admin/settings/fulfillment/policies
-- Version: 1.0.0
-- Date: 2025-12-22

-- ================================================
-- TABLE CREATION
-- ================================================

CREATE TABLE IF NOT EXISTS public.fulfillment_policies (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Delivery Configuration
  delivery_enabled BOOLEAN DEFAULT true,
  delivery_zones JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"id": "zone1", "name": "Centro", "radius_km": 5, "fee": 50, "min_order": 200}]
  
  default_delivery_fee DECIMAL(10,2) DEFAULT 50.00 CHECK (default_delivery_fee >= 0),
  free_delivery_threshold DECIMAL(10,2) DEFAULT 500.00 CHECK (free_delivery_threshold >= 0),
  
  -- Pickup Configuration
  pickup_enabled BOOLEAN DEFAULT true,
  pickup_discount_percent DECIMAL(5,2) DEFAULT 10.00 CHECK (pickup_discount_percent >= 0 AND pickup_discount_percent <= 100),
  pickup_ready_time_minutes INTEGER DEFAULT 20 CHECK (pickup_ready_time_minutes > 0),
  
  -- Order Minimums
  min_order_delivery DECIMAL(10,2) DEFAULT 200.00 CHECK (min_order_delivery >= 0),
  min_order_pickup DECIMAL(10,2) DEFAULT 100.00 CHECK (min_order_pickup >= 0),
  
  -- Order Processing
  order_confirmation_required BOOLEAN DEFAULT true,
  auto_accept_orders BOOLEAN DEFAULT false,
  order_acceptance_timeout_minutes INTEGER DEFAULT 10 CHECK (order_acceptance_timeout_minutes > 0),
  
  -- Fulfillment Times
  estimated_prep_time_minutes INTEGER DEFAULT 30 CHECK (estimated_prep_time_minutes > 0),
  estimated_delivery_time_minutes INTEGER DEFAULT 45 CHECK (estimated_delivery_time_minutes > 0),
  max_advance_order_days INTEGER DEFAULT 7 CHECK (max_advance_order_days >= 0),
  
  -- Driver Management
  auto_assign_drivers BOOLEAN DEFAULT false,
  driver_assignment_radius_km DECIMAL(5,2) DEFAULT 10.00 CHECK (driver_assignment_radius_km > 0),
  max_concurrent_deliveries_per_driver INTEGER DEFAULT 3 CHECK (max_concurrent_deliveries_per_driver > 0),
  
  -- Packaging & Handling
  packaging_fee DECIMAL(10,2) DEFAULT 0.00 CHECK (packaging_fee >= 0),
  utensils_default BOOLEAN DEFAULT true,
  special_instructions_max_length INTEGER DEFAULT 500 CHECK (special_instructions_max_length > 0),
  
  -- Returns & Refunds
  cancellation_allowed BOOLEAN DEFAULT true,
  cancellation_deadline_minutes INTEGER DEFAULT 15 CHECK (cancellation_deadline_minutes >= 0),
  refund_policy_enabled BOOLEAN DEFAULT true,
  refund_processing_days INTEGER DEFAULT 7 CHECK (refund_processing_days > 0),
  
  -- Tips & Service Charges
  tips_enabled BOOLEAN DEFAULT true,
  suggested_tip_percentages JSONB DEFAULT '[10, 15, 20]'::jsonb,
  service_charge_enabled BOOLEAN DEFAULT false,
  service_charge_percent DECIMAL(5,2) DEFAULT 10.00 CHECK (service_charge_percent >= 0 AND service_charge_percent <= 100),
  
  -- Contact & Tracking
  customer_contact_required BOOLEAN DEFAULT true,
  order_tracking_enabled BOOLEAN DEFAULT true,
  delivery_notifications_enabled BOOLEAN DEFAULT true,
  
  -- Operating Hours Override
  custom_delivery_hours JSONB DEFAULT '{}'::jsonb,
  -- Example: {"monday": {"start": "09:00", "end": "22:00"}, ...}
  
  -- Metadata
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_delivery_fees CHECK (
    NOT delivery_enabled OR (
      default_delivery_fee >= 0 AND
      free_delivery_threshold >= 0
    )
  ),
  CONSTRAINT valid_minimums CHECK (
    min_order_delivery >= 0 AND
    min_order_pickup >= 0
  )
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_fulfillment_policies_system ON public.fulfillment_policies(is_system) WHERE is_system = true;
CREATE INDEX idx_fulfillment_policies_created_at ON public.fulfillment_policies(created_at DESC);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE public.fulfillment_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fulfillment policies viewable by authenticated users"
  ON public.fulfillment_policies FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Fulfillment policies creatable by admins"
  ON public.fulfillment_policies FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Fulfillment policies updatable by admins"
  ON public.fulfillment_policies FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Fulfillment policies deletable by admins"
  ON public.fulfillment_policies FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin' AND is_system = false);

-- ================================================
-- DEFAULT SYSTEM RECORD
-- ================================================

INSERT INTO public.fulfillment_policies (
  id, is_system,
  delivery_enabled, delivery_zones, default_delivery_fee, free_delivery_threshold,
  pickup_enabled, pickup_discount_percent, pickup_ready_time_minutes,
  min_order_delivery, min_order_pickup,
  order_confirmation_required, auto_accept_orders, order_acceptance_timeout_minutes,
  estimated_prep_time_minutes, estimated_delivery_time_minutes, max_advance_order_days,
  auto_assign_drivers, driver_assignment_radius_km, max_concurrent_deliveries_per_driver,
  packaging_fee, utensils_default, special_instructions_max_length,
  cancellation_allowed, cancellation_deadline_minutes, 
  refund_policy_enabled, refund_processing_days,
  tips_enabled, suggested_tip_percentages, 
  service_charge_enabled, service_charge_percent,
  customer_contact_required, order_tracking_enabled, delivery_notifications_enabled,
  custom_delivery_hours
) VALUES (
  '00000000-0000-0000-0000-000000000002', true,
  true, 
  '[
    {"id": "zone1", "name": "Centro", "radius_km": 3, "fee": 30, "min_order": 150, "estimated_time": 30},
    {"id": "zone2", "name": "Zona Norte", "radius_km": 5, "fee": 50, "min_order": 200, "estimated_time": 45},
    {"id": "zone3", "name": "Zona Sur", "radius_km": 8, "fee": 80, "min_order": 250, "estimated_time": 60}
  ]'::jsonb,
  50.00, 500.00,
  true, 10.00, 20,
  200.00, 100.00,
  true, false, 10,
  30, 45, 7,
  false, 10.00, 3,
  0.00, true, 500,
  true, 15,
  true, 7,
  true, '[10, 15, 20]'::jsonb,
  false, 10.00,
  true, true, true,
  '{}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ================================================
-- TRIGGERS
-- ================================================

CREATE OR REPLACE FUNCTION update_fulfillment_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fulfillment_policies_updated_at_trigger
  BEFORE UPDATE ON public.fulfillment_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_fulfillment_policies_updated_at();

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE public.fulfillment_policies IS 
  'Fulfillment configuration for delivery, pickup, and order processing. For notification settings, use notification_rules table.';

COMMENT ON COLUMN public.fulfillment_policies.delivery_zones IS 
  'Array of delivery zone configurations with radius, fees, and minimums per zone';

COMMENT ON COLUMN public.fulfillment_policies.free_delivery_threshold IS 
  'Order amount that qualifies for free delivery (0 = disabled)';

COMMENT ON COLUMN public.fulfillment_policies.pickup_discount_percent IS 
  'Discount percentage for pickup orders (incentivize self-pickup)';

COMMENT ON COLUMN public.fulfillment_policies.auto_accept_orders IS 
  'Automatically accept orders without manual confirmation (high-volume mode)';

COMMENT ON COLUMN public.fulfillment_policies.order_acceptance_timeout_minutes IS 
  'Time before order is auto-cancelled if not accepted by restaurant';

COMMENT ON COLUMN public.fulfillment_policies.auto_assign_drivers IS 
  'Automatically assign delivery orders to nearest available driver';

COMMENT ON COLUMN public.fulfillment_policies.max_concurrent_deliveries_per_driver IS 
  'Maximum number of simultaneous deliveries a driver can handle (route optimization)';

COMMENT ON COLUMN public.fulfillment_policies.cancellation_deadline_minutes IS 
  'Minutes after order placement when cancellation is no longer allowed';

COMMENT ON COLUMN public.fulfillment_policies.suggested_tip_percentages IS 
  'Array of suggested tip percentages shown to customers (e.g., [10, 15, 20])';

COMMENT ON COLUMN public.fulfillment_policies.service_charge_percent IS 
  'Mandatory service charge percentage (added to subtotal, different from tips)';

COMMENT ON COLUMN public.fulfillment_policies.custom_delivery_hours IS 
  'Override general business hours with specific delivery windows per day';
