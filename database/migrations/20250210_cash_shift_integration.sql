/**
 * CASH & SHIFT INTEGRATION MIGRATION
 *
 * Adds missing links and tables for:
 * - Individual employee accountability (cash_sessions.employee_id)
 * - Shift coordination (cash_sessions.shift_id)
 * - Manager approval (cash_sessions.approved_by)
 * - Non-cash payment tracking (shift_payments table)
 * - Idempotency (operation_locks table)
 *
 * Based on: CASH_OPERATIONAL_FLOWS.md design
 * Date: 2025-02-10
 */

-- ============================================
-- EXTEND cash_sessions TABLE
-- ============================================

-- Add employee accountability
ALTER TABLE cash_sessions
  ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id),
  ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES operational_shifts(id),
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- Add indexes for new foreign keys
CREATE INDEX IF NOT EXISTS idx_cash_sessions_employee
  ON cash_sessions(employee_id);

CREATE INDEX IF NOT EXISTS idx_cash_sessions_shift
  ON cash_sessions(shift_id);

CREATE INDEX IF NOT EXISTS idx_cash_sessions_approved_by
  ON cash_sessions(approved_by);

-- Add comment for documentation
COMMENT ON COLUMN cash_sessions.employee_id IS
  'Employee responsible for this cash drawer (individual accountability)';

COMMENT ON COLUMN cash_sessions.shift_id IS
  'Operational shift this cash session belongs to (for shift-level aggregation)';

COMMENT ON COLUMN cash_sessions.approved_by IS
  'Manager who approved the cash session closure (segregation of duties)';

