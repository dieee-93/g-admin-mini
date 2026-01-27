-- ============================================
-- MIGRATION: Create Payment Triggers
-- Date: 2025-12-29
-- Purpose: Maintain denormalized caches and enforce state machine
-- Based on: RESEARCH_PAYMENT_ARCHITECTURE_INDUSTRY_STANDARDS.md
-- Depends on: 20251229_improve_sale_payments_schema.sql
-- ============================================

-- ============================================
-- TRIGGER 1: Sync Cash Session Totals
-- ============================================

CREATE OR REPLACE FUNCTION sync_cash_session_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process CASH payments
  IF NEW.payment_type = 'CASH' AND NEW.cash_session_id IS NOT NULL THEN

    UPDATE public.cash_sessions
    SET
      -- Add to cash_sales if PAYMENT
      cash_sales = cash_sales + CASE
        WHEN NEW.transaction_type = 'PAYMENT' THEN NEW.amount
        ELSE 0
      END,
      -- Add to cash_refunds if REFUND/CHARGEBACK (amounts are negative)
      cash_refunds = cash_refunds + CASE
        WHEN NEW.transaction_type IN ('REFUND', 'CHARGEBACK') THEN NEW.amount
        ELSE 0
      END,
      updated_at = NOW()
    WHERE id = NEW.cash_session_id;

    -- Log if session not found (should never happen due to FK constraint)
    IF NOT FOUND THEN
      RAISE WARNING 'Cash session % not found for payment %', NEW.cash_session_id, NEW.id;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_cash_session
  AFTER INSERT ON public.sale_payments
  FOR EACH ROW
  EXECUTE FUNCTION sync_cash_session_totals();

COMMENT ON FUNCTION sync_cash_session_totals() IS
  'Maintains denormalized cash_sales and cash_refunds in cash_sessions table. ' ||
  'This is a CACHE for performance - sale_payments remains the source of truth. ' ||
  'Triggered on INSERT of sale_payments.';

-- ============================================
-- TRIGGER 2: Sync Shift Payment Totals
-- ============================================

CREATE OR REPLACE FUNCTION sync_shift_payment_totals()
RETURNS TRIGGER AS $$
DECLARE
  payment_amount NUMERIC(12,2);
BEGIN
  -- Skip if no shift_id
  IF NEW.shift_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Convert amount to NUMERIC(12,2) for shift totals
  payment_amount := NEW.amount::NUMERIC(12,2);

  -- Update shift totals by payment type
  UPDATE public.operational_shifts
  SET
    cash_total = cash_total + CASE
      WHEN NEW.payment_type = 'CASH' THEN payment_amount
      ELSE 0
    END,
    card_total = card_total + CASE
      WHEN NEW.payment_type = 'CARD' THEN payment_amount
      ELSE 0
    END,
    transfer_total = transfer_total + CASE
      WHEN NEW.payment_type = 'TRANSFER' THEN payment_amount
      ELSE 0
    END,
    qr_total = qr_total + CASE
      WHEN NEW.payment_type = 'QR' THEN payment_amount
      ELSE 0
    END,
    other_total = other_total + CASE
      WHEN NEW.payment_type NOT IN ('CASH', 'CARD', 'TRANSFER', 'QR') THEN payment_amount
      ELSE 0
    END,
    updated_at = NOW()
  WHERE id = NEW.shift_id;

  -- Log if shift not found (should never happen due to FK constraint when NOT NULL)
  IF NOT FOUND THEN
    RAISE WARNING 'Operational shift % not found for payment %', NEW.shift_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_shift_totals
  AFTER INSERT ON public.sale_payments
  FOR EACH ROW
  EXECUTE FUNCTION sync_shift_payment_totals();

COMMENT ON FUNCTION sync_shift_payment_totals() IS
  'Maintains denormalized payment totals by type in operational_shifts table. ' ||
  'This is a CACHE for quick shift reconciliation - sale_payments remains the source of truth. ' ||
  'Handles both PAYMENT (positive) and REFUND/CHARGEBACK (negative) amounts correctly. ' ||
  'Triggered on INSERT of sale_payments.';

