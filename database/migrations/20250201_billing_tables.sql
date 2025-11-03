/**
 * BILLING MODULE - DATABASE MIGRATION
 *
 * Creates tables for billing, subscriptions, and invoicing
 *
 * Tables:
 * - subscriptions: Customer subscription records
 * - billing_cycles: Individual billing cycle tracking
 * - invoices: Generated invoices
 * - payments: Payment records linked to invoices
 *
 * @version 1.0.0
 * @date 2025-02-01
 */

-- ==================== SUBSCRIPTIONS TABLE ====================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,

  -- Basic Information
  subscription_name TEXT NOT NULL,
  description TEXT,
  internal_notes TEXT,

  -- Billing Configuration
  billing_type TEXT NOT NULL CHECK (billing_type IN ('monthly', 'quarterly', 'annual', 'custom')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD', 'EUR')),
  tax_included BOOLEAN NOT NULL DEFAULT true,

  -- Custom Interval (for billing_type = 'custom')
  custom_interval INTEGER,
  custom_interval_type TEXT CHECK (custom_interval_type IN ('days', 'weeks', 'months')),

  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE,
  billing_cycles INTEGER,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),

  -- Automation Settings
  auto_invoice BOOLEAN NOT NULL DEFAULT true,
  auto_collect BOOLEAN NOT NULL DEFAULT false,
  retry_failed_payments BOOLEAN NOT NULL DEFAULT true,
  max_retries INTEGER NOT NULL DEFAULT 3 CHECK (max_retries BETWEEN 0 AND 5),

  -- Payment Terms
  payment_terms TEXT NOT NULL DEFAULT 'immediate' CHECK (payment_terms IN ('immediate', 'net15', 'net30', 'net45')),
  reminder_days INTEGER[] NOT NULL DEFAULT ARRAY[7, 3, 1],

  -- Advanced Options
  prorate BOOLEAN NOT NULL DEFAULT false,
  allow_usage_charges BOOLEAN NOT NULL DEFAULT false,
  suspend_on_failure BOOLEAN NOT NULL DEFAULT false,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON public.subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_start_date ON public.subscriptions(start_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON public.subscriptions(end_date) WHERE end_date IS NOT NULL;

-- ==================== BILLING CYCLES TABLE ====================
CREATE TABLE IF NOT EXISTS public.billing_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,

  -- Cycle Information
  cycle_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid', 'overdue', 'cancelled')),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(subscription_id, cycle_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_billing_cycles_subscription_id ON public.billing_cycles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_cycles_status ON public.billing_cycles(status);
CREATE INDEX IF NOT EXISTS idx_billing_cycles_due_date ON public.billing_cycles(due_date);

-- ==================== INVOICES TABLE ====================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  billing_cycle_id UUID REFERENCES public.billing_cycles(id) ON DELETE SET NULL,

  -- Invoice Information
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD', 'EUR')),

  -- Status & Dates
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON public.invoices(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);

-- ==================== PAYMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,

  -- Payment Information
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD', 'EUR')),

  -- Status & Processing
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  provider TEXT,
  failure_reason TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  processed_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id) WHERE transaction_id IS NOT NULL;

-- ==================== TRIGGERS ====================

-- Updated_at trigger for subscriptions
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscriptions_updated_at();

-- Updated_at trigger for billing_cycles
CREATE OR REPLACE FUNCTION public.update_billing_cycles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_billing_cycles_updated_at
  BEFORE UPDATE ON public.billing_cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_billing_cycles_updated_at();

-- Updated_at trigger for invoices
CREATE OR REPLACE FUNCTION public.update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoices_updated_at();

-- Updated_at trigger for payments
CREATE OR REPLACE FUNCTION public.update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payments_updated_at();

-- ==================== ROW LEVEL SECURITY (RLS) ====================

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() IN (created_by, updated_by) OR auth.jwt() ->> 'user_role' IN ('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR'));

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
  FOR ALL USING (auth.jwt() ->> 'user_role' IN ('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR'));

-- Billing cycles policies
CREATE POLICY "Users can view billing cycles" ON public.billing_cycles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = billing_cycles.subscription_id
        AND (auth.uid() IN (s.created_by, s.updated_by) OR auth.jwt() ->> 'user_role' IN ('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR'))
    )
  );

CREATE POLICY "Admins can manage billing cycles" ON public.billing_cycles
  FOR ALL USING (auth.jwt() ->> 'user_role' IN ('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR'));

-- Invoices policies
CREATE POLICY "Users can view their invoices" ON public.invoices
  FOR SELECT USING (auth.uid() IN (created_by, updated_by) OR auth.jwt() ->> 'user_role' IN ('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR'));

CREATE POLICY "Admins can manage invoices" ON public.invoices
  FOR ALL USING (auth.jwt() ->> 'user_role' IN ('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR'));

-- Payments policies
CREATE POLICY "Users can view their payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = payments.invoice_id
        AND (auth.uid() IN (i.created_by, i.updated_by) OR auth.jwt() ->> 'user_role' IN ('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR'))
    )
  );

CREATE POLICY "Admins can manage payments" ON public.payments
  FOR ALL USING (auth.jwt() ->> 'user_role' IN ('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR'));

-- ==================== COMMENTS ====================

COMMENT ON TABLE public.subscriptions IS 'Customer subscription records for recurring billing';
COMMENT ON TABLE public.billing_cycles IS 'Individual billing cycle tracking for subscriptions';
COMMENT ON TABLE public.invoices IS 'Generated invoices for subscriptions and one-time charges';
COMMENT ON TABLE public.payments IS 'Payment records linked to invoices';

-- ==================== COMPLETION ====================

DO $$
BEGIN
  RAISE NOTICE 'Billing module tables created successfully';
  RAISE NOTICE '✅ Tables: subscriptions, billing_cycles, invoices, payments';
  RAISE NOTICE '✅ Indexes: 16 performance indexes';
  RAISE NOTICE '✅ Triggers: 4 updated_at triggers';
  RAISE NOTICE '✅ RLS: 8 security policies configured';
END $$;