-- ============================================
-- CREATE shift_payments TABLE (Non-Cash Tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS shift_payments (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  shift_id UUID NOT NULL REFERENCES operational_shifts(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,

  -- Payment details
  payment_method TEXT NOT NULL CHECK (payment_method IN ('CARD', 'TRANSFER', 'QR', 'OTHER')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),

  -- Metadata
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reference TEXT,  -- External reference (transaction ID, etc.)
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_shift_payments_shift
  ON shift_payments(shift_id);

CREATE INDEX idx_shift_payments_employee
  ON shift_payments(employee_id);

CREATE INDEX idx_shift_payments_method
  ON shift_payments(payment_method);

CREATE INDEX idx_shift_payments_date
  ON shift_payments(payment_date DESC);

-- Comments
COMMENT ON TABLE shift_payments IS
  'Non-cash payments (CARD/TRANSFER/QR) tracked at shift level. Used for reporting and reconciliation.';

COMMENT ON COLUMN shift_payments.payment_method IS
  'Payment method: CARD (credit/debit), TRANSFER (bank transfer), QR (MercadoPago, etc.)';

-- ============================================
-- CREATE operation_locks TABLE (Idempotency)
-- ============================================

CREATE TABLE IF NOT EXISTS operation_locks (
  -- Primary key (client-generated UUID for idempotency)
  id TEXT PRIMARY KEY,

  -- Operation details
  operation_type TEXT NOT NULL,  -- 'close_cash_session', 'close_shift', etc.
  status TEXT NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'completed', 'failed')),

  -- Request tracking
  request_params JSONB NOT NULL,  -- Original request parameters
  result JSONB,                   -- Operation result (if completed)
  error_message TEXT,             -- Error message (if failed)

  -- User tracking
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

  -- Metadata
  ip_address INET,
  user_agent TEXT
);

-- Indexes
CREATE INDEX idx_operation_locks_status
  ON operation_locks(status);

CREATE INDEX idx_operation_locks_expires
  ON operation_locks(expires_at)
  WHERE status = 'processing';

CREATE INDEX idx_operation_locks_operation_type
  ON operation_locks(operation_type);

CREATE INDEX idx_operation_locks_user
  ON operation_locks(user_id);

-- Comments
COMMENT ON TABLE operation_locks IS
  'Idempotency locks to prevent duplicate operations. Client generates UUID and sends with request.';

COMMENT ON COLUMN operation_locks.id IS
  'Client-generated UUID. If operation is retried with same ID, returns cached result.';

COMMENT ON COLUMN operation_locks.expires_at IS
  'Lock expires after 24 hours. Cleanup job removes expired locks daily.';

-- ============================================
-- ADD TRIGGERS FOR updated_at
-- ============================================

-- Trigger for shift_payments
CREATE OR REPLACE FUNCTION update_shift_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_shift_payments_updated_at
  BEFORE UPDATE ON shift_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_shift_payments_updated_at();

-- ============================================
-- EXTEND operational_shifts TABLE (Optional)
-- ============================================

-- Add aggregated payment method totals (denormalized for performance)
ALTER TABLE operational_shifts
  ADD COLUMN IF NOT EXISTS cash_total NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS card_total NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transfer_total NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qr_total NUMERIC(12,2) DEFAULT 0;

COMMENT ON COLUMN operational_shifts.cash_total IS
  'Total cash sales across all cash sessions in this shift (denormalized)';

COMMENT ON COLUMN operational_shifts.card_total IS
  'Total card payments in this shift (denormalized from shift_payments)';

-- ============================================
-- DATA MIGRATION (OPTIONAL)
-- ============================================

-- Backfill shift_id for existing cash_sessions
-- Strategy: Link cash sessions to shifts by timestamp overlap
-- Only run if you have existing data

/*
WITH session_shift_matches AS (
  SELECT
    cs.id as session_id,
    os.id as shift_id
  FROM cash_sessions cs
  JOIN operational_shifts os
    ON cs.opened_at >= os.opened_at
    AND (os.closed_at IS NULL OR cs.opened_at <= os.closed_at)
    AND cs.location_id = os.location_id  -- Match by location
  WHERE cs.shift_id IS NULL  -- Only update unlinked sessions
)
UPDATE cash_sessions
SET shift_id = session_shift_matches.shift_id
FROM session_shift_matches
WHERE cash_sessions.id = session_shift_matches.session_id;
*/

-- ============================================
-- RLS POLICIES (Row-Level Security)
-- ============================================

-- shift_payments: Users can view payments from their shifts
ALTER TABLE shift_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shift payments from their business"
  ON shift_payments FOR SELECT
  USING (
    shift_id IN (
      SELECT id FROM operational_shifts
      WHERE business_id IN (
        SELECT business_id FROM business_users
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert shift payments"
  ON shift_payments FOR INSERT
  WITH CHECK (
    shift_id IN (
      SELECT id FROM operational_shifts
      WHERE business_id IN (
        SELECT business_id FROM business_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- operation_locks: Users can only access their own locks
ALTER TABLE operation_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own operation locks"
  ON operation_locks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create operation locks"
  ON operation_locks FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- CLEANUP FUNCTION FOR EXPIRED LOCKS
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_operation_locks()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM operation_locks
  WHERE status = 'processing'
    AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_operation_locks IS
  'Cleanup expired operation locks. Should be run daily via cron job or pg_cron.';

-- ============================================
-- VALIDATION & TESTING QUERIES
-- ============================================

-- Query to test the integration:
/*
-- 1. Get shift with all cash sessions and non-cash payments
SELECT
  os.id as shift_id,
  os.opened_at,
  os.status,
  -- Cash sessions
  (SELECT COUNT(*) FROM cash_sessions WHERE shift_id = os.id) as cash_sessions_count,
  (SELECT SUM(cash_sales) FROM cash_sessions WHERE shift_id = os.id) as total_cash,
  -- Non-cash payments
  (SELECT SUM(amount) FROM shift_payments WHERE shift_id = os.id AND payment_method = 'CARD') as total_card,
  (SELECT SUM(amount) FROM shift_payments WHERE shift_id = os.id AND payment_method = 'TRANSFER') as total_transfer,
  (SELECT SUM(amount) FROM shift_payments WHERE shift_id = os.id AND payment_method = 'QR') as total_qr
FROM operational_shifts os
WHERE os.status = 'active'
LIMIT 1;

-- 2. Get employee cash session accountability
SELECT
  e.id,
  e.name,
  cs.id as session_id,
  cs.starting_cash,
  cs.cash_sales,
  cs.expected_cash,
  cs.actual_cash,
  cs.variance,
  cs.approved_by
FROM employees e
JOIN cash_sessions cs ON cs.employee_id = e.id
WHERE cs.status = 'OPEN';
*/

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

/*
-- To rollback this migration:
DROP FUNCTION IF EXISTS cleanup_expired_operation_locks();
DROP FUNCTION IF EXISTS update_shift_payments_updated_at();
DROP TABLE IF EXISTS operation_locks CASCADE;
DROP TABLE IF EXISTS shift_payments CASCADE;

ALTER TABLE operational_shifts
  DROP COLUMN IF EXISTS cash_total,
  DROP COLUMN IF EXISTS card_total,
  DROP COLUMN IF EXISTS transfer_total,
  DROP COLUMN IF EXISTS qr_total;

ALTER TABLE cash_sessions
  DROP COLUMN IF EXISTS employee_id,
  DROP COLUMN IF EXISTS shift_id,
  DROP COLUMN IF EXISTS approved_by;
*/