-- ============================================
-- TRIGGER 3: Validate Payment Status Transitions
-- ============================================

CREATE OR REPLACE FUNCTION validate_payment_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  valid_transition BOOLEAN := FALSE;
  old_status TEXT;
  new_status TEXT;
BEGIN
  -- On INSERT, only allow INITIATED status
  IF TG_OP = 'INSERT' THEN
    IF NEW.status != 'INITIATED' THEN
      RAISE EXCEPTION 'New payments must have status INITIATED, got %', NEW.status;
    END IF;
    RETURN NEW;
  END IF;

  -- On UPDATE, validate transition
  old_status := OLD.status::TEXT;
  new_status := NEW.status::TEXT;

  -- If status didn't change, allow (UPDATE of other fields)
  IF old_status = new_status THEN
    RETURN NEW;
  END IF;

  -- Validate allowed transitions
  valid_transition := CASE
    -- From INITIATED
    WHEN old_status = 'INITIATED' AND new_status IN ('AUTHORIZED', 'SETTLED', 'FAILED') THEN TRUE

    -- From AUTHORIZED
    WHEN old_status = 'AUTHORIZED' AND new_status IN ('SUBMITTED_FOR_SETTLEMENT', 'SETTLED', 'VOIDED', 'FAILED') THEN TRUE

    -- From SUBMITTED_FOR_SETTLEMENT
    WHEN old_status = 'SUBMITTED_FOR_SETTLEMENT' AND new_status IN ('SETTLING', 'SETTLED', 'VOIDED') THEN TRUE

    -- From SETTLING
    WHEN old_status = 'SETTLING' AND new_status IN ('SETTLED', 'FAILED') THEN TRUE

    -- From SETTLED
    WHEN old_status = 'SETTLED' AND new_status IN ('REFUND_PENDING', 'CHARGEBACK_PENDING') THEN TRUE

    -- From REFUND_PENDING
    WHEN old_status = 'REFUND_PENDING' AND new_status = 'REFUNDED' THEN TRUE

    -- From CHARGEBACK_PENDING
    WHEN old_status = 'CHARGEBACK_PENDING' AND new_status IN ('CHARGEDBACK', 'SETTLED') THEN TRUE
    -- SETTLED here means chargeback reversed (merchant won)

    -- VOIDED, REFUNDED, CHARGEDBACK, FAILED are terminal states
    WHEN old_status IN ('VOIDED', 'REFUNDED', 'CHARGEDBACK', 'FAILED') THEN FALSE

    ELSE FALSE
  END;

  -- Raise exception if invalid transition
  IF NOT valid_transition THEN
    RAISE EXCEPTION 'Invalid payment status transition from % to % for payment %',
      old_status, new_status, NEW.id;
  END IF;

  -- Log transition in status_history (append-only audit trail)
  NEW.status_history := COALESCE(OLD.status_history, '[]'::jsonb) || jsonb_build_object(
    'from', old_status,
    'to', new_status,
    'timestamp', NOW(),
    'changed_by', current_user
  );

  -- Update corresponding timestamp field
  CASE new_status
    WHEN 'AUTHORIZED' THEN
      NEW.authorized_at := NOW();
    WHEN 'SUBMITTED_FOR_SETTLEMENT' THEN
      NEW.submitted_for_settlement_at := NOW();
    WHEN 'SETTLED' THEN
      NEW.settled_at := NOW();
    WHEN 'VOIDED' THEN
      NEW.voided_at := NOW();
    WHEN 'REFUNDED' THEN
      NEW.refunded_at := NOW();
    ELSE
      NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_payment_status_transitions
  BEFORE INSERT OR UPDATE OF status ON public.sale_payments
  FOR EACH ROW
  EXECUTE FUNCTION validate_payment_status_transition();

