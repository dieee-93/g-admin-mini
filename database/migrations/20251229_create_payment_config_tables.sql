-- ============================================
-- MIGRATION: Create Payment Configuration Tables
-- Date: 2025-12-29
-- Purpose: Create payment_methods_config and payment_gateways tables
-- Dependencies: Must run BEFORE 20251229_improve_sale_payments_schema.sql
-- ============================================

BEGIN;

-- ============================================
-- PART 1: PAYMENT GATEWAYS
-- ============================================

CREATE TABLE IF NOT EXISTS public.payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Classification
  type TEXT NOT NULL CHECK (type IN (
    'card',            -- Credit/Debit cards
    'digital_wallet',  -- MercadoPago, MODO, PayPal, etc.
    'bank_transfer',   -- CBU/CVU transfers
    'qr_payment',      -- QR interoperable, QR dinámico
    'cash',            -- Cash register integration
    'crypto',          -- Cryptocurrency
    'bnpl'             -- Buy Now Pay Later (Ahora 12/18)
  )),

  -- Identification
  name TEXT NOT NULL,
  provider TEXT,  -- 'mercadopago', 'modo', 'stripe', 'paypal', etc.

  -- Status
  is_active BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT true,  -- Online vs offline (POS terminal)

  -- Capabilities
  supports_refunds BOOLEAN DEFAULT false,
  supports_recurring BOOLEAN DEFAULT false,  -- Subscriptions
  supports_webhooks BOOLEAN DEFAULT false,

  -- Configuration (JSONB for flexibility)
  config JSONB DEFAULT '{}'::jsonb,
  -- Example config for MercadoPago:
  -- {
  --   "test_mode": true,
  --   "public_key": "TEST-xxx",
  --   "access_token": "TEST-xxx",
  --   "webhook_url": "https://myapp.com/api/webhooks/mercadopago",
  --   "webhook_secret": "xxx",
  --   "currency": "ARS",
  --   "capture_mode": "auto",
  --   "payment_methods": ["credit_card", "debit_card", "qr", "wallet"]
  -- }

  -- Webhook Configuration
  webhook_url TEXT,
  webhook_secret TEXT,

  -- Limits
  min_amount NUMERIC(12,2),
  max_amount NUMERIC(12,2),

  -- Business Profile (multi-tenant support)
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indices for payment_gateways
CREATE INDEX IF NOT EXISTS idx_payment_gateways_type ON public.payment_gateways(type);
CREATE INDEX IF NOT EXISTS idx_payment_gateways_provider ON public.payment_gateways(provider);
CREATE INDEX IF NOT EXISTS idx_payment_gateways_active ON public.payment_gateways(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_payment_gateways_business ON public.payment_gateways(business_profile_id);

-- Unique constraint: One gateway per provider per business
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_gateways_unique_provider
  ON public.payment_gateways(provider, business_profile_id)
  WHERE provider IS NOT NULL;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_payment_gateways_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_payment_gateways_updated_at ON public.payment_gateways;
CREATE TRIGGER trigger_update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_gateways_updated_at();

-- Comments
COMMENT ON TABLE public.payment_gateways IS
  'Payment gateway configurations (MercadoPago, MODO, Stripe, etc.). Each gateway processes payments externally.';
COMMENT ON COLUMN public.payment_gateways.config IS
  'Gateway-specific configuration stored as JSONB. Includes API keys, webhooks, currency, etc.';
COMMENT ON COLUMN public.payment_gateways.webhook_secret IS
  'Secret for verifying webhook signatures. CRITICAL for security.';

-- ============================================
-- PART 2: PAYMENT METHODS CONFIG
-- ============================================

CREATE TABLE IF NOT EXISTS public.payment_methods_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Gateway Reference (optional - cash doesn't need gateway)
  gateway_id UUID REFERENCES public.payment_gateways(id) ON DELETE RESTRICT,

  -- Identification
  name TEXT NOT NULL,
  code TEXT NOT NULL,  -- 'cash', 'credit_card', 'qr_payment', 'bank_transfer'
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,  -- Icon name or emoji

  -- Gateway Requirement
  requires_gateway BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Display Order
  sort_order INTEGER DEFAULT 0,

  -- Configuration (JSONB for flexibility)
  config JSONB DEFAULT '{}'::jsonb,
  -- Example config:
  -- {
  --   "allow_tips": true,
  --   "tip_percentages": [10, 15, 20],
  --   "allow_partial": false,
  --   "require_authorization": true
  -- }

  -- Business Profile (multi-tenant support)
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT chk_code_lowercase CHECK (code = lower(code)),
  CONSTRAINT chk_gateway_required CHECK (
    (requires_gateway = false) OR
    (requires_gateway = true AND gateway_id IS NOT NULL)
  )
);

-- Indices for payment_methods_config
CREATE INDEX IF NOT EXISTS idx_payment_methods_config_gateway ON public.payment_methods_config(gateway_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_config_code ON public.payment_methods_config(code);
CREATE INDEX IF NOT EXISTS idx_payment_methods_config_active ON public.payment_methods_config(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_payment_methods_config_business ON public.payment_methods_config(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_config_sort ON public.payment_methods_config(sort_order);

-- Unique constraint: One code per business
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_methods_config_unique_code
  ON public.payment_methods_config(code, business_profile_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_payment_methods_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_payment_methods_config_updated_at ON public.payment_methods_config;
CREATE TRIGGER trigger_update_payment_methods_config_updated_at
  BEFORE UPDATE ON public.payment_methods_config
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_methods_config_updated_at();

-- Comments
COMMENT ON TABLE public.payment_methods_config IS
  'Payment methods configuration. Defines what payment types are available (cash, cards, transfers, QR, etc.).';
COMMENT ON COLUMN public.payment_methods_config.code IS
  'Unique code for the payment method. Must be lowercase. Examples: cash, credit_card, qr_payment, bank_transfer.';
COMMENT ON COLUMN public.payment_methods_config.requires_gateway IS
  'If true, this payment method requires a gateway (like Mercado Pago). If false, it can be processed directly (like cash).';

-- ============================================
-- PART 3: SEED DEFAULT PAYMENT METHODS
-- ============================================

-- Insert default payment methods (without business_profile_id for now - will need to be updated per tenant)
-- These are templates that can be copied per tenant

-- Only insert if no methods exist yet (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.payment_methods_config LIMIT 1) THEN

    -- CASH (no gateway required)
    INSERT INTO public.payment_methods_config (
      name, code, display_name, description, icon,
      requires_gateway, is_active, sort_order, config
    ) VALUES (
      'Efectivo',
      'cash',
      'Efectivo',
      'Pago en efectivo en caja',
      '💵',
      false,
      true,
      1,
      '{"allow_change": true, "allow_tips": true}'::jsonb
    );

    -- CREDIT CARD (requires gateway)
    INSERT INTO public.payment_methods_config (
      name, code, display_name, description, icon,
      requires_gateway, is_active, sort_order, config
    ) VALUES (
      'Tarjeta de Crédito',
      'credit_card',
      'Tarjeta de Crédito',
      'Pago con tarjeta de crédito (Visa, Mastercard, Cabal, etc.)',
      '💳',
      true,
      true,
      2,
      '{"allow_installments": true, "max_installments": 12}'::jsonb
    );

    -- DEBIT CARD (requires gateway)
    INSERT INTO public.payment_methods_config (
      name, code, display_name, description, icon,
      requires_gateway, is_active, sort_order, config
    ) VALUES (
      'Tarjeta de Débito',
      'debit_card',
      'Tarjeta de Débito',
      'Pago con tarjeta de débito',
      '💳',
      true,
      true,
      3,
      '{}'::jsonb
    );

    -- BANK TRANSFER (requires gateway)
    INSERT INTO public.payment_methods_config (
      name, code, display_name, description, icon,
      requires_gateway, is_active, sort_order, config
    ) VALUES (
      'Transferencia Bancaria',
      'bank_transfer',
      'Transferencia',
      'Transferencia bancaria CBU/CVU',
      '🏦',
      true,
      false,  -- Disabled by default
      4,
      '{}'::jsonb
    );

    -- QR PAYMENT (requires gateway)
    INSERT INTO public.payment_methods_config (
      name, code, display_name, description, icon,
      requires_gateway, is_active, sort_order, config
    ) VALUES (
      'Pago con QR',
      'qr_payment',
      'QR',
      'Pago QR interoperable (MODO, MercadoPago, etc.)',
      '📱',
      true,
      true,
      5,
      '{"qr_type": "dynamic", "expiration_minutes": 30}'::jsonb
    );

    -- DIGITAL WALLET (requires gateway)
    INSERT INTO public.payment_methods_config (
      name, code, display_name, description, icon,
      requires_gateway, is_active, sort_order, config
    ) VALUES (
      'Billetera Virtual',
      'digital_wallet',
      'Billetera',
      'Billeteras virtuales (MercadoPago, MODO, Ualá, etc.)',
      '💰',
      true,
      true,
      6,
      '{}'::jsonb
    );

    RAISE NOTICE 'Default payment methods seeded successfully';
  ELSE
    RAISE NOTICE 'Payment methods already exist, skipping seed';
  END IF;
END $$;

-- ============================================
-- PART 4: RLS POLICIES (Row Level Security)
-- ============================================

-- Enable RLS
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods_config ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view gateways for their business
CREATE POLICY "Users can view payment gateways for their business"
  ON public.payment_gateways
  FOR SELECT
  USING (
    business_profile_id IN (
      SELECT id FROM public.business_profiles
      WHERE id = (SELECT business_profile_id FROM auth.users WHERE id = auth.uid())
    )
    OR business_profile_id IS NULL  -- Allow viewing global/default gateways
  );

-- Policy: Users can view payment methods for their business
CREATE POLICY "Users can view payment methods for their business"
  ON public.payment_methods_config
  FOR SELECT
  USING (
    business_profile_id IN (
      SELECT id FROM public.business_profiles
      WHERE id = (SELECT business_profile_id FROM auth.users WHERE id = auth.uid())
    )
    OR business_profile_id IS NULL  -- Allow viewing global/default methods
  );

-- Policy: Admins can manage payment gateways
CREATE POLICY "Admins can manage payment gateways"
  ON public.payment_gateways
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND role IN ('ADMINISTRADOR', 'SUPER_ADMIN')
    )
  );

-- Policy: Admins can manage payment methods
CREATE POLICY "Admins can manage payment methods"
  ON public.payment_methods_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND role IN ('ADMINISTRADOR', 'SUPER_ADMIN')
    )
  );

COMMIT;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================
-- DROP TABLE IF EXISTS public.payment_methods_config CASCADE;
-- DROP TABLE IF EXISTS public.payment_gateways CASCADE;
-- DROP FUNCTION IF EXISTS update_payment_gateways_updated_at CASCADE;
-- DROP FUNCTION IF EXISTS update_payment_methods_config_updated_at CASCADE;
