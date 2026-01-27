-- ============================================
-- MIGRATION: Improve sale_payments Schema
-- Date: 2025-12-29
-- Purpose: Implement Option B - sale_payments as Single Source of Truth
-- Based on: RESEARCH_PAYMENT_ARCHITECTURE_INDUSTRY_STANDARDS.md
-- ============================================

-- ============================================
-- PART 1: CREATE ENUMS
-- ============================================

-- Payment Status Enum (State Machine)
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'INITIATED',           -- Payment request created
    'AUTHORIZED',          -- Funds authorized/held (CARD, QR, TRANSFER)
    'SUBMITTED_FOR_SETTLEMENT', -- Sent to payment processor for settlement
    'SETTLING',            -- Settlement in progress
    'SETTLED',             -- Funds transferred (final state for successful payments)
    'VOIDED',              -- Cancelled before settlement
    'REFUND_PENDING',      -- Refund requested
    'REFUNDED',            -- Refund completed
    'CHARGEBACK_PENDING',  -- Chargeback dispute started
    'CHARGEDBACK',         -- Chargeback completed (merchant lost dispute)
    'FAILED'               -- Payment failed
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE payment_status IS
  'State machine for payment lifecycle. Valid transitions enforced by trigger.';

-- Transaction Type Enum
DO $$ BEGIN
  CREATE TYPE payment_transaction_type AS ENUM (
    'PAYMENT',      -- Normal payment
    'REFUND',       -- Refund transaction (negative amount)
    'CHARGEBACK'    -- Chargeback (negative amount)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE payment_transaction_type IS
  'Type of payment transaction. PAYMENT = normal, REFUND = merchant-initiated reversal, CHARGEBACK = customer dispute.';

-- ============================================
-- PART 2: ALTER sale_payments TABLE
-- ============================================

-- Add new columns to sale_payments
ALTER TABLE public.sale_payments
  -- Transaction Type
  ADD COLUMN IF NOT EXISTS transaction_type payment_transaction_type NOT NULL DEFAULT 'PAYMENT',

  -- Linking (for refunds/chargebacks)
  ADD COLUMN IF NOT EXISTS parent_payment_id UUID REFERENCES public.sale_payments(id) ON DELETE RESTRICT,

  -- Payment Method Reference
  ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES public.payment_methods_config(id) ON DELETE RESTRICT,

  -- Operational Context
  ADD COLUMN IF NOT EXISTS cash_session_id UUID REFERENCES public.cash_sessions(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.operational_shifts(id) ON DELETE RESTRICT,

  -- Transaction Lifecycle (State Machine)
  ADD COLUMN IF NOT EXISTS status payment_status NOT NULL DEFAULT 'INITIATED',
  ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb,

  -- Timestamps por estado
  ADD COLUMN IF NOT EXISTS initiated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS authorized_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS captured_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submitted_for_settlement_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,

  -- Idempotency (CRITICAL for preventing duplicates)
  ADD COLUMN IF NOT EXISTS idempotency_key UUID UNIQUE DEFAULT gen_random_uuid(),

  -- Audit trail
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id),

  -- Currency support
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'ARS';

-- Update existing rows to have initiated_at = created_at
UPDATE public.sale_payments
SET initiated_at = created_at
WHERE initiated_at IS NULL;

-- Make initiated_at NOT NULL after populating
ALTER TABLE public.sale_payments
  ALTER COLUMN initiated_at SET NOT NULL,
  ALTER COLUMN initiated_at SET DEFAULT NOW();

-- ============================================
-- PART 3: ADD CONSTRAINTS
-- ============================================

-- Constraint: Positive payments, negative refunds/chargebacks
ALTER TABLE public.sale_payments
  DROP CONSTRAINT IF EXISTS check_payment_amount_sign,
  ADD CONSTRAINT check_payment_amount_sign CHECK (
    (transaction_type = 'PAYMENT' AND amount > 0) OR
    (transaction_type IN ('REFUND', 'CHARGEBACK') AND amount < 0)
  );

COMMENT ON CONSTRAINT check_payment_amount_sign ON public.sale_payments IS
  'Ensures PAYMENT transactions have positive amounts, REFUND/CHARGEBACK have negative amounts.';

-- Constraint: CASH payments require cash_session_id
ALTER TABLE public.sale_payments
  DROP CONSTRAINT IF EXISTS check_cash_requires_session,
  ADD CONSTRAINT check_cash_requires_session CHECK (
    (payment_type = 'CASH' AND cash_session_id IS NOT NULL) OR
    (payment_type != 'CASH')
  );

COMMENT ON CONSTRAINT check_cash_requires_session ON public.sale_payments IS
  'CASH payments must be associated with a cash_session_id.';

-- Constraint: All payments require shift_id
-- (commented out for now, uncomment when ready)
-- ALTER TABLE public.sale_payments
--   ALTER COLUMN shift_id SET NOT NULL;

-- ============================================
-- PART 4: CREATE INDEXES
-- ============================================

-- Existing indexes (keep them)
-- CREATE INDEX IF NOT EXISTS idx_sale_payments_sale ON public.sale_payments(sale_id);
-- CREATE INDEX IF NOT EXISTS idx_sale_payments_journal ON public.sale_payments(journal_entry_id);

-- New indexes for performance
CREATE INDEX IF NOT EXISTS idx_sale_payments_shift
  ON public.sale_payments(shift_id)
  WHERE shift_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sale_payments_cash_session
  ON public.sale_payments(cash_session_id)
  WHERE cash_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sale_payments_status
  ON public.sale_payments(status);

CREATE INDEX IF NOT EXISTS idx_sale_payments_type
  ON public.sale_payments(payment_type);

CREATE INDEX IF NOT EXISTS idx_sale_payments_transaction_type
  ON public.sale_payments(transaction_type);

CREATE INDEX IF NOT EXISTS idx_sale_payments_created
  ON public.sale_payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sale_payments_parent
  ON public.sale_payments(parent_payment_id)
  WHERE parent_payment_id IS NOT NULL;

-- Unique index on idempotency_key (critical for duplicate prevention)
CREATE UNIQUE INDEX IF NOT EXISTS idx_sale_payments_idempotency
  ON public.sale_payments(idempotency_key);

-- Partial index for payments pending settlement (batch processing)
CREATE INDEX IF NOT EXISTS idx_sale_payments_pending_settlement
  ON public.sale_payments(payment_type, created_at)
  WHERE status IN ('AUTHORIZED', 'SUBMITTED_FOR_SETTLEMENT');

COMMENT ON INDEX idx_sale_payments_pending_settlement IS
  'Used for batch settlement processing. Finds CARD/QR/TRANSFER payments that need settlement.';

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_sale_payments_shift_type_status
  ON public.sale_payments(shift_id, payment_type, status)
  WHERE shift_id IS NOT NULL;

-- ============================================
-- PART 5: ADD DENORMALIZED COLUMNS TO OTHER TABLES
-- ============================================

-- cash_sessions: Add denormalized totals (CACHE)
ALTER TABLE public.cash_sessions
  ADD COLUMN IF NOT EXISTS cash_sales NUMERIC(15,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cash_refunds NUMERIC(15,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_cash NUMERIC(15,4) GENERATED ALWAYS AS (cash_sales + cash_refunds) STORED;

COMMENT ON COLUMN public.cash_sessions.cash_sales IS
  'DENORMALIZED CACHE: Sum of CASH PAYMENT transactions. Updated by trigger from sale_payments.';

COMMENT ON COLUMN public.cash_sessions.cash_refunds IS
  'DENORMALIZED CACHE: Sum of CASH REFUND transactions (negative). Updated by trigger from sale_payments.';

COMMENT ON COLUMN public.cash_sessions.net_cash IS
  'COMPUTED: Net cash in session (sales + refunds). Automatically calculated.';

-- operational_shifts: Add denormalized totals by payment type (CACHE)
ALTER TABLE public.operational_shifts
  ADD COLUMN IF NOT EXISTS cash_total NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS card_total NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transfer_total NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qr_total NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_total NUMERIC(12,2) DEFAULT 0;

COMMENT ON COLUMN public.operational_shifts.cash_total IS
  'DENORMALIZED CACHE: Net cash payments in this shift. Updated by trigger.';

COMMENT ON COLUMN public.operational_shifts.card_total IS
  'DENORMALIZED CACHE: Net card payments in this shift. Updated by trigger.';

COMMENT ON COLUMN public.operational_shifts.transfer_total IS
  'DENORMALIZED CACHE: Net transfer payments in this shift. Updated by trigger.';

COMMENT ON COLUMN public.operational_shifts.qr_total IS
  'DENORMALIZED CACHE: Net QR payments in this shift. Updated by trigger.';

COMMENT ON COLUMN public.operational_shifts.other_total IS
  'DENORMALIZED CACHE: Net other payment types in this shift. Updated by trigger.';

-- ============================================
-- PART 6: ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE public.sale_payments IS
  'SINGLE SOURCE OF TRUTH for all payment transactions. ' ||
  'Each payment method (CASH, CARD, TRANSFER, QR) is recorded here. ' ||
  'Other tables (cash_sessions, operational_shifts) contain denormalized caches for performance.';

COMMENT ON COLUMN public.sale_payments.idempotency_key IS
  'Ensures exactly-once processing of payment requests. ' ||
  'Client should generate UUID and include in retry attempts to prevent duplicate payments.';

COMMENT ON COLUMN public.sale_payments.status IS
  'Current state in payment lifecycle. Valid transitions enforced by trigger.';

COMMENT ON COLUMN public.sale_payments.status_history IS
  'Immutable log of all status transitions for audit trail. ' ||
  'Format: [{"from": "INITIATED", "to": "AUTHORIZED", "timestamp": "...", "changed_by": "..."}]';

COMMENT ON COLUMN public.sale_payments.transaction_type IS
  'PAYMENT = normal payment, REFUND = merchant refund, CHARGEBACK = customer dispute.';

COMMENT ON COLUMN public.sale_payments.parent_payment_id IS
  'For REFUND/CHARGEBACK transactions, links to original PAYMENT. Creates audit chain.';

COMMENT ON COLUMN public.sale_payments.metadata IS
  'Payment method-specific data. Structure varies by payment_type. ' ||
  'CASH: {change_given, ...} ' ||
  'CARD: {terminal_id, card_brand, last_4_digits, authorization_code, settlement_batch_id, ...} ' ||
  'TRANSFER: {bank_name, reference_number, transfer_date, ...} ' ||
  'QR: {qr_provider, transaction_id, qr_code, ...}';

COMMENT ON COLUMN public.sale_payments.cash_session_id IS
  'Required for CASH payments. Links payment to cashier session for reconciliation.';

COMMENT ON COLUMN public.sale_payments.shift_id IS
  'Links payment to operational shift. Used for shift reconciliation and reporting.';

-- ============================================
-- PART 7: CREATE HELPER VIEWS
-- ============================================

-- View: Payment summary by sale
CREATE OR REPLACE VIEW v_sale_payment_summary AS
SELECT
  sale_id,
  COUNT(*) FILTER (WHERE transaction_type = 'PAYMENT') as payment_count,
  COUNT(*) FILTER (WHERE transaction_type = 'REFUND') as refund_count,
  COUNT(*) FILTER (WHERE transaction_type = 'CHARGEBACK') as chargeback_count,
  SUM(amount) FILTER (WHERE transaction_type = 'PAYMENT') as total_payments,
  SUM(amount) FILTER (WHERE transaction_type = 'REFUND') as total_refunds,
  SUM(amount) FILTER (WHERE transaction_type = 'CHARGEBACK') as total_chargebacks,
  SUM(amount) as net_amount,
  jsonb_object_agg(
    payment_type,
    SUM(amount)
  ) FILTER (WHERE transaction_type = 'PAYMENT') as payments_by_type,
  MAX(created_at) as last_payment_at
FROM public.sale_payments
GROUP BY sale_id;

COMMENT ON VIEW v_sale_payment_summary IS
  'Aggregated payment information per sale. Shows total payments, refunds, chargebacks, and breakdown by type.';

-- View: Shift payment summary
CREATE OR REPLACE VIEW v_shift_payment_summary AS
SELECT
  shift_id,
  payment_type,
  COUNT(*) as transaction_count,
  COUNT(*) FILTER (WHERE transaction_type = 'PAYMENT') as payment_count,
  COUNT(*) FILTER (WHERE transaction_type = 'REFUND') as refund_count,
  SUM(amount) FILTER (WHERE transaction_type = 'PAYMENT') as total_payments,
  SUM(amount) FILTER (WHERE transaction_type = 'REFUND') as total_refunds,
  SUM(amount) as net_amount,
  ARRAY_AGG(DISTINCT status) as statuses,
  MIN(created_at) as first_transaction_at,
  MAX(created_at) as last_transaction_at
FROM public.sale_payments
WHERE shift_id IS NOT NULL
GROUP BY shift_id, payment_type;

COMMENT ON VIEW v_shift_payment_summary IS
  'Payment summary by shift and payment type. Used for shift reconciliation.';

-- View: Payments pending settlement
CREATE OR REPLACE VIEW v_payments_pending_settlement AS
SELECT
  id,
  sale_id,
  payment_type,
  amount,
  status,
  created_at,
  authorized_at,
  EXTRACT(EPOCH FROM (NOW() - COALESCE(authorized_at, created_at)))/3600 as hours_since_authorization,
  metadata
FROM public.sale_payments
WHERE status IN ('AUTHORIZED', 'SUBMITTED_FOR_SETTLEMENT')
  AND payment_type IN ('CARD', 'QR', 'TRANSFER') -- CASH settles immediately
ORDER BY created_at ASC;

COMMENT ON VIEW v_payments_pending_settlement IS
  'Payments that need to be captured/settled. Used for batch settlement processing. ' ||
  'CASH payments are excluded as they settle immediately.';

-- ============================================
-- PART 8: MIGRATION DATA (Existing Payments)
-- ============================================

-- Update existing payments to SETTLED status
-- (Assuming all existing payments are completed)
UPDATE public.sale_payments
SET
  status = 'SETTLED',
  settled_at = created_at,
  initiated_at = created_at,
  transaction_type = 'PAYMENT'
WHERE status IS NULL OR status = 'INITIATED';

-- Generate unique idempotency keys for existing payments
-- (They won't be truly idempotent retroactively, but needed for schema)
UPDATE public.sale_payments
SET idempotency_key = gen_random_uuid()
WHERE idempotency_key IS NULL;

-- ============================================
-- PART 9: GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.sale_payments TO authenticated;
GRANT SELECT ON v_sale_payment_summary TO authenticated;
GRANT SELECT ON v_shift_payment_summary TO authenticated;
GRANT SELECT ON v_payments_pending_settlement TO authenticated;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================

/*
-- To rollback this migration:

-- Drop views
DROP VIEW IF EXISTS v_payments_pending_settlement;
DROP VIEW IF EXISTS v_shift_payment_summary;
DROP VIEW IF EXISTS v_sale_payment_summary;

-- Drop indexes
DROP INDEX IF EXISTS idx_sale_payments_shift_type_status;
DROP INDEX IF EXISTS idx_sale_payments_pending_settlement;
DROP INDEX IF EXISTS idx_sale_payments_idempotency;
DROP INDEX IF EXISTS idx_sale_payments_parent;
DROP INDEX IF EXISTS idx_sale_payments_created;
DROP INDEX IF EXISTS idx_sale_payments_transaction_type;
DROP INDEX IF EXISTS idx_sale_payments_type;
DROP INDEX IF EXISTS idx_sale_payments_status;
DROP INDEX IF EXISTS idx_sale_payments_cash_session;
DROP INDEX IF EXISTS idx_sale_payments_shift;

-- Remove constraints
ALTER TABLE public.sale_payments DROP CONSTRAINT IF EXISTS check_cash_requires_session;
ALTER TABLE public.sale_payments DROP CONSTRAINT IF EXISTS check_payment_amount_sign;

-- Remove columns from operational_shifts
ALTER TABLE public.operational_shifts
  DROP COLUMN IF EXISTS other_total,
  DROP COLUMN IF EXISTS qr_total,
  DROP COLUMN IF EXISTS transfer_total,
  DROP COLUMN IF EXISTS card_total,
  DROP COLUMN IF EXISTS cash_total;

-- Remove columns from cash_sessions
ALTER TABLE public.cash_sessions
  DROP COLUMN IF EXISTS net_cash,
  DROP COLUMN IF EXISTS cash_refunds,
  DROP COLUMN IF EXISTS cash_sales;

-- Remove columns from sale_payments
ALTER TABLE public.sale_payments
  DROP COLUMN IF EXISTS currency,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS updated_at,
  DROP COLUMN IF EXISTS idempotency_key,
  DROP COLUMN IF EXISTS refunded_at,
  DROP COLUMN IF EXISTS voided_at,
  DROP COLUMN IF EXISTS settled_at,
  DROP COLUMN IF EXISTS submitted_for_settlement_at,
  DROP COLUMN IF EXISTS captured_at,
  DROP COLUMN IF EXISTS authorized_at,
  DROP COLUMN IF EXISTS initiated_at,
  DROP COLUMN IF EXISTS status_history,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS shift_id,
  DROP COLUMN IF EXISTS cash_session_id,
  DROP COLUMN IF EXISTS payment_method_id,
  DROP COLUMN IF EXISTS parent_payment_id,
  DROP COLUMN IF EXISTS transaction_type;

-- Drop enums
DROP TYPE IF EXISTS payment_transaction_type;
DROP TYPE IF EXISTS payment_status;
*/