COMMENT ON FUNCTION validate_payment_status_transition() IS
  'Enforces valid state machine transitions for payment status. ' ||
  'Prevents invalid transitions (e.g., SETTLED → INITIATED). ' ||
  'Maintains immutable audit trail in status_history. ' ||
  'Updates corresponding timestamp fields automatically.';

-- ============================================
-- TRIGGER 4: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sale_payments_updated_at
  BEFORE UPDATE ON public.sale_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON FUNCTION update_updated_at_column() IS
  'Automatically updates updated_at timestamp on any UPDATE to sale_payments.';

-- ============================================
-- TRIGGER 5: Validate Refund Amount
-- ============================================

CREATE OR REPLACE FUNCTION validate_refund_amount()
RETURNS TRIGGER AS $$
DECLARE
  original_payment RECORD;
  total_refunded NUMERIC(15,4);
  max_refundable NUMERIC(15,4);
BEGIN
  -- Only validate for REFUND transactions
  IF NEW.transaction_type != 'REFUND' THEN
    RETURN NEW;
  END IF;

  -- Must have parent_payment_id
  IF NEW.parent_payment_id IS NULL THEN
    RAISE EXCEPTION 'REFUND transactions must have parent_payment_id';
  END IF;

  -- Get original payment
  SELECT * INTO original_payment
  FROM public.sale_payments
  WHERE id = NEW.parent_payment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Parent payment % not found', NEW.parent_payment_id;
  END IF;

  -- Original must be a PAYMENT, not another REFUND
  IF original_payment.transaction_type != 'PAYMENT' THEN
    RAISE EXCEPTION 'Cannot refund a % transaction', original_payment.transaction_type;
  END IF;

  -- Original must be SETTLED
  IF original_payment.status != 'SETTLED' THEN
    RAISE EXCEPTION 'Can only refund SETTLED payments. Use VOID for unsettled payments. Parent status: %',
      original_payment.status;
  END IF;

  -- Calculate total already refunded
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO total_refunded
  FROM public.sale_payments
  WHERE parent_payment_id = NEW.parent_payment_id
    AND transaction_type = 'REFUND'
    AND id != NEW.id; -- Exclude current refund if UPDATE

  -- Calculate max refundable
  max_refundable := original_payment.amount - total_refunded;

  -- Validate refund amount doesn't exceed max
  IF ABS(NEW.amount) > max_refundable THEN
    RAISE EXCEPTION 'Refund amount % exceeds maximum refundable %. Already refunded: %',
      ABS(NEW.amount), max_refundable, total_refunded;
  END IF;

  -- Refund must be same payment_type as original
  IF NEW.payment_type != original_payment.payment_type THEN
    RAISE EXCEPTION 'Refund payment_type (%) must match original (%)',
      NEW.payment_type, original_payment.payment_type;
  END IF;

  -- Refund must be in same sale
  IF NEW.sale_id != original_payment.sale_id THEN
    RAISE EXCEPTION 'Refund sale_id must match original payment sale_id';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_refund_validation
  BEFORE INSERT OR UPDATE ON public.sale_payments
  FOR EACH ROW
  WHEN (NEW.transaction_type = 'REFUND')
  EXECUTE FUNCTION validate_refund_amount();

COMMENT ON FUNCTION validate_refund_amount() IS
  'Validates REFUND transactions: ' ||
  '1. Must have parent_payment_id ' ||
  '2. Parent must be PAYMENT and SETTLED ' ||
  '3. Refund amount cannot exceed remaining refundable amount ' ||
  '4. Payment type must match original ' ||
  '5. Must be same sale_id';

-- ============================================
-- TRIGGER 6: Set CASH Payments to SETTLED Immediately
-- ============================================

CREATE OR REPLACE FUNCTION auto_settle_cash_payments()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for CASH PAYMENT transactions
  IF NEW.payment_type = 'CASH' AND NEW.transaction_type = 'PAYMENT' THEN
    -- CASH payments are immediately settled (no external authorization needed)
    NEW.status := 'SETTLED';
    NEW.settled_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_settle_cash
  BEFORE INSERT ON public.sale_payments
  FOR EACH ROW
  WHEN (NEW.payment_type = 'CASH' AND NEW.transaction_type = 'PAYMENT')
  EXECUTE FUNCTION auto_settle_cash_payments();

COMMENT ON FUNCTION auto_settle_cash_payments() IS
  'Automatically sets CASH PAYMENT transactions to SETTLED status on INSERT. ' ||
  'CASH does not require external authorization/capture like CARD/QR/TRANSFER.';

-- ============================================
-- FUNCTION: Recalculate Denormalized Caches
-- ============================================

-- Utility function to recalculate all caches from source of truth
-- Use this for validation or after data corruption
CREATE OR REPLACE FUNCTION recalculate_payment_caches()
RETURNS TABLE(
  cash_sessions_updated INT,
  shifts_updated INT
) AS $$
DECLARE
  cash_sessions_count INT := 0;
  shifts_count INT := 0;
BEGIN
  -- Recalculate cash_sessions totals
  UPDATE public.cash_sessions cs
  SET
    cash_sales = COALESCE((
      SELECT SUM(amount)
      FROM public.sale_payments
      WHERE cash_session_id = cs.id
        AND payment_type = 'CASH'
        AND transaction_type = 'PAYMENT'
    ), 0),
    cash_refunds = COALESCE((
      SELECT SUM(amount)
      FROM public.sale_payments
      WHERE cash_session_id = cs.id
        AND payment_type = 'CASH'
        AND transaction_type IN ('REFUND', 'CHARGEBACK')
    ), 0),
    updated_at = NOW();

  GET DIAGNOSTICS cash_sessions_count = ROW_COUNT;

  -- Recalculate operational_shifts totals
  UPDATE public.operational_shifts os
  SET
    cash_total = COALESCE((
      SELECT SUM(amount)::NUMERIC(12,2)
      FROM public.sale_payments
      WHERE shift_id = os.id AND payment_type = 'CASH'
    ), 0),
    card_total = COALESCE((
      SELECT SUM(amount)::NUMERIC(12,2)
      FROM public.sale_payments
      WHERE shift_id = os.id AND payment_type = 'CARD'
    ), 0),
    transfer_total = COALESCE((
      SELECT SUM(amount)::NUMERIC(12,2)
      FROM public.sale_payments
      WHERE shift_id = os.id AND payment_type = 'TRANSFER'
    ), 0),
    qr_total = COALESCE((
      SELECT SUM(amount)::NUMERIC(12,2)
      FROM public.sale_payments
      WHERE shift_id = os.id AND payment_type = 'QR'
    ), 0),
    other_total = COALESCE((
      SELECT SUM(amount)::NUMERIC(12,2)
      FROM public.sale_payments
      WHERE shift_id = os.id AND payment_type NOT IN ('CASH', 'CARD', 'TRANSFER', 'QR')
    ), 0),
    updated_at = NOW();

  GET DIAGNOSTICS shifts_count = ROW_COUNT;

  -- Return counts
  cash_sessions_updated := cash_sessions_count;
  shifts_updated := shifts_count;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION recalculate_payment_caches() IS
  'Recalculates all denormalized payment caches from sale_payments (source of truth). ' ||
  'Use for validation or recovery after data corruption. ' ||
  'Returns number of cash_sessions and shifts updated. ' ||
  'Usage: SELECT * FROM recalculate_payment_caches();';

-- ============================================
-- FUNCTION: Validate Cache Consistency
-- ============================================

-- Function to check if caches match source of truth
CREATE OR REPLACE FUNCTION validate_payment_cache_consistency()
RETURNS TABLE(
  entity_type TEXT,
  entity_id UUID,
  field_name TEXT,
  cache_value NUMERIC,
  actual_value NUMERIC,
  difference NUMERIC
) AS $$
BEGIN
  -- Check cash_sessions.cash_sales
  RETURN QUERY
  SELECT
    'cash_session'::TEXT,
    cs.id,
    'cash_sales'::TEXT,
    cs.cash_sales,
    COALESCE(SUM(sp.amount), 0),
    cs.cash_sales - COALESCE(SUM(sp.amount), 0)
  FROM public.cash_sessions cs
  LEFT JOIN public.sale_payments sp ON sp.cash_session_id = cs.id
    AND sp.payment_type = 'CASH'
    AND sp.transaction_type = 'PAYMENT'
  GROUP BY cs.id, cs.cash_sales
  HAVING cs.cash_sales != COALESCE(SUM(sp.amount), 0);

  -- Check cash_sessions.cash_refunds
  RETURN QUERY
  SELECT
    'cash_session'::TEXT,
    cs.id,
    'cash_refunds'::TEXT,
    cs.cash_refunds,
    COALESCE(SUM(sp.amount), 0),
    cs.cash_refunds - COALESCE(SUM(sp.amount), 0)
  FROM public.cash_sessions cs
  LEFT JOIN public.sale_payments sp ON sp.cash_session_id = cs.id
    AND sp.payment_type = 'CASH'
    AND sp.transaction_type IN ('REFUND', 'CHARGEBACK')
  GROUP BY cs.id, cs.cash_refunds
  HAVING cs.cash_refunds != COALESCE(SUM(sp.amount), 0);

  -- Check operational_shifts.cash_total
  RETURN QUERY
  SELECT
    'shift'::TEXT,
    os.id,
    'cash_total'::TEXT,
    os.cash_total::NUMERIC,
    COALESCE(SUM(sp.amount)::NUMERIC(12,2), 0)::NUMERIC,
    (os.cash_total - COALESCE(SUM(sp.amount)::NUMERIC(12,2), 0))::NUMERIC
  FROM public.operational_shifts os
  LEFT JOIN public.sale_payments sp ON sp.shift_id = os.id AND sp.payment_type = 'CASH'
  GROUP BY os.id, os.cash_total
  HAVING os.cash_total != COALESCE(SUM(sp.amount)::NUMERIC(12,2), 0);

  -- Check operational_shifts.card_total
  RETURN QUERY
  SELECT
    'shift'::TEXT,
    os.id,
    'card_total'::TEXT,
    os.card_total::NUMERIC,
    COALESCE(SUM(sp.amount)::NUMERIC(12,2), 0)::NUMERIC,
    (os.card_total - COALESCE(SUM(sp.amount)::NUMERIC(12,2), 0))::NUMERIC
  FROM public.operational_shifts os
  LEFT JOIN public.sale_payments sp ON sp.shift_id = os.id AND sp.payment_type = 'CARD'
  GROUP BY os.id, os.card_total
  HAVING os.card_total != COALESCE(SUM(sp.amount)::NUMERIC(12,2), 0);

  -- Add more checks for transfer_total, qr_total, other_total as needed...
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_payment_cache_consistency() IS
  'Validates that denormalized caches match source of truth (sale_payments). ' ||
  'Returns rows only where there are discrepancies. ' ||
  'Empty result = all caches are consistent. ' ||
  'Usage: SELECT * FROM validate_payment_cache_consistency();';

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================

/*
-- To rollback triggers:

DROP FUNCTION IF EXISTS validate_payment_cache_consistency() CASCADE;
DROP FUNCTION IF EXISTS recalculate_payment_caches() CASCADE;
DROP FUNCTION IF EXISTS auto_settle_cash_payments() CASCADE;
DROP FUNCTION IF EXISTS validate_refund_amount() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS validate_payment_status_transition() CASCADE;
DROP FUNCTION IF EXISTS sync_shift_payment_totals() CASCADE;
DROP FUNCTION IF EXISTS sync_cash_session_totals() CASCADE;
*/
